/**
 * Cloudinary Upload Script
 * 
 * Uploads all optimized images to Cloudinary with:
 * - Automatic folder organization
 * - Format optimization (auto WebP/AVIF)
 * - Quality optimization
 * - URL mapping generation
 */

const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

// Configuration
const CONFIG = {
    inputDir: path.join(__dirname, '../frontend/public/optimized'),
    outputFile: path.join(__dirname, '../cloudinary-urls.json'),

    // Cloudinary settings
    cloudinary: {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    },

    // Upload options
    uploadOptions: {
        use_filename: true,
        unique_filename: false,
        overwrite: true,
        resource_type: 'auto',
        quality: 'auto:good', // Automatic quality optimization
        fetch_format: 'auto', // Automatic format selection (WebP, AVIF)
    }
};

// Statistics
const stats = {
    total: 0,
    uploaded: 0,
    skipped: 0,
    errors: 0,
    totalSize: 0
};

// URL mapping
const urlMapping = {};

/**
 * Validate Cloudinary configuration
 */
function validateConfig() {
    if (!CONFIG.cloudinary.cloud_name || !CONFIG.cloudinary.api_key || !CONFIG.cloudinary.api_secret) {
        console.error('❌ Error: Cloudinary credentials not found!');
        console.error('\nPlease add to backend/.env:');
        console.error('  CLOUDINARY_CLOUD_NAME=your_cloud_name');
        console.error('  CLOUDINARY_API_KEY=your_api_key');
        console.error('  CLOUDINARY_API_SECRET=your_api_secret');
        console.error('\nGet credentials from: https://cloudinary.com/console');
        process.exit(1);
    }

    cloudinary.config(CONFIG.cloudinary);
    console.log(`✓ Connected to Cloudinary: ${CONFIG.cloudinary.cloud_name}\n`);
}

/**
 * Get relative path from input directory
 */
function getRelativePath(filePath) {
    return path.relative(CONFIG.inputDir, filePath).replace(/\\/g, '/');
}

/**
 * Get Cloudinary folder from file path
 */
function getCloudinaryFolder(filePath) {
    const relativePath = getRelativePath(filePath);
    const dir = path.dirname(relativePath);
    return dir === '.' ? 'root' : dir.replace(/\\/g, '/');
}

/**
 * Upload a single file to Cloudinary
 */
async function uploadFile(filePath) {
    const relativePath = getRelativePath(filePath);
    const folder = getCloudinaryFolder(filePath);
    const fileName = path.basename(filePath, path.extname(filePath));

    try {
        const result = await cloudinary.uploader.upload(filePath, {
            ...CONFIG.uploadOptions,
            folder: `hs-global/${folder}`,
            public_id: fileName
        });

        // Store URL mapping
        urlMapping[relativePath] = {
            original: `/${relativePath}`,
            cloudinary: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            width: result.width,
            height: result.height,
            bytes: result.bytes
        };

        stats.uploaded++;
        stats.totalSize += result.bytes;

        console.log(`✓ ${relativePath}`);
        console.log(`  → ${result.secure_url}`);

        return result;
    } catch (error) {
        console.error(`✗ Failed to upload ${relativePath}: ${error.message}`);
        stats.errors++;
        return null;
    }
}

/**
 * Process directory recursively
 */
async function processDirectory(dir) {
    const items = fs.readdirSync(dir);

    for (const item of items) {
        const itemPath = path.join(dir, item);
        const stat = fs.statSync(itemPath);

        if (stat.isDirectory()) {
            await processDirectory(itemPath);
        } else if (stat.isFile()) {
            stats.total++;

            const ext = path.extname(item).toLowerCase();
            if (['.webp', '.jpg', '.jpeg', '.png', '.gif', '.svg'].includes(ext)) {
                await uploadFile(itemPath);
            } else {
                stats.skipped++;
            }
        }
    }
}

/**
 * Save URL mapping to file
 */
function saveUrlMapping() {
    const output = {
        generated: new Date().toISOString(),
        cloudName: CONFIG.cloudinary.cloud_name,
        stats: {
            totalFiles: stats.total,
            uploaded: stats.uploaded,
            skipped: stats.skipped,
            errors: stats.errors
        },
        urls: urlMapping
    };

    fs.writeFileSync(CONFIG.outputFile, JSON.stringify(output, null, 2));
    console.log(`\n✓ Saved URL mapping to: ${CONFIG.outputFile}`);
}

/**
 * Generate usage report
 */
function generateReport() {
    const totalSizeMB = (stats.totalSize / (1024 * 1024)).toFixed(2);
    const freeStorageGB = 25;
    const freeBandwidthGB = 25;
    const usagePercent = ((stats.totalSize / (1024 * 1024 * 1024)) / freeStorageGB * 100).toFixed(2);

    console.log('\n' + '='.repeat(60));
    console.log('📊 Cloudinary Usage Report\n');
    console.log('Upload Statistics:');
    console.log(`  Total files: ${stats.total}`);
    console.log(`  Uploaded: ${stats.uploaded}`);
    console.log(`  Skipped: ${stats.skipped}`);
    console.log(`  Errors: ${stats.errors}`);
    console.log(`  Total size: ${totalSizeMB} MB`);
    console.log('\nFree Tier Usage:');
    console.log(`  Storage: ${totalSizeMB} MB / ${freeStorageGB * 1024} MB (${usagePercent}%)`);
    console.log(`  Bandwidth: 0 MB / ${freeBandwidthGB * 1024} MB (0%) - will increase with traffic`);
    console.log(`  Status: ${usagePercent < 10 ? '✅ Excellent' : usagePercent < 50 ? '✅ Good' : '⚠️ Monitor'}`);
    console.log('='.repeat(60));
}

/**
 * Main function
 */
async function main() {
    console.log('☁️  Cloudinary Upload Script\n');

    // Validate configuration
    validateConfig();

    // Check if input directory exists
    if (!fs.existsSync(CONFIG.inputDir)) {
        console.error(`❌ Error: Input directory not found: ${CONFIG.inputDir}`);
        console.error('\nPlease run: node scripts/optimize-images.js first');
        process.exit(1);
    }

    console.log(`Input directory: ${CONFIG.inputDir}`);
    console.log('Uploading images...\n');

    const startTime = Date.now();

    try {
        await processDirectory(CONFIG.inputDir);

        const duration = ((Date.now() - startTime) / 1000).toFixed(1);

        // Save URL mapping
        saveUrlMapping();

        // Generate report
        generateReport();

        console.log(`\n⏱️  Duration: ${duration}s`);

        console.log('\n📝 Next Steps:');
        console.log('  1. Review uploaded images: https://cloudinary.com/console/media_library');
        console.log('  2. Update frontend code: node scripts/migrate-image-urls.js');
        console.log('  3. Test locally: cd frontend && npm run dev');
        console.log('  4. Set up Cloudflare (see CLOUDINARY_CLOUDFLARE_SETUP.md)');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    }
}

// Run the script
main();
