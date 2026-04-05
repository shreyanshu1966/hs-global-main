#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { parse: parseCsv } = require('csv-parse/sync');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const Product = require('../models/Product');
const Category = require('../models/Category');

const ROOT = path.resolve(__dirname, '..', '..');
const BACKEND_ROOT = path.resolve(__dirname, '..');

const DEFAULT_CSV_PATH = path.join(
  ROOT,
  'new products',
  'Latest Etsy All Product Title Desc   - Sheet1 (1).csv'
);
const DEFAULT_PHOTOS_PATH = path.join(ROOT, 'new products', 'Etsy All Product Photos');
const DEFAULT_REPORT_PATH = path.join(BACKEND_ROOT, 'reports', 'etsy-serial-migration-report.json');

const DEFAULT_CATEGORY = 'furniture';
const DEFAULT_SUBCATEGORY_NAME = 'Etsy Serial Imports';

const args = process.argv.slice(2);
const isApply = args.includes('--apply');
const isDryRun = !isApply || args.includes('--dry-run');

function readArgValue(name, fallback) {
  const key = `--${name}=`;
  const found = args.find((arg) => arg.startsWith(key));
  if (!found) return fallback;
  const value = found.slice(key.length).trim().replace(/^"|"$/g, '');
  if (!value) return fallback;
  return path.isAbsolute(value) ? value : path.resolve(BACKEND_ROOT, value);
}

const CSV_PATH = readArgValue('csv', DEFAULT_CSV_PATH);
const PHOTOS_PATH = readArgValue('photos', DEFAULT_PHOTOS_PATH);
const REPORT_PATH = readArgValue('report', DEFAULT_REPORT_PATH);

function toSlug(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizeHeader(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function parsePrice(value) {
  if (value === null || value === undefined) return null;

  const raw = String(value).trim();
  if (!raw) return null;

  const upper = raw.toUpperCase();
  if (upper === 'NA' || upper === 'N/A' || upper === '-' || upper === 'NONE') {
    return null;
  }

  const numeric = raw.replace(/[^0-9.]/g, '');
  if (!numeric) return null;

  const parsed = Number.parseFloat(numeric);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return Math.round(parsed);
}

function extractSerial(value) {
  const raw = String(value || '').trim();
  if (!raw) return null;
  const match = raw.match(/^(\d+)/);
  if (!match) return null;
  return Number.parseInt(match[1], 10);
}

function buildRowObject(headerRow, rowValues) {
  const row = {};
  for (let i = 0; i < headerRow.length; i += 1) {
    const key = normalizeHeader(headerRow[i] || `col_${i}`);
    if (!key) continue;
    row[key] = String(rowValues[i] || '').trim();
  }
  return row;
}

function loadCsvRows(csvText) {
  const matrix = parseCsv(csvText, {
    columns: false,
    skip_empty_lines: false,
    relax_column_count: true,
    bom: true,
  });

  if (!Array.isArray(matrix) || matrix.length === 0) {
    return [];
  }

  const row1 = (matrix[0] || []).map((v) => String(v || '').trim());
  const row2 = (matrix[1] || []).map((v) => String(v || '').trim());

  let mergedHeader = [...row1];
  let consumedSecondHeader = false;

  for (let i = 0; i < mergedHeader.length; i += 1) {
    if (!mergedHeader[i] && row2[i]) {
      mergedHeader[i] = row2[i];
      consumedSecondHeader = true;
    }
  }

  const startDataIndex = consumedSecondHeader ? 2 : 1;
  const rows = [];

  for (let i = startDataIndex; i < matrix.length; i += 1) {
    const current = matrix[i] || [];
    const hasAnyValue = current.some((cell) => String(cell || '').trim());
    if (!hasAnyValue) continue;
    rows.push(buildRowObject(mergedHeader, current));
  }

  return rows;
}

function firstField(row, keys) {
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(row, key)) {
      return row[key];
    }
  }
  return undefined;
}

function collectImagesRecursive(folderPath) {
  const imageExtPattern = /\.(png|jpe?g|webp|avif)$/i;
  const stack = [folderPath];
  const files = [];

  while (stack.length > 0) {
    const current = stack.pop();
    const entries = fs.readdirSync(current, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
      } else if (imageExtPattern.test(entry.name)) {
        files.push(fullPath);
      }
    }
  }

  files.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
  return files;
}

function toWorkspaceRelativePath(absolutePath) {
  return path.relative(ROOT, absolutePath).split(path.sep).join('/');
}

function buildPhotosBySerial(photosRoot) {
  const map = new Map();

  const entries = fs.readdirSync(photosRoot, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const serialMatch = entry.name.match(/^(\d+)\s*\./);
    if (!serialMatch) continue;

    const serial = Number.parseInt(serialMatch[1], 10);
    const folderAbsPath = path.join(photosRoot, entry.name);
    const images = collectImagesRecursive(folderAbsPath).map(toWorkspaceRelativePath);

    map.set(serial, {
      folderName: entry.name,
      folderPath: toWorkspaceRelativePath(folderAbsPath),
      images,
    });
  }

  return map;
}

