#!/usr/bin/env node
'use strict';

/**
 * audit-zero-product-subcategories.js
 *
 * READ-ONLY. Finds navbar items (NavbarConfig) and custom subcategories
 * (Category.customSubcategories) that have zero matching *active+available*
 * products in the live DB, so they can be reviewed for removal.
 *
 * Run on the VPS (where MONGODB_URI in backend/.env is the production DB):
 *   node scripts/audit-zero-product-subcategories.js --out=scripts/zero-product-subcategories-report.json
 */
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const Product = require('../models/Product');
const NavbarConfig = require('../models/NavbarConfig');
const Category = require('../models/Category');

const args = process.argv.slice(2);
function readArgValue(name, fallback) {
  const found = args.find((a) => a.startsWith(`--${name}=`));
  return found ? found.slice(name.length + 3).trim().replace(/^"|"$/g, '') : fallback;
}
const MONGO_URI = readArgValue('uri', process.env.LIVE_MONGODB_URI || process.env.MONGODB_URI);
const OUT = readArgValue('out', 'scripts/zero-product-subcategories-report.json');

const toSlug = (s) =>
  (s ? String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') : '');

async function main() {
  if (!MONGO_URI) {
    console.error('No MONGODB_URI / LIVE_MONGODB_URI set.');
    process.exit(1);
  }
  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 8000 });
  console.log(`Connected: ${mongoose.connection.host} / ${mongoose.connection.name}\n`);

  // Live counts per category+subcategory (only what the public site actually shows)
  const bySub = await Product.aggregate([
    { $match: { status: 'active', available: true } },
    { $group: { _id: { category: '$category', subcategory: '$subcategory' }, count: { $sum: 1 } } },
  ]);

  // categorySlug -> Map<subSlug, count>  (sums all raw variants that normalize to the same slug)
  const liveCounts = new Map();
  for (const r of bySub) {
    const catSlug = toSlug(r._id.category);
    const subSlug = toSlug(r._id.subcategory);
    if (!catSlug || !subSlug) continue;
    if (!liveCounts.has(catSlug)) liveCounts.set(catSlug, new Map());
    const m = liveCounts.get(catSlug);
    m.set(subSlug, (m.get(subSlug) || 0) + r.count);
  }

  const countFor = (categoryId, subSlug) => {
    const m = liveCounts.get(toSlug(categoryId));
    return m ? (m.get(subSlug) || 0) : 0;
  };

  const report = { categories: {} };

  // --- Navbar items ---
  const navConfigs = await NavbarConfig.find({}).lean();
  for (const cfg of navConfigs) {
    const catId = cfg.categoryId;
    report.categories[catId] = report.categories[catId] || { categoryName: cfg.categoryName, navbarZero: [], customSubcategoryZero: [] };
    for (const section of cfg.sections || []) {
      for (const item of section.items || []) {
        const slug = toSlug(item.slug || item.label);
        const count = countFor(catId, slug);
        if (count === 0) {
          report.categories[catId].navbarZero.push({
            sectionId: section.id,
            sectionTitle: section.title,
            itemId: item.id,
            label: item.label,
            slug: item.slug,
          });
        }
      }
    }
  }

  // --- Category.customSubcategories ---
  const categories = await Category.find({}).lean();
  for (const cat of categories) {
    const catId = cat.categoryId;
    report.categories[catId] = report.categories[catId] || { categoryName: cat.categoryName, navbarZero: [], customSubcategoryZero: [] };
    for (const sub of cat.customSubcategories || []) {
      const slug = toSlug(sub.id || sub.name);
      const count = countFor(catId, slug);
      if (count === 0) {
        report.categories[catId].customSubcategoryZero.push({
          id: sub.id,
          name: sub.name,
        });
      }
    }
  }

  // Print summary
  console.log('ZERO-PRODUCT SUBCATEGORIES');
  console.log('='.repeat(60));
  let totalNav = 0, totalCustom = 0;
  for (const [catId, data] of Object.entries(report.categories)) {
    if (data.navbarZero.length === 0 && data.customSubcategoryZero.length === 0) continue;
    console.log(`\n${catId} (${data.categoryName})`);
    if (data.navbarZero.length) {
      console.log('  Navbar items with 0 products:');
      for (const it of data.navbarZero) console.log(`    - [${it.sectionTitle}] "${it.label}" (slug: ${it.slug})`);
      totalNav += data.navbarZero.length;
    }
    if (data.customSubcategoryZero.length) {
      console.log('  Custom subcategories (dropdown/filter list) with 0 products:');
      for (const it of data.customSubcategoryZero) console.log(`    - "${it.name}" (id: ${it.id})`);
      totalCustom += data.customSubcategoryZero.length;
    }
  }
  console.log(`\nTOTAL: ${totalNav} navbar items, ${totalCustom} custom-subcategory entries flagged.`);

  const outPath = path.isAbsolute(OUT) ? OUT : path.resolve(__dirname, '..', OUT);
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
  console.log(`\nWrote ${outPath}`);

  await mongoose.disconnect();
}

main().catch(async (e) => {
  console.error('Failed:', e.message);
  try { await mongoose.disconnect(); } catch (_) {}
  process.exit(1);
});
