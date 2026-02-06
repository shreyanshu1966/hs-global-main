const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface Discount {
    _id: string;
    code: string;
    description: string;
    type: 'percentage' | 'fixed';
    value: number;
    maxDiscount?: number;
    minOrderAmount: number;
    usageLimit?: number;
    usedCount: number;
    usagePerUser: number;
    applicableCategories: string[];
    applicableProducts: any[];
    isActive: boolean;
    startDate: string;
    endDate: string;
    userUsage: Array<{
        userId: string;
        usageCount: number;
        lastUsed: string;
    }>;
    createdAt: string;
    updatedAt: string;
}

export interface DiscountFormData {
    code: string;
    description: string;
    type: 'percentage' | 'fixed';
    value: number;
    maxDiscount?: number;
    minOrderAmount?: number;
    usageLimit?: number;
    usagePerUser?: number;
    applicableCategories?: string[];
    applicableProducts?: string[];
    startDate: string;
    endDate: string;
}

export interface DiscountAnalytics {
    overview: {
        total: number;
        active: number;
        expired: number;
        scheduled: number;
    };
    usage: {
        total: number;
        average: number;
    };
    topPerforming: Array<{
        _id: string;
        code: string;
        description: string;
        usedCount: number;
        type: string;
        value: number;
    }>;
    typeDistribution: Array<{
        _id: string;
        count: number;
    }>;
}

export interface PaginationResponse<T> {
    data: T[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
}

// Get all discounts
export const getAllDiscounts = async (page = 1, limit = 10, search = '', status = '', type = '') => {
    const token = localStorage.getItem('authToken');
    const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(status && { status }),
        ...(type && { type })
    });

    const response = await fetch(`${API_URL}/admin/discounts?${params}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch discounts');
    }

    return response.json();
};

// Get discount analytics
export const getDiscountAnalytics = async (): Promise<DiscountAnalytics> => {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_URL}/admin/discounts/analytics`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch discount analytics');
    }

    return response.json();
};

// Create discount
export const createDiscount = async (discountData: DiscountFormData): Promise<Discount> => {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_URL}/admin/discounts`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(discountData)
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create discount');
    }

    const result = await response.json();
    return result.discount;
};

// Update discount
export const updateDiscount = async (discountId: string, discountData: Partial<DiscountFormData>): Promise<Discount> => {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_URL}/admin/discounts/${discountId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(discountData)
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update discount');
    }

    const result = await response.json();
    return result.discount;
};

// Delete discount
export const deleteDiscount = async (discountId: string): Promise<void> => {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_URL}/admin/discounts/${discountId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete discount');
    }
};

// Toggle discount status
export const toggleDiscountStatus = async (discountId: string): Promise<Discount> => {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_URL}/admin/discounts/${discountId}/toggle-status`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to toggle discount status');
    }

    const result = await response.json();
    return result.discount;
};

// Validate discount (for checkout)
export const validateDiscount = async (code: string, orderAmount: number, userId: string, products?: any[]) => {
    const response = await fetch(`${API_URL}/admin/discounts/validate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code, orderAmount, userId, products })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to validate discount');
    }

    return response.json();
};