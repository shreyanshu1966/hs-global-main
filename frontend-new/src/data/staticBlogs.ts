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
  {
    _id: 'static-wooden-furniture-guide',
    title: 'Wooden Furniture: The Complete Guide to Timeless Artisan Pieces for Your Home',
    slug: 'wooden-furniture-guide',
    excerpt:
      'Discover the beauty of wooden furniture. Learn how to choose, care for, and buy quality handmade wooden furniture for every room.',
    content: 'Read the full guide on its dedicated page.',
    author: { name: 'HS Global Export', avatar: '' },
    featuredImage: '/blog/wooden-furniture-guide/handcrafted-teak-dining-table.jpg',
    category: 'Wooden Furniture',
    tags: [
      'Wooden Furniture',
      'Handmade Wooden Furniture',
      'Artisan Furniture',
      'Custom Wood Furniture',
      'Sustainable Wooden Furniture',
      'Wooden Furniture India',
    ],
    status: 'published',
    views: 0,
    readTime: 10,
    seo: {
      metaTitle: 'Wooden Furniture Guide: Artisan, Handmade & Custom Wood Pieces',
      metaDescription:
        'Discover the beauty of wooden furniture. Learn how to choose, care for, and buy quality handmade wooden furniture for every room.',
      keywords: [
        'wooden furniture',
        'handmade wooden furniture',
        'artisan furniture',
        'custom wood furniture',
        'sustainable wooden furniture',
        'wooden furniture India',
      ],
    },
    publishedAt: '2026-06-25T14:00:00.000Z',
    createdAt: '2026-06-25T14:00:00.000Z',
    updatedAt: '2026-06-25T14:00:00.000Z',
  },
  {
    _id: 'static-premium-leather-furniture-luxury-interiors',
    title: 'Premium Leather Furniture for Modern Luxury Interiors | HS Global Export',
    slug: 'premium-leather-furniture-luxury-interiors',
    excerpt:
      'Discover handcrafted luxury leather furniture including sofas, armchairs, beds, tables, and storage solutions designed for sophisticated living worldwide.',
    content: 'Read the full guide on its dedicated page.',
    author: { name: 'HS Global Export', avatar: '' },
    featuredImage: '/blog/premium-leather-furniture-luxury-interiors/premium-leather-sofa.jpg',
    category: 'Leather Furniture',
    tags: [
      'Leather Furniture',
      'Luxury Leather Sofa',
      'Leather Armchairs',
      'Premium Interiors',
      'Leather Beds',
      'HS Global Export',
    ],
    status: 'published',
    views: 0,
    readTime: 8,
    seo: {
      metaTitle: 'Premium Leather Furniture: Modern Luxury Interiors | HS Global Export',
      metaDescription:
        'Discover handcrafted luxury leather furniture including sofas, armchairs, beds, coffee tables, dressers, mirrors, and storage solutions by HS Global Export.',
      keywords: [
        'premium leather furniture',
        'luxury leather sofas',
        'handcrafted leather bed',
        'leather furniture manufacturer',
        'leather side table',
        'leather console table',
      ],
    },
    publishedAt: '2026-06-25T15:00:00.000Z',
    createdAt: '2026-06-25T15:00:00.000Z',
    updatedAt: '2026-06-25T15:00:00.000Z',
  },
  {
    _id: 'static-semi-precious-stone-slabs-luxury-interiors',
    title: 'Luxury Semi Precious Stone Slabs for Premium Interior Applications | HS Global Export',
    slug: 'semi-precious-stone-slabs-luxury-interiors',
    excerpt:
      'Semi precious stone slabs represent the perfect blend of natural artistry, exclusivity, and luxury for statement interior applications worldwide.',
    content: 'Read the full guide on its dedicated page.',
    author: { name: 'HS Global Export', avatar: '' },
    featuredImage: '/blog/semi-precious-stone-slabs-luxury-interiors/semi-precious-stone-slabs.png',
    category: 'Semi Precious Stone',
    tags: [
      'Semi Precious Stone',
      'Agate Slabs',
      'Amethyst Slabs',
      'Luxury Interiors',
      'Gemstone Slabs',
      'HS Global Export',
    ],
    status: 'published',
    views: 0,
    readTime: 9,
    seo: {
      metaTitle: 'Luxury Semi Precious Stone Slabs | HS Global Export',
      metaDescription:
        'Discover HS Global Export\'s premium semi precious stone slabs including Agate, Amethyst, Quartz, Amazonite, Jasper, Tiger Eye, Mother of Pearl, and Petrified Wood.',
      keywords: [
        'Semi Precious Stone Slabs',
        'agate slabs',
        'amethyst slabs',
        'gemstone slabs manufacturer',
        'tiger eye slabs',
        'mother of pearl slabs',
        'petrified wood slabs',
      ],
    },
    publishedAt: '2026-06-25T16:00:00.000Z',
    createdAt: '2026-06-25T16:00:00.000Z',
    updatedAt: '2026-06-25T16:00:00.000Z',
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
