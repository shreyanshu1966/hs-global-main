/**
 * Upload Hero Banners to Cloudinary
 *
 * Uploads Banner1-4 desktop + mobile images from frontend-new/public
 * to Cloudinary (folder: hs-global/hero), optimized to WebP.
 */

const sharp = require('sharp');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const CONFIG = {
    sourceDir: path.join(__dirname, '../frontend-new/public'),
    tempDir: path.join(__dirname, '../temp-hero-optimized'),
    outputFile: path.join(__dirname, '../hero-banners-cloudinary-urls.json'),
    cloudinary: {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        folder: 'hs-global/hero'
    },
    // Banner files to upload (desktop + mobile)
    files: [
        'Banner1-des.png', 'Banner1-mob.png',
        'Banner2-des.png', 'Banner2-mob.png',
        'Banner3-des.png', 'Banner3-mob.png',
        'Banner4-des.png', 'Banner4-mob.png'
    ],
    optimization: {
        desktop: { maxWidth: 1920, quality: 85, pattern: /-des/i },
        mobile: { maxWidth: 1122, quality: 85, pattern: /-mob/i }
    },
    upload: { retries: 3, retryDelay: 2000 }
};

const stats = { found: 0, optimized: 0, uploaded: 0, errors: 0, originalSize: 0, optimizedSize: 0 };
const urlMappings = {};

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function getFileSize(filePath) {
    try { return fs.statSync(filePath).size; } catch { return 0; }
}

function getSettings(fileName) {
    if (CONFIG.optimization.mobile.pattern.test(fileName)) {
        return { ...CONFIG.optimization.mobile, type: 'mobile' };
    }
    return { ...CONFIG.optimization.desktop, type: 'desktop' };
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function validateConfig() {
    console.log('🔍 Validating configuration...\n');
    if (!CONFIG.cloudinary.cloud_name || !CONFIG.cloudinary.api_key || !CONFIG.cloudinary.api_secret) {
        console.error('❌ Error: Cloudinary credentials not found in backend/.env!');
        process.exit(1);
    }
    cloudinary.config(CONFIG.cloudinary);
    console.log(`✓ Connected to Cloudinary: ${CONFIG.cloudinary.cloud_name}`);
    if (!fs.existsSync(CONFIG.tempDir)) fs.mkdirSync(CONFIG.tempDir, { recursive: true });
    console.log(`✓ Temp dir: ${CONFIG.tempDir}\n`);
}

async function optimizeImage(fileName) {
    const inputPath = path.join(CONFIG.sourceDir, fileName);
    if (!fs.existsSync(inputPath)) {
        console.error(`  ✗ Not found: ${fileName}`);
        stats.errors++;
        return null;
    }
    stats.found++;
    const settings = getSettings(fileName);
    const originalSize = getFileSize(inputPath);
    const outputPath = path.join(CONFIG.tempDir, fileName.replace(/\.png$/i, '.webp'));

    try {
        const metadata = await sharp(inputPath).metadata();
        let width = metadata.width;
        if (width > settings.maxWidth) width = settings.maxWidth;

        await sharp(inputPath)
            .resize(width, null, { fit: 'inside', withoutEnlargement: true })
            .webp({ quality: settings.quality, effort: 6 })
            .toFile(outputPath);

        const optimizedSize = getFileSize(outputPath);
        const savings = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);
        stats.originalSize += originalSize;
        stats.optimizedSize += optimizedSize;
        stats.optimized++;
        console.log(`  ✓ ${fileName} [${settings.type}] ${formatBytes(originalSize)} → ${formatBytes(optimizedSize)} (${savings}%)`);
        return { original: fileName, optimized: outputPath };
    } catch (error) {
        console.error(`  ✗ Failed to optimize ${fileName}: ${error.message}`);
        stats.errors++;
        return null;
    }
}

async function uploadToCloudinary(optimizedPath, originalFileName, retries = CONFIG.upload.retries) {
    const publicId = originalFileName.replace(/\.png$/i, '');
    try {
        const result = await cloudinary.uploader.upload(optimizedPath, {
            folder: CONFIG.cloudinary.folder,
            public_id: publicId,
            use_filename: true,
            unique_filename: false,
            overwrite: true,
            resource_type: 'image'
        });
        stats.uploaded++;
        urlMappings[originalFileName] = {
            original: originalFileName,
            cloudinary: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            width: result.width,
            height: result.height,
            bytes: result.bytes
        };
        console.log(`  ✓ ${originalFileName} → ${result.secure_url}`);
        return result;
    } catch (error) {
        if (retries > 0) {
            console.warn(`  ⚠️  Upload failed, retrying... (${retries} left)`);
            await sleep(CONFIG.upload.retryDelay);
            return uploadToCloudinary(optimizedPath, originalFileName, retries - 1);
        }
        console.error(`  ✗ Failed to upload ${originalFileName}: ${error.message}`);
        stats.errors++;
        return null;
    }
}

function saveMappings() {
    const output = {
        generated: new Date().toISOString(),
        cloudName: CONFIG.cloudinary.cloud_name,
        folder: CONFIG.cloudinary.folder,
        urls: urlMappings
    };
    fs.writeFileSync(CONFIG.outputFile, JSON.stringify(output, null, 2));
    console.log(`\n💾 Mappings saved: ${CONFIG.outputFile}`);
}

function cleanup() {
    try {
        if (fs.existsSync(CONFIG.tempDir)) fs.rmSync(CONFIG.tempDir, { recursive: true, force: true });
    } catch (e) { /* ignore */ }
}

async function main() {
    console.log('='.repeat(60));
    console.log('🚀 HERO BANNERS - CLOUDINARY UPLOAD');
    console.log('='.repeat(60) + '\n');
    try {
        validateConfig();

        console.log('🎨 Optimizing...\n');
        const optimized = [];
        for (const fileName of CONFIG.files) {
            const r = await optimizeImage(fileName);
            if (r) optimized.push(r);
        }

        console.log('\n☁️  Uploading...\n');
        for (const { optimized: p, original } of optimized) {
            await uploadToCloudinary(p, original);
        }

        saveMappings();
        cleanup();

        console.log('\n' + '='.repeat(60));
        console.log(`✅ Done. Found ${stats.found}, optimized ${stats.optimized}, uploaded ${stats.uploaded}, errors ${stats.errors}`);
        console.log(`   ${formatBytes(stats.originalSize)} → ${formatBytes(stats.optimizedSize)}`);
        console.log('='.repeat(60) + '\n');
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        cleanup();
        process.exit(1);
    }
}

if (require.main === module) main();

module.exports = { main };
