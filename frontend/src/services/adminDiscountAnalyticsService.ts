/**
 * Admin Discount Analytics Service
 * Provides functions to manage and analyze product discounts
 */

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const API_BASE_URL = `${API_URL}/admin/products`;

interface DiscountAnalytics {
    totalProducts: number;  // Total products in database
    total: number;          // Total with discount enabled
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

interface DiscountedProduct {
    _id: string;
    productId: string;
    name: string;
    category: string;
    subcategory: string;
    priceINR: number;
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

/**
 * Get discount analytics and statistics
 */
export const getDiscountAnalytics = async (token: string): Promise<DiscountAnalytics> => {
    try {
        console.log('🔍 Fetching analytics from:', `${API_BASE_URL}/analytics/discounts`);
        const response = await axios.get(`${API_BASE_URL}/analytics/discounts`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        console.log('📡 Analytics API response:', response.data);
        
        if (!response.data || !response.data.data) {
            console.error('⚠️ Invalid response structure:', response.data);
            throw new Error('Invalid response format from server');
        }
        
        return response.data.data;
    } catch (error: any) {
        console.error('❌ Get discount analytics error:', error);
        console.error('❌ Error response:', error.response?.data);
        console.error('❌ Error status:', error.response?.status);
        throw new Error(error.response?.data?.message || 'Failed to fetch discount analytics');
    }
};

/**
 * Disable all expired discounts
 */
export const disableExpiredDiscounts = async (token: string): Promise<{ disabledCount: number }> => {
    try {
        const response = await axios.post(`${API_BASE_URL}/discounts/disable-expired`, {}, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data.data;
    } catch (error: any) {
        console.error('Disable expired discounts error:', error);
        throw new Error(error.response?.data?.message || 'Failed to disable expired discounts');
    }
};

/**
 * Get products with discounts
 */
export const getDiscountedProducts = async (
    token: string,
    options: {
        page?: number;
        limit?: number;
        status?: 'active' | 'scheduled' | 'expired' | 'all';
    } = {}
): Promise<{
    data: DiscountedProduct[];
    pagination: {
        current: number;
        total: number;
        count: number;
        totalItems: number;
    };
}> => {
    try {
        const { page = 1, limit = 20, status = 'all' } = options;
        
        console.log('🔍 Fetching products from:', `${API_BASE_URL}/discounts/products`);
        console.log('📋 Params:', { page, limit, status });
        
        const response = await axios.get(`${API_BASE_URL}/discounts/products`, {
            params: { page, limit, status },
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('📡 Products API response:', response.data);
        
        if (!response.data) {
            console.error('⚠️ Invalid response structure:', response.data);
            throw new Error('Invalid response format from server');
        }
        
        return {
            data: response.data.data || [],
            pagination: response.data.pagination
        };
    } catch (error: any) {
        console.error('❌ Get discounted products error:', error);
        console.error('❌ Error response:', error.response?.data);
        console.error('❌ Error status:', error.response?.status);
        throw new Error(error.response?.data?.message || 'Failed to fetch discounted products');
    }
};

/**
 * Update discount for a specific product
 */
export const updateProductDiscount = async (
    productId: string,
    discount: {
        enabled: boolean;
        percentage: number;
        startDate?: string | null;
        endDate?: string | null;
        description?: string;
    },
    token: string
): Promise<any> => {
    try {
        const response = await axios.patch(
            `${API_BASE_URL}/${productId}/discount`,
            { discount },
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );
        return response.data.data;
    } catch (error: any) {
        console.error('Update product discount error:', error);
        throw new Error(error.response?.data?.message || 'Failed to update product discount');
    }
};

/**
 * Remove discount from a specific product
 */
export const removeProductDiscount = async (productId: string, token: string): Promise<any> => {
    try {
        const response = await axios.delete(
            `${API_BASE_URL}/${productId}/discount`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );
        return response.data.data;
    } catch (error: any) {
        console.error('Remove product discount error:', error);
        throw new Error(error.response?.data?.message || 'Failed to remove product discount');
    }
};

/**
 * Apply discount to all products
 */
export const applyDiscountToAll = async (
    discount: {
        percentage: number;
        startDate?: string | null;
        endDate?: string | null;
        description?: string;
    },
    token: string
): Promise<{ updatedCount: number }> => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/discounts/apply-all`,
            { discount },
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );
        return response.data.data || { updatedCount: 0 };
    } catch (error: any) {
        console.error('Apply discount to all error:', error);
        throw new Error(error.response?.data?.message || 'Failed to apply discount to all products');
    }
};

/**
 * Remove discount from all products
 */
export const removeDiscountFromAll = async (token: string): Promise<{ updatedCount: number }> => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/discounts/remove-all`,
            {},
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );
        return response.data.data || { updatedCount: 0 };
    } catch (error: any) {
        console.error('Remove discount from all error:', error);
        throw new Error(error.response?.data?.message || 'Failed to remove discount from all products');
    }
};

/**
 * Apply discount to selected products (bulk)
 */
export const applyBulkDiscount = async (
    productIds: string[],
    discount: {
        percentage: number;
        startDate?: string | null;
        endDate?: string | null;
        description?: string;
    },
    token: string
): Promise<{ updatedCount: number }> => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/discounts/apply-bulk`,
            { productIds, discount },
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );
        return response.data.data || { updatedCount: 0 };
    } catch (error: any) {
        console.error('Apply bulk discount error:', error);
        throw new Error(error.response?.data?.message || 'Failed to apply bulk discount');
    }
};

/**
 * Remove discount from selected products (bulk)
 */
export const removeBulkDiscount = async (productIds: string[], token: string): Promise<{ updatedCount: number }> => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/discounts/remove-bulk`,
            { productIds },
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );
        return response.data.data || { updatedCount: 0 };
    } catch (error: any) {
        console.error('Remove bulk discount error:', error);
        throw new Error(error.response?.data?.message || 'Failed to remove bulk discount');
    }
};

export default {
    getDiscountAnalytics,
    disableExpiredDiscounts,
    getDiscountedProducts,
    updateProductDiscount,
    removeProductDiscount,
    applyDiscountToAll,
    removeDiscountFromAll,
    applyBulkDiscount,
    removeBulkDiscount
};
