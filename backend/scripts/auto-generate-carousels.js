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
 *   node backend/scripts/auto-generate-carousels.js           # write to DB
 *   node backend/scripts/auto-generate-carousels.js --dry-run # preview only
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

const HomePageConfig = require('../models/HomePageConfig');
const Product = require('../models/Product');
const Category = require('../models/Category');

const DRY_RUN = process.argv.includes('--dry-run');
const MIN_PRODUCTS = 5;    // only include subcategories with at least this many active products
const CAROUSEL_LIMIT = 12; // products shown per carousel

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
            // Pick the best 12 products across all categories for this subcategory.
            // Priority: featured first → most viewed → highest rated → newest.
            const picked = await Product.find({
                subcategory: sub,
                status: 'active',
                available: true,
            })
                .sort({ featured: -1, viewCount: -1, averageRating: -1, createdAt: -1 })
                .limit(CAROUSEL_LIMIT)
                .select('productId name viewCount averageRating featured')
                .lean();

            const manualProductIds = picked.map((p) => p.productId);

            console.log(`  ✅ [merged: ${cats.join('+')}] "${sub}" — ${count} total, picked ${manualProductIds.length}:`);
            picked.forEach((p) => {
                const flags = [
                    p.featured ? '⭐featured' : '',
                    p.viewCount ? `👁 ${p.viewCount}` : '',
                    p.averageRating ? `★${Number(p.averageRating).toFixed(1)}` : '',
                ].filter(Boolean).join(' ');
                console.log(`       • ${p.name}${flags ? '  [' + flags + ']' : ''}`);
            });

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

    // 8. Write ONLY productCarousels — everything else is left untouched

    let config = await HomePageConfig.findOne({ key: 'main' });

    if (!config) {
        console.log('\n⚠️  No "main" HomePageConfig found. Creating one from defaults...');
        config = new HomePageConfig(HomePageConfig.getDefaultConfig());
    }

    config.productCarousels = carousels;
    await config.save();

    console.log(`\n✅ Saved ${carousels.length} carousels to HomePageConfig.productCarousels`);
    console.log('ℹ️  newArrivals (HS Global Highlights) was NOT modified.\n');

    await mongoose.disconnect();
    console.log('✅ Database connection closed.');
}

run().catch((err) => {
    console.error('\n❌ Fatal error:', err.message || err);
    process.exit(1);
});
