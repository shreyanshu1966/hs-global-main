import {
  LegacyCategory,
  LegacyCategoryResponse,
  LegacyProduct,
  LegacyProductResponse,
  LegacySingleProductResponse,
  ProductCategoryV2Response,
  ProductListV2Response,
  ProductSingleV2Response,
  ProductV2,
} from '../types';

export const toLegacyProduct = (product: ProductV2): LegacyProduct => ({
  _id: product.id,
  productId: product.productId,
  name: product.name,
  category: product.taxonomy.category,
  subcategory: product.taxonomy.subcategory,
  description: product.description,
  image: product.media.primaryImage || '',
  images: product.media.galleryImages,
  sortedImages: product.media.sortedImages,
  priceUSD: product.pricing.basePriceUSD || undefined,
  available: product.availability.available,
  discount: {
    enabled: product.pricing.discount.enabled,
    percentage: product.pricing.discount.percentage,
    startDate: product.pricing.discount.startDate,
    endDate: product.pricing.discount.endDate,
    description: product.pricing.discount.description,
  },
  hasVideo: product.media.video.hasVideo,
  videoUrl: product.media.video.url,
  videoFilename: product.media.video.filename,
  videoSize: product.media.video.size,
  videoUploadedAt: product.media.video.uploadedAt,
  furnitureSpecs: product.specs.furniture || undefined,
  slabSpecs: product.specs.slab || undefined,
  status: product.status,
  featured: product.featured,
  tags: product.taxonomy.tags,
  viewCount: product.analytics.viewCount,
  addToCartCount: product.analytics.addToCartCount,
  averageRating: product.analytics.averageRating,
  totalReviews: product.analytics.totalReviews,
  seoTitle: product.seo.seoTitle || undefined,
  seoDescription: product.seo.seoDescription || undefined,
  seoKeywords: product.seo.seoKeywords,
  seo: product.seo.enhanced as LegacyProduct['seo'],
  productCode: (product as any).productCode || '',
  subDescription: (product as any).subDescription || '',
  createdAt: product.createdAt,
  updatedAt: product.updatedAt,
});

export const toLegacyListResponse = (response: ProductListV2Response): LegacyProductResponse => ({
  success: response.success,
  data: response.data.map(toLegacyProduct),
  pagination: response.pagination,
});

export const toLegacySingleResponse = (response: ProductSingleV2Response): LegacySingleProductResponse => ({
  success: response.success,
  data: {
    product: toLegacyProduct(response.data.product),
    relatedProducts: response.data.relatedProducts.map(toLegacyProduct),
    similarProducts: (response.data.similarProducts || []).map(toLegacyProduct),
  },
});

export const toLegacyCategoryResponse = (response: ProductCategoryV2Response): LegacyCategoryResponse => ({
  success: response.success,
  data: {
    products: response.data.products.map(toLegacyProduct),
    subcategories: response.data.subcategories,
    category: response.data.category,
  },
  pagination: response.pagination,
});

export const mapFacetCategoriesToLegacy = (
  facets: { categories: Array<{ category: string; subcategories: string[]; count: number }> }
): LegacyCategory[] => facets.categories.map((item) => ({
  category: item.category,
  subcategories: item.subcategories,
  count: item.count,
}));
