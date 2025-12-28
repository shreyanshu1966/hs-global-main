/**
 * Image URL Migration Script
 * 
 * Automatically updates image URLs in React components to use Cloudinary.
 * This script:
 * - Scans all .tsx and .jsx files
 * - Finds image src attributes
 * - Replaces local paths with Cloudinary URLs
 * - Preserves existing Cloudinary URLs
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
    srcDir: path.join(__dirname, '../frontend/src'),
    urlMappingFile: path.join(__dirname, '../cloudinary-urls.json'),
    backupDir: path.join(__dirname, '../frontend/src.backup'),

    // File patterns to process
    filePatterns: ['.tsx', '.jsx', '.ts', '.js'],

    // Patterns to match image sources
    imagePatterns: [
        // <img src="/path/to/image.webp" />
        /src=["'](\/?[^"']+\.(webp|jpg|jpeg|png|gif))["']/gi,

        // <img src={"/path/to/image.webp"} />
        /src=\{["'](\/?[^"']+\.(webp|jpg|jpeg|png|gif))["']\}/gi,

        // backgroundImage: url('/path/to/image.webp')
        /url\(["'](\/?[^"']+\.(webp|jpg|jpeg|png|gif))["']\)/gi,

        // import image from '/path/to/image.webp'
        /from\s+["'](\/?[^"']+\.(webp|jpg|jpeg|png|gif))["']/gi
    ]
};

// Statistics
const stats = {
    filesScanned: 0,
    filesModified: 0,
    imagesReplaced: 0,
    errors: 0
};

// URL mapping from Cloudinary upload
let urlMapping = {};

/**
 * Load URL mapping from Cloudinary upload
 */
function loadUrlMapping() {
    if (!fs.existsSync(CONFIG.urlMappingFile)) {
        console.error(`❌ Error: URL mapping file not found: ${CONFIG.urlMappingFile}`);
        console.error('\nPlease run: node scripts/upload-to-cloudinary.js first');
        process.exit(1);
    }

    const data = JSON.parse(fs.readFileSync(CONFIG.urlMappingFile, 'utf8'));
    urlMapping = data.urls;

    console.log(`✓ Loaded ${Object.keys(urlMapping).length} URL mappings\n`);
}

/**
 * Create backup of source directory
 */
function createBackup() {
    if (fs.existsSync(CONFIG.backupDir)) {
        console.log('⚠️  Backup already exists, skipping...\n');
        return;
    }

    console.log('Creating backup...');
    fs.cpSync(CONFIG.srcDir, CONFIG.backupDir, { recursive: true });
    console.log(`✓ Backup created: ${CONFIG.backupDir}\n`);
}

/**
 * Get Cloudinary URL for a local path
 */
function getCloudinaryUrl(localPath) {
    // Remove leading slash
    const cleanPath = localPath.replace(/^\//, '');

    // Find in mapping
    const mapping = urlMapping[cleanPath];
    if (mapping) {
        return mapping.cloudinary;
    }

    // Try without 'optimized/' prefix
    const withoutOptimized = cleanPath.replace(/^optimized\//, '');
    const mappingWithoutOptimized = urlMapping[withoutOptimized];
    if (mappingWithoutOptimized) {
        return mappingWithoutOptimized.cloudinary;
    }

    // Not found
    return null;
}

/**
 * Process a single file
 */
function processFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        let replacements = 0;

        // Track if we need to add import
        let needsImport = false;
        let hasImport = content.includes('from \'@/utils/cloudinary\'') ||
            content.includes('from "@/utils/cloudinary"');

        // Process each pattern
        CONFIG.imagePatterns.forEach(pattern => {
            content = content.replace(pattern, (match, imagePath) => {
                // Skip if already a Cloudinary URL
                if (imagePath.includes('cloudinary.com')) {
                    return match;
                }

                // Skip external URLs
                if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
                    return match;
                }

                // Get Cloudinary URL
                const cloudinaryUrl = getCloudinaryUrl(imagePath);
                if (cloudinaryUrl) {
                    modified = true;
                    replacements++;

                    // Replace the URL in the match
                    return match.replace(imagePath, cloudinaryUrl);
                }

                // If not found in mapping, use helper function
                needsImport = true;
                const replacement = match.replace(
                    imagePath,
                    `{getCloudinaryUrl('${imagePath}')}`
                );
                modified = true;
                replacements++;
                return replacement;
            });
        });

        // Add import if needed
        if (needsImport && !hasImport) {
            // Find the last import statement
            const importRegex = /import\s+.*?from\s+['"].*?['"];?\n/g;
            const imports = content.match(importRegex);

            if (imports && imports.length > 0) {
                const lastImport = imports[imports.length - 1];
                const lastImportIndex = content.lastIndexOf(lastImport);
                const insertIndex = lastImportIndex + lastImport.length;

                content = content.slice(0, insertIndex) +
                    "import { getCloudinaryUrl } from '@/utils/cloudinary';\n" +
                    content.slice(insertIndex);
            }
        }

        // Write back if modified
        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            stats.filesModified++;
            stats.imagesReplaced += replacements;

            const relativePath = path.relative(CONFIG.srcDir, filePath);
            console.log(`✓ ${relativePath} (${replacements} images)`);
        }

        stats.filesScanned++;

    } catch (error) {
        console.error(`✗ Error processing ${filePath}: ${error.message}`);
        stats.errors++;
    }
}

/**
 * Process directory recursively
 */
function processDirectory(dir) {
    const items = fs.readdirSync(dir);

    for (const item of items) {
        const itemPath = path.join(dir, item);
        const stat = fs.statSync(itemPath);

        if (stat.isDirectory()) {
            // Skip node_modules and build directories
            if (!['node_modules', 'dist', 'build', '.git'].includes(item)) {
                processDirectory(itemPath);
            }
        } else if (stat.isFile()) {
            const ext = path.extname(item);
            if (CONFIG.filePatterns.includes(ext)) {
                processFile(itemPath);
            }
        }
    }
}

/**
 * Generate migration report
 */
function generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 Migration Report\n');
    console.log('Statistics:');
    console.log(`  Files scanned: ${stats.filesScanned}`);
    console.log(`  Files modified: ${stats.filesModified}`);
    console.log(`  Images replaced: ${stats.imagesReplaced}`);
    console.log(`  Errors: ${stats.errors}`);
    console.log('='.repeat(60));
}

/**
 * Main function
 */
function main() {
    console.log('🔄 Image URL Migration Script\n');

    // Load URL mapping
    loadUrlMapping();

    // Create backup
    createBackup();

    console.log('Processing files...\n');

    const startTime = Date.now();

    try {
        processDirectory(CONFIG.srcDir);

        const duration = ((Date.now() - startTime) / 1000).toFixed(1);

        // Generate report
        generateReport();

        console.log(`\n⏱️  Duration: ${duration}s`);

        if (stats.filesModified > 0) {
            console.log('\n📝 Next Steps:');
            console.log('  1. Review changes in modified files');
            console.log('  2. Test locally: cd frontend && npm run dev');
            console.log('  3. Check for any broken images');
            console.log('  4. If issues, restore from backup:');
            console.log(`     rm -rf ${CONFIG.srcDir} && mv ${CONFIG.backupDir} ${CONFIG.srcDir}`);
            console.log('  5. Commit changes when satisfied');
        } else {
            console.log('\n✓ No files needed modification');
        }

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error('\nRestore from backup:');
        console.error(`  rm -rf ${CONFIG.srcDir} && mv ${CONFIG.backupDir} ${CONFIG.srcDir}`);
        process.exit(1);
    }
}

// Run the script
main();
