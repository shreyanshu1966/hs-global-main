/**
 * Update Product URLs from CSV
 *
 * Reads old→new URL pairs from the CSV and updates each product's
 * productId, seo.slug, and seo.canonicalUrl in MongoDB.
 *
 * Usage:
 *   node scripts/update-product-urls.js --dry-run   (preview changes, no DB writes)
 *   node scripts/update-product-urls.js             (apply changes, saves revert backup)
 *   node scripts/update-product-urls.js --revert    (restore from last backup)
 */

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('../models/Product');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hs_global';
const MONGO_DB_NAME = 'hs_global_export';

const CSV_FILE_PATH = path.join(
  __dirname,
  '../../All in One Hs Global & Etsy Data Update - Live Website HS Global Export.csv'
);

const BACKUP_FILE_PATH = path.join(__dirname, '../backups/url-update-backup.json');

// ─── helpers ──────────────────────────────────────────────────────────────────

function extractSlug(url) {
  if (!url) return null;
  // Match /product/<slug>  (singular, not /products/)
  const m = url.match(/\/product\/([^\/\?#\s]+)/);
  return m ? m[1].trim() : null;
}

async function connectDB() {
  await mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
    dbName: MONGO_DB_NAME,
  });
  console.log('✅ MongoDB connected\n');
}

// ─── parse CSV ────────────────────────────────────────────────────────────────

function loadChanges() {
  if (!fs.existsSync(CSV_FILE_PATH)) {
    console.error(`❌ CSV not found: ${CSV_FILE_PATH}`);
    process.exit(1);
  }

  let content = fs.readFileSync(CSV_FILE_PATH, 'utf8');
  // Strip UTF-8 BOM
  if (content.charCodeAt(0) === 0xfeff) content = content.slice(1);

  // The first line of this CSV is blank/empty — skip it
  const lines = content.split('\n');
  if (lines[0] && lines[0].trim().match(/^,*$/)) {
    lines.shift();
    content = lines.join('\n');
  }

  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
    bom: true,
  });

  const changes = [];

  for (const row of records) {
    const oldUrl = (row['url'] || row['URL'] || '').trim();
    const newUrl = (row['New Url'] || row['new_url'] || row['New URL'] || '').trim();

    // Only care about individual product pages (singular /product/)
    if (!oldUrl || !oldUrl.includes('/product/')) continue;
    // Skip category/listing pages like /products/furniture/...
    if (oldUrl.includes('/products/')) continue;
    // Skip rows where URLs are identical (nothing to do)
    if (!newUrl || oldUrl === newUrl) continue;

    const oldSlug = extractSlug(oldUrl);
    const newSlug = extractSlug(newUrl);

    if (!oldSlug || !newSlug) continue;
    if (oldSlug === newSlug) continue;

    changes.push({ oldUrl, newUrl, oldSlug, newSlug });
  }

  return changes;
}

// ─── apply ────────────────────────────────────────────────────────────────────

