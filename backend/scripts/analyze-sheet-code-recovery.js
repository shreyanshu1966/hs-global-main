#!/usr/bin/env node
'use strict';
/**
 * ANALYSIS ONLY — makes no changes to the DB or CSVs. For DB products (furniture /
 * wooden-furniture) that have no productCode, checks whether the "new products" listing
 * sheets (handicraft + marble) have a code for a product of the same name, so those codes
 * could be backfilled later to unlock local-folder image matching for them.
 *
 * Usage:
 *   node deploy/fetch-all-products-for-analysis.js   (run first, from repo root)
 *   node backend/scripts/parse-new-product-csvs.js   (run first, writes new_products_codes.json)
 *   node backend/scripts/analyze-sheet-code-recovery.js
 *
 * Writes: backend/scripts/sheet-code-recovery-report.json
 */
const fs = require('fs');
const path = require('path');

const DUMP_PATH = path.join(__dirname, 'all-products-live.json');
const SHEET_CODES_PATH = path.join(__dirname, 'new_products_codes.json');
const REPORT_PATH = path.join(__dirname, 'sheet-code-recovery-report.json');

function normalize(s) {
  return (s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ');
}

function main() {
  for (const p of [DUMP_PATH, SHEET_CODES_PATH]) {
    if (!fs.existsSync(p)) {
      console.error(`Missing ${p}`);
      console.error('Run: node deploy/fetch-all-products-for-analysis.js  AND  node backend/scripts/parse-new-product-csvs.js  first.');
      process.exit(1);
    }
  }

  const products = JSON.parse(fs.readFileSync(DUMP_PATH, 'utf-8'));
  const sheet = JSON.parse(fs.readFileSync(SHEET_CODES_PATH, 'utf-8'));

  const sheetByTitle = new Map();
  for (const bucket of [sheet.wooden, sheet.marble]) {
    for (const item of bucket.items) {
      sheetByTitle.set(normalize(item.title), item);
    }
  }

  const missingCode = products.filter((p) => (p.category === 'furniture' || p.category === 'wooden-furniture') && !(p.productCode || '').trim());

  const recoverable = [];
  const stillUnmatched = [];

  for (const p of missingCode) {
    const key = normalize(p.name);
    const hit = sheetByTitle.get(key);
    if (hit) {
      recoverable.push({ productId: p.productId, name: p.name, category: p.category, subcategory: p.subcategory, codeFoundInSheet: hit.code, sheetTitle: hit.title, sheetSubcategory: hit.subcategory });
    } else {
      stillUnmatched.push({ productId: p.productId, name: p.name, category: p.category, subcategory: p.subcategory });
    }
  }

  const report = {
    generatedAt: new Date().toISOString(),
    totalMissingProductCode: missingCode.length,
    recoverableFromSheetCount: recoverable.length,
    stillUnmatchedCount: stillUnmatched.length,
    recoverable,
    stillUnmatched,
  };
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));

  console.log(`\n=== Sheet product-code recovery analysis ===`);
  console.log(`DB products missing productCode (furniture+wooden-furniture): ${missingCode.length}`);
  console.log(`Code found in sheet by matching name:                         ${recoverable.length}`);
  console.log(`Still no code (not in sheet, or name doesn't match):          ${stillUnmatched.length}`);
  console.log(`\nReport written to ${REPORT_PATH}`);
}

main();
