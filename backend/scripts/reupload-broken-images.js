#!/usr/bin/env node
'use strict';
/**
 * Uploads the local photo set for every product in the "reupload" bucket of
 * backend/scripts/broken-images-fix-plan.json (produced by
 * plan-broken-images-fix.js) to Cloudinary, REPLACING that product's entire
 * image/images/sortedImages set. This guarantees no broken links regardless
 * of which specific URLs were previously dead.
 *
 * Only talks to Cloudinary (public API) and local disk — the live Mongo
 * instance is only reachable from the VPS, so pushing the resulting payload
 * into production is a separate step: deploy/apply-broken-images-fix.js
 *
 * Cloudinary path convention (matches existing live URLs for these categories):
 *   furniture (marble)     -> hs-global/furniture/etsy/{productCode}/{n}.webp
 *   wooden-furniture        -> hs-global/handicraft/etsy/{productCode}/{n}.webp
 *   leather                 -> hs-global/leather/etsy/{leatherCode}/{n}.webp
 *
 * Usage:
 *   node backend/scripts/plan-broken-images-fix.js        # build the plan first
 *   node backend/scripts/reupload-broken-images.js         # dry run (default): just report what would upload
 *   node backend/scripts/reupload-broken-images.js --live  # actually upload to Cloudinary, write payload file
 */
const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const sharp = require('sharp');

require('dotenv').config({ path: path.join(__dirname, '../.env') });

const LIVE = process.argv.includes('--live');
const PLAN_PATH = path.join(__dirname, 'broken-images-fix-plan.json');
const PAYLOAD_PATH = path.join(__dirname, 'broken-images-fix-payload.json');

const CLOUDINARY_PREFIX = {
  furniture: 'hs-global/furniture/etsy',
  'wooden-furniture': 'hs-global/handicraft/etsy',
  leather: 'hs-global/leather/etsy',
};

function codeFor(entry) {
  return entry.category === 'leather' ? entry.leatherCode : entry.productCode;
}

async function uploadOneProduct(entry) {
  const prefix = CLOUDINARY_PREFIX[entry.category];
  const code = codeFor(entry);
  const urls = [];
  for (let i = 0; i < entry.localFiles.length; i++) {
    const filePath = entry.localFiles[i];
    const compressedBuffer = await sharp(filePath)
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    const publicId = `${prefix}/${code}/${i + 1}`;

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
  if (!fs.existsSync(PLAN_PATH)) {
    console.error(`Missing ${PLAN_PATH}`);
    console.error('Run: node backend/scripts/plan-broken-images-fix.js first.');
    process.exit(1);
  }
  const plan = JSON.parse(fs.readFileSync(PLAN_PATH, 'utf-8'));
  const entries = plan.reupload;

  const missingCode = entries.filter((e) => !codeFor(e));
  if (missingCode.length) {
    console.error(`${missingCode.length} entries have no code to build a Cloudinary path from — aborting:`);
    for (const e of missingCode) console.error(`  - ${e.productId}`);
    process.exit(1);
  }

  console.log(`Products to re-upload: ${entries.length}`);
  console.log(`Total local files to upload: ${entries.reduce((sum, e) => sum + e.localFiles.length, 0)}`);
  const byCat = {};
  for (const e of entries) byCat[e.category] = (byCat[e.category] || 0) + 1;
  console.log('By category:', byCat);

  if (!LIVE) {
    console.log('\nDry run complete. Re-run with --live to upload images to Cloudinary and produce the update payload.');
    return;
  }

  const payload = [];
  let ok = 0;
  let failed = 0;
  for (const entry of entries) {
    try {
      console.log(`\nUploading ${entry.localFiles.length} images for ${entry.productId} (${entry.localFolder})...`);
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
  console.log('\nNext: node deploy/apply-broken-images-fix.js            (dry run against live DB)');
  console.log('      node deploy/apply-broken-images-fix.js --commit    (writes to live DB)');
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
