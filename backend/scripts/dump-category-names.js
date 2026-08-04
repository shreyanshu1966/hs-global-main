#!/usr/bin/env node
'use strict';
/** Read-only dump of name/productId/productCode for wooden-furniture and furniture-without-code products in the live DB, for manual title reconciliation. */
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function main() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hs_global_export';
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  const productSchema = new mongoose.Schema({}, { strict: false, collection: 'products' });
  const Product = mongoose.model('Product', productSchema);

  const wooden = await Product.find({ category: 'wooden-furniture' }, { name: 1, productId: 1, productCode: 1, subcategory: 1 }).lean();
  const furnitureNoCode = await Product.find({ category: 'furniture', $or: [{ productCode: { $exists: false } }, { productCode: '' }] }, { name: 1, productId: 1, productCode: 1, subcategory: 1 }).lean();

  fs.writeFileSync(path.join(__dirname, 'db_names_dump.json'), JSON.stringify({ wooden, furnitureNoCode }, null, 2));
  console.log('wooden count:', wooden.length);
  console.log('furnitureNoCode count:', furnitureNoCode.length);
  console.log('Wrote db_names_dump.json');
  await mongoose.disconnect();
}
main().catch(async (e) => { console.error(e); try { await mongoose.disconnect(); } catch(_){} process.exit(1); });
