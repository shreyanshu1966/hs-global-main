const { MongoClient } = require('mongodb');
const path = require('path');
const fs = require('fs');
const { parse } = require('csv-parse/sync');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function crossCheck() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) {
    console.error('No MONGO_URI found');
    process.exit(1);
  }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();

  const pageseoCol = db.collection('pageseos');
  const productsCol = db.collection('products');

  const csvFilePath = path.join(__dirname, '..', 'All in One HSGlobal & Etsy Data Update - Live Website HS Global Export_with_ids.csv');
  const fileContent = fs.readFileSync(csvFilePath, 'utf8');

  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  let totalRows = 0;
  let matches = 0;
  let mismatches = [];
  let notFound = [];

  const seenProducts = new Set();
  const seenPages = new Set();

  for (const record of records) {
    const rawUrl = record.url || '';
    if (!rawUrl.startsWith('http')) continue;

    const newUrl = record['New Url'];
    const expectedTitle = record['Title'];
    const expectedDesc = record['Desc'];
    const expectedKeywordsStr = record['Keyword'];
    const hsProductId = record['hs_product_id'];

    if (!expectedTitle && !expectedDesc) continue;
    totalRows++;

    const expectedKeywords = expectedKeywordsStr ? expectedKeywordsStr.split(',').map(k => k.trim()).filter(Boolean) : [];

    const urlObj = new URL(rawUrl);
    const pathname = urlObj.pathname;

    let isProduct = pathname.startsWith('/product/');
    let newSlug = undefined;

    if (newUrl && newUrl.startsWith('http')) {
      const newUrlObj = new URL(newUrl);
      if (newUrlObj.pathname.startsWith('/product/')) {
        isProduct = true;
        newSlug = newUrlObj.pathname.replace('/product/', '').replace(/\/$/, '');
      }
    }

    if (isProduct) {
      const oldSlug = pathname.replace('/product/', '').replace(/\/$/, '');
      const uniqueKey = hsProductId || newSlug || oldSlug;
      if (uniqueKey) {
        if (seenProducts.has(uniqueKey)) continue;
        seenProducts.add(uniqueKey);
      }
      const query = { $or: [] };
      if (hsProductId) query.$or.push({ productCode: hsProductId });
      if (newSlug) query.$or.push({ productId: newSlug });
      if (oldSlug) query.$or.push({ productId: oldSlug });

      const product = await productsCol.findOne(query);
      if (!product) {
        notFound.push(`Product not found: ${hsProductId || newSlug || oldSlug}`);
        continue;
      }

      // Check fields
      let isMatch = true;
      let reasons = [];
      
      const dbTitle = product.seoTitle || product.seo?.metaTitle || '';
      const dbDesc = product.seoDescription || product.seo?.metaDescription || '';

      if (expectedTitle && dbTitle !== expectedTitle) {
        isMatch = false; reasons.push(`Title mismatch: expected "${expectedTitle}", got "${dbTitle}"`);
      }
      if (expectedDesc && dbDesc !== expectedDesc) {
        isMatch = false; reasons.push(`Desc mismatch: expected "${expectedDesc}", got "${dbDesc}"`);
      }

      if (isMatch) {
        matches++;
      } else {
        mismatches.push(`[${hsProductId || newSlug || oldSlug}] ${reasons.join(' | ')}`);
      }
    } else {
      const pagePath = pathname === '' ? '/' : pathname;
      let newPath = pagePath;
      if (newUrl && newUrl.startsWith('http')) {
         newPath = new URL(newUrl).pathname;
         if (newPath === '') newPath = '/';
      }
      if (seenPages.has(newPath)) continue;
      seenPages.add(newPath);
      
      const pageDoc = await pageseoCol.findOne({ $or: [{ path: pagePath }, { path: newPath }] });
      if (!pageDoc) {
        notFound.push(`Page not found: ${newPath}`);
        continue;
      }

      let isMatch = true;
      let reasons = [];
      if (expectedTitle && pageDoc.title !== expectedTitle) {
        isMatch = false; reasons.push(`Title mismatch: expected "${expectedTitle}", got "${pageDoc.title}"`);
      }
      if (expectedDesc && pageDoc.description !== expectedDesc) {
        isMatch = false; reasons.push(`Desc mismatch: expected "${expectedDesc}", got "${pageDoc.description}"`);
      }

      if (isMatch) {
        matches++;
      } else {
        mismatches.push(`[${newPath}] ${reasons.join(' | ')}`);
      }
    }
  }

  console.log('--- CROSS CHECK RESULTS ---');
  console.log(`Total valid rows checked: ${totalRows}`);
  console.log(`Perfect matches: ${matches}`);
  console.log(`Not found in DB: ${notFound.length}`);
  if (notFound.length > 0) {
    console.log('\\nNOT FOUND:');
    notFound.slice(0, 10).forEach(n => console.log('  - ' + n));
    if (notFound.length > 10) console.log(`  ...and ${notFound.length - 10} more`);
  }

  console.log(`\\nMismatches: ${mismatches.length}`);
  if (mismatches.length > 0) {
    console.log('MISMATCHES:');
    mismatches.slice(0, 10).forEach(m => console.log('  - ' + m));
    if (mismatches.length > 10) console.log(`  ...and ${mismatches.length - 10} more`);
  }

  await client.close();
}

crossCheck().catch(err => {
  console.error(err);
  process.exit(1);
});
