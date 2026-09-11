/**
 * patch-sps-html.js
 * After the Colab run finishes, download results-sps.json from Colab
 * and drop it in the project root, then run:
 *   node scripts/patch-sps-html.js results-sps.json
 *
 * This script patches the brochure HTML with the new Cloudinary URLs.
 */

const fs   = require('fs');
const path = require('path');

const resultsPath = process.argv[2] || path.join(__dirname, '../results-sps.json');
const HTML_PATH   = path.join(__dirname, '../brochures/semi-precious-stone-brochure.html');
const SKU_PREFIX  = 'HSG-SPS-';
const WRAP_CLASS  = 'image-panel';

if (!fs.existsSync(resultsPath)) {
  console.error(`results file not found: ${resultsPath}`);
  process.exit(1);
}

const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
let html = fs.readFileSync(HTML_PATH, 'utf8');

let patched = 0, skipped = 0;

for (const [sku, newUrl] of Object.entries(results)) {
  const num = parseInt(sku.replace(SKU_PREFIX, ''), 10);
  const re = new RegExp(
    `(<article class="product-page" id="product-${num}"[\\s\\S]*?<div class="${WRAP_CLASS}">\\s*<img src=")[^"]+(")`
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
