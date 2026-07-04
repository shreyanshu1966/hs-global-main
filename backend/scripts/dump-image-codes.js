#!/usr/bin/env node
'use strict';
/** Read-only: for wooden-furniture (all) and furniture-without-productCode, extract the
 * productCode embedded in the Cloudinary image folder path (…/etsy/{CODE}/file), since the
 * productCode field itself is blank on these older-migrated docs. */
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '.env') });

function extractCode(images) {
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
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  const productSchema = new mongoose.Schema({}, { strict: false, collection: 'products' });
  const Product = mongoose.model('Product', productSchema);

  const wooden = await Product.find({ category: 'wooden-furniture' }, { name: 1, productId: 1, images: 1 }).lean();
  const furnitureNoCode = await Product.find({ category: 'furniture', $or: [{ productCode: { $exists: false } }, { productCode: '' }] }, { name: 1, productId: 1, images: 1 }).lean();

  const out = {
    wooden: wooden.map(p => ({ productId: p.productId, name: p.name, codeFromImage: extractCode(p.images), sampleImage: (p.images||[])[0] })),
    furnitureNoCode: furnitureNoCode.map(p => ({ productId: p.productId, name: p.name, codeFromImage: extractCode(p.images), sampleImage: (p.images||[])[0] })),
  };
  fs.writeFileSync(path.join(__dirname, 'image_codes_dump.json'), JSON.stringify(out, null, 2));
  console.log('wooden with codeFromImage:', out.wooden.filter(p=>p.codeFromImage).length, '/', out.wooden.length);
  console.log('furnitureNoCode with codeFromImage:', out.furnitureNoCode.filter(p=>p.codeFromImage).length, '/', out.furnitureNoCode.length);
  console.log('Wrote image_codes_dump.json');
  await mongoose.disconnect();
}
main().catch(async (e) => { console.error(e); try { await mongoose.disconnect(); } catch(_){} process.exit(1); });
