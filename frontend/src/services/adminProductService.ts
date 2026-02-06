import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface Product {
    _id: string;
    productId: string;
    name: string;
    category: string;
    subcategory: string;
    description: string;
    image: string;
    images: string[];
    sortedImages: string[];
    priceINR?: number;
    available: boolean;
    discount?: {
        enabled: boolean;
        percentage: number;
        startDate?: string | null;
        endDate?: string | null;
        description?: string;
    };
    hasVideo: boolean;
    videoUrl?: string;
    videoFilename?: string;
    videoSize?: number;
    videoUploadedAt?: string;
    furnitureSpecs?: {
        product?: string;
        type?: string;
        shape?: string;
        material?: string;
        size?: string;
        surfaceFinish?: string;
        delivery?: string;
        height?: string;
        colorName?: string;
        packagingDetails?: string;
        location?: string;
        etsyUrl?: string;
    };
    slabSpecs?: {
        finish?: string;
        thickness?: string;
        origin?: string;
        material?: string;
        application?: string;
    };
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string[];
    viewCount: number;
    addToCartCount: number;
    status: 'active' | 'inactive' | 'draft';
    featured: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ProductFormData {
    productId: string;
    name: string;
    category: string;
    subcategory: string;
    description: string;
    priceINR?: number;
    available?: boolean;
    discount?: {
        enabled?: boolean;
        percentage?: number;
        startDate?: string | null;
        endDate?: string | null;
        description?: string;
    };
    hasVideo?: boolean;
    status?: 'active' | 'inactive' | 'draft';
    featured?: boolean;
    furnitureSpecs?: any;
    slabSpecs?: any;
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string[];
}

interface PaginationResponse<T> {
    success: boolean;
    data: T;
    pagination: {
        current: number;
        total: number;
        count: number;
        totalItems: number;
    };
}

const getAuthHeader = () => {
    const token = localStorage.getItem('authToken');
    return {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    };
};

/**
 * Get all products (admin view - includes all statuses)
 */
export const getAdminProducts = async (params: {
    page?: number;
    limit?: number;
    category?: string;
    subcategory?: string;
    status?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
} = {}): Promise<PaginationResponse<Product[]>> => {
    const response = await axios.get(`${API_URL}/admin/products`, {
        ...getAuthHeader(),
        params
    });
    return response.data;
};

/**
 * Create a new product with images and optional video
 */
export const createProduct = async (
    productData: ProductFormData,
    images: File[],
    video?: File | null
): Promise<{ success: boolean; data: Product; message: string }> => {
    const formData = new FormData();
    
    // Add product data as JSON string
    formData.append('productData', JSON.stringify(productData));
    
    // Add images
    images.forEach((image) => {
        formData.append('images', image);
    });

    // Add video if provided
    if (video) {
        formData.append('video', video);
    }

    const response = await axios.post(
        `${API_URL}/admin/products`,
        formData,
        {
            ...getAuthHeader(),
            headers: {
                ...getAuthHeader().headers,
                'Content-Type': 'multipart/form-data'
            }
        }
    );
    
    return response.data;
};

/**
 * Update a product with optional new images and video
 */
export const updateProduct = async (
    productId: string,
    productData: Partial<ProductFormData> & { preserveExistingImages?: boolean; removeVideo?: boolean },
    images?: File[],
    video?: File | null,
    removeVideo?: boolean
): Promise<{ success: boolean; data: Product; message: string }> => {
    const formData = new FormData();
    
    // Add removeVideo flag to productData if needed
    const dataToSend = { ...productData };
    if (removeVideo) {
        dataToSend.removeVideo = true as any;
    }
    
    // Add product data as JSON string
    formData.append('productData', JSON.stringify(dataToSend));
    
    // Add new images if provided
    if (images && images.length > 0) {
        images.forEach((image) => {
            formData.append('images', image);
        });
    }

    // Add video if provided
    if (video) {
        formData.append('video', video);
    }

    const response = await axios.put(
        `${API_URL}/admin/products/${productId}`,
        formData,
        {
            ...getAuthHeader(),
            headers: {
                ...getAuthHeader().headers,
                'Content-Type': 'multipart/form-data'
            }
        }
    );
    
    return response.data;
};

/**
 * Delete a product and its images
 */
export const deleteProduct = async (
    productId: string
): Promise<{ success: boolean; message: string }> => {
    const response = await axios.delete(
        `${API_URL}/admin/products/${productId}`,
        getAuthHeader()
    );
    return response.data;
};

/**
 * Reorder product images
 */
export const reorderProductImages = async (
    productId: string,
    imageUrls: string[]
): Promise<{ success: boolean; data: Product; message: string }> => {
    const response = await axios.patch(
        `${API_URL}/admin/products/${productId}/reorder-images`,
        { imageUrls },
        getAuthHeader()
    );
    return response.data;
};

export default {
    getAdminProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    reorderProductImages
};
