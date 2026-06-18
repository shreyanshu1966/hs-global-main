/**
 * Build-time prerender (landing + category pages only)
 *
 * Runs AFTER `vite build`. Serves the built `dist/` locally, drives the real
 * app in headless Chrome, and writes fully-rendered HTML for the handful of
 * marketing/landing routes to `dist/<route>/index.html`. The SPA still boots
 * and takes over for real users.
 *
 * Product detail pages are NOT prerendered here — the Cloudflare Worker injects
 * their SEO content into #root at the edge from live API data (always fresh,
 * zero build cost). See cloudflare/worker.js.
 *
 * Never fails the build: if Chrome can't launch, it logs and exits 0.
 */
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DIST = path.join(__dirname, 'dist');
const API_BASE = process.env.SITEMAP_API_BASE || 'https://api.hsglobalexport.com/api';
const PORT = 5055;

const STATIC_ROUTES = ['/', '/about', '/products', '/gallery', '/shipping', '/contact'];

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml',
};

function startServer() {
  const indexHtml = fs.readFileSync(path.join(DIST, 'index.html'));
  const server = http.createServer((req, res) => {
    const urlPath = decodeURIComponent(req.url.split('?')[0]);
    const filePath = path.join(DIST, urlPath);
    if (urlPath !== '/' && fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      res.setHeader('Content-Type', MIME[path.extname(filePath)] || 'application/octet-stream');
      res.end(fs.readFileSync(filePath));
    } else {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end(indexHtml);
    }
  });
  return new Promise((resolve) => server.listen(PORT, () => resolve(server)));
}

async function fetchCategories() {
  try {
    const res = await fetch(`${API_BASE}/products?limit=1000`, { headers: { Accept: 'application/json' } });
    if (!res.ok) return [];
    const data = await res.json();
    const list = Array.isArray(data.data) ? data.data : (data.data?.products || []);
    return [...new Set(list.map((p) => p.category).filter(Boolean))];
  } catch {
    return [];
  }
}

function writeRoute(route, html) {
  const dir = route === '/' ? DIST : path.join(DIST, route);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html);
}

async function run() {
  let puppeteer;
  try {
    puppeteer = (await import('puppeteer')).default;
  } catch {
    console.warn('⚠️  puppeteer not installed — skipping prerender (run `npm i -D puppeteer`).');
    return;
  }

  const categories = await fetchCategories();
  const routes = [...STATIC_ROUTES, ...categories.map((c) => `/products/${c}`)];

  const server = await startServer();
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        // Build-time only: lets the headless page call the production API from
        // localhost without being blocked by CORS (never served to real users).
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
      ],
    });
  } catch (err) {
    console.warn('⚠️  Could not launch headless Chrome — skipping prerender:', err.message);
    server.close();
    return;
  }

  let ok = 0;
  for (const route of routes) {
    const page = await browser.newPage();
    try {
      await page.setViewport({ width: 1366, height: 900 });
      await page.goto(`http://localhost:${PORT}${route}`, { waitUntil: 'networkidle0', timeout: 45000 });
      await page.waitForSelector('main, h1, #root > *', { timeout: 15000 }).catch(() => {});
      await page
        .waitForFunction(
          () => {
            const t = document.body.innerText || '';
            return !(/\bloading\b/i.test(t) && t.length < 1500) && t.length > 400;
          },
          { timeout: 12000, polling: 300 }
        )
        .catch(() => {});
      await new Promise((r) => setTimeout(r, 600));
      writeRoute(route, await page.content());
      ok++;
      console.log(`✓ prerendered ${route}`);
    } catch (err) {
      console.warn(`✗ failed ${route}: ${err.message}`);
    } finally {
      await page.close();
    }
  }

  await browser.close();
  server.close();
  console.log(`\n✅ Prerendered ${ok}/${routes.length} landing/category routes.`);
}

run().catch((err) => {
  console.warn('⚠️  Prerender skipped (continuing):', err.message);
});
