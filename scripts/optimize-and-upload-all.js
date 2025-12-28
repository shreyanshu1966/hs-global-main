/**
 * Complete Image Optimization and Cloudinary Upload Script
 * 
 * This script:
 * 1. Finds ALL images in the project (public, src/assets, etc.)
 * 2. Optimizes them using Sharp (reduces size while maintaining quality)
 * 3. Uploads optimized images to Cloudinary
 * 4. Generates URL mapping files for easy integration
 * 
 * Features:
 * - Smart quality optimization based on image type
 * - Maintains aspect ratios
 * - WebP conversion for best compression
 * - Parallel uploads for speed
 * - Detailed progress reporting
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
    // Source directories to scan for images
    sourceDirs: [
        path.join(__dirname, '../frontend/public'),
        path.join(__dirname, '../frontend/src/assets'),
    ],

    // Temporary directory for optimized images
    tempDir: path.join(__dirname, '../temp-optimized'),

    // Output mapping files
    outputFiles: {
        gallery: path.join(__dirname, '../cloudinary-urls.json'),
        products: path.join(__dirname, '../product-cloudinary-urls.json'),
        all: path.join(__dirname, '../all-cloudinary-urls.json'),
    },

    // Cloudinary configuration
    cloudinary: {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        folder_prefix: 'hs-global'
    },

    // Optimization settings by image type
    optimization: {
        // Large hero/banner images
        hero: {
            quality: 80,
            maxWidth: 1920,
            maxHeight: 1080,
            pattern: /(hero|banner|export|solutions)/i,
            effort: 6
        },

        // Gallery images
        gallery: {
            quality: 75,
            maxWidth: 1400,
            maxHeight: 1400,
            pattern: /gallery/i,
            effort: 6
        },

        // Product/Collection images
        product: {
            quality: 80,
            maxWidth: 1600,
            maxHeight: 1600,
            pattern: /(collection|furniture|slab|product)/i,
            effort: 6
        },

        // Logos and icons
        logo: {
            quality: 90,
            maxWidth: 800,
            maxHeight: 800,
            pattern: /(logo|icon)/i,
            effort: 6
        },

        // Default for other images
        default: {
            quality: 75,
            maxWidth: 1600,
            maxHeight: 1600,
            effort: 6
        }
    },

    // Upload settings
    upload: {
        concurrency: 5, // Number of parallel uploads
        retries: 3,
        retryDelay: 2000, // ms
    }
};

// ============================================================================
// STATISTICS
// ============================================================================

const stats = {
    found: 0,
    optimized: 0,
    uploaded: 0,
    skipped: 0,
    errors: 0,
    originalSize: 0,
    optimizedSize: 0,
    uploadedSize: 0,
    startTime: Date.now()
};

// URL mappings
const urlMappings = {
    gallery: {},
    products: {},
    all: {}
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format bytes to human readable
 */
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Get file size
 */
function getFileSize(filePath) {
    try {
        return fs.statSync(filePath).size;
    } catch (error) {
        return 0;
    }
}

/**
 * Determine optimization settings based on file path
 */
function getOptimizationSettings(filePath) {
    const pathLower = filePath.toLowerCase();

    for (const [type, settings] of Object.entries(CONFIG.optimization)) {
        if (type !== 'default' && settings.pattern.test(pathLower)) {
            return { ...settings, type };
        }
    }

    return { ...CONFIG.optimization.default, type: 'default' };
}

/**
 * Get relative path for original field (Collection/... or furnitures/...)
 */
function getRelativeOriginalPath(filePath) {
    const parts = filePath.split(path.sep);

    // Find Collection or furnitures index
    const collectionIndex = parts.findIndex(p => p === 'Collection');
    const furnituresIndex = parts.findIndex(p => p === 'furnitures');
    const galleryIndex = parts.findIndex(p => p.toLowerCase() === 'gallery');

    if (collectionIndex >= 0) {
        // Return path starting from Collection
        return parts.slice(collectionIndex).join('/');
    } else if (furnituresIndex >= 0) {
        // Return path starting from furnitures
        return parts.slice(furnituresIndex).join('/');
    } else if (galleryIndex >= 0) {
        // Return path starting from gallery
        return 'gallery/' + parts.slice(galleryIndex + 1).join('/');
    }

    // Default: return filename
    return path.basename(filePath);
}

