/**
 * Upload Public Root Images to Cloudinary
 * 
 * This script uploads images from frontend/public root directory
 * (logos, hero images, banners, etc.)
 */

const sharp = require('sharp');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
    // Source directory - public root only
    sourceDir: path.join(__dirname, '../frontend/public'),

    // Temporary directory for optimized images
    tempDir: path.join(__dirname, '../temp-public-optimized'),

    // Output mapping file
    outputFile: path.join(__dirname, '../public-root-cloudinary-urls.json'),

    // Cloudinary configuration
    cloudinary: {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        folder: 'hs-global/public'
    },

    // Optimization settings
    optimization: {
        // Hero images (large banners)
        hero: {
            quality: 80,
            maxWidth: 1920,
            maxHeight: 1080,
            pattern: /(hero|banner|export|solutions)/i
        },
        // Logos
        logo: {
            quality: 90,
            maxWidth: 800,
            maxHeight: 800,
            pattern: /(logo)/i
        },
        // Default
        default: {
            quality: 80,
            maxWidth: 1600,
            maxHeight: 1600
        }
    },

    // Upload settings
    upload: {
        retries: 3,
        retryDelay: 2000
    }
};

// ============================================================================
// STATISTICS
// ============================================================================

const stats = {
    found: 0,
    optimized: 0,
    uploaded: 0,
    errors: 0,
    originalSize: 0,
    optimizedSize: 0,
    uploadedSize: 0,
    startTime: Date.now()
};

const urlMappings = {};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function getFileSize(filePath) {
    try {
        return fs.statSync(filePath).size;
    } catch (error) {
        return 0;
    }
}

function getOptimizationSettings(fileName) {
    const nameLower = fileName.toLowerCase();

    if (CONFIG.optimization.hero.pattern.test(nameLower)) {
        return { ...CONFIG.optimization.hero, type: 'hero' };
    }
    if (CONFIG.optimization.logo.pattern.test(nameLower)) {
        return { ...CONFIG.optimization.logo, type: 'logo' };
    }
    return { ...CONFIG.optimization.default, type: 'default' };
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================================
// VALIDATION
// ============================================================================

function validateConfig() {
    console.log('🔍 Validating configuration...\n');

    if (!CONFIG.cloudinary.cloud_name || !CONFIG.cloudinary.api_key || !CONFIG.cloudinary.api_secret) {
        console.error('❌ Error: Cloudinary credentials not found!');
        console.error('\nPlease add to backend/.env:');
        console.error('  CLOUDINARY_CLOUD_NAME=your_cloud_name');
        console.error('  CLOUDINARY_API_KEY=your_api_key');
        console.error('  CLOUDINARY_API_SECRET=your_api_secret');
        process.exit(1);
    }

    cloudinary.config(CONFIG.cloudinary);
    console.log(`✓ Connected to Cloudinary: ${CONFIG.cloudinary.cloud_name}`);

    if (!fs.existsSync(CONFIG.tempDir)) {
        fs.mkdirSync(CONFIG.tempDir, { recursive: true });
    }
    console.log(`✓ Temporary directory: ${CONFIG.tempDir}\n`);
}

// ============================================================================
// IMAGE DISCOVERY
// ============================================================================

function findRootImages() {
    console.log('🔎 Scanning public root directory...\n');
    const images = [];
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];

    if (!fs.existsSync(CONFIG.sourceDir)) {
        console.error(`❌ Directory not found: ${CONFIG.sourceDir}`);
        return images;
    }

    const items = fs.readdirSync(CONFIG.sourceDir);

    for (const item of items) {
        const fullPath = path.join(CONFIG.sourceDir, item);

        try {
            const stat = fs.statSync(fullPath);

            // Only process files in root directory (not subdirectories)
            if (stat.isFile()) {
                const ext = path.extname(item).toLowerCase();
                if (imageExtensions.includes(ext)) {
                    images.push(fullPath);
                    stats.found++;
                    console.log(`  Found: ${item}`);
                }
            }
        } catch (error) {
            console.warn(`⚠️  Could not access: ${fullPath}`);
        }
    }

    console.log(`\n✓ Found ${stats.found} images in public root\n`);
    return images;
}