async function applyUpdates(changes, dryRun) {
  const label = dryRun ? '[DRY RUN] ' : '';
  const backup = [];
  let updated = 0;
  let notFound = 0;
  let skipped = 0;

  console.log(`${label}Processing ${changes.length} URL changes...\n`);

  for (const { oldUrl, newUrl, oldSlug, newSlug } of changes) {
    // Find the product by its current productId (= old slug)
    // Fall back to seo.slug in case productId was already updated
    const found =
      (await Product.findOne({ productId: oldSlug })) ||
      (await Product.findOne({ 'seo.slug': oldSlug }));

    if (!found) {
      console.log(`  ❌ Not found: ${oldSlug}`);
      notFound++;
      continue;
    }

    // Guard: if productId is already the new slug, skip
    if (found.productId === newSlug) {
      console.log(`  ⏭  Already updated: ${newSlug}`);
      skipped++;
      continue;
    }

    // Check if new slug is taken by a different product
    const conflict = await Product.findOne({ productId: newSlug });
    if (conflict && String(conflict._id) !== String(found._id)) {
      console.log(`  ⚠️  Slug conflict (already used): ${newSlug} — skipping`);
      skipped++;
      continue;
    }

    console.log(`  ${dryRun ? '👁 ' : '✅'} ${oldSlug}  →  ${newSlug}`);

    if (!dryRun) {
      // Save backup before modifying
      backup.push({
        _id: String(found._id),
        oldProductId: found.productId,
        newProductId: newSlug,
        oldSeoSlug: found.seo?.slug || null,
        oldCanonicalUrl: found.seo?.canonicalUrl || null,
        newCanonicalUrl: newUrl,
      });

      await Product.findByIdAndUpdate(found._id, {
        $set: {
          productId: newSlug,
          'seo.slug': newSlug,
          'seo.canonicalUrl': newUrl,
        },
      });
    }

    updated++;
  }

  if (!dryRun && backup.length > 0) {
    fs.mkdirSync(path.dirname(BACKUP_FILE_PATH), { recursive: true });
    fs.writeFileSync(BACKUP_FILE_PATH, JSON.stringify(backup, null, 2), 'utf8');
    console.log(`\n💾 Backup saved to: ${BACKUP_FILE_PATH}`);
  }

  console.log('\n' + '='.repeat(60));
  console.log(`${label}SUMMARY`);
  console.log('='.repeat(60));
  console.log(`  Total changes in CSV : ${changes.length}`);
  console.log(`  ${dryRun ? 'Would update' : 'Updated'}       : ${updated}`);
  console.log(`  Not found            : ${notFound}`);
  console.log(`  Skipped              : ${skipped}`);
  console.log('='.repeat(60) + '\n');
}

// ─── revert ───────────────────────────────────────────────────────────────────

async function revert() {
  if (!fs.existsSync(BACKUP_FILE_PATH)) {
    console.error(`❌ No backup file found at: ${BACKUP_FILE_PATH}`);
    console.error('   Run the update first to create a backup.\n');
    process.exit(1);
  }

  const backup = JSON.parse(fs.readFileSync(BACKUP_FILE_PATH, 'utf8'));
  console.log(`\n🔄 Reverting ${backup.length} product URLs...\n`);

  let reverted = 0;
  let failed = 0;

  for (const entry of backup) {
    try {
      const result = await Product.findByIdAndUpdate(entry._id, {
        $set: {
          productId: entry.oldProductId,
          'seo.slug': entry.oldSeoSlug || entry.oldProductId,
          'seo.canonicalUrl': entry.oldCanonicalUrl || null,
        },
      });

      if (result) {
        console.log(`  ✅ Reverted: ${entry.newProductId}  →  ${entry.oldProductId}`);
        reverted++;
      } else {
        console.log(`  ❌ Product not found by _id: ${entry._id}`);
        failed++;
      }
    } catch (err) {
      console.error(`  ❌ Error reverting ${entry._id}: ${err.message}`);
      failed++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('REVERT SUMMARY');
  console.log('='.repeat(60));
  console.log(`  Reverted : ${reverted}`);
  console.log(`  Failed   : ${failed}`);
  console.log('='.repeat(60) + '\n');

  // Rename backup so it can't be accidentally re-applied
  const done = BACKUP_FILE_PATH.replace('.json', `-reverted-${Date.now()}.json`);
  fs.renameSync(BACKUP_FILE_PATH, done);
  console.log(`📁 Backup archived to: ${done}\n`);
}

// ─── main ─────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const isRevert = args.includes('--revert');

  try {
    await connectDB();

    if (isRevert) {
      await revert();
    } else {
      const changes = loadChanges();
      console.log(`📄 CSV: ${CSV_FILE_PATH}`);
      console.log(`🔢 Rows with URL changes: ${changes.length}\n`);
      await applyUpdates(changes, isDryRun);

      if (isDryRun) {
        console.log('ℹ️  This was a dry run. Run without --dry-run to apply changes.\n');
      }
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Fatal error:', err.message);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
}

main();
