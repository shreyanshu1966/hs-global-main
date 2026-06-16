/**
 * import-seo-sheet.js
 *
 * Imports the curated SEO sheet ("Live Website HS Global Export") into the DB:
 *   - Products  → Product.seo.{metaTitle, metaDescription, ogTitle, ogImage, keywords[], canonicalUrl, ...}
 *   - Categories→ Category.seo.{metaTitle, metaDescription, h1, keywords[], ogImage, canonicalUrl}
 *   - Static    → PageSeo collection (keyed by path: /, /about, /gallery, /contact, /blog, /shipping, /products)
 *   - Slug moves→ Redirect collection (from → to, 301)
 *
 * SAFE BY DEFAULT: dry-run only. Nothing is written unless you pass --apply.
 *
 * ── Usage ────────────────────────────────────────────────────────────────────
 *
 *  LOCAL DB (default):
 *    node scripts/import-seo-sheet.js                        # dry-run
 *    node scripts/import-seo-sheet.js --apply                # write to local DB
 *    node scripts/import-seo-sheet.js --apply --no-slug      # skip slug renames
 *
 *  LIVE SERVER DB (set LIVE_MONGODB_URI in .env first):
 *    node scripts/import-seo-sheet.js --live                 # dry-run against live DB
 *    node scripts/import-seo-sheet.js --live --apply         # write to live DB
 *    node scripts/import-seo-sheet.js --live --apply --no-slug
 *
 *  CUSTOM URI (pass directly, useful on the server itself):
 *    node scripts/import-seo-sheet.js --uri "mongodb://127.0.0.1:27017/hs_global_export"
 *    node scripts/import-seo-sheet.js --uri "mongodb://127.0.0.1:27017/hs_global_export" --apply
 *
 *  CUSTOM CSV path:
 *    node scripts/import-seo-sheet.js --csv "/path/to/sheet.csv" --apply
 * ─────────────────────────────────────────────────────────────────────────────
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

const Product = require('../models/Product');
const Category = require('../models/Category');

// ── Args ─────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const APPLY    = args.includes('--apply');
const DO_SLUGS = !args.includes('--no-slug');
const USE_LIVE = args.includes('--live');       // use LIVE_MONGODB_URI from .env

const csvArgIdx = args.indexOf('--csv');
const CSV_PATH =
  csvArgIdx !== -1
    ? args[csvArgIdx + 1]
    : path.resolve(__dirname, '../../All in One HSGlobal & Etsy Data Update - Live Website HS Global Export.csv');

const uriArgIdx = args.indexOf('--uri');
const URI_OVERRIDE = uriArgIdx !== -1 ? args[uriArgIdx + 1] : null;  // --uri "mongodb+srv://..."

const SITE = 'https://www.hsglobalexport.com';

// Column indices in the sheet (header row: url,New Url,H1 Tag,Title,Desc,Keyword, ,IMg URL 2,,Canonical Tag)
const COL = { url: 0, newUrl: 1, h1: 2, title: 3, desc: 4, keyword: 5, img: 7, canonical: 9 };

// Map the legacy "/services" page to the current "/shipping" route.
const STATIC_PATHS = new Set(['/', '/about', '/gallery', '/services', '/shipping', '/contact', '/blog']);
const STATIC_REMAP = { '/services': '/shipping' };

// ── Inline models for the new collections ───────────────────────────────────
const PageSeo =
  mongoose.models.PageSeo ||
  mongoose.model(
    'PageSeo',
    new mongoose.Schema(
      {
        path: { type: String, unique: true, required: true },
        h1: String,
        title: String,
        description: String,
        keywords: [String],
        image: String,
        canonical: String,
      },
      { timestamps: true }
    )
  );

const Redirect =
  mongoose.models.Redirect ||
  mongoose.model(
    'Redirect',
    new mongoose.Schema(
      {
        from: { type: String, unique: true, required: true }, // path, e.g. /product/old-slug
        to: { type: String, required: true }, // path, e.g. /product/new-slug
        code: { type: Number, default: 301 },
      },
      { timestamps: true }
    )
  );

// ── Helpers ──────────────────────────────────────────────────────────────────
const clean = (s) => (s == null ? '' : String(s).replace(/ /g, ' ').trim());
const pathFromUrl = (u) => {
  const p = clean(u).replace(/^https?:\/\/(www\.)?hsglobalexport\.com/i, '').replace(/\/+$/, '');
  return p || '/';
};
const productSlug = (p) => {
  const m = p.match(/^\/product\/(.+)$/);
  return m ? m[1] : null;
};
const toKeywords = (s) =>
  clean(s)
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean);

function buildSeo(row, canonicalPath) {
  const seo = {};
  const title = clean(row[COL.title]);
  const desc  = clean(row[COL.desc]);
  const img   = clean(row[COL.img]);

  if (title) {
    seo.metaTitle        = title;
    seo.ogTitle          = title;   // Product.seo has separate ogTitle field
    seo.twitterTitle     = title;
  }
  if (desc) {
    seo.metaDescription  = desc;
    seo.ogDescription    = desc;    // Product.seo has separate ogDescription field
    seo.twitterDescription = desc;
  }
  if (clean(row[COL.h1])) seo.h1Tag = clean(row[COL.h1]);
  const kw = toKeywords(row[COL.keyword]);
  if (kw.length) seo.keywords = kw;
  if (img) {
    seo.ogImage      = img;
    seo.twitterImage = img;         // Product.seo has separate twitterImage field
  }
  seo.canonicalUrl = `${SITE}${canonicalPath}`;
  return seo;
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  if (!fs.existsSync(CSV_PATH)) {
    console.error('CSV not found:', CSV_PATH);
    process.exit(1);
  }
  const raw = fs.readFileSync(CSV_PATH, 'utf8');
  const rows = parse(raw, { relax_column_count: true, skip_empty_lines: false });

  // Only rows whose first column is a real site URL (skips the 2 header rows + blanks).
  const dataRows = rows.filter((r) => /hsglobalexport\.com/i.test(clean(r[COL.url])));

  // ── Resolve MongoDB URI ─────────────────────────────────────────────────────
  const mongoUri =
    URI_OVERRIDE ||
    (USE_LIVE
      ? process.env.LIVE_MONGODB_URI || (() => { throw new Error('LIVE_MONGODB_URI is not set in .env'); })()
      : process.env.MONGODB_URI || 'mongodb://localhost:27017/hs_global_export');

  const target = USE_LIVE ? '🌍 LIVE SERVER' : URI_OVERRIDE ? '🎯 CUSTOM URI' : '💻 LOCAL';
  console.log(`\n${target}  →  ${mongoUri.replace(/:([^@]+)@/, ':****@')}`);

  await mongoose.connect(mongoUri);
  console.log(`\nConnected. Mode: ${APPLY ? 'APPLY (writing)' : 'DRY-RUN (no writes)'} · slug changes: ${DO_SLUGS ? 'ON' : 'OFF'}`);
  console.log(`Sheet rows with a URL: ${dataRows.length}\n`);

  // Preload products for fast lookup + collision checks.
  const allProducts = await Product.find({}, 'productId').lean();
  const existingIds = new Set(allProducts.map((p) => p.productId));

  const report = {
    productUpdated: 0,
    productUnmatched: [],
    slugChanged: 0,
    slugCollision: [],
    categoryUpdated: 0,
    categoryUnmatched: [],
    pageSeoUpserted: 0,
    redirects: 0,
  };

  for (const row of dataRows) {
    const curPath = pathFromUrl(row[COL.url]);
    const newPath = clean(row[COL.newUrl]) ? pathFromUrl(row[COL.newUrl]) : curPath;

    // ── Product ──────────────────────────────────────────────────────────────
    if (curPath.startsWith('/product/')) {
      const curSlug = productSlug(curPath);
      // Check product exists without loading the whole doc
      if (!existingIds.has(curSlug)) {
        report.productUnmatched.push(curSlug);
        continue;
      }

      let canonicalPath = curPath;
      let newSlug = null;

      if (DO_SLUGS && newPath !== curPath && newPath.startsWith('/product/')) {
        newSlug = productSlug(newPath);
        if (newSlug && newSlug !== curSlug && existingIds.has(newSlug)) {
          report.slugCollision.push(`${curSlug} → ${newSlug} (taken)`);
          newSlug = null;
        }
      }
      if (newSlug) canonicalPath = `/product/${newSlug}`;

      const seo = buildSeo(row, canonicalPath);

      if (APPLY) {
        // Build $set payload using dot-notation to ONLY touch seo.* fields
        // (avoids loading / re-validating required fields like image)
        const $set = {};
        for (const [k, v] of Object.entries(seo)) {
          $set[`seo.${k}`] = v;
        }
        if (newSlug) {
          $set['seo.slug'] = newSlug;
          $set['productId']  = newSlug;
        }
        await Product.updateOne({ productId: curSlug }, { $set });

        if (newSlug) {
          await Redirect.updateOne(
            { from: `/product/${curSlug}` },
            { $set: { to: `/product/${newSlug}`, code: 301 } },
            { upsert: true }
          );
        }
      }

      if (newSlug) {
        existingIds.delete(curSlug);
        existingIds.add(newSlug);
        report.slugChanged++;
        report.redirects++;
      }
      report.productUpdated++;
      continue;
    }

    // ── Category / products listing ───────────────────────────────────────────
    if (curPath === '/products' || curPath.startsWith('/products/')) {
      if (curPath === '/products') {
        const seo = buildSeo(row, '/products');
        if (APPLY)
          await PageSeo.updateOne(
            { path: '/products' },
            { $set: { path: '/products', title: seo.metaTitle, description: seo.metaDescription, h1: seo.h1Tag, keywords: seo.keywords, image: seo.ogImage, canonical: seo.canonicalUrl } },
            { upsert: true }
          );
        report.pageSeoUpserted++;
        continue;
      }
      const catSlug = curPath.replace('/products/', '').split('/')[0];
      const cat = await Category.findOne({ $or: [{ categoryId: catSlug }, { categoryName: new RegExp(`^${catSlug}$`, 'i') }] });
      if (!cat) {
        report.categoryUnmatched.push(catSlug);
        continue;
      }
      const seo = buildSeo(row, curPath);
      if (APPLY) {
        await Category.updateOne({ _id: cat._id }, { $set: { seo } }, { strict: false });
      }
      report.categoryUpdated++;
      continue;
    }

    // ── Static page ───────────────────────────────────────────────────────────
    if (STATIC_PATHS.has(curPath)) {
      const targetPath = STATIC_REMAP[curPath] || curPath;
      const seo = buildSeo(row, targetPath);
      if (APPLY) {
        await PageSeo.updateOne(
          { path: targetPath },
          { $set: { path: targetPath, title: seo.metaTitle, description: seo.metaDescription, h1: seo.h1Tag, keywords: seo.keywords, image: seo.ogImage, canonical: seo.canonicalUrl } },
          { upsert: true }
        );
        if (STATIC_REMAP[curPath]) {
          await Redirect.updateOne({ from: curPath }, { $set: { to: targetPath, code: 301 } }, { upsert: true });
        }
      }
      report.pageSeoUpserted++;
      continue;
    }
  }

  // ── Report ───────────────────────────────────────────────────────────────────
  console.log('──────────── REPORT ────────────');
  console.log(`Products updated:     ${report.productUpdated}`);
  console.log(`  slug changes:       ${report.slugChanged}`);
  console.log(`  slug collisions:    ${report.slugCollision.length}`);
  console.log(`  unmatched slugs:    ${report.productUnmatched.length}`);
  console.log(`Categories updated:   ${report.categoryUpdated}  (unmatched: ${report.categoryUnmatched.length})`);
  console.log(`PageSeo upserted:     ${report.pageSeoUpserted}`);
  console.log(`Redirects:            ${report.redirects}`);
  if (report.productUnmatched.length)
    console.log(`\nUnmatched product slugs (in sheet, not in DB):\n  ${report.productUnmatched.slice(0, 20).join('\n  ')}${report.productUnmatched.length > 20 ? '\n  …' : ''}`);
  if (report.slugCollision.length) console.log(`\nSlug collisions (kept old slug):\n  ${report.slugCollision.join('\n  ')}`);
  if (report.categoryUnmatched.length) console.log(`\nUnmatched categories:\n  ${report.categoryUnmatched.join(', ')}`);
  console.log('────────────────────────────────');
  console.log(APPLY ? '✅ Changes written.' : '🔎 Dry-run only — re-run with --apply to write (after a mongodump backup).');

  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error('❌ Import failed:', err);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});
