/**
 * Product Cloudinary URL Mapper
 * 
 * This utility converts local product image paths to Cloudinary URLs
 */

import productUrlsData from '../../../product-cloudinary-urls.json';

// Type for the mapping data
type CloudinaryMapping = {
    original: string;
    cloudinary: string;
    publicId: string;
    format: string;
    width?: number;
    height?: number;
    bytes?: number;
    skipped?: boolean;
};

type ProductUrlsData = {
    generated: string;
    cloudName: string;
    stats: {
        [key: string]: number | string; // Flexible stats structure
    };
    urls: Record<string, CloudinaryMapping>;
};

const productUrls = productUrlsData as ProductUrlsData;

/**
 * Convert a local product image path to Cloudinary URL
 * 
 * @param localPath - Path relative to src/assets (e.g., "Collection/Granite/Alaska/Alaska Pink/alaska-2.webp")
 * @returns Cloudinary URL or fallback to local path if not found
 */
export function getProductCloudinaryUrl(localPath: string): string {
    // Normalize path (remove leading slashes, convert backslashes)
    const normalizedPath = localPath.replace(/^\/+/, '').replace(/\\/g, '/');

    // Check if we have a mapping for this path
    let mapping = productUrls.urls[normalizedPath];

    // If not found, try with '&' replaced by 'and' (Cloudinary sanitization)
    if (!mapping) {
        const sanitizedPath = normalizedPath.replace(/\s*&\s*/g, ' and ');
        mapping = productUrls.urls[sanitizedPath];
    }

    if (mapping && mapping.cloudinary) {
        return mapping.cloudinary;
    }

    // Fallback: construct URL based on pattern
    // This handles cases where the file might not be in the mapping
    const cloudName = productUrls.cloudName;
    const pathWithoutExt = normalizedPath
        .replace(/\.(webp|jpg|jpeg|png)$/i, '')
        .replace(/\s*&\s*/g, ' and '); // Sanitize for Cloudinary

    // Try to guess the format
    const ext = normalizedPath.match(/\.(webp|jpg|jpeg|png)$/i)?.[1] || 'jpg';
    const format = ext.toLowerCase() === 'webp' ? 'jpg' : ext.toLowerCase();

    // Construct Cloudinary URL
    const encodedPath = encodeURIComponent(pathWithoutExt).replace(/%2F/g, '/');
    return `https://res.cloudinary.com/${cloudName}/image/upload/hs-global/products/${encodedPath}.${format}`;
}

/**
 * Get Cloudinary URL with transformations
 * 
 * @param localPath - Path relative to src/assets
 * @param options - Transformation options
 * @returns Cloudinary URL with transformations
 */
export function getProductCloudinaryUrlWithTransform(
    localPath: string,
    options: {
        width?: number;
        height?: number;
        quality?: string | number;
        format?: 'auto' | 'webp' | 'jpg' | 'png';
    } = {}
): string {
    const baseUrl = getProductCloudinaryUrl(localPath);

    // If it's not a Cloudinary URL, return as is
    if (!baseUrl.includes('cloudinary.com')) {
        return baseUrl;
    }

    // Build transformation string
    const transforms: string[] = [];

    if (options.width) transforms.push(`w_${options.width}`);
    if (options.height) transforms.push(`h_${options.height}`);
    if (options.quality) transforms.push(`q_${options.quality}`);
    if (options.format) transforms.push(`f_${options.format}`);

    if (transforms.length === 0) {
        return baseUrl;
    }

    // Insert transformations into URL
    const transformString = transforms.join(',');
    return baseUrl.replace('/upload/', `/upload/${transformString}/`);
}

/**
 * Check if a product image exists in Cloudinary
 */
export function hasCloudinaryUrl(localPath: string): boolean {
    const normalizedPath = localPath.replace(/^\/+/, '').replace(/\\/g, '/');
    return !!productUrls.urls[normalizedPath];
}

/**
 * Get all Cloudinary URLs for a directory
 */
export function getProductUrlsForDirectory(dirPath: string): CloudinaryMapping[] {
    const normalizedDir = dirPath.replace(/^\/+/, '').replace(/\\/g, '/');

    return Object.entries(productUrls.urls)
        .filter(([path]) => path.startsWith(normalizedDir))
        .map(([, mapping]) => mapping);
}

export default {
    getProductCloudinaryUrl,
    getProductCloudinaryUrlWithTransform,
    hasCloudinaryUrl,
    getProductUrlsForDirectory,
};
