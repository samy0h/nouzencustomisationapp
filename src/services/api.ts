import type { ApiProductsResponse, ApiProductResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

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
};

export { ApiError };
export const getProductBySlug = async (slug: string) => {
  const response = await api.getProductBySlug(slug);
  return response.data.product;
};
