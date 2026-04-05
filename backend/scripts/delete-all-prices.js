#!/usr/bin/env node

'use strict';

const path = require('path');
const mongoose = require('mongoose');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const Product = require('../models/Product');

const args = new Set(process.argv.slice(2));
const isApply = args.has('--apply');

async function deleteAllPrices() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hsglobal';

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected.');

    const filter = { priceINR: { $exists: true } };
    const productsWithPrice = await Product.countDocuments(filter);

    if (!isApply) {
      console.log('\nDry run only. No data changed.');
      console.log(`Products that currently have priceINR: ${productsWithPrice}`);
      console.log('Run with --apply to remove all priceINR fields.');
      return;
    }

    const result = await Product.updateMany(filter, {
      $unset: { priceINR: '' },
    });

    console.log('\nPrice cleanup completed.');
    console.log(`Matched: ${result.matchedCount}`);
    console.log(`Modified: ${result.modifiedCount}`);
  } catch (error) {
    console.error('Failed to delete prices:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
}

deleteAllPrices();
