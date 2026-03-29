#!/usr/bin/env node
/**
 * ============================================================
 * Kewal Products Migration Script
 * ============================================================
 * 
 * WHAT THIS DOES:
 *  1. Reads product data from kewal-products-analysis.json
 *  2. Uploads all images from "Kewal 19-03-2026" folder to Cloudinary
 *     under: hs-global/furniture/center-table/* and hs-global/furniture/console-table/*
 *  3. Deletes ALL existing furniture products from MongoDB that have
 *     subcategory "Center Table" or "Console Table"
 *  4. Also cleans up Category documents for those subcategories
 *  5. Inserts fresh products with Cloudinary URLs + video paths
 *  6. Saves a cloudinary URL map to: scripts/kewal-cloudinary-urls.json
 * 
 * USAGE (run from backend/ directory):
 *   cd backend
 *   node ../scripts/migrate-kewal-products.js
 *   node ../scripts/migrate-kewal-products.js --dry-run      (no DB writes, no uploads)
 *   node ../scripts/migrate-kewal-products.js --skip-upload  (skip Cloudinary, use cached URLs)
 *   node ../scripts/migrate-kewal-products.js --skip-delete  (don't delete old products)
 * 
 * REQUIREMENTS:
 *   - backend/.env with MONGODB_URI, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
 *   - Dependencies available in backend/node_modules (mongoose, cloudinary, dotenv)
 * 
 * RUN FROM: d:/hs-global-main/backend  (backend directory, uses backend node_modules)
 * ============================================================
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;

// Load .env from backend/
// __dirname = d:/hs-global-main/scripts
// Works whether invoked from backend/ or root
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

// ─── CLI FLAGS ────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const DRY_RUN     = args.includes('--dry-run');
const SKIP_UPLOAD = args.includes('--skip-upload') || DRY_RUN;
const SKIP_DELETE = args.includes('--skip-delete') || DRY_RUN;

// ─── PATHS ────────────────────────────────────────────────────────────────────
// __dirname is always d:/hs-global-main/scripts regardless of CWD
const ROOT         = path.join(__dirname, '..');                               // d:/hs-global-main
const PRODUCT_DIR  = path.join(ROOT, 'Kewal 19-03-2026');                     // source images
const VIDEO_DIR    = path.join(ROOT, 'frontend', 'public', 'videos');         // videos
const ANALYSIS     = path.join(__dirname, 'kewal-products-analysis.json');     // analysis json
const URL_MAP_FILE = path.join(__dirname, 'kewal-cloudinary-urls.json');       // output url map

// ─── CLOUDINARY CONFIG ────────────────────────────────────────────────────────
cloudinary.config({
    cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
    api_key    : process.env.CLOUDINARY_API_KEY,
    api_secret : process.env.CLOUDINARY_API_SECRET,
});

// ─── MONGOOSE MODELS ──────────────────────────────────────────────────────────
// Inline lean schemas to avoid importing full server models
const productSchema = new mongoose.Schema({}, { strict: false, timestamps: true });
const categorySchema = new mongoose.Schema({}, { strict: false });
let Product, Category;

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const toSlug = (str) => str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const log = {
    info  : (...a) => console.log('ℹ️ ', ...a),
    ok    : (...a) => console.log('✅', ...a),
    warn  : (...a) => console.log('⚠️ ', ...a),
    error : (...a) => console.error('❌', ...a),
    step  : (...a) => console.log('\n' + '─'.repeat(60) + '\n🔷', ...a),
    dry   : (...a) => console.log('[DRY-RUN]', ...a),
};

// ─── CLOUDINARY UPLOAD ───────────────────────────────────────────────────────
/**
 * Upload a single image file to Cloudinary.
 * Returns the secure_url or a constructed URL if already uploaded.
 */
