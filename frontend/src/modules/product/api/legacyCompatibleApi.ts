import {
  LegacyCategory,
  LegacyCategoryResponse,
  LegacyProductResponse,
  LegacySingleProductResponse,
} from '../types';
import { mapFacetCategoriesToLegacy, toLegacyCategoryResponse, toLegacyListResponse, toLegacySingleResponse } from '../adapters/v2ToLegacyAdapter';
import { productApiV2, ProductQueryParams } from './productApiV2';

export const legacyCompatibleProductApi = {
  async getAllProducts(params: ProductQueryParams = {}): Promise<LegacyProductResponse> {
    const v2 = await productApiV2.getAllProducts(params);
    return toLegacyListResponse(v2);
  },

  async getProductById(id: string): Promise<LegacySingleProductResponse> {
    const v2 = await productApiV2.getProductById(id);
    return toLegacySingleResponse(v2);
  },

  async getProductsByCategory(
    category: string,
    params: Omit<ProductQueryParams, 'category' | 'search' | 'featured'> = {}
  ): Promise<LegacyCategoryResponse> {
    const v2 = await productApiV2.getProductsByCategory(category, params);
    return toLegacyCategoryResponse(v2);
  },

  async getFeaturedProducts(limit = 10): Promise<LegacyProductResponse> {
    const v2 = await productApiV2.getFeaturedProducts(limit);
    return toLegacyListResponse(v2);
  },

  async searchProducts(
    query: string,
    params: Omit<ProductQueryParams, 'search'> = {}
  ): Promise<LegacyProductResponse> {
    const v2 = await productApiV2.searchProducts(query, params);
    return toLegacyListResponse(v2);
  },

  async getCategories(): Promise<{ success: boolean; data: LegacyCategory[] }> {
    const v2 = await productApiV2.getFacets();
    return {
      success: v2.success,
      data: mapFacetCategoriesToLegacy(v2.data),
    };
  },

  async trackAddToCart(productId: string): Promise<{ success: boolean; message: string }> {
    return productApiV2.trackAddToCart(productId);
  },
};
