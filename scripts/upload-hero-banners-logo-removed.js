/**
 * Upload the logo-removed Banner1-4 desktop + mobile artwork to Cloudinary,
 * overwriting the existing hs-global/hero/BannerN-des(.webp) / BannerN-mob(.webp) assets.
 *
 * Source: frontend-new/public/BannerN-des.png, BannerN-mob.png (already replaced in place)
 */

const sharp = require('sharp');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const CONFIG = {
    sourceDir: path.join(__dirname, '../frontend-new/public'),
    tempDir: path.join(__dirname, '../temp-hero-optimized'),
    outputFile: path.join(__dirname, '../hero-banners-logo-removed-cloudinary-urls.json'),
    cloudinary: {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        folder: 'hs-global/hero'
    },
    files: [
        { source: 'Banner1-des.png', publicId: 'Banner1-des', maxWidth: 1920 },
        { source: 'Banner1-mob.png', publicId: 'Banner1-mob', maxWidth: 1122 },
        { source: 'Banner2-des.png', publicId: 'Banner2-des', maxWidth: 1920 },
        { source: 'Banner2-mob.png', publicId: 'Banner2-mob', maxWidth: 1122 },
        { source: 'Banner3-des.png', publicId: 'Banner3-des', maxWidth: 1920 },
        { source: 'Banner3-mob.png', publicId: 'Banner3-mob', maxWidth: 1122 },
        { source: 'Banner4-des.png', publicId: 'Banner4-des', maxWidth: 1920 },
        { source: 'Banner4-mob.png', publicId: 'Banner4-mob', maxWidth: 1122 },
    ],
    quality: 85,
};

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

async function main() {
    console.log('='.repeat(60));
    console.log('🚀 HERO BANNERS (LOGO REMOVED) - CLOUDINARY UPLOAD');
    console.log('='.repeat(60) + '\n');

    if (!CONFIG.cloudinary.cloud_name || !CONFIG.cloudinary.api_key || !CONFIG.cloudinary.api_secret) {
        console.error('❌ Cloudinary credentials not found in backend/.env');
        process.exit(1);
    }
    cloudinary.config(CONFIG.cloudinary);
    console.log(`✓ Connected to Cloudinary: ${CONFIG.cloudinary.cloud_name}`);
    if (!fs.existsSync(CONFIG.tempDir)) fs.mkdirSync(CONFIG.tempDir, { recursive: true });

    const urlMappings = {};

    for (const { source, publicId, maxWidth } of CONFIG.files) {
        const inputPath = path.join(CONFIG.sourceDir, source);
        if (!fs.existsSync(inputPath)) {
            console.error(`  ✗ Not found: ${source}`);
            process.exit(1);
        }
        const originalSize = getFileSize(inputPath);
        const outputPath = path.join(CONFIG.tempDir, source.replace(/\.png$/i, '.webp'));

        const metadata = await sharp(inputPath).metadata();
        let width = metadata.width;
        if (width > maxWidth) width = maxWidth;

        await sharp(inputPath)
            .resize(width, null, { fit: 'inside', withoutEnlargement: true })
            .webp({ quality: CONFIG.quality, effort: 6 })
            .toFile(outputPath);

        const optimizedSize = getFileSize(outputPath);
        const savings = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);
        console.log(`  ✓ ${source} ${formatBytes(originalSize)} → ${formatBytes(optimizedSize)} (${savings}%)`);

        const result = await cloudinary.uploader.upload(outputPath, {
            folder: CONFIG.cloudinary.folder,
            public_id: publicId,
            use_filename: false,
            unique_filename: false,
            overwrite: true,
            invalidate: true,
            resource_type: 'image'
        });

        urlMappings[source] = {
            source,
            publicId: result.public_id,
            cloudinary: result.secure_url,
            format: result.format,
            width: result.width,
            height: result.height,
            bytes: result.bytes,
            version: result.version
        };
        console.log(`  ☁️  ${source} → ${result.secure_url}`);
    }

    fs.writeFileSync(CONFIG.outputFile, JSON.stringify({ generated: new Date().toISOString(), urls: urlMappings }, null, 2));
    console.log(`\n💾 Mappings saved: ${CONFIG.outputFile}`);

    try { fs.rmSync(CONFIG.tempDir, { recursive: true, force: true }); } catch (_) {}

    console.log('\n' + '='.repeat(60));
    console.log('✅ Done.');
    console.log('='.repeat(60) + '\n');
}

main().catch((err) => {
    console.error('\n❌ Error:', err.message);
    process.exit(1);
});
