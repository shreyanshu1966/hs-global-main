export interface ProductPricingV2 {
  currency: 'INR';
  basePriceINR: number;
  effectivePriceINR: number;
  discountStatus: 'none' | 'scheduled' | 'active' | 'expired';
  discount: {
    enabled: boolean;
    percentage: number;
    startDate: string | null;
    endDate: string | null;
    description: string;
  };
}

export interface ProductMediaV2 {
  primaryImage: string | null;
  galleryImages: string[];
  sortedImages: string[];
  video: {
    hasVideo: boolean;
    url: string | null;
    filename: string | null;
    size: number | null;
    uploadedAt: string | null;
  };
}

export interface ProductTaxonomyV2 {
  category: string;
  subcategory: string;
  tags: string[];
}

export interface ProductV2 {
  id: string;
  productId: string;
  slug: string;
  name: string;
  description: string;
  status: string;
  featured: boolean;
  availability: {
    available: boolean;
    inStock: boolean;
  };
  taxonomy: ProductTaxonomyV2;
  pricing: ProductPricingV2;
  media: ProductMediaV2;
  specs: {
    furniture: Record<string, string> | null;
    slab: Record<string, string> | null;
    custom: Array<Record<string, unknown>>;
  };
  seo: {
    seoTitle: string | null;
    seoDescription: string | null;
    seoKeywords: string[];
    enhanced: Record<string, unknown>;
  };
  analytics: {
    viewCount: number;
    addToCartCount: number;
    averageRating: number;
    totalReviews: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface V2Pagination {
  current: number;
  total: number;
  count: number;
  totalItems: number;
}

export interface ProductListV2Response {
  success: boolean;
  schemaVersion: 'v2';
  data: ProductV2[];
  pagination?: V2Pagination;
}

export interface ProductSingleV2Response {
  success: boolean;
  schemaVersion: 'v2';
  data: {
    product: ProductV2;
    relatedProducts: ProductV2[];
    similarProducts: ProductV2[];
  };
}

export interface ProductCategoryV2Response {
  success: boolean;
  schemaVersion: 'v2';
  data: {
    products: ProductV2[];
    subcategories: string[];
    category: string;
  };
  pagination?: V2Pagination;
}

export interface ProductFacetV2Response {
  success: boolean;
  schemaVersion: 'v2';
  data: {
    categories: Array<{
      category: string;
      subcategories: string[];
      count: number;
    }>;
    tags: string[];
  };
}
