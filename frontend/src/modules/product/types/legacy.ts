export interface LegacyProduct {
  _id: string;
  productId: string;
  name: string;
  category: string;
  subcategory: string;
  description: string;
  image: string;
  images: string[];
  sortedImages?: string[];
  priceUSD?: number;
  available: boolean;
  discount?: {
    enabled: boolean;
    percentage: number;
    startDate?: string | null;
    endDate?: string | null;
    description?: string;
  };
  hasVideo: boolean;
  videoUrl?: string | null;
  videoFilename?: string | null;
  videoSize?: number | null;
  videoUploadedAt?: string | null;
  furnitureSpecs?: {
    type?: string;
    shape?: string;
    material?: string;
    size?: string;
    surfaceFinish?: string;
    colorName?: string;
    height?: string;
    location?: string;
    packagingDetails?: string;
  };
  slabSpecs?: {
    finish?: string;
    thickness?: string;
    origin?: string;
    material?: string;
    application?: string;
  };
  status: string;
  featured: boolean;
  tags: string[];
  viewCount: number;
  addToCartCount: number;
  averageRating?: number;
  totalReviews?: number;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
    h1Tag?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    twitterTitle?: string;
    twitterDescription?: string;
    twitterImage?: string;
    canonicalUrl?: string;
    slug?: string;
  };
  productCode?: string;
  subDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LegacyCategory {
  category: string;
  subcategories: string[];
  count: number;
}

export interface LegacyProductResponse {
  success: boolean;
  data: LegacyProduct[] | LegacyProduct;
  pagination?: {
    current: number;
    total: number;
    count: number;
    totalItems: number;
  };
  message?: string;
}

export interface LegacySingleProductResponse {
  success: boolean;
  data: {
    product: LegacyProduct;
    relatedProducts: LegacyProduct[];
    similarProducts: LegacyProduct[];
  };
  message?: string;
}

export interface LegacyCategoryResponse {
  success: boolean;
  data: {
    products: LegacyProduct[];
    subcategories: string[];
    category: string;
  };
  pagination?: {
    current: number;
    total: number;
    count: number;
    totalItems: number;
  };
  message?: string;
}
