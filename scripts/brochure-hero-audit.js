/**
 * Lists every image actually present in each product's Cloudinary folder
 * (not just the one hardcoded as "1.webp") and builds labeled contact-sheet
 * images so a human/agent can pick the correct clean-white-background product
 * shot for the brochure hero, instead of assuming file "1" is always right.
 *
 * Usage: node scripts/brochure-hero-audit.js <foldersJsonPath> [outPrefix] [startIdx] [endIdx]
 *   foldersJsonPath — JSON file with [{ sku, folder }, ...]
 */

const sharp = require('sharp');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
const https = require('https');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const OUT_DIR = path.join(__dirname, '../temp-brochure-crops');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

// { sku, folder } — folder is the Cloudinary prefix to list.
const FOLDERS = [
  { sku: 'HSG-WD-003', folder: 'hs-global/handicraft/etsy/HCBCETBR1/' },
  { sku: 'HSG-WD-004', folder: 'hs-global/handicraft/etsy/HCBDTBR1/' },
  { sku: 'HSG-WD-005', folder: 'hs-global/handicraft/etsy/HCBCOBR2/' },
  { sku: 'HSG-WD-006', folder: 'hs-global/handicraft/etsy/HCBCOBR3/' },
  { sku: 'HSG-WD-007', folder: 'hs-global/handicraft/etsy/HCBCOBR1/' },
  { sku: 'HSG-WD-008', folder: 'hs-global/handicraft/etsy/HCBSTGO2/' },
  { sku: 'HSG-WD-009', folder: 'hs-global/handicraft/etsy/HCBSTBR4/' },
  { sku: 'HSG-WD-010', folder: 'hs-global/handicraft/etsy/HCBCOBR4/' },
  { sku: 'HSG-WD-011', folder: 'hs-global/handicraft/etsy/HCBSTBR3/' },
  { sku: 'HSG-WD-012', folder: 'hs-global/handicraft/etsy/HCBSTBR5/' },
  { sku: 'HSG-WD-013', folder: 'hs-global/handicraft/etsy/HCBSTBR6/' },
  { sku: 'HSG-WD-014', folder: 'hs-global/handicraft/etsy/HCBSTBR1/' },
  { sku: 'HSG-WD-015', folder: 'hs-global/handicraft/etsy/HCBSOBR1/' },
  { sku: 'HSG-WD-016', folder: 'hs-global/handicraft/etsy/HCFARGR1/' },
  { sku: 'HSG-WD-017', folder: 'hs-global/handicraft/etsy/HCFBSBR1/' },
  { sku: 'HSG-WD-018', folder: 'hs-global/handicraft/etsy/HCFBSBR2/' },
  { sku: 'HSG-WD-019', folder: 'hs-global/handicraft/etsy/HCFCABBR8/' },
  { sku: 'HSG-WD-020', folder: 'hs-global/handicraft/etsy/HCFCABBR3/' },
  { sku: 'HSG-WD-021', folder: 'hs-global/handicraft/etsy/HCFCABBR2/' },
  { sku: 'HSG-WD-022', folder: 'hs-global/handicraft/etsy/HCFCABBR9/' },
  { sku: 'HSG-WD-023', folder: 'hs-global/handicraft/etsy/HCFCABBR4/' },
  { sku: 'HSG-WD-024', folder: 'hs-global/handicraft/etsy/HCFCABBR1/' },
  { sku: 'HSG-WD-025', folder: 'hs-global/handicraft/etsy/HCFCABBU7/' },
  { sku: 'HSG-WD-026', folder: 'hs-global/handicraft/etsy/HCFCABBR6/' },
  { sku: 'HSG-WD-027', folder: 'hs-global/handicraft/etsy/HCFCABBU5/' },
  { sku: 'HSG-WD-028', folder: 'hs-global/handicraft/etsy/HCFTRBU1/' },
  { sku: 'HSG-WD-029', folder: 'hs-global/handicraft/etsy/HCFDOBR2/' },
  { sku: 'HSG-WD-030', folder: 'hs-global/handicraft/etsy/HCFDOBR3/' },
];

