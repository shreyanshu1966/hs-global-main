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
    _id: 'static-marble-dining-table-buying-guide-sizes-edges-finishes',
    title: 'Marble Dining Table Buying Guide: Sizes, Edges & Finishes (2026)',
    slug: 'marble-dining-table-buying-guide-sizes-edges-finishes',
    excerpt:
      'Choose the right marble dining table with confidence. Sizes by seating, edge profiles explained, finish types compared — plus real exporter insights on shipping to USA & UK.',
    content: 'Read the full guide on its dedicated page.',
    author: { name: 'HS Global Export', avatar: '' },
    featuredImage: '/blog/marble-dining-table-buying-guide/hero.png',
    category: 'Marble Furniture',
    tags: [
      'Marble Dining Table',
      'Marble Furniture',
      'Buyer\'s Guide',
      'Interior Design',
      'Home Decor',
    ],
    status: 'published',
    views: 0,
    readTime: 10,
    seo: {
      metaTitle: 'Marble Dining Table Buying Guide: Sizes, Edges & Finishes | HS Global Export',
      metaDescription:
        'Choose the right marble dining table with confidence. Sizes by seating, edge profiles explained, finish types compared — plus real exporter insights on shipping to USA & UK.',
      keywords: [
        'marble dining table buying guide',
        'marble dining table sizes',
        'marble table edge profiles',
        'honed vs polished marble table',
        'marble table finish types',
      ],
    },
    publishedAt: '2026-06-30T10:00:00.000Z',
    createdAt: '2026-06-30T10:00:00.000Z',
    updatedAt: '2026-06-30T10:00:00.000Z',
  },
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
  {
    _id: 'static-importing-marble-furniture-to-usa-shipping-duties-lead-times',
    title: 'Importing Marble Furniture to the USA: Shipping, Duties & Lead Times',
    slug: 'importing-marble-furniture-to-usa-shipping-duties-lead-times',
    excerpt:
      'A manufacturer\'s guide to importing marble furniture into the USA — real production lead times, DDU shipping terms, customs duties, and crating for fragile stone.',
    content: 'Read the full guide on its dedicated page.',
    author: { name: 'HS Global Export', avatar: '' },
    featuredImage: 'https://res.cloudinary.com/dynd1aan0/image/upload/v1779286813/hs-global/furniture/etsy/HSMDTWH5/file_000000001c1c71fbbd46fd584b2887ca.webp',
    category: 'Marble Furniture',
    tags: [
      'Marble Furniture Import',
      'Furniture Exporter India',
      'Marble Furniture Shipping',
      'Import Duties USA',
      'HS Global Export',
    ],
    status: 'published',
    views: 0,
    readTime: 9,
    seo: {
      metaTitle: 'Importing Marble Furniture to the USA: Shipping, Duties & Lead Times | HS Global Export',
      metaDescription:
        'A manufacturer\'s guide to importing marble furniture into the USA — real production lead times, DDU shipping terms, customs duties, and crating for fragile stone.',
      keywords: [
        'importing marble furniture to USA',
        'marble furniture import duties',
        'marble furniture shipping time',
        'marble furniture customs USA',
        'marble furniture exporter India to USA',
        'HTS code marble furniture',
        'DDU marble furniture shipping',
      ],
    },
    publishedAt: '2026-07-22T09:00:00.000Z',
    createdAt: '2026-07-22T09:00:00.000Z',
    updatedAt: '2026-07-22T09:00:00.000Z',
  },
  {
    _id: 'static-granite-vs-marble-furniture-which-lasts-longer',
    title: 'Granite vs Marble Furniture: Which Lasts Longer?',
    slug: 'granite-vs-marble-furniture-which-lasts-longer',
    excerpt:
      'Granite vs marble for furniture, not just countertops — hardness, porosity, and lifespan compared, plus which stone suits dining tables, consoles and bathtubs.',
    content: 'Read the full guide on its dedicated page.',
    author: { name: 'HS Global Export', avatar: '' },
    featuredImage: 'https://res.cloudinary.com/dynd1aan0/image/upload/v1779285557/hs-global/furniture/etsy/HSMBTBL6/4.webp',
    category: 'Marble Furniture',
    tags: [
      'Marble vs Granite',
      'Marble Furniture Durability',
      'Stone Furniture',
      'Marble Care',
      'HS Global Export',
    ],
    status: 'published',
    views: 0,
    readTime: 8,
    seo: {
      metaTitle: 'Granite vs Marble Furniture: Which Lasts Longer? | HS Global Export',
      metaDescription:
        'Granite vs marble for furniture, not just countertops — hardness, porosity, and lifespan compared, plus which stone suits dining tables, consoles and bathtubs.',
      keywords: [
        'granite vs marble furniture',
        'marble furniture durability',
        'granite furniture vs marble furniture',
        'which lasts longer granite or marble',
        'marble dining table durability',
        'marble furniture maintenance',
      ],
    },
    publishedAt: '2026-07-22T09:30:00.000Z',
    createdAt: '2026-07-22T09:30:00.000Z',
    updatedAt: '2026-07-22T09:30:00.000Z',
  },
  {
    _id: 'static-leather-furniture-trends-2026-luxury-homes',
    title: 'Leather Furniture Trends 2026 for Luxury Homes',
    slug: 'leather-furniture-trends-2026-luxury-homes',
    excerpt:
      'The leather furniture trends shaping luxury homes in 2026 — cognac and earth tones, quiet-luxury silhouettes, hand-stitched craftsmanship, and lived-in comfort.',
    content: 'Read the full guide on its dedicated page.',
    author: { name: 'HS Global Export', avatar: '' },
    featuredImage: '/blog/premium-leather-furniture-luxury-interiors/premium-leather-sofa.jpg',
    category: 'Leather Furniture',
    tags: [
      'Leather Furniture Trends',
      'Leather Furniture 2026',
      'Quiet Luxury Interiors',
      'Cognac Leather Sofa',
      'HS Global Export',
    ],
    status: 'published',
    views: 0,
    readTime: 7,
    seo: {
      metaTitle: 'Leather Furniture Trends 2026 for Luxury Homes | HS Global Export',
      metaDescription:
        'The leather furniture trends shaping luxury homes in 2026 — cognac and earth tones, quiet-luxury silhouettes, hand-stitched craftsmanship, and lived-in comfort.',
      keywords: [
        'leather furniture trends 2026',
        'luxury leather furniture trends',
        'cognac leather sofa trend',
        'quiet luxury leather furniture',
        'leather furniture colors 2026',
        'handcrafted leather sofa trends',
      ],
    },
    publishedAt: '2026-07-22T10:00:00.000Z',
    createdAt: '2026-07-22T10:00:00.000Z',
    updatedAt: '2026-07-22T10:00:00.000Z',
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
