#!/usr/bin/env node
'use strict';

/**
 * Final read-only diff: compares new_products_codes.json (handicraft -> wooden-furniture,
 * marble -> furniture) against the LIVE DB. A DB product's code is taken from its
 * `productCode` field if set, otherwise recovered from the Cloudinary image folder
 * (…/etsy/{CODE}/file), since many older-migrated docs never had productCode populated.
 */
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const CODES_FILE = path.join(__dirname, 'new_products_codes.json');
const OUT_FILE = path.join(__dirname, 'final_missing_products_report.json');

function codeFromImages(images) {
  for (const img of images || []) {
    const url = typeof img === 'object' ? img.url : img;
    if (url && url.includes('cloudinary.com')) {
      const m = url.match(/\/etsy\/([A-Za-z0-9]+)\//);
      if (m) return m[1].toUpperCase();
    }
  }
  return null;
}

async function main() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hs_global_export';
  console.log('Connecting to:', uri);
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });

  const productSchema = new mongoose.Schema({}, { strict: false, collection: 'products' });
  const Product = mongoose.model('Product', productSchema);

  const { wooden, marble } = JSON.parse(fs.readFileSync(CODES_FILE, 'utf8'));
  const report = {};

  for (const [label, group] of [['wooden', wooden], ['marble', marble]]) {
    const category = group.targetCategory;
    const dbProducts = await Product.find({ category }, { productId: 1, name: 1, productCode: 1, images: 1 }).lean();

    const dbCodeSet = new Set();
    for (const p of dbProducts) {
      const explicit = (p.productCode || '').trim().toUpperCase();
      const code = explicit || codeFromImages(p.images);
      if (code) dbCodeSet.add(code);
    }

    const missing = [];
    const matched = [];
    for (const item of group.items) {
      const key = item.code.toUpperCase();
      if (dbCodeSet.has(key)) matched.push(item);
      else missing.push(item);
    }

    report[label] = {
      targetCategory: category,
      csvUniqueCodes: group.items.length,
      dbProductsInCategory: dbProducts.length,
      dbResolvedCodes: dbCodeSet.size,
      matchedCount: matched.length,
      missingCount: missing.length,
      missing,
    };

    console.log(`\n=== ${label.toUpperCase()} (target category: ${category}) ===`);
    console.log(`CSV unique codes: ${group.items.length}`);
    console.log(`DB products in "${category}": ${dbProducts.length} (resolved codes: ${dbCodeSet.size})`);
    console.log(`Matched (already in DB): ${matched.length}`);
    console.log(`MISSING from live DB: ${missing.length}`);
  }

  fs.writeFileSync(OUT_FILE, JSON.stringify(report, null, 2));
  console.log(`\nWrote ${OUT_FILE}`);
  await mongoose.disconnect();
}

main().catch(async (e) => {
  console.error('Failed:', e);
  try { await mongoose.disconnect(); } catch (_) {}
  process.exit(1);
});
