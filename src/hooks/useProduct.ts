import { useState, useEffect } from 'react';
import { getProductBySlug } from '../services/api';
import type { ApiProduct } from '../types';

interface UseProductResult {
  product: ApiProduct | null;
  loading: boolean;
  error: string | null;
  retry: () => void;
}

export const useProduct = (slug: string): UseProductResult => {
  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getProductBySlug(slug);
      setProduct(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [slug]);

  return {
    product,
    loading,
    error,
    retry: fetchProduct,
  };
};
