const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface Quotation {
    _id: string;
    name: string;
    email: string;
    mobile: string;
    productName: string;
    finish: string;
    thickness: string;
    requirement: number;
    status: 'new' | 'quoted' | 'contacted' | 'archived';
    quotedPrice?: number;
    adminNotes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface QuotationStats {
    total: number;
    today: number;
    byStatus: {
        new?: number;
        quoted?: number;
        contacted?: number;
        archived?: number;
    };
}

// Get all quotations (Admin only)
export const getAllQuotations = async (page: number = 1, limit: number = 20, status?: string) => {
    const token = localStorage.getItem('token');
    const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(status && { status })
    });

    const response = await fetch(`${API_URL}/api/quotations?${params}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    const data = await response.json();
    if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Failed to fetch quotations');
    }

    return data;
};

// Get quotation by ID (Admin only)
export const getQuotationById = async (id: string): Promise<Quotation> => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/quotations/${id}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    const data = await response.json();
    if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Failed to fetch quotation');
    }

    return data.quotation;
};

// Update quotation status (Admin only)
export const updateQuotationStatus = async (id: string, status: string, adminNotes?: string, quotedPrice?: number) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/quotations/${id}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status, adminNotes, quotedPrice })
    });

    const data = await response.json();
    if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Failed to update quotation');
    }

    return data;
};

// Delete quotation (Admin only)
export const deleteQuotation = async (id: string) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/quotations/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    const data = await response.json();
    if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Failed to delete quotation');
    }

    return data;
};

// Get quotation statistics (Admin only)
export const getQuotationStats = async (): Promise<QuotationStats> => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/quotations/stats`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    const data = await response.json();
    if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Failed to fetch quotation statistics');
    }

    return data.stats;
};

export default {
    getAllQuotations,
    getQuotationById,
    updateQuotationStatus,
    deleteQuotation,
    getQuotationStats
};
