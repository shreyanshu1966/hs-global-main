/**
 * Smart-crop brochure hero images to the left image panel's exact ratio,
 * at high resolution:
 *
 *   1. Trim the white product-photography background to the product's
 *      true bounding box.
 *   2. AI-upscale that trimmed product 4x via Real-ESRGAN (realesrgan-x4plus),
 *      run locally through realesrgan-ncnn-vulkan.exe.
 *   3. Pad the upscaled product back out to the panel's ratio on a
 *      matching white background, centered — so the whole piece is always
 *      visible, centered, and never cropped.
 *   4. Upload to Cloudinary and patch the new URL into the brochure HTML.
 *
 * Usage: node scripts/brochure-hero-crop.js scripts/configs/<brochure>.json
 *
 * Config shape: {
 *   htmlPath, skuPrefix, ratioW, ratioH, cloudinaryUploadFolder,
 *   products: [{ sku, name, version, publicPath, ext }, ...]
 * }
 */

const sharp = require('sharp');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
const https = require('https');
const { execFileSync } = require('child_process');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const configPath = process.argv[2];
if (!configPath) {
  console.error('Usage: node scripts/brochure-hero-crop.js scripts/configs/<brochure>.json');
  process.exit(1);
}
const CONFIG = JSON.parse(fs.readFileSync(path.join(__dirname, '..', configPath), 'utf8'));
const HTML_PATH = path.join(__dirname, '..', CONFIG.htmlPath);
const PRODUCTS = CONFIG.products;
const RATIO_W = CONFIG.ratioW;
const RATIO_H = CONFIG.ratioH;
const SKU_PREFIX = CONFIG.skuPrefix;
const UPLOAD_FOLDER = CONFIG.cloudinaryUploadFolder;

const OUT_DIR = path.join(__dirname, '../temp-brochure-crops');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const REALESRGAN_DIR = process.env.REALESRGAN_DIR;
const REALESRGAN_EXE = REALESRGAN_DIR ? path.join(REALESRGAN_DIR, 'realesrgan-ncnn-vulkan.exe') : null;
const REALESRGAN_MODELS = REALESRGAN_DIR ? path.join(REALESRGAN_DIR, 'models') : null;

function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        return;
      }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

function upscale4x(inputPngPath, outputPngPath) {
  if (!REALESRGAN_EXE || !fs.existsSync(REALESRGAN_EXE)) {
    console.warn('  Real-ESRGAN unavailable; using the trimmed source at native resolution.');
    fs.copyFileSync(inputPngPath, outputPngPath);
    return;
  }
  if (!REALESRGAN_EXE || !fs.existsSync(REALESRGAN_EXE)) {
    throw new Error('REALESRGAN_DIR env var not set or exe missing — skipping AI upscale');
  }
  execFileSync(REALESRGAN_EXE, [
    '-i', inputPngPath,
    '-o', outputPngPath,
    '-n', 'realesrgan-x4plus',
    '-s', '4',
    '-m', REALESRGAN_MODELS,
  ], { stdio: 'inherit' });
}

