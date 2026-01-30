/**
 * ✨ SMART CLOUDINARY RESPONSIVE IMAGE UPLOAD SCRIPT ✨
 * 
 * Features:
 * ✅ WebP Conversion - All images converted to WebP format
 * ✅ Multiple Resolutions - Creates responsive variants (mobile, tablet, desktop, large)
 * ✅ Smart Compression - NEVER increases file size (quality auto-adjusted)
 * ✅ Smart Categorization - Auto-categorizes images (banners, products, gallery, logos)
 * ✅ Parallel Uploads - Fast uploads with retry logic
 * ✅ URL Mapping - Generates JSON files for easy integration
 * 
 * @author HS Global Export
 * @version 2.0
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
    tempDir: path.join(__dirname, '../temp-responsive'),

    // Output mapping files
    outputFiles: {
        responsive: path.join(__dirname, '../cloudinary-responsive-urls.json'),
        gallery: path.join(__dirname, '../cloudinary-gallery-urls.json'),
        products: path.join(__dirname, '../cloudinary-product-urls.json'),
        all: path.join(__dirname, '../cloudinary-all-urls.json'),
    },

    // Cloudinary configuration
    cloudinary: {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        folder_prefix: 'hs-global'
    },

    // Responsive breakpoints
    resolutions: {
        mobile: { width: 480, suffix: 'mobile' },
        tablet: { width: 768, suffix: 'tablet' },
        desktop: { width: 1200, suffix: 'desktop' },
        large: { width: 1920, suffix: 'large' }
    },

    // Smart compression settings by category
    categories: {
        banners: {
            pattern: /(banner|hero|export|solutions)/i,
            quality: { min: 80, max: 95, start: 90 },
            maxOriginalWidth: 1920,
            description: 'Hero/Banner Images'
        },
        products: {
            pattern: /(collection|furniture|slab|product)/i,
            quality: { min: 85, max: 95, start: 92 },
            maxOriginalWidth: 1600,
            description: 'Product Images'
        },
        gallery: {
            pattern: /gallery/i,
            quality: { min: 75, max: 90, start: 85 },
            maxOriginalWidth: 1400,
            description: 'Gallery Images'
        },
        logos: {
            pattern: /(logo|icon)/i,
            quality: { min: 90, max: 100, start: 95 },
            maxOriginalWidth: 800,
            description: 'Logos/Icons'
        },
        default: {
            quality: { min: 75, max: 90, start: 85 },
            maxOriginalWidth: 1600,
            description: 'General Images'
        }
    },

    // Upload settings
    upload: {
        concurrency: 5,
        retries: 3,
        retryDelay: 2000,
    }
};

// ============================================================================
// STATISTICS
// ============================================================================

const stats = {
    found: 0,
    processed: 0,
    uploaded: 0,
    skipped: 0,
    errors: 0,
    originalSize: 0,
    totalOptimizedSize: 0,
    variantsCreated: 0,
    startTime: Date.now(),
    categoryStats: {}
};

// URL mappings
const urlMappings = {
    responsive: {},
    gallery: {},
    products: {},
    all: {}
};

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

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================================
// SMART CATEGORIZATION
// ============================================================================

/**
 * Intelligently categorize image based on path and characteristics
 */
function categorizeImage(filePath, metadata = null) {
    const pathLower = filePath.toLowerCase();

    // Check patterns
    for (const [category, settings] of Object.entries(CONFIG.categories)) {
        if (category !== 'default' && settings.pattern && settings.pattern.test(pathLower)) {
            return { category, ...settings };
        }
    }

    // If metadata available, use dimensions for smart categorization
    if (metadata) {
        const aspectRatio = metadata.width / metadata.height;

        // Wide images are likely banners
        if (aspectRatio > 2.5 && metadata.width > 1200) {
            return { category: 'banners', ...CONFIG.categories.banners };
        }

        // Square-ish small images are likely logos
        if (aspectRatio > 0.8 && aspectRatio < 1.2 && metadata.width < 600) {
            return { category: 'logos', ...CONFIG.categories.logos };
        }
    }

    return { category: 'default', ...CONFIG.categories.default };
}

// ============================================================================
// CLOUDINARY PATH HELPERS
// ============================================================================