/**
 * Get Cloudinary folder path from file path
 */
function getCloudinaryFolder(filePath) {
    const pathLower = filePath.toLowerCase();
    const parts = filePath.split(path.sep);

    // Handle gallery images
    if (pathLower.includes('gallery')) {
        const galleryIndex = parts.findIndex(p => p.toLowerCase() === 'gallery');
        if (galleryIndex >= 0 && galleryIndex < parts.length - 1) {
            const subPath = parts.slice(galleryIndex + 1, -1).join('/');
            return `${CONFIG.cloudinary.folder_prefix}/gallery${subPath ? '/' + subPath : ''}`;
        }
        return `${CONFIG.cloudinary.folder_prefix}/gallery`;
    }

    // Handle Collection images - INCLUDE "Collection" in the path
    if (pathLower.includes('collection')) {
        const collectionIndex = parts.findIndex(p => p === 'Collection');
        if (collectionIndex >= 0 && collectionIndex < parts.length - 1) {
            // Include "Collection" in the Cloudinary path
            const subPath = parts.slice(collectionIndex, -1).join('/');
            return `${CONFIG.cloudinary.folder_prefix}/products/${subPath}`;
        }
        return `${CONFIG.cloudinary.folder_prefix}/products/Collection`;
    }

    // Handle furnitures images - INCLUDE "furnitures" in the path
    if (pathLower.includes('furniture')) {
        const furnituresIndex = parts.findIndex(p => p === 'furnitures');
        if (furnituresIndex >= 0 && furnituresIndex < parts.length - 1) {
            // Include "furnitures" in the Cloudinary path
            const subPath = parts.slice(furnituresIndex, -1).join('/');
            return `${CONFIG.cloudinary.folder_prefix}/products/${subPath}`;
        }
        return `${CONFIG.cloudinary.folder_prefix}/products/furnitures`;
    }

    // Default: use relative path structure
    const publicIndex = parts.findIndex(p => p === 'public');
    const srcIndex = parts.findIndex(p => p === 'src');

    if (publicIndex >= 0) {
        return `${CONFIG.cloudinary.folder_prefix}/${parts.slice(publicIndex + 1, -1).join('/')}`;
    } else if (srcIndex >= 0) {
        return `${CONFIG.cloudinary.folder_prefix}/${parts.slice(srcIndex + 1, -1).join('/')}`;
    }

    return `${CONFIG.cloudinary.folder_prefix}/misc`;
}

/**
 * Sleep function for retries
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validate Cloudinary configuration
 */
function validateConfig() {
    console.log('🔍 Validating configuration...\n');

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
    console.log(`✓ Connected to Cloudinary: ${CONFIG.cloudinary.cloud_name}`);

    // Create temp directory
    if (!fs.existsSync(CONFIG.tempDir)) {
        fs.mkdirSync(CONFIG.tempDir, { recursive: true });
    }
    console.log(`✓ Temporary directory: ${CONFIG.tempDir}\n`);
}

// ============================================================================
// IMAGE DISCOVERY
// ============================================================================

/**
 * Find all images in source directories
 */
function findAllImages() {
    console.log('🔎 Scanning for images...\n');
    const images = [];
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

    function scanDirectory(dir) {
        if (!fs.existsSync(dir)) return;

        const items = fs.readdirSync(dir);

        for (const item of items) {
            const fullPath = path.join(dir, item);

            // Skip node_modules, .git, dist, and already optimized folders
            if (item === 'node_modules' || item === '.git' || item === 'dist' ||
                item === 'optimized' || item === 'temp-optimized') {
                continue;
            }

            try {
                const stat = fs.statSync(fullPath);

                if (stat.isDirectory()) {
                    scanDirectory(fullPath);
                } else if (stat.isFile()) {
                    const ext = path.extname(item).toLowerCase();
                    if (imageExtensions.includes(ext)) {
                        images.push(fullPath);
                        stats.found++;
                    }
                }
            } catch (error) {
                console.warn(`⚠️  Could not access: ${fullPath}`);
            }
        }
    }

    CONFIG.sourceDirs.forEach(dir => {
        console.log(`  Scanning: ${dir}`);
        scanDirectory(dir);
    });

    console.log(`\n✓ Found ${stats.found} images\n`);
    return images;
}

