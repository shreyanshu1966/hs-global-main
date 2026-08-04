/**
 * Server-side API helpers.
 *
 * Runs on the server (in App Router server components), so it uses `API_URL`
 * (not the Vite `VITE_*`). ISR is controlled per-call via `next.revalidate`.
 */

export const API_URL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'https://api.hsglobalexport.com/api';

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.hsglobalexport.com';
export const SITE_NAME = 'HS Global Export';

export interface ProductSeo {
  metaTitle?: string;
  metaDescription?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  canonicalUrl?: string;
  keywords?: string[];
  h1Tag?: string;
  slug?: string;
}

export interface PageSeoData {
  path: string;
  h1?: string;
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  canonical?: string;
}

export interface CategoryData {
  categoryId: string;
  categoryName: string;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    h1?: string;
    keywords?: string[];
    ogImage?: string;
    canonicalUrl?: string;
  };
}

export interface Product {
  _id?: string;
  productId?: string;
  name: string;
  category?: string;
  subcategory?: string;
  description?: string;
  image?: string;
  images?: string[];
  priceINR?: number;
  available?: boolean;
  status?: string;
  averageRating?: number;
  totalReviews?: number;
  seoTitle?: string;
  seoDescription?: string;
  seo?: ProductSeo;
  updatedAt?: string;
  createdAt?: string;
}

interface ProductDetailResponse {
  success: boolean;
  data?: {
    product: Product;
    relatedProducts?: Product[];
    similarProducts?: Product[];
  };
}

interface ProductListResponse {
  success: boolean;
  data?: Product[] | { products?: Product[] };
  totalPages?: number;
}

const REVALIDATE = 3600; // 1h ISR

export async function getProduct(
  id: string
): Promise<{ product: Product; relatedProducts: Product[]; similarProducts: Product[] } | null> {
  try {
    const res = await fetch(`${API_URL}/products/${encodeURIComponent(id)}`, {
      next: { revalidate: REVALIDATE },
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    const json: ProductDetailResponse = await res.json();
    const product = json.data?.product;
    if (!product || !product.name) return null;
    return {
      product,
      relatedProducts: json.data?.relatedProducts || [],
      similarProducts: json.data?.similarProducts || [],
    };
  } catch {
    return null;
  }
}

export async function getAllProducts(): Promise<Product[]> {
  const all: Product[] = [];
  let page = 1;
  const limit = 200;
  for (let guard = 0; guard < 50; guard++) {
    try {
      const res = await fetch(`${API_URL}/products?limit=${limit}&page=${page}`, {
        next: { revalidate: REVALIDATE },
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) break;
      const json: ProductListResponse = await res.json();
      const batch = Array.isArray(json.data)
        ? json.data
        : (json.data as { products?: Product[] })?.products || [];
      if (!batch.length) break;
      all.push(...batch);
      if (json.totalPages && page >= json.totalPages) break;
      if (batch.length < limit) break;
      page++;
    } catch {
      break;
    }
  }
  return all;
}

export function productUrl(p: Product): string {
  return `/product/${p.productId || p._id}`;
}

export function absoluteImage(image?: string): string {
  if (!image) return `${SITE_URL}/og-image.jpg`;
  return image.startsWith('http') ? image : `${SITE_URL}${image}`;
}

export interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: { name: string; avatar?: string };
  featuredImage?: string;
  category?: string;
  tags?: string[];
  status: 'draft' | 'published' | 'archived';
  views?: number;
  readTime?: number;
  seo?: { metaTitle?: string; metaDescription?: string; keywords?: string[] };
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export async function getBlog(
  slug: string
): Promise<{ blog: Blog; relatedBlogs: Blog[] } | null> {
  try {
    const res = await fetch(`${API_URL}/blogs/${encodeURIComponent(slug)}`, {
      next: { revalidate: REVALIDATE },
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (!json?.blog?.title) return null;
    return { blog: json.blog, relatedBlogs: json.relatedBlogs || [] };
  } catch {
    return null;
  }
}

export async function getAllBlogs(): Promise<Blog[]> {
  const all: Blog[] = [];
  let page = 1;
  for (let guard = 0; guard < 20; guard++) {
    try {
      const res = await fetch(`${API_URL}/blogs?limit=100&page=${page}&status=published`, {
        next: { revalidate: REVALIDATE },
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) break;
      const json = await res.json();
      const batch: Blog[] = json.blogs || [];
      if (!batch.length) break;
      all.push(...batch);
      if (json.totalPages && page >= json.totalPages) break;
      if (batch.length < 100) break;
      page++;
    } catch {
      break;
    }
  }
  return all;
}

// ── PageSeo (static pages + /products listing) ────────────────────────────────

export async function getPageSeo(path: string): Promise<PageSeoData | null> {
  try {
    // Strip leading slash, then re-encode — e.g. "/" → "seo/page/%2F" won't work,
    // so we use a catch-all path param: /api/seo/page/about, /api/seo/page/
    const segment = path.replace(/^\//, '') || '';
    const res = await fetch(`${API_URL}/seo/page/${encodeURIComponent(segment)}`, {
      next: { revalidate: 3600 },
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return (json.data as PageSeoData) ?? null;
  } catch {
    return null;
  }
}

// ── Category SEO ──────────────────────────────────────────────────────────────

export async function getCategorySeo(slug: string): Promise<CategoryData | null> {
  try {
    const res = await fetch(`${API_URL}/categories/${encodeURIComponent(slug)}`, {
      next: { revalidate: 3600 },
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    const json = await res.json();
    // Backend returns { success, data: { category } } or { category }
    return (json.data?.category ?? json.category ?? null) as CategoryData | null;
  } catch {
    return null;
  }
}
