#!/usr/bin/env node
'use strict';
/** Read-only: fetch all semi-precious-stone products from the live (VPS) database
 * and dump them to a local JSON file for inspection. */
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function main() {
  const uri = process.env.LIVE_MONGODB_URI;
  if (!uri) {
    console.error('LIVE_MONGODB_URI not set in backend/.env');
    process.exit(1);
  }

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  const productSchema = new mongoose.Schema({}, { strict: false, collection: 'products' });
  const Product = mongoose.model('Product', productSchema);

  const products = await Product.find({ category: 'semi-precious-stone' }).lean();

  const out = products.map((p) => ({
    productId: p.productId,
    productCode: p.productCode,
    name: p.name,
    subcategory: p.subcategory,
    status: p.status,
    available: p.available,
    priceINR: p.priceINR,
    pricePerSqFt: p.pricePerSqFt,
    stoneSpecs: p.stoneSpecs,
    dimensions: p.dimensions,
    image: p.image,
    images: p.images,
  }));

  const outPath = path.join(__dirname, 'semi-precious-stone-live.json');
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
  console.log(`Fetched ${out.length} semi-precious-stone products from live DB.`);
  console.log(`Wrote ${outPath}`);

  await mongoose.disconnect();
}

main().catch(async (e) => {
  console.error(e);
  try { await mongoose.disconnect(); } catch (_) {}
  process.exit(1);
});
