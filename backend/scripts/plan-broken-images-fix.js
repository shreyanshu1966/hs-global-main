#!/usr/bin/env node
'use strict';
/**
 * PLANNING ONLY — no Cloudinary uploads, no DB writes. For every product flagged
 * with broken image URLs (backend/scripts/broken-images-report.json), decides how
 * it will be fixed:
 *   - "reupload": product has a matching local photo folder -> the full local set
 *      will be uploaded to Cloudinary and will REPLACE image/images/sortedImages
 *      entirely (guarantees no broken links regardless of which ones were broken).
 *   - "stripOnly": no local folder available -> only the specific dead URLs will
 *      be removed from images/sortedImages, keeping whatever still works.
 *
 * Folder-matching logic mirrors backend/scripts/analyze-missing-images.js exactly
 * (same normalize/alias/code-extraction rules), so the plan is consistent with the
 * earlier analysis.
 *
 * Usage:
 *   node deploy/fetch-all-products-for-analysis.js   (if dump is stale)
 *   node backend/scripts/analyze-broken-images.js    (if report is stale)
 *   node backend/scripts/plan-broken-images-fix.js
 *
 * Writes: backend/scripts/broken-images-fix-plan.json
 */
const fs = require('fs');
const path = require('path');

const DUMP_PATH = path.join(__dirname, 'all-products-live.json');
const BROKEN_REPORT_PATH = path.join(__dirname, 'broken-images-report.json');
const PLAN_PATH = path.join(__dirname, 'broken-images-fix-plan.json');
const NEW_PRODUCTS_ROOT = path.join(__dirname, '../../new products');

