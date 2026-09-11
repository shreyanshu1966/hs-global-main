/**
 * For shared-bucket products (multiple SKUs pointing into one big generic
 * Cloudinary folder like "Coffee Table/"), the full-folder audit sheet is
 * useless per-SKU since there's no reliable "sibling" grouping. Instead,
 * build a small contact sheet of just each SKU's *currently picked* image
 * so we can at least judge clean-vs-lifestyle directly.
 *
 * Usage: node scripts/shared-current-picks-sheet.js "<folder path>" outName
 */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const https = require('https');

const root = path.join(__dirname, '..');
const folder = process.argv[2];
const outName = process.argv[3] || 'shared-picks';

const list = JSON.parse(fs.readFileSync(path.join(root, 'scripts/marble-products-list.json'), 'utf8'));
const codes = JSON.parse(fs.readFileSync(path.join(root, 'scripts/marble-codes.json'), 'utf8'));
const folders = JSON.parse(fs.readFileSync(path.join(root, 'scripts/marble-folders.json'), 'utf8'));
const byCode = Object.fromEntries(codes.map((c) => [c.sku, c]));
const byList = Object.fromEntries(list.map((p) => [p.sku, p]));

const skus = folders.filter((f) => f.folder === folder).map((f) => f.sku);

function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) { reject(new Error(`HTTP ${res.statusCode} for ${url}`)); return; }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

const THUMB = 260;
const LABEL_H = 40;
const CELL_W = THUMB + 10;
const CELL_H = THUMB + LABEL_H + 10;
const COLS = 6;

async function main() {
  const cells = [];
  for (const sku of skus) {
    const p = byList[sku];
    const url = p.src;
    const fname = decodeURIComponent(p.src.split('/').pop());
    try {
      const buf = await fetchBuffer(url);
      const img = await sharp(buf).resize(THUMB, THUMB, { fit: 'contain', background: '#eee' }).png().toBuffer();
      const label = `${sku} | ${fname}`.slice(0, 44);
      const labelSvg = Buffer.from(`<svg width="${THUMB}" height="${LABEL_H}"><rect width="100%" height="100%" fill="#222"/><text x="4" y="16" font-size="12" fill="#0f0" font-family="monospace">${label}</text><text x="4" y="32" font-size="10" fill="#0af" font-family="monospace">${(p.alt||'').replace(' — Marble Furniture by HS Global Export','').slice(0,48)}</text></svg>`);
      cells.push({ img, labelSvg });
      console.log(`fetched ${sku}`);
    } catch (e) {
      console.warn(`skip ${sku}: ${e.message}`);
      cells.push(null);
    }
  }
  const rows = Math.ceil(cells.length / COLS);
  const composites = [];
  cells.forEach((cell, i) => {
    if (!cell) return;
    const x = (i % COLS) * CELL_W + 5;
    const y = Math.floor(i / COLS) * CELL_H + 5;
    composites.push({ input: cell.img, left: x, top: y });
    composites.push({ input: cell.labelSvg, left: x, top: y + THUMB });
  });
  const outPath = path.join(root, 'temp-brochure-crops', `${outName}.png`);
  await sharp({ create: { width: COLS * CELL_W + 10, height: rows * CELL_H + 10, channels: 3, background: '#000' } })
    .composite(composites)
    .png()
    .toFile(outPath);
  console.log('Saved', outPath);
}

main().catch((e) => { console.error(e); process.exit(1); });
