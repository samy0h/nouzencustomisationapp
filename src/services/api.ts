import type {
  ApiOrder,
  ApiOrderResponse,
  ApiOrdersResponse,
  ApiProduct,
  ApiProductsResponse,
  ApiProductResponse,
  CartItem,
  CheckoutCustomer,
  DashboardStats,
  OrderStatus,
  AdminProductImage,
  PrintAreaConfig,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
export const apiBaseUrl = API_BASE_URL;

class ApiError extends Error {
  statusCode?: number;
  originalError?: unknown;

  constructor(
    message: string,
    statusCode?: number,
    originalError?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.originalError = originalError;
  }
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // Network or other errors
    throw new ApiError(
      'Unable to connect to the server. Please check your connection.',
      undefined,
      error
    );
  }
}

export const api = {
  /**
   * Get all products with optional filters
   */
  getProducts: async (params?: {
    category?: string;
    featured?: boolean;
    active?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<ApiProductsResponse> => {
    const queryParams = new URLSearchParams();

    if (params?.category) queryParams.append('category', params.category);
    if (params?.featured !== undefined) queryParams.append('featured', String(params.featured));
    if (params?.active !== undefined) queryParams.append('active', String(params.active));
    if (params?.limit) queryParams.append('limit', String(params.limit));
    if (params?.offset) queryParams.append('offset', String(params.offset));

    const queryString = queryParams.toString();
    const endpoint = `/api/products${queryString ? `?${queryString}` : ''}`;

    return fetchApi<ApiProductsResponse>(endpoint);
  },

  /**
   * Get a single product by slug
   */
  getProductBySlug: async (slug: string): Promise<ApiProductResponse> => {
    return fetchApi<ApiProductResponse>(`/api/products/${slug}`);
  },

  /**
   * Health check endpoint
   */
  healthCheck: async (): Promise<{ status: string; message: string; timestamp: string }> => {
    return fetchApi('/api/health');
  },

  getAdminProduct: async (id: string) => fetchApi<{ status: string; data: { product: ApiProductResponse['data']['product'] & { productImages: AdminProductImage[]; printAreas: PrintAreaConfig[] } } }>(`/api/products/admin/${id}`),

  saveAdminProductDesign: async (id: string, payload: { images: unknown[]; printAreas: PrintAreaConfig[] }) => fetchApi<{ status: string; message: string }>(`/api/products/admin/${id}/design`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }),

  addAdminProductVariantColor: async (id: string, payload: { color: string; colorHex: string; sizes: string[] }) => fetchApi(`/api/products/admin/${id}/variants/color`, {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  deleteAdminProductImage: async (imageId: string) => fetchApi<{ status: string; message: string }>(`/api/products/admin/images/${imageId}`, {
    method: 'DELETE',
  }),

  deleteAdminProductColor: async (id: string, color: string) => fetchApi<{ status: string; message: string }>(`/api/products/admin/${id}/variants/color/${encodeURIComponent(color)}`, {
    method: 'DELETE',
  }),

  createAdminProduct: async (payload: unknown) => fetchApi<{ status: string; data: { product: ApiProduct } }>('/api/products/admin', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  updateAdminProduct: async (id: string, payload: unknown) => fetchApi<{ status: string; data: { product: ApiProduct } }>(`/api/products/admin/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  }),

  deleteAdminProduct: async (id: string) => fetchApi<{ status: string; message: string }>(`/api/products/admin/${id}`, {
    method: 'DELETE',
  }),

  createOrder: async (payload: { customer: CheckoutCustomer; items: CartItem[] }): Promise<ApiOrderResponse> => fetchApi('/api/orders', {
    method: 'POST',
    body: JSON.stringify({
      customer: payload.customer,
      items: payload.items.map(item => ({
        clientItemId: item.id,
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        color: item.color,
        size: item.size,
        fit: item.fit,
        customizationData: item.customizationData,
        mockupFrontDataUrl: item.mockupFrontDataUrl,
        mockupBackDataUrl: item.mockupBackDataUrl,
        designFrontDataUrl: item.designFrontDataUrl,
        designBackDataUrl: item.designBackDataUrl,
      })),
    }),
  }),

  getOrders: async (params?: {
    search?: string;
    status?: OrderStatus | '';
    wilaya?: string;
    dateFrom?: string;
    dateTo?: string;
    sort?: 'newest' | 'oldest' | 'total';
    limit?: number;
    offset?: number;
  }): Promise<ApiOrdersResponse> => {
    const queryParams = new URLSearchParams();

    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.wilaya) queryParams.append('wilaya', params.wilaya);
    if (params?.dateFrom) queryParams.append('dateFrom', params.dateFrom);
    if (params?.dateTo) queryParams.append('dateTo', params.dateTo);
    if (params?.sort) queryParams.append('sort', params.sort);
    if (params?.limit) queryParams.append('limit', String(params.limit));
    if (params?.offset) queryParams.append('offset', String(params.offset));

    const queryString = queryParams.toString();
    return fetchApi<ApiOrdersResponse>(`/api/orders${queryString ? `?${queryString}` : ''}`);
  },

  getOrder: async (id: string): Promise<ApiOrderResponse> => fetchApi(`/api/orders/${id}`),

  updateOrder: async (id: string, payload: unknown): Promise<ApiOrderResponse> => fetchApi(`/api/orders/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  }),

  updateOrderStatus: async (id: string, payload: { status: OrderStatus; cancellationReason?: string }): Promise<ApiOrderResponse> => fetchApi(`/api/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  }),

  getDashboardStats: async (): Promise<{ status: string; data: DashboardStats }> => fetchApi('/api/orders/admin/dashboard/stats'),

  deleteOrder: async (id: string): Promise<{ status: string; message: string }> => fetchApi(`/api/orders/${id}`, {
    method: 'DELETE',
  }),

  deleteOrderItem: async (orderId: string, itemId: string): Promise<{ status: string; data: { order: ApiOrder } }> => fetchApi(`/api/orders/${orderId}/items/${itemId}`, {
    method: 'DELETE',
  }),
};

export { ApiError };
export const getProductBySlug = async (slug: string) => {
  const response = await api.getProductBySlug(slug);
  return response.data.product;
};
