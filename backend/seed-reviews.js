const mongoose = require('mongoose');
const path = require('path');
const Product = require('./models/Product');
const Review = require('./models/Review');
require('dotenv').config();
// Optional review tuning file (does NOT override anything already set in the real .env)
require('dotenv').config({ path: path.join(__dirname, 'review-config.env'), override: false });

// ---------------------------------------------------------------------------
// CLI / config
// ---------------------------------------------------------------------------
const DRY_RUN = process.argv.includes('--dry-run') || process.env.DRY_RUN === 'true';
// Recompute product ratings from the reviews already in the DB, without
// regenerating reviews. Ratings are ALWAYS derived from reviews, so this is the
// same code path the full seed uses at the end — just skipping the seeding step.
const RATINGS_ONLY = process.argv.includes('--ratings-only');

const num = (val, fallback) => {
    const n = Number(val);
    return Number.isFinite(n) ? n : fallback;
};

// Defaults preserve the historical behaviour of this script. Override via
// review-config.env or environment variables without touching the code.
const CONFIG = {
    reviewsMin: num(process.env.REVIEWS_PER_PRODUCT_MIN, 100),
    reviewsMax: num(process.env.REVIEWS_PER_PRODUCT_MAX, 150),
    // Probability (%) of a 5-star review; the remainder become 4-star.
    // ~85% 5-star + 15% 4-star averages to ~4.85.
    fiveStarPercent: num(process.env.RATING_5_STAR_PERCENT, 85),
    verifiedPercent: num(process.env.VERIFIED_REVIEW_PERCENT, 90),
    approvedPercent: num(process.env.APPROVED_REVIEW_PERCENT, 95),
    oldestReviewDays: num(process.env.OLDEST_REVIEW_DAYS, 365),
    newestReviewDays: num(process.env.NEWEST_REVIEW_DAYS, 7),
    clearExisting: process.env.CLEAR_EXISTING_REVIEWS !== 'false',
};

// Connect to database (mirrors backend/config/db.js so seeding and the live
// server always target the same database, even on a remote/Atlas URI).
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(
            process.env.MONGODB_URI || 'mongodb://localhost:27017/hs_global_export',
            { serverSelectionTimeoutMS: 8000, dbName: 'hs_global_export' }
        );
        console.log(`MongoDB Connected: ${conn.connection.host} (db: ${conn.connection.name})`);
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1);
    }
};

