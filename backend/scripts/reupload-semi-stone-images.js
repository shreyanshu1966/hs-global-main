#!/usr/bin/env node
'use strict';
/**
 * Reupload photos for every semi-precious-stone product from the local reshoot
 * folders in "new products/semi precious stones/<date>/<STONE NAME>/".
 *
 * This script only talks to Cloudinary (a public API reachable from anywhere)
 * and local disk. The live Mongo instance is only reachable from the VPS
 * itself, so pushing the resulting payload into the production DB is a
 * separate step — see deploy/apply-semi-stone-images.js.
 *
 * Usage:
 *   node backend/scripts/reupload-semi-stone-images.js         # dry run (default): build + review the mapping only
 *   node backend/scripts/reupload-semi-stone-images.js --live  # upload matched images to Cloudinary, write payload file
 */
const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const sharp = require('sharp');

require('dotenv').config({ path: path.join(__dirname, '../.env') });

const LIVE = process.argv.includes('--live');
const PHOTOS_ROOT = path.join(__dirname, '../../new products/semi precious stones');
const LIVE_SNAPSHOT_PATH = path.join(__dirname, 'semi-precious-stone-live.json');
const REPORT_PATH = path.join(__dirname, 'semi-stone-image-mapping-report.json');
const PAYLOAD_PATH = path.join(__dirname, 'semi-stone-image-update-payload.json');

// Explicit overrides for stones whose local folder name doesn't normalize to
// the same string as the DB productId (spelling variants, word order,
// "-Slabs"/"-Retro" suffixes, or a reshoot living under a different name).
// Built by hand from the folder/product diff during planning - keep this
// list reviewable rather than relying on fuzzy string matching.
const ALIAS = {
  'African-Carnelian': 'AFRICAN CARNALIN',
  'Crystal-Agate-With-Golden-Glitter': 'CRYSTAL AGATE GOLD GLITTER',
  'Banded-Agate-Slab': 'BANDED AGATE',
  'Mix-Agate-Slabs': 'MIX AGATE',
  'Straight-Line': 'STRAIGHT LINE AGATE',
  'Amethyst': 'AMEHTYST',
  'Malachite-Flower-Slabs': 'MALACHITE FLOWER',
  'Lapis-Lazulli': 'LAPIZ LAZULI',
  'Jamaican-Jasper-Slabs': 'jamaican jasper',
  'Green-Abalone': 'GREEN ABELONE',
  'Rose-Quartz-Slabs': 'ROSE QUARTZ',
  'White-Quartz-with-Sparkle': 'WHITE CRYSTAL QUARTZ',
  'Obsidian-Black-with-Gold': 'black obsidian with gold',
  'Septaria-Yellow': 'SEPTARIAN YELLOW',
  'Golden-Hematite-Quartz-Slab': 'GOLD HEMOTIED QUARTZ',
  'Blue-Calcite': 'CALCITE BLUE',
  'Obsidian-Black-with-Silver': 'BLACK OBSIDIAN WITH SILVER',
  'crystal-quartz-with-rose-gold': 'CRYSTAL QUARTZ ROSE GOLD',
  'Red-Carnelian-Agate-Slabs': 'RED CARNALIN',
  'Tiger-Eye-Retro': 'TIGER EYE RANDOM',
  'Black-Petrified-Wood-Retro-Slab': 'BLACK PETRIFIED WOOD RETRO',
  'Brown-Petrified-Wood-Slabs': 'Brown Petrified Wood',
  'Brown-Petrified-Wood-Retro-Slabs': 'BROWN PETRIFIED WOOD RETRO',
  'Beige-Petrified-Wood-Slab': 'BEIGE PETRIFIED WOOD RETRO',
  // Two DB products share one folder because the DB itself has a likely-duplicate
  // entry (productId differs only by case). Flagged in the report as "sharedFolder".
  'Mix-Agate': 'MIX AGATE',
  'Rose-Quartz': 'ROSE QUARTZ',
  'Smoky-Quartz-Dark': 'SMOKEY QUARTZ',
  'smoky-quartz-dark': 'SMOKEY QUARTZ',
};

// productIds we know can't be matched confidently (ambiguous pool or no local
// folder at all). Left out of ALIAS on purpose - reported as unmatched.
const KNOWN_UNMATCHED = ['Golden-Hematite', 'White-Quartz'];

function normalize(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ');
}

function parseFolderDate(dateStr) {
  // folder dates are DD-MM-YY
  const [dd, mm, yy] = dateStr.split('-').map(Number);
  return new Date(2000 + yy, mm - 1, dd);
}

function collectLocalFolders() {
  const byNormalizedName = new Map(); // normalized -> { name, date, dateObj, dirPath, files }
  const dateDirs = fs.readdirSync(PHOTOS_ROOT, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name);

  for (const dateDir of dateDirs) {
    const dateObj = parseFolderDate(dateDir);
    const stoneDirs = fs.readdirSync(path.join(PHOTOS_ROOT, dateDir), { withFileTypes: true })
      .filter((e) => e.isDirectory());

    for (const stoneDir of stoneDirs) {
      const dirPath = path.join(PHOTOS_ROOT, dateDir, stoneDir.name);
      const files = fs.readdirSync(dirPath)
        .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
        .sort((a, b) => {
          const na = parseInt(a, 10);
          const nb = parseInt(b, 10);
          if (!isNaN(na) && !isNaN(nb)) return na - nb;
          return a.localeCompare(b);
        })
        .map((f) => path.join(dirPath, f));

      const key = normalize(stoneDir.name);
      const existing = byNormalizedName.get(key);
      if (!existing || dateObj > existing.dateObj) {
        byNormalizedName.set(key, { name: stoneDir.name, date: dateDir, dateObj, dirPath, files });
      }
    }
  }
  return byNormalizedName;
}