const foldersArgPath = process.argv[2] && process.argv[2].endsWith('.json') ? process.argv[2] : null;
const ACTIVE_FOLDERS = foldersArgPath ? JSON.parse(fs.readFileSync(foldersArgPath, 'utf8')) : FOLDERS;
const argOffset = foldersArgPath ? 1 : 0;

function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) { reject(new Error(`HTTP ${res.statusCode} for ${url}`)); return; }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

const THUMB = 220;
const LABEL_H = 20;
const CELL_W = THUMB + 10;
const CELL_H = THUMB + LABEL_H + 10;

async function labelSvg(text, width) {
  const esc = text.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  return Buffer.from(
    `<svg width="${width}" height="${LABEL_H}"><rect width="100%" height="100%" fill="#222"/><text x="4" y="14" font-size="11" fill="#0f0" font-family="monospace">${esc}</text></svg>`
  );
}

async function buildRow(entry) {
  let resources = [];
  try {
    const r = await cloudinary.api.resources({ type: 'upload', prefix: entry.folder, max_results: 40 });
    resources = r.resources;
  } catch (e) {
    console.error(`  ${entry.sku}: list failed — ${e.message}`);
    return null;
  }
  console.log(`${entry.sku}: ${resources.length} files in ${entry.folder}`);

  const cells = [];
  for (const res of resources) {
    const shortName = res.public_id.replace(entry.folder, '');
    const thumbUrl = `https://res.cloudinary.com/dynd1aan0/image/upload/c_fit,w_${THUMB},h_${THUMB}/${res.public_id}.${res.format}`;
    try {
      const buf = await fetchBuffer(thumbUrl);
      const padded = await sharp(buf)
        .resize(THUMB, THUMB, { fit: 'contain', background: '#eee' })
        .png()
        .toBuffer();
      const label = await labelSvg(decodeURIComponent(shortName).slice(0, 30), THUMB);
      cells.push({ img: padded, label, name: shortName });
    } catch (e) {
      console.warn(`    skip ${shortName}: ${e.message}`);
    }
  }
  return { sku: entry.sku, folder: entry.folder, cells };
}

async function main() {
  const startIdx = parseInt(process.argv[3 + argOffset] || '0', 10);
  const endIdx = parseInt(process.argv[4 + argOffset] || String(ACTIVE_FOLDERS.length), 10);
  const outPrefix = process.argv[2 + argOffset] || 'audit';
  const slice = ACTIVE_FOLDERS.slice(startIdx, endIdx);

  const rows = [];
  for (const entry of slice) {
    const row = await buildRow(entry);
    if (row) rows.push(row);
  }

  const maxCols = Math.max(...rows.map((r) => r.cells.length), 1);
  const rowLabelW = 90;
  const sheetW = rowLabelW + maxCols * CELL_W;
  const sheetH = rows.length * CELL_H;

  const composites = [];
  rows.forEach((row, ri) => {
    const y = ri * CELL_H;
    composites.push({
      input: Buffer.from(`<svg width="${rowLabelW}" height="${CELL_H}"><rect width="100%" height="100%" fill="#333"/><text x="4" y="${CELL_H / 2}" font-size="13" fill="#fff" font-family="monospace">${row.sku}</text></svg>`),
      left: 0,
      top: y,
    });
    row.cells.forEach((cell, ci) => {
      const x = rowLabelW + ci * CELL_W;
      composites.push({ input: cell.img, left: x + 5, top: y + 5 });
      composites.push({ input: cell.label, left: x + 5, top: y + THUMB + 5 });
    });
  });

  const outPath = path.join(OUT_DIR, `${outPrefix}.png`);
  await sharp({ create: { width: sheetW, height: sheetH, channels: 3, background: '#000' } })
    .composite(composites)
    .png()
    .toFile(outPath);

  console.log(`\nSaved contact sheet: ${outPath} (${sheetW}x${sheetH})`);
}

main().catch((e) => { console.error(e); process.exit(1); });
