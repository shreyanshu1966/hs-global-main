#!/usr/bin/env node
/**
 * One-time migration: rename category 'handcrafted' → 'wooden-furniture'
 *
 * Run from the backend directory:
 *   node scripts/rename-handcrafted-to-wooden-furniture.js
 *
 * Add --dry-run to preview changes without writing.
 *
 * IMPORTANT: deploy the code changes first (Product enum now allows
 * 'wooden-furniture'), then run this script so product docs match the enum.
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const OLD = 'handcrafted';
const NEW = 'wooden-furniture';
const NEW_NAME = 'Wooden Furniture';
const DRY_RUN = process.argv.includes('--dry-run');

async function main() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    if (DRY_RUN) console.log('[DRY RUN] No changes will be written.\n');

    const db = mongoose.connection;

    // --- 1. Products ---
    const productCount = await db.collection('products').countDocuments({ category: OLD });
    console.log(`Products with category='${OLD}': ${productCount}`);
    if (!DRY_RUN) {
        const r = await db.collection('products')
            .updateMany({ category: OLD }, { $set: { category: NEW } });
        console.log(`Products updated: ${r.modifiedCount}`);
    }

    // --- 2. Category documents ---
    const catCount = await db.collection('categories').countDocuments({ categoryId: OLD });
    console.log(`Category documents with categoryId='${OLD}': ${catCount}`);
    if (!DRY_RUN) {
        const r = await db.collection('categories')
            .updateMany({ categoryId: OLD }, { $set: { categoryId: NEW, categoryName: NEW_NAME } });
        console.log(`Categories updated: ${r.modifiedCount}`);
    }

    // --- 3. Navbar configs (keyed by categoryId) ---
    const navCount = await db.collection('navbarconfigs').countDocuments({ categoryId: OLD });
    console.log(`NavbarConfig documents with categoryId='${OLD}': ${navCount}`);
    if (!DRY_RUN && navCount > 0) {
        await db.collection('navbarconfigs')
            .updateMany({ categoryId: OLD }, { $set: { categoryId: NEW, categoryName: NEW_NAME } });
        console.log('NavbarConfig docs updated.');
    }

    // --- 4. HomePageConfig carousels ---
    const configCount = await db.collection('homepageconfigs')
        .countDocuments({ 'productCarousels.sourceCategory': OLD });
    console.log(`HomePageConfig docs with carousel sourceCategory='${OLD}': ${configCount}`);
    if (!DRY_RUN && configCount > 0) {
        await db.collection('homepageconfigs').updateMany(
            { 'productCarousels.sourceCategory': OLD },
            { $set: { 'productCarousels.$[el].sourceCategory': NEW } },
            { arrayFilters: [{ 'el.sourceCategory': OLD }] }
        );
        await db.collection('homepageconfigs').updateMany(
            { 'productCarousels.viewAllLink': { $regex: `cat=${OLD}` } },
            { $set: { 'productCarousels.$[el].viewAllLink': `/products?cat=${NEW}` } },
            { arrayFilters: [{ 'el.viewAllLink': { $regex: `cat=${OLD}` } }] }
        );
        console.log('HomePageConfig carousels updated.');
    }

    // --- 5. Insert 301 redirects for the old category URLs ---
    const redirects = [
        { from: `/products/${OLD}`, to: `/products/${NEW}` },
    ];
    for (const sub of ['coffee-table', 'console-table', 'dining-table', 'side-table', 'sofa']) {
        redirects.push({ from: `/products/${OLD}/${sub}`, to: `/products/${NEW}/${sub}` });
    }
    if (!DRY_RUN) {
        for (const rd of redirects) {
            await db.collection('redirects').updateOne(
                { from: rd.from },
                { $set: { from: rd.from, to: rd.to, code: 301 } },
                { upsert: true }
            );
        }
        console.log(`Upserted ${redirects.length} redirect(s).`);
    } else {
        console.log(`Would upsert ${redirects.length} redirect(s):`, redirects.map(r => r.from).join(', '));
    }

    console.log(DRY_RUN ? '\nDry run complete. Rerun without --dry-run to apply.' : '\nMigration complete.');
    await mongoose.disconnect();
}

main().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});
