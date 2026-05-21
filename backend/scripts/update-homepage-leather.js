#!/usr/bin/env node
/**
 * ============================================================
 * Home Page Config — Add Leather Category
 * ============================================================
 *
 * USAGE:
 *   cd backend
 *   node scripts/update-homepage-leather.js
 *   node scripts/update-homepage-leather.js --dry-run
 *
 * What it does (idempotent — safe to run multiple times):
 *   1. Reads the live homepage config from MongoDB
 *   2. Adds a leather product carousel (if not already present)
 *   3. Adds a leather spotlight card   (if not already present)
 *   4. Adds a leather collections card (if not already present)
 *   5. Uses the first leather product's image for cards,
 *      falls back to a placeholder if no products exist yet
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');

const log = {
    info: (...a) => console.log('ℹ️ ', ...a),
    ok: (...a) => console.log('✅', ...a),
    warn: (...a) => console.log('⚠️ ', ...a),
    skip: (...a) => console.log('⏭️ ', ...a),
    dry: (...a) => console.log('[DRY-RUN]', ...a),
};

// ─────────────────────────────────────────────────────────────
// Lean schemas — no strict validation, just read/write the doc
// ─────────────────────────────────────────────────────────────
const configSchema = new mongoose.Schema({}, { strict: false, timestamps: true });
const productSchema = new mongoose.Schema({}, { strict: false });

async function main() {
    if (DRY_RUN) log.dry('Running in DRY-RUN mode — no DB writes.');

    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hs_global_export';
    await mongoose.connect(uri);
    log.ok(`MongoDB connected: ${mongoose.connection.host}`);

    const Config = mongoose.model('HomePageConfig', configSchema);
    const Product = mongoose.model('Product', productSchema);

    // ── Read current live config ─────────────────────────────
    let config = await Config.findOne({ key: 'main' }).lean();
    if (!config) {
        log.warn('No homepage config found (key: main). Creating from defaults first.');
        if (!DRY_RUN) {
            config = await Config.create({ key: 'main' });
            config = await Config.findOne({ key: 'main' }).lean();
        } else {
            config = { productCarousels: [], spotlight: { cards: [] }, collections: { cards: [] } };
        }
    }
    log.info(`Loaded config — productCarousels: ${config.productCarousels?.length ?? 0}, spotlight cards: ${config.spotlight?.cards?.length ?? 0}`);

    // ── Get a leather product image for the cards ────────────
    const leatherProduct = await Product.findOne({ category: 'leather', available: true }).sort({ createdAt: -1 }).lean();
    const leatherImage = leatherProduct?.image || leatherProduct?.images?.[0] || '/leather-hero.webp';
    if (leatherProduct) {
        log.ok(`Found leather product image: ${leatherImage}`);
    } else {
        log.warn('No leather products in DB yet — using placeholder image /leather-hero.webp');
        log.warn('Re-run this script after running the leather migration to get a real product image.');
    }

    // ── 1. Leather product carousel ──────────────────────────
    const carousels = Array.isArray(config.productCarousels) ? config.productCarousels : [];
    const leatherCarouselExists = carousels.some(c => c.sourceCategory === 'leather');

    if (leatherCarouselExists) {
        log.skip('Leather carousel already exists in productCarousels — skipping.');
    } else {
        const leatherCarousel = {
            title: 'Luxury Leather Furniture',
            viewAllLink: '/products?category=leather',
            enabled: true,
            sourceType: 'category',
            manualProductIds: [],
            sourceCategory: 'leather',
            sourceSubcategory: '',
            sourceTag: '',
            limit: 10,
            sortBy: 'createdAt',
            sortOrder: 'desc',
        };

        if (!DRY_RUN) {
            await Config.updateOne(
                { key: 'main' },
                { $push: { productCarousels: leatherCarousel } }
            );
            log.ok('Added leather product carousel to productCarousels.');
        } else {
            log.dry('Would add leather carousel:', leatherCarousel.title);
        }
    }

    // ── 2. Leather spotlight card ────────────────────────────
    const spotlightCards = Array.isArray(config.spotlight?.cards) ? config.spotlight.cards : [];
    const leatherSpotlightExists = spotlightCards.some(c => c.link?.includes('category=leather') || c.title?.toLowerCase().includes('leather'));

    if (leatherSpotlightExists) {
        log.skip('Leather spotlight card already exists — skipping.');
    } else {
        const leatherSpotlightCard = {
            title: 'Luxury Leather Collections',
            subtitle: 'Browse Leather Furniture',
            image: leatherImage,
            link: '/products?category=leather',
        };

        if (!DRY_RUN) {
            await Config.updateOne(
                { key: 'main' },
                { $push: { 'spotlight.cards': leatherSpotlightCard } }
            );
            log.ok(`Added leather spotlight card (image: ${leatherImage})`);
        } else {
            log.dry('Would add spotlight card:', leatherSpotlightCard.title, '→', leatherSpotlightCard.image);
        }
    }

    // ── 3. Leather collections card ──────────────────────────
    const collectionCards = Array.isArray(config.collections?.cards) ? config.collections.cards : [];
    const leatherCollectionExists = collectionCards.some(c => c.link?.includes('category=leather') || c.title?.toLowerCase().includes('leather'));

    if (leatherCollectionExists) {
        log.skip('Leather collections card already exists — skipping.');
    } else {
        const leatherCollectionCard = {
            title: 'Luxury Leather Furniture',
            subtitle: '',
            image: leatherImage,
            link: '/products?category=leather',
        };

        if (!DRY_RUN) {
            await Config.updateOne(
                { key: 'main' },
                { $push: { 'collections.cards': leatherCollectionCard } }
            );
            log.ok(`Added leather collections card (image: ${leatherImage})`);
        } else {
            log.dry('Would add collections card:', leatherCollectionCard.title, '→', leatherCollectionCard.image);
        }
    }

    // ── Final state summary ──────────────────────────────────
    if (!DRY_RUN) {
        const updated = await Config.findOne({ key: 'main' }).lean();
        log.ok(`Done. productCarousels: ${updated.productCarousels?.length}, spotlight cards: ${updated.spotlight?.cards?.length}, collection cards: ${updated.collections?.cards?.length}`);
    }

    await mongoose.connection.close();
    log.ok('Done.');
}

main().catch(err => {
    console.error('❌ Fatal:', err);
    process.exit(1);
});