function buildMapping(products, folderIndex) {
  const matched = [];
  const unmatchedProducts = [];
  const usedFolderKeys = new Set();

  for (const p of products) {
    let folder = null;

    if (ALIAS[p.productId]) {
      const aliasKey = normalize(ALIAS[p.productId]);
      folder = folderIndex.get(aliasKey);
    } else {
      const key = normalize(p.productId.replace(/-/g, ' '));
      folder = folderIndex.get(key);
    }

    if (folder) {
      usedFolderKeys.add(normalize(folder.name));
      matched.push({
        productId: p.productId,
        name: p.name,
        subcategory: p.subcategory,
        currentImageCount: (p.images || []).length,
        localFolder: `${folder.date}/${folder.name}`,
        localImageCount: folder.files.length,
        files: folder.files,
        sharedFolder: matched.some((m) => m.localFolder === `${folder.date}/${folder.name}`),
      });
    } else {
      unmatchedProducts.push({
        productId: p.productId,
        name: p.name,
        subcategory: p.subcategory,
        reason: KNOWN_UNMATCHED.includes(p.productId) ? 'no confident local folder (ambiguous/no shoot)' : 'no match found',
      });
    }
  }

  const unusedFolders = [];
  for (const [key, folder] of folderIndex.entries()) {
    if (!usedFolderKeys.has(key)) {
      unusedFolders.push({ name: folder.name, date: folder.date, imageCount: folder.files.length, path: folder.dirPath });
    }
  }

  return { matched, unmatchedProducts, unusedFolders };
}

async function uploadOneProduct(entry) {
  const urls = [];
  for (let i = 0; i < entry.files.length; i++) {
    const filePath = entry.files[i];
    const compressedBuffer = await sharp(filePath)
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    const publicId = `hs-global/products/semi-precious-stone/${entry.subcategory}/${entry.productId}/${i + 1}`;

    const url = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { public_id: publicId, format: 'webp', overwrite: true },
        (error, result) => (error ? reject(error) : resolve(result.secure_url))
      );
      uploadStream.end(compressedBuffer);
    });
    urls.push(url);
  }
  return urls;
}

async function main() {
  const products = JSON.parse(fs.readFileSync(LIVE_SNAPSHOT_PATH, 'utf-8'));
  const folderIndex = collectLocalFolders();
  const { matched, unmatchedProducts, unusedFolders } = buildMapping(products, folderIndex);

  const report = {
    generatedAt: new Date().toISOString(),
    totalProducts: products.length,
    matchedCount: matched.length,
    unmatchedCount: unmatchedProducts.length,
    unusedFolderCount: unusedFolders.length,
    matched: matched.map(({ files, ...rest }) => rest),
    unmatchedProducts,
    unusedFolders,
  };
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));

  console.log(`Products: ${products.length}  Matched: ${matched.length}  Unmatched: ${unmatchedProducts.length}  Unused local folders: ${unusedFolders.length}`);
  console.log(`Report written to ${REPORT_PATH}`);

  if (unmatchedProducts.length) {
    console.log('\nUnmatched products (no images will be touched for these):');
    for (const u of unmatchedProducts) console.log(`  - ${u.productId} (${u.reason})`);
  }
  if (unusedFolders.length) {
    console.log('\nLocal folders not used by any product:');
    for (const f of unusedFolders) console.log(`  - ${f.date}/${f.name}`);
  }

  if (!LIVE) {
    console.log('\nDry run complete. Re-run with --live to upload images to Cloudinary and produce the update payload.');
    return;
  }

  // The live Mongo instance is only reachable from the VPS itself (see
  // deploy/apply-competitor-pricing.js), so this step only uploads to
  // Cloudinary (a public API) and writes a payload file. Pushing that
  // payload into the production DB is a separate step:
  //   node deploy/apply-semi-stone-images.js           (dry run on the VPS)
  //   node deploy/apply-semi-stone-images.js --commit  (writes to live DB)
  const payload = [];
  let ok = 0;
  let failed = 0;
  for (const entry of matched) {
    try {
      console.log(`\nUploading ${entry.localImageCount} images for ${entry.productId} (${entry.localFolder})...`);
      const urls = await uploadOneProduct(entry);
      payload.push({ productId: entry.productId, image: urls[0], images: urls, sortedImages: urls });
      console.log(`  Done: ${urls.length} images uploaded to Cloudinary.`);
      ok++;
    } catch (err) {
      console.error(`  Failed for ${entry.productId}: ${err.message}`);
      failed++;
    }
  }

  fs.writeFileSync(PAYLOAD_PATH, JSON.stringify(payload, null, 2));
  console.log(`\nCloudinary upload complete. Success: ${ok}  Failed: ${failed}`);
  console.log(`Payload written to ${PAYLOAD_PATH}`);
  console.log('\nNext: node deploy/apply-semi-stone-images.js         (dry run against live DB)');
  console.log('      node deploy/apply-semi-stone-images.js --commit (writes to live DB)');
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
