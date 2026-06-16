import cloudinaryUrls from '../../../public-root-cloudinary-urls.json';

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

const urlsData = cloudinaryUrls as { urls: CloudinaryMapping };

/**
 * Get Cloudinary URL for a root-level image (banner, hero images, etc.)
 * @param filename - Filename like "banner.webp" or "/banner.webp"
 * @returns Cloudinary URL or null if not found
 */
export function getRootImageUrl(filename: string): string | null {
    // Remove leading slash if present
    const normalizedFilename = filename.startsWith('/') ? filename.slice(1) : filename;

    if (urlsData.urls[normalizedFilename]) {
        return urlsData.urls[normalizedFilename].cloudinary;
    }

    return null;
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

/**
 * Get all available root images
 */
export function getAllRootImages(): Array<{ filename: string; url: string }> {
    return Object.entries(urlsData.urls)
        .filter(([key]) => !key.includes('/')) // Only root-level files
        .map(([filename, data]) => ({
            filename,
            url: data.cloudinary
        }));
}
