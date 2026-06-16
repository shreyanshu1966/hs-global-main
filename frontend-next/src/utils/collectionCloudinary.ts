import productCloudinaryUrls from '../../../product-cloudinary-urls.json';

type CloudinaryMapping = {
    [key: string]: {
        original: string;
        cloudinary: string;
        publicId: string;
        format: string;
        width: number;
        height: number;
        bytes: number;
    };
};

const urlsData = productCloudinaryUrls as { urls: CloudinaryMapping };

/**
 * Get Cloudinary URL for a Collection image path
 * @param relativePath - Path relative to Collection folder (e.g., "Granite/Alaska/Alaska Pink/stand/stand.webp")
 * @returns Cloudinary URL or null if not found
 */
export function getCollectionCloudinaryUrl(relativePath: string): string | null {
    // Normalize the path
    const normalizedPath = relativePath.replace(/\\/g, '/');

    // Try with "Collection/" prefix
    const fullPath = `Collection/${normalizedPath}`;

    if (urlsData.urls[fullPath]) {
        return urlsData.urls[fullPath].cloudinary;
    }

    // Try without prefix in case it's already included
    if (urlsData.urls[normalizedPath]) {
        return urlsData.urls[normalizedPath].cloudinary;
    }

    return null;
}

/**
 * Get all Collection images for a specific category and product
 * @param category - Main category (e.g., "Marble", "Granite")
 * @param product - Product name (e.g., "Alaska Pink")
 * @returns Array of Cloudinary URLs
 */
export function getProductImages(category: string, product: string): string[] {
    const images: string[] = [];

    Object.entries(urlsData.urls).forEach(([path, data]) => {
        if (path.includes(`Collection/${category}`) && path.includes(product)) {
            images.push(data.cloudinary);
        }
    });

    return images;
}

/**
 * Get the stand/representative image for a product
 * Prefers images in "stand" folder, otherwise returns first available image
 */
export function getProductRepresentativeImage(category: string, product: string): string | null {
    const allImages = Object.entries(urlsData.urls).filter(([path]) => {
        return path.includes(`Collection/${category}`) && path.includes(product);
    });

    // First, try to find a stand image
    const standImage = allImages.find(([path]) => path.toLowerCase().includes('/stand/'));
    if (standImage) {
        return standImage[1].cloudinary;
    }

    // Otherwise, return the first image
    if (allImages.length > 0) {
        return allImages[0][1].cloudinary;
    }

    return null;
}

/**
 * Get all unique products for a category
 * For Granite: handles the extra group level (Alaska, Exclusive Indian, etc.)
 * For others: direct products under category
 */
export function getProductsForCategory(category: string): Array<{ name: string; image: string | null }> {
    const productsMap = new Map<string, string | null>();

    Object.entries(urlsData.urls).forEach(([path]) => {
        if (!path.startsWith(`Collection/${category}/`)) return;

        // Skip "NOT FOUND" folders
        if (path.toLowerCase().includes('not found')) return;

        const parts = path.replace(`Collection/${category}/`, '').split('/');

        let productName: string;

        if (category === 'Granite') {
            // Granite has structure: Collection/Granite/<Group>/<Product>/...
            if (parts.length < 2) return;
            productName = parts[1]; // The product is at index 1
        } else {
            // Other categories: Collection/<Category>/<Product>/...
            if (parts.length < 1) return;
            productName = parts[0]; // The product is at index 0
        }

        if (!productName) return;

        // If we haven't seen this product yet, or if this is a stand image, update it
        if (!productsMap.has(productName) || path.toLowerCase().includes('/stand/')) {
            const imageUrl = urlsData.urls[path]?.cloudinary || null;
            productsMap.set(productName, imageUrl);
        }
    });

    return Array.from(productsMap.entries()).map(([name, image]) => ({
        name,
        image
    }));
}

/**
 * Apply Cloudinary transformations for optimized delivery
 */
export function optimizeCloudinaryUrl(url: string, options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'auto' | 'webp' | 'jpg' | 'png';
} = {}): string {
    const { width, height, quality = 80, format = 'auto' } = options;

    // Find the upload part in the URL
    const uploadIndex = url.indexOf('/upload/');
    if (uploadIndex === -1) return url;

    const transformations: string[] = [];

    if (width) transformations.push(`w_${width}`);
    if (height) transformations.push(`h_${height}`);
    transformations.push(`q_${quality}`);
    transformations.push(`f_${format}`);

    const transformString = transformations.join(',');

    return url.slice(0, uploadIndex + 8) + transformString + '/' + url.slice(uploadIndex + 8);
}