async function uploadImage(localPath, publicId) {
    try {
        const result = await cloudinary.uploader.upload(localPath, {
            public_id     : publicId,
            resource_type : 'image',
            overwrite     : false,       // Don't re-upload if exists
            quality       : 'auto',
            fetch_format  : 'auto',
        });
        return { url: result.secure_url, publicId: result.public_id, bytes: result.bytes, uploaded: true };
    } catch (err) {
        // Already exists → construct URL
        if (err.http_code === 400 && err.message && err.message.includes('already exists')) {
            const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
            // publicId may already contain .ext; strip it
            const cleanId = publicId.replace(/\.(png|jpg|jpeg|webp)$/i, '');
            const ext = path.extname(localPath).slice(1).toLowerCase() || 'png';
            const url = `https://res.cloudinary.com/${cloudName}/image/upload/${cleanId}.${ext}`;
            log.info(`Already exists: ${path.basename(localPath)}`);
            return { url, publicId, bytes: 0, uploaded: false };
        }
        throw err;
    }
}

/**
 * Upload all images for a product and return array of Cloudinary URLs.
 */
async function uploadProductImages(product) {
    const results = [];
    const imgFolder = path.join(ROOT, product.localImageFolder);

    if (!fs.existsSync(imgFolder)) {
        log.warn(`Image folder not found: ${imgFolder}`);
        return results;
    }

    const files = fs.readdirSync(imgFolder).filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f));

    for (const file of files) {
        const localPath = path.join(imgFolder, file);
        const fileBase  = path.basename(file, path.extname(file));
        const publicId  = `${product.cloudinaryFolder}/${fileBase}`;

        if (DRY_RUN) {
            log.dry(`Would upload: ${file} → ${publicId}`);
            results.push(`https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${publicId}`);
            continue;
        }

        try {
            log.info(`Uploading: ${file}`);
            const { url } = await uploadImage(localPath, publicId);
            log.ok(`Uploaded → ${url}`);
            results.push(url);
        } catch (err) {
            log.error(`Failed to upload ${file}: ${err.message}`);
        }
    }

    return results;
}

// ─── DATABASE ─────────────────────────────────────────────────────────────────
async function connectDB() {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hs_global_export';
    await mongoose.connect(uri);
    log.ok(`MongoDB connected: ${mongoose.connection.host}`);

    // Use flexible schemas so we don't have to maintain full Product/Category schema here
    Product  = mongoose.model('Product',  productSchema);
    Category = mongoose.model('Category', categorySchema);
}

async function deleteOldFurnitureProducts() {
    log.step('Deleting old Center Table & Console Table products from MongoDB');

    const query = {
        category    : 'furniture',
        subcategory : { $in: ['Center Table', 'Console Table', 'center-table', 'console-table'] },
    };

    if (SKIP_DELETE) {
        const count = await Product.countDocuments(query);
        log.dry(`Would delete ${count} products matching subcategory Center Table / Console Table`);
        return;
    }

    const result = await Product.deleteMany(query);
    log.ok(`Deleted ${result.deletedCount} old products`);

    // Also remove those subcategories from Category document for 'furniture'
    const catUpdate = await Category.updateOne(
        { categoryId: 'furniture' },
        {
            $pull: {
                customSubcategories: {
                    id: { $in: ['center-table', 'console-table'] },
                },
            },
        }
    );
    log.ok(`Updated Category document (furniture) - modified: ${catUpdate.modifiedCount}`);
}

async function ensureCategorySubcategories() {
    log.step('Ensuring Category subcategories exist for furniture');

    const subCategories = [
        { id: 'center-table',  name: 'Center Table',  isCustom: true },
        { id: 'console-table', name: 'Console Table', isCustom: true },
    ];

    if (DRY_RUN) {
        log.dry('Would upsert Category: furniture with subcategories Center Table, Console Table');
        return;
    }

    let cat = await Category.findOne({ categoryId: 'furniture' });

    if (!cat) {
        cat = new Category({ categoryId: 'furniture', categoryName: 'Furniture', customSubcategories: [] });
        log.info('Created new Category document for furniture');
    }

    for (const sub of subCategories) {
        const exists = (cat.customSubcategories || []).some(s => s.id === sub.id);
        if (!exists) {
            cat.customSubcategories = cat.customSubcategories || [];
            cat.customSubcategories.push(sub);
            log.ok(`Added subcategory: ${sub.name}`);
        } else {
            log.info(`Subcategory already exists: ${sub.name}`);
        }
    }

    cat.updatedAt = new Date();
    await cat.save();
    log.ok('Category document saved');
}

