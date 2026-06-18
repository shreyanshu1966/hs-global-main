export interface AdminProduct {
  _id: string;
  productId: string;
  name: string;
  category: string;
  subcategory: string;
  description: string;
  image: string;
  images: string[];
  sortedImages: string[];
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
  videoUrl?: string;
  videoFilename?: string;
  videoSize?: number;
  videoUploadedAt?: string;
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
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  viewCount: number;
  addToCartCount: number;
  status: 'active' | 'inactive' | 'draft';
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminProductFormData {
  productId: string;
  name: string;
  category: string;
  subcategory: string;
  description: string;
  priceUSD?: number;
  available?: boolean;
  discount?: {
    enabled?: boolean;
    percentage?: number;
    startDate?: string | null;
    endDate?: string | null;
    description?: string;
  };
  hasVideo?: boolean;
  status?: 'active' | 'inactive' | 'draft';
  featured?: boolean;
  furnitureSpecs?: any;
  slabSpecs?: any;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  existingImages?: string[];
  newImagesFirst?: boolean;
}

export interface DiscountAnalytics {
  totalProducts: number;
  total: number;
  active: number;
  scheduled: number;
  expired: number;
  needsCleanup: number;
  avgPercentage: number;
  maxPercentage: number;
  minPercentage: number;
  expiringSoon: Array<{
    productId: string;
    name: string;
    discount: any;
    endDate: string;
    daysRemaining: number;
  }>;
}

export interface DiscountedProduct {
  _id: string;
  productId: string;
  name: string;
  category: string;
  subcategory: string;
  priceUSD: number;
  discount: {
    enabled: boolean;
    percentage: number;
    startDate?: string;
    endDate?: string;
    description?: string;
  };
  image: string;
  discountStatus: {
    status: 'active' | 'scheduled' | 'expired' | 'none';
    message: string;
    daysRemaining?: number;
    hoursRemaining?: number;
    isExpiringSoon?: boolean;
  };
  finalPrice: number;
}