// Realistic reviewer names and regions
const reviewerProfiles = [
    // USA
    { name: 'Sarah Johnson', region: 'USA', buyerType: 'interior_designer' },
    { name: 'Michael Davis', region: 'USA', buyerType: 'homeowner' },
    { name: 'Jennifer Smith', region: 'USA', buyerType: 'architect' },
    { name: 'David Wilson', region: 'USA', buyerType: 'contractor' },
    { name: 'Robert Taylor', region: 'USA', buyerType: 'developer' },
    { name: 'Jessica Anderson', region: 'USA', buyerType: 'hotel_owner' },
    { name: 'William Thomas', region: 'USA', buyerType: 'homeowner' },
    { name: 'Ashley Jackson', region: 'USA', buyerType: 'interior_designer' },
    { name: 'Matthew White', region: 'USA', buyerType: 'contractor' },
    { name: 'Elizabeth Harris', region: 'USA', buyerType: 'architect' },
    // UK
    { name: 'Emma Thompson', region: 'UK', buyerType: 'architect' },
    { name: 'James Wilson', region: 'UK', buyerType: 'contractor' },
    { name: 'Oliver Hughes', region: 'UK', buyerType: 'homeowner' },
    { name: 'Charlotte Green', region: 'UK', buyerType: 'interior_designer' },
    { name: 'George Wood', region: 'UK', buyerType: 'developer' },
    { name: 'Sophie Martin', region: 'UK', buyerType: 'hotel_owner' },
    // Europe
    { name: 'Isabella Rossi', region: 'Italy', buyerType: 'hotel_owner' },
    { name: 'Marco Bianchi', region: 'Italy', buyerType: 'architect' },
    { name: 'Ana García', region: 'Spain', buyerType: 'homeowner' },
    { name: 'Carlos Martinez', region: 'Spain', buyerType: 'contractor' },
    { name: 'François Dubois', region: 'France', buyerType: 'hotel_owner' },
    { name: 'Marie Laurent', region: 'France', buyerType: 'interior_designer' },
    { name: 'Hans Mueller', region: 'Germany', buyerType: 'developer' },
    { name: 'Julia Weber', region: 'Germany', buyerType: 'architect' },
    { name: 'Lukas Wagner', region: 'Germany', buyerType: 'contractor' },
    { name: 'Sergei Petrov', region: 'Russia', buyerType: 'architect' },
    { name: 'Elena Ivanova', region: 'Russia', buyerType: 'interior_designer' },
    { name: 'Kevin O\'Connor', region: 'Ireland', buyerType: 'contractor' },
    { name: 'Alexander Popov', region: 'Bulgaria', buyerType: 'developer' },
    // Asia & Middle East
    { name: 'Mohammed Al-Rahman', region: 'UAE', buyerType: 'developer' },
    { name: 'Fatima Al-Sayed', region: 'UAE', buyerType: 'interior_designer' },
    { name: 'Chen Wei', region: 'Singapore', buyerType: 'homeowner' },
    { name: 'Li Jie', region: 'Singapore', buyerType: 'architect' },
    { name: 'Priya Sharma', region: 'India', buyerType: 'interior_designer' },
    { name: 'Rajesh Patel', region: 'India', buyerType: 'architect' },
    { name: 'Amit Kumar', region: 'India', buyerType: 'developer' },
    { name: 'Neha Gupta', region: 'India', buyerType: 'homeowner' },
    { name: 'David Kim', region: 'South Korea', buyerType: 'contractor' },
    { name: 'Ji-Yeon Park', region: 'South Korea', buyerType: 'interior_designer' },
    { name: 'Yuki Tanaka', region: 'Japan', buyerType: 'architect' },
    { name: 'Kenji Sato', region: 'Japan', buyerType: 'hotel_owner' },
    // Australia & Americas
    { name: 'Sophie Anderson', region: 'Australia', buyerType: 'interior_designer' },
    { name: 'Lisa Zhang', region: 'Australia', buyerType: 'architect' },
    { name: 'Jack Taylor', region: 'Australia', buyerType: 'developer' },
    { name: 'Marco Silva', region: 'Brazil', buyerType: 'contractor' },
    { name: 'Camila Santos', region: 'Brazil', buyerType: 'homeowner' },
    { name: 'Olivia Brown', region: 'Canada', buyerType: 'homeowner' },
    { name: 'Liam Tremblay', region: 'Canada', buyerType: 'developer' },
    { name: 'Linda Martinez', region: 'Mexico', buyerType: 'hotel_owner' },
    { name: 'Maria Gonzalez', region: 'Argentina', buyerType: 'interior_designer' },
    // Africa
    { name: 'Ahmed Hassan', region: 'Egypt', buyerType: 'developer' },
    { name: 'Aisha Okonkwo', region: 'Nigeria', buyerType: 'homeowner' },
    { name: 'Chidi Eze', region: 'Nigeria', buyerType: 'contractor' },
    { name: 'Johan Van Der Merwe', region: 'South Africa', buyerType: 'architect' }
];

