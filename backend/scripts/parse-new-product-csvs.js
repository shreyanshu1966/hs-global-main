#!/usr/bin/env node
'use strict';

/**
 * Parses the two new listing CSVs (handicraft -> wooden-furniture, marble -> furniture)
 * and extracts { code, subcategory, etsyUrl } per row. Writes a small JSON of codes
 * for diffing against the live DB. Local/read-only, does not touch any DB.
 *
 * Usage: node backend/scripts/parse-new-product-csvs.js
 */
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

const ROOT = path.resolve(__dirname, '..', '..');
const NEW_PRODUCTS_DIR = path.join(ROOT, 'new products');

const HANDICRAFT_CSV = path.join(NEW_PRODUCTS_DIR, 'Latest Etsy & HS All Product Title Desc  April -May 2026 - handicraft product listing.csv');
const MARBLE_CSV = path.join(NEW_PRODUCTS_DIR, 'Latest Etsy & HS All Product Title Desc  April -May 2026 -  marble  Listing .csv');

const OUT_FILE = path.join(__dirname, 'new_products_codes.json');

function loadRows(csvPath) {
  const content = fs.readFileSync(csvPath, 'utf8');
  const rows = parse(content, { columns: false, skip_empty_lines: true, relax_column_count: true });
  return rows.filter((r) => /^[0-9]+$/.test((r[0] || '').trim()));
}

function extract(csvPath, { urlCol, subcatCol, codeCol, titleCol }) {
  const rows = loadRows(csvPath);
  const seen = new Map();
  let blankCode = 0;
  let duplicateCode = 0;
  let placeholderCode = 0;

  for (const r of rows) {
    const code = (r[codeCol] || '').trim();
    const subcategory = (r[subcatCol] || '').trim();
    const etsyUrl = (r[urlCol] || '').trim();
    const title = (r[titleCol] || '').trim();

    if (!code) { blankCode++; continue; }
    if (['UNAVAILABLE', 'UNAVILABLE', 'SAME'].includes(code.toUpperCase())) { placeholderCode++; continue; }

    const key = code.toUpperCase();
    if (seen.has(key)) { duplicateCode++; continue; }
    seen.set(key, { code, subcategory, title, etsyUrl });
  }

  return {
    totalDataRows: rows.length,
    blankCode,
    placeholderCode,
    duplicateCode,
    items: [...seen.values()],
  };
}

function main() {
  const handicraft = extract(HANDICRAFT_CSV, { urlCol: 1, subcatCol: 2, codeCol: 3, titleCol: 12 });
  const marble = extract(MARBLE_CSV, { urlCol: 3, subcatCol: 1, codeCol: 2, titleCol: 9 });

  console.log('=== Handicraft CSV (-> wooden-furniture) ===');
  console.log(`Data rows: ${handicraft.totalDataRows}, blank code: ${handicraft.blankCode}, placeholder: ${handicraft.placeholderCode}, duplicate: ${handicraft.duplicateCode}`);
  console.log(`Unique valid product codes: ${handicraft.items.length}`);

  console.log('\n=== Marble CSV (-> furniture) ===');
  console.log(`Data rows: ${marble.totalDataRows}, blank code: ${marble.blankCode}, placeholder: ${marble.placeholderCode}, duplicate: ${marble.duplicateCode}`);
  console.log(`Unique valid product codes: ${marble.items.length}`);

  fs.writeFileSync(OUT_FILE, JSON.stringify({
    wooden: { targetCategory: 'wooden-furniture', items: handicraft.items },
    marble: { targetCategory: 'furniture', items: marble.items },
  }, null, 2));

  console.log(`\nWrote ${OUT_FILE}`);
}

main();
