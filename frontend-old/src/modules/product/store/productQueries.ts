import { legacyCompatibleProductApi } from '../api/legacyCompatibleApi';
import {
  LegacyCategory,
  LegacyCategoryResponse,
  LegacyProduct,
  LegacyProductResponse,
  LegacySingleProductResponse,
} from '../types';

export type ProductListQuery = Parameters<typeof legacyCompatibleProductApi.getAllProducts>[0];

export const fetchProductList = async (query: ProductListQuery = {}): Promise<LegacyProductResponse> =>
  legacyCompatibleProductApi.getAllProducts(query);

export const fetchProductById = async (id: string): Promise<LegacySingleProductResponse> =>
  legacyCompatibleProductApi.getProductById(id);

export const fetchCategoryProducts = async (
  category: string,
  query: Omit<ProductListQuery, 'category' | 'search' | 'featured'> = {}
): Promise<LegacyCategoryResponse> => legacyCompatibleProductApi.getProductsByCategory(category, query);

export const fetchFeaturedProducts = async (limit = 10): Promise<LegacyProductResponse> =>
  legacyCompatibleProductApi.getFeaturedProducts(limit);

export const fetchSearchedProducts = async (
  search: string,
  query: Omit<ProductListQuery, 'search'> = {}
): Promise<LegacyProductResponse> => legacyCompatibleProductApi.searchProducts(search, query);

export const fetchCategories = async (): Promise<{ success: boolean; data: LegacyCategory[] }> =>
  legacyCompatibleProductApi.getCategories();

export const trackAddToCart = async (productId: string): Promise<{ success: boolean; message: string }> =>
  legacyCompatibleProductApi.trackAddToCart(productId);

export const normalizeProductList = (response: LegacyProductResponse): LegacyProduct[] =>
  response.success && Array.isArray(response.data) ? response.data : [];
