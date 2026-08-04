#!/usr/bin/env node
'use strict';

/**
 * count-by-category.js
 * Reads the LIVE DB and reports product counts per category and per
 * category+subcategory. Read-only. Writes a JSON summary to --out and
 * also prints a table to stdout.
 */
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const Product = require('../models/Product');

const args = process.argv.slice(2);
function readArgValue(name, fallback) {
  const found = args.find((a) => a.startsWith(`--${name}=`));
  return found ? found.slice(name.length + 3).trim().replace(/^"|"$/g, '') : fallback;
}
const MONGO_URI = readArgValue('uri', process.env.MONGODB_URI || 'mongodb://localhost:27017/hs_global_export');
const OUT = readArgValue('out', null);

async function main() {
  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 8000 });
  console.log(`Connected: ${mongoose.connection.host} / ${mongoose.connection.name}\n`);

  const total = await Product.countDocuments({});

  const byCat = await Product.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  const bySub = await Product.aggregate([
    { $group: { _id: { category: '$category', subcategory: '$subcategory' }, count: { $sum: 1 } } },
    { $sort: { '_id.category': 1, count: -1 } },
  ]);

  console.log('TOTAL PRODUCTS:', total, '\n');
  console.log('BY CATEGORY');
  console.log('─'.repeat(40));
  for (const r of byCat) console.log((r._id || '(none)').padEnd(28), String(r.count).padStart(5));

  console.log('\nBY CATEGORY / SUBCATEGORY');
  console.log('─'.repeat(50));
  let curCat = null;
  for (const r of bySub) {
    const cat = r._id.category || '(none)';
    const sub = r._id.subcategory || '(none)';
    if (cat !== curCat) { console.log(`\n${cat}`); curCat = cat; }
    console.log('   ' + sub.padEnd(32), String(r.count).padStart(4));
  }

  if (OUT) {
    const outPath = path.isAbsolute(OUT) ? OUT : path.resolve(__dirname, '..', OUT);
    fs.writeFileSync(outPath, JSON.stringify({ total, byCategory: byCat, bySubcategory: bySub }, null, 2));
    console.log('\nWrote', outPath);
  }

  await mongoose.disconnect();
}

main().catch(async (e) => { console.error('Failed:', e.message); try { await mongoose.disconnect(); } catch (_) {} process.exit(1); });
