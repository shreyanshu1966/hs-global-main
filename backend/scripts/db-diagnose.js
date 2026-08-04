#!/usr/bin/env node
'use strict';
// Read-only diagnostic: show which URI is configured, list all databases on
// the server, and count the products collection in each.
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const args = process.argv.slice(2);
const outArg = args.find((a) => a.startsWith('--out='));
const OUT = outArg ? outArg.slice('--out='.length) : null;

async function main() {
  const uri = process.env.MONGODB_URI || '(MONGODB_URI NOT SET -> fallback mongodb://localhost:27017/hs_global_export)';
  console.log('process.env.MONGODB_URI =', uri.replace(/\/\/([^:]+):[^@]+@/, '//$1:****@'));

  const effective = process.env.MONGODB_URI || 'mongodb://localhost:27017/hs_global_export';
  await mongoose.connect(effective, { serverSelectionTimeoutMS: 8000 });
  const conn = mongoose.connection;
  console.log('Connected host/name:', conn.host, '/', conn.name);

  const admin = conn.db.admin();
  const { databases } = await admin.listDatabases();
  console.log('\nDatabases on this server:');
  const report = { effectiveUri: effective.replace(/\/\/([^:]+):[^@]+@/, '//$1:****@'), connectedName: conn.name, dbs: [] };
  for (const d of databases) {
    let productCount = '-';
    try {
      const cols = await conn.useDb(d.name).db.listCollections({ name: 'products' }).toArray();
      if (cols.length) productCount = await conn.useDb(d.name).db.collection('products').countDocuments({});
    } catch (e) { productCount = 'err:' + e.message; }
    console.log('  ' + d.name.padEnd(28), 'products=' + productCount);
    report.dbs.push({ name: d.name, products: productCount });
  }
  if (OUT) {
    const outPath = path.isAbsolute(OUT) ? OUT : path.resolve(__dirname, '..', OUT);
    fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
  }
  await mongoose.disconnect();
}
main().catch(async (e) => { console.error('Failed:', e.message); try { await mongoose.disconnect(); } catch (_) {} process.exit(1); });
