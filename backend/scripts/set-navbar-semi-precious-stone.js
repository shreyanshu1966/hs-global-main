#!/usr/bin/env node
'use strict';
/** Set the "Semi Precious Stone" navbar subcategory config on the live (VPS) database.
 * Dry-run by default — prints the current config, a backup, and the intended change.
 * Pass --commit to actually write. */
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const CATEGORY_ID = 'semi-precious-stone';
const CATEGORY_NAME = 'Semi Precious Stone';

// Derived from live product data (backend/scripts/semi-precious-stone-live.json, fetched 2026-07-09):
// excludes generic "Gemstone" / "Semiprecious Stone" labels per user decision — those are
// catch-all values, not real stone types, and remain reachable via "All Semi Precious Stones".
// Grouped by stone family, matching the sectioned style of furniture/leather nav menus.
const SECTIONS = [
  {
    id: 'quartz-chalcedony',
    title: 'Quartz & Chalcedony',
    items: [
      { label: 'Agate', slug: 'agate' },
      { label: 'Quartz', slug: 'quartz' },
      { label: 'Jasper', slug: 'jasper' },
      { label: 'Tiger Eye', slug: 'tiger-eye' },
      { label: 'Amethyst', slug: 'amethyst' },
    ],
  },
  {
    id: 'organic-specialty',
    title: 'Organic & Specialty',
    items: [
      { label: 'Mother Of Pearl', slug: 'mother-of-pearl' },
      { label: 'Petrified Wood', slug: 'petrified-wood' },
      { label: 'Amazonite', slug: 'amazonite' },
    ],
  },
];

async function main() {
  const commit = process.argv.includes('--commit');
  // On the VPS, backend/.env's MONGODB_URI *is* the production DB (server.js's own config).
  // Locally, MONGODB_URI is the dev DB, so LIVE_MONGODB_URI (remote-access URI) takes priority instead.
  const uri = process.env.LIVE_MONGODB_URI || process.env.MONGODB_URI;
  if (!uri) {
    console.error('Neither LIVE_MONGODB_URI nor MONGODB_URI is set in backend/.env');
    process.exit(1);
  }

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  const NavbarConfig = require('../models/NavbarConfig');

  const existing = await NavbarConfig.findOne({ categoryId: CATEGORY_ID }).lean();

  const backupDir = path.join(__dirname, 'backups');
  fs.mkdirSync(backupDir, { recursive: true });
  const backupPath = path.join(backupDir, `navbar-config-${CATEGORY_ID}-${Date.now()}.json`);
  fs.writeFileSync(backupPath, JSON.stringify(existing || { categoryId: CATEGORY_ID, note: 'no existing doc' }, null, 2));
  console.log(`Backed up current config to ${backupPath}`);

  const desiredSections = SECTIONS;

  console.log('\nCurrent sections:', JSON.stringify(existing?.sections || [], null, 2));
  console.log('\nDesired sections:', JSON.stringify(desiredSections, null, 2));

  if (!commit) {
    console.log('\nDry run only — no changes written. Re-run with --commit to apply.');
    await mongoose.disconnect();
    return;
  }

  const result = await NavbarConfig.findOneAndUpdate(
    { categoryId: CATEGORY_ID },
    { categoryId: CATEGORY_ID, categoryName: CATEGORY_NAME, sections: desiredSections, updatedAt: new Date() },
    { upsert: true, new: true }
  );

  console.log('\nWrote navbar config:', JSON.stringify(result, null, 2));
  await mongoose.disconnect();
}

main().catch(async (e) => {
  console.error(e);
  try { await mongoose.disconnect(); } catch (_) {}
  process.exit(1);
});
