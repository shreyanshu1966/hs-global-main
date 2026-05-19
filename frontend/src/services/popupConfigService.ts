const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface PopupConfig {
  entryPopup: {
    enabled: boolean;
    timerSeconds: number;
    heading: string;
    subheading: string;
    backgroundImage: string;
    couponCode: string;
    discountPercentage: number;
  };
  exitIntent: {
    enabled: boolean;
    heading: string;
    bodyText: string;
    couponCode: string;
    discountPercentage: number;
    expiryDate: string;
  };
  pageToast: {
    enabled: boolean;
    message: string;
    couponCode: string;
    discountPercentage: number;
    expiryDate: string;
    autoDismissSeconds: number;
    showEveryNPages: number;
  };
}

export const DEFAULT_POPUP_CONFIG: PopupConfig = {
  entryPopup: {
    enabled: true,
    timerSeconds: 12,
    heading: 'Premium Stone & Marble',
    subheading: 'Custom bulk orders, marble furniture & exclusive stone collections.',
    backgroundImage: '',
    couponCode: 'HS10',
    discountPercentage: 10,
  },
  exitIntent: {
    enabled: true,
    heading: 'Exclusive Offer For You',
    bodyText: '',
    couponCode: 'HS10',
    discountPercentage: 10,
    expiryDate: '',
  },
  pageToast: {
    enabled: true,
    message: 'Apply at checkout for marble, granite & stone furniture orders.',
    couponCode: 'HS10',
    discountPercentage: 10,
    expiryDate: '',
    autoDismissSeconds: 8,
    showEveryNPages: 3,
  },
};

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const popupConfigService = {
  async getPublicConfig(): Promise<PopupConfig> {
    try {
      const res = await fetch(`${API_URL}/popup-config`);
      if (!res.ok) return { ...DEFAULT_POPUP_CONFIG };
      const data = await res.json();
      if (!data?.success) return { ...DEFAULT_POPUP_CONFIG };
      return { ...DEFAULT_POPUP_CONFIG, ...data.data };
    } catch {
      return { ...DEFAULT_POPUP_CONFIG };
    }
  },

  async getAdminConfig(): Promise<PopupConfig> {
    const res = await fetch(`${API_URL}/admin/popup-config`, { headers: getAuthHeaders() });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to fetch popup config');
    }
    const data = await res.json();
    if (!data?.success) throw new Error(data?.message || 'Failed to fetch popup config');
    return { ...DEFAULT_POPUP_CONFIG, ...data.data };
  },

  async updateAdminConfig(config: PopupConfig): Promise<PopupConfig> {
    const res = await fetch(`${API_URL}/admin/popup-config`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(config),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to update popup config');
    }
    const data = await res.json();
    if (!data?.success) throw new Error(data?.message || 'Failed to update popup config');
    // Notify all components on this page to re-fetch
    window.dispatchEvent(new Event('hs-popup-config-changed'));
    return { ...DEFAULT_POPUP_CONFIG, ...data.data };
  },

  async uploadImage(file: File): Promise<string> {
    const token = localStorage.getItem('authToken');
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch(`${API_URL}/admin/homepage/upload-image`, {
      method: 'POST',
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to upload image');
    }
    const data = await res.json();
    if (!data?.success || !data?.data?.url) throw new Error('Failed to upload image');
    return data.data.url;
  },

  isExpired(expiryDate: string): boolean {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  },

  getExpiryLabel(expiryDate: string): string {
    if (!expiryDate) return '';
    const diff = new Date(expiryDate).getTime() - Date.now();
    if (diff <= 0) return 'Expired';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `Expires in ${days}d ${hours}h`;
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `Expires in ${hours}h ${minutes}m`;
    return `Expires in ${minutes}m`;
  },
};