// ============================================================================
// IMAGE OPTIMIZATION
// ============================================================================

async function optimizeImage(inputPath) {
    const fileName = path.basename(inputPath);
    const settings = getOptimizationSettings(fileName);
    const originalSize = getFileSize(inputPath);

    const outputPath = path.join(CONFIG.tempDir, fileName);

    try {
        const metadata = await sharp(inputPath).metadata();

        let width = metadata.width;
        let height = metadata.height;

        if (width > settings.maxWidth) {
            height = Math.round((height * settings.maxWidth) / width);
            width = settings.maxWidth;
        }

        if (height > settings.maxHeight) {
            width = Math.round((width * settings.maxHeight) / height);
            height = settings.maxHeight;
        }

        await sharp(inputPath)
            .resize(width, height, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .webp({
                quality: settings.quality,
                effort: 6
            })
            .toFile(outputPath.replace(path.extname(outputPath), '.webp'));

        const optimizedPath = outputPath.replace(path.extname(outputPath), '.webp');
        const optimizedSize = getFileSize(optimizedPath);
        const savings = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);

        stats.originalSize += originalSize;
        stats.optimizedSize += optimizedSize;
        stats.optimized++;

        console.log(`  ✓ ${fileName} [${settings.type}]`);
        console.log(`    ${formatBytes(originalSize)} → ${formatBytes(optimizedSize)} (${savings}% reduction)`);

        return optimizedPath;
    } catch (error) {
        console.error(`  ✗ Failed to optimize ${fileName}: ${error.message}`);
        stats.errors++;
        return null;
    }
}

async function optimizeAllImages(images) {
    console.log('🎨 Optimizing images...\n');

    const optimizedPaths = [];

    for (const imagePath of images) {
        const optimizedPath = await optimizeImage(imagePath);
        if (optimizedPath) {
            optimizedPaths.push({
                original: imagePath,
                optimized: optimizedPath
            });
        }
    }

    console.log(`\n✓ Optimized ${stats.optimized} images\n`);
    return optimizedPaths;
}

// ============================================================================
// CLOUDINARY UPLOAD
// ============================================================================

async function uploadToCloudinary(imagePath, originalPath, retries = CONFIG.upload.retries) {
    const fileName = path.basename(imagePath, path.extname(imagePath));
    const originalFileName = path.basename(originalPath, path.extname(originalPath));

    try {
        const result = await cloudinary.uploader.upload(imagePath, {
            folder: CONFIG.cloudinary.folder,
            public_id: originalFileName, // Use original filename (without .webp extension)
            use_filename: true,
            unique_filename: false,
            overwrite: true,
            resource_type: 'auto',
            quality: 'auto:good',
            fetch_format: 'auto'
        });

        stats.uploaded++;
        stats.uploadedSize += result.bytes;

        // Store mapping with original filename as key
        const originalFileNameWithExt = path.basename(originalPath);
        urlMappings[originalFileNameWithExt] = {
            original: originalFileNameWithExt,
            cloudinary: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            width: result.width,
            height: result.height,
            bytes: result.bytes
        };

        console.log(`  ✓ ${originalFileNameWithExt}`);
        console.log(`    → ${result.secure_url}`);

        return result;
    } catch (error) {
        if (retries > 0) {
            console.warn(`  ⚠️  Upload failed, retrying... (${retries} attempts left)`);
            await sleep(CONFIG.upload.retryDelay);
            return uploadToCloudinary(imagePath, originalPath, retries - 1);
        } else {
            console.error(`  ✗ Failed to upload ${fileName}: ${error.message}`);
            stats.errors++;
            return null;
        }
    }
}

async function uploadAllImages(optimizedImages) {
    console.log('☁️  Uploading to Cloudinary...\n');

    for (const { optimized, original } of optimizedImages) {
        await uploadToCloudinary(optimized, original);
    }

    console.log(`\n✓ Uploaded ${stats.uploaded} images\n`);
}

