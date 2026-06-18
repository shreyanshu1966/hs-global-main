/**
 * Apply SEO data from pre-computed CSV→DB matches.
 * Matches are passed in via MATCHES_JSON env var (JSON string).
 *
 * Run: MATCHES_JSON='[...]' node backend/scripts/import-seo-products-matched.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('../models/Product');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hsglobal';

function truncate(text, max) {
  if (!text) return '';
  return text.length <= max ? text : text.slice(0, max - 3).trim() + '...';
}

function parseKeywords(str) {
  if (!str) return [];
  return str.split(',').map(k => k.trim()).filter(Boolean);
}

async function main() {
  const matchesJson = process.env.MATCHES_JSON;
  if (!matchesJson) {
    console.error('MATCHES_JSON env var required');
    process.exit(1);
  }
  const matches = JSON.parse(matchesJson);

  await mongoose.connect(MONGO_URI);
  console.log(`MongoDB connected — applying SEO to ${matches.length} products\n`);

  let updated = 0, missed = 0;

  for (const m of matches) {
    const product = await Product.findOne({ productId: m.db_id });
    if (!product) {
      console.log(`  not found in DB: ${m.db_id}`);
      missed++;
      continue;
    }

    const kw = parseKeywords(m.kw);

    await Product.findByIdAndUpdate(product._id, {
      $set: {
        seo: {
          metaTitle:          truncate(m.title, 60) || product.name,
          metaDescription:    truncate(m.desc,  160) || product.description,
          keywords:           kw.length ? kw : [product.name],
          h1Tag:              m.h1 || product.name,
          ogTitle:            truncate(m.title, 60) || product.name,
          ogDescription:      truncate(m.desc,  160) || product.description,
          ogImage:            m.img || product.image,
          twitterTitle:       truncate(m.title, 60) || product.name,
          twitterDescription: truncate(m.desc,  160) || product.description,
          twitterImage:       m.img || product.image,
          canonicalUrl:       m.canon || m.csv_slug,
          slug:               m.db_id,
        },
        seoTitle:       truncate(m.title, 60) || product.name,
        seoDescription: truncate(m.desc,  160) || product.description,
        seoKeywords:    kw.length ? kw : [product.name],
      }
    });

    console.log(`  updated [${m.score}]: ${m.db_id.slice(0, 60)}`);
    updated++;
  }

  console.log(`\nDone — ${updated} updated, ${missed} not found in DB`);
  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
