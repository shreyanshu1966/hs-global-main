'use client';
import axios from 'axios';
import type { DiscountAnalytics, DiscountedProduct } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
const API_BASE_URL = `${API_URL}/admin/products`;

const withToken = (token?: string) => ({
  headers: {
    Authorization: `Bearer ${token || localStorage.getItem('authToken') || ''}`,
  },
});

export const adminPricingApi = {
  async getDiscountAnalytics(token?: string): Promise<DiscountAnalytics> {
    const response = await axios.get(`${API_BASE_URL}/analytics/discounts`, withToken(token));
    return response.data.data;
  },

  async disableExpiredDiscounts(token?: string): Promise<{ disabledCount: number }> {
    const response = await axios.post(`${API_BASE_URL}/discounts/disable-expired`, {}, withToken(token));
    return response.data.data;
  },

  async getDiscountedProducts(
    options: {
      page?: number;
      limit?: number;
      status?: 'active' | 'scheduled' | 'expired' | 'all';
      token?: string;
    } = {}
  ): Promise<{
    data: DiscountedProduct[];
    pagination: {
      current: number;
      total: number;
      count: number;
      totalItems: number;
    };
  }> {
    const { page = 1, limit = 20, status = 'all', token } = options;
    const response = await axios.get(`${API_BASE_URL}/discounts/products`, {
      ...withToken(token),
      params: { page, limit, status },
    });

    return {
      data: response.data.data || [],
      pagination: response.data.pagination,
    };
  },

  async updateProductDiscount(
    productId: string,
    discount: {
      enabled: boolean;
      percentage: number;
      startDate?: string | null;
      endDate?: string | null;
      description?: string;
    },
    token?: string
  ): Promise<any> {
    const response = await axios.patch(`${API_BASE_URL}/${productId}/discount`, { discount }, withToken(token));
    return response.data.data;
  },

  async removeProductDiscount(productId: string, token?: string): Promise<any> {
    const response = await axios.delete(`${API_BASE_URL}/${productId}/discount`, withToken(token));
    return response.data.data;
  },

  async applyDiscountToAll(
    discount: {
      percentage: number;
      startDate?: string | null;
      endDate?: string | null;
      description?: string;
    },
    token?: string
  ): Promise<{ updatedCount: number }> {
    const response = await axios.post(`${API_BASE_URL}/discounts/apply-all`, { discount }, withToken(token));
    return response.data.data || { updatedCount: 0 };
  },

  async removeDiscountFromAll(token?: string): Promise<{ updatedCount: number }> {
    const response = await axios.post(`${API_BASE_URL}/discounts/remove-all`, {}, withToken(token));
    return response.data.data || { updatedCount: 0 };
  },

  async applyBulkDiscount(
    productIds: string[],
    discount: {
      percentage: number;
      startDate?: string | null;
      endDate?: string | null;
      description?: string;
    },
    token?: string
  ): Promise<{ updatedCount: number }> {
    const response = await axios.post(`${API_BASE_URL}/discounts/apply-bulk`, { productIds, discount }, withToken(token));
    return response.data.data || { updatedCount: 0 };
  },

  async removeBulkDiscount(productIds: string[], token?: string): Promise<{ updatedCount: number }> {
    const response = await axios.post(`${API_BASE_URL}/discounts/remove-bulk`, { productIds }, withToken(token));
    return response.data.data || { updatedCount: 0 };
  },
};