async function cropOne(product, { padding = 0.02 } = {}) {
  const url = `https://res.cloudinary.com/dynd1aan0/image/upload/${product.version}/${encodeURI(product.publicPath)}.${product.ext}`;
  console.log(`\nFetching original: ${url}`);
  const buffer = await fetchBuffer(url);

  const meta = await sharp(buffer).metadata();
  console.log(`  Original: ${meta.width}x${meta.height} (${(buffer.length / 1024).toFixed(0)} KB)`);

  const trimmed = await sharp(buffer).trim({ background: '#ffffff', threshold: 15 }).toBuffer({ resolveWithObject: true });
  const { width: tw, height: th } = trimmed.info;
  console.log(`  Trimmed product bounds: ${tw}x${th}`);

  const trimmedPngPath = path.join(OUT_DIR, `${product.sku}-trimmed.png`);
  await sharp(trimmed.data).png().toFile(trimmedPngPath);

  // Cache the (expensive) upscale so re-running with different padding/framing is fast.
  const upscaledPngPath = path.join(OUT_DIR, `${product.sku}-upscaled.png`);
  if (fs.existsSync(upscaledPngPath)) {
    console.log('  Using cached upscale.');
  } else {
    console.log('  Running Real-ESRGAN 4x upscale (this can take a few minutes on integrated GPUs)...');
    const upStart = Date.now();
    upscale4x(trimmedPngPath, upscaledPngPath);
    console.log(`  Upscale done in ${((Date.now() - upStart) / 1000).toFixed(0)}s`);
  }

  const upscaledMeta = await sharp(upscaledPngPath).metadata();
  const uw = upscaledMeta.width;
  const uh = upscaledMeta.height;
  console.log(`  Upscaled: ${uw}x${uh}`);

  const outPath = path.join(OUT_DIR, `${product.sku}-${product.name}-final.webp`);
  const strategy = CONFIG.cropStrategy || 'contain';

  if (strategy === 'cover-entropy') {
    // For material/texture shots (e.g. stone slabs) where the whole product
    // is a fill-frame texture rather than a discrete object with edges:
    // crop to the panel's ratio using entropy-based gravity, so the busy
    // texture fills the frame and any flat/empty margins get cropped away.
    let targetW = uw;
    let targetH = Math.round(targetW * (RATIO_H / RATIO_W));
    if (targetH > uh) {
      targetH = uh;
      targetW = Math.round(targetH * (RATIO_W / RATIO_H));
    }
    console.log(`  Canvas: ${targetW}x${targetH} (ratio ${RATIO_W}:${RATIO_H}, cover+entropy crop)`);
    await sharp(upscaledPngPath)
      .resize(targetW, targetH, { fit: 'cover', position: sharp.strategy.entropy })
      .webp({ quality: 92, effort: 6 })
      .toFile(outPath);
  } else {
    let targetW = uw / (1 - padding);
    let targetH = targetW * (RATIO_H / RATIO_W);
    if (targetH < uh / (1 - padding)) {
      targetH = uh / (1 - padding);
      targetW = targetH * (RATIO_W / RATIO_H);
    }
    targetW = Math.round(targetW);
    targetH = Math.round(targetH);
    console.log(`  Canvas: ${targetW}x${targetH} (ratio ${RATIO_W}:${RATIO_H}, ${(padding * 100).toFixed(0)}% padding)`);
    await sharp(upscaledPngPath)
      .resize(targetW, targetH, { fit: 'contain', background: '#ffffff', position: 'centre' })
      .webp({ quality: 92, effort: 6 })
      .toFile(outPath);
  }

  console.log(`  Saved: ${outPath}`);

  fs.unlinkSync(trimmedPngPath);
  // upscaledPngPath intentionally kept as a cache for fast re-runs.

  return outPath;
}

async function uploadOne(localPath, product) {
  const result = await cloudinary.uploader.upload(localPath, {
    folder: UPLOAD_FOLDER,
    public_id: product.sku,
    overwrite: true,
    resource_type: 'image',
  });
  console.log(`  Uploaded: ${result.secure_url} (${result.width}x${result.height})`);
  return result.secure_url;
}

const RESULTS_PATH = path.join(OUT_DIR, `results-${path.basename(configPath, '.json')}.json`);

function loadResults() {
  if (fs.existsSync(RESULTS_PATH)) return JSON.parse(fs.readFileSync(RESULTS_PATH, 'utf8'));
  return {};
}

function saveResult(sku, url) {
  const results = loadResults();
  results[sku] = url;
  fs.writeFileSync(RESULTS_PATH, JSON.stringify(results, null, 2));
}

// Swap this product's hero <img src> in the brochure HTML for the new
// baked-in-crop URL. Locates the product by its <article id="product-N">
// (N derived from the SKU) and replaces only the first <img> inside that
// article's .product-image-wrap — independent of whatever the old src
// happened to be, since we may have switched which source photo is used.
function patchHtml(product, newUrl) {
  let html = fs.readFileSync(HTML_PATH, 'utf8');
  const num = parseInt(product.sku.replace(SKU_PREFIX, ''), 10);
  const wrapClass = CONFIG.imageWrapClass || 'product-image-wrap';
  const articleRe = new RegExp(`(<article class="product-page" id="product-${num}"[^>]*>[\\s\\S]*?<div class="${wrapClass}">\\s*<img src=")[^"]+(")`);
  if (!articleRe.test(html)) {
    console.warn(`  ⚠️  Could not find product-${num} image in HTML — skipping HTML patch.`);
    return false;
  }
  html = html.replace(articleRe, `$1${newUrl}$2`);
  fs.writeFileSync(HTML_PATH, html);
  return true;
}

async function main() {
  const already = loadResults();
  for (const product of PRODUCTS) {
    if (already[product.sku]) {
      console.log(`\nSkipping ${product.sku} (already processed): ${already[product.sku]}`);
      continue;
    }
    console.log(`\n${'='.repeat(70)}\n${product.sku} — ${product.name}\n${'='.repeat(70)}`);
    try {
      const localPath = await cropOne(product);
      const url = await uploadOne(localPath, product);
      saveResult(product.sku, url);
      const patched = patchHtml(product, url);
      console.log(`  HTML patched: ${patched}`);
    } catch (err) {
      console.error(`  ❌ FAILED ${product.sku}: ${err.message}`);
    }
  }
  console.log('\nAll done.');
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { cropOne, uploadOne, fetchBuffer, PRODUCTS };
