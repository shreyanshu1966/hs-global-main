/**
 * Import SEO metadata for non-product pages (home, about, contact, etc.)
 * from the master CSV into the PageSeo collection.
 *
 * Run: node backend/scripts/import-seo-pages.js
 */

const fs   = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const mongoose  = require('mongoose');
require('dotenv').config();

const PageSeo = require('../models/PageSeo');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hsglobal';
const CSV_PATH  = path.join(__dirname, '../../All in One Hs Global & Etsy Data Update - All Pages.csv');

function truncate(text, max) {
  if (!text) return '';
  return text.length <= max ? text : text.slice(0, max - 3).trim() + '...';
}

function parseKeywords(str) {
  if (!str) return [];
  return str.split(',').map(k => k.trim()).filter(Boolean);
}

function urlToPath(url) {
  try {
    return new URL(url).pathname || '/';
  } catch {
    return '/';
  }
}

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log('MongoDB connected\n');

  let fileContent = fs.readFileSync(CSV_PATH, 'utf8');
  if (fileContent.charCodeAt(0) === 0xFEFF) fileContent = fileContent.slice(1);

  const lines = fileContent.split('\n');
  if (lines[0] && lines[0].trim().match(/^,+$/)) lines.shift();
  fileContent = lines.join('\n');

  const records = parse(fileContent, {
    columns: true, skip_empty_lines: true, trim: true,
    relax_column_count: true, bom: true,
  });

  let updated = 0, skipped = 0;

  for (const row of records) {
    const url  = (row.url || row.URL || '').trim();
    if (!url) { skipped++; continue; }

    // Only process non-product pages (exact /products is fine as a page)
    const isProductDetail = (() => {
      try {
        const parts = new URL(url).pathname.split('/products/');
        return parts.length >= 2 && parts[1].trim() !== '';
      } catch { return false; }
    })();
    if (isProductDetail) { skipped++; continue; }

    const pagePath = urlToPath(url);
    const title       = (row.Title       || row.title       || '').trim();
    const description = (row.Desc        || row.Description || row.description || '').trim();
    const h1          = (row['H1 Tag']   || row.h1Tag       || '').trim();
    const keywords    = parseKeywords(row.Keyword || row.Keywords || row.keywords || '');
    const image       = (row['IMg URL 2']|| row.image       || '').trim();
    const canonical   = (row['Canonical Tag'] || url).trim();

    if (!title && !description && !h1) {
      console.log(`  skip (no data): ${pagePath}`);
      skipped++;
      continue;
    }

    await PageSeo.findOneAndUpdate(
      { path: pagePath },
      {
        $set: {
          path:               pagePath,
          title:              truncate(title, 60),
          description:        truncate(description, 160),
          h1,
          keywords,
          image,
          canonical,
          ogTitle:            truncate(title, 60),
          ogDescription:      truncate(description, 160),
          ogImage:            image,
          twitterTitle:       truncate(title, 60),
          twitterDescription: truncate(description, 160),
          twitterImage:       image,
        }
      },
      { upsert: true, new: true }
    );

    console.log(`  updated: ${pagePath}`);
    updated++;
  }

  console.log(`\nDone — ${updated} pages updated, ${skipped} rows skipped`);
  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
