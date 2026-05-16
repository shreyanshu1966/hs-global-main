/**
 * Cloudflare Worker — HS Global Export
 * Injects correct <title>, <meta description>, and OG/Twitter tags
 * for every page before it reaches the user or any bot/crawler.
 *
 * Deploy: Cloudflare Dashboard → Workers → Create → paste this file
 * Route:  hsglobalexport.com/* and www.hsglobalexport.com/*
 */

const SITE_NAME = 'HS Global Export';
const SITE_URL = 'https://www.hsglobalexport.com';
const DEFAULT_IMAGE = `${SITE_URL}/og-image.jpg`;
const API_BASE = 'https://api.hsglobalexport.com/api';

// ── Static page meta map ────────────────────────────────────────────────────
const STATIC_META = {
  '/': {
    title: 'HS Global Export : Premium Granite & Marble Solutions - Handcrafted Products Manufacturers with Free Delivery | USA | UK',
    description: 'Hs Global Export – Best marble furniturers offering premium granite & marble solutions. Handcrafted products with free delivery to USA & UK and across world',
    image: DEFAULT_IMAGE,
  },
  '/about': {
    title: 'Best Marble Sink, Marble Decor, Granite Sink, Tiles - USA, UK and Across Worldwide',
    description: 'HS Global Export offers premium marble sinks, granite sinks, tiles, and marble décor, supplying high-quality natural stone products across the USA, UK, and worldwide.',
    image: DEFAULT_IMAGE,
  },
  '/products': {
    title: 'Best Marble & Granite Company at USA, UK and Across Worldwide - Hs Global Export',
    description: 'Explore our range of premium granite stones, tiles, marble & slabs at Marble Centre. Discover high-quality imported marble, crafted to perfection for various application needs. Custom Order.',
    image: DEFAULT_IMAGE,
  },
  '/gallery': {
    title: 'Best Luxury & Imported Marble Stones Gallery - Hs Global Export',
    description: 'HS Global Export presents a premium gallery of luxury and imported marble stones, offering high-quality natural stone collections crafted for elegant residential and commercial applications worldwide.',
    image: DEFAULT_IMAGE,
  },
  '/services': {
    title: 'Shipping - Global Stone Logistics | HS Global Export',
    description: 'Worldwide shipping for granite and marble: export logistics, secure packaging, customs support, and reliable delivery for stone products.',
    image: DEFAULT_IMAGE,
  },
  '/blog': {
    title: 'Blog - HS Global Export | Industry Insights & Updates',
    description: 'Stay updated with the latest industry news, design trends, and product updates from HS Global Export.',
    image: DEFAULT_IMAGE,
  },
  '/contact': {
    title: 'Contact Us - Get in Touch | HS Global Export',
    description: 'Contact HS Global Export for premium granite and marble solutions. Reach us at +91 81071 15116 or inquiry@hsglobalexport.com. Corporate office in Ahmedabad, factory in Rajasthan.',
    image: DEFAULT_IMAGE,
  },
};

// ── Fetch product meta from VPS API ────────────────────────────────────────
async function fetchProductMeta(productId) {
  try {
    const res = await fetch(`${API_BASE}/products/${productId}`, {
      headers: { 'Accept': 'application/json' },
      cf: { cacheTtl: 300, cacheEverything: true }, // cache 5 min at edge
    });

    if (!res.ok) return null;

    const data = await res.json();

    // API response shape: { success: true, data: { product: {...}, relatedProducts: [], similarProducts: [] } }
    const product = data.data?.product;

    if (!product || !product.name) return null;

    const name = product.name;
    const category = product.category || 'marble';
    const image = product.seo?.ogImage || product.image || DEFAULT_IMAGE;
    const absoluteImage = image.startsWith('http') ? image : `${SITE_URL}${image}`;

    return {
      title: product.seo?.metaTitle || product.seoTitle || `${name} | ${SITE_NAME}`,
      description: product.seo?.metaDescription || product.seoDescription ||
        `Buy ${name} — premium ${category} product from ${SITE_NAME}. Global shipping to USA, UK and worldwide.`,
      image: absoluteImage,
      canonicalUrl: product.seo?.canonicalUrl || `${SITE_URL}/products/${productId}`,
    };
  } catch {
    return null;
  }
}

// ── HTMLRewriter handlers ───────────────────────────────────────────────────
class TitleRewriter {
  constructor(newTitle) {
    this.newTitle = newTitle;
    this.replaced = false;
  }
  text(text) {
    if (!this.replaced) {
      text.replace(this.newTitle);
      this.replaced = true;
    } else {
      text.replace('');
    }
  }
}

class MetaRewriter {
  constructor(attribute, newValue) {
    this.attribute = attribute;
    this.newValue = newValue;
  }
  element(element) {
    element.setAttribute(this.attribute, this.newValue);
  }
}

// ── Inject meta into HTML response ─────────────────────────────────────────
function injectMeta(response, meta) {
  const { title, description, image, canonicalUrl } = meta;
  const ogUrl = canonicalUrl || SITE_URL;

  return new HTMLRewriter()
    // <title>
    .on('title', new TitleRewriter(title))
    // <meta name="description">
    .on('meta[name="description"]', new MetaRewriter('content', description))
    // Open Graph
    .on('meta[property="og:title"]', new MetaRewriter('content', title))
    .on('meta[property="og:description"]', new MetaRewriter('content', description))
    .on('meta[property="og:image"]', new MetaRewriter('content', image))
    .on('meta[property="og:url"]', new MetaRewriter('content', ogUrl))
    // Twitter
    .on('meta[name="twitter:title"]', new MetaRewriter('content', title))
    .on('meta[name="twitter:description"]', new MetaRewriter('content', description))
    .on('meta[name="twitter:image"]', new MetaRewriter('content', image))
    .on('meta[name="twitter:url"]', new MetaRewriter('content', ogUrl))
    .transform(response);
}

// ── Main handler ────────────────────────────────────────────────────────────
async function handleRequest(request) {
  const url = new URL(request.url);
  const pathname = url.pathname.replace(/\/$/, '') || '/'; // strip trailing slash

  // Fetch the original response from origin (GoDaddy)
  const originResponse = await fetch(request);

  // Only process HTML pages
  const contentType = originResponse.headers.get('content-type') || '';
  if (!contentType.includes('text/html')) {
    return originResponse;
  }

  let meta = null;

  // 1. Check static pages first
  if (STATIC_META[pathname]) {
    meta = { ...STATIC_META[pathname], canonicalUrl: `${SITE_URL}${pathname}` };
  }

  // 2. Dynamic product detail page: /products/<id>
  else if (/^\/products\/(.+)$/.test(pathname)) {
    const productId = pathname.match(/^\/products\/(.+)$/)[1];
    meta = await fetchProductMeta(productId);
  }

  // 3. Blog detail page: /blog/<slug>
  else if (/^\/blog\/(.+)$/.test(pathname)) {
    // Blog pages use their own title from the page — fall through with no injection
    meta = null;
  }

  // No meta found — return origin response unchanged
  if (!meta) return originResponse;

  return injectMeta(originResponse, meta);
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});
