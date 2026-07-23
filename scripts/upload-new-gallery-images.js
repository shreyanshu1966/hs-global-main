/**
 * Scans every category folder under frontend-new/public/gallery, finds images
 * that are not yet present in cloudinary-responsive-urls.json, uploads them to
 * Cloudinary as responsive WebP variants (mobile/tablet/desktop/large), and
 * merges the new entries in without touching existing ones. Generalized,
 * incremental version of upload-semi-precious-stone-gallery.js — run this any
 * time new images are dropped into gallery category folders.
 *
 * Usage:
 *   node scripts/upload-new-gallery-images.js --dry-run   (default)
 *   node scripts/upload-new-gallery-images.js --commit
 */
const sharp = require('sharp');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const COMMIT = process.argv.includes('--commit');

const GALLERY_DIR = path.join(__dirname, '../frontend-new/public/gallery');
const URLS_JSON = path.join(__dirname, '../cloudinary-responsive-urls.json');
const TEMP_DIR = path.join(__dirname, '../temp-new-gallery-images');

const RESOLUTIONS = {
  mobile: 480,
  tablet: 768,
  desktop: 1200,
  large: 1920,
};

const QUALITY = { min: 75, max: 90, start: 85 }; // same as 'gallery' category in smart-responsive-upload.js

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

async function smartCompress(inputPath, outputPath, targetWidth, originalSize) {
  let quality = QUALITY.start;
  const metadata = await sharp(inputPath).metadata();

  let width = targetWidth;
  let height = Math.round((metadata.height * targetWidth) / metadata.width);
  if (width > metadata.width) {
    width = metadata.width;
    height = metadata.height;
  }

  let attempt = 0;
  let bestQuality = quality;
  let bestSize = Infinity;
  let bestPath = null;

  while (attempt < 5) {
    const tempPath = outputPath.replace('.webp', `_q${quality}.webp`);
    await sharp(inputPath)
      .resize(width, height, { fit: 'inside', withoutEnlargement: true, kernel: sharp.kernel.lanczos3 })
      .webp({ quality, effort: 6, smartSubsample: true })
      .toFile(tempPath);

    const compressedSize = fs.statSync(tempPath).size;

    if (compressedSize < originalSize && compressedSize < bestSize) {
      if (bestPath && fs.existsSync(bestPath)) fs.unlinkSync(bestPath);
      bestSize = compressedSize;
      bestQuality = quality;
      bestPath = tempPath;
    } else if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }

    if (compressedSize > originalSize) {
      quality = Math.max(QUALITY.min, quality - 5);
    } else if (compressedSize < originalSize * 0.7) {
      quality = Math.min(QUALITY.max, quality + 3);
    } else {
      break;
    }

    attempt++;
    if (quality <= QUALITY.min || quality >= QUALITY.max) break;
  }

  if (bestPath && fs.existsSync(bestPath)) {
    if (bestPath !== outputPath) fs.renameSync(bestPath, outputPath);
    return { success: true, size: bestSize, quality: bestQuality, width, height };
  }
  return { success: false };
}

async function main() {
  console.log(`Mode: ${COMMIT ? 'COMMIT (will upload + write)' : 'DRY RUN (no upload, no write)'}\n`);

  if (!fs.existsSync(GALLERY_DIR)) {
    console.error(`Gallery dir not found: ${GALLERY_DIR}`);
    process.exit(1);
  }

  const existing = JSON.parse(fs.readFileSync(URLS_JSON, 'utf-8'));

  const categories = fs.readdirSync(GALLERY_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  const pending = [];
  for (const category of categories) {
    const dir = path.join(GALLERY_DIR, category);
    const files = fs.readdirSync(dir).filter(f => /\.(jpe?g|png|webp)$/i.test(f));
    for (const file of files) {
      const baseName = path.basename(file, path.extname(file));
      const key = `gallery/${category}/${baseName}.webp`;
      if (!existing.urls[key]) {
        pending.push({ category, file, baseName, key, inputPath: path.join(dir, file) });
      }
    }
  }

  if (pending.length === 0) {
    console.log('No new gallery images found. Everything is already uploaded.');
    return;
  }

  console.log(`Found ${pending.length} new image(s) not yet in cloudinary-responsive-urls.json:`);
  pending.forEach(p => console.log(`  - [${p.category}] ${p.file}`));
  console.log();

  if (!COMMIT) {
    console.log('Dry run complete. Re-run with --commit to process + upload.');
    return;
  }

  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error('Missing Cloudinary credentials in backend/.env');
    process.exit(1);
  }
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  fs.mkdirSync(TEMP_DIR, { recursive: true });

  let newCount = 0;

  for (const { category, file, baseName, key, inputPath } of pending) {
    const originalSize = fs.statSync(inputPath).size;
    const metadata = await sharp(inputPath).metadata();

    console.log(`\nProcessing [${category}]: ${file} (${formatBytes(originalSize)}, ${metadata.width}x${metadata.height})`);

    const variants = {};
    for (const [breakpoint, targetWidth] of Object.entries(RESOLUTIONS)) {
      if (targetWidth > metadata.width) {
        console.log(`  skip ${breakpoint} (larger than original)`);
        continue;
      }
      const outPath = path.join(TEMP_DIR, `${baseName}_${breakpoint}.webp`);
      const result = await smartCompress(inputPath, outPath, targetWidth, originalSize);
      if (!result.success) {
        console.log(`  ${breakpoint}: compression failed, skipping`);
        continue;
      }

      const uploadResult = await cloudinary.uploader.upload(outPath, {
        folder: `hs-global/gallery/${category}`,
        public_id: `${baseName}_${breakpoint}`,
        use_filename: false,
        unique_filename: false,
        overwrite: true,
        resource_type: 'auto',
      });

      variants[breakpoint] = {
        url: uploadResult.secure_url,
        width: uploadResult.width,
        height: uploadResult.height,
        bytes: uploadResult.bytes,
      };
      console.log(`  ${breakpoint}: uploaded (Q${result.quality}, ${formatBytes(uploadResult.bytes)})`);

      if (fs.existsSync(outPath)) fs.unlinkSync(outPath);
    }

    if (Object.keys(variants).length === 0) continue;

    existing.urls[key] = {
      original: key,
      category: 'gallery',
      variants,
      metadata: {
        originalWidth: metadata.width,
        originalHeight: metadata.height,
        originalSize,
      },
    };
    newCount++;
  }

  fs.writeFileSync(URLS_JSON, JSON.stringify(existing, null, 2));
  console.log(`\nMerged ${newCount} new gallery entries into cloudinary-responsive-urls.json`);

  fs.rmSync(TEMP_DIR, { recursive: true, force: true });
  console.log('Cleaned up temp files.');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
