#!/usr/bin/env node
/**
 * One-time patch: writes productCode from step1 JSON files into existing MongoDB products.
 * Covers both furniture (etsy-products-data-step1.json) and handicraft (etsy-handicraft-data-step1.json).
 *
 * Usage:
 *   cd backend
 *   node scripts/patch-product-codes.js
 *   node scripts/patch-product-codes.js --dry-run
 */

const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const STEP1_FILES = [
    path.join(__dirname, 'etsy-products-data-step1.json'),
    path.join(__dirname, 'etsy-handicraft-data-step1.json'),
];
const DRY_RUN = process.argv.includes('--dry-run');

const productSchema = new mongoose.Schema({}, { strict: false, timestamps: true });

async function main() {
    const allProducts = STEP1_FILES.flatMap(file => {
        try {
            return require(file);
        } catch {
            console.warn(`  Skipping missing file: ${path.basename(file)}`);
            return [];
        }
    });

    console.log(`Loaded ${allProducts.length} products from step1 JSON files`);
    if (DRY_RUN) console.log('[DRY RUN] No writes will happen\n');

    await mongoose.connect(process.env.MONGODB_URI);
    const Product = mongoose.model('Product', productSchema);

    let updated = 0, skipped = 0, missing = 0;

    for (const prod of allProducts) {
        const { productCode, slug } = prod;
        if (!productCode || !slug) { skipped++; continue; }

        if (DRY_RUN) {
            const exists = await Product.findOne({ productId: slug }).lean();
            console.log(`  ${exists ? 'FOUND  ' : 'MISSING'} productId=${slug} → productCode=${productCode}`);
            if (exists) updated++; else missing++;
            continue;
        }

        const result = await Product.updateOne(
            { productId: slug },
            { $set: { productCode } }
        );

        if (result.matchedCount === 0) {
            console.log(`  NOT FOUND: productId=${slug}`);
            missing++;
        } else {
            console.log(`  ✓ ${slug} → ${productCode}`);
            updated++;
        }
    }

    console.log(`\nDone. Updated: ${updated}, Missing in DB: ${missing}, Skipped: ${skipped}`);
    await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
