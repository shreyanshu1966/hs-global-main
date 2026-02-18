/**
 * CSV SEO Data Import Script
 * 
 * This script imports SEO metadata from CSV file into the MongoDB database.
 * It updates existing products with comprehensive SEO fields including:
 * - Meta Title & Description
 * - H1 Tags
 * - Open Graph metadata
 * - Twitter Card data
 * - Canonical URLs
 * 
 * Usage:
 *   node backend/scripts/import-seo-from-csv.js
 * 
 * CSV Format Expected:
 *   url, H1 Tag, Title, Desc, Keyword, IMg URL 2, , Canonical Tag
 */

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('../models/Product');

// Connection string
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hsglobal';

// CSV file path - update this to your CSV file location
const CSV_FILE_PATH = path.join(__dirname, '../../All in One Hs Global & Etsy Data Update - All Pages.csv');

/**
 * Extract product slug/ID from URL
 * Example: https://www.hsglobalexport.com/products/beige-travertine-coffee-table -> beige-travertine-coffee-table
 */
function extractSlugFromUrl(url) {
  if (!url) return null;
  
  const match = url.match(/\/products\/([^\/\?#]+)/);
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
  console.log('\n📊 Starting CSV SEO Import...\n');
  console.log(`📁 Reading CSV from: ${CSV_FILE_PATH}\n`);

  if (!fs.existsSync(CSV_FILE_PATH)) {
    console.error(`❌ CSV file not found at: ${CSV_FILE_PATH}`);
    console.log('\n💡 Please update the CSV_FILE_PATH variable with the correct path to your CSV file.');
    process.exit(1);
  }

  const results = [];
  let rowCount = 0;
  let updatedCount = 0;
  let notFoundCount = 0;
  let skippedCount = 0;
  let isFirstLine = true;

  return new Promise((resolve, reject) => {
    fs.createReadStream(CSV_FILE_PATH)
      .pipe(csv({
        skipEmptyLines: true,
        trim: true
      }))
      .on('data', (row) => {
        rowCount++;
        
        // Skip the first line if it's empty (just commas)
        if (isFirstLine) {
          isFirstLine = false;
          const firstValue = Object.values(row)[0];
          if (!firstValue || !firstValue.trim()) {
            skippedCount++;
            return;
          }
        }
        
        // Extract data from CSV row - handle various column name formats
        const url = (row.url || row.URL || '').trim();
        const h1Tag = (row['H1 Tag'] || row.h1_tag || row.h1Tag || '').trim();
        const title = (row.Title || row.title || '').trim();
        const description = (row.Desc || row.Description || row.description || '').trim();
        const keywords = (row.Keyword || row.Keywords || row.keywords || '').trim();
        const ogImage = (row['IMg URL 2'] || row.image || row.Image || '').trim();
        const canonicalTag = (row['Canonical Tag'] || row.canonical || url).trim();

        // Skip if no URL or if it's a non-product URL
        if (!url || !url.includes('/products/')) {
          skippedCount++;
          return;
        }

        // Additional check: make sure it's a specific product, not just /products page
        const urlParts = url.split('/products/');
        if (urlParts.length < 2 || !urlParts[1] || urlParts[1].trim() === '') {
          skippedCount++;
          return;
        }

        results.push({
          url,
          slug: extractSlugFromUrl(url),
          h1Tag,
          title,
          description,
          keywords: parseKeywords(keywords),
          ogImage,
          canonicalTag
        });
      })
      .on('end', async () => {
        console.log(`📄 Total rows read from CSV: ${rowCount}`);
        console.log(`✅ Valid product rows: ${results.length}`);
        console.log(`⏭️  Skipped rows (non-product): ${skippedCount}\n`);

        // Process each product
        for (const item of results) {
          try {
            if (!item.slug) {
              console.log(`⚠️  Cannot extract slug from URL: ${item.url}`);
              notFoundCount++;
              continue;
            }

            // Try to find product by slug in name or by productId
            const product = await Product.findOne({
              $or: [
                { productId: item.slug },
                { productId: new RegExp(item.slug.replace(/-/g, '\\s*[-\\s]\\s*'), 'i') },
                { name: { $regex: new RegExp(item.slug.replace(/-/g, ' '), 'i') } }
              ]
            });

            if (!product) {
              console.log(`❌ Product not found for slug: ${item.slug}`);
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

            // Update the product
            await Product.findByIdAndUpdate(
              product._id,
              {
                $set: {
                  seo: seoData,
                  // Also update legacy fields for backward compatibility
                  seoTitle: seoData.metaTitle,
                  seoDescription: seoData.metaDescription,
                  seoKeywords: seoData.keywords
                }
              },
              { new: true }
            );

            updatedCount++;
            console.log(`✅ Updated SEO for: ${product.name} (${item.slug})`);

          } catch (error) {
            console.error(`❌ Error updating product ${item.slug}:`, error.message);
          }
        }

        console.log('\n' + '='.repeat(60));
        console.log('📊 IMPORT SUMMARY');
        console.log('='.repeat(60));
        console.log(`Total CSV rows processed: ${rowCount}`);
        console.log(`Valid product entries: ${results.length}`);
        console.log(`Products updated: ${updatedCount}`);
        console.log(`Products not found: ${notFoundCount}`);
        console.log(`Rows skipped: ${skippedCount}`);
        console.log('='.repeat(60) + '\n');

        resolve();
      })
      .on('error', (error) => {
        console.error('❌ Error reading CSV file:', error.message);
        reject(error);
      });
  });
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
