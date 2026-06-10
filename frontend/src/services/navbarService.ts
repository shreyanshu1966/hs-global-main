const API_BASE = `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/navbar`;

export interface NavItem {
  id: string;
  label: string;
  slug: string;
}

export interface NavSection {
  id: string;
  title: string;
  items: NavItem[];
}

export interface NavCategoryConfig {
  categoryId: string;
  categoryName: string;
  sections: NavSection[];
}

const authHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const fetchNavbarConfig = async (): Promise<Record<string, NavCategoryConfig>> => {
  try {
    const res = await fetch(`${API_BASE}/config`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.success ? (data.data as Record<string, NavCategoryConfig>) : {};
  } catch {
    return {};
  }
};

export const saveNavbarConfig = async (
  categoryId: string,
  payload: { categoryName: string; sections: NavSection[] }
): Promise<NavCategoryConfig> => {
  const res = await fetch(`${API_BASE}/config/${encodeURIComponent(categoryId)}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to save');
  return data.data as NavCategoryConfig;
};

/** Convert a display label to a URL-safe slug */
export const labelToSlug = (label: string): string =>
  label.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
