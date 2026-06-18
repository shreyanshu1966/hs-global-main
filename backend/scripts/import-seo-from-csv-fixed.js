/**
 * CSV SEO Data Import Script - FIXED VERSION
 *
 * Handles UTF-8 BOM and various CSV formats
 * Pass --dry-run to preview changes without writing to DB
 */

const DRY_RUN = process.argv.includes('--dry-run');

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('../models/Product');

// Connection string
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hsglobal';

// CSV file path
const CSV_FILE_PATH = path.join(__dirname, '../../All in One HSGlobal & Etsy Data Update - Live Website HS Global Export_with_ids.csv');

/**
 * Extract product slug/ID from URL
 */
function extractSlugFromUrl(url) {
  if (!url) return null;
  
  const match = url.match(/\/products?\/([^\/\?#]+)/);
  return match ? match[1] : null;
}

/**
 * Truncate text to specified length
 */
function truncate(text, maxLength) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3).trim() + '...';
}

/**
 * Parse keywords string into array
 */
function parseKeywords(keywordString) {
  if (!keywordString) return [];
  
  return keywordString
    .split(',')
    .map(k => k.trim())
    .filter(k => k.length > 0);
}

/**
 * Connect to MongoDB
 */
async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
}

/**
 * Import SEO data from CSV
 */
