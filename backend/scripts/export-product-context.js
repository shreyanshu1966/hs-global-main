#!/usr/bin/env node

'use strict';

/**
 * export-product-context.js
 * ------------------------------------------------------------------
 * Read-only dump of the descriptive context needed to fill product
 * specifications by hand / with image analysis. Companion to
 * export-product-specs.js — NOT for import, reference only.
 *
 * Outputs productId, name, category, subcategory, description,
 * subDescription, dimensions, weight, tags, and image URLs.
 *
 * Usage:
 *   node scripts/export-product-context.js
 *   node scripts/export-product-context.js --out=scripts/product-context.json
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
  const found = args.find((a) => a.startsWith(key));
  if (!found) return fallback;
  return found.slice(key.length).trim().replace(/^"|"$/g, '') || fallback;
}

const MONGO_URI = readArgValue('uri', process.env.MONGODB_URI || 'mongodb://localhost:27017/hs_global_export');
const OUT_ARG = readArgValue('out', path.join('scripts', 'product-context.json'));
const OUT_PATH = path.isAbsolute(OUT_ARG) ? OUT_ARG : path.resolve(BACKEND_ROOT, OUT_ARG);

async function main() {
  console.log('🔌 Connecting to MongoDB…');
  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 8000 });
  console.log(`✅ Connected: ${mongoose.connection.host} / ${mongoose.connection.name}`);

  const products = await Product.find({})
    .select('productId name category subcategory description subDescription dimensions weight tags image images sortedImages')
    .sort({ category: 1, subcategory: 1, name: 1 })
    .lean();

  console.log(`📦 Found ${products.length} products`);

  const entries = products.map((p) => ({
    productId: p.productId,
    name: p.name,
    category: p.category,
    subcategory: p.subcategory,
    description: p.description || '',
    subDescription: p.subDescription || '',
    dimensions: p.dimensions || null,
    weight: p.weight ?? null,
    tags: p.tags || [],
    primaryImage: p.image || (p.sortedImages && p.sortedImages[0]) || (p.images && p.images[0]) || '',
    images: (p.sortedImages && p.sortedImages.length ? p.sortedImages : p.images) || [],
  }));

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify({ generatedAt: new Date().toISOString(), total: entries.length, products: entries }, null, 2), 'utf8');
  console.log(`📝 Wrote ${entries.length} products -> ${OUT_PATH}`);

  await mongoose.disconnect();
  console.log('👋 Done.');
}

main().catch(async (err) => {
  console.error('❌ Export failed:', err.message);
  try { await mongoose.disconnect(); } catch (_) {}
  process.exit(1);
});
