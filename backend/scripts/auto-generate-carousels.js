/**
 * auto-generate-carousels.js
 *
 * Discovers every subcategory (from live products + custom Category docs) and
 * writes one product carousel per subcategory into HomePageConfig.productCarousels.
 *
 * Subcategories that share the same name across multiple categories (e.g.
 * "Coffee Table" exists in both furniture and handicraft) are MERGED into a
 * single carousel that queries across all categories.
 *
 * What this script intentionally does NOT touch:
 *   - newArrivals  (HS Global Highlights)
 *   - personalizedCollection, spotlight, collections, videoCarousel,
 *     featuredBanner, journal, promise
 *
 * Usage:
 *   node backend/scripts/auto-generate-carousels.js                        # local DB only
 *   node backend/scripts/auto-generate-carousels.js --also-live            # local + live DB
 *   node backend/scripts/auto-generate-carousels.js --dry-run              # preview, no writes
 *
 * Set LIVE_MONGODB_URI in backend/.env for --also-live to work.
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

const HomePageConfig = require('../models/HomePageConfig');
const Product = require('../models/Product');
const Category = require('../models/Category');

const DRY_RUN = process.argv.includes('--dry-run');
const ALSO_LIVE = process.argv.includes('--also-live');
const MIN_PRODUCTS = 5;    // only include subcategories with at least this many active products
const CAROUSEL_LIMIT = 12; // products shown per carousel

// ---------------------------------------------------------------------------
// Hardcoded picks for merged (cross-category) carousels.
// Edit this object to change which products appear in each combined carousel.
// Key = subcategory name (lowercase), Value = ordered productId array.
// ---------------------------------------------------------------------------
const HARDCODED_PICKS = {
    'coffee table': [
        'modern-marble-wave-coffee-table-sculptural-center-table',
        'wooden-coffee-table-brass-inlay-rustic-center-table',
        'brass-inlay-wooden-coffee-table-vintage-accent-table',
        'floral-marble-coffee-table-luxury-stone-center-table',
        'modern-glass-coffee-table-sculptural-wood-base',
        'white-marble-coffee-table-round-stone-ball-base-table',
        'sculptural-travertine-coffee-table-modern-wave-stone-table',
        'travertine-coffee-table-modern-sculptural-stone-table',
        'travertine-coffee-table-organic-stone-living-room-table',
        'modern-marble-glass-coffee-table-sculptural-living-room-table',
        'marble-nesting-coffee-tables-modern-stone-table-set',
        'red-marble-coffee-table-modern-round-stone-center-table',
    ],
    'console table': [
        'black-marble-console-table-modern-entryway-table',
        'red-travertine-console-table-modern-stone-entryway-table',
        'brass-inlay-console-table-wooden-entryway-desk-4-drawer',
        'elephant-brass-inlay-wooden-sideboard-cabinet-large-storage',
        'brass-inlay-console-table-wooden-entryway-table-3-drawer',
        'travertine-console-table-minimalist-stone-entryway-table',
        'travertine-console-table-fluted-stone-entryway-table',
        'scalloped-marble-console-table-modern-stone-entryway-table',
        'modern-marble-console-table-black-stone-entryway-table',
        'black-marble-console-table-luxury-entryway-furniture',
        'modern-marble-console-table-minimal-entryway-furniture',
        'burgundy-marble-console-table-sculptural-entryway-decor',
    ],
    'dining table': [
        'modern-marble-dining-table-white-stone-with-black-veining-luxury-pedaaaestal-base',
        'large-wooden-dining-table-set-brass-inlay-6-chairs',
        'round-wooden-dining-table-set-brass-inlay-4-chairs',
        'travertine-dining-table-oval-stone-pedestal-table',
        'round-travertine-dining-table-modern-stone-pedestal-table',
        'modern-marble-dining-table-luxury-stone-dining-table',
        'pink-marble-dining-table-modern-oval-stone-table',
        'oval-marble-dining-table-luxury-stone-dining-table',
        'travertine-oval-coffee-table-for-living-room-dining-fluted-base-table-japandi-table-wooden-low-table-minimalist-furniture',
        'natural-travertine-dining-table-sculptural-fluted-pedestal-base-modern-stone-furniture-handmade-natural-stone-table',
        'round-travertine-dining-table-sculptural-stone-base-organic-modern-furniture-handmade-natural-stone-table',
    ],
    'side table': [
        'green-marble-side-table-fluted-stone-accent-table',
        'round-wooden-coffee-table-brass-inlay-accent-table',
        'brass-inlay-wooden-side-table-vintage-accent-nightstand',
        'brass-inlay-wooden-bedside-table-3-drawer-nightstand',
        'brass-inlay-5-drawer-bedside-chest-wooden-storage-table',
        'brass-inlay-curved-chest-of-drawers-vintage-accent-table',
        'brass-embossed-bedside-cabinet-vintage-storage-table',
        'vintage-brass-inlay-wooden-chest-of-drawers-table',
        'marble-brass-side-table-modern-accent-end-table',
        'clover-marble-side-table-luxury-stone-accent-table',
        'red-marble-side-table-modern-pedestal-accent-table',
        'red-marble-side-table-modern-stone-accent-table',
    ],
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toTitleCase(str) {
    return str
        .trim()
        .split(/[\s\-_]+/)
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

function buildCarouselTitle(subcategory) {
    return toTitleCase(subcategory);
}

// For merged (cross-category) carousels the link has no cat filter.
// For single-category carousels we include the cat param.
function buildViewAllLink(category, subcategory) {
    if (!category) {
        return `/products?sub=${encodeURIComponent(subcategory)}`;
    }
    return `/products?cat=${encodeURIComponent(category)}&sub=${encodeURIComponent(subcategory)}`;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// DB write helper — works with any mongoose connection
// ---------------------------------------------------------------------------

async function writeCarouselsToDb(conn, carousels, label) {
    const HPC = conn.model('HomePageConfig', HomePageConfig.schema);
    let config = await HPC.findOne({ key: 'main' });
    if (!config) {
        console.log(`\n⚠️  [${label}] No "main" HomePageConfig found. Creating from defaults...`);
        config = new HPC(HomePageConfig.getDefaultConfig ? HomePageConfig.getDefaultConfig() : { key: 'main' });
    }
    config.productCarousels = carousels;
    await config.save();
    console.log(`\n✅ [${label}] Saved ${carousels.length} carousels to HomePageConfig.productCarousels`);
    console.log(`ℹ️  [${label}] newArrivals (HS Global Highlights) was NOT modified.`);
}

async function run() {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hs_global_export';

    console.log(DRY_RUN ? '\n🔍 DRY RUN — no changes will be saved\n' : '\n🚀 Running auto-generate-carousels\n');

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to database');

    // 1. Discover all active categories from products
    const allCategories = await Product.distinct('category', { status: 'active', available: true });
    console.log(`\n📦 Categories found in products: ${allCategories.join(', ') || '(none)'}`);

    // 2. Collect subcategories per category from product documents
    // subMap: { category -> Set<subcategory> }
    const subMap = {};

    for (const cat of allCategories) {
        const subs = await Product.distinct('subcategory', {
            category: cat,
            status: 'active',
            available: true,
        });
        subMap[cat] = new Set(subs.map((s) => String(s || '').trim()).filter(Boolean));
        console.log(`  📂 ${cat}: ${subMap[cat].size} subcategories → [${[...subMap[cat]].join(', ')}]`);
    }

    // 3. Merge custom subcategories from Category collection
    const customCats = await Category.getAllCategoriesWithCustom();
    for (const [catId, customSubs] of Object.entries(customCats || {})) {
        if (!subMap[catId]) {
            subMap[catId] = new Set();
        }
        for (const sub of customSubs || []) {
            const name = String(sub?.name || '').trim();
            if (name) subMap[catId].add(name);
        }
    }

    // 4. Build an inverted index: subcategory name → [categories that have it]
    // { 'Coffee Table' -> ['furniture', 'handicraft'], 'Bowl' -> ['handicraft'] }
    const subToCategories = {};
    for (const [cat, subs] of Object.entries(subMap)) {
        for (const sub of subs) {
            if (!subToCategories[sub]) subToCategories[sub] = [];
            subToCategories[sub].push(cat);
        }
    }

    // 5. Build carousels — one per unique subcategory name
    const carousels = [];
    const skipped = [];

    console.log(`\n🔎 Checking product counts (min ${MIN_PRODUCTS} required):`);

    const uniqueSubs = Object.keys(subToCategories).sort((a, b) => a.localeCompare(b));

    for (const sub of uniqueSubs) {
        const cats = subToCategories[sub];
        const isShared = cats.length > 1;

        // Count products: across all matching categories if shared, else just the one category
        const count = await Product.countDocuments({
            ...(isShared ? {} : { category: cats[0] }),
            subcategory: sub,
            status: 'active',
            available: true,
        });

        if (count < MIN_PRODUCTS) {
            const label = isShared ? `[merged: ${cats.join('+')}]` : `[${cats[0]}]`;
            console.log(`  ⏭  ${label} "${sub}" — ${count} product(s), skipped`);
            skipped.push({ cats, sub, count });
            continue;
        }

        if (isShared) {
            const manualProductIds = HARDCODED_PICKS[sub.toLowerCase()] || [];
            console.log(`  ✅ [merged: ${cats.join('+')}] "${sub}" — ${count} total, ${manualProductIds.length} hardcoded picks`);

            carousels.push({
                title: buildCarouselTitle(sub),
                viewAllLink: buildViewAllLink('', sub),
                enabled: true,
                sourceType: 'manual',
                manualProductIds,
                sourceCategory: '',
                sourceSubcategory: sub,
                sourceTag: '',
                limit: CAROUSEL_LIMIT,
                sortBy: 'createdAt',
                sortOrder: 'desc',
            });
        } else {
            const cat = cats[0];
            console.log(`  ✅ [${cat}] "${sub}" — ${count} product(s), included`);
            carousels.push({
                title: buildCarouselTitle(sub),
                viewAllLink: buildViewAllLink(cat, sub),
                enabled: true,
                sourceType: 'category',
                manualProductIds: [],
                sourceCategory: cat,
                sourceSubcategory: sub,
                sourceTag: '',
                limit: CAROUSEL_LIMIT,
                sortBy: 'createdAt',
                sortOrder: 'desc',
            });
        }
    }

    console.log(`\n🎠 Total carousels: ${carousels.length} included, ${skipped.length} skipped (< ${MIN_PRODUCTS} products)`);

    if (carousels.length === 0) {
        console.warn('⚠️  No subcategories found — nothing to write. Check that products are active and have subcategory values.');
        await mongoose.disconnect();
        return;
    }

    // 7. Preview
    console.log('\nCarousel list:');
    carousels.forEach((c, i) => {
        const src = c.sourceCategory ? `[${c.sourceCategory}]` : '[all categories]';
        console.log(`  ${String(i + 1).padStart(2, ' ')}. ${src} "${c.title}" → ${c.sourceSubcategory}`);
    });

    if (DRY_RUN) {
        console.log('\n🔍 Dry run complete — no changes written.\n');
        await mongoose.disconnect();
        return;
    }

    // 8. Write to local DB
    await writeCarouselsToDb(mongoose.connection, carousels, 'local');

    // 9. Optionally write the same picks to the live DB
    if (ALSO_LIVE) {
        const liveUri = process.env.LIVE_MONGODB_URI;
        if (!liveUri) {
            console.error('\n❌ --also-live flag set but LIVE_MONGODB_URI is not defined in .env');
            process.exit(1);
        }
        console.log('\n🌐 Connecting to live database...');
        const liveConn = await mongoose.createConnection(liveUri).asPromise();
        console.log('✅ Connected to live database');
        await writeCarouselsToDb(liveConn, carousels, 'live');
        await liveConn.close();
        console.log('✅ Live database connection closed.');
    }

    await mongoose.disconnect();
    console.log('✅ Local database connection closed.');
}

run().catch((err) => {
    console.error('\n❌ Fatal error:', err.message || err);
    process.exit(1);
});
