import fs from 'fs';
import path from 'path';
import { SitemapStream, streamToPromise } from 'sitemap';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Required for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const hostname = 'https://www.hsglobalexport.com';
const outputPath = path.join(__dirname, 'public', 'sitemap.xml');

const staticUrls = [
  '/',
  '/about',
  '/products',
  '/gallery',
  '/services',
  '/contact'
];

const assetPaths = [
  { type: 'furniture', path: path.join(__dirname, 'src/assets/furnitures') },
  { type: 'collection', path: path.join(__dirname, 'src/assets/Collection') }
];

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/\//g, '-')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function collectProductUrls(baseType, dir, parentSlugs = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const urls = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const slug = slugify(entry.name);
    const newSlugs = [...parentSlugs, slug];

    if (entry.isDirectory()) {
      const subEntries = fs.readdirSync(fullPath, { withFileTypes: true });
      const hasFolders = subEntries.some(e => e.isDirectory());

      if (hasFolders) {
        urls.push(...collectProductUrls(baseType, fullPath, newSlugs));
      } else {
        const fullSlug = [baseType, ...newSlugs].join('-');
        urls.push('/productsinfo/' + fullSlug);
      }
    }
  }

  return urls;
}

async function generateSitemap() {
  const sitemapStream = new SitemapStream({ hostname });

  staticUrls.forEach(url => sitemapStream.write({ url, priority: 1.0 }));

  for (const { type, path: basePath } of assetPaths) {
    const productUrls = collectProductUrls(type, basePath);
    productUrls.forEach(url => sitemapStream.write({ url, priority: 0.8 }));
  }

  sitemapStream.end();
  const xml = await streamToPromise(sitemapStream);

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, xml.toString());

  console.log(`✅ Sitemap generated at ${outputPath}`);
}

generateSitemap().catch(err => console.error('❌ Error generating sitemap:', err));
