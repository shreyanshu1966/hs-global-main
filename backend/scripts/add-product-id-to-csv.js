/**
 * add-product-id-to-csv.js
 *
 * Reads the live-website SEO CSV, matches each row's URL (or New Url) against
 * the products collection, fetches the productId (e.g. HSMCTGR2), and writes
 * a new `hs_product_id` column back to the CSV.
 *
 * Usage:
 *   node backend/scripts/add-product-id-to-csv.js [--dry-run]
 *
 * Output: same directory as input, with suffix "_with_ids.csv"
 */

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');
const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('../models/Product');

const DRY_RUN = process.argv.includes('--dry-run');
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hsglobal';

const CSV_INPUT = path.join(
  __dirname,
  '../../All in One HSGlobal & Etsy Data Update - Live Website HS Global Export.csv'
);
const CSV_OUTPUT = CSV_INPUT.replace(/\.csv$/i, '_with_ids.csv');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Extract the last path segment from a URL, stripping query/hash. */
function slugFromUrl(url) {
  if (!url) return null;
  try {
    // Normalise: if URL has no scheme, add a dummy one so URL() works
    const full = url.startsWith('http') ? url : `https://example.com${url}`;
    const { pathname } = new URL(full);
    const parts = pathname.replace(/\/$/, '').split('/');
    return parts[parts.length - 1] || null;
  } catch {
    return null;
  }
}

/**
 * Try every heuristic to find a product for a given slug.
 * Returns the product document or null.
 */
async function findProduct(slug) {
  if (!slug) return null;

  // 1. Exact productId match
  let p = await Product.findOne({ productId: slug }).select('productId productCode').lean();
  if (p) return p;

  // 2. Case-insensitive productId match
  p = await Product.findOne({ productId: new RegExp(`^${escapeRegex(slug)}$`, 'i') }).select('productId productCode').lean();
  if (p) return p;

  // 3. Slug converted to name-like string
  const namePattern = slug.replace(/-/g, ' ');
  p = await Product.findOne({ name: new RegExp(escapeRegex(namePattern), 'i') }).select('productId productCode').lean();
  if (p) return p;

  // 4. Partial productId match (slug starts-with or ends-with product id fragment)
  p = await Product.findOne({
    productId: new RegExp(escapeRegex(slug.slice(0, 20)), 'i')
  }).select('productId productCode').lean();
  if (p) return p;

  return null;
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log(`\n📊 add-product-id-to-csv${DRY_RUN ? ' [DRY RUN]' : ''}\n`);
  console.log(`📁 Input : ${CSV_INPUT}`);
  console.log(`📁 Output: ${CSV_OUTPUT}\n`);

  if (!fs.existsSync(CSV_INPUT)) {
    console.error(`❌ CSV not found: ${CSV_INPUT}`);
    process.exit(1);
  }

  // -- Connect DB --
  await mongoose.connect(MONGO_URI);
  console.log('✅ MongoDB connected\n');

  // -- Read & parse CSV --
  let raw = fs.readFileSync(CSV_INPUT, 'utf8');
  if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1); // strip BOM

  // Drop leading blank line (row of only commas)
  const lines = raw.split('\n');
  if (lines[0] && /^,+$/.test(lines[0].trim())) lines.shift();
  raw = lines.join('\n');

  const records = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
  });

  console.log(`📄 Rows parsed: ${records.length}\n`);

  // -- Enrich each row --
  let matched = 0, unmatched = 0;

  for (const row of records) {
    const url    = (row['url']     || row['URL']     || '').trim();
    const newUrl = (row['New Url'] || row['New URL'] || '').trim();

    // Skip non-product rows quickly
    const isProductUrl = (u) => u && (u.includes('/product/') || u.includes('/products/'));
    if (!isProductUrl(url) && !isProductUrl(newUrl)) {
      row['hs_product_id'] = '';
      continue;
    }

    // Already has an id from a previous run — keep it
    if (row['hs_product_id'] && row['hs_product_id'].trim()) {
      matched++;
      continue;
    }

    // Try url first, then newUrl
    const slug1 = slugFromUrl(url);
    const slug2 = slugFromUrl(newUrl);

    let product = await findProduct(slug1);
    if (!product && slug2 && slug2 !== slug1) product = await findProduct(slug2);

    if (product) {
      row['hs_product_id'] = product.productCode || product.productId;
      matched++;
      console.log(`  ✅ ${product.productId.padEnd(14)} ← ${slug1 || slug2}`);
    } else {
      row['hs_product_id'] = '';
      unmatched++;
      console.log(`  ❌ no match          ← ${slug1 || slug2 || url}`);
    }
  }

  console.log(`\n🔢 Matched  : ${matched}`);
  console.log(`🔢 Unmatched: ${unmatched}`);

  // -- Write output CSV --
  if (!DRY_RUN) {
    // Ensure hs_product_id is the second column (after url)
    const cols = Object.keys(records[0] || {});
    if (!cols.includes('hs_product_id')) cols.push('hs_product_id');

    const output = stringify(records, { header: true, columns: cols });
    fs.writeFileSync(CSV_OUTPUT, output, 'utf8');
    console.log(`\n✅ Written: ${CSV_OUTPUT}\n`);
  } else {
    console.log('\n⚠️  Dry run — nothing written.\n');
  }

  await mongoose.disconnect();
}

main().catch(err => {
  console.error('❌', err.message);
  process.exit(1);
});
