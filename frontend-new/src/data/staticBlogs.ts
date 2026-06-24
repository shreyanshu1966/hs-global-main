import type { Blog } from '../services/blogService';

/**
 * Static (non-DB) blog posts.
 *
 * These are hand-authored pages that live as their own Next.js route segments
 * under /app/blog/<slug>/ (NOT seeded into the database). They are surfaced in
 * the /blog listing by merging this array with the DB-fetched blogs.
 *
 * Each entry only needs the fields the listing card reads. The full article is
 * rendered by its dedicated route, so `content` is intentionally a short stub.
 */
export const STATIC_BLOGS: Blog[] = [
  {
    _id: 'static-indian-marble-furniture-luxury-homes',
    title: 'Why Indian Marble Furniture Is the World’s Best Choice for Luxury Homes in 2026',
    slug: 'indian-marble-furniture-luxury-homes',
    excerpt:
      'Discover why handcrafted Indian marble furniture is dominating luxury homes in the USA & UK — from dining tables to coffee tables, with worldwide delivery from HS Global Export.',
    content: 'Read the full guide on its dedicated page.',
    author: { name: 'HS Global Export', avatar: '' },
    featuredImage: '/blog/indian-marble-furniture/hero-marble-dining-table.jpg',
    category: 'Marble Furniture',
    tags: [
      'Marble Furniture',
      'Marble Dining Table',
      'Marble Coffee Table',
      'Luxury Interiors',
      'Indian Marble',
      'Natural Stone',
    ],
    status: 'published',
    views: 0,
    readTime: 12,
    seo: {
      metaTitle: 'Indian Marble Furniture – Luxury Handcrafted Pieces | HS Global Export',
      metaDescription:
        'Discover why handcrafted Indian marble furniture is dominating luxury homes in the USA & UK. Explore custom pieces from HS Global Export — worldwide delivery.',
      keywords: [
        'marble furniture manufacturer India',
        'luxury marble furniture',
        'handcrafted marble furniture exporter',
        'Indian marble furniture export USA',
      ],
    },
    publishedAt: '2026-06-22T08:00:00.000Z',
    createdAt: '2026-06-22T08:00:00.000Z',
    updatedAt: '2026-06-22T08:00:00.000Z',
  },
];

/** Static blogs whose title/excerpt/tags/category match the active filters. */
export function filterStaticBlogs(category?: string, search?: string): Blog[] {
  const q = search?.trim().toLowerCase();
  return STATIC_BLOGS.filter((b) => {
    if (category && b.category !== category) return false;
    if (q) {
      const haystack = [b.title, b.excerpt, b.category, ...(b.tags || [])]
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
}