// ============================================================================
// IMAGE OPTIMIZATION
// ============================================================================

/**
 * Optimize a single image
 */
async function optimizeImage(inputPath) {
    const settings = getOptimizationSettings(inputPath);
    const originalSize = getFileSize(inputPath);

    // Create output path maintaining directory structure
    const relativePath = path.relative(
        path.join(__dirname, '..'),
        inputPath
    );
    const outputPath = path.join(CONFIG.tempDir, relativePath);
    const outputDir = path.dirname(outputPath);

    // Create output directory
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    try {
        // Get image metadata
        const metadata = await sharp(inputPath).metadata();

        // Calculate new dimensions (maintain aspect ratio)
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

        // Optimize and convert to WebP
        await sharp(inputPath)
            .resize(width, height, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .webp({
                quality: settings.quality,
                effort: settings.effort
            })
            .toFile(outputPath.replace(path.extname(outputPath), '.webp'));

        const optimizedPath = outputPath.replace(path.extname(outputPath), '.webp');
        const optimizedSize = getFileSize(optimizedPath);
        const savings = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);

        stats.originalSize += originalSize;
        stats.optimizedSize += optimizedSize;
        stats.optimized++;

        console.log(`  ✓ ${path.basename(inputPath)} [${settings.type}]`);
        console.log(`    ${formatBytes(originalSize)} → ${formatBytes(optimizedSize)} (${savings}% reduction)`);

        return optimizedPath;
    } catch (error) {
        console.error(`  ✗ Failed to optimize ${path.basename(inputPath)}: ${error.message}`);
        stats.errors++;
        return null;
    }
}

/**
 * Optimize all images
 */
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

/**
 * Upload a single image to Cloudinary with retries
 */
async function uploadToCloudinary(imagePath, originalPath, retries = CONFIG.upload.retries) {
    const folder = getCloudinaryFolder(originalPath);
    const fileName = path.basename(imagePath, path.extname(imagePath));

    try {
        const result = await cloudinary.uploader.upload(imagePath, {
            folder: folder,
            public_id: fileName,
            use_filename: true,
            unique_filename: false,
            overwrite: true,
            resource_type: 'auto',
            quality: 'auto:good',
            fetch_format: 'auto'
        });

        stats.uploaded++;
        stats.uploadedSize += result.bytes;

        // Get relative path for mapping key
        const relativeOriginal = getRelativeOriginalPath(originalPath);

        // Store in appropriate mapping
        const mapping = {
            original: relativeOriginal,
            cloudinary: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            width: result.width,
            height: result.height,
            bytes: result.bytes
        };

        // Determine category and use relative path as key
        const pathLower = originalPath.toLowerCase();
        if (pathLower.includes('gallery')) {
            urlMappings.gallery[relativeOriginal] = mapping;
        } else if (pathLower.includes('collection') || pathLower.includes('furniture') || pathLower.includes('slab')) {
            urlMappings.products[relativeOriginal] = mapping;
        }
        urlMappings.all[relativeOriginal] = mapping;

        console.log(`  ✓ ${path.basename(imagePath)}`);
        console.log(`    → ${result.secure_url}`);

        return result;
    } catch (error) {
        if (retries > 0) {
            console.warn(`  ⚠️  Upload failed, retrying... (${retries} attempts left)`);
            await sleep(CONFIG.upload.retryDelay);
            return uploadToCloudinary(imagePath, originalPath, retries - 1);
        } else {
            console.error(`  ✗ Failed to upload ${path.basename(imagePath)}: ${error.message}`);
            stats.errors++;
            return null;
        }
    }
}

/**
 * Upload all optimized images with concurrency control
 */
