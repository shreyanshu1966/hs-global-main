#!/usr/bin/env node
'use strict';
/**
 * ANALYSIS ONLY — makes no changes to the DB, Cloudinary, or any file except
 * writing its own report. Reads the live product dump produced by
 * deploy/fetch-all-products-for-analysis.js and checks every image URL
 * (image / images[] / sortedImages[]) with an HTTP request, flagging any
 * that don't resolve (404, timeout, non-2xx, non-Cloudinary/local path, etc).
 *
 * Usage:
 *   node deploy/fetch-all-products-for-analysis.js   (run first, from repo root)
 *   node backend/scripts/analyze-broken-images.js
 *
 * Writes: backend/scripts/broken-images-report.json
 */
const fs = require('fs');
const path = require('path');

const DUMP_PATH = path.join(__dirname, 'all-products-live.json');
const REPORT_PATH = path.join(__dirname, 'broken-images-report.json');
const CONCURRENCY = 20;
const TIMEOUT_MS = 10000;

function collectUrls(product) {
  const urls = new Set();
  if (product.image) urls.add(product.image);
  for (const u of product.images || []) if (u) urls.add(u);
  for (const u of product.sortedImages || []) if (u) urls.add(u);
  return [...urls];
}

async function checkUrl(url) {
  if (!/^https?:\/\//i.test(url)) {
    return { url, ok: false, reason: 'not-an-absolute-url' };
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    let res = await fetch(url, { method: 'HEAD', signal: controller.signal });
    if (res.status === 405 || res.status === 501) {
      // Some CDNs don't support HEAD; fall back to a ranged GET.
      res = await fetch(url, { method: 'GET', headers: { Range: 'bytes=0-0' }, signal: controller.signal });
    }
    clearTimeout(timer);
    if (res.ok || res.status === 206) return { url, ok: true, status: res.status };
    return { url, ok: false, status: res.status, reason: `http-${res.status}` };
  } catch (err) {
    clearTimeout(timer);
    return { url, ok: false, reason: err.name === 'AbortError' ? 'timeout' : (err.message || 'fetch-error') };
  }
}

async function runPool(items, worker, concurrency) {
  const results = new Array(items.length);
  let next = 0;
  async function runOne() {
    while (next < items.length) {
      const i = next++;
      results[i] = await worker(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, runOne));
  return results;
}

async function main() {
  if (!fs.existsSync(DUMP_PATH)) {
    console.error(`Missing ${DUMP_PATH}`);
    console.error('Run: node deploy/fetch-all-products-for-analysis.js  (from repo root) first.');
    process.exit(1);
  }
  const products = JSON.parse(fs.readFileSync(DUMP_PATH, 'utf-8'));
  console.log(`Loaded ${products.length} products. Collecting unique image URLs...`);

  const urlToProducts = new Map(); // url -> [{productId, category}]
  let noImageAtAll = 0;
  for (const p of products) {
    const urls = collectUrls(p);
    if (urls.length === 0) noImageAtAll++;
    for (const url of urls) {
      if (!urlToProducts.has(url)) urlToProducts.set(url, []);
      urlToProducts.get(url).push({ productId: p.productId, category: p.category, subcategory: p.subcategory });
    }
  }

  const uniqueUrls = [...urlToProducts.keys()];
  console.log(`Checking ${uniqueUrls.length} unique URLs (concurrency=${CONCURRENCY})...`);

  let checked = 0;
  const results = await runPool(uniqueUrls, async (url) => {
    const r = await checkUrl(url);
    checked++;
    if (checked % 200 === 0) console.log(`  ...${checked}/${uniqueUrls.length} checked`);
    return r;
  }, CONCURRENCY);

  const brokenUrls = results.filter((r) => !r.ok);
  const brokenByProduct = new Map();
  for (const r of brokenUrls) {
    for (const ref of urlToProducts.get(r.url)) {
      const key = ref.productId;
      if (!brokenByProduct.has(key)) {
        brokenByProduct.set(key, { productId: ref.productId, category: ref.category, subcategory: ref.subcategory, brokenUrls: [] });
      }
      brokenByProduct.get(key).brokenUrls.push({ url: r.url, reason: r.reason, status: r.status });
    }
  }

  const productsWithBrokenImages = [...brokenByProduct.values()]
    .sort((a, b) => b.brokenUrls.length - a.brokenUrls.length);

  const productsWithNoImages = products
    .filter((p) => collectUrls(p).length === 0)
    .map((p) => ({ productId: p.productId, category: p.category, subcategory: p.subcategory }));

  const byCategory = {};
  for (const p of productsWithBrokenImages) {
    byCategory[p.category] = (byCategory[p.category] || 0) + 1;
  }

  const report = {
    generatedAt: new Date().toISOString(),
    totalProducts: products.length,
    totalUniqueUrls: uniqueUrls.length,
    totalBrokenUrls: brokenUrls.length,
    productsWithBrokenImagesCount: productsWithBrokenImages.length,
    productsWithNoImagesCount: productsWithNoImages.length,
    brokenCountByCategory: byCategory,
    productsWithBrokenImages,
    productsWithNoImages,
  };
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));

  console.log(`\n=== Broken Cloudinary/image link analysis ===`);
  console.log(`Products checked:            ${products.length}`);
  console.log(`Unique image URLs checked:   ${uniqueUrls.length}`);
  console.log(`Broken URLs:                 ${brokenUrls.length}`);
  console.log(`Products with >=1 broken img:${productsWithBrokenImages.length}`);
  console.log(`Products with NO images:     ${productsWithNoImages.length}`);
  console.log(`By category (broken):`, byCategory);
  console.log(`\nReport written to ${REPORT_PATH}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
