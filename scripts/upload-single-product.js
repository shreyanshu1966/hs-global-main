#!/usr/bin/env node

/**
 * Upload Single Product Images to Cloudinary
 * 
 * This script uploads images for a specific product to Cloudinary
 * and updates the product-cloudinary-urls.json mapping file.
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

// Product to upload
const PRODUCT_PATH = 'furnitures/Tables/Coffee Table/Sandstone & Marine Black Coffee Table';
const ASSETS_DIR = path.join(__dirname, '../frontend/src/assets');
const PRODUCT_DIR = path.join(ASSETS_DIR, PRODUCT_PATH);
const MAPPING_FILE = path.join(__dirname, '../product-cloudinary-urls.json');

// Statistics
const stats = {
    totalFiles: 0,
    uploaded: 0,
    skipped: 0,
    errors: 0,
};

/**
 * Get all image files in the product directory
 */
function getProductImages() {
    const files = [];

    if (!fs.existsSync(PRODUCT_DIR)) {
        console.error(`❌ Product directory not found: ${PRODUCT_DIR}`);
        return files;
    }

    const items = fs.readdirSync(PRODUCT_DIR);

    for (const item of items) {
        const fullPath = path.join(PRODUCT_DIR, item);
        const stat = fs.statSync(fullPath);

        if (stat.isFile() && /\.(webp|jpg|jpeg|png)$/i.test(item)) {
            const relativePath = path.relative(ASSETS_DIR, fullPath).replace(/\\/g, '/');
            files.push({
                fullPath,
                relativePath,
                fileName: item,
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
        // Sanitize path: replace '&' with 'and' and other special characters
        const pathWithoutExt = file.relativePath
            .replace(/\.(webp|jpg|jpeg|png)$/i, '')
            .replace(/\s*&\s*/g, ' and '); // Replace & with 'and'

        const publicId = `hs-global/products/${pathWithoutExt}`;

        console.log(`Uploading: ${file.fileName}`);
        console.log(`  Public ID: ${publicId}`);

        const result = await cloudinary.uploader.upload(file.fullPath, {
            public_id: publicId,
            resource_type: 'image',
            overwrite: true, // Overwrite if exists
            quality: 'auto',
            fetch_format: 'auto',
            invalidate: true, // Invalidate CDN cache
        });

        stats.uploaded++;

        console.log(`✓ ${file.fileName}`);
        console.log(`  → ${result.secure_url}`);

        return {
            relativePath: file.relativePath,
            mapping: {
                original: file.relativePath,
                cloudinary: result.secure_url,
                publicId: result.public_id,
                format: result.format,
                width: result.width,
                height: result.height,
                bytes: result.bytes,
            }
        };
    } catch (error) {
        console.error(`✗ ${file.fileName}`);
        console.error(`  Error: ${error.message}`);
        stats.errors++;
        return null;
    }
}

/**
 * Update the mapping file
 */
function updateMappingFile(newMappings) {
    let mappingData = {
        generated: new Date().toISOString(),
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        stats: {
            found: 0,
            optimized: 0,
            uploaded: 0,
            errors: 0,
        },
        urls: {}
    };

    // Load existing mapping if it exists
    if (fs.existsSync(MAPPING_FILE)) {
        try {
            mappingData = JSON.parse(fs.readFileSync(MAPPING_FILE, 'utf8'));
        } catch (error) {
            console.warn('⚠️  Could not read existing mapping file, creating new one');
        }
    }

    // Update with new mappings
    newMappings.forEach(item => {
        if (item) {
            mappingData.urls[item.relativePath] = item.mapping;
        }
    });

    // Update metadata
    mappingData.generated = new Date().toISOString();
    mappingData.stats.uploaded = Object.keys(mappingData.urls).length;

    // Save updated mapping
    fs.writeFileSync(MAPPING_FILE, JSON.stringify(mappingData, null, 2));
    console.log(`\n✅ Updated mapping file: ${MAPPING_FILE}`);
}

/**
 * Main execution
 */
async function main() {
    console.log('🚀 Uploading Sandstone & Marine Black Coffee Table Images\n');
    console.log('Configuration:');
    console.log(`  Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME}`);
    console.log(`  Product: ${PRODUCT_PATH}`);
    console.log(`  Product Directory: ${PRODUCT_DIR}\n`);

    // Verify Cloudinary credentials
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        console.error('❌ Error: Cloudinary credentials not found in backend/.env');
        console.error('Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET');
        process.exit(1);
    }

    // Get product images
    console.log('📂 Scanning for images...\n');
    const files = getProductImages();
    stats.totalFiles = files.length;

    if (files.length === 0) {
        console.error('❌ No images found in product directory');
        process.exit(1);
    }

    console.log(`Found ${files.length} images:\n`);
    files.forEach(file => console.log(`  - ${file.fileName}`));
    console.log('\n📤 Uploading images...\n');

    // Upload files
    const results = [];
    for (const file of files) {
        const result = await uploadFile(file);
        if (result) {
            results.push(result);
        }
    }

    // Update mapping file
    if (results.length > 0) {
        updateMappingFile(results);
    }

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ Upload Complete!');
    console.log('');
    console.log('Statistics:');
    console.log(`  Total files: ${stats.totalFiles}`);
    console.log(`  Uploaded: ${stats.uploaded}`);
    console.log(`  Errors: ${stats.errors}`);
    console.log('');
    console.log('='.repeat(60));
    console.log('');
    console.log('✨ The images are now available on Cloudinary!');
    console.log('🔄 Refresh your website to see the changes.');
    console.log('');
}

// Run the script
main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
