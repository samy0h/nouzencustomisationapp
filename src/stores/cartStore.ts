import { useSyncExternalStore } from 'react';
import type { CartItem } from '../types';

const DB_NAME = 'nouzen-cart-db';
const STORE_NAME = 'cart';
const ITEMS_KEY = 'items-v1';
const LEGACY_STORAGE_KEY = 'nouzen-cart-v1';

const isValidUuid = (value: unknown): value is string => {
  return typeof value === 'string' && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(value);
};

const sanitizeCartItems = (items: CartItem[]): CartItem[] => {
  return items.filter(item => {
    if (!isValidUuid(item.productId)) return false;
    if (!isValidUuid(item.variantId)) return false;
    if (typeof item.unitPrice !== 'number' || item.unitPrice < 0) return false;
    if (!Number.isInteger(item.quantity) || item.quantity < 1) return false;
    if (!item.productName?.trim()) return false;
    if (!item.color?.trim()) return false;
    if (!item.size?.trim()) return false;
    return true;
  }).map(item => ({
    ...item,
    mockupFrontDataUrl: item.mockupFrontDataUrl || null,
    mockupBackDataUrl: item.mockupBackDataUrl || null,
    designFrontDataUrl: item.designFrontDataUrl || null,
    designBackDataUrl: item.designBackDataUrl || null,
  }));
};

let dbPromise: Promise<IDBDatabase> | null = null;

const openDb = (): Promise<IDBDatabase> => {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains(STORE_NAME)) {
          request.result.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  return dbPromise;
};

const idbGet = async (): Promise<CartItem[]> => {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const request = tx.objectStore(STORE_NAME).get(ITEMS_KEY);
    request.onsuccess = () => resolve((request.result as CartItem[] | undefined) ?? []);
    request.onerror = () => reject(request.error);
  });
};

const idbSet = async (items: CartItem[]): Promise<void> => {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(items, ITEMS_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

const migrateLegacyLocalStorage = (): CartItem[] | null => {
  try {
    const value = window.localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!value) return null;
    window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    return sanitizeCartItems(JSON.parse(value) as CartItem[]);
  } catch {
    return null;
  }
};

let itemsSnapshot: CartItem[] = [];
const serverSnapshot: CartItem[] = [];
const listeners = new Set<() => void>();

const notify = () => {
  listeners.forEach(listener => listener());
};

if (typeof window !== 'undefined') {
  idbGet()
    .then(async stored => {
      const legacy = migrateLegacyLocalStorage();
      const initial = legacy && legacy.length ? legacy : sanitizeCartItems(stored);
      itemsSnapshot = initial;
      if (legacy && legacy.length) {
        await idbSet(initial).catch(() => {});
      }
      notify();
    })
    .catch(() => {
      itemsSnapshot = [];
      notify();
    });
}

const persist = (items: CartItem[]): boolean => {
  itemsSnapshot = items;
  notify();
  idbSet(items).catch(() => {
    // Persistence failure is non-fatal: the in-memory cart still works for this session.
  });
  return true;
};

const subscribe = (onStoreChange: () => void) => {
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
  };
};

export const cartStore = {
  getItems: () => itemsSnapshot,
  addItem: (item: CartItem): boolean => persist([...itemsSnapshot, item]),
  removeItem: (id: string) => persist(itemsSnapshot.filter(item => item.id !== id)),
  updateQuantity: (id: string, quantity: number) => persist(
    itemsSnapshot.map(item => item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item)
  ),
  clear: () => persist([]),
};

export const useCart = () => {
  const items = useSyncExternalStore(subscribe, () => itemsSnapshot, () => serverSnapshot);
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    items,
    subtotal,
    itemCount,
    deliveryCost: items.length ? 500 : 0,
    total: subtotal + (items.length ? 500 : 0),
    addItem: cartStore.addItem,
    removeItem: cartStore.removeItem,
    updateQuantity: cartStore.updateQuantity,
    clear: cartStore.clear,
  };
};
