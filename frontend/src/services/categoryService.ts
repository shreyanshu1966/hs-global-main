// Category API service for managing custom categories and subcategories

const API_BASE = '/api/categories';

export interface CustomSubcategory {
  id: string;
  name: string;
  isCustom: boolean;
}

export interface CustomCategoryData {
  [categoryId: string]: CustomSubcategory[];
}

/**
 * Fetch all custom categories and their subcategories
 */
export const fetchCustomCategories = async (): Promise<CustomCategoryData> => {
  try {
    const response = await fetch(`${API_BASE}/custom`);
    const data = await response.json();
    
    if (data.success) {
      return data.data;
    }
    
    throw new Error(data.message || 'Failed to fetch custom categories');
  } catch (error) {
    console.error('Error fetching custom categories:', error);
    return {};
  }
};

/**
 * Fetch custom subcategories for a specific category
 */
export const fetchCustomSubcategories = async (categoryId: string): Promise<CustomSubcategory[]> => {
  try {
    const response = await fetch(`${API_BASE}/custom/${categoryId}`);
    const data = await response.json();
    
    if (data.success) {
      return data.data;
    }
    
    throw new Error(data.message || 'Failed to fetch custom subcategories');
  } catch (error) {
    console.error('Error fetching custom subcategories:', error);
    return [];
  }
};

/**
 * Add a custom subcategory
 */
export const addCustomSubcategory = async (
  categoryId: string,
  categoryName: string,
  subcategoryName: string
): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE}/custom/subcategory`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        categoryId,
        categoryName,
        subcategoryName,
      }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      return true;
    }
    
    throw new Error(data.message || 'Failed to add custom subcategory');
  } catch (error) {
    console.error('Error adding custom subcategory:', error);
    return false;
  }
};

/**
 * Delete a custom subcategory
 */
export const deleteCustomSubcategory = async (
  categoryId: string,
  subcategoryId: string
): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE}/custom/${categoryId}/subcategory/${subcategoryId}`, {
      method: 'DELETE',
    });
    
    const data = await response.json();
    
    if (data.success) {
      return true;
    }
    
    throw new Error(data.message || 'Failed to delete custom subcategory');
  } catch (error) {
    console.error('Error deleting custom subcategory:', error);
    return false;
  }
};

/**
 * Update a custom subcategory
 */
export const updateCustomSubcategory = async (
  categoryId: string,
  subcategoryId: string,
  name: string
): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE}/custom/${categoryId}/subcategory/${subcategoryId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      return true;
    }
    
    throw new Error(data.message || 'Failed to update custom subcategory');
  } catch (error) {
    console.error('Error updating custom subcategory:', error);
    return false;
  }
};

/**
 * Convert a name to a slug format
 */
export const nameToSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};