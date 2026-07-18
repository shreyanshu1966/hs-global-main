'use client';
import axios from 'axios';
import type { AdminProduct as Product, AdminProductFormData as ProductFormData } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

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
      Authorization: `Bearer ${token}`,
    },
  };
};

export const adminProductApi = {
  async getAdminProducts(params: {
    page?: number;
    limit?: number;
    category?: string;
    subcategory?: string;
    status?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<PaginationResponse<Product[]>> {
    const response = await axios.get(`${API_URL}/admin/products`, {
      ...getAuthHeader(),
      params,
    });
    return response.data;
  },

  async createProduct(
    productData: ProductFormData,
    images: File[],
    video?: File | null,
    variantImages?: File[]
  ): Promise<{ success: boolean; data: Product; message: string }> {
    const formData = new FormData();
    formData.append('productData', JSON.stringify(productData));

    images.forEach((image) => {
      formData.append('images', image);
    });

    (variantImages || []).forEach((image) => {
      formData.append('variantImages', image);
    });

    if (video) {
      formData.append('video', video);
    }

    const response = await axios.post(`${API_URL}/admin/products`, formData, {
      ...getAuthHeader(),
      headers: {
        ...getAuthHeader().headers,
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  async updateProduct(
    productId: string,
    productData: Partial<ProductFormData> & { preserveExistingImages?: boolean; removeVideo?: boolean },
    images?: File[],
    video?: File | null,
    removeVideo?: boolean,
    variantImages?: File[]
  ): Promise<{ success: boolean; data: Product; message: string }> {
    const formData = new FormData();
    const dataToSend = { ...productData };

    if (removeVideo) {
      dataToSend.removeVideo = true as never;
    }

    formData.append('productData', JSON.stringify(dataToSend));

    if (images && images.length > 0) {
      images.forEach((image) => {
        formData.append('images', image);
      });
    }

    (variantImages || []).forEach((image) => {
      formData.append('variantImages', image);
    });

    if (video) {
      formData.append('video', video);
    }

    const response = await axios.put(`${API_URL}/admin/products/${productId}`, formData, {
      ...getAuthHeader(),
      headers: {
        ...getAuthHeader().headers,
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  async deleteProduct(productId: string): Promise<{ success: boolean; message: string }> {
    const response = await axios.delete(`${API_URL}/admin/products/${productId}`, getAuthHeader());
    return response.data;
  },

  async reorderProductImages(
    productId: string,
    imageUrls: string[]
  ): Promise<{ success: boolean; data: Product; message: string }> {
    const response = await axios.patch(
      `${API_URL}/admin/products/${productId}/reorder-images`,
      { imageUrls },
      getAuthHeader()
    );
    return response.data;
  },

  async replaceProductImage(
    productId: string,
    oldUrl: string,
    image: File
  ): Promise<{ success: boolean; data: { newUrl: string; images: string[]; sortedImages: string[]; image: string }; message: string }> {
    const formData = new FormData();
    formData.append('oldUrl', oldUrl);
    formData.append('image', image);

    const response = await axios.patch(
      `${API_URL}/admin/products/${productId}/replace-image`,
      formData,
      {
        ...getAuthHeader(),
        headers: {
          ...getAuthHeader().headers,
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  },

  async previewProduct(
    productData: ProductFormData,
    images?: FileList | File[],
    video?: File,
    existingImages?: string[]
  ): Promise<{ success: boolean; data: Product; message: string }> {
    const formData = new FormData();
    formData.append(
      'productData',
      JSON.stringify({
        ...productData,
        existingImages: existingImages || [],
      })
    );

    if (images) {
      Array.from(images).forEach((image) => {
        formData.append('images', image);
      });
    }

    if (video) {
      formData.append('video', video);
    }

    const response = await axios.post(`${API_URL}/admin/products/preview`, formData, {
      ...getAuthHeader(),
      headers: {
        ...getAuthHeader().headers,
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },
};
