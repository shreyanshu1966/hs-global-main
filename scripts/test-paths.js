/**
 * Test script to verify path formatting
 */

const path = require('path');

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

function getCloudinaryFolder(filePath) {
    const pathLower = filePath.toLowerCase();
    const parts = filePath.split(path.sep);
    const folder_prefix = 'hs-global';

    // Handle gallery images
    if (pathLower.includes('gallery')) {
        const galleryIndex = parts.findIndex(p => p.toLowerCase() === 'gallery');
        if (galleryIndex >= 0 && galleryIndex < parts.length - 1) {
            const subPath = parts.slice(galleryIndex + 1, -1).join('/');
            return `${folder_prefix}/gallery${subPath ? '/' + subPath : ''}`;
        }
        return `${folder_prefix}/gallery`;
    }

    // Handle Collection images - INCLUDE "Collection" in the path
    if (pathLower.includes('collection')) {
        const collectionIndex = parts.findIndex(p => p === 'Collection');
        if (collectionIndex >= 0 && collectionIndex < parts.length - 1) {
            // Include "Collection" in the Cloudinary path
            const subPath = parts.slice(collectionIndex, -1).join('/');
            return `${folder_prefix}/products/${subPath}`;
        }
        return `${folder_prefix}/products/Collection`;
    }

    // Handle furnitures images - INCLUDE "furnitures" in the path
    if (pathLower.includes('furniture')) {
        const furnituresIndex = parts.findIndex(p => p === 'furnitures');
        if (furnituresIndex >= 0 && furnituresIndex < parts.length - 1) {
            // Include "furnitures" in the Cloudinary path
            const subPath = parts.slice(furnituresIndex, -1).join('/');
            return `${folder_prefix}/products/${subPath}`;
        }
        return `${folder_prefix}/products/furnitures`;
    }

    return `${folder_prefix}/misc`;
}

// Test cases
const testPaths = [
    'C:\\Users\\rames\\Downloads\\hs-global-main\\hs-global-main\\frontend\\src\\assets\\Collection\\Granite\\Alaska\\Alaska Pink\\alaska-pink1.webp',
    'C:\\Users\\rames\\Downloads\\hs-global-main\\hs-global-main\\frontend\\src\\assets\\furnitures\\Wash Basins\\Pedestal\\test.webp',
    'C:\\Users\\rames\\Downloads\\hs-global-main\\hs-global-main\\frontend\\public\\gallery\\Wash Basins\\test.webp'
];

console.log('Testing path formatting:\n');

testPaths.forEach(testPath => {
    console.log('Input:', testPath);
    console.log('Original (key):', getRelativeOriginalPath(testPath));
    console.log('Cloudinary folder:', getCloudinaryFolder(testPath));
    console.log('---');
});

console.log('\nExpected output for Collection:');
console.log('Original: Collection/Granite/Alaska/Alaska Pink/alaska-pink1.webp');
console.log('Folder: hs-global/products/Collection/Granite/Alaska/Alaska Pink');

console.log('\nExpected output for furnitures:');
console.log('Original: furnitures/Wash Basins/Pedestal/test.webp');
console.log('Folder: hs-global/products/furnitures/Wash Basins/Pedestal');
