#!/usr/bin/env node

'use strict';

/**
 * import-product-specs.js
 * ------------------------------------------------------------------
 * Reads the JSON produced by export-product-specs.js (after you have
 * filled it in) and writes the spec fields back to MongoDB, matching
 * each entry by productId.
 *
 * Only these fields are ever touched:
 *   - productSpecifications  (nested, per filled leaf)
 *   - stoneSpecs             (per filled key)
 *   - customSpecs            (replaced with the non-blank rows)
 * Identity fields (productId/name/category/subcategory) are NEVER written.
 *
 * SAFETY:
 *   - Dry-run by DEFAULT. Nothing is written unless you pass --commit.
 *   - Blank "" values are SKIPPED (top-up only) so you never wipe an
 *     existing value with an empty one. Pass --overwrite-blanks to allow
 *     blanks to clear existing values.
 *
 * Usage:
 *   node scripts/import-product-specs.js --file=scripts/product-specs.json            # dry-run
 *   node scripts/import-product-specs.js --file=scripts/product-specs.json --commit   # write
 *   node scripts/import-product-specs.js --file=... --uri="mongodb://.../db" --commit
 *
 * Recommended flow:  local dry  ->  local commit (test)  ->  live dry  ->  live commit
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const Product = require('../models/Product');

const BACKEND_ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);

const isCommit = args.includes('--commit');
const overwriteBlanks = args.includes('--overwrite-blanks');

function readArgValue(name, fallback) {
  const key = `--${name}=`;
  const found = args.find((arg) => arg.startsWith(key));
  if (!found) return fallback;
  return found.slice(key.length).trim().replace(/^"|"$/g, '') || fallback;
}

const MONGO_URI = readArgValue('uri', process.env.MONGODB_URI || 'mongodb://localhost:27017/hs_global_export');
const FILE_ARG = readArgValue('file', path.join('scripts', 'product-specs.json'));
const FILE_PATH = path.isAbsolute(FILE_ARG) ? FILE_ARG : path.resolve(BACKEND_ROOT, FILE_ARG);

// 'handcrafted' is a legacy label being renamed to 'wooden-furniture'; treat it
// as non-stone so its productSpecifications import the same way.
const NON_STONE_CATEGORIES = ['furniture', 'wooden-furniture', 'handcrafted', 'leather'];

const DEFAULT_KEYS = {
  productSpecifications: {
    other_dimensions: ['overall_dimensions', 'overall_product_weight'],
    details: [
      'overall_shape', 'material', 'base_type', 'top_color', 'wood_species',
      'natural_variation_type', 'detailing', 'mixed_materials', 'weight_capacity',
      'custom_product', 'imported', 'wayfair_verified',
    ],
    assembly: ['assembly_required'],
    warranty: ['product_warranty', 'warranty_length'],
  },
  stoneSpecs: [
    'minSlabSize', 'maxSlabSize', 'thickness', 'surfaceFinish', 'form',
    'material', 'usage', 'moh', 'refractiveIndex', 'waterAbsorption', 'priceRange',
  ],
};

const filled = (v) => typeof v === 'string' ? v.trim() !== '' : (v !== undefined && v !== null);

async function main() {
  if (!fs.existsSync(FILE_PATH)) {
    throw new Error(`Input file not found: ${FILE_PATH}`);
  }
  const raw = JSON.parse(fs.readFileSync(FILE_PATH, 'utf8'));
  const entries = Array.isArray(raw) ? raw : raw.products;
  if (!Array.isArray(entries)) {
    throw new Error('JSON has no "products" array.');
  }

  console.log(`📄 Loaded ${entries.length} entries from ${FILE_PATH}`);
  console.log(`🔧 Mode: ${isCommit ? 'COMMIT (will write)' : 'DRY-RUN (no writes)'}` +
              `${overwriteBlanks ? ' | blanks WILL overwrite' : ' | blanks skipped'}`);

  console.log('🔌 Connecting to MongoDB…');
  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 8000 });
  console.log(`✅ Connected: ${mongoose.connection.host} / ${mongoose.connection.name}`);

  const summary = { matched: 0, updated: 0, unchanged: 0, missing: 0, unknownKeys: [] };

  for (const entry of entries) {
    const pid = entry.productId;
    if (!pid) { console.warn('⚠️  Entry with no productId, skipped:', entry.name || '(unnamed)'); continue; }

    const product = await Product.findOne({ productId: pid })
      .select('productId name category productSpecifications stoneSpecs customSpecs');

    if (!product) {
      summary.missing++;
      console.warn(`❓ No product in DB for productId "${pid}" (${entry.name || ''}) — skipped`);
      continue;
    }
    summary.matched++;

    const set = {};
    const changes = [];

    // ── productSpecifications (nested, dot-notation per leaf) ──
    if (entry.productSpecifications && NON_STONE_CATEGORIES.includes(product.category)) {
      for (const [section, keys] of Object.entries(DEFAULT_KEYS.productSpecifications)) {
        const src = entry.productSpecifications[section] || {};
        for (const k of Object.keys(src)) {
          if (!keys.includes(k)) { summary.unknownKeys.push(`${pid}: productSpecifications.${section}.${k}`); continue; }
          const nextVal = src[k];
          if (!filled(nextVal) && !overwriteBlanks) continue;
          const curVal = (product.productSpecifications?.[section]?.[k]) ?? '';
          if (String(nextVal) !== String(curVal)) {
            set[`productSpecifications.${section}.${k}`] = String(nextVal);
            changes.push(`${section}.${k}: "${curVal}" -> "${nextVal}"`);
          }
        }
      }
    }

    // ── stoneSpecs (per key) ──
    if (entry.stoneSpecs && product.category === 'semi-precious-stone') {
      for (const k of Object.keys(entry.stoneSpecs)) {
        if (!DEFAULT_KEYS.stoneSpecs.includes(k)) { summary.unknownKeys.push(`${pid}: stoneSpecs.${k}`); continue; }
        const nextVal = entry.stoneSpecs[k];
        if (!filled(nextVal) && !overwriteBlanks) continue;
        const curVal = (product.stoneSpecs?.[k]) ?? '';
        if (String(nextVal) !== String(curVal)) {
          set[`stoneSpecs.${k}`] = String(nextVal);
          changes.push(`stoneSpecs.${k}: "${curVal}" -> "${nextVal}"`);
        }
      }
    }

    // ── customSpecs (replace with non-blank rows) ──
    if (Array.isArray(entry.customSpecs)) {
      const rows = entry.customSpecs
        .map((s) => ({ label: (s.label || '').trim(), value: (s.value || '').trim() }))
        .filter((s) => s.label && s.value);
      const cur = (product.customSpecs || []).map((s) => ({ label: s.label || '', value: s.value || '' }));
      if (JSON.stringify(rows) !== JSON.stringify(cur)) {
        set.customSpecs = rows;
        changes.push(`customSpecs: ${cur.length} -> ${rows.length} rows`);
      }
    }

    if (changes.length === 0) {
      summary.unchanged++;
      continue;
    }

    summary.updated++;
    console.log(`\n• ${pid} (${product.name}) [${product.category}]`);
    for (const c of changes) console.log(`    ${c}`);

    if (isCommit) {
      await Product.updateOne({ productId: pid }, { $set: set });
    }
  }

  console.log('\n──────────── SUMMARY ────────────');
  console.log(`Matched in DB : ${summary.matched}`);
  console.log(`Would update  : ${summary.updated}${isCommit ? ' (WRITTEN)' : ' (dry-run)'}`);
  console.log(`Unchanged     : ${summary.unchanged}`);
  console.log(`Missing in DB : ${summary.missing}`);
  if (summary.unknownKeys.length) {
    console.log(`\n⚠️  ${summary.unknownKeys.length} unknown key(s) ignored (first 20):`);
    summary.unknownKeys.slice(0, 20).forEach((k) => console.log(`    ${k}`));
  }
  if (!isCommit) console.log('\nℹ️  DRY-RUN only. Re-run with --commit to write these changes.');

  await mongoose.disconnect();
  console.log('👋 Done.');
}

main().catch(async (err) => {
  console.error('❌ Import failed:', err.message);
  try { await mongoose.disconnect(); } catch (_) {}
  process.exit(1);
});