async function importSEOData() {
  console.log(`\n📊 Starting CSV SEO Import${DRY_RUN ? ' [DRY RUN — no writes]' : ''}...\n`);
  console.log(`📁 Reading CSV from: ${CSV_FILE_PATH}\n`);

  if (!fs.existsSync(CSV_FILE_PATH)) {
    console.error(`❌ CSV file not found at: ${CSV_FILE_PATH}`);
    process.exit(1);
  }

  try {
    // Read file and remove BOM if present
    let fileContent = fs.readFileSync(CSV_FILE_PATH, 'utf8');
    
    // Remove UTF-8 BOM if present
    if (fileContent.charCodeAt(0) === 0xFEFF) {
      fileContent = fileContent.slice(1);
      console.log('🔧 Removed UTF-8 BOM from file');
    }

    // Split into lines and remove the first empty line if it exists
    const lines = fileContent.split('\n');
    if (lines[0] && lines[0].trim().match(/^,+$/)) {
      console.log('🔧 Skipping empty first line');
      lines.shift(); // Remove first line
      fileContent = lines.join('\n');
    }

    // Parse CSV synchronously for better error handling
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true,
      bom: true
    });

    console.log(`📄 Total rows read from CSV: ${records.length}\n`);

    // Debug: Show first 3 rows
    console.log('🔍 Debug - First 3 rows:');
    records.slice(0, 3).forEach((row, idx) => {
      console.log(`\nRow ${idx + 1}:`);
      console.log('  Columns:', Object.keys(row).slice(0, 5).join(', '));
      const url = (row.url || row.URL || '').trim();
      console.log('  URL:', url || '(empty)');
      console.log('  Has /products/:', url.includes('/products/'));
    });
    console.log('\n');

    let updatedCount = 0;
    let notFoundCount = 0;
    let skippedCount = 0;
    const validProducts = [];

    // Process each row
    for (const row of records) {
      // Extract data from CSV row
      const url = (row.url || row.URL || '').trim();
      const h1Tag = (row['H1 Tag'] || row.h1_tag || row.h1Tag || '').trim();
      const title = (row.Title || row.title || '').trim();
      const description = (row.Desc || row.Description || row.description || '').trim();
      const keywords = (row.Keyword || row.Keywords || row.keywords || '').trim();
      const ogImage = (row['IMg URL 2'] || row.image || row.Image || '').trim();
      const canonicalTag = (row['Canonical Tag'] || row.canonical || url).trim();

      // Skip if no URL or if it's not a specific product URL (/product/ or /products/)
      const isProductUrl = url.includes('/product/') || url.includes('/products/');
      if (!url || !isProductUrl) {
        skippedCount++;
        continue;
      }

      // Skip bare /products page (no slug after it)
      const afterProducts = url.split(/\/products?\//)[1];
      if (!afterProducts || afterProducts.trim() === '') {
        skippedCount++;
        continue;
      }

      const slug = extractSlugFromUrl(url);
      if (!slug) {
        console.log(`⚠️  Cannot extract slug from URL: ${url}`);
        notFoundCount++;
        continue;
      }

      // hs_product_id column = pre-matched DB productCode (e.g. HSMBTBE1)
      const hsProductId = (row.hs_product_id || '').trim();

      validProducts.push({
        url,
        slug,
        hsProductId,
        h1Tag,
        title,
        description,
        keywords: parseKeywords(keywords),
        ogImage,
        canonicalTag
      });
    }

    console.log(`✅ Valid product rows: ${validProducts.length}`);
    console.log(`⏭️  Skipped rows (non-product): ${skippedCount}\n`);

    // Process each valid product
    for (const item of validProducts) {
      try {
        // 1. Exact match on pre-resolved productCode (e.g. HSMBTBE1) — fastest, most accurate
        // 2. Fallback: exact slug, regex on productId, regex on name
        const query = item.hsProductId
          ? { productCode: item.hsProductId }
          : {
              $or: [
                { productId: item.slug },
                { productId: new RegExp(item.slug.replace(/-/g, '\\s*[-\\s]\\s*'), 'i') },
                { name: new RegExp(item.slug.replace(/-/g, ' '), 'i') }
              ]
            };

        const product = await Product.findOne(query);

        if (!product) {
          console.log(`❌ Product not found for slug: ${item.slug}${item.hsProductId ? ` (hs_id: ${item.hsProductId})` : ''}`);
          notFoundCount++;
          continue;
        }

        // Update product with SEO data
        const seoData = {
          metaTitle: truncate(item.title, 60) || product.name,
          metaDescription: truncate(item.description, 160) || product.description,
          keywords: item.keywords.length > 0 ? item.keywords : [product.name, product.category, product.subcategory],
          h1Tag: item.h1Tag || product.name,
          ogTitle: truncate(item.title, 60) || product.name,
          ogDescription: truncate(item.description, 160) || product.description,
          ogImage: item.ogImage || product.image,
          twitterTitle: truncate(item.title, 60) || product.name,
          twitterDescription: truncate(item.description, 160) || product.description,
          twitterImage: item.ogImage || product.image,
          canonicalUrl: item.canonicalTag || item.url,
          slug: item.slug
        };

        if (DRY_RUN) {
          console.log(`  [DRY RUN] would update: ${product.name}`);
          console.log(`            slug      : ${item.slug}`);
          console.log(`            hs_id     : ${item.hsProductId || '(fallback match)'}`);
          console.log(`            title     : ${seoData.metaTitle}`);
          console.log(`            desc      : ${seoData.metaDescription.slice(0, 80)}...`);
          console.log(`            keywords  : ${seoData.keywords.slice(0,3).join(', ')}`);
        } else {
          await Product.findByIdAndUpdate(
            product._id,
            {
              $set: {
                seo: seoData,
                seoTitle: seoData.metaTitle,
                seoDescription: seoData.metaDescription,
                seoKeywords: seoData.keywords
              }
            },
            { new: true }
          );
          console.log(`✅ Updated SEO for: ${product.name} (${item.slug})`);
        }

        updatedCount++;

      } catch (error) {
        console.error(`❌ Error updating product ${item.slug}:`, error.message);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 IMPORT SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total CSV rows processed  : ${records.length}`);
    console.log(`Valid product entries      : ${validProducts.length}`);
    console.log(`Products ${DRY_RUN ? 'to update' : 'updated'}        : ${updatedCount}`);
    console.log(`Products not found        : ${notFoundCount}`);
    console.log(`Rows skipped              : ${skippedCount}`);
    if (DRY_RUN) console.log('\n⚠️  DRY RUN — nothing was written to the database.');
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Error processing CSV:', error.message);
    throw error;
  }
}

/**
 * Main execution
 */
async function main() {
  try {
    await connectDB();
    await importSEOData();
    
    console.log('✅ SEO import completed successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Import failed:', error.message);
    process.exit(1);
  }
}

// Run the script
main();
