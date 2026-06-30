/**
 * Type definitions for responsive-image-helper
 */

export interface ImageVariant {
    url: string;
    width: number;
    height: number;
    bytes: number;
}

export interface ImageVariants {
    mobile?: ImageVariant;
    tablet?: ImageVariant;
    desktop?: ImageVariant;
    large?: ImageVariant;
}

export interface ImageMetadata {
    originalWidth: number;
    originalHeight: number;
    originalSize: number;
    totalVariantSize: number;
}

export interface ImageData {
    original: string;
    category: string;
    variants: ImageVariants;
    metadata: ImageMetadata;
}

export type Breakpoint = 'mobile' | 'tablet' | 'desktop' | 'large';

/**
 * Get responsive image URL for a specific breakpoint
 */
export function getResponsiveImage(imagePath: string, breakpoint?: Breakpoint): string | null;

/**
 * Get all variants for an image
 */
export function getAllVariants(imagePath: string): ImageVariants | null;

/**
 * Get srcSet string for responsive images
 */
export function getSrcSet(imagePath: string): string;

/**
 * Get image metadata
 */
export function getImageMetadata(imagePath: string): ImageMetadata | null;

/**
 * Get images by category
 */
export function getImagesByCategory(category: string): string[];

/**
 * Preload critical images
 */
export function preloadImages(imagePaths: string[], breakpoint?: Breakpoint): void;

/**
 * React component props for ResponsiveImage
 */
export interface ResponsiveImageProps {
    src: string;
    alt: string;
    className?: string;
    loading?: 'lazy' | 'eager';
    sizes?: string;
}

/**
 * React component for responsive images
 */
export function ResponsiveImage(props: ResponsiveImageProps): JSX.Element | null;

declare const responsiveImageHelper: {
    getResponsiveImage: typeof getResponsiveImage;
    getAllVariants: typeof getAllVariants;
    getSrcSet: typeof getSrcSet;
    ResponsiveImage: typeof ResponsiveImage;
    getImageMetadata: typeof getImageMetadata;
    getImagesByCategory: typeof getImagesByCategory;
    preloadImages: typeof preloadImages;
};

export default responsiveImageHelper;
