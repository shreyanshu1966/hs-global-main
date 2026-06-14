#!/usr/bin/env node
/**
 * One-time migration: rename category 'handicraft' → 'handcrafted'
 *
 * Run from the backend directory:
 *   node scripts/rename-handicraft-to-handcrafted.js
 *
 * Add --dry-run to preview changes without writing.
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const DRY_RUN = process.argv.includes('--dry-run');

async function main() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    if (DRY_RUN) console.log('[DRY RUN] No changes will be written.\n');

    // --- 1. Count affected products ---
    const productCount = await mongoose.connection.collection('products')
        .countDocuments({ category: 'handicraft' });
    console.log(`Products with category='handicraft': ${productCount}`);

    // --- 2. Update Product documents ---
    if (!DRY_RUN) {
        const productResult = await mongoose.connection.collection('products')
            .updateMany({ category: 'handicraft' }, { $set: { category: 'handcrafted' } });
        console.log(`Products updated: ${productResult.modifiedCount}`);
    }

    // --- 3. Count affected category docs ---
    const catCount = await mongoose.connection.collection('categories')
        .countDocuments({ categoryId: 'handicraft' });
    console.log(`Category documents with categoryId='handicraft': ${catCount}`);

    // --- 4. Update Category document ---
    if (!DRY_RUN) {
        const catResult = await mongoose.connection.collection('categories')
            .updateMany(
                { categoryId: 'handicraft' },
                { $set: { categoryId: 'handcrafted', categoryName: 'Handcrafted' } }
            );
        console.log(`Categories updated: ${catResult.modifiedCount}`);
    }

    // --- 5. Update any carousel/config docs that store sourceCategory: 'handicraft' ---
    const configCount = await mongoose.connection.collection('homepageconfigs')
        .countDocuments({ 'productCarousels.sourceCategory': 'handicraft' });
    console.log(`HomePageConfig docs with carousel sourceCategory='handicraft': ${configCount}`);

    if (!DRY_RUN && configCount > 0) {
        // Update each carousel item inside the array
        await mongoose.connection.collection('homepageconfigs').updateMany(
            { 'productCarousels.sourceCategory': 'handicraft' },
            { $set: { 'productCarousels.$[el].sourceCategory': 'handcrafted' } },
            { arrayFilters: [{ 'el.sourceCategory': 'handicraft' }] }
        );
        // Also update viewAllLink urls
        await mongoose.connection.collection('homepageconfigs').updateMany(
            { 'productCarousels.viewAllLink': { $regex: 'cat=handicraft' } },
            { $set: { 'productCarousels.$[el].viewAllLink': '/products?cat=handcrafted' } },
            { arrayFilters: [{ 'el.viewAllLink': { $regex: 'cat=handicraft' } }] }
        );
        console.log('HomePageConfig carousels updated.');
    }

    console.log(DRY_RUN ? '\nDry run complete. Rerun without --dry-run to apply.' : '\nMigration complete.');
    await mongoose.disconnect();
}

main().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});
