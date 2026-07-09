#!/usr/bin/env node
'use strict';
/**
 * ANALYSIS ONLY — makes no changes to the DB or any local file except
 * writing its own report. Compares live DB products against the local
 * reshoot/reference photo folders under "new products/" to find:
 *   - DB products whose local folder has photos but the DB has 0/fewer images
 *   - Local folders with no matching DB product (orphans / not-yet-imported)
 *
 * Local folders exist for all 4 categories:
 *   - semi-precious-stone : new products/semi precious stones/<date>/<STONE NAME>/        (matched by normalized name)
 *   - wooden-furniture     : new products/HANDICRAFT PRODUCTS/<n>. <CODE> <name>/          (matched by productCode)
 *   - furniture (marble)   : new products/marble  Etsy All Product Photos/<n>. <CODE>-<name>/  (matched by productCode)
 *   - leather              : new products/Leather Products/<n>. <name>/                    (matched by normalized name, no product code)
 *
 * Usage:
 *   node deploy/fetch-all-products-for-analysis.js   (run first, from repo root)
 *   node backend/scripts/analyze-missing-images.js
 *
 * Writes: backend/scripts/missing-images-report.json
 */
const fs = require('fs');
const path = require('path');

const DUMP_PATH = path.join(__dirname, 'all-products-live.json');
const REPORT_PATH = path.join(__dirname, 'missing-images-report.json');
const NEW_PRODUCTS_ROOT = path.join(__dirname, '../../new products');

function normalize(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ');
}

function collectUrls(product) {
  const urls = new Set();
  if (product.image) urls.add(product.image);
  for (const u of product.images || []) if (u) urls.add(u);
  for (const u of product.sortedImages || []) if (u) urls.add(u);
  return [...urls];
}

function findSubdir(rootDirents, matcher) {
  const hit = rootDirents.find((e) => e.isDirectory() && matcher(e.name));
  return hit ? hit.name : null;
}

// ── Semi-precious-stone: date-folder -> stone-name-folder, matched by normalized name ──
// Same aliasing already verified in reupload-semi-stone-images.js, reused here so this
// analysis doesn't re-flag stones that are known to match under a different spelling.
const STONE_ALIAS = {
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
  'Mix-Agate': 'MIX AGATE',
  'Rose-Quartz': 'ROSE QUARTZ',
  'Smoky-Quartz-Dark': 'SMOKEY QUARTZ',
  'smoky-quartz-dark': 'SMOKEY QUARTZ',
};

function parseFolderDate(dateStr) {
  const [dd, mm, yy] = dateStr.split('-').map(Number);
  return new Date(2000 + yy, mm - 1, dd);
}

function collectStoneFolders(stoneRoot) {
  const byNormalizedName = new Map();
  const dateDirs = fs.readdirSync(stoneRoot, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name);
  for (const dateDir of dateDirs) {
    const dateObj = parseFolderDate(dateDir);
    const stoneDirs = fs.readdirSync(path.join(stoneRoot, dateDir), { withFileTypes: true }).filter((e) => e.isDirectory());
    for (const stoneDir of stoneDirs) {
      const dirPath = path.join(stoneRoot, dateDir, stoneDir.name);
      const fileCount = fs.readdirSync(dirPath).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).length;
      const key = normalize(stoneDir.name);
      const existing = byNormalizedName.get(key);
      if (!existing || dateObj > existing.dateObj) {
        byNormalizedName.set(key, { name: stoneDir.name, date: dateDir, dateObj, dirPath, fileCount });
      }
    }
  }
  return byNormalizedName;
}

// ── Leather: flat folders "<n>. <name>" with no product code, matched by normalized name ──
// productId slugs for leather are the kebab-cased product name (e.g. "chesterfield-wingback-
// leather-accent-chair-classic-armchair"), which normalizes to exactly the folder name with
// its leading "<n>. " index stripped — verified 28/28 match against the live catalog.
function collectLeatherFolders(root) {
  const byNormalizedName = new Map();
  const dirs = fs.readdirSync(root, { withFileTypes: true }).filter((e) => e.isDirectory());
  for (const dir of dirs) {
    const strippedName = dir.name.replace(/^\d+\.\s*/, '');
    const dirPath = path.join(root, dir.name);
    const fileCount = fs.readdirSync(dirPath, { withFileTypes: true })
      .filter((e) => e.isFile() && /\.(jpe?g|png|webp)$/i.test(e.name)).length;
    byNormalizedName.set(normalize(strippedName), { name: dir.name, dirPath, fileCount });
  }
  return byNormalizedName;
}