function getCloudinaryFolder(filePath, category) {
    const parts = filePath.split(path.sep);
    const pathLower = filePath.toLowerCase();

    // Handle gallery images
    if (pathLower.includes('gallery')) {
        const galleryIndex = parts.findIndex(p => p.toLowerCase() === 'gallery');
        if (galleryIndex >= 0 && galleryIndex < parts.length - 1) {
            const subPath = parts.slice(galleryIndex + 1, -1).join('/');
            return `${CONFIG.cloudinary.folder_prefix}/gallery${subPath ? '/' + subPath : ''}`;
        }
        return `${CONFIG.cloudinary.folder_prefix}/gallery`;
    }

    // Handle Collection images
    if (pathLower.includes('collection')) {
        const collectionIndex = parts.findIndex(p => p === 'Collection');
        if (collectionIndex >= 0) {
            const subPath = parts.slice(collectionIndex, -1).join('/');
            return `${CONFIG.cloudinary.folder_prefix}/products/${subPath}`;
        }
        return `${CONFIG.cloudinary.folder_prefix}/products/Collection`;
    }

    // Handle furniture images
    if (pathLower.includes('furniture')) {
        const furnituresIndex = parts.findIndex(p => p === 'furnitures');
        if (furnituresIndex >= 0) {
            const subPath = parts.slice(furnituresIndex, -1).join('/');
            return `${CONFIG.cloudinary.folder_prefix}/products/${subPath}`;
        }
        return `${CONFIG.cloudinary.folder_prefix}/products/furnitures`;
    }

    // Category-based folders
    return `${CONFIG.cloudinary.folder_prefix}/${category}`;
}

function getRelativeOriginalPath(filePath) {
    const parts = filePath.split(path.sep);

    const collectionIndex = parts.findIndex(p => p === 'Collection');
    const furnituresIndex = parts.findIndex(p => p === 'furnitures');
    const galleryIndex = parts.findIndex(p => p.toLowerCase() === 'gallery');

    if (collectionIndex >= 0) {
        return parts.slice(collectionIndex).join('/');
    } else if (furnituresIndex >= 0) {
        return parts.slice(furnituresIndex).join('/');
    } else if (galleryIndex >= 0) {
        return 'gallery/' + parts.slice(galleryIndex + 1).join('/');
    }

    return path.basename(filePath);
}

// ============================================================================
// SMART COMPRESSION ENGINE
// ============================================================================

/**
 * Smart compression that NEVER increases file size
 * Automatically adjusts quality to ensure optimal compression
 */
