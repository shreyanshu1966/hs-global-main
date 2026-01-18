const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const API_URL = `${BASE_URL}/contact`;

export interface Contact {
    _id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    referenceImage?: string;
    status: 'new' | 'read' | 'replied' | 'archived';
    ipAddress?: string;
    userAgent?: string;
    adminNotes?: string;
    repliedAt?: string;
    repliedBy?: string;
    createdAt: string;
    updatedAt: string;
}

export interface ContactStats {
    total: number;
    today: number;
    byStatus: {
        new?: number;
        read?: number;
        replied?: number;
        archived?: number;
    };
}

// Get all contacts (Admin only)
export const getAllContacts = async (
    page: number = 1,
    limit: number = 20,
    status?: string
): Promise<{ contacts: Contact[]; pagination: any }> => {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Authentication required');

    const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(status && { status })
    });

    const response = await fetch(`${API_URL}?${params}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch contacts');
    }

    return response.json();
};

// Get contact stats (Admin only)
export const getContactStats = async (): Promise<ContactStats> => {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Authentication required');

    const response = await fetch(`${API_URL}/stats`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch contact stats');
    }

    const data = await response.json();
    return data.stats;
};

// Get single contact (Admin only)
export const getContactById = async (id: string): Promise<Contact> => {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Authentication required');

    const response = await fetch(`${API_URL}/${id}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch contact');
    }

    const data = await response.json();
    return data.contact;
};

// Update contact status (Admin only)
export const updateContactStatus = async (
    id: string,
    status: string,
    adminNotes?: string
): Promise<Contact> => {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Authentication required');

    const response = await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status, adminNotes })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update contact');
    }

    const data = await response.json();
    return data.contact;
};

// Delete contact (Admin only)
export const deleteContact = async (id: string): Promise<void> => {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Authentication required');

    const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete contact');
    }
};

export default {
    getAllContacts,
    getContactStats,
    getContactById,
    updateContactStatus,
    deleteContact
};
