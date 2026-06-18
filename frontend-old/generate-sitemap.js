import fs from 'fs';
import path from 'path';
import { SitemapStream, streamToPromise } from 'sitemap';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Required for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const hostname = 'https://www.hsglobalexport.com';
const API_BASE = process.env.SITEMAP_API_BASE || 'https://api.hsglobalexport.com/api';
const outputPath = path.join(__dirname, 'public', 'sitemap.xml');

// Static, indexable routes (auth/cart/admin pages are intentionally excluded).
const staticUrls = [
  { url: '/', priority: 1.0, changefreq: 'weekly' },
  { url: '/about', priority: 0.7, changefreq: 'monthly' },
  { url: '/products', priority: 0.9, changefreq: 'weekly' },
  { url: '/gallery', priority: 0.7, changefreq: 'monthly' },
  { url: '/shipping', priority: 0.6, changefreq: 'monthly' },
  { url: '/blog', priority: 0.6, changefreq: 'weekly' },
  { url: '/contact', priority: 0.5, changefreq: 'monthly' },
];

async function fetchJson(url) {
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`);
  return res.json();
}

// Pull every product from the API (paginate defensively).
async function fetchAllProducts() {
  const all = [];
  let page = 1;
  const limit = 200;
  // Hard stop so a misbehaving API can never spin forever.
  for (let guard = 0; guard < 50; guard++) {
    const data = await fetchJson(`${API_BASE}/products?limit=${limit}&page=${page}`);
    const batch = Array.isArray(data.data) ? data.data : (data.data?.products || []);
    if (!batch.length) break;
    all.push(...batch);
    const totalPages = data.totalPages || data.pagination?.totalPages;
    if (totalPages && page >= totalPages) break;
    if (batch.length < limit) break;
    page++;
  }
  return all;
}

async function fetchAllBlogs() {
  try {
    const data = await fetchJson(`${API_BASE}/blogs?limit=500`);
    return Array.isArray(data.blogs) ? data.blogs : (data.data?.blogs || data.data || []);
  } catch {
    return [];
  }
}

async function generateSitemap() {
  const sitemapStream = new SitemapStream({ hostname });
  const seen = new Set();

  const write = (entry) => {
    if (seen.has(entry.url)) return;
    seen.add(entry.url);
    sitemapStream.write(entry);
  };

  // 1. Static pages
  staticUrls.forEach(write);

  // 2. Products + category pages
  let products = [];
  try {
    products = await fetchAllProducts();
  } catch (err) {
    console.error('⚠️  Could not fetch products, sitemap will only contain static URLs:', err.message);
  }

  const categories = new Set();
  for (const p of products) {
    const id = p.productId || p._id;
    if (!id) continue;
    if (p.available === false || p.status === 'draft') continue; // don't list hidden products
    write({
      url: `/product/${id}`,
      priority: 0.8,
      changefreq: 'weekly',
      lastmod: p.updatedAt || p.createdAt || undefined,
    });
    if (p.category) categories.add(p.category);
  }

  // 3. Category listing pages (/products/<category>)
  for (const cat of categories) {
    write({ url: `/products/${cat}`, priority: 0.7, changefreq: 'weekly' });
  }

  // 4. Blog posts
  const blogs = await fetchAllBlogs();
  for (const b of blogs) {
    const slug = b.slug || b._id;
    if (!slug) continue;
    write({
      url: `/blog/${slug}`,
      priority: 0.6,
      changefreq: 'monthly',
      lastmod: b.updatedAt || b.publishedAt || b.createdAt || undefined,
    });
  }

  sitemapStream.end();
  const xml = await streamToPromise(sitemapStream);

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, xml.toString());

  console.log(`✅ Sitemap generated at ${outputPath}`);
  console.log(`   ${products.length} products, ${categories.size} categories, ${blogs.length} blogs, ${seen.size} total URLs`);
}

generateSitemap().catch((err) => {
  // Never fail the build over the sitemap — log and continue.
  console.error('⚠️  Sitemap generation failed (continuing build):', err.message);
});