// Dynamic review phrases
const reviewPhrases = {
    openers: [
        "Absolutely stunning piece!", "As an interior designer, I'm quite particular.",
        "Outstanding quality and design!", "Love this {product}!",
        "This {product} is absolutely gorgeous!", "Couldn't be happier with this purchase!",
        "Exceptional architectural element!", "High-quality {material} with excellent structural integrity.",
        "Perfect for our luxury project!", "Solid construction and beautiful finish!",
        "Great quality {material} and precise dimensions.", "Excellent build quality!",
        "Outstanding {product} for our development!", "Premium quality {product} for our project.",
        "Perfect addition to our space!", "Very impressed with the craftsmanship.",
        "Exactly what we were looking for.", "Beyond my expectations.",
        "Incredible attention to detail.", "A truly magnificent {product}.",
        "I was blown away by the quality.", "Such a beautiful {material} finish.",
        "This {product} is a game changer for our design.", "Exquisite {material} and superb finish.",
        "Fantastic experience from start to finish.", "The finest {product} I've purchased in years."
    ],
    mids: [
        "The {material} finish is exceptional and the craftsmanship is top-notch.",
        "The {material} has the most beautiful natural patterns.",
        "This {product} became the centerpiece of our space.",
        "The natural beauty of {material} adds such elegance.",
        "The {product} fits perfectly in our space.",
        "This {product} perfectly complements our modern design aesthetic.",
        "The {material} quality is superior and the dimensions are exact.",
        "The {material} texture and color are exactly what we needed.",
        "{material} quality is excellent and installation was straightforward.",
        "The finish work is professional grade.",
        "The {material} adds elegance and guests constantly compliment it.",
        "The {finish} finish is flawless and the natural patterns are stunning.",
        "Consistent thickness and perfect finish.",
        "The color consistency is remarkable.",
        "It elevates the entire room immediately.",
        "The {material} feels incredibly durable yet elegant.",
        "I've received so many compliments on this {product}.",
        "Installation went smoothly and the {finish} finish is holding up perfectly.",
        "Every single detail showcases premium craftsmanship.",
        "The {material} brings a unique character that you just can't find elsewhere."
    ],
    closers: [
        "My clients are thrilled.", "Will definitely order more pieces.",
        "Fast shipping to {region} and excellent packaging.",
        "Highly recommend!", "Worth every penny!",
        "Great communication from the seller.",
        "Professional service throughout.", "Reliable supplier with consistent quality.",
        "Will use HS Global for future projects.", "Client is very happy.",
        "Timely delivery to {region}.", "Reliable supplier for commercial projects.",
        "Professional packaging and delivery.", "Premium quality throughout.",
        "Cannot wait to install more of these.",
        "Will be purchasing again for my next project.",
        "Five stars all the way!",
        "Thanks for a wonderful transaction.",
        "Delivery to {region} was faster than expected.",
        "A truly worthwhile investment."
    ]
};

// Helpful vote patterns (more helpful votes for higher ratings)
const getHelpfulVotes = (rating) => {
    const baseVotes = Math.floor(Math.random() * 8);
    if (rating >= 5) return baseVotes + Math.floor(Math.random() * 15);
    if (rating >= 4) return baseVotes + Math.floor(Math.random() * 10);
    if (rating >= 3) return Math.floor(Math.random() * 5);
    return Math.floor(Math.random() * 3);
};

// Generate email from name and region
const generateEmail = (name, region) => {
    const firstName = name.split(' ')[0].toLowerCase();
    const lastName = name.split(' ')[1].toLowerCase();
    const domains = {
        USA: ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'],
        UK: ['gmail.com', 'outlook.com', 'btinternet.com', 'yahoo.co.uk'],
        Italy: ['gmail.com', 'libero.it', 'yahoo.it', 'outlook.com'],
        UAE: ['gmail.com', 'yahoo.com', 'outlook.com'],
        Singapore: ['gmail.com', 'yahoo.com.sg', 'outlook.com'],
        India: ['gmail.com', 'yahoo.com', 'outlook.com', 'rediffmail.com'],
        default: ['gmail.com', 'yahoo.com', 'outlook.com']
    };

    const domainList = domains[region] || domains.default;
    const domain = domainList[Math.floor(Math.random() * domainList.length)];

    const patterns = [
        `${firstName}.${lastName}`,
        `${firstName}${lastName}`,
        `${firstName}.${lastName}${Math.floor(Math.random() * 99)}`,
        `${firstName}${Math.floor(Math.random() * 999)}`
    ];

    const pattern = patterns[Math.floor(Math.random() * patterns.length)];
    return `${pattern}@${domain}`;
};

