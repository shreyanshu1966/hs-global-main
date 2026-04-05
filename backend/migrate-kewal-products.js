#!/usr/bin/env node
/**
 * ============================================================
 * Kewal Products Migration  —  3-Step Script
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
 * STEP 3  →  Price Update (2-stage supported)
 *   Direct mode:
 *     node migrate-kewal-products.js --step=3
 *   Stage A (prepare plan JSON from CSV + DB):
 *     node migrate-kewal-products.js --step=3 --price-mode=prepare
 *   Stage B (apply plan JSON on server):
 *     node migrate-kewal-products.js --step=3 --price-mode=apply
 *
 *   Optional args:
 *     --csv="../Kewal 19-03-2026/Latest Etsy All Product Title Desc   - Sheet1.csv"
 *     --plan="../scripts/kewal-price-update-plan.json"
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
 *   node migrate-kewal-products.js --step=3
 * ============================================================
 */

'use strict';

const fs       = require('fs');
const path     = require('path');
const os       = require('os');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const sharp    = require('sharp');
const { parse: parseCsv } = require('csv-parse/sync');

require('dotenv').config({ path: path.join(__dirname, '.env') });

// ─── CLI ───────────────────────────────────────────────────────────────────────
const args       = process.argv.slice(2);
const STEP       = (() => { const s = args.find(a => a.startsWith('--step=')); return s ? parseInt(s.split('=')[1]) : null; })();
const DRY_RUN    = args.includes('--dry-run');
const SKIP_DELETE = args.includes('--skip-delete');
const PRICE_MODE = (() => {
    const m = args.find(a => a.startsWith('--price-mode='));
    return m ? m.split('=')[1].trim().toLowerCase() : 'direct';
})();
const CSV_ARG    = (() => {
    const csvArg = args.find(a => a.startsWith('--csv='));
    if (!csvArg) return null;
    const raw = csvArg.slice('--csv='.length).trim().replace(/^"|"$/g, '');
    return path.isAbsolute(raw) ? raw : path.resolve(__dirname, raw);
})();
const PLAN_ARG   = (() => {
    const planArg = args.find(a => a.startsWith('--plan='));
    if (!planArg) return null;
    const raw = planArg.slice('--plan='.length).trim().replace(/^"|"$/g, '');
    return path.isAbsolute(raw) ? raw : path.resolve(__dirname, raw);
})();

if (!STEP || (STEP !== 1 && STEP !== 2 && STEP !== 3)) {
    console.error('\n❌  Please specify a step:\n');
    console.error('   node migrate-kewal-products.js --step=1   (upload images → save JSON)');
    console.error('   node migrate-kewal-products.js --step=2   (import JSON → MongoDB)');
    console.error('   node migrate-kewal-products.js --step=3   (read CSV prices → update MongoDB)\n');
    process.exit(1);
}

if (STEP === 3 && !['direct', 'prepare', 'apply'].includes(PRICE_MODE)) {
    console.error('\n❌ Invalid --price-mode. Use one of: direct, prepare, apply\n');
    process.exit(1);
}

// ─── PATHS ────────────────────────────────────────────────────────────────────
const ROOT         = path.join(__dirname, '..');
const KEWAL_DIR    = path.join(ROOT, 'Kewal 19-03-2026');
const VIDEO_DIR    = path.join(ROOT, 'frontend', 'public', 'videos');
const JSON_DB_FILE = path.join(ROOT, 'scripts', 'kewal-migration-db.json');
const PRICE_CSV_FILE = path.join(KEWAL_DIR, 'Latest Etsy All Product Title Desc   - Sheet1.csv');
const PRICE_PLAN_FILE = path.join(ROOT, 'scripts', 'kewal-price-update-plan.json');
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

const normalizeHeader = (s) => (s || '')
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const tokenize = (s) => normalize(s)
    .split(' ')
    .filter(w => w && w.length >= 3 && !['designforages', 'design', 'ages'].includes(w));