async function uploadAllImages(optimizedImages) {
    console.log('☁️  Uploading to Cloudinary...\n');

    const chunks = [];
    for (let i = 0; i < optimizedImages.length; i += CONFIG.upload.concurrency) {
        chunks.push(optimizedImages.slice(i, i + CONFIG.upload.concurrency));
    }

    for (const chunk of chunks) {
        await Promise.all(
            chunk.map(({ optimized, original }) =>
                uploadToCloudinary(optimized, original)
            )
        );
    }

    console.log(`\n✓ Uploaded ${stats.uploaded} images\n`);
}

// ============================================================================
// SAVE MAPPINGS
// ============================================================================

/**
 * Save URL mappings to files
 */
function saveMappings() {
    console.log('💾 Saving URL mappings...\n');

    const metadata = {
        generated: new Date().toISOString(),
        cloudName: CONFIG.cloudinary.cloud_name,
        stats: {
            found: stats.found,
            optimized: stats.optimized,
            uploaded: stats.uploaded,
            errors: stats.errors,
            originalSize: formatBytes(stats.originalSize),
            optimizedSize: formatBytes(stats.optimizedSize),
            uploadedSize: formatBytes(stats.uploadedSize)
        }
    };

    // Save gallery mappings
    if (Object.keys(urlMappings.gallery).length > 0) {
        fs.writeFileSync(
            CONFIG.outputFiles.gallery,
            JSON.stringify({ ...metadata, urls: urlMappings.gallery }, null, 2)
        );
        console.log(`  ✓ Gallery mappings: ${CONFIG.outputFiles.gallery}`);
    }

    // Save product mappings
    if (Object.keys(urlMappings.products).length > 0) {
        fs.writeFileSync(
            CONFIG.outputFiles.products,
            JSON.stringify({ ...metadata, urls: urlMappings.products }, null, 2)
        );
        console.log(`  ✓ Product mappings: ${CONFIG.outputFiles.products}`);
    }

    // Save all mappings
    fs.writeFileSync(
        CONFIG.outputFiles.all,
        JSON.stringify({ ...metadata, urls: urlMappings.all }, null, 2)
    );
    console.log(`  ✓ All mappings: ${CONFIG.outputFiles.all}\n`);
}

// ============================================================================
// CLEANUP
// ============================================================================

/**
 * Clean up temporary files
 */
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

/**
 * Generate final report
 */
function generateReport() {
    const duration = ((Date.now() - stats.startTime) / 1000).toFixed(1);
    const optimizationSavings = ((stats.originalSize - stats.optimizedSize) / stats.originalSize * 100).toFixed(1);

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
    console.log(`  Gallery images: ${Object.keys(urlMappings.gallery).length}`);
    console.log(`  Product images: ${Object.keys(urlMappings.products).length}\n`);

    console.log(`Duration: ${duration}s`);
    console.log('='.repeat(70));

    console.log('\n📝 Next Steps:');
    console.log('  1. Review uploaded images: https://cloudinary.com/console/media_library');
    console.log('  2. Check URL mappings in generated JSON files');
    console.log('  3. Update your code to use Cloudinary URLs');
    console.log('  4. Test locally: cd frontend && npm run dev');
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

async function main() {
    console.log('='.repeat(70));
    console.log('🚀 COMPLETE IMAGE OPTIMIZATION & CLOUDINARY UPLOAD');
    console.log('='.repeat(70));
    console.log();

    try {
        // Step 1: Validate configuration
        validateConfig();

        // Step 2: Find all images
        const images = findAllImages();

        if (images.length === 0) {
            console.log('⚠️  No images found to process.');
            return;
        }

        // Step 3: Optimize images
        const optimizedImages = await optimizeAllImages(images);

        if (optimizedImages.length === 0) {
            console.log('⚠️  No images were successfully optimized.');
            return;
        }

        // Step 4: Upload to Cloudinary
        await uploadAllImages(optimizedImages);

        // Step 5: Save mappings
        saveMappings();

        // Step 6: Cleanup
        cleanup();

        // Step 7: Generate report
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
