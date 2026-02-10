// Dynamic category fetching utilities
import { categories, Category, Subcategory } from '../data/products';
import { fetchCustomCategories, CustomCategoryData, CustomSubcategory, nameToSlug } from '../services/categoryService';

// Cache for merged categories to avoid frequent API calls
let categoriesCache: Category[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Convert custom subcategory to Subcategory format
 */
const convertCustomSubcategory = (custom: CustomSubcategory): Subcategory => ({
  id: custom.id,
  name: custom.name,
  products: [], // Custom subcategories start with no products
  subcategories: []
});

/**
 * Merge custom subcategories with static subcategories
 */
const mergeSubcategories = (
  staticSubs: Subcategory[],
  customSubs: CustomSubcategory[]
): Subcategory[] => {
  const merged = [...staticSubs];
  
  // Add custom subcategories that don't already exist
  customSubs.forEach(customSub => {
    const exists = merged.some(sub => 
      sub.name.toLowerCase() === customSub.name.toLowerCase()
    );
    
    if (!exists) {
      merged.push(convertCustomSubcategory(customSub));
    }
  });
  
  return merged;
};

/**
 * Merge static and custom categories
 */
const mergeCategoriesWithCustom = async (customData: CustomCategoryData): Promise<Category[]> => {
  return categories.map(category => ({
    ...category,
    subcategories: mergeSubcategories(
      category.subcategories,
      customData[category.id] || []
    )
  }));
};

/**
 * Get filtered categories (excluding "other" options) with custom categories merged
 */
export const getFilteredCategoriesWithCustom = async (): Promise<Category[]> => {
  try {
    // Check cache validity
    const now = Date.now();
    if (categoriesCache && (now - cacheTimestamp) < CACHE_DURATION) {
      return categoriesCache;
    }
    
    // Fetch custom categories from API
    const customData = await fetchCustomCategories();
    
    // Merge with static categories
    const mergedCategories = await mergeCategoriesWithCustom(customData);
    
    // Filter out "other" options at all levels
    const filteredCategories = mergedCategories.map(category => ({
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
    return getFilteredCategories();
  }
};

/**
 * Get filtered categories (excluding "other" options) dynamically - static only
 */
export const getFilteredCategories = (): Category[] => {
  return categories.map(category => ({
    ...category,
    subcategories: category.subcategories.filter(sub => 
      !sub.name.toLowerCase().includes('other')
    ).map(sub => ({
      ...sub,
      subcategories: sub.subcategories ? sub.subcategories.filter(childSub => 
        !childSub.name.toLowerCase().includes('other')
      ) : []
    }))
  }));
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
    const categoriesWithCustom = await getFilteredCategoriesWithCustom();
    const category = categoriesWithCustom.find(c => c.id === categoryId);
    return category?.subcategories || [];
  } catch (error) {
    console.error('Error getting subcategories for category:', error);
    // Fallback to static data
    return getSubcategoriesForCategory(categoryId);
  }
};

/**
 * Fetch categories from API endpoint (for future use)
 */
export const fetchCategoriesFromAPI = async (): Promise<Category[]> => {
  try {
    // This would be replaced with actual API call
    const response = await fetch('/api/categories');
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    const data = await response.json();
    
    // Apply filtering to remove "other" options
    return data.map((category: Category) => ({
      ...category,
      subcategories: category.subcategories.filter((sub: any) => 
        !sub.name.toLowerCase().includes('other')
      ).map((sub: any) => ({
        ...sub,
        subcategories: sub.subcategories ? sub.subcategories.filter((childSub: any) => 
          !childSub.name.toLowerCase().includes('other')
        ) : []
      }))
    }));
  } catch (error) {
    console.error('Error fetching categories:', error);
    // Fallback to filtered static data with custom
    return getFilteredCategoriesWithCustom();
  }
};

/**
 * Get subcategories for a specific category dynamically - static only
 */
export const getSubcategoriesForCategory = (categoryId: string) => {
  const filteredCategories = getFilteredCategories();
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