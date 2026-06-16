'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
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
  /** Server-fetched products to seed first render (SSR). */
  initialProducts?: Product[];
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
    autoFetch = true,
    initialProducts,
  } = options;

  // Capture initialProducts in a ref so it seeds state once on mount without
  // ever becoming a reactive dep that triggers re-fetches on every render.
  const initialProductsRef = useRef<Product[] | undefined>(initialProducts);

  const [products, setProducts] = useState<Product[]>(initialProductsRef.current ?? []);
  // Seeded with server data → no skeleton on first paint (SSR-friendly).
  const [loading, setLoading] = useState(initialProductsRef.current ? false : autoFetch);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{
    current: number;
    total: number;
    count: number;
    totalItems: number;
  } | null>(null);

  // Incremented on every new fetch; stale responses check their ID against current before committing state.
  const requestIdRef = useRef(0);

  const fetchProducts = useCallback(async () => {
    const requestId = ++requestIdRef.current;

    // Clear stale products immediately when starting a fresh (page 1) fetch so old
    // results never surface under a new filter.
    if (page === 1) setProducts([]);
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
        if (requestId !== requestIdRef.current) return;
        if (response.success && 'data' in response && response.data !== null && typeof response.data === 'object') {
          setProducts((response.data as { products: Product[] }).products);
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

      if (requestId !== requestIdRef.current) return;

      if (response.success && Array.isArray(response.data)) {
        setProducts(response.data);
        setPagination(response.pagination || null);
      } else {
        setError('Invalid response format');
      }
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setError(err instanceof Error ? err.message : 'An error occurred');
      setProducts([]);
      setPagination(null);
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
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
  similarProducts: Product[];
  loading: boolean;
  error: string | null;
  fetchProduct: () => Promise<void>;
  refetch: () => Promise<void>;
}

export interface UseProductInitialData {
  product: Product | null;
  relatedProducts?: Product[];
  similarProducts?: Product[];
}

export const useProduct = (
  productId: string | undefined,
  initialData?: UseProductInitialData
): UseProductReturn => {
  // Seed state with server-fetched data so the body renders on the server (SSR).
  const [product, setProduct] = useState<Product | null>(initialData?.product ?? null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>(initialData?.relatedProducts ?? []);
  const [similarProducts, setSimilarProducts] = useState<Product[]>(initialData?.similarProducts ?? []);
  // If we already have server data, don't show the skeleton on first paint.
  const [loading, setLoading] = useState(!initialData?.product);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = useCallback(async () => {
    if (!productId) {
      setProduct(null);
      setRelatedProducts([]);
      setSimilarProducts([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetchProductById(productId);

      if (response.success && response.data) {
        setProduct(response.data.product);
        setRelatedProducts(response.data.relatedProducts);
        setSimilarProducts(response.data.similarProducts || []);
      } else {
        setError('Product not found');
        setProduct(null);
        setRelatedProducts([]);
        setSimilarProducts([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setProduct(null);
      setRelatedProducts([]);
      setSimilarProducts([]);
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
    similarProducts,
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