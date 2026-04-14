#!/usr/bin/env node
/**
 * ============================================================
 * Etsy Products Migration Script (3-Step Process)
 * ============================================================
 * 
 * USAGE:
 *   cd backend
 *   node scripts/migrate-etsy-products.js --step=1
 *   node scripts/migrate-etsy-products.js --step=2
 *   node scripts/migrate-etsy-products.js --step=3
 * 
 * FLAGS:
 *   --dry-run       : Test the script without writing to Cloudinary/DB
 *   --skip-upload   : (Step 2) Skips actual upload, generates mock CDN urls
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const sharp = require('sharp');

// Load .env
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const SKIP_UPLOAD = args.includes('--skip-upload') || DRY_RUN;
const STEP = args.find(a => a.startsWith('--step='))?.split('=')[1] || '1';

const ROOT = path.join(__dirname, '../..');
const CSV_PATH = path.join(ROOT, 'new products', 'Latest Etsy All Product Title Desc   - Sheet1 (1).csv');
const PHOTOS_DIR = path.join(ROOT, 'new products', 'Etsy All Product Photos');
const FRONTEND_VIDEOS_DIR = path.join(ROOT, 'frontend', 'public', 'videos', 'etsy');

const STEP1_FILE = path.join(__dirname, 'etsy-products-data-step1.json');
const STEP2_FILE = path.join(__dirname, 'etsy-products-data-step2.json');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const productSchema = new mongoose.Schema({}, { strict: false, timestamps: true });
const categorySchema = new mongoose.Schema({}, { strict: false });
let Product, Category;

const toSlug = (str) => str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function stripDesignForAgesBranding(text) {
    if (!text) return '';
    return String(text)
        .replace(/\r\n/g, '\n')
        .replace(/\n?\s*-{3,}\s*\n\s*\|\s*design\s*for\s*ages\b/gi, '')
        .replace(/\s*\|\s*design\s*for\s*ages\b/gi, '')
        .replace(/\bdesign\s*for\s*ages\b/gi, '')
        .replace(/\bdesignforages\b/gi, '')
        .replace(/\s{2,}/g, ' ')
        .trim();
}

function cleanTags(tags) {
    if (!Array.isArray(tags)) return [];
    return tags
        .map(t => stripDesignForAgesBranding(t).trim())
        .filter(Boolean)
        .filter(t => !/^design\s*for\s*ages$/i.test(t) && !/^designforages$/i.test(t));
}

function buildPhotoFolderMap() {
    if (!fs.existsSync(PHOTOS_DIR)) return {};

    const folders = fs.readdirSync(PHOTOS_DIR).filter(f => {
        const fullPath = path.join(PHOTOS_DIR, f);
        return fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory();
    });

    const folderMap = {};
    for (const f of folders) {
        const match = f.match(/^(\d+)\./);
        if (match) folderMap[match[1]] = f;
    }
    return folderMap;
}

function resolveVideoSourcePath(localVideoPath, productNo, folderMap) {
    if (localVideoPath && fs.existsSync(localVideoPath)) return localVideoPath;

    if (localVideoPath) {
        const normalized = localVideoPath.replace(/\\/g, '/');
        const marker = '/Etsy All Product Photos/';
        const markerIndex = normalized.indexOf(marker);

        if (markerIndex >= 0) {
            const relPart = normalized.substring(markerIndex + marker.length);
            const mappedPath = path.join(PHOTOS_DIR, ...relPart.split('/'));
            if (fs.existsSync(mappedPath)) return mappedPath;
        }
    }

    const folderName = folderMap[productNo];
    if (!folderName) return null;

    const folderPath = path.join(PHOTOS_DIR, folderName);
    if (!fs.existsSync(folderPath)) return null;

    const videoFiles = fs.readdirSync(folderPath).filter(f => /\.(mp4|mov)$/i.test(f));
    if (videoFiles.length === 0) return null;

    return path.join(folderPath, videoFiles[0]);
}

const log = {
    info: (...a) => console.log('ℹ️ ', ...a),
    ok: (...a) => console.log('✅', ...a),
    warn: (...a) => console.log('⚠️ ', ...a),
    error: (...a) => console.error('❌', ...a),
    step: (...a) => console.log('\n' + '─'.repeat(60) + '\n🔷', ...a),
    dry: (...a) => console.log('[DRY-RUN]', ...a),
};

// RFC 4180 strict CSV parser
function parseCSV(str) {
    const arr = [];
    let quote = false;
    for (let row = 0, col = 0, c = 0; c < str.length; c++) {
        let cc = str[c], nc = str[c + 1];
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

function extractSubcategory(productName) {
    const lowerName = productName.toLowerCase();
    if (lowerName.includes('side table') || lowerName.includes('end table')) return 'Side Table';
    if (lowerName.includes('coffee table') || lowerName.includes('center table')) return 'Center Table';
    if (lowerName.includes('console table') || lowerName.includes('entryway table')) return 'Console Table';
    if (lowerName.includes('dining table')) return 'Dining Table';
    if (lowerName.includes('sink') || lowerName.includes('basin')) return 'Wash Basin';
    if (lowerName.includes('bathtub') || lowerName.includes('bath')) return 'Bathtub';
    if (lowerName.includes('lamp') || lowerName.includes('lighting')) return 'Lamp';
    if (lowerName.includes('tray') || lowerName.includes('bowl') || 
        lowerName.includes('vase') || lowerName.includes('sculpture') || 
        lowerName.includes('clock') || lowerName.includes('art') || 
        lowerName.includes('mirror')) return 'Decor';

    return 'Other Furniture';
}

async function uploadImage(localPath, publicId) {
    try {
        const compressedBuffer = await sharp(localPath)
            .resize({ width: 2000, withoutEnlargement: true })
            .webp({ quality: 80, effort: 4 })
            .toBuffer();

        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    public_id: publicId,
                    resource_type: 'image',
                    overwrite: false,
                    format: 'webp',
                },
                (error, result) => {
                    if (error) {
                        if (error.http_code === 400 && error.message && error.message.includes('already exists')) {
                            resolve(`https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME || 'cloud_name'}/image/upload/${publicId}.webp`);
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
    } catch (err) {
        log.error(`Sharp compression failed for ${localPath}:`, err.message);
        throw err;
    }
}

// ─────────────────────────────────────────────────────────────
// STEP 1: PARSE CSV AND BUILD LOCAL JSON DATASET
// ─────────────────────────────────────────────────────────────
async function runStep1() {
    log.step('STEP 1: Parsing CSV and Extacting Local Paths');

    if (!fs.existsSync(CSV_PATH)) return log.error(`CSV not found at ${CSV_PATH}`);
    if (!fs.existsSync(PHOTOS_DIR)) return log.error(`Photos directory not found at ${PHOTOS_DIR}`);

    const csvContent = fs.readFileSync(CSV_PATH, 'utf-8');
    const rows = parseCSV(csvContent);

    // Map photo folders
    const folderMap = buildPhotoFolderMap();

    const productsData = [];

    for (let i = 2; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length < 6) continue;

        const no = row[2]?.trim();
        const priceRaw = row[4]?.trim();
        const shortName = row[5]?.trim();
        const title = row[6]?.trim();
        let desc = row[7]?.trim();
        let tagsRaw = row[8]?.trim();

        if (!no || !shortName || no === '-') continue;

        const folder = folderMap[no];
        const localFolder = folder ? path.join(PHOTOS_DIR, folder) : null;

        let localImages = [];
        let localVideo = null;
        
        if (localFolder && fs.existsSync(localFolder)) {
            const files = fs.readdirSync(localFolder);
            localImages = files
                .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
                .map(f => path.join(localFolder, f));
                
            const videoFiles = files
                .filter(f => /\.(mp4|mov)$/i.test(f))
                .map(f => path.join(localFolder, f));
                
            if (videoFiles.length > 0) localVideo = videoFiles[0];
        } else {
            log.warn(`No image folder found for No: ${no} - ${shortName}`);
        }

        const subCategoryName = extractSubcategory(shortName);
        let tags = tagsRaw ? tagsRaw.split(/[\n,]/).map(t => t.trim()).filter(Boolean) : [];
        if (!tags.includes('etsy')) tags.push('etsy');

        let priceINR = null;
        if (priceRaw && priceRaw.includes('₹')) {
            const numStr = priceRaw.replace(/[^0-9]/g, '');
            if (numStr) priceINR = parseInt(numStr, 10);
        }

        productsData.push({
            no,
            slug: toSlug(shortName),
            shortName,
            title,
            desc: desc || title,
            tags,
            priceINR,
            subCategoryName,
            localImages,
            localVideo,
            hasVideo: !!localVideo
        });
    }

    log.ok(`Parsed ${productsData.length} valid products.`);
    
    fs.writeFileSync(STEP1_FILE, JSON.stringify(productsData, null, 2));
    log.ok(`Saved Step 1 data to -> ${STEP1_FILE}`);
}

// ─────────────────────────────────────────────────────────────
// STEP 2: UPLOAD IMAGES TO CLOUDINARY & UPDATE JSON
// ─────────────────────────────────────────────────────────────
async function runStep2() {
    log.step('STEP 2: Cloudinary Upload (Optimized WebP)');

    if (!fs.existsSync(STEP1_FILE)) return log.error(`Step 1 JSON not found. Run --step=1 first.`);
    
    const productsData = JSON.parse(fs.readFileSync(STEP1_FILE, 'utf-8'));
    
    for (const prod of productsData) {
        log.info(`[No: ${prod.no}] Uploading images for: ${prod.slug}`);
        
        const cloudinaryUrls = [];
        
        for (let i = 0; i < prod.localImages.length; i++) {
            const imgPath = prod.localImages[i];
            const fileBase = path.basename(imgPath, path.extname(imgPath));
            const publicId = `hs-global/furniture/etsy/${prod.slug}/${fileBase}`;

            if (SKIP_UPLOAD) {
                cloudinaryUrls.push(`https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME || 'cloud_name'}/image/upload/${publicId}.webp`);
            } else if (!DRY_RUN) {
                const url = await uploadImage(imgPath, publicId);
                cloudinaryUrls.push(url);
            }
        }
        
        prod.cloudinaryUrls = cloudinaryUrls;
    }

    if (!DRY_RUN || SKIP_UPLOAD) {
        fs.writeFileSync(STEP2_FILE, JSON.stringify(productsData, null, 2));
        log.ok(`Saved Step 2 data to -> ${STEP2_FILE}`);
    } else {
        log.dry(`Would save uploaded URLs to Step 2 JSON.`);
    }
}

// ─────────────────────────────────────────────────────────────
// STEP 3: MIGRATE VIDEOS & INSERT TO MONGODB
// ─────────────────────────────────────────────────────────────
async function runStep3() {
    log.step('STEP 3: Database Insertion and Local Video Linking');

    if (!fs.existsSync(STEP2_FILE)) return log.error(`Step 2 JSON not found. Run --step=2 first.`);
    const productsData = JSON.parse(fs.readFileSync(STEP2_FILE, 'utf-8'));
    const folderMap = buildPhotoFolderMap();

    if (!DRY_RUN) {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hs_global_export';
        await mongoose.connect(uri);
        log.ok(`MongoDB connected: ${mongoose.connection.host}`);
        Product = mongoose.model('Product', productSchema);
        Category = mongoose.model('Category', categorySchema);

        log.warn('Cleaning old Etsy products and Furniture custom subcategories...');
        const deletedProducts = await Product.deleteMany({ tags: 'etsy' });
        log.ok(`Deleted old Etsy products: ${deletedProducts.deletedCount || 0}`);
    }

    // Ensure Custom Subcategories
    const subCategoriesToCreate = new Set(productsData.map(p => p.subCategoryName));
    if (!DRY_RUN) {
        let cat = await Category.findOne({ categoryId: 'furniture' });
        if (!cat) cat = new Category({ categoryId: 'furniture', categoryName: 'Furniture', customSubcategories: [] });

        const existingCount = Array.isArray(cat.customSubcategories) ? cat.customSubcategories.length : 0;
        cat.customSubcategories = [];
        if (existingCount > 0) log.ok(`Deleted old custom subcategories: ${existingCount}`);

        for (const sub of subCategoriesToCreate) {
            const subId = toSlug(sub);
            if (!cat.customSubcategories.some(s => s.id === subId)) {
                cat.customSubcategories.push({ id: subId, name: sub, isCustom: true });
                log.info(`Added missing category: ${sub}`);
            }
        }
        await cat.save();
    }

    for (const prod of productsData) {
        log.info(`[No: ${prod.no}] Inserting Database Record: ${prod.slug}`);

        const cleanedName = stripDesignForAgesBranding(prod.shortName);
        const cleanedTitle = stripDesignForAgesBranding(prod.title || prod.shortName);
        const cleanedDesc = stripDesignForAgesBranding(prod.desc || '');
        const cleanedTags = cleanTags(prod.tags);

        let videoWebUrl = null;
        let videoFilename = null;

        // Copy video physically if it exists
        if (prod.hasVideo) {
            const sourceVideoPath = resolveVideoSourcePath(prod.localVideo, prod.no, folderMap);

            if (!sourceVideoPath) {
                log.warn(`Video not found for ${prod.slug}. Skipping video copy.`);
                prod.hasVideo = false;
            }

            const destFolder = path.join(FRONTEND_VIDEOS_DIR, prod.slug);
            const destPath = path.join(destFolder, 'video.mp4');
            videoWebUrl = `/videos/etsy/${prod.slug}/video.mp4`;
            videoFilename = 'video.mp4';

            if (!DRY_RUN && sourceVideoPath) {
                try {
                    if (!fs.existsSync(destFolder)) fs.mkdirSync(destFolder, { recursive: true });
                    fs.copyFileSync(sourceVideoPath, destPath);
                    log.ok(`-> Copied local video to ${videoWebUrl}`);
                } catch (copyErr) {
                    log.warn(`Video copy failed for ${prod.slug}: ${copyErr.message}`);
                    prod.hasVideo = false;
                }
            }

            if (!prod.hasVideo) {
                videoWebUrl = null;
                videoFilename = null;
            }
        }

        const pDoc = {
            productId: prod.slug,
            name: cleanedName,
            title: cleanedTitle,
            category: 'furniture',
            subcategory: prod.subCategoryName,
            description: cleanedDesc,
            image: prod.cloudinaryUrls[0] || '',
            images: prod.cloudinaryUrls,
            sortedImages: prod.cloudinaryUrls,
            priceINR: prod.priceINR,
            available: true,
            hasVideo: prod.hasVideo,
            videoUrl: videoWebUrl,
            videoFilename: videoFilename,
            status: 'active',
            tags: cleanedTags,
            seoTitle: `${cleanedName} | HS Global Export`,
            seoDescription: cleanedDesc ? cleanedDesc.substring(0, 160) : '',
            seoKeywords: cleanedTags,
            shipping: { requiresShipping: true, shippingClass: 'fragile', handlingTime: '15-20 business days' },
            manufacturing: { isCustomMade: true, countryOfOrigin: 'India' }
        };

        if (!DRY_RUN) {
            await Product.updateOne({ productId: prod.slug }, { $set: pDoc }, { upsert: true });
            log.ok(`-> Saved DB Record: ${cleanedName}`);
        } else {
            log.dry(`Would Insert/Update DB record for ${prod.slug}`);
        }
    }

    if (!DRY_RUN) {
        await mongoose.connection.close();
        log.ok('DB Connection closed');
    }
    log.ok('Step 3 completion successful!');
}

async function main() {
    if (DRY_RUN) log.dry('Running in DRY-RUN mode');
    
    if (STEP === '1') await runStep1();
    else if (STEP === '2') await runStep2();
    else if (STEP === '3') await runStep3();
    else log.error('Invalid step! Use --step=1, --step=2, or --step=3');
}

main().catch(err => {
    log.error('Fatal error:', err);
    process.exit(1);
});
