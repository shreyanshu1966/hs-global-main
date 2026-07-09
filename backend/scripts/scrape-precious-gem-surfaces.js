#!/usr/bin/env node
'use strict';
/** Read-only: crawl preciousgemsurfaces.com's sitemap and extract
 * { name, url, startingPrice } for every real product page (identified by the
 * presence of a "Price ( Starting At )" spec-table row — the sitemap also
 * contains blog/SEO landing pages and duplicate SEO variants of the same
 * product, which don't have that row and are skipped). */
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const SITEMAP_URL = 'https://semipreciousstoneslab.com/sitemap.xml';
const REQUEST_DELAY_MS = 300;
const HEADERS = { 'User-Agent': 'Mozilla/5.0 (compatible; hs-global-research-bot/1.0)' };

const SKIP_SUFFIXES = [
  '/', '/index.html', '/aboutus.html', '/contactus.html', '/presence.html',
  '/projects.html', '/blog.html', '/blog-2.html', '/thanks.html',
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchSitemapUrls() {
  const res = await axios.get(SITEMAP_URL, { headers: HEADERS, timeout: 15000 });
  const locs = [...res.data.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  return locs.filter((url) => {
    if (SKIP_SUFFIXES.some((suf) => url.endsWith(suf))) return false;
    if (/\/(google|yandex)[a-z0-9_]*\.html$/i.test(url)) return false;
    return true;
  });
}

function extractProduct(html, url) {
  const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
  if (!titleMatch) return null;
  const name = titleMatch[1].split('|')[0].trim();

  const startingAtIdx = html.search(/\(\s*Starting At\s*\)/i);
  if (startingAtIdx === -1) return null; // not a real product page

  const windowText = html.slice(startingAtIdx, startingAtIdx + 500);
  const priceMatch = windowText.match(/₹\s*[\d,]+(\.\d+)?\s*\/\s*sq\.?\s*ft\.?/i);
  if (!priceMatch) return null;

  return { name, url, startingPrice: priceMatch[0].replace(/\s+/g, ' ').trim() };
}

async function main() {
  console.log('Fetching sitemap...');
  const urls = await fetchSitemapUrls();
  console.log(`Candidate pages to check: ${urls.length}`);

  const products = [];
  const skipped = [];

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    process.stdout.write(`\r[${i + 1}/${urls.length}] ${url.padEnd(90)}`);
    try {
      const res = await axios.get(url, { headers: HEADERS, timeout: 15000 });
      const product = extractProduct(res.data, url);
      if (product) products.push(product);
      else skipped.push(url);
    } catch (e) {
      skipped.push(url + ` (error: ${e.message})`);
    }
    await sleep(REQUEST_DELAY_MS);
  }
  console.log('\n');

  // De-duplicate: the site has multiple SEO-variant URLs for the same
  // product; keep the shortest URL per unique (name + price) as canonical.
  const byKey = new Map();
  for (const p of products) {
    const key = `${p.name.toLowerCase()}|${p.startingPrice}`;
    const existing = byKey.get(key);
    if (!existing || p.url.length < existing.url.length) byKey.set(key, p);
  }
  const deduped = [...byKey.values()].sort((a, b) => a.name.localeCompare(b.name));

  const outPath = path.join(__dirname, 'precious-gem-surfaces-products.json');
  fs.writeFileSync(outPath, JSON.stringify(deduped, null, 2));

  console.log(`Product pages found: ${products.length} (raw, incl. SEO-duplicate URLs)`);
  console.log(`Unique products after de-dup: ${deduped.length}`);
  console.log(`Non-product pages skipped: ${skipped.length}`);
  console.log(`Wrote ${outPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
