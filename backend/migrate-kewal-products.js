#!/usr/bin/env node
/**
 * ============================================================
 * Kewal Products Migration  —  2-Step Script
 * ============================================================
 *
 * STEP 1  →  Compress + Upload to Cloudinary → Save JSON
 *   node migrate-kewal-products.js --step=1
 *   node migrate-kewal-products.js --step=1 --dry-run
 *
 * STEP 2  →  Read JSON → Delete old DB records → Insert new
 *   node migrate-kewal-products.js --step=2
 *   node migrate-kewal-products.js --step=2 --dry-run
 *   node migrate-kewal-products.js --step=2 --skip-delete
 *
 * WHAT STEP 1 DOES:
 *   - Scans ALL 7 category folders inside "Kewal 19-03-2026/"
 *   - Discovers every product sub-folder automatically
 *   - Compresses each image to WebP (max 1600px, q=80) via Sharp
 *   - Uploads the WebP to Cloudinary (skips if already uploaded)
 *   - Matches video files from frontend/public/videos/
 *   - Saves everything to: scripts/kewal-migration-db.json
 *
 * WHAT STEP 2 DOES:
 *   - Reads scripts/kewal-migration-db.json
 *   - Deletes ALL old products for every migrated subcategory
 *   - Upserts Category docs with new subcategory entries
 *   - Inserts fresh Product documents with Cloudinary URLs
 *
 * RUN FROM: backend/  (uses backend/node_modules)
 *   cd backend
 *   node migrate-kewal-products.js --step=1
 *   node migrate-kewal-products.js --step=2
 * ============================================================
 */

'use strict';

const fs       = require('fs');
const path     = require('path');
const os       = require('os');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const sharp    = require('sharp');

require('dotenv').config({ path: path.join(__dirname, '.env') });

// ─── CLI ───────────────────────────────────────────────────────────────────────
const args       = process.argv.slice(2);
const STEP       = (() => { const s = args.find(a => a.startsWith('--step=')); return s ? parseInt(s.split('=')[1]) : null; })();
const DRY_RUN    = args.includes('--dry-run');
const SKIP_DELETE = args.includes('--skip-delete');

if (!STEP || (STEP !== 1 && STEP !== 2)) {
    console.error('\n❌  Please specify a step:\n');
    console.error('   node migrate-kewal-products.js --step=1   (upload images → save JSON)');
    console.error('   node migrate-kewal-products.js --step=2   (import JSON → MongoDB)\n');
    process.exit(1);
}

// ─── PATHS ────────────────────────────────────────────────────────────────────
const ROOT         = path.join(__dirname, '..');
const KEWAL_DIR    = path.join(ROOT, 'Kewal 19-03-2026');
const VIDEO_DIR    = path.join(ROOT, 'frontend', 'public', 'videos');
const JSON_DB_FILE = path.join(ROOT, 'scripts', 'kewal-migration-db.json');
const TEMP_DIR     = path.join(os.tmpdir(), 'kewal-webp');

// ─── IMAGE OPTS (matches old optimize-and-upload-all.js) ──────────────────────
const OPT = { maxWidth: 1600, maxHeight: 1600, quality: 80, effort: 6 };

// ─── CATEGORY MAP ─────────────────────────────────────────────────────────────
// Folder name in "Kewal 19-03-2026/"  →  pretty subcategory name + Cloudinary slug
const CATEGORY_MAP = {
    '3 Sphere Balls Table' : { subcategory: '3 Sphere Balls Table', slug: 'three-sphere-balls-table' },
    'Center Table'         : { subcategory: 'Center Table',         slug: 'center-table'            },
    'Console Tables'       : { subcategory: 'Console Table',        slug: 'console-table'           },
    'Lamps'                : { subcategory: 'Lamps',                slug: 'lamps'                   },
    'Pedestal Wash Basins' : { subcategory: 'Pedestal Wash Basin',  slug: 'pedestal-wash-basin'     },
    'Side Tables'          : { subcategory: 'Side Table',           slug: 'side-table'              },
    'Wash Basins'          : { subcategory: 'Wash Basin',           slug: 'wash-basin'              },
};

// DB category for all (everything here is furniture)
const DB_CATEGORY = 'furniture';

