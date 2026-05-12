/*
 * Furniture migration script
 *
 * Source of truth:
 * - frontend/src/assets/furnitures/ (image folder structure)
 * - product-cloudinary-urls.json (Cloudinary URLs)
 * - frontend/src/data/furnitureSpecs.ts (price/spec mapping)
 * - frontend/public/videos/ (video paths)
 *
 * Usage:
 *   node backend/scripts/migrate-furniture-db.js --dry-run
 *   node backend/scripts/migrate-furniture-db.js --apply
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const Product = require('../models/Product');
const Category = require('../models/Category');

const ROOT = path.resolve(__dirname, '..', '..');
const FURNITURE_SPECS_TS = path.join(ROOT, 'frontend', 'src', 'data', 'furnitureSpecs.ts');
const PRODUCT_CLOUDINARY_MAP_JSON = path.join(ROOT, 'product-cloudinary-urls.json');
const FRONTEND_PUBLIC_VIDEOS = path.join(ROOT, 'frontend', 'public', 'videos');

const argv = new Set(process.argv.slice(2));
const isApply = argv.has('--apply');
const isDryRun = argv.has('--dry-run') || !isApply;

const normalizeName = (name) =>
  String(name || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ');

const toSlug = (value) =>
  String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const toTitle = (value) =>
  String(value || '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());

const sortImagesByPriority = (images) => {
  const patterns = [
    /^1\./i,
    /^01\./i,
    /main/i,
    /cover/i,
    /primary/i,
    /_01\./i,
    /^1-/i,
    /stand/i,
    /front/i,
    /hero/i,
    /^a\./i,
  ];

  const score = (img) => {
    const file = String(img).split('/').pop() || '';
    for (let i = 0; i < patterns.length; i += 1) {
      if (patterns[i].test(file)) return i;
    }
    const numMatch = file.match(/^(\d+)\./);
    return numMatch ? 1000 + Number(numMatch[1]) : 10000;
  };

  return [...images].sort((a, b) => score(a) - score(b));
};

const parseFurnitureSpecs = () => {
  const source = fs.readFileSync(FURNITURE_SPECS_TS, 'utf8');
  const startToken = 'const furnitureSpecsData: Record<string, FurnitureSpec> =';
  const assignIdx = source.indexOf(startToken);
  if (assignIdx === -1) {
    throw new Error('Could not parse furnitureSpecsData from furnitureSpecs.ts');
  }

  const objectStart = source.indexOf('{', assignIdx);
  if (objectStart === -1) {
    throw new Error('Could not locate furnitureSpecsData object start');
  }

  let depth = 0;
  let objectEnd = -1;
  let quote = null;
  let escaped = false;

  for (let i = objectStart; i < source.length; i += 1) {
    const ch = source[i];

    if (quote) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === '\\') {
        escaped = true;
        continue;
      }
      if (ch === quote) {
        quote = null;
      }
      continue;
    }

    if (ch === '"' || ch === '\'' || ch === '`') {
      quote = ch;
      continue;
    }

    if (ch === '{') {
      depth += 1;
      continue;
    }

    if (ch === '}') {
      depth -= 1;
      if (depth === 0) {
        objectEnd = i;
        break;
      }
    }
  }

  if (objectEnd === -1) {
    throw new Error('Could not locate furnitureSpecsData object end');
  }

  const objectLiteral = source.slice(objectStart, objectEnd + 1); // includes wrapping { ... }
  const parsed = vm.runInNewContext(`(${objectLiteral})`, {});
  return parsed || {};
};

const readCloudinaryMap = () => {
  const raw = fs.readFileSync(PRODUCT_CLOUDINARY_MAP_JSON, 'utf8');
  const parsed = JSON.parse(raw);
  return parsed.urls || {};
};

const gatherVideoMap = (videoRoot, videoBaseUrl) => {
  const map = new Map();

  if (!fs.existsSync(videoRoot)) {
    return map;
  }

  const walk = (dir) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
        continue;
      }

      if (!/\.(mp4|webm|mov|avi)$/i.test(entry.name)) {
        continue;
      }

      const relative = path.relative(videoRoot, full).split(path.sep).join('/');
      const parts = relative.split('/');
      if (parts.length < 2) continue;

      const productFolder = parts[parts.length - 2];
      const normalized = normalizeName(productFolder);
      const stat = fs.statSync(full);
      const publicUrl = encodeURI(`${videoBaseUrl.replace(/\/+$/, '')}/${relative}`);

      map.set(normalized, {
        url: publicUrl,
        filename: entry.name,
        size: stat.size,
        uploadedAt: stat.mtime,
      });
    }
  };

  walk(videoRoot);
  return map;
};

const buildFurnitureProducts = ({ specsByName, cloudinaryUrls, videoMap }) => {
  const productBucket = new Map();

  Object.entries(cloudinaryUrls).forEach(([originalPath, mapping]) => {
    if (!String(originalPath).startsWith('furnitures/')) return;
    if (!mapping || !mapping.cloudinary) return;

    const parts = String(originalPath).split('/');
    if (parts.length < 4) return;

    const main = toTitle(parts[1]);
    let subcategory = '';
    let productName = '';

    if ((main === 'Tables' || main === 'Wash Basins') && parts.length >= 5) {
      subcategory = toTitle(parts[2]);
      productName = toTitle(parts[3]);
    } else {
      subcategory = main;
      productName = toTitle(parts[2]);
    }

    if (!productName) return;

    const bucketKey = `${normalizeName(productName)}::${toSlug(subcategory)}`;
    if (!productBucket.has(bucketKey)) {
      productBucket.set(bucketKey, {
        productName,
        subcategory,
        imageUrls: [],
      });
    }

    const bucket = productBucket.get(bucketKey);
    if (!bucket.imageUrls.includes(mapping.cloudinary)) {
      bucket.imageUrls.push(mapping.cloudinary);
    }
  });

  const usedProductIds = new Set();
  const products = [];

  for (const bucket of productBucket.values()) {
    const sortedImages = sortImagesByPriority(bucket.imageUrls);
    const image = sortedImages[0] || '';

    const normalizedName = normalizeName(bucket.productName);
    const specs = specsByName[normalizedName] || null;
    const video = videoMap.get(normalizedName) || null;

    let productIdBase = toSlug(bucket.productName);
    if (!productIdBase) productIdBase = `furniture-${products.length + 1}`;
    let productId = productIdBase;
    let i = 2;
    while (usedProductIds.has(productId)) {
      productId = `${productIdBase}-${i}`;
      i += 1;
    }
    usedProductIds.add(productId);

    const furnitureSpecs = specs
      ? {
          type: specs.type,
          shape: specs.shape,
          material: specs.material,
          size: specs.size,
          surfaceFinish: specs.surfaceFinish,
          colorName: specs.colorName,
          height: specs.height,
          location: specs.location,
          packagingDetails: specs.packagingDetails,
        }
      : undefined;

    const priceUSD = Number.isFinite(specs?.priceUSD) ? Number(specs.priceUSD) : undefined;

    products.push({
      productId,
      name: bucket.productName,
      category: 'furniture',
      subcategory: toSlug(bucket.subcategory),
      description: `${bucket.productName} - ${bucket.subcategory}`,
      image,
      images: sortedImages,
      sortedImages,
      priceUSD,
      available: Boolean(priceUSD),
      hasVideo: Boolean(video),
      videoUrl: video?.url || null,
      videoFilename: video?.filename || null,
      videoSize: video?.size || null,
      videoUploadedAt: video?.uploadedAt || null,
      furnitureSpecs,
      status: 'active',
      featured: false,
      tags: ['furniture', toSlug(bucket.subcategory)],
    });
  }

  return products;
};

const connectDb = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hs_global_export';
  await mongoose.connect(uri, {
    dbName: 'hs_global_export',
    serverSelectionTimeoutMS: 10000,
  });
};

const run = async () => {
  const videoBaseUrl = process.env.VIDEO_BASE_URL || 'https://www.hsglobalexport.com/videos';

  console.log(`Mode: ${isDryRun ? 'DRY RUN' : 'APPLY'}`);
  console.log('Loading furniture specs and media maps...');

  const rawSpecs = parseFurnitureSpecs();
  const specsByName = {};
  Object.entries(rawSpecs).forEach(([key, value]) => {
    specsByName[normalizeName(key)] = value;
  });

  const cloudinaryUrls = readCloudinaryMap();
  const videoMap = gatherVideoMap(FRONTEND_PUBLIC_VIDEOS, videoBaseUrl);

  const products = buildFurnitureProducts({
    specsByName,
    cloudinaryUrls,
    videoMap,
  });

  const subcategories = Array.from(new Set(products.map((p) => p.subcategory))).sort((a, b) => a.localeCompare(b));

  const withVideo = products.filter((p) => p.hasVideo).length;
  const withPrice = products.filter((p) => Number.isFinite(p.priceUSD)).length;

  console.log('Furniture migration preview:');
  console.log(`- Products prepared: ${products.length}`);
  console.log(`- With price: ${withPrice}`);
  console.log(`- With video path: ${withVideo}`);
  console.log(`- Subcategories: ${subcategories.length}`);

  if (products.length === 0) {
    throw new Error('No furniture products prepared. Aborting.');
  }

  if (isDryRun) {
    console.log('Dry-run finished. No DB changes were applied.');
    return;
  }

  console.log('Connecting to MongoDB...');
  await connectDb();

  console.log('Removing existing products and categories from DB...');
  await Product.deleteMany({});
  await Category.deleteMany({});

  console.log('Inserting migrated furniture products...');
  await Product.insertMany(products, { ordered: false });

  console.log('Creating furniture category document...');
  await Category.create({
    categoryId: 'furniture',
    categoryName: 'Furniture',
    customSubcategories: subcategories.map((sub) => ({
      id: toSlug(sub),
      name: sub,
      isCustom: false,
    })),
    createdBy: 'migration-script',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log('Migration applied successfully.');
};

run()
  .catch((error) => {
    console.error('Migration failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });
