#!/usr/bin/env node
'use strict';

/**
 * Reads new_products_codes.json (produced locally by parse-new-product-csvs.js)
 * and diffs it against the LIVE DB's productCode values per category.
 * Read-only: does not write/update/delete anything in the DB.
 *
 * Run ON the VPS (where MONGODB_URI in .env resolves to the live Mongo):
 *   node diff-codes-vs-live-db.js
 */
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const CODES_FILE = path.join(__dirname, 'new_products_codes.json');
const OUT_FILE = path.join(__dirname, 'missing_products_report.json');

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
    const dbProducts = await Product.find({ category }, { productCode: 1, productId: 1, name: 1, category: 1 }).lean();
    const dbCodeSet = new Set(dbProducts.map((p) => (p.productCode || '').trim().toUpperCase()).filter(Boolean));

    // Also build a global code->category map to flag mis-categorized matches
    const allWithCodes = await Product.find({ productCode: { $ne: '' } }, { productCode: 1, category: 1 }).lean();
    const globalCodeMap = new Map();
    for (const p of allWithCodes) {
      const c = (p.productCode || '').trim().toUpperCase();
      if (c) globalCodeMap.set(c, p.category);
    }

    const missing = [];
    const foundElsewhere = [];

    for (const item of group.items) {
      const key = item.code.toUpperCase();
      if (dbCodeSet.has(key)) continue; // present in the right category

      const elsewhereCategory = globalCodeMap.get(key);
      if (elsewhereCategory) {
        foundElsewhere.push({ ...item, foundInCategory: elsewhereCategory });
      } else {
        missing.push(item);
      }
    }

    report[label] = {
      targetCategory: category,
      csvUniqueCodes: group.items.length,
      dbProductsInCategory: dbProducts.length,
      dbCodesInCategory: dbCodeSet.size,
      missingCount: missing.length,
      foundElsewhereCount: foundElsewhere.length,
      missing,
      foundElsewhere,
    };

    console.log(`\n=== ${label.toUpperCase()} (target category: ${category}) ===`);
    console.log(`CSV unique codes: ${group.items.length}`);
    console.log(`DB products currently in "${category}": ${dbProducts.length} (with productCode set: ${dbCodeSet.size})`);
    console.log(`MISSING from live DB: ${missing.length}`);
    console.log(`Found under a different category (mis-tagged?): ${foundElsewhere.length}`);
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
