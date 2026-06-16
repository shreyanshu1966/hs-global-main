const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export interface Review {
    _id: string;
    productId: string;
    userName: string;
    userEmail: string;
    rating: number;
    title: string;
    comment: string;
    verified: boolean;
    helpful: number;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
    updatedAt: string;
}

export interface ReviewStats {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
}

class ReviewService {
    // Get all reviews (admin)
    async getAllReviews(token: string, status?: string, limit = 50, skip = 0) {
        const params = new URLSearchParams({
            limit: limit.toString(),
            skip: skip.toString(),
            ...(status && { status })
        });

        const response = await fetch(`${API_URL}/reviews/admin/all?${params}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch reviews');
        }

        return response.json();
    }

    // Approve review
    async approveReview(reviewId: string, token: string) {
        const response = await fetch(`${API_URL}/reviews/admin/${reviewId}/approve`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to approve review');
        }

        return response.json();
    }

    // Reject review
    async rejectReview(reviewId: string, token: string) {
        const response = await fetch(`${API_URL}/reviews/admin/${reviewId}/reject`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to reject review');
        }

        return response.json();
    }

    // Delete review
    async deleteReview(reviewId: string, token: string) {
        const response = await fetch(`${API_URL}/reviews/admin/${reviewId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to delete review');
        }

        return response.json();
    }

    // Update review
    async updateReview(reviewId: string, updates: Partial<Review>, token: string) {
        const response = await fetch(`${API_URL}/reviews/admin/${reviewId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updates)
        });

        if (!response.ok) {
            throw new Error('Failed to update review');
        }

        return response.json();
    }
}

export default new ReviewService();
