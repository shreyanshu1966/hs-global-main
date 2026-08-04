#!/usr/bin/env node
'use strict';

/**
 * add-missing-products.js
 * ------------------------------------------------------------------
 * Adds the wooden-furniture (handicraft CSV) and furniture (marble CSV)
 * products that final-missing-diff.js found missing from the live DB.
 * Upsert-only (matched by productCode) — never deletes existing products.
 *
 * Usage:
 *   node scripts/add-missing-products.js --step=1
 *   node scripts/add-missing-products.js --step=2 [--skip-upload]
 *   node scripts/add-missing-products.js --step=3 [--commit]
 *
 * --dry-run implies --skip-upload (step 2) and skips writes (step 3).
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const sharp = require('sharp');
const { parse: parseCsv } = require('csv-parse/sync');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const Product = require('../models/Product');
const Category = require('../models/Category');

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const SKIP_UPLOAD = args.includes('--skip-upload') || DRY_RUN;
const COMMIT = args.includes('--commit') && !DRY_RUN;
const STEP = (args.find((a) => a.startsWith('--step=')) || '').split('=')[1] || '1';

const ROOT = path.join(__dirname, '..', '..');
const SCRIPTS_DIR = __dirname;

const HANDICRAFT_CSV = path.join(ROOT, 'new products', 'Latest Etsy & HS All Product Title Desc  April -May 2026 - handicraft product listing.csv');
const MARBLE_CSV = path.join(ROOT, 'new products', 'Latest Etsy & HS All Product Title Desc  April -May 2026 -  marble  Listing .csv');
const HANDICRAFT_PHOTOS_DIR = path.join(ROOT, 'new products', 'HANDICRAFT PRODUCTS');
const MARBLE_PHOTOS_DIR = path.join(ROOT, 'new products', 'marble  Etsy All Product Photos');
const FRONTEND_VIDEOS_DIR = path.join(ROOT, 'frontend-new', 'public', 'videos', 'etsy');

const MISSING_REPORT = path.join(SCRIPTS_DIR, 'final_missing_products_report.json');
const STEP1_FILE = path.join(SCRIPTS_DIR, 'missing-products-step1.json');
const STEP2_FILE = path.join(SCRIPTS_DIR, 'missing-products-step2.json');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const log = {
  info: (...a) => console.log('ℹ️ ', ...a),
  ok: (...a) => console.log('✅', ...a),
  warn: (...a) => console.log('⚠️ ', ...a),
  error: (...a) => console.error('❌', ...a),
  step: (...a) => console.log('\n' + '─'.repeat(60) + '\n🔷', ...a),
};

// ─────────────────────────────────────────────────────────────
// SHARED HELPERS
// ─────────────────────────────────────────────────────────────
const toSlug = (str) => String(str || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const toTitleCase = (str) =>
  String(str || '')
    .trim()
    .split(/\s+/)
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : w))
    .join(' ');

function stripDesignForAges(text) {
  if (!text) return '';
  return String(text)
    .replace(/\r\n/g, '\n')
    .replace(/\n?\s*-{3,}\s*\n\s*\|\s*design\s*for\s*ages\b/gi, '')
    .replace(/\s*[|]\s*design\s*for\s*ages\b/gi, '')
    .replace(/\bby\s+design\s+for\s+ages\b/gi, '')
    .replace(/\bdesign\s*for\s*ages\b/gi, '')
    .replace(/\bdesignforages\b/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function cleanTags(tagsRaw) {
  if (!tagsRaw) return [];
  const tags = String(tagsRaw)
    .split(/[\n,]/)
    .map((t) => stripDesignForAges(t).trim())
    .filter(Boolean)
    .filter((t) => !/^design\s*for\s*ages$/i.test(t) && !/^designforages$/i.test(t));
  if (!tags.includes('etsy')) tags.push('etsy');
  return tags;
}

function parseUSD(raw) {
  if (!raw) return null;
  const cleaned = String(raw).replace(/[^0-9.]/g, '');
  const val = parseFloat(cleaned);
  return Number.isFinite(val) ? val : null;
}

function buildPhotoFolderMap(dir) {
  if (!fs.existsSync(dir)) return {};
  const folders = fs.readdirSync(dir).filter((f) => fs.statSync(path.join(dir, f)).isDirectory());
  const map = {};
  for (const f of folders) {
    const m = f.match(/^\d+\.\s*([A-Za-z0-9]+)[\s-]/);
    if (m) map[m[1].toUpperCase()] = f;
  }
  return map;
}

function collectFiles(dir, exts) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  const stack = [dir];
  while (stack.length) {
    const cur = stack.pop();
    for (const item of fs.readdirSync(cur)) {
      const full = path.join(cur, item);
      if (fs.statSync(full).isDirectory()) stack.push(full);
      else if (exts.test(item)) results.push(full);
    }
  }
  results.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
  return results;
}

// ─────────────────────────────────────────────────────────────
// STEP 1: PARSE CSVs + RESOLVE PHOTOS FOR THE MISSING CODES
// ─────────────────────────────────────────────────────────────
function parseHandicraftCsv() {
  const rows = parseCsv(fs.readFileSync(HANDICRAFT_CSV, 'utf8'), { columns: false, skip_empty_lines: true, relax_column_count: true });
  const byCode = {};
  for (let i = 2; i < rows.length; i++) {
    const r = rows[i];
    if (!r || r.length < 13) continue;
    const code = (r[3] || '').trim().toUpperCase();
    if (!code) continue;
    byCode[code] = {
      subcategoryRaw: (r[2] || '').trim(),
      name: stripDesignForAges((r[12] || '').trim()),
      description: stripDesignForAges((r[13] || '').trim()),
      tags: cleanTags(r[14]),
      hsPrice: parseUSD(r[7]),
      etsyPrice: parseUSD(r[8]),
    };
  }
  return byCode;
}

function parseMarbleCsv() {
  const rows = parseCsv(fs.readFileSync(MARBLE_CSV, 'utf8'), { columns: false, skip_empty_lines: true, relax_column_count: true });
  const byCode = {};
  for (let i = 3; i < rows.length; i++) {
    const r = rows[i];
    if (!r || r.length < 10) continue;
    const code = (r[2] || '').trim().toUpperCase();
    if (!code) continue;
    byCode[code] = {
      subcategoryRaw: (r[1] || '').trim(),
      name: stripDesignForAges((r[9] || '').trim()),
      description: stripDesignForAges((r[10] || '').trim()),
      tags: cleanTags(r[11]),
      hsPrice: null,
      etsyPrice: parseUSD(r[6]),
    };
  }
  return byCode;
}

function runStep1() {
  log.step('STEP 1: Parsing CSVs and resolving photo folders for missing codes');

  if (!fs.existsSync(MISSING_REPORT)) {
    log.error(`Missing report not found: ${MISSING_REPORT}. Run final-missing-diff.js first.`);
    return;
  }
  const report = JSON.parse(fs.readFileSync(MISSING_REPORT, 'utf8'));

  const handicraftRows = parseHandicraftCsv();
  const marbleRows = parseMarbleCsv();
  const woodFolders = buildPhotoFolderMap(HANDICRAFT_PHOTOS_DIR);
  const marbleFolders = buildPhotoFolderMap(MARBLE_PHOTOS_DIR);

  const usedIds = new Set();
  function uniqueId(base) {
    let id = base || 'product';
    let i = 2;
    while (usedIds.has(id)) { id = `${base}-${i}`; i++; }
    usedIds.add(id);
    return id;
  }

  function buildItem(code, csvRow, folderMap, photosDir, category) {
    const folderName = folderMap[code];
    if (!folderName) {
      return { blocked: true, code, category, reason: 'no-photo-folder' };
    }
    const folderPath = path.join(photosDir, folderName);
    const images = collectFiles(folderPath, /\.(jpg|jpeg|png|webp)$/i);
    if (images.length === 0) {
      return { blocked: true, code, category, reason: 'no-images-in-folder' };
    }
    const videos = collectFiles(folderPath, /\.(mp4|mov)$/i);

    if (!csvRow) {
      return { blocked: true, code, category, reason: 'no-csv-row' };
    }

    const name = csvRow.name || code;
    const productId = uniqueId(toSlug(name) || toSlug(code));

    return {
      blocked: false,
      code,
      category,
      productId,
      name,
      description: csvRow.description || name,
      subcategory: toTitleCase(csvRow.subcategoryRaw) || 'Other',
      tags: csvRow.tags,
      hsPrice: csvRow.hsPrice,
      etsyPrice: csvRow.etsyPrice,
      localImages: images,
      localVideo: videos[0] || null,
    };
  }

  const woodenItems = report.wooden.missing.map((m) => buildItem(m.code.toUpperCase(), handicraftRows[m.code.toUpperCase()], woodFolders, HANDICRAFT_PHOTOS_DIR, 'wooden-furniture'));
  const marbleItems = report.marble.missing.map((m) => buildItem(m.code.toUpperCase(), marbleRows[m.code.toUpperCase()], marbleFolders, MARBLE_PHOTOS_DIR, 'furniture'));

  const all = [...woodenItems, ...marbleItems];
  const ready = all.filter((i) => !i.blocked);
  const blocked = all.filter((i) => i.blocked);

  fs.writeFileSync(STEP1_FILE, JSON.stringify({ ready, blocked }, null, 2));

  const readyWood = ready.filter((i) => i.category === 'wooden-furniture').length;
  const readyMarble = ready.filter((i) => i.category === 'furniture').length;

  log.ok(`wooden-furniture ready: ${readyWood} / ${report.wooden.missing.length}`);
  log.ok(`furniture (marble) ready: ${readyMarble} / ${report.marble.missing.length}`);
  if (blocked.length) {
    log.warn(`Blocked (skipped): ${blocked.length}`);
    blocked.forEach((b) => console.log(`    ${b.code} [${b.category}] — ${b.reason}`));
  }
  log.ok(`Saved → ${STEP1_FILE}`);
}

// ─────────────────────────────────────────────────────────────
// STEP 2: UPLOAD IMAGES TO CLOUDINARY
// ─────────────────────────────────────────────────────────────
const CLOUDINARY_PREFIX = {
  'wooden-furniture': 'handicraft',
  'furniture': 'furniture',
};

async function uploadImage(localPath, publicId) {
  const compressedBuffer = await sharp(localPath)
    .resize({ width: 2000, withoutEnlargement: true })
    .webp({ quality: 80, effort: 4 })
    .toBuffer();

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { public_id: publicId, resource_type: 'image', overwrite: false, format: 'webp' },
      (error, result) => {
        if (error) {
          if (error.http_code === 400 && error.message?.includes('already exists')) {
            resolve(`https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${publicId}.webp`);
          } else {
            reject(error);
          }
        } else {
          resolve(result.secure_url);
        }
      }
    );
    uploadStream.end(compressedBuffer);
  });
}

async function runStep2() {
  log.step(`STEP 2: Cloudinary upload${SKIP_UPLOAD ? ' (SKIPPED — dry run)' : ''}`);

  if (!fs.existsSync(STEP1_FILE)) return log.error('Step 1 JSON not found. Run --step=1 first.');
  const { ready } = JSON.parse(fs.readFileSync(STEP1_FILE, 'utf8'));

  for (const item of ready) {
    log.info(`[${item.code}] Uploading ${item.localImages.length} image(s) for: ${item.name}`);
    const prefix = CLOUDINARY_PREFIX[item.category];
    const urls = [];

    for (const imgPath of item.localImages) {
      const fileBase = path.basename(imgPath, path.extname(imgPath));
      const publicId = `hs-global/${prefix}/etsy/${item.code}/${fileBase}`;
      if (SKIP_UPLOAD) {
        urls.push(`https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME || 'cloud_name'}/image/upload/${publicId}.webp`);
      } else {
        try {
          urls.push(await uploadImage(imgPath, publicId));
        } catch (err) {
          log.warn(`Upload failed for ${imgPath}: ${err.message}`);
        }
      }
    }
    item.images = urls;

    item.videoUrl = null;
    if (item.localVideo) {
      const destDir = path.join(FRONTEND_VIDEOS_DIR, item.code);
      const destPath = path.join(destDir, 'video.mp4');
      if (!SKIP_UPLOAD) {
        fs.mkdirSync(destDir, { recursive: true });
        fs.copyFileSync(item.localVideo, destPath);
      }
      item.videoUrl = `/videos/etsy/${item.code}/video.mp4`;
    }
  }

  fs.writeFileSync(STEP2_FILE, JSON.stringify({ ready }, null, 2));
  log.ok(`Saved → ${STEP2_FILE}`);
}

// ─────────────────────────────────────────────────────────────
// STEP 3: UPSERT INTO MONGODB
// ─────────────────────────────────────────────────────────────
async function getUsdToInrRate() {
  const doc = await mongoose.connection.db.collection('currencies').findOne({ base: 'USD' });
  return doc?.rates?.INR || null;
}

async function runStep3() {
  log.step(`STEP 3: Mongo upsert (${COMMIT ? 'COMMIT' : 'DRY-RUN'})`);

  if (!fs.existsSync(STEP2_FILE)) return log.error('Step 2 JSON not found. Run --step=2 first.');
  const { ready } = JSON.parse(fs.readFileSync(STEP2_FILE, 'utf8'));

  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hs_global_export';
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  log.ok(`Connected: ${mongoose.connection.host}/${mongoose.connection.name}`);

  const rate = await getUsdToInrRate();
  if (rate) log.info(`USD → INR rate: ${rate}`);
  else log.warn('No live USD→INR rate found in "currencies" collection — prices will be left unset.');

  const subcatsByCategory = {};
  let inserted = 0, updated = 0, errors = 0;

  for (const item of ready) {
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
      shipping: {
        requiresShipping: true,
        shippingClass: 'fragile',
        handlingTime: '15-20 business days',
      },
      manufacturing: {
        isCustomMade: true,
        countryOfOrigin: 'India',
      },
    };

    console.log(`\n• [${item.category}] ${item.code} → ${item.productId}`);
    console.log(`    name: ${item.name}`);
    console.log(`    subcategory: ${item.subcategory}`);
    console.log(`    images: ${item.images.length}${item.videoUrl ? ' + video' : ''}`);
    console.log(`    priceINR: ${priceINR !== undefined ? priceINR : '(unset — Price on Request)'}`);

    if (!subcatsByCategory[item.category]) subcatsByCategory[item.category] = new Set();
    subcatsByCategory[item.category].add(item.subcategory);

    if (COMMIT) {
      try {
        const existed = await Product.exists({ productCode: item.code });
        await Product.updateOne({ productCode: item.code }, { $set: doc }, { upsert: true });
        existed ? updated++ : inserted++;
      } catch (err) {
        errors++;
        log.error(`  ${item.code}: ${err.message}`);
      }
    }
  }

  if (COMMIT) {
    for (const [category, subs] of Object.entries(subcatsByCategory)) {
      let cat = await Category.findOne({ categoryId: category });
      if (!cat) cat = new Category({ categoryId: category, categoryName: toTitleCase(category.replace(/-/g, ' ')), customSubcategories: [] });
      const existingIds = new Set((cat.customSubcategories || []).map((s) => s.id));
      for (const sub of subs) {
        const subId = toSlug(sub);
        if (!existingIds.has(subId)) {
          cat.customSubcategories.push({ id: subId, name: sub, isCustom: true });
          existingIds.add(subId);
        }
      }
      await cat.save();
    }
  }

  console.log('\n──────── SUMMARY ────────');
  console.log(`Prepared : ${ready.length}`);
  if (COMMIT) {
    console.log(`Inserted : ${inserted}`);
    console.log(`Updated  : ${updated}`);
    console.log(`Errors   : ${errors}`);
  } else {
    console.log('DRY-RUN only. Re-run with --commit to write these to MongoDB.');
  }

  await mongoose.disconnect();
}

async function main() {
  if (STEP === '1') runStep1();
  else if (STEP === '2') await runStep2();
  else if (STEP === '3') await runStep3();
  else log.error('Invalid step. Use --step=1, --step=2, or --step=3');
}

main().catch(async (err) => {
  log.error('Fatal:', err.message);
  try { await mongoose.disconnect(); } catch (_) {}
  process.exit(1);
});
