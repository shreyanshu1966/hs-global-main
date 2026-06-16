'use client';
import { API_BASE_URL } from '../../../config';

const baseUrl = API_BASE_URL.endsWith('/api') ? API_BASE_URL : `${API_BASE_URL}/api`;

export const buildApiUrl = (endpoint: string): string => `${baseUrl}${endpoint}`;

export async function requestJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(buildApiUrl(endpoint), {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}