// ─── LOGGING ──────────────────────────────────────────────────────────────────
const log = {
    info  : (...a) => console.log('ℹ️ ', ...a),
    ok    : (...a) => console.log('✅', ...a),
    warn  : (...a) => console.log('⚠️ ', ...a),
    error : (...a) => console.error('❌', ...a),
    step  : (...a) => console.log('\n' + '─'.repeat(62) + '\n🔷', ...a),
    dry   : (...a) => console.log('  [DRY]', ...a),
};

// ─── SLUG UTIL ────────────────────────────────────────────────────────────────
const toSlug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// ─── NORMALIZE for fuzzy matching ─────────────────────────────────────────────
const normalize = (s) => s.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

// ════════════════════════════════════════════════════════════════════════════════
//  STEP 1  —  UPLOAD TO CLOUDINARY + SAVE JSON
// ════════════════════════════════════════════════════════════════════════════════

// ─── BUILD VIDEO LOOKUP ───────────────────────────────────────────────────────
/**
 * Walk the videos/ directory and build a flat map:
 *   normalized(productName) → relative web path  e.g. /videos/Tables/Console Table/Foo/video.mp4
 */
function buildVideoLookup() {
    const lookup = {};

    function walk(dir, relBase) {
        if (!fs.existsSync(dir)) return;
        for (const item of fs.readdirSync(dir)) {
            const full = path.join(dir, item);
            const rel  = path.join(relBase, item);
            const stat = fs.statSync(full);
            if (stat.isDirectory()) {
                walk(full, rel);
            } else if (item.toLowerCase() === 'video.mp4') {
                // parent folder name = product name
                const productFolder = path.basename(path.dirname(full));
                const key = normalize(productFolder);
                // Store as web path (forward slashes, starting with /)
                const webPath = '/videos/' + relBase.replace(/\\/g, '/').replace(/^\//, '') + '/video.mp4';
                lookup[key] = webPath;
            }
        }
    }

    walk(VIDEO_DIR, '');
    log.info(`Video lookup built: ${Object.keys(lookup).length} entries`);
    return lookup;
}

/**
 * Find best video match for a product name.
 * Tries exact normalize match first, then substring match.
 */
function findVideo(productName, videoLookup) {
    const key = normalize(productName);

    // Exact
    if (videoLookup[key]) return videoLookup[key];

    // Substring: does any lookup key contain the product name words?
    const words = key.split(' ').filter(w => w.length > 3);
    for (const [k, v] of Object.entries(videoLookup)) {
        if (words.every(w => k.includes(w))) return v;
    }
    // Reverse: does the product name contain all lookup key words?
    for (const [k, v] of Object.entries(videoLookup)) {
        const kWords = k.split(' ').filter(w => w.length > 3);
        if (kWords.length > 0 && kWords.every(w => key.includes(w))) return v;
    }

    return null;
}

// ─── SHARP COMPRESS ───────────────────────────────────────────────────────────
async function compressToWebp(inputPath, tempName) {
    const outputPath = path.join(TEMP_DIR, `${tempName}.webp`);
    try {
        const meta = await sharp(inputPath).metadata();
        let w = meta.width || 1600, h = meta.height || 1600;
        if (w > OPT.maxWidth)  { h = Math.round(h * OPT.maxWidth  / w); w = OPT.maxWidth;  }
        if (h > OPT.maxHeight) { w = Math.round(w * OPT.maxHeight / h); h = OPT.maxHeight; }

        const origBytes = fs.statSync(inputPath).size;
        await sharp(inputPath)
            .resize(w, h, { fit: 'inside', withoutEnlargement: true, kernel: sharp.kernel.lanczos3 })
            .webp({ quality: OPT.quality, effort: OPT.effort, smartSubsample: true })
            .toFile(outputPath);
        const optBytes = fs.statSync(outputPath).size;
        const pct = ((origBytes - optBytes) / origBytes * 100).toFixed(1);
        log.info(`    Compressed ${path.basename(inputPath)}: ${(origBytes/1024).toFixed(0)}KB → ${(optBytes/1024).toFixed(0)}KB (${pct}% saved)`);
        return outputPath;
    } catch (err) {
        log.warn(`    Sharp failed (${path.basename(inputPath)}): ${err.message} — using original`);
        return inputPath;
    }
}

// ─── CLOUDINARY UPLOAD ────────────────────────────────────────────────────────
function initCloudinary() {
    cloudinary.config({
        cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
        api_key    : process.env.CLOUDINARY_API_KEY,
        api_secret : process.env.CLOUDINARY_API_SECRET,
    });
}

async function uploadToCloudinary(filePath, publicId) {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            public_id     : publicId,
            resource_type : 'image',
            overwrite     : false,
            quality       : 'auto',
            fetch_format  : 'auto',
        });
        return result.secure_url;
    } catch (err) {
        if (err.http_code === 400 && err.message && err.message.includes('already exists')) {
            // Construct URL from public_id (already .webp in Cloudinary)
            const url = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${publicId}.webp`;
            log.info(`    Already exists → ${url}`);
            return url;
        }
        throw err;
    }
}

// ─── SCAN KEWAL DIRECTORY ─────────────────────────────────────────────────────
function scanKewalDirectory() {
    const categories = [];
    const catFolders = fs.readdirSync(KEWAL_DIR).filter(f =>
        fs.statSync(path.join(KEWAL_DIR, f)).isDirectory()
    );

    for (const catFolder of catFolders) {
        const mapping = CATEGORY_MAP[catFolder];
        if (!mapping) {
            log.warn(`Unknown category folder: "${catFolder}" — skipping`);
            continue;
        }

        const catPath  = path.join(KEWAL_DIR, catFolder);
        const products = [];

        const productFolders = fs.readdirSync(catPath).filter(f =>
            fs.statSync(path.join(catPath, f)).isDirectory()
        );

        for (const prodFolder of productFolders) {
            const prodPath = path.join(catPath, prodFolder);
            const images   = fs.readdirSync(prodPath)
                .filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f))
                .sort();

            if (images.length === 0) {
                log.warn(`  No images found: ${catFolder}/${prodFolder}`);
                continue;
            }

            products.push({
                name          : prodFolder,
                catFolder,
                localPath     : prodPath,
                imageFiles    : images,
                cloudinaryDir : `hs-global/furniture/${mapping.slug}/${toSlug(prodFolder)}`,
            });
        }

        categories.push({ catFolder, mapping, products });
    }

    return categories;
}

// ─── STEP 1 MAIN ──────────────────────────────────────────────────────────────
async function runStep1() {
    console.log('\n' + '═'.repeat(62));
    console.log('🚀  STEP 1  —  Upload Images → Cloudinary  →  Save JSON');
    console.log('═'.repeat(62));
    if (DRY_RUN) console.log('🟡  DRY-RUN: no actual uploads or file writes\n');

    // Validate
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
        log.error('Missing Cloudinary credentials in backend/.env'); process.exit(1);
    }
    initCloudinary();

    // Ensure temp dir
    if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

    // Build video lookup
    const videoLookup = buildVideoLookup();

    // Scan folder structure
    const categories = scanKewalDirectory();
    const totalProducts = categories.reduce((s, c) => s + c.products.length, 0);

    log.ok(`Found ${categories.length} categories, ${totalProducts} products`);
    for (const c of categories) {
        log.info(`  ${c.catFolder}: ${c.products.length} products`);
    }

    const stats = { categories: 0, products: 0, images: 0, imagesUploaded: 0, errors: 0 };
    const jsonDB = {
        meta: {
            generatedAt   : new Date().toISOString(),
            sourceFolder  : 'Kewal 19-03-2026',
            cloudName     : process.env.CLOUDINARY_CLOUD_NAME,
            totalCategories: categories.length,
            totalProducts,
            dryRun        : DRY_RUN,
        },
        categories: [],
        products  : [],
    };

    // Process each category
    for (const { catFolder, mapping, products } of categories) {
        log.step(`Category: ${catFolder}  →  subcategory: "${mapping.subcategory}"`);
        stats.categories++;

        const catEntry = {
            folderName  : catFolder,
            subcategory : mapping.subcategory,
            slug        : mapping.slug,
            dbCategory  : DB_CATEGORY,
            productCount: products.length,
        };
        jsonDB.categories.push(catEntry);

        for (const product of products) {
            console.log(`\n  📦  ${product.name}`);
            stats.products++;

            const cloudinaryUrls = [];
            let imgIndex = 0;

            for (const imgFile of product.imageFiles) {
                const localImgPath = path.join(product.localPath, imgFile);
                const fileBase     = path.basename(imgFile, path.extname(imgFile));
                const publicId     = `${product.cloudinaryDir}/${fileBase}`;
                imgIndex++;
                stats.images++;

                if (DRY_RUN) {
                    log.dry(`compress + upload: ${imgFile}`);
                    cloudinaryUrls.push(`https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${publicId}.webp`);
                    continue;
                }

                let uploadPath  = localImgPath;
                let tempCreated = false;

                try {
                    // Compress to WebP
                    const tempName  = `${toSlug(product.name)}_${imgIndex}`;
                    const webpPath  = await compressToWebp(localImgPath, tempName);
                    if (webpPath !== localImgPath) { uploadPath = webpPath; tempCreated = true; }

                    // Upload
                    const url = await uploadToCloudinary(uploadPath, publicId);
                    cloudinaryUrls.push(url);
                    log.ok(`    → ${url}`);
                    stats.imagesUploaded++;
                } catch (err) {
                    log.error(`    Upload failed (${imgFile}): ${err.message}`);
                    stats.errors++;
                } finally {
                    if (tempCreated && fs.existsSync(uploadPath)) {
                        try { fs.unlinkSync(uploadPath); } catch (_) {}
                    }
                }
            }

            // Match video
            const videoPath = findVideo(product.name, videoLookup);
            if (videoPath) log.ok(`    Video: ${videoPath}`);

            // Build product entry for JSON DB
            const productEntry = {
                productId      : toSlug(product.name),
                name           : product.name,
                category       : DB_CATEGORY,
                subcategory    : mapping.subcategory,
                subcategorySlug: mapping.slug,
                catFolder,
                cloudinaryDir  : product.cloudinaryDir,
                images         : cloudinaryUrls,
                image          : cloudinaryUrls[0] || '',
                hasVideo       : !!videoPath,
                videoUrl       : videoPath || null,
                furnitureSpecs : deriveFurnitureSpecs(product.name, mapping.subcategory),
                seoTitle       : `${product.name} - ${mapping.subcategory} | HS Global Export`,
                seoDescription : `Premium ${product.name} — handcrafted ${mapping.subcategory} from natural stone by HS Global Export, India.`,
                seoKeywords    : buildKeywords(product.name, mapping.subcategory),
                uploadedAt     : new Date().toISOString(),
            };

            jsonDB.products.push(productEntry);
        }
    }

    // Clean up temp dir
    try { if (fs.existsSync(TEMP_DIR)) fs.rmSync(TEMP_DIR, { recursive: true }); } catch (_) {}

    // Save JSON DB
    if (!DRY_RUN) {
        fs.writeFileSync(JSON_DB_FILE, JSON.stringify(jsonDB, null, 2), 'utf8');
        log.ok(`\nJSON DB saved → ${JSON_DB_FILE}`);
    } else {
        log.dry(`Would save JSON DB to ${JSON_DB_FILE}`);
    }

    // Summary
    console.log('\n' + '═'.repeat(62));
    console.log('📊  STEP 1 SUMMARY');
    console.log('═'.repeat(62));
    console.log(`  Categories  : ${stats.categories}`);
    console.log(`  Products    : ${stats.products}`);
    console.log(`  Images      : ${stats.images}`);
    console.log(`  Uploaded    : ${stats.imagesUploaded}`);
    console.log(`  Errors      : ${stats.errors}`);
    console.log(`  JSON DB     : ${JSON_DB_FILE}`);
    console.log('═'.repeat(62));
    if (stats.errors === 0) {
        log.ok('Step 1 complete! Now run --step=2 to import to MongoDB.');
    } else {
        log.warn(`Step 1 done with ${stats.errors} errors. Check logs above.`);
    }
}

// ─── SPEC HELPERS ─────────────────────────────────────────────────────────────
function deriveFurnitureSpecs(name, subcategory) {
    const n = name.toLowerCase();
    const material =
        n.includes('travertine')       ? 'Travertine'             :
        n.includes('statuario')        ? 'Statuario Marble'       :
        n.includes('panda white')      ? 'Panda White Marble'     :
        n.includes('green marble') || n.includes('emerald')   ? 'Green Marble' :
        n.includes('black marble') || n.includes('marine black') ? 'Black Marble' :
        n.includes('white marble')     ? 'White Marble'           :
        n.includes('cappuccino brown') ? 'Cappuccino Brown Marble':
        n.includes('banswara')         ? 'Banswara White Marble'  :
        n.includes('sandstone')        ? 'Sandstone'              :
        n.includes('onyx')             ? 'Onyx'                   :
        n.includes('katni')            ? 'Katni Pink Marble'      :
        n.includes('lava oro')         ? 'Lava Oro'               :
        n.includes('rosso levanto')    ? 'Rosso Levanto Marble'   :
        n.includes('alabeta') || n.includes('albeta') ? 'Albeta Marble' :
        n.includes('amazon green')     ? 'Amazon Green Marble'    :
        n.includes('forest green')     ? 'Forest Green Marble'    :
        n.includes('bidasar')          ? 'Bidasar Beige Marble'   :
        n.includes('makrana')          ? 'Makrana White Marble'   :
        n.includes('kumari grey')      ? 'Kumari Grey Marble'     :
        n.includes('ivory')            ? 'Ivory Marble'           :
        n.includes('satvario')         ? 'Satvario Marble'        :
        'Natural Stone';

    const colorName =
        material.toLowerCase().includes('black') ? 'Black'  :
        material.toLowerCase().includes('green') ? 'Green'  :
        material.toLowerCase().includes('brown') || material.toLowerCase().includes('cappuccino') ? 'Brown' :
        material.toLowerCase().includes('beige') || material.toLowerCase().includes('travertine')  ? 'Beige' :
        material.toLowerCase().includes('pink')  ? 'Pink'   :
        material.toLowerCase().includes('lava')  ? 'Gold'   :
        material.toLowerCase().includes('rosso') ? 'Red'    :
        'White';

    const isWashBasin = subcategory.toLowerCase().includes('wash basin') || subcategory.toLowerCase().includes('pedestal');

    return {
        type          : 'Indoor',
        material,
        colorName,
        surfaceFinish : 'Polished',
        location      : 'India',
        ...(isWashBasin ? { product: subcategory } : {}),
    };
}

function buildKeywords(name, subcategory) {
    return [
        name.toLowerCase(),
        subcategory.toLowerCase(),
        'furniture',
        'marble',
        'natural stone',
        'india',
        'handcrafted',
        'export',
        'hs global',
    ].filter(Boolean);
}

// ════════════════════════════════════════════════════════════════════════════════
//  STEP 2  —  JSON → MONGODB
// ════════════════════════════════════════════════════════════════════════════════

// Flexible schemas — no need to import full server models
const productSchema  = new mongoose.Schema({}, { strict: false, timestamps: true });
const categorySchema = new mongoose.Schema({}, { strict: false });
let Product, Category;

async function connectDB() {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hs_global_export';
    await mongoose.connect(uri);
    log.ok(`MongoDB connected: ${mongoose.connection.host}`);
    Product  = mongoose.model('Product',  productSchema);
    Category = mongoose.model('Category', categorySchema);
}

async function deleteOldProducts(subcategories) {
    log.step('Deleting old products for migrated subcategories');

    const query = {
        category    : 'furniture',
        subcategory : { $in: subcategories },
    };

    if (SKIP_DELETE) {
        const count = await Product.countDocuments(query);
        log.dry(`Would delete ${count} products for: ${subcategories.join(', ')}`);
        return;
    }
    if (DRY_RUN) {
        const count = await Product.countDocuments(query);
        log.dry(`Would delete ${count} products`);
        return;
    }

    const result = await Product.deleteMany(query);
    log.ok(`Deleted ${result.deletedCount} old products`);
}

async function upsertCategorySubcategories(categoryEntries) {
    log.step('Upserting Category subcategory entries');

    // Deduplicate by slug
    const seen = new Set();
    const subs = [];
    for (const e of categoryEntries) {
        if (!seen.has(e.slug)) {
            seen.add(e.slug);
            subs.push({ id: e.slug, name: e.subcategory, isCustom: true });
        }
    }

    if (DRY_RUN) {
        log.dry(`Would upsert ${subs.length} subcategories: ${subs.map(s => s.name).join(', ')}`);
        return;
    }

    let cat = await Category.findOne({ categoryId: 'furniture' });
    if (!cat) {
        cat = new Category({ categoryId: 'furniture', categoryName: 'Furniture', customSubcategories: [] });
        log.info('Created new Category doc for furniture');
    }

    // Remove old entries for these slugs, then re-add
    cat.customSubcategories = (cat.customSubcategories || []).filter(s => !seen.has(s.id));
    cat.customSubcategories.push(...subs);
    cat.updatedAt = new Date();
    await cat.save();
    log.ok(`Saved ${subs.length} subcategories to Category.furniture`);
}

async function insertProduct(entry) {
    const existing = await Product.findOne({ productId: entry.productId });
    if (existing) {
        log.warn(`Already exists: ${entry.productId} — skipping`);
        return false;
    }

    const doc = {
        productId      : entry.productId,
        name           : entry.name,
        category       : entry.category,
        subcategory    : entry.subcategory,
        description    : `Premium ${entry.name} — handcrafted ${entry.subcategory} crafted from ${entry.furnitureSpecs?.material || 'Natural Stone'} by HS Global Export, India.`,
        image          : entry.image,
        images         : entry.images,
        sortedImages   : entry.images,
        priceINR       : null,
        available      : true,
        hasVideo       : entry.hasVideo,
        videoUrl       : entry.videoUrl,
        videoFilename  : entry.videoUrl ? 'video.mp4' : null,
        furnitureSpecs : entry.furnitureSpecs,
        status         : 'active',
        featured       : false,
        tags           : [
            'furniture',
            entry.subcategorySlug,
            entry.name.toLowerCase(),
            (entry.furnitureSpecs?.material || '').toLowerCase(),
            'marble', 'india', 'export', 'handcrafted',
        ].filter(Boolean),
        seoTitle          : entry.seoTitle,
        seoDescription    : entry.seoDescription,
        seoKeywords       : entry.seoKeywords,
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

    if (DRY_RUN) {
        log.dry(`Would insert: ${entry.name} (${entry.images.length} images, video: ${entry.hasVideo})`);
        return true;
    }

    const product = new Product(doc);
    await product.save();
    log.ok(`Inserted: ${entry.name} (${entry.images.length} images)`);
    return true;
}

async function runStep2() {
    console.log('\n' + '═'.repeat(62));
    console.log('🚀  STEP 2  —  Import JSON → MongoDB');
    console.log('═'.repeat(62));
    if (DRY_RUN)    console.log('🟡  DRY-RUN: reads DB but makes no changes');
    if (SKIP_DELETE) console.log('🟡  SKIP-DELETE: will not remove old products');
    console.log('');

    // Load JSON DB
    if (!fs.existsSync(JSON_DB_FILE)) {
        log.error(`JSON DB not found: ${JSON_DB_FILE}`);
        log.error('Run --step=1 first to generate it.');
        process.exit(1);
    }

    const jsonDB = JSON.parse(fs.readFileSync(JSON_DB_FILE, 'utf8'));
    log.ok(`Loaded JSON DB: ${jsonDB.products.length} products, ${jsonDB.categories.length} categories`);
    log.info(`Generated at: ${jsonDB.meta.generatedAt}`);

    // Derive list of subcategories to delete
    const subcategories = [...new Set(jsonDB.products.map(p => p.subcategory))];
    log.info(`Subcategories to migrate: ${subcategories.join(', ')}`);

    // Connect DB
    await connectDB();

    // Delete old records
    await deleteOldProducts(subcategories);

    // Upsert Category doc
    await upsertCategorySubcategories(jsonDB.categories);

    // Insert products
    log.step(`Inserting ${jsonDB.products.length} products`);
    const stats = { inserted: 0, skipped: 0, errors: 0 };

    for (const entry of jsonDB.products) {
        console.log(`\n  📦  ${entry.name}  [${entry.subcategory}]`);
        try {
            const ok = await insertProduct(entry);
            if (ok) stats.inserted++; else stats.skipped++;
        } catch (err) {
            log.error(`  Failed: ${entry.name} — ${err.message}`);
            stats.errors++;
        }
    }

    await mongoose.connection.close();

    // Summary
    console.log('\n' + '═'.repeat(62));
    console.log('📊  STEP 2 SUMMARY');
    console.log('═'.repeat(62));
    console.log(`  Total products : ${jsonDB.products.length}`);
    console.log(`  Inserted       : ${stats.inserted}`);
    console.log(`  Skipped        : ${stats.skipped}`);
    console.log(`  Errors         : ${stats.errors}`);
    console.log('═'.repeat(62));
    if (stats.errors === 0) log.ok('Step 2 complete — all products imported!');
    else log.warn(`Step 2 done with ${stats.errors} errors.`);
}

// ─── ENTRY POINT ──────────────────────────────────────────────────────────────
(async () => {
    try {
        if (STEP === 1) await runStep1();
        else            await runStep2();
    } catch (err) {
        log.error('Fatal:', err.message);
        if (mongoose.connection.readyState === 1) await mongoose.connection.close().catch(() => {});
        process.exit(1);
    }
})();
