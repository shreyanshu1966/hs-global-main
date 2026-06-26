const { MongoClient } = require('mongodb');
const path = require('path');
const fs = require('fs');
const { parse } = require('csv-parse/sync');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function importCsv() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  console.log('Connected to MongoDB');

  const pageseoCol = db.collection('pageseos');
  const productsCol = db.collection('products');

  const csvFilePath = path.join(__dirname, '..', 'All in One HSGlobal & Etsy Data Update - Live Website HS Global Export_with_ids.csv');
  const fileContent = fs.readFileSync(csvFilePath, 'utf8');

  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  let pageUpdates = 0;
  let productUpdates = 0;
  
  const seenProducts = new Set();
  const seenPages = new Set();

  for (const record of records) {
    const rawUrl = record.url || '';
    if (!rawUrl.startsWith('http')) continue;

    const newUrl = record['New Url'];
    const title = record['Title'];
    const desc = record['Desc'];
    const keywordsStr = record['Keyword'];
    const hsProductId = record['hs_product_id'];

    if (!title && !desc) continue;

    let keywords = [];
    if (keywordsStr) {
      keywords = keywordsStr.split(',').map(k => k.trim()).filter(Boolean);
    }

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

      if (query.$or.length === 0) continue;

      const product = await productsCol.findOne(query);
      if (product) {
        const updateFields = {
          seoTitle: title || product.seoTitle,
          seoDescription: desc || product.seoDescription,
          'seo.metaTitle': title || (product.seo && product.seo.metaTitle),
          'seo.metaDescription': desc || (product.seo && product.seo.metaDescription)
        };

        if (keywords.length > 0) {
          updateFields.seoKeywords = keywords;
          updateFields['seo.keywords'] = keywords;
        }

        if (hsProductId === 'HSMCETWH37') {
           console.log('DEBUG: Updating HSMCETWH37 with:', updateFields);
        }

        // We only update if it already exists, no need to change productId
        const res = await productsCol.updateOne({ _id: product._id }, { $set: updateFields });
        if (hsProductId === 'HSMCETWH37') console.log('DEBUG: Result:', res);
        productUpdates++;
      } else {
        console.log(`Product not found for: hs_product_id=${hsProductId}, newSlug=${newSlug}, oldSlug=${oldSlug}`);
      }
    } else {
      // It's a PageSeo
      const pagePath = pathname === '' ? '/' : pathname;
      let newPath = pagePath;
      if (newUrl && newUrl.startsWith('http')) {
         newPath = new URL(newUrl).pathname;
         if (newPath === '') newPath = '/';
      }
      
      if (seenPages.has(newPath)) continue;
      seenPages.add(newPath);
      
      const pageDoc = await pageseoCol.findOne({ $or: [{ path: pagePath }, { path: newPath }] });
      
      const updateFields = {};
      if (title) updateFields.title = title;
      if (desc) updateFields.description = desc;
      if (keywords.length > 0) updateFields.keywords = keywords;

      if (pageDoc) {
        await pageseoCol.updateOne({ _id: pageDoc._id }, { $set: updateFields });
        pageUpdates++;
      } else {
        updateFields.path = newPath;
        updateFields.canonical = `https://www.hsglobalexport.com${newPath}`;
        await pageseoCol.insertOne(updateFields);
        pageUpdates++;
      }
    }
  }

  console.log(`Updated ${pageUpdates} page SEO records.`);
  console.log(`Updated ${productUpdates} product records.`);
  await client.close();
}

importCsv().catch(err => {
  console.error(err);
  process.exit(1);
});