async function smartCompress(inputPath, outputPath, targetWidth, categorySettings, originalSize) {
    let quality = categorySettings.quality.start;
    const minQuality = categorySettings.quality.min;
    const maxQuality = categorySettings.quality.max;

    try {
        // Get metadata
        const metadata = await sharp(inputPath).metadata();

        // Calculate dimensions maintaining aspect ratio
        let width = targetWidth;
        let height = Math.round((metadata.height * targetWidth) / metadata.width);

        // Don't upscale images
        if (width > metadata.width) {
            width = metadata.width;
            height = metadata.height;
        }

        let attempt = 0;
        let bestQuality = quality;
        let bestSize = Infinity;
        let bestPath = null;

        // Try different quality levels to find optimal compression
        while (attempt < 5) {
            const tempPath = outputPath.replace('.webp', `_q${quality}.webp`);

            await sharp(inputPath)
                .resize(width, height, {
                    fit: 'inside',
                    withoutEnlargement: true,
                    kernel: sharp.kernel.lanczos3
                })
                .webp({
                    quality: quality,
                    effort: 6,
                    smartSubsample: true
                })
                .toFile(tempPath);

            const compressedSize = getFileSize(tempPath);

            // If this is smaller than original and smaller than our best attempt
            if (compressedSize < originalSize && compressedSize < bestSize) {
                // Clean up previous best
                if (bestPath && fs.existsSync(bestPath)) {
                    fs.unlinkSync(bestPath);
                }
                bestSize = compressedSize;
                bestQuality = quality;
                bestPath = tempPath;
            } else {
                // Clean up this attempt
                if (fs.existsSync(tempPath)) {
                    fs.unlinkSync(tempPath);
                }
            }

            // If size increased, we've gone too far
            if (compressedSize > originalSize) {
                // Try lower quality
                quality = Math.max(minQuality, quality - 5);
            } else if (compressedSize < originalSize * 0.7) {
                // We have good compression, try slightly higher quality
                quality = Math.min(maxQuality, quality + 3);
            } else {
                // Good enough
                break;
            }

            attempt++;

            // Prevent infinite loop
            if (quality <= minQuality || quality >= maxQuality) {
                break;
            }
        }

        // Rename best file to final output
        if (bestPath && fs.existsSync(bestPath)) {
            if (bestPath !== outputPath) {
                fs.renameSync(bestPath, outputPath);
            }

            return {
                success: true,
                size: bestSize,
                quality: bestQuality,
                width: width,
                height: height,
                savings: ((originalSize - bestSize) / originalSize * 100).toFixed(1)
            };
        }

        // If no compression worked, copy original
        return {
            success: false,
            reason: 'Could not compress smaller than original'
        };

    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

// ============================================================================
// IMAGE PROCESSING
// ============================================================================

/**
 * Process single image - create all responsive variants
 */
async function processImage(inputPath) {
    const originalSize = getFileSize(inputPath);
    const metadata = await sharp(inputPath).metadata();
    const categoryInfo = categorizeImage(inputPath, metadata);

    console.log(`\n📸 Processing: ${path.basename(inputPath)}`);
    console.log(`   Category: ${categoryInfo.category} | Original: ${formatBytes(originalSize)} | ${metadata.width}x${metadata.height}`);

    // Update category stats
    if (!stats.categoryStats[categoryInfo.category]) {
        stats.categoryStats[categoryInfo.category] = { count: 0, size: 0 };
    }
    stats.categoryStats[categoryInfo.category].count++;
    stats.categoryStats[categoryInfo.category].size += originalSize;

    const variants = {};
    let totalVariantSize = 0;

    // Create responsive variants
    for (const [breakpoint, config] of Object.entries(CONFIG.resolutions)) {
        // Skip if target width is larger than original
        if (config.width > metadata.width) {
            console.log(`   ⏭️  Skipping ${breakpoint} (${config.width}px) - larger than original`);
            continue;
        }

        const outputDir = path.join(CONFIG.tempDir, categoryInfo.category, breakpoint);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const fileName = path.basename(inputPath, path.extname(inputPath));
        const outputPath = path.join(outputDir, `${fileName}.webp`);

        const result = await smartCompress(
            inputPath,
            outputPath,
            config.width,
            categoryInfo,
            originalSize
        );

        if (result.success) {
            variants[breakpoint] = {
                path: outputPath,
                width: result.width,
                height: result.height,
                size: result.size,
                quality: result.quality
            };
            totalVariantSize += result.size;
            stats.variantsCreated++;

            console.log(`   ✅ ${breakpoint}: ${formatBytes(result.size)} (Q:${result.quality}, ${result.savings}% saved)`);
        } else {
            console.log(`   ⚠️  ${breakpoint}: ${result.reason || result.error}`);
        }
    }

    stats.processed++;
    stats.originalSize += originalSize;
    stats.totalOptimizedSize += totalVariantSize;

    return {
        original: inputPath,
        category: categoryInfo.category,
        variants: variants,
        metadata: {
            originalWidth: metadata.width,
            originalHeight: metadata.height,
            originalSize: originalSize,
            totalVariantSize: totalVariantSize
        }
    };
}

// ============================================================================
// IMAGE DISCOVERY
// ============================================================================

function findAllImages() {
    console.log('🔎 Scanning for images...\n');
    const images = [];
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

    function scanDirectory(dir) {
        if (!fs.existsSync(dir)) return;

        const items = fs.readdirSync(dir);

        for (const item of items) {
            const fullPath = path.join(dir, item);

            if (item === 'node_modules' || item === '.git' || item === 'dist' ||
                item === 'optimized' || item === 'temp-responsive' || item === 'temp-optimized') {
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

    console.log(`\n✅ Found ${stats.found} images\n`);
    return images;
}

// ============================================================================
// CLOUDINARY UPLOAD
// ============================================================================

async function uploadVariantToCloudinary(variantPath, originalPath, breakpoint, category, retries = CONFIG.upload.retries) {
    const folder = getCloudinaryFolder(originalPath, category);
    const fileName = path.basename(variantPath, path.extname(variantPath));
    const publicId = `${fileName}_${breakpoint}`;

    try {
        const result = await cloudinary.uploader.upload(variantPath, {
            folder: folder,
            public_id: publicId,
            use_filename: false,
            unique_filename: false,
            overwrite: true,
            resource_type: 'auto'
        });

        return {
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            bytes: result.bytes,
            format: result.format
        };

    } catch (error) {
        if (retries > 0) {
            console.warn(`     ⚠️  Upload failed, retrying... (${retries} left)`);
            await sleep(CONFIG.upload.retryDelay);
            return uploadVariantToCloudinary(variantPath, originalPath, breakpoint, category, retries - 1);
        } else {
            throw error;
        }
    }
}

async function uploadProcessedImage(processedImage) {
    console.log(`\n☁️  Uploading: ${path.basename(processedImage.original)}`);

    const uploadedVariants = {};

    for (const [breakpoint, variant] of Object.entries(processedImage.variants)) {
        try {
            const result = await uploadVariantToCloudinary(
                variant.path,
                processedImage.original,
                breakpoint,
                processedImage.category
            );

            uploadedVariants[breakpoint] = {
                url: result.url,
                width: result.width,
                height: result.height,
                bytes: result.bytes
            };

            console.log(`   ✅ ${breakpoint}: ${result.url}`);
            stats.uploaded++;

        } catch (error) {
            console.error(`   ❌ ${breakpoint}: ${error.message}`);
            stats.errors++;
        }
    }

    // Store in mappings
    const relativeOriginal = getRelativeOriginalPath(processedImage.original);
    const mapping = {
        original: relativeOriginal,
        category: processedImage.category,
        variants: uploadedVariants,
        metadata: processedImage.metadata
    };

    // Store in appropriate categories
    urlMappings.all[relativeOriginal] = mapping;

    if (processedImage.category === 'gallery') {
        urlMappings.gallery[relativeOriginal] = mapping;
    } else if (processedImage.category === 'products') {
        urlMappings.products[relativeOriginal] = mapping;
    }

    urlMappings.responsive[relativeOriginal] = mapping;

    return uploadedVariants;
}

// ============================================================================
// BATCH PROCESSING
// ============================================================================

async function processAllImages(images) {
    console.log('🎨 Processing all images...\n');

    const processedImages = [];

    for (const imagePath of images) {
        try {
            const processed = await processImage(imagePath);
            if (Object.keys(processed.variants).length > 0) {
                processedImages.push(processed);
            }
        } catch (error) {
            console.error(`❌ Error processing ${path.basename(imagePath)}: ${error.message}`);
            stats.errors++;
        }
    }

    return processedImages;
}

async function uploadAllImages(processedImages) {
    console.log('\n☁️  Uploading to Cloudinary...\n');

    // Upload in batches
    const chunks = [];
    for (let i = 0; i < processedImages.length; i += CONFIG.upload.concurrency) {
        chunks.push(processedImages.slice(i, i + CONFIG.upload.concurrency));
    }

    for (const chunk of chunks) {
        await Promise.all(
            chunk.map(img => uploadProcessedImage(img))
        );
    }
}

// ============================================================================
// SAVE MAPPINGS
// ============================================================================

function saveMappings() {
    console.log('\n💾 Saving URL mappings...\n');

    const metadata = {
        generated: new Date().toISOString(),
        cloudName: CONFIG.cloudinary.cloud_name,
        resolutions: CONFIG.resolutions,
        stats: {
            found: stats.found,
            processed: stats.processed,
            uploaded: stats.uploaded,
            variantsCreated: stats.variantsCreated,
            errors: stats.errors,
            originalSize: formatBytes(stats.originalSize),
            optimizedSize: formatBytes(stats.totalOptimizedSize),
            savings: ((stats.originalSize - stats.totalOptimizedSize) / stats.originalSize * 100).toFixed(1) + '%'
        },
        categories: stats.categoryStats
    };

    // Save all mappings
    fs.writeFileSync(
        CONFIG.outputFiles.all,
        JSON.stringify({ ...metadata, urls: urlMappings.all }, null, 2)
    );
    console.log(`  ✅ All mappings: ${CONFIG.outputFiles.all}`);

    // Save responsive mappings
    fs.writeFileSync(
        CONFIG.outputFiles.responsive,
        JSON.stringify({ ...metadata, urls: urlMappings.responsive }, null, 2)
    );
    console.log(`  ✅ Responsive mappings: ${CONFIG.outputFiles.responsive}`);

    // Save gallery mappings
    if (Object.keys(urlMappings.gallery).length > 0) {
        fs.writeFileSync(
            CONFIG.outputFiles.gallery,
            JSON.stringify({ ...metadata, urls: urlMappings.gallery }, null, 2)
        );
        console.log(`  ✅ Gallery mappings: ${CONFIG.outputFiles.gallery}`);
    }

    // Save product mappings
    if (Object.keys(urlMappings.products).length > 0) {
        fs.writeFileSync(
            CONFIG.outputFiles.products,
            JSON.stringify({ ...metadata, urls: urlMappings.products }, null, 2)
        );
        console.log(`  ✅ Product mappings: ${CONFIG.outputFiles.products}`);
    }
}

// ============================================================================
// CLEANUP
// ============================================================================

function cleanup() {
    console.log('\n🧹 Cleaning up temporary files...\n');

    try {
        if (fs.existsSync(CONFIG.tempDir)) {
            fs.rmSync(CONFIG.tempDir, { recursive: true, force: true });
            console.log(`  ✅ Removed: ${CONFIG.tempDir}`);
        }
    } catch (error) {
        console.warn(`  ⚠️  Could not remove temp directory: ${error.message}`);
    }
}

// ============================================================================
// REPORTING
// ============================================================================

function generateReport() {
    const duration = ((Date.now() - stats.startTime) / 1000).toFixed(1);
    const optimizationSavings = ((stats.originalSize - stats.totalOptimizedSize) / stats.originalSize * 100).toFixed(1);

    console.log('\n' + '='.repeat(70));
    console.log('📊 FINAL REPORT\n');

    console.log('Image Processing:');
    console.log(`  Found: ${stats.found}`);
    console.log(`  Processed: ${stats.processed}`);
    console.log(`  Variants Created: ${stats.variantsCreated}`);
    console.log(`  Uploaded: ${stats.uploaded}`);
    console.log(`  Errors: ${stats.errors}\n`);

    console.log('Size Optimization:');
    console.log(`  Original size: ${formatBytes(stats.originalSize)}`);
    console.log(`  Optimized size: ${formatBytes(stats.totalOptimizedSize)}`);
    console.log(`  Savings: ${formatBytes(stats.originalSize - stats.totalOptimizedSize)} (${optimizationSavings}%)\n`);

    console.log('Category Breakdown:');
    for (const [category, data] of Object.entries(stats.categoryStats)) {
        console.log(`  ${category}: ${data.count} images (${formatBytes(data.size)})`);
    }

    console.log(`\nDuration: ${duration}s`);
    console.log('='.repeat(70));

    console.log('\n📝 Next Steps:');
    console.log('  1. Review uploaded images: https://cloudinary.com/console/media_library');
    console.log('  2. Check URL mappings in generated JSON files');
    console.log('  3. Use responsive URLs in your frontend code');
    console.log('  4. Test locally: cd frontend && npm run dev');
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
    console.log(`✅ Connected to Cloudinary: ${CONFIG.cloudinary.cloud_name}`);

    if (!fs.existsSync(CONFIG.tempDir)) {
        fs.mkdirSync(CONFIG.tempDir, { recursive: true });
    }
    console.log(`✅ Temporary directory: ${CONFIG.tempDir}\n`);
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

async function main() {
    console.log('='.repeat(70));
    console.log('🚀 SMART CLOUDINARY RESPONSIVE IMAGE UPLOAD');
    console.log('='.repeat(70));
    console.log();

    try {
        // Validate
        validateConfig();

        // Find images
        const images = findAllImages();
        if (images.length === 0) {
            console.log('⚠️  No images found to process.');
            return;
        }

        // Process images
        const processedImages = await processAllImages(images);
        if (processedImages.length === 0) {
            console.log('⚠️  No images were successfully processed.');
            return;
        }

        // Upload to Cloudinary
        await uploadAllImages(processedImages);

        // Save mappings
        saveMappings();

        // Cleanup
        cleanup();

        // Report
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
