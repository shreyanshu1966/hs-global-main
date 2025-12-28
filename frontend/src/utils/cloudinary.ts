/**
 * Cloudinary Image Helper Utility
 * 
 * Provides functions to generate optimized Cloudinary URLs with:
 * - Automatic format selection (WebP, AVIF)
 * - Responsive image sizing
 * - Quality optimization
 * - Lazy loading support
 */

// Get cloud name from environment variable
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

if (!CLOUD_NAME) {
    console.warn('⚠️ VITE_CLOUDINARY_CLOUD_NAME not set in .env');
}

/**
 * Cloudinary transformation options
 */
export interface CloudinaryOptions {
    width?: number;
    height?: number;
    quality?: 'auto' | 'auto:low' | 'auto:good' | 'auto:best' | number;
    format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
    crop?: 'fill' | 'fit' | 'scale' | 'crop' | 'thumb';
    gravity?: 'auto' | 'face' | 'center' | 'north' | 'south' | 'east' | 'west';
    dpr?: 'auto' | number; // Device pixel ratio
    fetchFormat?: 'auto';
}

/**
 * Generate Cloudinary URL with transformations
 * 
 * @param publicId - The public ID of the image (e.g., 'gallery/image.webp')
 * @param options - Transformation options
 * @returns Optimized Cloudinary URL
 * 
 * @example
 * // Basic usage
 * getCloudinaryUrl('{getCloudinaryUrl('gallery/image.webp')}')
 * 
 * // With responsive sizing
 * getCloudinaryUrl('gallery/image.webp', { width: 800, quality: 'auto:good' })
 * 
 * // With custom transformations
 * getCloudinaryUrl('hero.webp', { 
 *   width: 1920, 
 *   height: 1080, 
 *   crop: 'fill',
 *   quality: 'auto:best'
 * })
 */
export function getCloudinaryUrl(
    publicId: string,
    options: CloudinaryOptions = {}
): string {
    // Fallback to original path if Cloudinary not configured
    if (!CLOUD_NAME) {
        return `/${publicId}`;
    }

    // Remove leading slash and file extension from publicId
    const cleanPublicId = publicId
        .replace(/^\//, '')
        .replace(/\.(webp|jpg|jpeg|png|gif)$/i, '');

    // Build transformation string
    const transformations: string[] = [];

    // Width
    if (options.width) {
        transformations.push(`w_${options.width}`);
    }

    // Height
    if (options.height) {
        transformations.push(`h_${options.height}`);
    }

    // Crop mode
    if (options.crop) {
        transformations.push(`c_${options.crop}`);
    }

    // Gravity (for cropping)
    if (options.gravity) {
        transformations.push(`g_${options.gravity}`);
    }

    // Quality
    const quality = options.quality || 'auto:good';
    transformations.push(`q_${quality}`);

    // Format (auto selects best format: WebP, AVIF, etc.)
    const format = options.format || 'auto';
    transformations.push(`f_${format}`);

    // Device pixel ratio
    const dpr = options.dpr || 'auto';
    transformations.push(`dpr_${dpr}`);

    // Join transformations
    const transformStr = transformations.join(',');

    // Build final URL
    return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transformStr}/hs-global/${cleanPublicId}`;
}

/**
 * Generate responsive image srcset for different screen sizes
 * 
 * @param publicId - The public ID of the image
 * @param widths - Array of widths for different breakpoints
 * @param options - Base transformation options
 * @returns srcset string for responsive images
 * 
 * @example
 * getResponsiveSrcSet('gallery/image.webp', [400, 800, 1200, 1600])
 */
export function getResponsiveSrcSet(
    publicId: string,
    widths: number[] = [400, 800, 1200, 1600],
    options: CloudinaryOptions = {}
): string {
    return widths
        .map(width => {
            const url = getCloudinaryUrl(publicId, { ...options, width });
            return `${url} ${width}w`;
        })
        .join(', ');
}

/**
 * Generate sizes attribute for responsive images
 * 
 * @param breakpoints - Object mapping breakpoints to sizes
 * @returns sizes string for responsive images
 * 
 * @example
 * getResponsiveSizes({
 *   '(max-width: 640px)': '100vw',
 *   '(max-width: 1024px)': '50vw',
 *   default: '33vw'
 * })
 */
export function getResponsiveSizes(
    breakpoints: Record<string, string>
): string {
    const entries = Object.entries(breakpoints);
    const defaultSize = entries.find(([key]) => key === 'default')?.[1] || '100vw';

    const mediaQueries = entries
        .filter(([key]) => key !== 'default')
        .map(([query, size]) => `${query} ${size}`)
        .join(', ');

    return mediaQueries ? `${mediaQueries}, ${defaultSize}` : defaultSize;
}

/**
 * Presets for common use cases
 */
export const CloudinaryPresets = {
    /**
     * Hero/Banner images - Large, high quality
     */
    hero: (publicId: string) => getCloudinaryUrl(publicId, {
        width: 1920,
        quality: 'auto:best',
        crop: 'fill',
        gravity: 'auto'
    }),

    /**
     * Gallery thumbnails - Medium size, good quality
     */
    galleryThumb: (publicId: string) => getCloudinaryUrl(publicId, {
        width: 400,
        height: 400,
        quality: 'auto:good',
        crop: 'fill',
        gravity: 'auto'
    }),

    /**
     * Gallery full size - Large, high quality
     */
    galleryFull: (publicId: string) => getCloudinaryUrl(publicId, {
        width: 1200,
        quality: 'auto:best',
        crop: 'fit'
    }),

    /**
     * Product card images - Medium size, good quality
     */
    productCard: (publicId: string) => getCloudinaryUrl(publicId, {
        width: 600,
        height: 600,
        quality: 'auto:good',
        crop: 'fill',
        gravity: 'auto'
    }),

    /**
     * Product detail images - Large, high quality
     */
    productDetail: (publicId: string) => getCloudinaryUrl(publicId, {
        width: 1200,
        quality: 'auto:best',
        crop: 'fit'
    }),

    /**
     * Logo/Icons - Small, high quality
     */
    logo: (publicId: string) => getCloudinaryUrl(publicId, {
        width: 300,
        quality: 'auto:best',
        format: 'png'
    }),

    /**
     * Responsive image with multiple sizes
     */
    responsive: (publicId: string) => ({
        src: getCloudinaryUrl(publicId, { width: 800 }),
        srcSet: getResponsiveSrcSet(publicId),
        sizes: getResponsiveSizes({
            '(max-width: 640px)': '100vw',
            '(max-width: 1024px)': '50vw',
            default: '33vw'
        })
    })
};

/**
 * Check if Cloudinary is configured
 */
export function isCloudinaryConfigured(): boolean {
    return !!CLOUD_NAME;
}

/**
 * Get Cloudinary cloud name
 */
export function getCloudName(): string | undefined {
    return CLOUD_NAME;
}

/**
 * Migration helper - converts local paths to Cloudinary URLs
 * Use this during migration to gradually replace image paths
 */
export function migrateImagePath(localPath: string, options?: CloudinaryOptions): string {
    // If already a Cloudinary URL, return as-is
    if (localPath.includes('cloudinary.com')) {
        return localPath;
    }

    // If external URL, return as-is
    if (localPath.startsWith('http://') || localPath.startsWith('https://')) {
        return localPath;
    }

    // Convert local path to Cloudinary URL
    return getCloudinaryUrl(localPath, options);
}

export default {
    getCloudinaryUrl,
    getResponsiveSrcSet,
    getResponsiveSizes,
    CloudinaryPresets,
    isCloudinaryConfigured,
    getCloudName,
    migrateImagePath
};