async function insertProduct(productData, cloudinaryUrls, videoPath) {
    const productId = toSlug(productData.name);

    // Check if already migrated
    const existing = await Product.findOne({ productId });
    if (existing) {
        log.warn(`Product already exists: ${productId} — skipping insert`);
        return;
    }

    const subcategorySlug = toSlug(productData.subcategory); // 'center-table' | 'console-table'

    const doc = {
        productId,
        name        : productData.name,
        category    : 'furniture',
        subcategory : productData.subcategory,  // Keep pretty name e.g. "Center Table"
        description : `Premium ${productData.name} - ${productData.subcategory} crafted from ${productData.furnitureSpecs?.material || 'Natural Stone'}. Handcrafted in India by HS Global Export.`,
        image       : cloudinaryUrls[0] || '',
        images      : cloudinaryUrls,
        sortedImages: cloudinaryUrls,
        priceINR    : null,   // Price on request
        available   : true,
        hasVideo    : productData.hasVideo && !!videoPath,
        videoUrl    : null,
        videoFilename: videoPath ? path.basename(videoPath) : null,
        furnitureSpecs: productData.furnitureSpecs || {},
        status      : 'active',
        featured    : false,
        tags        : [
            'furniture',
            subcategorySlug,
            productData.name.toLowerCase(),
            (productData.furnitureSpecs?.material || '').toLowerCase(),
            'marble',
            'india',
            'export',
        ].filter(Boolean),
        seoTitle: `${productData.name} - ${productData.subcategory} | HS Global Export`,
        seoDescription: `Buy ${productData.name} online. Premium ${productData.subcategory} crafted from ${productData.furnitureSpecs?.material || 'Natural Stone'} by HS Global Export, India.`,
        seoKeywords: [
            productData.name.toLowerCase(),
            productData.subcategory.toLowerCase(),
            (productData.furnitureSpecs?.material || '').toLowerCase(),
            'furniture',
            'india',
            'marble table',
        ].filter(Boolean),
        shipping: {
            requiresShipping : true,
            shippingClass    : 'fragile',
            handlingTime     : '15-20 business days',
        },
        manufacturing: {
            isCustomMade    : true,
            countryOfOrigin : 'India',
        },
    };

    // Attach video local path as metadata if video exists
    if (productData.hasVideo && videoPath) {
        const absoluteVideoPath = path.join(ROOT, videoPath);
        if (fs.existsSync(absoluteVideoPath)) {
            // Store relative web path: /videos/Tables/Console Table/.../video.mp4
            const webVideoPath = videoPath
                .replace(/^frontend\/public/, '')
                .replace(/\\/g, '/');
            doc.videoUrl = webVideoPath;
            log.ok(`Video found: ${webVideoPath}`);
        } else {
            log.warn(`Video file not found on disk: ${absoluteVideoPath}`);
        }
    }

    if (DRY_RUN) {
        log.dry(`Would insert product: ${productData.name} (${cloudinaryUrls.length} images)`);
        return;
    }

    const product = new Product(doc);
    await product.save();
    log.ok(`Inserted product: ${productData.name} (${cloudinaryUrls.length} images)`);
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 KEWAL PRODUCTS MIGRATION');
    console.log('='.repeat(60));
    if (DRY_RUN)     console.log('🟡 DRY-RUN MODE — no DB writes, no uploads');
    if (SKIP_UPLOAD) console.log('🟡 SKIP-UPLOAD — images will use cached/constructed URLs');
    if (SKIP_DELETE) console.log('🟡 SKIP-DELETE — old products will NOT be deleted');
    console.log('');

    // Validate env
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
        log.error('Missing Cloudinary credentials in backend/.env');
        process.exit(1);
    }

    // Load analysis JSON
    if (!fs.existsSync(ANALYSIS)) {
        log.error(`Analysis file not found: ${ANALYSIS}`);
        process.exit(1);
    }
    const analysis = JSON.parse(fs.readFileSync(ANALYSIS, 'utf8'));
    const products  = analysis.products;
    log.ok(`Loaded ${products.length} products from analysis`);

    // Connect DB
    await connectDB();

    // Step 1 – Delete old products
    await deleteOldFurnitureProducts();

    // Step 2 – Ensure category subcategories
    await ensureCategorySubcategories();

    // Step 3 – Upload & insert
    log.step('Uploading images and inserting products');

    const urlMap = {};              // { productName: [cloudinaryUrl, ...] }
    let totalUploaded  = 0;
    let totalInserted  = 0;
    let totalErrors    = 0;

    for (const product of products) {
        console.log(`\n📦 ${product.name} [${product.subcategory}]`);

        // Upload images
        let cloudinaryUrls = [];

        if (SKIP_UPLOAD) {
            // Construct expected Cloudinary URLs from analysis data
            const imgFolder = path.join(ROOT, product.localImageFolder);
            if (fs.existsSync(imgFolder)) {
                const files = fs.readdirSync(imgFolder).filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f));
                cloudinaryUrls = files.map(f => {
                    const fileBase = path.basename(f, path.extname(f));
                    const ext      = path.extname(f).slice(1).toLowerCase();
                    return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${product.cloudinaryFolder}/${fileBase}.${ext}`;
                });
                log.info(`[skip-upload] Constructed ${cloudinaryUrls.length} URLs`);
            }
        } else {
            cloudinaryUrls = await uploadProductImages(product);
            totalUploaded += cloudinaryUrls.length;
        }

        urlMap[product.name] = cloudinaryUrls;

        // Resolve video path
        const videoLocalPath = product.hasVideo ? product.videoLocalPath : null;

        // Insert into DB
        try {
            await insertProduct(product, cloudinaryUrls, videoLocalPath);
            totalInserted++;
        } catch (err) {
            log.error(`Failed to insert ${product.name}: ${err.message}`);
            totalErrors++;
        }
    }

    // Step 4 – Save URL map
    log.step('Saving Cloudinary URL map');
    const output = {
        generated : new Date().toISOString(),
        cloudName : process.env.CLOUDINARY_CLOUD_NAME,
        dryRun    : DRY_RUN,
        stats     : {
            totalProducts : products.length,
            uploaded      : totalUploaded,
            inserted      : totalInserted,
            errors        : totalErrors,
        },
        urls: urlMap,
    };

    if (!DRY_RUN) {
        fs.writeFileSync(URL_MAP_FILE, JSON.stringify(output, null, 2));
        log.ok(`URL map saved → ${URL_MAP_FILE}`);
    } else {
        log.dry(`Would save URL map to ${URL_MAP_FILE}`);
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 MIGRATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`  Products processed : ${products.length}`);
    console.log(`  Images uploaded    : ${totalUploaded}`);
    console.log(`  Products inserted  : ${totalInserted}`);
    console.log(`  Errors             : ${totalErrors}`);
    console.log('='.repeat(60));

    if (totalErrors === 0) {
        log.ok('Migration completed successfully!');
    } else {
        log.warn(`Migration completed with ${totalErrors} errors. Check logs above.`);
    }

    await mongoose.connection.close();
    log.info('DB connection closed');
}

main().catch(err => {
    log.error('Fatal error:', err);
    mongoose.connection.close().catch(() => {});
    process.exit(1);
});