function normalize(s) {
  return (s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ');
}

function findSubdir(rootDirents, matcher) {
  const hit = rootDirents.find((e) => e.isDirectory() && matcher(e.name));
  return hit ? hit.name : null;
}

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

function listImageFiles(dirPath) {
  return fs.readdirSync(dirPath, { withFileTypes: true })
    .filter((e) => e.isFile() && /\.(jpe?g|png|webp)$/i.test(e.name))
    .map((e) => path.join(dirPath, e.name))
    .sort((a, b) => {
      const na = parseInt(path.basename(a), 10);
      const nb = parseInt(path.basename(b), 10);
      if (!isNaN(na) && !isNaN(nb)) return na - nb;
      return a.localeCompare(b);
    });
}

function collectStoneFolders(stoneRoot) {
  const byNormalizedName = new Map();
  const dateDirs = fs.readdirSync(stoneRoot, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name);
  for (const dateDir of dateDirs) {
    const dateObj = parseFolderDate(dateDir);
    const stoneDirs = fs.readdirSync(path.join(stoneRoot, dateDir), { withFileTypes: true }).filter((e) => e.isDirectory());
    for (const stoneDir of stoneDirs) {
      const dirPath = path.join(stoneRoot, dateDir, stoneDir.name);
      const files = listImageFiles(dirPath);
      const key = normalize(stoneDir.name);
      const existing = byNormalizedName.get(key);
      if (!existing || dateObj > existing.dateObj) {
        byNormalizedName.set(key, { name: stoneDir.name, date: dateDir, dateObj, dirPath, files });
      }
    }
  }
  return byNormalizedName;
}

function collectLeatherFolders(root) {
  const byNormalizedName = new Map();
  const dirs = fs.readdirSync(root, { withFileTypes: true }).filter((e) => e.isDirectory());
  for (const dir of dirs) {
    const strippedName = dir.name.replace(/^\d+\.\s*/, '');
    const dirPath = path.join(root, dir.name);
    byNormalizedName.set(normalize(strippedName), { name: dir.name, dirPath, files: listImageFiles(dirPath) });
  }
  return byNormalizedName;
}

const CODE_PREFIX_RE = /^\d+\.\s*([A-Za-z0-9]+)[\s-]/;

function collectCodeFolders(root, sourceLabel) {
  const byCode = new Map();
  const dirs = fs.readdirSync(root, { withFileTypes: true }).filter((e) => e.isDirectory());
  for (const dir of dirs) {
    const m = dir.name.match(CODE_PREFIX_RE);
    if (!m) continue;
    const code = m[1].toUpperCase();
    const dirPath = path.join(root, dir.name);
    if (!byCode.has(code)) {
      byCode.set(code, { code, folderName: dir.name, dirPath, files: listImageFiles(dirPath), source: sourceLabel });
    }
  }
  return byCode;
}

function extractCodeFromUrls(urls) {
  for (const url of urls) {
    const m = (url || '').match(/\/etsy\/([A-Za-z0-9]+)\//);
    if (m) return m[1];
  }
  return null;
}

function main() {
  for (const p of [DUMP_PATH, BROKEN_REPORT_PATH]) {
    if (!fs.existsSync(p)) {
      console.error(`Missing ${p}`);
      console.error('Run: node deploy/fetch-all-products-for-analysis.js  AND  node backend/scripts/analyze-broken-images.js  first.');
      process.exit(1);
    }
  }

  const products = JSON.parse(fs.readFileSync(DUMP_PATH, 'utf-8'));
  const productById = new Map(products.map((p) => [p.productId, p]));
  const brokenReport = JSON.parse(fs.readFileSync(BROKEN_REPORT_PATH, 'utf-8'));

  const rootDirents = fs.readdirSync(NEW_PRODUCTS_ROOT, { withFileTypes: true });
  const stoneDirName = findSubdir(rootDirents, (n) => /semi precious stones/i.test(n));
  const handicraftDirName = findSubdir(rootDirents, (n) => /handicraft products/i.test(n));
  const marbleDirName = findSubdir(rootDirents, (n) => /marble/i.test(n) && /photos/i.test(n));
  const leatherDirName = findSubdir(rootDirents, (n) => /leather products/i.test(n));

  const stoneFolders = collectStoneFolders(path.join(NEW_PRODUCTS_ROOT, stoneDirName));
  const leatherFolders = collectLeatherFolders(path.join(NEW_PRODUCTS_ROOT, leatherDirName));
  const handicraftCodes = collectCodeFolders(path.join(NEW_PRODUCTS_ROOT, handicraftDirName), 'HANDICRAFT PRODUCTS');
  const marbleCodes = collectCodeFolders(path.join(NEW_PRODUCTS_ROOT, marbleDirName), 'marble Etsy All Product Photos');
  const codeFolders = new Map([...handicraftCodes, ...marbleCodes]);

  const reupload = [];
  const stripOnly = [];

  for (const bp of brokenReport.productsWithBrokenImages) {
    const p = productById.get(bp.productId);
    if (!p) continue;
    const brokenUrls = bp.brokenUrls.map((b) => b.url);

    let folder = null;
    let matchType = null;

    if (p.category === 'semi-precious-stone') {
      const aliasName = STONE_ALIAS[p.productId];
      const key = aliasName ? normalize(aliasName) : normalize((p.productId || '').replace(/-/g, ' '));
      folder = stoneFolders.get(key) || null;
      matchType = 'name';
    } else if (p.category === 'leather') {
      const key = normalize((p.productId || '').replace(/-/g, ' '));
      folder = leatherFolders.get(key) || null;
      matchType = 'name';
    } else {
      const code = (p.productCode || '').trim().toUpperCase();
      if (code) {
        folder = codeFolders.get(code) || null;
        matchType = 'code';
      }
    }

    if (folder && folder.files.length > 0) {
      const allUrls = [p.image, ...(p.images || []), ...(p.sortedImages || [])].filter(Boolean);
      const embeddedCode = p.category === 'leather' ? (extractCodeFromUrls(allUrls) || p.productId) : null;
      reupload.push({
        productId: p.productId,
        category: p.category,
        subcategory: p.subcategory,
        productCode: p.productCode || null,
        leatherCode: embeddedCode,
        matchType,
        localFolder: folder.dirPath.replace(NEW_PRODUCTS_ROOT + path.sep, ''),
        localFileCount: folder.files.length,
        localFiles: folder.files,
        currentDbImageCount: (p.images || []).length,
        brokenUrlCount: brokenUrls.length,
      });
    } else {
      const allUrls = [p.image, ...(p.images || []), ...(p.sortedImages || [])].filter(Boolean);
      const uniqueUrls = [...new Set(allUrls)];
      const remainingCount = uniqueUrls.filter((u) => !brokenUrls.includes(u)).length;
      stripOnly.push({
        productId: p.productId,
        category: p.category,
        subcategory: p.subcategory,
        currentDbImageCount: (p.images || []).length,
        brokenUrls,
        remainingAfterStrip: remainingCount,
        wouldHaveZeroImages: remainingCount === 0,
      });
    }
  }

  const plan = {
    generatedAt: new Date().toISOString(),
    totalBrokenProducts: brokenReport.productsWithBrokenImages.length,
    reuploadCount: reupload.length,
    stripOnlyCount: stripOnly.length,
    reupload,
    stripOnly,
  };
  fs.writeFileSync(PLAN_PATH, JSON.stringify(plan, null, 2));

  console.log(`\n=== Broken-image fix plan ===`);
  console.log(`Total broken products:                    ${plan.totalBrokenProducts}`);
  console.log(`Will re-upload from local folder:         ${reupload.length}`);
  console.log(`Will strip dead URLs only (no local src):  ${stripOnly.length}`);
  const zeroAfterStrip = stripOnly.filter((s) => s.wouldHaveZeroImages);
  if (zeroAfterStrip.length) {
    console.log(`\n⚠ ${zeroAfterStrip.length} of those would end up with ZERO images after stripping (every current image is broken and no local source exists):`);
    for (const z of zeroAfterStrip) console.log(`   - ${z.productId} (${z.category})`);
  }
  const byCat = {};
  for (const r of reupload) byCat[r.category] = (byCat[r.category] || 0) + 1;
  console.log(`Reupload by category:`, byCat);
  const stripByCat = {};
  for (const s of stripOnly) stripByCat[s.category] = (stripByCat[s.category] || 0) + 1;
  console.log(`Strip-only by category:`, stripByCat);
  console.log(`\nPlan written to ${PLAN_PATH}`);
}

main();
