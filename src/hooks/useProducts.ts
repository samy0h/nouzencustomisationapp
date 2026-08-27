import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { transformApiProducts } from '../utils/transformers';
import type { Product } from '../types';

interface UseProductsResult {
  products: Product[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useProducts(): UseProductsResult {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.getProducts({
          active: true,
          limit: 100,
        });

        const transformedProducts = transformApiProducts(response.data.products);
        setProducts(transformedProducts);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load products';
        setError(errorMessage);
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [refetchTrigger]);

  const refetch = () => {
    setRefetchTrigger((prev) => prev + 1);
  };

  return { products, loading, error, refetch };
}
