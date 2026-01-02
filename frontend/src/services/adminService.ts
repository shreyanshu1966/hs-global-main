const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Get analytics data
export const getAnalytics = async () => {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_URL}/admin/analytics`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch analytics');
    }

    return response.json();
};

// Get all users
export const getAllUsers = async (page = 1, limit = 10, search = '', role = '') => {
    const token = localStorage.getItem('authToken');
    const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(role && { role })
    });

    const response = await fetch(`${API_URL}/admin/users?${params}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch users');
    }

    return response.json();
};

// Get all orders
export const getAllOrders = async (page = 1, limit = 10, status = '', deliveryStatus = '', search = '') => {
    const token = localStorage.getItem('authToken');
    const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(status && { status }),
        ...(deliveryStatus && { deliveryStatus }),
        ...(search && { search })
    });

    const response = await fetch(`${API_URL}/admin/orders?${params}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch orders');
    }

    return response.json();
};

// Update order status
export const updateOrderStatus = async (orderId: string, data: {
    deliveryStatus?: string;
    trackingNumber?: string;
    notes?: string;
}) => {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_URL}/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update order');
    }

    return response.json();
};

// Update user role
export const updateUserRole = async (userId: string, role: string) => {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_URL}/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update user role');
    }

    return response.json();
};

// Delete user
export const deleteUser = async (userId: string) => {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete user');
    }

    return response.json();
};