function parseINR(value) {
    if (value === null || value === undefined) return null;
    const raw = String(value).trim();
    if (!raw) return null;
    const upper = raw.toUpperCase();
    if (upper === 'NA' || upper === 'N/A' || upper === 'NONE' || upper === '-') return null;

    const numeric = raw.replace(/[^0-9.]/g, '');
    if (!numeric) return null;
    const parsed = Number.parseFloat(numeric);
    if (!Number.isFinite(parsed) || parsed <= 0) return null;

    const rounded = Math.round(parsed);
    // Guard against malformed CSV values (e.g., concatenated comma chunks producing absurd prices).
    if (rounded < 1000 || rounded > 2000000) return null;
    return rounded;
}

function extractEtsySlug(urlValue) {
    if (!urlValue) return null;
    const input = String(urlValue).trim();
    if (!input) return null;
    const match = input.match(/\/listing\/\d+\/([^/?#]+)/i);
    if (!match || !match[1]) return null;
    return toSlug(match[1]);
}

function normalizeCsvRowKeys(row) {
    const out = {};
    for (const [key, value] of Object.entries(row || {})) {
        const cleanedKey = normalizeHeader(key);
        if (!cleanedKey) continue;
        out[cleanedKey] = typeof value === 'string' ? value.trim() : value;
    }
    return out;
}

function loadCsvRows(csvText) {
    const matrix = parseCsv(csvText, {
        columns: false,
        skip_empty_lines: false,
        relax_column_count: true,
        bom: true,
    });

    if (!Array.isArray(matrix) || matrix.length < 2) return [];

    const headerRow = (matrix[0] || []).map(v => (v || '').toString().trim());
    const secondRow = (matrix[1] || []).map(v => (v || '').toString().trim());

    // Some sheets place "Price" in row 2 under an empty header cell.
    let mergedHeader = [...headerRow];
    let consumedSecondHeaderRow = false;
    for (let i = 0; i < mergedHeader.length; i++) {
        if (!mergedHeader[i] && secondRow[i]) {
            mergedHeader[i] = secondRow[i];
            consumedSecondHeaderRow = true;
        }
    }

    const dataStart = consumedSecondHeaderRow ? 2 : 1;
    const rows = [];

    for (let r = dataStart; r < matrix.length; r++) {
        const arr = matrix[r] || [];
        const rowObj = {};
        let hasAnyValue = false;

        for (let c = 0; c < mergedHeader.length; c++) {
            const key = mergedHeader[c] || `col_${c}`;
            const value = (arr[c] || '').toString();
            if (value.trim()) hasAnyValue = true;
            rowObj[key] = value;
        }

        if (hasAnyValue) rows.push(normalizeCsvRowKeys(rowObj));
    }

    return rows;
}

function rowField(row, keys) {
    for (const key of keys) {
        if (Object.prototype.hasOwnProperty.call(row, key)) return row[key];
    }
    return undefined;
}

function makeNameScore(candidateTokens, productTokens) {
    if (!candidateTokens.length || !productTokens.length) {
        return {
            score: 0,
            hit: 0,
            candidateCoverage: 0,
            productCoverage: 0,
        };
    }

    const cand = new Set(candidateTokens);
    const prod = new Set(productTokens);
    let hit = 0;
    for (const token of cand) {
        if (prod.has(token)) hit++;
    }

    const candidateCoverage = hit / cand.size;
    const productCoverage = hit / prod.size;
    const score = (productCoverage * 0.65) + (candidateCoverage * 0.35);
    return {
        score,
        hit,
        candidateCoverage,
        productCoverage,
    };
}

function findCsvProductMatch({ row, catalog, byProductId, byName }) {
    const price = parseINR(rowField(row, ['price']));
    if (!price) return { status: 'skip-no-price' };

    const etsySlug = extractEtsySlug(rowField(row, ['url']));
    if (etsySlug && byProductId.has(etsySlug)) {
        return { status: 'matched', product: byProductId.get(etsySlug), price, strategy: 'url-slug' };
    }

    const shortName = rowField(row, ['short product name']);
    const title = rowField(row, ['title']);
    const candidates = [shortName, title].filter(Boolean);
    if (etsySlug) candidates.push(etsySlug.replace(/-/g, ' '));

    for (const candidate of candidates) {
        const key = normalize(candidate);
        if (byName.has(key)) {
            return { status: 'matched', product: byName.get(key), price, strategy: 'exact-name' };
        }
    }

    let best = null;
    for (const candidate of candidates) {
        const candidateTokens = tokenize(candidate);
        if (candidateTokens.length < 2) continue;

        for (const product of catalog) {
            const metrics = makeNameScore(candidateTokens, product._tokens);
            const score = metrics.score;
            if (!best || score > best.score) {
                best = { product, score, metrics };
            }
        }
    }

    if (
        best &&
        best.score >= 0.74 &&
        best.metrics.hit >= 3 &&
        best.metrics.productCoverage >= 0.9 &&
        best.metrics.candidateCoverage >= 0.34
    ) {
        return {
            status: 'matched',
            product: best.product,
            price,
            strategy: `fuzzy:${best.score.toFixed(2)}:${best.metrics.hit}t`,
        };
    }

    return {
        status: 'unmatched',
        price,
        hint: {
            no: rowField(row, ['no']),
            url: rowField(row, ['url']),
            shortName,
            title,
        },
    };
}

function getBestRowToProductScore(row, product) {
    const rowPrice = parseINR(rowField(row, ['price']));
    if (!rowPrice) return null;

    const etsySlug = extractEtsySlug(rowField(row, ['url']));
    if (etsySlug && etsySlug === product.productId) {
        return { score: 2, strategy: 'url-slug', price: rowPrice };
    }

    const shortName = rowField(row, ['short product name']);
    const title = rowField(row, ['title']);
    const candidates = [shortName, title].filter(Boolean);
    if (etsySlug) candidates.push(etsySlug.replace(/-/g, ' '));

    if (!candidates.length) return null;

    let best = null;
    for (const c of candidates) {
        const candidateTokens = tokenize(c);
        if (candidateTokens.length < 2) continue;
        const metrics = makeNameScore(candidateTokens, product._tokens);
        if (!best || metrics.score > best.metrics.score) {
            best = { metrics };
        }
    }

    if (!best) return null;
    return {
        score: best.metrics.score,
        strategy: `fuzzy:${best.metrics.score.toFixed(2)}:${best.metrics.hit}t`,
        price: rowPrice,
    };
}

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

// ════════════════════════════════════════════════════════════════════════════════
//  STEP 3  —  CSV PRICES → MONGODB UPDATE
// ════════════════════════════════════════════════════════════════════════════════
async function runStep3() {
    console.log('\n' + '═'.repeat(62));
    console.log('🚀  STEP 3  —  Price Update Workflow');
    console.log('═'.repeat(62));
    if (DRY_RUN) console.log('🟡  DRY-RUN: reads data but does not update MongoDB');
    console.log(`🧭  Mode: ${PRICE_MODE}`);
    console.log('');

    const planPath = PLAN_ARG || PRICE_PLAN_FILE;

    if (PRICE_MODE === 'apply') {
        if (!fs.existsSync(planPath)) {
            log.error(`Price plan file not found: ${planPath}`);
            log.error('Run Step 3 with --price-mode=prepare first.');
            process.exit(1);
        }

        const plan = JSON.parse(fs.readFileSync(planPath, 'utf8'));
        const updates = Array.isArray(plan.updates) ? plan.updates : [];
        log.ok(`Loaded price plan: ${updates.length} updates`);

        await connectDB();

        const stats = {
            rows: Number(plan.summary?.rows || 0),
            noPrice: Number(plan.summary?.noPrice || 0),
            matched: updates.length,
            unmatched: Number(plan.summary?.unmatched || 0),
            duplicateMatches: Number(plan.summary?.duplicateMatches || 0),
            dbUpdated: 0,
            dbMissing: 0,
            dbUnchanged: 0,
            errors: 0,
        };

        for (const item of updates) {
            try {
                const product = await Product.findOne({ productId: item.productId })
                    .select('_id productId name priceINR')
                    .lean();

                if (!product) {
                    stats.dbMissing++;
                    log.warn(`DB product missing: ${item.productId}`);
                    continue;
                }

                const nextPrice = Number(item.priceINR);
                const oldPrice = Number(product.priceINR) || 0;

                if (oldPrice === nextPrice) {
                    stats.dbUnchanged++;
                    log.info(`No change: ${item.productId} already ₹${nextPrice.toLocaleString('en-IN')}`);
                    continue;
                }

                if (DRY_RUN) {
                    log.dry(`${item.productId} [${item.strategy || 'plan'}] ₹${oldPrice} → ₹${nextPrice.toLocaleString('en-IN')}`);
                    continue;
                }

                await Product.updateOne(
                    { _id: product._id },
                    {
                        $set: {
                            priceINR: nextPrice,
                            updatedAt: new Date(),
                        },
                    }
                );
                stats.dbUpdated++;
                log.ok(`Updated ${item.productId} [${item.strategy || 'plan'}] ₹${oldPrice} → ₹${nextPrice.toLocaleString('en-IN')}`);
            } catch (err) {
                stats.errors++;
                log.error(`Failed updating ${item.productId}: ${err.message}`);
            }
        }

        await mongoose.connection.close();

        console.log('\n' + '═'.repeat(62));
        console.log('📊  STEP 3 SUMMARY');
        console.log('═'.repeat(62));
        console.log(`  CSV rows            : ${stats.rows}`);
        console.log(`  Rows without price  : ${stats.noPrice}`);
        console.log(`  Matched to products : ${stats.matched}`);
        console.log(`  Unmatched rows      : ${stats.unmatched}`);
        console.log(`  Duplicate matches   : ${stats.duplicateMatches}`);
        console.log(`  DB updated          : ${stats.dbUpdated}`);
        console.log(`  DB unchanged        : ${stats.dbUnchanged}`);
        console.log(`  DB missing          : ${stats.dbMissing}`);
        console.log(`  Errors              : ${stats.errors}`);
        console.log('═'.repeat(62));

        if (stats.errors === 0) log.ok('Step 3 apply complete.');
        else log.warn(`Step 3 apply finished with ${stats.errors} errors.`);
        return;
    }

    const csvPath = CSV_ARG || PRICE_CSV_FILE;
    if (!fs.existsSync(csvPath)) {
        log.error(`CSV file not found: ${csvPath}`);
        process.exit(1);
    }

    const csvText = fs.readFileSync(csvPath, 'utf8');
    const rows = loadCsvRows(csvText);

    log.ok(`Loaded CSV rows: ${rows.length}`);

    await connectDB();

    const dbProducts = await Product.find({
        productId: { $exists: true, $ne: null },
        name: { $exists: true, $ne: null },
    }).select('_id productId name category subcategory priceINR').lean();

    const catalog = dbProducts.map((p) => ({
        _id: p._id,
        productId: p.productId,
        name: p.name,
        category: p.category,
        subcategory: p.subcategory,
        priceINR: p.priceINR,
        _normalizedName: normalize(p.name),
        _tokens: tokenize(p.name),
    }));

    log.ok(`Loaded DB products: ${catalog.length}`);

    const stats = {
        rows: rows.length,
        noPrice: 0,
        matched: 0,
        unmatched: 0,
        duplicateMatches: 0,
        dbUpdated: 0,
        dbMissing: 0,
        dbUnchanged: 0,
        errors: 0,
    };

    const pricedRows = [];
    const unpricedRows = [];
    for (const row of rows) {
        if (parseINR(rowField(row, ['price']))) pricedRows.push(row);
        else unpricedRows.push(row);
    }
    stats.noPrice = unpricedRows.length;

    const edges = [];
    for (let pIndex = 0; pIndex < catalog.length; pIndex++) {
        const product = catalog[pIndex];
        for (let rIndex = 0; rIndex < pricedRows.length; rIndex++) {
            const row = pricedRows[rIndex];
            const scored = getBestRowToProductScore(row, product);
            if (!scored) continue;
            // Keep even low fuzzy scores so every product can receive a best candidate.
            if (scored.score > 0) {
                edges.push({
                    pIndex,
                    rIndex,
                    score: scored.score,
                    strategy: scored.strategy,
                    price: scored.price,
                });
            }
        }
    }

    edges.sort((a, b) => b.score - a.score);

    const assignedProducts = new Set();
    const assignedRows = new Set();
    const assignments = [];

    for (const edge of edges) {
        if (assignedProducts.has(edge.pIndex) || assignedRows.has(edge.rIndex)) continue;
        assignedProducts.add(edge.pIndex);
        assignedRows.add(edge.rIndex);
        assignments.push(edge);
        if (assignedProducts.size === catalog.length) break;
    }

    // Second pass: assign any still-unmatched products to the best remaining priced row.
    // This ensures maximum coverage when greedy top-score allocation leaves gaps.
    if (assignedProducts.size < catalog.length && assignedRows.size < pricedRows.length) {
        const unmatchedProductIndexes = [];
        for (let i = 0; i < catalog.length; i++) {
            if (!assignedProducts.has(i)) unmatchedProductIndexes.push(i);
        }

        for (const pIndex of unmatchedProductIndexes) {
            let bestFallback = null;
            for (let rIndex = 0; rIndex < pricedRows.length; rIndex++) {
                if (assignedRows.has(rIndex)) continue;
                const scored = getBestRowToProductScore(pricedRows[rIndex], catalog[pIndex]);
                if (!scored) continue;
                const candidate = {
                    pIndex,
                    rIndex,
                    score: scored.score,
                    strategy: `fallback:${scored.strategy}`,
                    price: scored.price,
                };
                if (!bestFallback || candidate.score > bestFallback.score) {
                    bestFallback = candidate;
                }
            }

            if (bestFallback) {
                assignedProducts.add(bestFallback.pIndex);
                assignedRows.add(bestFallback.rIndex);
                assignments.push(bestFallback);
            }
        }
    }

    stats.matched = assignments.length;
    stats.unmatched = catalog.length - assignments.length;
    stats.duplicateMatches = pricedRows.length - assignedRows.size;

    if (PRICE_MODE === 'prepare') {
        const updates = assignments.map((a) => {
            const product = catalog[a.pIndex];
            return {
                productId: product.productId,
                name: product.name,
                priceINR: a.price,
                strategy: a.strategy,
                score: Number(a.score?.toFixed ? a.score.toFixed(4) : a.score),
            };
        });

        const plan = {
            meta: {
                generatedAt: new Date().toISOString(),
                mode: 'prepare',
                csvPath,
                dbHost: mongoose.connection.host,
                dbName: mongoose.connection.name,
                totalDbProducts: catalog.length,
            },
            summary: {
                rows: stats.rows,
                noPrice: stats.noPrice,
                matched: stats.matched,
                unmatched: stats.unmatched,
                duplicateMatches: stats.duplicateMatches,
            },
            updates,
        };

        if (DRY_RUN) {
            log.dry(`Would write plan file: ${planPath}`);
        } else {
            fs.mkdirSync(path.dirname(planPath), { recursive: true });
            fs.writeFileSync(planPath, JSON.stringify(plan, null, 2), 'utf8');
            log.ok(`Price plan saved: ${planPath}`);
        }

        await mongoose.connection.close();

        console.log('\n' + '═'.repeat(62));
        console.log('📊  STEP 3 SUMMARY');
        console.log('═'.repeat(62));
        console.log(`  CSV rows            : ${stats.rows}`);
        console.log(`  Rows without price  : ${stats.noPrice}`);
        console.log(`  Matched to products : ${stats.matched}`);
        console.log(`  Unmatched rows      : ${stats.unmatched}`);
        console.log(`  Duplicate matches   : ${stats.duplicateMatches}`);
        console.log(`  Plan file           : ${planPath}`);
        console.log('═'.repeat(62));

        if (stats.unmatched > 0) {
            const matchedP = new Set(assignments.map(a => a.pIndex));
            const unmatchedProducts = catalog.filter((_, idx) => !matchedP.has(idx));
            console.log('\nTop unmatched DB products (first 10):');
            unmatchedProducts.slice(0, 10).forEach((p, idx) => {
                console.log(`  ${idx + 1}. ${p.productId} | ${p.name}`);
            });
        }

        if (DRY_RUN) log.ok('Step 3 prepare dry-run complete.');
        else log.ok('Step 3 prepare complete. Upload only the plan file to server for apply stage.');
        return;
    }

    for (const a of assignments) {
        const product = catalog[a.pIndex];
        const price = a.price;
        const strategy = a.strategy;

        try {
            const oldPrice = Number(product.priceINR) || 0;
            if (oldPrice === Number(price)) {
                stats.dbUnchanged++;
                log.info(`No change: ${product.productId} already ₹${price.toLocaleString('en-IN')}`);
                continue;
            }

            if (DRY_RUN) {
                log.dry(`${product.productId} [${strategy}] ₹${oldPrice} → ₹${price.toLocaleString('en-IN')}`);
                continue;
            }

            await Product.updateOne(
                { _id: product._id },
                {
                    $set: {
                        priceINR: price,
                        updatedAt: new Date(),
                    },
                }
            );
            product.priceINR = price;
            stats.dbUpdated++;
            log.ok(`Updated ${product.productId} [${strategy}] ₹${oldPrice} → ₹${price.toLocaleString('en-IN')}`);
        } catch (err) {
            stats.errors++;
            log.error(`Failed updating ${product.productId}: ${err.message}`);
        }
    }

    await mongoose.connection.close();

    console.log('\n' + '═'.repeat(62));
    console.log('📊  STEP 3 SUMMARY');
    console.log('═'.repeat(62));
    console.log(`  CSV rows            : ${stats.rows}`);
    console.log(`  Rows without price  : ${stats.noPrice}`);
    console.log(`  Matched to products : ${stats.matched}`);
    console.log(`  Unmatched rows      : ${stats.unmatched}`);
    console.log(`  Duplicate matches   : ${stats.duplicateMatches}`);
    console.log(`  DB updated          : ${stats.dbUpdated}`);
    console.log(`  DB unchanged        : ${stats.dbUnchanged}`);
    console.log(`  DB missing          : ${stats.dbMissing}`);
    console.log(`  Errors              : ${stats.errors}`);
    console.log('═'.repeat(62));

    if (stats.unmatched > 0) {
        const matchedP = new Set(assignments.map(a => a.pIndex));
        const unmatchedProducts = catalog.filter((_, idx) => !matchedP.has(idx));
        console.log('\nTop unmatched DB products (first 10):');
        unmatchedProducts.slice(0, 10).forEach((p, idx) => {
            console.log(`  ${idx + 1}. ${p.productId} | ${p.name}`);
        });
    }

    if (stats.errors === 0) {
        log.ok('Step 3 direct complete.');
    } else {
        log.warn(`Step 3 direct finished with ${stats.errors} errors.`);
    }
}

// ─── ENTRY POINT ──────────────────────────────────────────────────────────────
(async () => {
    try {
        if (STEP === 1) await runStep1();
        else if (STEP === 2) await runStep2();
        else await runStep3();
    } catch (err) {
        log.error('Fatal:', err.message);
        if (mongoose.connection.readyState === 1) await mongoose.connection.close().catch(() => {});
        process.exit(1);
    }
})();
