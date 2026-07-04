// One-time migration: flip canonical product price field from priceUSD (USD)
// to priceINR (INR). Run once, after backing up the products collection.
//
// Converts, for every product document:
//   priceUSD                              -> priceINR
//   variants[].priceUSD                   -> variants[].priceINR
//   variants[].compareAtPriceUSD          -> variants[].compareAtPriceINR
//   regionalPricing.*.adjustmentValue     -> multiplied by rate, only when
//                                            adjustmentType === 'fixed'
//                                            (percentage entries are untouched)
//
// Uses a single live INR rate fetched once at the start of the run so every
// document is converted consistently.
require('dotenv').config();
const path = require('path');
const mongoose = require('mongoose');

async function main() {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;

    const currencyDoc = await db.collection('currencies').findOne({ base: 'USD' });
    const rate = currencyDoc?.rates?.INR;
    if (!rate) {
        throw new Error('Could not find a live INR rate in the currencies collection — aborting migration.');
    }
    console.log(`Using INR rate: 1 USD = ₹${rate}`);

    const products = await db.collection('products').find({}).toArray();
    console.log(`Found ${products.length} products to migrate.`);

    let updated = 0;
    for (const product of products) {
        const set = {};
        const unset = {};

        if (typeof product.priceUSD === 'number') {
            set.priceINR = Math.round(product.priceUSD * rate * 100) / 100;
            unset.priceUSD = '';
        }

        if (Array.isArray(product.variants) && product.variants.length > 0) {
            set.variants = product.variants.map((v) => {
                const nv = { ...v };
                if (typeof nv.priceUSD === 'number') {
                    nv.priceINR = Math.round(nv.priceUSD * rate * 100) / 100;
                }
                if (typeof nv.compareAtPriceUSD === 'number') {
                    nv.compareAtPriceINR = Math.round(nv.compareAtPriceUSD * rate * 100) / 100;
                }
                delete nv.priceUSD;
                delete nv.compareAtPriceUSD;
                return nv;
            });
        }

        if (product.regionalPricing) {
            const rp = { ...product.regionalPricing };
            for (const region of Object.keys(rp)) {
                const entry = rp[region];
                if (entry && entry.adjustmentType === 'fixed' && typeof entry.adjustmentValue === 'number') {
                    rp[region] = {
                        ...entry,
                        adjustmentValue: Math.round(entry.adjustmentValue * rate * 100) / 100,
                    };
                }
            }
            set.regionalPricing = rp;
        }

        if (Object.keys(set).length === 0) continue;

        const update = { $set: set };
        if (Object.keys(unset).length > 0) update.$unset = unset;

        await db.collection('products').updateOne({ _id: product._id }, update);
        updated++;
    }

    console.log(`Migrated ${updated} products.`);
    await mongoose.disconnect();
}

main().catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
});