// ============================================================================
// SAVE MAPPINGS
// ============================================================================

function saveMappings() {
    console.log('💾 Saving URL mappings...\n');

    const output = {
        generated: new Date().toISOString(),
        cloudName: CONFIG.cloudinary.cloud_name,
        folder: CONFIG.cloudinary.folder,
        stats: {
            found: stats.found,
            optimized: stats.optimized,
            uploaded: stats.uploaded,
            errors: stats.errors,
            originalSize: formatBytes(stats.originalSize),
            optimizedSize: formatBytes(stats.optimizedSize),
            uploadedSize: formatBytes(stats.uploadedSize)
        },
        urls: urlMappings
    };

    fs.writeFileSync(CONFIG.outputFile, JSON.stringify(output, null, 2));
    console.log(`  ✓ Mappings saved: ${CONFIG.outputFile}\n`);
}

// ============================================================================
// CLEANUP
// ============================================================================

function cleanup() {
    console.log('🧹 Cleaning up temporary files...\n');

    try {
        if (fs.existsSync(CONFIG.tempDir)) {
            fs.rmSync(CONFIG.tempDir, { recursive: true, force: true });
            console.log(`  ✓ Removed: ${CONFIG.tempDir}\n`);
        }
    } catch (error) {
        console.warn(`  ⚠️  Could not remove temp directory: ${error.message}\n`);
    }
}

// ============================================================================
// REPORTING
// ============================================================================

function generateReport() {
    const duration = ((Date.now() - stats.startTime) / 1000).toFixed(1);
    const optimizationSavings = stats.originalSize > 0
        ? ((stats.originalSize - stats.optimizedSize) / stats.originalSize * 100).toFixed(1)
        : 0;

    console.log('='.repeat(70));
    console.log('📊 FINAL REPORT\n');

    console.log('Image Processing:');
    console.log(`  Found: ${stats.found}`);
    console.log(`  Optimized: ${stats.optimized}`);
    console.log(`  Uploaded: ${stats.uploaded}`);
    console.log(`  Errors: ${stats.errors}\n`);

    console.log('Size Optimization:');
    console.log(`  Original size: ${formatBytes(stats.originalSize)}`);
    console.log(`  Optimized size: ${formatBytes(stats.optimizedSize)}`);
    console.log(`  Savings: ${formatBytes(stats.originalSize - stats.optimizedSize)} (${optimizationSavings}%)\n`);

    console.log('Cloudinary Upload:');
    console.log(`  Total uploaded: ${formatBytes(stats.uploadedSize)}`);
    console.log(`  Folder: ${CONFIG.cloudinary.folder}\n`);

    console.log(`Duration: ${duration}s`);
    console.log('='.repeat(70));

    console.log('\n📝 Next Steps:');
    console.log('  1. Review uploaded images: https://cloudinary.com/console/media_library');
    console.log(`  2. Check URL mappings: ${CONFIG.outputFile}`);
    console.log('  3. Update your code to use Cloudinary URLs');
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

async function main() {
    console.log('='.repeat(70));
    console.log('🚀 PUBLIC ROOT IMAGES - CLOUDINARY UPLOAD');
    console.log('='.repeat(70));
    console.log();

    try {
        // Step 1: Validate
        validateConfig();

        // Step 2: Find images
        const images = findRootImages();

        if (images.length === 0) {
            console.log('⚠️  No images found in public root directory.');
            return;
        }

        // Step 3: Optimize
        const optimizedImages = await optimizeAllImages(images);

        if (optimizedImages.length === 0) {
            console.log('⚠️  No images were successfully optimized.');
            return;
        }

        // Step 4: Upload
        await uploadAllImages(optimizedImages);

        // Step 5: Save mappings
        saveMappings();

        // Step 6: Cleanup
        cleanup();

        // Step 7: Report
        generateReport();

        console.log('\n✅ Process completed successfully!\n');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// Run the script
if (require.main === module) {
    main();
}

module.exports = { main };
