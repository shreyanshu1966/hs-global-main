#!/usr/bin/env node
'use strict';
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const step2 = require('./missing-products-step2.json');

(async () => {
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
  const codes = step2.ready.map((i) => i.code);
  const existing = await Product.find({ productCode: { $in: codes } })
    .select('productCode productId name createdAt updatedAt')
    .lean();
  console.log('ALREADY EXIST (by productCode) ON THIS DB:', existing.length, '/', codes.length);
  console.log(JSON.stringify(existing, null, 2));

  const productIds = step2.ready.map((i) => i.productId);
  const idCollisions = await Product.find({ productId: { $in: productIds } }).lean();
  require('fs').writeFileSync('/tmp/id-collisions.json', JSON.stringify(idCollisions, null, 2));
  console.log('\nPRODUCTID SLUG COLLISIONS:', idCollisions.length, '/', productIds.length, '-> written to /tmp/id-collisions.json');
  await mongoose.disconnect();
})().catch(async (e) => {
  console.error(e.message);
  process.exit(1);
});
