#!/usr/bin/env node
/**
 * ============================================================
 * Leather Products Migration Script (3-Step Process)
 * ============================================================
 *
 * USAGE:
 *   cd backend
 *   node scripts/migrate-leather-products.js --step=1
 *   node scripts/migrate-leather-products.js --step=2
 *   node scripts/migrate-leather-products.js --step=3
 *
 * FLAGS:
 *   --dry-run       : Test without writing to Cloudinary/DB
 *   --skip-upload   : (Step 2) Skip actual upload, generate mock CDN urls
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const sharp = require('sharp');

require('dotenv').config({ path: path.join(__dirname, '../.env') });

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const SKIP_UPLOAD = args.includes('--skip-upload') || DRY_RUN;
const STEP = args.find(a => a.startsWith('--step='))?.split('=')[1] || '1';

const ROOT = path.join(__dirname, '../..');
const CSV_PATH = path.join(ROOT, 'new products', 'Latest Etsy & HS All Product Title Desc  April -May 2026 - leather product.csv');
const PHOTOS_DIR = path.join(ROOT, 'new products', 'Leather Products');
const FRONTEND_VIDEOS_DIR = path.join(ROOT, 'frontend', 'public', 'videos', 'leather');

const STEP1_FILE = path.join(__dirname, 'leather-data-step1.json');
const STEP2_FILE = path.join(__dirname, 'leather-data-step2.json');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const productSchema = new mongoose.Schema({}, { strict: false, timestamps: true });
const categorySchema = new mongoose.Schema({}, { strict: false });
let Product, Category;

const toSlug = (str) => str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// ─────────────────────────────────────────────────────────────
// RFC 4180 STRICT CSV PARSER
// ─────────────────────────────────────────────────────────────
function parseCSV(str) {
    const arr = [];
    let quote = false;
    for (let row = 0, col = 0, c = 0; c < str.length; c++) {
        const cc = str[c], nc = str[c + 1];
        arr[row] = arr[row] || [];
        arr[row][col] = arr[row][col] || '';

        if (cc === '"' && quote && nc === '"') { arr[row][col] += cc; ++c; continue; }
        if (cc === '"') { quote = !quote; continue; }
        if (cc === ',' && !quote) { ++col; continue; }
        if (cc === '\r' && nc === '\n' && !quote) { ++row; col = 0; ++c; continue; }
        if (cc === '\n' && !quote) { ++row; col = 0; continue; }
        if (cc === '\r' && !quote) { ++row; col = 0; continue; }

        arr[row][col] += cc;
    }
    return arr;
}

// ─────────────────────────────────────────────────────────────
// PRICE PARSING  (handles "$1,891.91" or plain "1891.91")
// ─────────────────────────────────────────────────────────────
function parseUSD(raw) {
    if (!raw) return null;
    const cleaned = raw.replace(/[^0-9.]/g, '');
    const val = parseFloat(cleaned);
    return isNaN(val) ? null : val;
}

// ─────────────────────────────────────────────────────────────
// PHOTO FOLDER MAP — keyed by row number (e.g. "1", "2", "10")
// Leather folders format: "{no}. {Product Name}" or "{no}.{Product Name}"
// ─────────────────────────────────────────────────────────────
function buildPhotoFolderMap() {
    if (!fs.existsSync(PHOTOS_DIR)) return {};

    const folders = fs.readdirSync(PHOTOS_DIR).filter(f => {
        return fs.statSync(path.join(PHOTOS_DIR, f)).isDirectory();
    });

    const folderMap = {};
    for (const f of folders) {
        const match = f.match(/^(\d+)\./);
        if (match) {
            folderMap[match[1]] = f; // key = row number e.g. "1", "10", "27"
        }
    }
    return folderMap;
}

// ─────────────────────────────────────────────────────────────
// CLOUDINARY UPLOAD
// ─────────────────────────────────────────────────────────────
async function uploadImage(localPath, publicId) {
    const compressedBuffer = await sharp(localPath)
        .resize({ width: 2000, withoutEnlargement: true })
        .webp({ quality: 80, effort: 4 })
        .toBuffer();

    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { public_id: publicId, resource_type: 'image', overwrite: false, format: 'webp' },
            (error, result) => {
                if (error) {
                    if (error.http_code === 400 && error.message?.includes('already exists')) {
                        resolve(`https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${publicId}.webp`);
                    } else {
                        reject(error);
                    }
                } else {
                    resolve(result.secure_url);
                }
            }
        );
        uploadStream.end(compressedBuffer);
    });
}

const log = {
    info: (...a) => console.log('ℹ️ ', ...a),
    ok: (...a) => console.log('✅', ...a),
    warn: (...a) => console.log('⚠️ ', ...a),
    error: (...a) => console.error('❌', ...a),
    step: (...a) => console.log('\n' + '─'.repeat(60) + '\n🔷', ...a),
    dry: (...a) => console.log('[DRY-RUN]', ...a),
};

// ─────────────────────────────────────────────────────────────
// STEP 1: PARSE CSV → LOCAL JSON
// ─────────────────────────────────────────────────────────────
// CSV column layout (0-indexed, single header row, data starts at row 1):
//   0  = No.
//   1  = Product Category  (e.g. "SOFA", "BED", "SIDE TABLE")
//   2  = Product Code      (e.g. "HSLSOGR1")
//   3  = etsy url
//   4  = Title
//   5  = Description
//   6  = Tag
//   7  = List update name  (skip)
//   8  = No. of Photos     (skip)
//   9  = price in dolles   (may be empty)
// ─────────────────────────────────────────────────────────────
async function runStep1() {
    log.step('STEP 1: Parsing CSV and Extracting Local Paths');

    if (!fs.existsSync(CSV_PATH)) return log.error(`CSV not found at:\n  ${CSV_PATH}`);
    if (!fs.existsSync(PHOTOS_DIR)) return log.error(`Photos directory not found at:\n  ${PHOTOS_DIR}`);

    const csvContent = fs.readFileSync(CSV_PATH, 'utf-8');
    const rows = parseCSV(csvContent);
    const folderMap = buildPhotoFolderMap();

    const productsData = [];
    let skipped = 0;

    // Row 0 is header; data starts at index 1
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length < 3) continue;

        const no = row[0]?.trim();
        const categoryRaw = row[1]?.trim();
        const productCode = row[2]?.trim();
        const title = row[4]?.trim();
        const desc = row[5]?.trim();
        const tagsRaw = row[6]?.trim();
        const priceRaw = row[9]?.trim();

        if (!no || no === '-') continue;
        if (!title && !productCode) continue;

        if (!productCode) {
            log.warn(`[No: ${no}] No product code, skipping.`);
            skipped++;
            continue;
        }

        // Match folder by row number (not product code)
        const folderName = folderMap[no];
        if (!folderName) {
            log.warn(`[No: ${no}] [${productCode}] No image folder found, skipping.`);
            skipped++;
            continue;
        }

        const localFolder = path.join(PHOTOS_DIR, folderName);

        function findMediaFiles(dir, exts) {
            let results = [];
            if (!fs.existsSync(dir)) return results;
            const items = fs.readdirSync(dir);
            for (const item of items) {
                const fullPath = path.join(dir, item);
                if (fs.statSync(fullPath).isDirectory()) {
                    results = results.concat(findMediaFiles(fullPath, exts));
                } else if (exts.test(item)) {
                    results.push(fullPath);
                }
            }
            return results;
        }

        const localImages = findMediaFiles(localFolder, /\.(jpg|jpeg|png|webp)$/i);
        const videoFiles = findMediaFiles(localFolder, /\.(mp4|mov)$/i);
        const localVideo = videoFiles.length > 0 ? videoFiles[0] : null;

        const priceUSD = parseUSD(priceRaw);

        let tags = tagsRaw ? tagsRaw.split(/[\n,]/).map(t => t.trim()).filter(Boolean) : [];
        if (!tags.includes('leather')) tags.push('leather');

        // Subcategory: title-case the CSV category (e.g. "SIDE TABLE" → "Side Table")
        const subcategoryName = categoryRaw
            ? categoryRaw.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
            : 'Other';

        productsData.push({
            no,
            productCode,
            slug: toSlug(title),
            shortName: title,
            title,
            desc: desc || title,
            tags,
            priceUSD,
            subcategoryName,
            localImages,
            localVideo,
            hasVideo: !!localVideo,
        });
    }

    log.ok(`Parsed ${productsData.length} products (skipped ${skipped}).`);
    fs.writeFileSync(STEP1_FILE, JSON.stringify(productsData, null, 2));
    log.ok(`Saved Step 1 data → ${STEP1_FILE}`);
}

// ─────────────────────────────────────────────────────────────
// STEP 2: UPLOAD IMAGES TO CLOUDINARY
// Cloudinary path: hs-global/leather/etsy/{productCode}/{filename}
// ─────────────────────────────────────────────────────────────
async function runStep2() {
    log.step('STEP 2: Cloudinary Upload (WebP)');

    if (!fs.existsSync(STEP1_FILE)) return log.error(`Step 1 JSON not found. Run --step=1 first.`);

    const productsData = JSON.parse(fs.readFileSync(STEP1_FILE, 'utf-8'));

    for (const prod of productsData) {
        log.info(`[${prod.productCode}] Uploading images for: ${prod.shortName}`);

        const cloudinaryUrls = [];

        for (const imgPath of prod.localImages) {
            const fileBase = path.basename(imgPath, path.extname(imgPath));
            const publicId = `hs-global/leather/etsy/${prod.productCode}/${fileBase}`;

            if (SKIP_UPLOAD) {
                cloudinaryUrls.push(`https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME || 'cloud_name'}/image/upload/${publicId}.webp`);
            } else {
                try {
                    const url = await uploadImage(imgPath, publicId);
                    cloudinaryUrls.push(url);
                } catch (err) {
                    log.warn(`Upload failed for ${imgPath}: ${err.message}`);
                }
            }
        }

        prod.cloudinaryUrls = cloudinaryUrls;
    }

    fs.writeFileSync(STEP2_FILE, JSON.stringify(productsData, null, 2));
    log.ok(`Saved Step 2 data → ${STEP2_FILE}`);
}

// ─────────────────────────────────────────────────────────────
// STEP 3: MIGRATE VIDEOS & INSERT TO MONGODB
// Video path: /videos/leather/{productCode}/video.mp4
// ─────────────────────────────────────────────────────────────
async function runStep3() {
    log.step('STEP 3: Database Insertion and Local Video Linking');

    if (!fs.existsSync(STEP2_FILE)) return log.error(`Step 2 JSON not found. Run --step=2 first.`);

    const productsData = JSON.parse(fs.readFileSync(STEP2_FILE, 'utf-8'));

    if (!DRY_RUN) {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hs_global_export';
        await mongoose.connect(uri);
        log.ok(`MongoDB connected: ${mongoose.connection.host}`);
        Product = mongoose.model('Product', productSchema);
        Category = mongoose.model('Category', categorySchema);

        log.warn('Deleting existing leather products...');
        const deleted = await Product.deleteMany({ category: 'leather' });
        log.ok(`Deleted ${deleted.deletedCount || 0} old leather products.`);
    }

    // Upsert subcategories into the leather category doc
    const subcategoriesToCreate = new Set(productsData.map(p => p.subcategoryName));

    if (!DRY_RUN) {
        let cat = await Category.findOne({ categoryId: 'leather' });
        if (!cat) cat = new Category({ categoryId: 'leather', categoryName: 'Leather', customSubcategories: [] });

        const oldCount = Array.isArray(cat.customSubcategories) ? cat.customSubcategories.length : 0;
        cat.customSubcategories = [];
        if (oldCount > 0) log.ok(`Cleared ${oldCount} old subcategories.`);

        for (const sub of subcategoriesToCreate) {
            const subId = toSlug(sub);
            cat.customSubcategories.push({ id: subId, name: sub, isCustom: true });
            log.info(`  Subcategory: ${sub}`);
        }
        await cat.save();
    }

    for (const prod of productsData) {
        log.info(`[${prod.productCode}] Inserting: ${prod.shortName}`);

        let videoWebUrl = null;
        let videoFilename = null;

        if (prod.hasVideo && prod.localVideo) {
            const sourceExists = fs.existsSync(prod.localVideo);
            if (!sourceExists) {
                log.warn(`Video file not found for ${prod.productCode}, skipping video.`);
            } else {
                const destFolder = path.join(FRONTEND_VIDEOS_DIR, prod.productCode);
                const destPath = path.join(destFolder, 'video.mp4');
                videoWebUrl = `/videos/leather/${prod.productCode}/video.mp4`;
                videoFilename = 'video.mp4';

                if (!DRY_RUN) {
                    try {
                        if (!fs.existsSync(destFolder)) fs.mkdirSync(destFolder, { recursive: true });
                        fs.copyFileSync(prod.localVideo, destPath);
                        log.ok(`  Video → ${videoWebUrl}`);
                    } catch (err) {
                        log.warn(`  Video copy failed: ${err.message}`);
                        videoWebUrl = null;
                        videoFilename = null;
                    }
                }
            }
        }

        const pDoc = {
            productId: prod.slug,
            productCode: prod.productCode || '',
            name: prod.shortName,
            title: prod.title,
            category: 'leather',
            subcategory: prod.subcategoryName,
            description: prod.desc,
            image: prod.cloudinaryUrls[0] || '',
            images: prod.cloudinaryUrls,
            sortedImages: prod.cloudinaryUrls,
            priceUSD: prod.priceUSD,
            available: true,
            hasVideo: !!(videoWebUrl),
            videoUrl: videoWebUrl,
            videoFilename,
            status: 'active',
            tags: prod.tags,
            seoTitle: `${prod.shortName} | HS Global Export`,
            seoDescription: prod.desc ? prod.desc.substring(0, 160) : '',
            seoKeywords: prod.tags,
            shipping: {
                requiresShipping: true,
                shippingClass: 'standard',
                handlingTime: '15-20 business days',
            },
            manufacturing: {
                isCustomMade: true,
                countryOfOrigin: 'India',
            },
        };

        if (!DRY_RUN) {
            await Product.updateOne({ productId: prod.slug }, { $set: pDoc }, { upsert: true });
            log.ok(`  Saved: ${prod.shortName}`);
        } else {
            log.dry(`Would insert/update ${prod.productCode} → ${prod.slug}`);
        }
    }

    if (!DRY_RUN) {
        await mongoose.connection.close();
        log.ok('DB connection closed.');
    }
    log.ok('Step 3 complete.');
}

async function main() {
    if (DRY_RUN) log.dry('Running in DRY-RUN mode — no writes.');

    if (STEP === '1') await runStep1();
    else if (STEP === '2') await runStep2();
    else if (STEP === '3') await runStep3();
    else log.error('Invalid step. Use --step=1, --step=2, or --step=3');
}

main().catch(err => {
    log.error('Fatal:', err);
    process.exit(1);
});