// Turn a slug/raw subcategory ("coffee-table", "Wash Basins") into readable text
const humanize = (value) => {
    if (!value || typeof value !== 'string') return '';
    return value
        .replace(/[-_]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
};

// First non-empty string from the candidates
const firstOf = (...vals) => {
    for (const v of vals) {
        if (typeof v === 'string' && v.trim()) return v.trim();
    }
    return null;
};

// Extract product specifications for template replacement.
// Works across the CURRENT product system: furniture, wooden-furniture,
// handcrafted (legacy), leather, semi-precious-stone — and any future
// category — by reading every spec shape the schema supports and falling
// back to the subcategory / product name.
const getProductSpecs = (product) => {
    const f = product.furnitureSpecs || {};
    const sl = product.slabSpecs || {};       // legacy slab products
    const st = product.stoneSpecs || {};      // semi-precious-stone
    const details = (product.productSpecifications && product.productSpecifications.details) || {};

    // Custom specs are an array of { key, label, value }; index by lowercased key
    const custom = {};
    (product.customSpecs || []).forEach(c => {
        if (c && c.key && typeof c.value === 'string' && c.value.trim()) {
            custom[c.key.toLowerCase()] = c.value.trim();
        }
    });

    const subLabel = humanize(product.subcategory);

    const material = firstOf(
        f.material, f.colorName,
        st.material,
        sl.material,
        details.material, details.wood_species, details.top_color,
        custom.material, custom.wood, custom.stone,
        subLabel
    ) || 'premium material';

    const finish = firstOf(
        f.surfaceFinish,
        st.surfaceFinish,
        sl.finish,
        custom.finish, custom.surface_finish,
        'polished'
    );

    const productLabel = firstOf(
        f.type,
        subLabel,
        humanize(product.name)
    ) || 'piece';

    const size = firstOf(
        f.size,
        st.maxSlabSize, st.minSlabSize,
        custom.size, custom.dimensions,
        'standard size'
    );

    const thickness = firstOf(st.thickness, sl.thickness, 'standard thickness');
    const origin = firstOf(sl.origin, product.manufacturing && product.manufacturing.countryOfOrigin, 'premium source');
    const application = firstOf(sl.application, st.usage, 'architectural use');

    return { material, product: productLabel, finish, size, thickness, origin, application };
};

// Replace template variables
const fillTemplate = (template, specs, reviewer) => {
    let filled = template;
    Object.keys(specs).forEach(key => {
        const regex = new RegExp(`\\{${key}\\}`, 'g');
        filled = filled.replace(regex, specs[key]);
    });
    filled = filled.replace(/\{region\}/g, reviewer.region);
    return filled;
};

// Generate a single review object for a product
const generateReviewForProduct = (product) => {
    const reviewer = reviewerProfiles[Math.floor(Math.random() * reviewerProfiles.length)];

    // Rating: CONFIG.fiveStarPercent% are 5-star, the rest 4-star.
    const actualRating = (Math.random() * 100) < CONFIG.fiveStarPercent ? 5 : 4;

    const specs = getProductSpecs(product);

    const openers = reviewPhrases.openers;
    const mids = reviewPhrases.mids;
    const closers = reviewPhrases.closers;

    const o = openers[Math.floor(Math.random() * openers.length)];
    let m = mids[Math.floor(Math.random() * mids.length)];
    if (Math.random() > 0.5) {
        const m2 = mids[Math.floor(Math.random() * mids.length)];
        if (m !== m2) m += " " + m2;
    }
    const c = closers[Math.floor(Math.random() * closers.length)];

    let comment = `${o} ${m} ${c}`;
    comment = fillTemplate(comment, specs, reviewer);

    const titleTemplates = [
        'Excellent Quality!', 'Outstanding!', 'Perfect Choice!', 'Highly Recommend!',
        'Premium Quality', 'Love It!', 'Exceeded Expectations!', 'Amazing Product!',
        'Superb Craftsmanship!', 'Great Value', 'Beautiful Addition', 'Very Satisfied',
        'Stunning Material', 'Five Stars', 'Incredible Finish', 'Top Notch',
        'Beautiful and Durable', 'Highly Professional', 'Best Purchase', 'Flawless'
    ];
    const title = titleTemplates[Math.floor(Math.random() * titleTemplates.length)];

    // Spread review dates across the configured window
    const maxAge = CONFIG.oldestReviewDays * 24 * 60 * 60 * 1000;
    const minAge = CONFIG.newestReviewDays * 24 * 60 * 60 * 1000;
    const reviewDate = new Date(Date.now() - minAge - Math.random() * Math.max(0, maxAge - minAge));

    return {
        productId: product.productId,
        userName: reviewer.name,
        userEmail: generateEmail(reviewer.name, reviewer.region),
        rating: actualRating,
        title,
        comment,
        verified: (Math.random() * 100) < CONFIG.verifiedPercent,
        helpful: getHelpfulVotes(actualRating),
        status: (Math.random() * 100) < CONFIG.approvedPercent ? 'approved' : 'pending',
        createdAt: reviewDate,
        updatedAt: reviewDate
    };
};

// Update rating statistics for all products after seeding
const updateAllProductRatings = async () => {
    console.log('📊 Calculating rating statistics for all products...');

    const products = await Product.find({ status: 'active' });
    let updatedCount = 0;

    for (const product of products) {
        try {
            const stats = await Review.getProductStats(product.productId);

            await Product.findOneAndUpdate(
                { productId: product.productId },
                {
                    averageRating: stats.averageRating,
                    totalReviews: stats.totalReviews
                }
            );

            if (stats.totalReviews > 0) {
                console.log(`   ✅ ${product.name}: ${stats.averageRating.toFixed(1)} ⭐ (${stats.totalReviews} reviews)`);
                updatedCount++;
            }
        } catch (error) {
            console.error(`   ❌ Error updating ${product.name}:`, error.message);
        }
    }

    console.log(`🎯 Updated rating stats for ${updatedCount} products with reviews`);
};

// Print the effective configuration
const printConfig = () => {
    console.log('⚙️  Configuration:');
    console.log(`   Reviews per product : ${CONFIG.reviewsMin}–${CONFIG.reviewsMax}`);
    console.log(`   Rating split        : ${CONFIG.fiveStarPercent}% 5-star / ${100 - CONFIG.fiveStarPercent}% 4-star`);
    console.log(`   Verified / Approved : ${CONFIG.verifiedPercent}% / ${CONFIG.approvedPercent}%`);
    console.log(`   Date window         : ${CONFIG.newestReviewDays}–${CONFIG.oldestReviewDays} days ago`);
    console.log(`   Clear existing      : ${CONFIG.clearExisting}`);
    console.log('');
};

// Main seeding function
const seedReviews = async () => {
    try {
        // Ratings-only mode: don't touch reviews, just resync each product's
        // averageRating/totalReviews from the approved reviews already stored.
        if (RATINGS_ONLY) {
            console.log('📊 Ratings-only mode — recomputing product ratings from existing reviews');
            console.log('======================================');
            await connectDB();
            await updateAllProductRatings();
            console.log('\n🎉 Product ratings resynced from existing reviews.');
            return;
        }

        console.log(DRY_RUN ? '🧪 Review seeding — DRY RUN (no writes)' : '🌱 Starting review seeding process...');
        console.log('======================================');
        printConfig();

        await connectDB();

        // Get active products that have stable product identifiers.
        // Pull every spec shape so getProductSpecs can build authentic text.
        const products = await Product.find({
            status: 'active',
            productId: { $exists: true, $ne: '' }
        }).select('productId name category subcategory furnitureSpecs slabSpecs stoneSpecs productSpecifications customSpecs manufacturing');
        console.log(`📦 Found ${products.length} products to generate reviews for`);

        if (products.length === 0) {
            console.log('❌ No products found. Please run product migration first.');
            return;
        }

        // Per-category breakdown so we can see coverage of the new product system
        const byCategory = {};
        products.forEach(p => { byCategory[p.category] = (byCategory[p.category] || 0) + 1; });
        console.log('🗂️  Products by category:');
        Object.entries(byCategory).forEach(([cat, n]) => console.log(`   ${cat}: ${n}`));
        console.log('');

        const existingReviewCount = await Review.countDocuments({});

        // Generate reviews in memory (same for dry run and real run)
        const allReviews = [];
        const sampleByCategory = {};
        for (const product of products) {
            const numberOfReviews = Math.floor(Math.random() * (CONFIG.reviewsMax - CONFIG.reviewsMin + 1)) + CONFIG.reviewsMin;
            for (let i = 0; i < numberOfReviews; i++) {
                const review = generateReviewForProduct(product);
                allReviews.push(review);
                // Capture one sample per category for dry-run preview
                if (DRY_RUN && !sampleByCategory[product.category]) {
                    sampleByCategory[product.category] = { product, review };
                }
            }
        }
        const totalReviewsGenerated = allReviews.length;

        // Projected rating distribution
        const dist = allReviews.reduce((acc, r) => { acc[r.rating] = (acc[r.rating] || 0) + 1; return acc; }, {});
        const verifiedCount = allReviews.filter(r => r.verified).length;
        const approvedCount = allReviews.filter(r => r.status === 'approved').length;

        if (DRY_RUN) {
            console.log('🔎 DRY RUN SUMMARY');
            console.log('==========================================');
            console.log(`Existing reviews in DB         : ${existingReviewCount}`);
            console.log(`Would DELETE                   : ${CONFIG.clearExisting ? existingReviewCount : 0}`);
            console.log(`Would INSERT                   : ${totalReviewsGenerated}`);
            console.log('Projected rating distribution  :');
            Object.keys(dist).sort((a, b) => b - a).forEach(k => {
                console.log(`   ${k} stars: ${dist[k]} reviews`);
            });
            console.log(`Verified (projected)           : ${verifiedCount}`);
            console.log(`Approved (projected)           : ${approvedCount}`);
            const avg = allReviews.reduce((s, r) => s + r.rating, 0) / (totalReviewsGenerated || 1);
            console.log(`Average rating (projected)     : ${avg.toFixed(2)} ⭐`);
            console.log('');
            console.log('📝 Sample generated reviews (one per category):');
            Object.entries(sampleByCategory).forEach(([cat, { product, review }]) => {
                console.log(`\n   ── ${cat} — ${product.name}`);
                console.log(`      ${review.rating}⭐  "${review.title}"  by ${review.userName}`);
                console.log(`      ${review.comment}`);
            });
            console.log('\n✅ Dry run complete. No data was written. Re-run without --dry-run to apply.');
            return;
        }

        // ---- Real run (writes) ----
        if (CONFIG.clearExisting) {
            console.log('🗑️ Clearing existing reviews...');
            const deleted = await Review.deleteMany({});
            console.log(`✅ Removed ${deleted.deletedCount} existing reviews`);
        }

        console.log(`💾 Inserting ${totalReviewsGenerated} reviews into database...`);
        await Review.insertMany(allReviews);

        console.log('✅ Review seeding completed successfully!');
        console.log('==========================================');
        console.log(`📊 Generated ${totalReviewsGenerated} total reviews`);
        console.log('📈 Rating distribution:');
        Object.keys(dist).sort((a, b) => b - a).forEach(k => {
            console.log(`   ${k} stars: ${dist[k]} reviews`);
        });
        console.log(`✅ Verified reviews: ${await Review.countDocuments({ verified: true })}`);
        console.log(`✅ Approved reviews: ${await Review.countDocuments({ status: 'approved' })}`);

        console.log('\n🔄 Updating product rating statistics...');
        await updateAllProductRatings();

        console.log('\n🎉 All reviews have been generated successfully!');
    } catch (error) {
        console.error('❌ Error during review seeding:', error);
        throw error;
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
    }
};

// Execute seeding
if (require.main === module) {
    seedReviews().catch(console.error);
}

module.exports = { seedReviews, getProductSpecs, updateAllProductRatings };
