/**
 * Database Migration: Rename priceINR → priceUSD
 * 
 * This script renames the 'priceINR' field to 'priceUSD' in all product documents.
 * Run this BEFORE deploying code that uses the new field name.
 * 
 * Usage:
 *   node scripts/migrate-price-field.js              # Dry run (shows what would change)
 *   node scripts/migrate-price-field.js --apply       # Actually rename fields
 */

const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const DRY_RUN = !process.argv.includes('--apply');

async function main() {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hs_global_export';
    await mongoose.connect(uri);
    console.log(`Connected to MongoDB: ${mongoose.connection.host}`);

    const db = mongoose.connection.db;
    const productsCol = db.collection('products');
    const ordersCol = db.collection('orders');

    // --- Products: rename priceINR → priceUSD ---
    const productsWithOldField = await productsCol.countDocuments({ priceINR: { $exists: true } });
    const productsAlreadyMigrated = await productsCol.countDocuments({ priceUSD: { $exists: true } });
    
    console.log('\n=== Products Collection ===');
    console.log(`  Documents with priceINR: ${productsWithOldField}`);
    console.log(`  Documents with priceUSD: ${productsAlreadyMigrated}`);

    if (productsWithOldField > 0) {
        if (DRY_RUN) {
            console.log(`  [DRY RUN] Would rename priceINR → priceUSD in ${productsWithOldField} documents`);
        } else {
            const result = await productsCol.updateMany(
                { priceINR: { $exists: true } },
                { $rename: { priceINR: 'priceUSD' } }
            );
            console.log(`  ✅ Renamed priceINR → priceUSD in ${result.modifiedCount} documents`);
        }
    } else {
        console.log('  ✅ No documents with priceINR found (already migrated or empty)');
    }

    // --- Orders: rename priceINR → priceUSD in items array ---
    const ordersWithOldField = await ordersCol.countDocuments({ 'items.priceINR': { $exists: true } });
    
    console.log('\n=== Orders Collection ===');
    console.log(`  Orders with items.priceINR: ${ordersWithOldField}`);

    if (ordersWithOldField > 0) {
        if (DRY_RUN) {
            console.log(`  [DRY RUN] Would rename items.$.priceINR → items.$.priceUSD in ${ordersWithOldField} orders`);
        } else {
            // For nested array fields, we need to iterate
            const cursor = ordersCol.find({ 'items.priceINR': { $exists: true } });
            let count = 0;
            for await (const order of cursor) {
                const updatedItems = order.items.map(item => {
                    if (item.priceINR !== undefined) {
                        const { priceINR, ...rest } = item;
                        return { ...rest, priceUSD: priceINR };
                    }
                    return item;
                });
                await ordersCol.updateOne(
                    { _id: order._id },
                    { $set: { items: updatedItems } }
                );
                count++;
            }
            console.log(`  ✅ Updated ${count} orders`);
        }
    } else {
        console.log('  ✅ No orders with items.priceINR found');
    }

    // --- Drop old index and create new one ---
    console.log('\n=== Indexes ===');
    try {
        const indexes = await productsCol.indexes();
        const hasOldIndex = indexes.some(idx => idx.key && idx.key.priceINR !== undefined);
        
        if (hasOldIndex) {
            if (DRY_RUN) {
                console.log('  [DRY RUN] Would drop priceINR index and create priceUSD index');
            } else {
                await productsCol.dropIndex({ priceINR: 1 });
                await productsCol.createIndex({ priceUSD: 1 });
                console.log('  ✅ Replaced priceINR index with priceUSD index');
            }
        } else {
            console.log('  ✅ No priceINR index found (already migrated or never existed)');
            // Ensure the new index exists
            if (!DRY_RUN) {
                await productsCol.createIndex({ priceUSD: 1 });
                console.log('  ✅ Ensured priceUSD index exists');
            }
        }
    } catch (err) {
        console.warn('  ⚠️ Index operation warning:', err.message);
    }

    // --- Currency collection: update base from INR to USD ---
    const currencyCol = db.collection('currencies');
    const inrDoc = await currencyCol.findOne({ base: 'INR' });
    
    console.log('\n=== Currency Collection ===');
    if (inrDoc) {
        if (DRY_RUN) {
            console.log('  [DRY RUN] Would delete old INR-based currency doc');
        } else {
            await currencyCol.deleteOne({ base: 'INR' });
            console.log('  ✅ Deleted old INR-based currency document (will be recreated on next API call with USD base)');
        }
    } else {
        console.log('  ✅ No INR-based currency document found');
    }

    console.log('\n=== Summary ===');
    if (DRY_RUN) {
        console.log('  This was a DRY RUN. No changes were made.');
        console.log('  Run with --apply to execute the migration.');
    } else {
        console.log('  ✅ Migration complete! All fields renamed from priceINR to priceUSD.');
    }

    await mongoose.connection.close();
    console.log('\nDatabase connection closed.');
}

main().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});
