'use client';
import {
  ProductCategoryV2Response,
  ProductFacetV2Response,
  ProductListV2Response,
  ProductSingleV2Response,
} from '../types';
import { requestJson } from './httpClient';

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  subcategory?: string;
  featured?: boolean;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  minPrice?: number;
  maxPrice?: number;
}

const toSearchParams = (params: object): string => {
  const searchParams = new URLSearchParams();
  Object.entries(params as Record<string, unknown>).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  return searchParams.toString();
};

export const productApiV2 = {
  async getAllProducts(params: ProductQueryParams = {}): Promise<ProductListV2Response> {
    const query = toSearchParams(params);
    return requestJson<ProductListV2Response>(`/products-v2${query ? `?${query}` : ''}`);
  },

  async getProductById(id: string): Promise<ProductSingleV2Response> {
    return requestJson<ProductSingleV2Response>(`/products-v2/${id}`);
  },

  async getProductsByCategory(
    category: string,
    params: Omit<ProductQueryParams, 'category' | 'search' | 'featured'> = {}
  ): Promise<ProductCategoryV2Response> {
    const query = toSearchParams(params);
    return requestJson<ProductCategoryV2Response>(`/products-v2/category/${category}${query ? `?${query}` : ''}`);
  },

  async getFeaturedProducts(limit = 10): Promise<ProductListV2Response> {
    return requestJson<ProductListV2Response>(`/products-v2/featured?limit=${limit}`);
  },

  async searchProducts(query: string, params: Omit<ProductQueryParams, 'search'> = {}): Promise<ProductListV2Response> {
    const queryParams = toSearchParams({ ...params, q: query });
    return requestJson<ProductListV2Response>(`/products-v2/search?${queryParams}`);
  },

  async getFacets(): Promise<ProductFacetV2Response> {
    return requestJson<ProductFacetV2Response>('/products-v2/categories');
  },

  async trackAddToCart(productId: string): Promise<{ success: boolean; message: string }> {
    return requestJson<{ success: boolean; message: string }>('/products/track/add-to-cart', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
  },
};
