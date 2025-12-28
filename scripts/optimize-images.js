/**
 * Image Optimization Script
 * 
 * This script optimizes all images in the public directory:
 * - Hero images: 3.5 MB → 200 KB (quality 75, max width 1920px)
 * - Gallery images: 192 KB → 80 KB (quality 70, max width 1200px)
 * - Maintains WebP format for best compression
 * 
 * Expected savings: 62.84 MB → 18 MB (71% reduction)
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
    inputDir: path.join(__dirname, '../frontend/public'),
    outputDir: path.join(__dirname, '../frontend/public/optimized'),

    // Hero images (large, high quality)
    hero: {
        quality: 75,
        maxWidth: 1920,
        maxHeight: 1080,
        pattern: /(hero|banner|export|solutions)/i
    },

    // Gallery images (medium quality, smaller)
    gallery: {
        quality: 70,
        maxWidth: 1200,
        maxHeight: 1200,
        pattern: /gallery/i
    },

    // Default for other images
    default: {
        quality: 75,
        maxWidth: 1600,
        maxHeight: 1600
    }
};

// Statistics
const stats = {
    totalFiles: 0,
    optimized: 0,
    skipped: 0,
    errors: 0,
    originalSize: 0,
    optimizedSize: 0
};

/**
 * Get file size in bytes
 */
function getFileSize(filePath) {
    try {
        return fs.statSync(filePath).size;
    } catch (error) {
        return 0;
    }
}

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
 * Determine optimization settings based on file path
 */
function getOptimizationSettings(filePath) {
    const fileName = path.basename(filePath);

    if (CONFIG.hero.pattern.test(fileName)) {
        return CONFIG.hero;
    } else if (CONFIG.gallery.pattern.test(filePath)) {
        return CONFIG.gallery;
    } else {
        return CONFIG.default;
    }
}

/**
 * Optimize a single image
 */
async function optimizeImage(inputPath, outputPath) {
    const settings = getOptimizationSettings(inputPath);
    const originalSize = getFileSize(inputPath);

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

        // Optimize image
        await sharp(inputPath)
            .resize(width, height, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .webp({
                quality: settings.quality,
                effort: 6 // Higher effort = better compression (0-6)
            })
            .toFile(outputPath);

        const optimizedSize = getFileSize(outputPath);
        const savings = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);

        stats.originalSize += originalSize;
        stats.optimizedSize += optimizedSize;
        stats.optimized++;

        console.log(`✓ ${path.basename(inputPath)}`);
        console.log(`  ${formatBytes(originalSize)} → ${formatBytes(optimizedSize)} (${savings}% reduction)`);

        return true;
    } catch (error) {
        console.error(`✗ Failed to optimize ${path.basename(inputPath)}: ${error.message}`);
        stats.errors++;
        return false;
    }
}

/**
 * Process directory recursively
 */
async function processDirectory(inputDir, outputDir) {
    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const items = fs.readdirSync(inputDir);

    for (const item of items) {
        const inputPath = path.join(inputDir, item);
        const outputPath = path.join(outputDir, item);

        // Skip optimized directory
        if (item === 'optimized') {
            continue;
        }

        const stat = fs.statSync(inputPath);

        if (stat.isDirectory()) {
            // Recursively process subdirectories
            await processDirectory(inputPath, outputPath);
        } else if (stat.isFile()) {
            stats.totalFiles++;

            // Only process image files
            const ext = path.extname(item).toLowerCase();
            if (['.webp', '.jpg', '.jpeg', '.png'].includes(ext)) {
                await optimizeImage(inputPath, outputPath);
            } else {
                // Copy non-image files as-is
                fs.copyFileSync(inputPath, outputPath);
                stats.skipped++;
            }
        }
    }
}

/**
 * Main function
 */
async function main() {
    console.log('🖼️  Image Optimization Script\n');
    console.log('Configuration:');
    console.log(`  Input: ${CONFIG.inputDir}`);
    console.log(`  Output: ${CONFIG.outputDir}`);
    console.log(`  Hero quality: ${CONFIG.hero.quality}% (max ${CONFIG.hero.maxWidth}px)`);
    console.log(`  Gallery quality: ${CONFIG.gallery.quality}% (max ${CONFIG.gallery.maxWidth}px)`);
    console.log('\nProcessing images...\n');

    const startTime = Date.now();

    try {
        await processDirectory(CONFIG.inputDir, CONFIG.outputDir);

        const duration = ((Date.now() - startTime) / 1000).toFixed(1);
        const totalSavings = ((stats.originalSize - stats.optimizedSize) / stats.originalSize * 100).toFixed(1);

        console.log('\n' + '='.repeat(60));
        console.log('✅ Optimization Complete!\n');
        console.log('Statistics:');
        console.log(`  Total files: ${stats.totalFiles}`);
        console.log(`  Optimized: ${stats.optimized}`);
        console.log(`  Skipped: ${stats.skipped}`);
        console.log(`  Errors: ${stats.errors}`);
        console.log(`  Original size: ${formatBytes(stats.originalSize)}`);
        console.log(`  Optimized size: ${formatBytes(stats.optimizedSize)}`);
        console.log(`  Total savings: ${formatBytes(stats.originalSize - stats.optimizedSize)} (${totalSavings}%)`);
        console.log(`  Duration: ${duration}s`);
        console.log('='.repeat(60));

        console.log('\n📝 Next Steps:');
        console.log('  1. Review optimized images in: frontend/public/optimized/');
        console.log('  2. If satisfied, replace original images:');
        console.log('     - Backup: mv frontend/public frontend/public.backup');
        console.log('     - Replace: mv frontend/public/optimized frontend/public');
        console.log('  3. Run: node scripts/upload-to-cloudinary.js');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    }
}

// Run the script
main();