function buildProductsFromSerialMap(csvRows, photosBySerial) {
  const products = [];
  const issues = [];
  const usedProductIds = new Set();

  for (const row of csvRows) {
    const serial = extractSerial(firstField(row, ['no', 'sr no', 'serial no']));
    const title = firstField(row, ['title']) || firstField(row, ['short product name']);
    const price = parsePrice(firstField(row, ['price']));
    const description = firstField(row, ['desc']) || title || '';

    if (!serial) {
      issues.push({ type: 'missing-serial', row });
      continue;
    }

    if (!title || !String(title).trim()) {
      issues.push({ type: 'missing-title', serial, row });
      continue;
    }

    const photoData = photosBySerial.get(serial);
    if (!photoData || !photoData.images.length) {
      issues.push({ type: 'missing-images', serial, title });
      continue;
    }

    let productIdBase = `etsy-${serial}-${toSlug(title)}`;
    if (!productIdBase || productIdBase === `etsy-${serial}-`) {
      productIdBase = `etsy-${serial}`;
    }

    let productId = productIdBase;
    let counter = 2;
    while (usedProductIds.has(productId)) {
      productId = `${productIdBase}-${counter}`;
      counter += 1;
    }
    usedProductIds.add(productId);

    const images = photoData.images;
    const tags = [`serial-${serial}`, 'etsy-import', 'serial-mapped'];

    products.push({
      productId,
      name: String(title).trim(),
      category: DEFAULT_CATEGORY,
      subcategory: DEFAULT_SUBCATEGORY_NAME,
      description: String(description).trim() || String(title).trim(),
      image: images[0],
      images,
      sortedImages: images,
      priceINR: price,
      available: true,
      hasVideo: false,
      videoUrl: null,
      videoFilename: null,
      status: 'active',
      featured: false,
      tags,
      seoTitle: String(title).trim(),
      seoDescription: String(description).trim().slice(0, 300),
      seoKeywords: tags,
      migrationMeta: {
        source: 'etsy-csv-serial-migration',
        serial,
        sourceFolder: photoData.folderPath,
      },
    });
  }

  return { products, issues };
}

async function connectDb() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hs_global_export';
  await mongoose.connect(uri, {
    dbName: 'hs_global_export',
    serverSelectionTimeoutMS: 10000,
  });
}

async function ensureMigrationSubcategory() {
  const subcategoryId = toSlug(DEFAULT_SUBCATEGORY_NAME);

  let category = await Category.findOne({ categoryId: DEFAULT_CATEGORY });
  if (!category) {
    category = new Category({
      categoryId: DEFAULT_CATEGORY,
      categoryName: 'Furniture',
      customSubcategories: [],
    });
  }

  const exists = (category.customSubcategories || []).some((sub) => sub.id === subcategoryId);
  if (!exists) {
    category.customSubcategories.push({
      id: subcategoryId,
      name: DEFAULT_SUBCATEGORY_NAME,
      isCustom: true,
    });
  }

  category.updatedAt = new Date();
  await category.save();
}

function writeReport(report) {
  const dir = path.dirname(REPORT_PATH);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), 'utf8');
}

async function run() {
  if (!fs.existsSync(CSV_PATH)) {
    throw new Error(`CSV file not found: ${CSV_PATH}`);
  }

  if (!fs.existsSync(PHOTOS_PATH)) {
    throw new Error(`Photos folder not found: ${PHOTOS_PATH}`);
  }

  const csvText = fs.readFileSync(CSV_PATH, 'utf8');
  const csvRows = loadCsvRows(csvText);
  const photosBySerial = buildPhotosBySerial(PHOTOS_PATH);
  const { products, issues } = buildProductsFromSerialMap(csvRows, photosBySerial);

  const report = {
    timestamp: new Date().toISOString(),
    mode: isDryRun ? 'dry-run' : 'apply',
    csvPath: toWorkspaceRelativePath(CSV_PATH),
    photosPath: toWorkspaceRelativePath(PHOTOS_PATH),
    totals: {
      csvRows: csvRows.length,
      photoFolders: photosBySerial.size,
      productsPrepared: products.length,
      issues: issues.length,
    },
    issues,
  };

  if (isDryRun) {
    report.database = {
      skipped: true,
      message: 'Dry run only. Use --apply to delete old products and insert new ones.',
    };

    writeReport(report);
    console.log('Dry run complete.');
    console.log(`Prepared products: ${products.length}`);
    console.log(`Issues: ${issues.length}`);
    console.log(`Report: ${REPORT_PATH}`);
    return;
  }

  await connectDb();

  try {
    const deleteResult = await Product.deleteMany({});
    await ensureMigrationSubcategory();

    let insertedCount = 0;
    if (products.length > 0) {
      const insertResult = await Product.insertMany(products, { ordered: false });
      insertedCount = insertResult.length;
    }

    report.database = {
      deletedOldProducts: deleteResult.deletedCount,
      insertedProducts: insertedCount,
    };

    writeReport(report);

    console.log('Migration apply complete.');
    console.log(`Deleted old products: ${deleteResult.deletedCount}`);
    console.log(`Inserted products: ${insertedCount}`);
    console.log(`Report: ${REPORT_PATH}`);
  } finally {
    await mongoose.connection.close();
  }
}

run().catch((error) => {
  console.error('Migration failed:', error.message);
  process.exit(1);
});
