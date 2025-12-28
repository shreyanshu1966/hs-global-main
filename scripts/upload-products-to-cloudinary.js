#!/usr/bin/env node

/**
 * Upload Product Images to Cloudinary
 * 
 * This script uploads all product images from src/assets to Cloudinary
 * and generates a mapping file for use in the application.
 */

require('dotenv').config({ path: './backend/.env' });
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ASSETS_DIR = path.join(__dirname, '../frontend/src/assets');
const OUTPUT_FILE = path.join(__dirname, '../product-cloudinary-urls.json');

// Statistics
const stats = {
    totalFiles: 0,
    uploaded: 0,
    skipped: 0,
    errors: 0,
};

const urlMapping = {};

/**
 * Get all image files recursively
 */
function getAllImageFiles(dir, baseDir = dir) {
    const files = [];
    const items = fs.readdirSync(dir);

    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            files.push(...getAllImageFiles(fullPath, baseDir));
        } else if (/\.(webp|jpg|jpeg|png)$/i.test(item)) {
            const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
            files.push({
                fullPath,
                relativePath,
            });
        }
    }

    return files;
}

/**
 * Upload a single file to Cloudinary
 */
async function uploadFile(file) {
    try {
        // Create public_id from relative path (without extension)
        const publicId = `hs-global/products/${file.relativePath.replace(/\.(webp|jpg|jpeg|png)$/i, '')}`;

        console.log(`Uploading: ${file.relativePath}`);

        const result = await cloudinary.uploader.upload(file.fullPath, {
            public_id: publicId,
            folder: 'hs-global/products',
            resource_type: 'image',
            overwrite: false, // Don't overwrite existing files
            quality: 'auto',
            fetch_format: 'auto',
        });

        stats.uploaded++;

        // Store mapping
        urlMapping[file.relativePath] = {
            original: file.relativePath,
            cloudinary: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            width: result.width,
            height: result.height,
            bytes: result.bytes,
        };

        console.log(`✓ ${file.relativePath}`);
        console.log(`  → ${result.secure_url}`);

        return result;
    } catch (error) {
        if (error.http_code === 400 && error.message.includes('already exists')) {
            console.log(`⊘ ${file.relativePath} (already exists)`);
            stats.skipped++;

            // Still add to mapping with constructed URL
            const publicId = `hs-global/products/${file.relativePath.replace(/\.(webp|jpg|jpeg|png)$/i, '')}`;
            const format = path.extname(file.relativePath).slice(1).toLowerCase();
            const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

            urlMapping[file.relativePath] = {
                original: file.relativePath,
                cloudinary: `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}.${format}`,
                publicId: publicId,
                format: format,
                skipped: true,
            };

            return null;
        }

        console.error(`✗ ${file.relativePath}`);
        console.error(`  Error: ${error.message}`);
        stats.errors++;
        return null;
    }
}

/**
 * Main execution
 */
async function main() {
    console.log('🚀 Starting Product Image Upload to Cloudinary\n');
    console.log('Configuration:');
    console.log(`  Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME}`);
    console.log(`  Assets Directory: ${ASSETS_DIR}`);
    console.log(`  Output File: ${OUTPUT_FILE}\n`);

    // Verify Cloudinary credentials
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        console.error('❌ Error: Cloudinary credentials not found in backend/.env');
        console.error('Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET');
        process.exit(1);
    }

    // Verify assets directory exists
    if (!fs.existsSync(ASSETS_DIR)) {
        console.error(`❌ Error: Assets directory not found: ${ASSETS_DIR}`);
        process.exit(1);
    }

    // Get all image files
    console.log('📂 Scanning for images...\n');
    const files = getAllImageFiles(ASSETS_DIR);
    stats.totalFiles = files.length;

    console.log(`Found ${files.length} images\n`);
    console.log('📤 Uploading images...\n');

    // Upload files with concurrency limit
    const CONCURRENCY = 5;
    for (let i = 0; i < files.length; i += CONCURRENCY) {
        const batch = files.slice(i, i + CONCURRENCY);
        await Promise.all(batch.map(file => uploadFile(file)));
    }

    // Save URL mapping
    const output = {
        generated: new Date().toISOString(),
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        stats,
        urls: urlMapping,
    };

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ Upload Complete!');
    console.log('');
    console.log('Statistics:');
    console.log(`  Total files: ${stats.totalFiles}`);
    console.log(`  Uploaded: ${stats.uploaded}`);
    console.log(`  Skipped: ${stats.skipped}`);
    console.log(`  Errors: ${stats.errors}`);
    console.log('');
    console.log(`📄 URL mapping saved to: ${OUTPUT_FILE}`);
    console.log('='.repeat(60));
    console.log('');
    console.log('📝 Next Steps:');
    console.log('  1. Update slabs.loader.ts to use Cloudinary URLs');
    console.log('  2. Update products.ts to use Cloudinary URLs');
    console.log('  3. Test the products page locally');
    console.log('');
}

// Run the script
main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
