// Category API service for managing custom categories and subcategories

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
const API_BASE = `${API_URL}/categories`;

export interface CustomSubcategory {
  id: string;
  name: string;
  isCustom: boolean;
}

export interface CustomCategoryData {
  [categoryId: string]: CustomSubcategory[];
}

/**
 * Get authentication headers
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

/**
 * Fetch all custom categories and their subcategories
 */
export const fetchCustomCategories = async (): Promise<CustomCategoryData> => {
  try {
    const response = await fetch(`${API_BASE}/custom`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
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
    const response = await fetch(`${API_BASE}/custom/${categoryId}`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
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
      headers: getAuthHeaders(),
      body: JSON.stringify({
        categoryId,
        categoryName,
        subcategoryName,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Custom subcategory saved successfully:', subcategoryName);
      return true;
    }
    
    throw new Error(data.message || 'Failed to add custom subcategory');
  } catch (error) {
    console.error('❌ Error adding custom subcategory:', error);
    throw error; // Re-throw to allow caller to handle
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
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success) {
      return true;
    }
    
    throw new Error(data.message || 'Failed to delete custom subcategory');
  } catch (error) {
    console.error('Error deleting custom subcategory:', error);
    throw error;
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
      headers: getAuthHeaders(),
      body: JSON.stringify({ name }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success) {
      return true;
    }
    
    throw new Error(data.message || 'Failed to update custom subcategory');
  } catch (error) {
    console.error('Error updating custom subcategory:', error);
    throw error;
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