// ── Handicraft / marble: folders prefixed with the product code, e.g. "4. HCBSTBR3 Brass..." ──
const CODE_PREFIX_RE = /^\d+\.\s*([A-Za-z0-9]+)[\s-]/;

function collectCodeFolders(root, sourceLabel) {
  const byCode = new Map();
  const skipped = [];
  const dirs = fs.readdirSync(root, { withFileTypes: true }).filter((e) => e.isDirectory());
  for (const dir of dirs) {
    const m = dir.name.match(CODE_PREFIX_RE);
    if (!m) {
      skipped.push({ name: dir.name, source: sourceLabel });
      continue;
    }
    const code = m[1].toUpperCase();
    const dirPath = path.join(root, dir.name);
    const fileCount = fs.readdirSync(dirPath, { withFileTypes: true })
      .filter((e) => e.isFile() && /\.(jpe?g|png|webp)$/i.test(e.name)).length;
    if (byCode.has(code)) {
      byCode.get(code).duplicateFolders = byCode.get(code).duplicateFolders || [];
      byCode.get(code).duplicateFolders.push(dir.name);
    } else {
      byCode.set(code, { code, folderName: dir.name, dirPath, fileCount, source: sourceLabel });
    }
  }
  return { byCode, skipped };
}

function main() {
  if (!fs.existsSync(DUMP_PATH)) {
    console.error(`Missing ${DUMP_PATH}`);
    console.error('Run: node deploy/fetch-all-products-for-analysis.js  (from repo root) first.');
    process.exit(1);
  }
  const products = JSON.parse(fs.readFileSync(DUMP_PATH, 'utf-8'));

  const rootDirents = fs.readdirSync(NEW_PRODUCTS_ROOT, { withFileTypes: true });
  const stoneDirName = findSubdir(rootDirents, (n) => /semi precious stones/i.test(n));
  const handicraftDirName = findSubdir(rootDirents, (n) => /handicraft products/i.test(n));
  const marbleDirName = findSubdir(rootDirents, (n) => /marble/i.test(n) && /photos/i.test(n));
  const leatherDirName = findSubdir(rootDirents, (n) => /leather products/i.test(n));

  if (!stoneDirName || !handicraftDirName || !marbleDirName || !leatherDirName) {
    console.error('Could not locate one or more expected local folders under "new products/":');
    console.error({ stoneDirName, handicraftDirName, marbleDirName, leatherDirName });
    process.exit(1);
  }

  const stoneFolders = collectStoneFolders(path.join(NEW_PRODUCTS_ROOT, stoneDirName));
  const leatherFolders = collectLeatherFolders(path.join(NEW_PRODUCTS_ROOT, leatherDirName));
  const { byCode: handicraftCodes, skipped: handicraftSkipped } = collectCodeFolders(path.join(NEW_PRODUCTS_ROOT, handicraftDirName), 'HANDICRAFT PRODUCTS');
  const { byCode: marbleCodes, skipped: marbleSkipped } = collectCodeFolders(path.join(NEW_PRODUCTS_ROOT, marbleDirName), 'marble Etsy All Product Photos');

  const codeFolders = new Map([...handicraftCodes, ...marbleCodes]);

  const usedStoneKeys = new Set();
  const usedLeatherKeys = new Set();
  const usedCodes = new Set();

  const missingOrPartial = []; // local photos exist, DB has fewer/none
  const noLocalReference = []; // can't be checked (no productCode, or leather, or code/name not found locally)
  const okMatched = []; // local photos exist and DB image count looks sufficient (for coverage stats only)

  for (const p of products) {
    const dbImageCount = collectUrls(p).length;

    if (p.category === 'semi-precious-stone') {
      const aliasName = STONE_ALIAS[p.productId];
      const key = aliasName ? normalize(aliasName) : normalize((p.productId || '').replace(/-/g, ' '));
      const folder = stoneFolders.get(key);
      if (folder) {
        usedStoneKeys.add(key);
        const entry = { productId: p.productId, category: p.category, subcategory: p.subcategory, dbImageCount, localFolder: `${folder.date}/${folder.name}`, localImageCount: folder.fileCount };
        if (dbImageCount < folder.fileCount) missingOrPartial.push(entry);
        else okMatched.push(entry);
      } else {
        noLocalReference.push({ productId: p.productId, category: p.category, subcategory: p.subcategory, dbImageCount, reason: 'no matching local stone folder (by name)' });
      }
      continue;
    }

    if (p.category === 'leather') {
      const key = normalize((p.productId || '').replace(/-/g, ' '));
      const folder = leatherFolders.get(key);
      if (folder) {
        usedLeatherKeys.add(key);
        const entry = { productId: p.productId, category: p.category, subcategory: p.subcategory, dbImageCount, localFolder: `Leather Products/${folder.name}`, localImageCount: folder.fileCount };
        if (dbImageCount < folder.fileCount) missingOrPartial.push(entry);
        else okMatched.push(entry);
      } else {
        noLocalReference.push({ productId: p.productId, category: p.category, subcategory: p.subcategory, dbImageCount, reason: 'no matching local leather folder (by name)' });
      }
      continue;
    }

    // wooden-furniture / furniture: matched by productCode against handicraft+marble folders
    const code = (p.productCode || '').trim().toUpperCase();
    if (!code) {
      noLocalReference.push({ productId: p.productId, category: p.category, subcategory: p.subcategory, dbImageCount, reason: 'product has no productCode field to match against local folders' });
      continue;
    }
    const folder = codeFolders.get(code);
    if (folder) {
      usedCodes.add(code);
      const entry = { productId: p.productId, productCode: code, category: p.category, subcategory: p.subcategory, dbImageCount, localFolder: `${folder.source}/${folder.folderName}`, localImageCount: folder.fileCount };
      if (dbImageCount < folder.fileCount) missingOrPartial.push(entry);
      else okMatched.push(entry);
    } else {
      noLocalReference.push({ productId: p.productId, productCode: code, category: p.category, subcategory: p.subcategory, dbImageCount, reason: 'productCode not found among local handicraft/marble folders' });
    }
  }

  const unusedStoneFolders = [...stoneFolders.entries()]
    .filter(([key]) => !usedStoneKeys.has(key))
    .map(([, folder]) => ({ folder: `${folder.date}/${folder.name}`, fileCount: folder.fileCount, source: 'semi precious stones' }));

  const unusedLeatherFolders = [...leatherFolders.entries()]
    .filter(([key]) => !usedLeatherKeys.has(key))
    .map(([, folder]) => ({ folder: `Leather Products/${folder.name}`, fileCount: folder.fileCount, source: 'Leather Products' }));

  const unusedCodeFolders = [...codeFolders.values()]
    .filter((f) => !usedCodes.has(f.code))
    .map((f) => ({ code: f.code, folder: `${f.source}/${f.folderName}`, fileCount: f.fileCount, source: f.source }));

  missingOrPartial.sort((a, b) => (b.localImageCount - b.dbImageCount) - (a.localImageCount - a.dbImageCount));

  const report = {
    generatedAt: new Date().toISOString(),
    totalProducts: products.length,
    missingOrPartialCount: missingOrPartial.length,
    noLocalReferenceCount: noLocalReference.length,
    okMatchedCount: okMatched.length,
    unusedLocalFolders: {
      count: unusedStoneFolders.length + unusedLeatherFolders.length + unusedCodeFolders.length,
      semiPreciousStone: unusedStoneFolders,
      leather: unusedLeatherFolders,
      handicraftAndMarble: unusedCodeFolders,
    },
    unrecognizedFolderNames: {
      note: 'Local folders whose name did not start with "<n>. <CODE>..." so no code could be extracted; not matched against any product.',
      handicraft: handicraftSkipped,
      marble: marbleSkipped,
    },
    missingOrPartial,
    noLocalReference,
  };
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));

  console.log(`\n=== Missing-images-vs-local-folder analysis ===`);
  console.log(`Total products:                         ${products.length}`);
  console.log(`Local photos exist, DB missing/partial: ${missingOrPartial.length}`);
  console.log(`Local photos exist, DB looks OK:        ${okMatched.length}`);
  console.log(`Can't be checked (no local reference):  ${noLocalReference.length}`);
  console.log(`Local folders unused by any DB product:  ${unusedStoneFolders.length + unusedLeatherFolders.length + unusedCodeFolders.length}`);
  console.log(`\nReport written to ${REPORT_PATH}`);
}

main();
