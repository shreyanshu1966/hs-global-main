/**
 * patch-marble-html.js
 * After the Colab run finishes, download results-marble.json from Colab
 * and drop it in the project root, then run:
 *   node scripts/patch-marble-html.js results-marble.json
 *
 * This script patches the brochure HTML with the new Cloudinary URLs and
 * backs up the original file first.
 */

const fs   = require('fs');
const path = require('path');

const resultsPath = process.argv[2] || path.join(__dirname, '../results-marble.json');
const HTML_PATH   = path.join(__dirname, '../brochures/marble-furniture-brochure.html');
const SKU_PREFIX  = 'HSG-MBL-';
const WRAP_CLASS  = 'product-image-wrap';

if (!fs.existsSync(resultsPath)) {
  console.error(`results file not found: ${resultsPath}`);
  process.exit(1);
}

const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));

const backupPath = HTML_PATH.replace(/\.html$/, `.html.bak-${Date.now()}`);
fs.copyFileSync(HTML_PATH, backupPath);
console.log(`Backed up original to ${backupPath}`);

let html = fs.readFileSync(HTML_PATH, 'utf8');

let patched = 0, skipped = 0;

for (const [sku, newUrl] of Object.entries(results)) {
  const num = parseInt(sku.replace(SKU_PREFIX, ''), 10);
  const re = new RegExp(
    `(<article class="product-page" id="product-${num}"[^>]*>[\\s\\S]*?<div class="${WRAP_CLASS}">\\s*<img src=")[^"]+(")`
  );
  if (re.test(html)) {
    html = html.replace(re, `$1${newUrl}$2`);
    console.log(`  ✅ ${sku} → ${newUrl}`);
    patched++;
  } else {
    console.warn(`  ⚠️  product-${num} not found in HTML`);
    skipped++;
  }
}

fs.writeFileSync(HTML_PATH, html);
console.log(`\nDone. Patched: ${patched}, Skipped: ${skipped}`);
