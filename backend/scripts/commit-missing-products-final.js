#!/usr/bin/env node
'use strict';

/**
 * commit-missing-products-final.js
 * ------------------------------------------------------------------
 * Final commit pass for the 43 "missing" products in missing-products-step2.json,
 * accounting for productId slug collisions discovered by checking the live DB:
 *
 *   - MERGE_PRODUCT_IDS (9): an existing, live, fully-priced product already has
 *     this exact name/description (pre-dates the Etsy productCode system, blank
 *     productCode, old-style image path). Per user decision: keep the existing
 *     price/description untouched, only backfill productCode + refresh images.
 *   - SKIP_CODES (4): a different, distinct existing product happens to share
 *     the same auto-generated title text but has a different real productCode.
 *     Per user decision: skip these entirely for this run.
 *   - Everything else (30): clean, no collision — normal upsert-by-productCode.
 *
 * Usage:
 *   node scripts/commit-missing-products-final.js            # dry-run
 *   node scripts/commit-missing-products-final.js --commit   # write
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('../models/Product');
const Category = require('../models/Category');

const COMMIT = process.argv.includes('--commit');
const STEP2_FILE = path.join(__dirname, 'missing-products-step2.json');

const MERGE_PRODUCT_IDS = new Set([
  'floral-marble-coffee-table-luxury-stone-center-table',
  'floral-marble-side-table-luxury-stone-accent-table',
  'modern-marble-console-table-sculptural-entryway-table',
  'modern-marble-side-table-luxury-stone-accent-table',
  'modern-travertine-side-table-geometric-stone-accent-table',
  'organic-marble-coffee-table-set-sculptural-living-tables',
  'sculptural-marble-side-table-modern-stone-pedestal',
  'sculptural-travertine-coffee-table-modern-wave-stone-table',
  'white-marble-ripple-vessel-sink-artistic-basin',
]);

const SKIP_CODES = new Set(['HSMSTWH10', 'HSMSTBL17', 'HSMSTGR18', 'HSMSTBE19']);

async function getUsdToInrRate() {
  const doc = await mongoose.connection.db.collection('currencies').findOne({ base: 'USD' });
  return doc?.rates?.INR || null;
}

async function main() {
  const { ready } = JSON.parse(fs.readFileSync(STEP2_FILE, 'utf8'));

  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hs_global_export';
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  console.log(`Connected: ${mongoose.connection.host}/${mongoose.connection.name} (${COMMIT ? 'COMMIT' : 'DRY-RUN'})`);

  const rate = await getUsdToInrRate();

  let inserted = 0, merged = 0, skipped = 0, errors = 0;
  const subcatsByCategory = {};

  for (const item of ready) {
    if (SKIP_CODES.has(item.code)) {
      console.log(`SKIP   ${item.code} (${item.productId}) — distinct existing product, same title text`);
      skipped++;
      continue;
    }

    if (MERGE_PRODUCT_IDS.has(item.productId)) {
      console.log(`MERGE  ${item.code} → existing productId "${item.productId}": set productCode + images only`);
      const set = {
        productCode: item.code,
        image: item.images[0] || '',
        images: item.images,
        sortedImages: item.images,
      };
      if (item.videoUrl) {
        set.hasVideo = true;
        set.videoUrl = item.videoUrl;
      }
      if (COMMIT) {
        try {
          const res = await Product.updateOne({ productId: item.productId }, { $set: set });
          if (res.matchedCount === 0) console.log(`  ⚠️  no match for productId "${item.productId}" — skipped`);
          else merged++;
        } catch (err) {
          errors++;
          console.error(`  ❌ ${item.code}: ${err.message}`);
        }
      }
      continue;
    }

    // Clean insert
    const usd = item.hsPrice ?? item.etsyPrice ?? null;
    const priceINR = usd && rate ? Math.round(usd * rate * 100) / 100 : undefined;

    const doc = {
      productId: item.productId,
      productCode: item.code,
      name: item.name,
      category: item.category,
      subcategory: item.subcategory,
      description: item.description,
      image: item.images[0] || '',
      images: item.images,
      sortedImages: item.images,
      ...(priceINR !== undefined && { priceINR }),
      available: true,
      hasVideo: !!item.videoUrl,
      videoUrl: item.videoUrl || null,
      status: 'active',
      tags: item.tags,
      seoTitle: `${item.name} | HS Global Export`,
      seoDescription: item.description ? item.description.substring(0, 160) : '',
      seoKeywords: item.tags,
      shipping: { requiresShipping: true, shippingClass: 'fragile', handlingTime: '15-20 business days' },
      manufacturing: { isCustomMade: true, countryOfOrigin: 'India' },
    };

    console.log(`INSERT ${item.code} → ${item.productId} (priceINR: ${priceINR !== undefined ? priceINR : 'unset'})`);

    if (!subcatsByCategory[item.category]) subcatsByCategory[item.category] = new Set();
    subcatsByCategory[item.category].add(item.subcategory);

    if (COMMIT) {
      try {
        await Product.updateOne({ productCode: item.code }, { $set: doc }, { upsert: true });
        inserted++;
      } catch (err) {
        errors++;
        console.error(`  ❌ ${item.code}: ${err.message}`);
      }
    }
  }

  if (COMMIT) {
    for (const [category, subs] of Object.entries(subcatsByCategory)) {
      let cat = await Category.findOne({ categoryId: category });
      if (!cat) cat = new Category({ categoryId: category, categoryName: category, customSubcategories: [] });
      const existingIds = new Set((cat.customSubcategories || []).map((s) => s.id));
      for (const sub of subs) {
        const subId = sub.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        if (!existingIds.has(subId)) {
          cat.customSubcategories.push({ id: subId, name: sub, isCustom: true });
          existingIds.add(subId);
        }
      }
      await cat.save();
    }
  }

  console.log('\n──────── SUMMARY ────────');
  console.log(`Total items    : ${ready.length}`);
  console.log(`Clean inserts  : ${inserted}${COMMIT ? '' : ' (dry-run, not written)'}`);
  console.log(`Merged (9)     : ${merged}${COMMIT ? '' : ' (dry-run, not written)'}`);
  console.log(`Skipped (4)    : ${skipped}`);
  console.log(`Errors         : ${errors}`);
  if (!COMMIT) console.log('\nDRY-RUN only. Re-run with --commit to write.');

  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error('Fatal:', err.message);
  try { await mongoose.disconnect(); } catch (_) {}
  process.exit(1);
});
