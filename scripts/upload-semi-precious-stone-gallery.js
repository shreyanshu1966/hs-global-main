/**
 * Uploads the new "Semi precious Stone" gallery folder to Cloudinary as
 * responsive WebP variants (mobile/tablet/desktop/large), and merges the
 * result into cloudinary-responsive-urls.json without touching existing
 * entries. Mirrors the logic in cloudinary-smart-responsive-upload.js but
 * scoped to frontend-new/public/gallery and a single folder.
 *
 * Usage:
 *   node scripts/upload-semi-precious-stone-gallery.js --dry-run   (default)
 *   node scripts/upload-semi-precious-stone-gallery.js --commit
 */
const sharp = require('sharp');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const COMMIT = process.argv.includes('--commit');

const SOURCE_DIR = path.join(__dirname, '../frontend-new/public/gallery/Semi precious Stone');
const URLS_JSON = path.join(__dirname, '../cloudinary-responsive-urls.json');
const TEMP_DIR = path.join(__dirname, '../temp-semi-precious-stone');

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

  if (!fs.existsSync(SOURCE_DIR)) {
    console.error(`Source dir not found: ${SOURCE_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(SOURCE_DIR).filter(f => /\.(jpe?g|png|webp)$/i.test(f));
  console.log(`Found ${files.length} images in "Semi precious Stone":`);
  files.forEach(f => console.log(`  - ${f}`));
  console.log(`\nCloudinary folder: hs-global/gallery/Semi precious Stone`);
  console.log(`Mapping key prefix: gallery/Semi precious Stone/<file>.webp\n`);

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

  const existing = JSON.parse(fs.readFileSync(URLS_JSON, 'utf-8'));
  let newCount = 0;

  for (const file of files) {
    const inputPath = path.join(SOURCE_DIR, file);
    const originalSize = fs.statSync(inputPath).size;
    const metadata = await sharp(inputPath).metadata();
    const baseName = path.basename(file, path.extname(file));

    console.log(`\nProcessing: ${file} (${formatBytes(originalSize)}, ${metadata.width}x${metadata.height})`);

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
        folder: 'hs-global/gallery/Semi precious Stone',
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
    }

    if (Object.keys(variants).length === 0) continue;

    const key = `gallery/Semi precious Stone/${baseName}.webp`;
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
