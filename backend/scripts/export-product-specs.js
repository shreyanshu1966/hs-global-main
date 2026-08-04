#!/usr/bin/env node

'use strict';

/**
 * export-product-specs.js
 * ------------------------------------------------------------------
 * Exports EVERY product from the connected MongoDB into a single JSON
 * file that you can fill in by hand and then re-import with
 * import-product-specs.js.
 *
 * Each entry keeps its identity fields (productId / name / category /
 * subcategory) as locked reference values, and carries a spec skeleton
 * matching that product's category:
 *   - furniture / wooden-furniture / leather  -> productSpecifications
 *   - semi-precious-stone                      -> stoneSpecs
 *   - all categories                           -> customSpecs (key/value)
 *
 * Existing values already in the DB are pre-filled; anything empty is
 * left as "" for you to fill.
 *
 * Usage:
 *   node scripts/export-product-specs.js                 # uses MONGODB_URI from .env
 *   node scripts/export-product-specs.js --uri="mongodb://.../db"
 *   node scripts/export-product-specs.js --out=product-specs.json
 *
 * On the VPS, MONGODB_URI points at the live DB, so just run it there.
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const Product = require('../models/Product');

const BACKEND_ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);

function readArgValue(name, fallback) {
  const key = `--${name}=`;
  const found = args.find((arg) => arg.startsWith(key));
  if (!found) return fallback;
  return found.slice(key.length).trim().replace(/^"|"$/g, '') || fallback;
}

const MONGO_URI = readArgValue('uri', process.env.MONGODB_URI || 'mongodb://localhost:27017/hs_global_export');
const OUT_ARG = readArgValue('out', path.join('scripts', 'product-specs.json'));
const OUT_PATH = path.isAbsolute(OUT_ARG) ? OUT_ARG : path.resolve(BACKEND_ROOT, OUT_ARG);

// 'handcrafted' is a legacy label being renamed to 'wooden-furniture'; treat it
// as non-stone so it still receives the full furniture spec skeleton.
const NON_STONE_CATEGORIES = ['furniture', 'wooden-furniture', 'handcrafted', 'leather'];

// ── Canonical per-category default spec keys ────────────────────────────────
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

const str = (v) => (v === undefined || v === null ? '' : String(v));

function buildProductSpecifications(existing = {}) {
  const out = {};
  for (const [section, keys] of Object.entries(DEFAULT_KEYS.productSpecifications)) {
    out[section] = {};
    const src = existing[section] || {};
    for (const k of keys) out[section][k] = str(src[k]);
  }
  return out;
}

function buildStoneSpecs(existing = {}) {
  const out = {};
  for (const k of DEFAULT_KEYS.stoneSpecs) out[k] = str(existing[k]);
  return out;
}

function buildCustomSpecs(existing = []) {
  const rows = (existing || [])
    .map((s) => ({ label: str(s.label), value: str(s.value) }))
    .filter((s) => s.label || s.value);
  // Always leave one blank row so there is somewhere to add a new pair.
  rows.push({ label: '', value: '' });
  return rows;
}

async function main() {
  console.log('🔌 Connecting to MongoDB…');
  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 8000 });
  console.log(`✅ Connected: ${mongoose.connection.host} / ${mongoose.connection.name}`);

  const products = await Product.find({})
    .select('productId name category subcategory productSpecifications stoneSpecs customSpecs')
    .sort({ category: 1, subcategory: 1, name: 1 })
    .lean();

  console.log(`📦 Found ${products.length} products`);

  const entries = [];
  const counts = {};

  for (const p of products) {
    counts[p.category] = (counts[p.category] || 0) + 1;

    const entry = {
      productId: p.productId,
      name: p.name,
      category: p.category,
      subcategory: p.subcategory,
    };

    if (p.category === 'semi-precious-stone') {
      entry.stoneSpecs = buildStoneSpecs(p.stoneSpecs);
    } else if (NON_STONE_CATEGORIES.includes(p.category)) {
      entry.productSpecifications = buildProductSpecifications(p.productSpecifications);
    } else {
      // Unknown category: still export identity + custom specs so nothing is lost.
      entry._note = `Unrecognised category "${p.category}" — only customSpecs exported`;
    }

    entry.customSpecs = buildCustomSpecs(p.customSpecs);
    entries.push(entry);
  }

  const output = {
    _meta: {
      generatedAt: new Date().toISOString(),
      source: `${mongoose.connection.host}/${mongoose.connection.name}`,
      totalProducts: products.length,
      countsByCategory: counts,
      instructions:
        'Fill in blank "" values. Do NOT edit productId/name/category/subcategory. ' +
        'Re-import with: node scripts/import-product-specs.js --file=<this file>  (add --commit to write).',
    },
    _defaultKeys: DEFAULT_KEYS,
    products: entries,
  };

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify(output, null, 2), 'utf8');

  console.log(`📝 Wrote ${entries.length} products -> ${OUT_PATH}`);
  console.log('   By category:', counts);

  await mongoose.disconnect();
  console.log('👋 Done.');
}

main().catch(async (err) => {
  console.error('❌ Export failed:', err.message);
  try { await mongoose.disconnect(); } catch (_) {}
  process.exit(1);
});
