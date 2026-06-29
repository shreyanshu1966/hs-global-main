import type { MetadataRoute } from 'next';
import { getAllProducts, getAllBlogs, SITE_URL } from '@/server/api';
import { STATIC_BLOGS } from '@/data/staticBlogs';
import galaryDetails from '@/static/galaryDetail';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, blogs] = await Promise.all([getAllProducts(), getAllBlogs()]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/products`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/about`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/gallery`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/shipping`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/blog`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${SITE_URL}/contact`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/privacy`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE_URL}/terms`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE_URL}/cookies`, changeFrequency: 'yearly', priority: 0.2 },
  ];

  const categories = [...new Set(products.map((p) => p.category).filter(Boolean))];
  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${SITE_URL}/products/${c}`,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const productRoutes: MetadataRoute.Sitemap = products
    .filter((p) => p.available !== false && p.status !== 'draft')
    .map((p) => ({
      url: `${SITE_URL}/product/${p.productId || p._id}`,
      lastModified: p.updatedAt || p.createdAt,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

  const blogRoutes: MetadataRoute.Sitemap = blogs
    .filter((b) => b.status === 'published')
    .map((b) => ({
      url: `${SITE_URL}/blog/${b.slug}`,
      lastModified: b.updatedAt || b.publishedAt,
      changeFrequency: 'monthly',
      priority: 0.6,
    }));

  // Hand-authored static blog routes (not DB-seeded), so they must be added
  // to the sitemap explicitly — getAllBlogs() only returns DB blogs.
  const dbBlogSlugs = new Set(blogs.map((b) => b.slug));
  const staticBlogRoutes: MetadataRoute.Sitemap = STATIC_BLOGS
    .filter((b) => b.status === 'published' && !dbBlogSlugs.has(b.slug))
    .map((b) => ({
      url: `${SITE_URL}/blog/${b.slug}`,
      lastModified: b.updatedAt || b.publishedAt,
      changeFrequency: 'monthly',
      priority: 0.7,
    }));

  const galleryRoutes: MetadataRoute.Sitemap = galaryDetails.map((d) => ({
    url: `${SITE_URL}/gallery/${d.id}`,
    changeFrequency: 'yearly',
    priority: 0.4,
  }));

  return [
    ...staticRoutes,
    ...categoryRoutes,
    ...productRoutes,
    ...blogRoutes,
    ...staticBlogRoutes,
    ...galleryRoutes,
  ];
}
