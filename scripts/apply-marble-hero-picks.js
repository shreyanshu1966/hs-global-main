/**
 * Applies the swap_to decisions in marble-hero-picks.json onto
 * marble-products-list.json and marble-codes.json, rewriting each SKU's
 * "src" to point at the chosen clean image (same folder, different filename).
 * Flagged/no-swap entries are left untouched.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const listPath = path.join(root, 'scripts/marble-products-list.json');
const codesPath = path.join(root, 'scripts/marble-codes.json');
const picksPath = path.join(root, 'scripts/marble-hero-picks.json');

const list = JSON.parse(fs.readFileSync(listPath, 'utf8'));
const codes = JSON.parse(fs.readFileSync(codesPath, 'utf8'));
const picks = JSON.parse(fs.readFileSync(picksPath, 'utf8')).decisions;

let applied = 0, skipped = 0;

for (const [sku, decision] of Object.entries(picks)) {
  if (sku.startsWith('_')) continue;
  if (!decision.swap_to) { skipped++; continue; }

  const listEntry = list.find((p) => p.sku === sku);
  const codeEntry = codes.find((c) => c.sku === sku);
  if (!listEntry || !codeEntry) {
    console.warn(`  ⚠️  ${sku} not found in products-list/codes`);
    continue;
  }

  const dir = listEntry.src.substring(0, listEntry.src.lastIndexOf('/') + 1);
  const newSrc = dir + encodeURIComponent(decision.swap_to.replace(/\.(webp|jpg|jpeg|png)$/i, '')) + (decision.swap_to.match(/\.(webp|jpg|jpeg|png)$/i)?.[0] || '.webp');

  listEntry.src = newSrc;
  codeEntry.src = newSrc;
  applied++;
  console.log(`  ${sku}: -> ${decision.swap_to}`);
}

fs.writeFileSync(listPath, JSON.stringify(list, null, 2) + '\n');
fs.writeFileSync(codesPath, JSON.stringify(codes, null, 2) + '\n');

console.log(`\nApplied ${applied} swaps, skipped ${skipped} (no swap / flagged).`);
