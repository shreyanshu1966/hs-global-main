/**
 * Responsive Image Helper Utility
 * 
 * Helper functions to use responsive Cloudinary images in your React components
 * 
 * @example
 * import { getResponsiveImage, ResponsiveImage } from '@/utils/responsive-image-helper';
 * 
 * // Get URL for specific breakpoint
 * const mobileUrl = getResponsiveImage('gallery/image.webp', 'mobile');
 * 
 * // Use ResponsiveImage component
 * <ResponsiveImage 
 *   src="gallery/image.webp" 
 *   alt="Description"
 *   className="my-image"
 * />
 */

import urlMappings from '../../../cloudinary-responsive-urls.json';

/**
 * Get responsive image URL for a specific breakpoint
 * @param {string} imagePath - Original image path (e.g., 'gallery/image.webp')
 * @param {string} breakpoint - Breakpoint size ('mobile', 'tablet', 'desktop', 'large')
 * @returns {string|null} Cloudinary URL or null if not found
 */
export function getResponsiveImage(imagePath, breakpoint = 'desktop') {
    try {
        const imageData = urlMappings.urls[imagePath];

        if (!imageData || !imageData.variants) {
            console.warn(`Image not found in mappings: ${imagePath}`);
            return null;
        }

        const variant = imageData.variants[breakpoint];

        if (!variant) {
            // Fallback to next available size
            const fallbackOrder = ['desktop', 'tablet', 'large', 'mobile'];
            for (const fallback of fallbackOrder) {
                if (imageData.variants[fallback]) {
                    return imageData.variants[fallback].url;
                }
            }
            return null;
        }

        return variant.url;
    } catch (error) {
        console.error('Error getting responsive image:', error);
        return null;
    }
}

/**
 * Get all variants for an image
 * @param {string} imagePath - Original image path
 * @returns {Object|null} Object with all variants or null
 */
export function getAllVariants(imagePath) {
    try {
        const imageData = urlMappings.urls[imagePath];
        return imageData?.variants || null;
    } catch (error) {
        console.error('Error getting image variants:', error);
        return null;
    }
}

/**
 * Get srcSet string for responsive images
 * @param {string} imagePath - Original image path
 * @returns {string} srcSet string for img tag
 */
export function getSrcSet(imagePath) {
    try {
        const variants = getAllVariants(imagePath);

        if (!variants) {
            return '';
        }

        const srcSetParts = [];

        if (variants.mobile) {
            srcSetParts.push(`${variants.mobile.url} ${variants.mobile.width}w`);
        }
        if (variants.tablet) {
            srcSetParts.push(`${variants.tablet.url} ${variants.tablet.width}w`);
        }
        if (variants.desktop) {
            srcSetParts.push(`${variants.desktop.url} ${variants.desktop.width}w`);
        }
        if (variants.large) {
            srcSetParts.push(`${variants.large.url} ${variants.large.width}w`);
        }

        return srcSetParts.join(', ');
    } catch (error) {
        console.error('Error generating srcSet:', error);
        return '';
    }
}

/**
 * React component for responsive images
 */
export function ResponsiveImage({
    src,
    alt,
    className = '',
    loading = 'lazy',
    sizes = '(max-width: 480px) 480px, (max-width: 768px) 768px, (max-width: 1200px) 1200px, 1920px'
}) {
    const srcSet = getSrcSet(src);
    const defaultSrc = getResponsiveImage(src, 'desktop') || getResponsiveImage(src, 'tablet') || getResponsiveImage(src, 'mobile');

    if (!defaultSrc) {
        console.warn(`No image variants found for: ${src}`);
        return null;
    }

    return (
        <img
            src={defaultSrc}
            srcSet={srcSet}
            sizes={sizes}
            alt={alt}
            className={className}
            loading={loading}
        />
    );
}

/**
 * Get image metadata
 * @param {string} imagePath - Original image path
 * @returns {Object|null} Image metadata
 */
export function getImageMetadata(imagePath) {
    try {
        const imageData = urlMappings.urls[imagePath];
        return imageData?.metadata || null;
    } catch (error) {
        console.error('Error getting image metadata:', error);
        return null;
    }
}

/**
 * Get images by category
 * @param {string} category - Category name ('gallery', 'products', 'banners', 'logos', 'default')
 * @returns {Array} Array of image paths in that category
 */
export function getImagesByCategory(category) {
    try {
        const images = [];

        for (const [path, data] of Object.entries(urlMappings.urls)) {
            if (data.category === category) {
                images.push(path);
            }
        }

        return images;
    } catch (error) {
        console.error('Error getting images by category:', error);
        return [];
    }
}

/**
 * Preload critical images
 * @param {Array<string>} imagePaths - Array of image paths to preload
 * @param {string} breakpoint - Breakpoint to preload
 */
export function preloadImages(imagePaths, breakpoint = 'desktop') {
    imagePaths.forEach(path => {
        const url = getResponsiveImage(path, breakpoint);
        if (url) {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = url;
            document.head.appendChild(link);
        }
    });
}

export default {
    getResponsiveImage,
    getAllVariants,
    getSrcSet,
    ResponsiveImage,
    getImageMetadata,
    getImagesByCategory,
    preloadImages
};
