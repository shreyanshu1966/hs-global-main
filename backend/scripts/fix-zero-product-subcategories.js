#!/usr/bin/env node
'use strict';

/**
 * fix-zero-product-subcategories.js
 *
 * Removes zero-product entries (from audit-zero-product-subcategories.js's
 * report) out of Category.customSubcategories. Dry-run by default; backs up
 * every affected Category doc before writing; --commit required to apply.
 *
 * Run on the VPS (where MONGODB_URI in backend/.env is the production DB):
 *   node scripts/fix-zero-product-subcategories.js                 # dry run
 *   node scripts/fix-zero-product-subcategories.js --commit        # apply
 */
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const Category = require('../models/Category');

const REPORT_PATH = path.join(__dirname, 'zero-product-subcategories-report.json');

async function main() {
  const commit = process.argv.includes('--commit');
  const uri = process.env.LIVE_MONGODB_URI || process.env.MONGODB_URI;
  if (!uri) {
    console.error('Neither LIVE_MONGODB_URI nor MONGODB_URI is set in backend/.env');
    process.exit(1);
  }
  if (!fs.existsSync(REPORT_PATH)) {
    console.error(`Report not found: ${REPORT_PATH}. Run audit-zero-product-subcategories.js first.`);
    process.exit(1);
  }
  const report = JSON.parse(fs.readFileSync(REPORT_PATH, 'utf8'));

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  console.log(`Connected: ${mongoose.connection.host} / ${mongoose.connection.name}\n`);

  const backupDir = path.join(__dirname, 'backups');
  fs.mkdirSync(backupDir, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(backupDir, `PROD_categories_pre_zero_subcat_cleanup_${timestamp}.json`);

  const affectedCategoryIds = Object.entries(report.categories)
    .filter(([, data]) => (data.customSubcategoryZero || []).length > 0)
    .map(([catId]) => catId);

  if (affectedCategoryIds.length === 0) {
    console.log('Nothing to remove.');
    await mongoose.disconnect();
    return;
  }

  const before = await Category.find({ categoryId: { $in: affectedCategoryIds } }).lean();
  fs.writeFileSync(backupPath, JSON.stringify(before, null, 2));
  console.log(`Backed up ${before.length} category doc(s) to ${backupPath}\n`);

  let totalRemoved = 0;
  for (const catId of affectedCategoryIds) {
    const data = report.categories[catId];
    const idsToRemove = new Set((data.customSubcategoryZero || []).map((s) => s.id));
    const category = await Category.findOne({ categoryId: catId });
    if (!category) {
      console.log(`  [skip] Category "${catId}" not found (may have changed since audit).`);
      continue;
    }

    const before2 = category.customSubcategories.map((s) => s.name);
    const kept = category.customSubcategories.filter((s) => !idsToRemove.has(s.id));
    const removed = category.customSubcategories.filter((s) => idsToRemove.has(s.id));

    console.log(`${catId} (${data.categoryName})`);
    console.log(`  Before: [${before2.join(', ')}]`);
    console.log(`  Removing: [${removed.map((s) => s.name).join(', ')}]`);
    console.log(`  After:  [${kept.map((s) => s.name).join(', ')}]\n`);

    totalRemoved += removed.length;

    if (commit) {
      category.customSubcategories = kept;
      category.updatedAt = Date.now();
      await category.save();
    }
  }

  if (!commit) {
    console.log(`Dry run only — ${totalRemoved} entries would be removed. Re-run with --commit to apply.`);
  } else {
    console.log(`Committed — removed ${totalRemoved} zero-product subcategory entries.`);
  }

  await mongoose.disconnect();
}

main().catch(async (e) => {
  console.error(e);
  try { await mongoose.disconnect(); } catch (_) {}
  process.exit(1);
});
