#!/usr/bin/env node
'use strict';
// One connection, definitive: total count, by-category, and how many of the
// product-specs.json productIds currently exist in the DB. Read-only.
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const Product = require('../models/Product');

const args = process.argv.slice(2);
const outArg = args.find((a) => a.startsWith('--out='));
const OUT = outArg ? outArg.slice('--out='.length) : null;

async function main() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hs_global_export';
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  const conn = mongoose.connection;

  const total = await Product.countDocuments({});
  const collCount = await conn.db.collection('products').countDocuments({});
  const collNames = (await conn.db.listCollections().toArray()).map((c) => c.name).sort();

  const byCat = await Product.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } }, { $sort: { count: -1 } },
  ]);

  const specsPath = path.resolve(__dirname, 'product-specs.json');
  let fileCount = 0, existInDb = 0, sampleFound = [];
  if (fs.existsSync(specsPath)) {
    const raw = JSON.parse(fs.readFileSync(specsPath, 'utf8'));
    const entries = Array.isArray(raw) ? raw : raw.products;
    fileCount = entries.length;
    const ids = entries.map((e) => e.productId);
    existInDb = await Product.countDocuments({ productId: { $in: ids } });
    // sample: first 3 stone + first 3 furniture, show found + a spec value
    for (const e of entries.slice(0, 5)) {
      const p = await Product.findOne({ productId: e.productId }).select('productId category productSpecifications.details.material stoneSpecs.material');
      sampleFound.push({ id: e.productId, found: !!p, cat: p && p.category,
        detMat: p && p.productSpecifications && p.productSpecifications.details && p.productSpecifications.details.material,
        stoneMat: p && p.stoneSpecs && p.stoneSpecs.material });
    }
  }

  const report = { connectedHost: conn.host, dbName: conn.name, modelCollection: Product.collection.name,
    totalViaModel: total, totalViaColl: collCount, collections: collNames, byCategory: byCat,
    specsFileEntries: fileCount, specsFileIdsExistingInDb: existInDb, sample: sampleFound };
  console.log(JSON.stringify(report, null, 2));
  if (OUT) fs.writeFileSync(path.isAbsolute(OUT) ? OUT : path.resolve(__dirname, '..', OUT), JSON.stringify(report, null, 2));
  await mongoose.disconnect();
}
main().catch(async (e) => { console.error('Failed:', e.message); try { await mongoose.disconnect(); } catch (_) {} process.exit(1); });
