// Dynamic category fetching utilities (API-first)
import { productService } from '../services/productService';

export interface DynamicProduct {
  id: string;
  productId?: string;
  name: string;
  category: string;
  subcategory: string;
  image: string;
  description: string;
  images?: string[];
}

export interface Subcategory {
  id: string;
  name: string;
  products?: DynamicProduct[];
  subcategories?: Subcategory[];
}

export interface Category {
  id: string;
  name: string;
  subcategories: Subcategory[];
}

// Cache for merged categories to avoid frequent API calls
let categoriesCache: Category[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const toSlug = (name: string): string =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/**
 * Get filtered categories (excluding "other" options)
 */
export const getFilteredCategoriesWithCustom = async (): Promise<Category[]> => {
  try {
    // Check cache validity
    const now = Date.now();
    if (categoriesCache && (now - cacheTimestamp) < CACHE_DURATION) {
      return categoriesCache;
    }
    
    // Fetch centralized categories from API
    const baseResponse = await productService.getCategories();
    const baseCategories: Category[] = (baseResponse.success ? baseResponse.data : []).map((category) => ({
      id: category.category,
      name: category.category.charAt(0).toUpperCase() + category.category.slice(1),
      subcategories: (category.subcategories || []).map((sub) => ({
        id: toSlug(sub),
        name: sub,
        products: [],
        subcategories: [],
      })),
    }));
    
    // Filter out "other" options at all levels
    const filteredCategories = baseCategories.map(category => ({
      ...category,
      subcategories: category.subcategories
        .filter(sub => !sub.name.toLowerCase().includes('other'))
        .map(sub => ({
          ...sub,
          subcategories: sub.subcategories 
            ? sub.subcategories.filter(childSub => 
                !childSub.name.toLowerCase().includes('other')
              )
            : []
        }))
    }));
    
    // Update cache
    categoriesCache = filteredCategories;
    cacheTimestamp = now;
    
    return filteredCategories;
  } catch (error) {
    console.error('Error getting filtered categories with custom:', error);
    // Fallback to static filtered categories
    return [];
  }
};

/**
 * Get filtered categories (excluding "other" options) dynamically - static only
 */
export const getFilteredCategories = (): Category[] => {
  return categoriesCache || [];
};

/**
 * Clear the categories cache (useful after adding custom categories)
 */
export const clearCategoriesCache = (): void => {
  categoriesCache = null;
  cacheTimestamp = 0;
};

/**
 * Get all subcategories for a category (including custom ones)
 */
export const getAllSubcategoriesForCategory = async (categoryId: string): Promise<Subcategory[]> => {
  try {
    const categories = await getFilteredCategoriesWithCustom();
    const category = categories.find(c => c.id === categoryId);
    return category?.subcategories || [];
  } catch (error) {
    console.error('Error getting subcategories for category:', error);
    // Fallback to cached data
    return getSubcategoriesForCategory(categoryId);
  }
};

/**
 * Fetch categories from API endpoint (for future use)
 */
export const fetchCategoriesFromAPI = async (): Promise<Category[]> => {
  try {
    return await getFilteredCategoriesWithCustom();
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

/**
 * Get subcategories for a specific category dynamically - static only
 */
export const getSubcategoriesForCategory = (categoryId: string) => {
  const filteredCategories = categoriesCache || [];
  const category = filteredCategories.find(c => c.id === categoryId);
  return category?.subcategories || [];
};

/**
 * Check if a subcategory should be excluded (contains "other")
 */
export const shouldExcludeSubcategory = (subcategoryName: string): boolean => {
  return subcategoryName.toLowerCase().includes('other');
};

/**
 * Add a custom subcategory and clear cache
 */
export const addCustomSubcategoryAndRefresh = async (
  categoryId: string,
  categoryName: string,
  subcategoryName: string
): Promise<boolean> => {
  try {
    const { addCustomSubcategory } = await import('../services/categoryService');
    const success = await addCustomSubcategory(categoryId, categoryName, subcategoryName);
    
    if (success) {
      clearCategoriesCache(); // Clear cache to force refresh
    }
    
    return success;
  } catch (error) {
    console.error('Error adding custom subcategory:', error);
    return false;
  }
};