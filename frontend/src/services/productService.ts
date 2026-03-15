import { API_BASE_URL } from '../config';
import { legacyCompatibleProductApi } from '../modules/product/api/legacyCompatibleApi';

export interface Product {
  _id: string;
  productId: string;
  name: string;
  category: string;
  subcategory: string;
  description: string;
  image: string;
  images: string[];
  sortedImages?: string[];
  priceINR?: number;
  available: boolean;
  discount?: {
    enabled: boolean;
    percentage: number;
    startDate?: string | null;
    endDate?: string | null;
    description?: string;
  };
  hasVideo: boolean;
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
  // Legacy SEO fields (for backward compatibility)
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  // Enhanced SEO fields
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
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  category: string;
  subcategories: string[];
  count: number;
}

export interface ProductResponse {
  success: boolean;
  data: Product[] | Product;
  pagination?: {
    current: number;
    total: number;
    count: number;
    totalItems: number;
  };
  message?: string;
}

export interface SingleProductResponse {
  success: boolean;
  data: {
    product: Product;
    relatedProducts: Product[];
  };
  message?: string;
}

export interface CategoryResponse {
  success: boolean;
  data: {
    products: Product[];
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

class ProductService {
  // Ensure we don't double-append /api if API_BASE_URL already has it
  private baseUrl = API_BASE_URL.endsWith('/api')
    ? API_BASE_URL
    : `${API_BASE_URL}/api`;

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  /**
   * Get all products with pagination and filters
   */
  async getAllProducts(params: {
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
  } = {}): Promise<ProductResponse> {
    return legacyCompatibleProductApi.getAllProducts(params);
  }

  /**
   * Get single product by ID
   */
  async getProductById(id: string): Promise<SingleProductResponse> {
    return legacyCompatibleProductApi.getProductById(id);
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(
    category: string,
    params: {
      page?: number;
      limit?: number;
      subcategory?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
      minPrice?: number;
      maxPrice?: number;
    } = {}
  ): Promise<CategoryResponse> {
    return legacyCompatibleProductApi.getProductsByCategory(category, params);
  }

  /**
   * Get featured products
   */
  async getFeaturedProducts(limit = 10): Promise<ProductResponse> {
    return legacyCompatibleProductApi.getFeaturedProducts(limit);
  }

  /**
   * Search products
   */
  async searchProducts(query: string, params: {
    category?: string;
    limit?: number;
    page?: number;
    minPrice?: number;
    maxPrice?: number;
  } = {}): Promise<ProductResponse> {
    return legacyCompatibleProductApi.searchProducts(query, params);
  }

  /**
   * Get product categories and subcategories
   */
  async getCategories(): Promise<{ success: boolean; data: Category[] }> {
    return legacyCompatibleProductApi.getCategories();
  }

  /**
   * Track add to cart for analytics
   */
  async trackAddToCart(productId: string): Promise<{ success: boolean; message: string }> {
    return legacyCompatibleProductApi.trackAddToCart(productId);
  }

  /**
   * Admin: Create product
   */
  async createProduct(productData: Partial<Product>): Promise<ProductResponse> {
    return this.request<ProductResponse>('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
  }

  /**
   * Admin: Update product
   */
  async updateProduct(id: string, productData: Partial<Product>): Promise<ProductResponse> {
    return this.request<ProductResponse>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
  }

  /**
   * Admin: Delete product
   */
  async deleteProduct(id: string): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(`/products/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
  }
}

// Export singleton instance
export const productService = new ProductService();

// Legacy compatibility - mapping new API product structure to old interface
export const getAllProducts = async (): Promise<Product[]> => {
  try {
    const response = await productService.getAllProducts({ limit: 1000 }); // Get all products
    if (response.success && Array.isArray(response.data)) {
      return response.data.map(product => ({
        ...product,
        id: product.productId, // Map productId to id for backward compatibility
      })) as any[];
    }
    return [];
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return [];
  }
};

// Legacy categories structure for backward compatibility
export const categories = [
  {
    id: "furniture",
    name: "Furniture",
    subcategories: [], // Will be populated dynamically
  },
  {
    id: "slabs",
    name: "Slabs",
    subcategories: [], // Will be populated dynamically
  },
];

// Subcategory interface for compatibility
export interface Subcategory {
  id: string;
  name: string;
  products?: Product[];
  subcategories?: Subcategory[];
}

export default productService;