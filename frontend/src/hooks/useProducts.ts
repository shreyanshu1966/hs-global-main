import { useState, useEffect, useCallback } from 'react';
import { Product, Category } from '../services/productService';
import {
  fetchCategories as fetchProductCategories,
  fetchCategoryProducts,
  fetchFeaturedProducts,
  fetchProductById,
  fetchProductList,
  fetchSearchedProducts,
  trackAddToCart as trackAddToCartEvent,
} from '../modules/product/store';

export interface UseProductsOptions {
  category?: string;
  subcategory?: string;
  featured?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  minPrice?: number;
  maxPrice?: number;
  autoFetch?: boolean;
}

export interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  pagination: {
    current: number;
    total: number;
    count: number;
    totalItems: number;
  } | null;
  fetchProducts: () => Promise<void>;
  refetch: () => Promise<void>;
}

export const useProducts = (options: UseProductsOptions = {}): UseProductsReturn => {
  const {
    category,
    subcategory,
    featured,
    search,
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    minPrice,
    maxPrice,
    autoFetch = true
  } = options;

  const [products, setProducts] = useState<Product[]>([]);
  // Initialize loading as true when autoFetch is enabled
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{
    current: number;
    total: number;
    count: number;
    totalItems: number;
  } | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let response;

      if (search) {
        response = await fetchSearchedProducts(search, {
          category,
          limit,
          page,
          minPrice,
          maxPrice
        });
      } else if (category) {
        response = await fetchCategoryProducts(category, {
          page,
          limit,
          subcategory,
          sortBy,
          sortOrder,
          minPrice,
          maxPrice
        });
        if (response.success && 'data' in response && typeof response.data === 'object') {
          setProducts(response.data.products);
          setPagination(response.pagination || null);
          return;
        }
      } else if (featured) {
        response = await fetchFeaturedProducts(limit);
      } else {
        response = await fetchProductList({
          page,
          limit,
          category,
          subcategory,
          featured,
          sortBy,
          sortOrder,
          minPrice,
          maxPrice
        });
      }

      if (response.success && Array.isArray(response.data)) {
        setProducts(response.data);
        setPagination(response.pagination || null);
      } else {
        setError('Invalid response format');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setProducts([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [category, subcategory, featured, search, page, limit, sortBy, sortOrder, minPrice, maxPrice]);

  useEffect(() => {
    if (autoFetch) {
      fetchProducts();
    }
  }, [fetchProducts, autoFetch]);

  return {
    products,
    loading,
    error,
    pagination,
    fetchProducts,
    refetch: fetchProducts
  };
};

export interface UseProductReturn {
  product: Product | null;
  relatedProducts: Product[];
  loading: boolean;
  error: string | null;
  fetchProduct: () => Promise<void>;
  refetch: () => Promise<void>;
}

export const useProduct = (productId: string | undefined): UseProductReturn => {
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  // Initialize loading as true to show skeleton immediately
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = useCallback(async () => {
    if (!productId) {
      setProduct(null);
      setRelatedProducts([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetchProductById(productId);

      if (response.success && response.data) {
        setProduct(response.data.product);
        setRelatedProducts(response.data.relatedProducts);
      } else {
        setError('Product not found');
        setProduct(null);
        setRelatedProducts([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setProduct(null);
      setRelatedProducts([]);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  return {
    product,
    relatedProducts,
    loading,
    error,
    fetchProduct,
    refetch: fetchProduct
  };
};

export interface UseCategoriesReturn {
  categories: Category[];
  loading: boolean;
  error: string | null;
  fetchCategories: () => Promise<void>;
  refetch: () => Promise<void>;
}

export const useCategories = (): UseCategoriesReturn => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchProductCategories();

      if (response.success) {
        setCategories(response.data);
      } else {
        setError('Failed to fetch categories');
        setCategories([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    fetchCategories,
    refetch: fetchCategories
  };
};

// Hook for tracking add to cart
export const useTrackAddToCart = () => {
  const trackAddToCart = useCallback(async (productId: string) => {
    try {
      await trackAddToCartEvent(productId);
    } catch (error) {
      // Silently fail as this is just for analytics
      console.warn('Failed to track add to cart:', error);
    }
  }, []);

  return trackAddToCart;
};