/**
 * Example React Components using Responsive Cloudinary Images
 * 
 * These examples show different ways to use the responsive image helper
 * in your React components.
 */

import React, { useState, useEffect } from 'react';
import {
    ResponsiveImage,
    getResponsiveImage,
    getSrcSet,
    getImagesByCategory,
    preloadImages,
    getAllVariants
} from '../utils/responsive-image-helper';

// ============================================================================
// Example 1: Simple Responsive Image Component
// ============================================================================

export function SimpleImageExample() {
    return (
        <div className="container mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4">Simple Responsive Image</h2>

            <ResponsiveImage
                src="banner.webp"
                alt="Hero Banner"
                className="w-full h-auto rounded-lg shadow-lg"
                loading="eager" // Load immediately for above-the-fold content
            />
        </div>
    );
}

// ============================================================================
// Example 2: Gallery Grid with Lazy Loading
// ============================================================================

export function GalleryExample() {
    const [images, setImages] = useState([]);

    useEffect(() => {
        // Get all gallery images
        const galleryImages = getImagesByCategory('gallery');
        setImages(galleryImages.slice(0, 12)); // Show first 12
    }, []);

    return (
        <div className="container mx-auto p-4">
            <h2 className="text-2xl font-bold mb-6">Gallery</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {images.map((imagePath, index) => (
                    <div key={index} className="overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow">
                        <ResponsiveImage
                            src={imagePath}
                            alt={`Gallery image ${index + 1}`}
                            className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

// ============================================================================
// Example 3: Product Card with Multiple Sizes
// ============================================================================

export function ProductCard({ productImagePath, title, price, description }) {
    const [currentSize, setCurrentSize] = useState('desktop');
    const variants = getAllVariants(productImagePath);

    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Product Image */}
            <div className="relative">
                <ResponsiveImage
                    src={productImagePath}
                    alt={title}
                    className="w-full h-80 object-cover"
                    loading="lazy"
                />

                {/* Size indicator (for demo) */}
                <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                    {variants && Object.keys(variants).length} variants available
                </div>
            </div>

            {/* Product Info */}
            <div className="p-4">
                <h3 className="text-xl font-bold mb-2">{title}</h3>
                <p className="text-gray-600 mb-4">{description}</p>
                <p className="text-2xl font-bold text-blue-600">${price}</p>
            </div>
        </div>
    );
}

// ============================================================================
// Example 4: Hero Section with Preloading
// ============================================================================

export function HeroSection() {
    useEffect(() => {
        // Preload critical hero images for faster loading
        preloadImages([
            'banner.webp',
            'services-hero.webp'
        ], 'large'); // Preload large size for desktop
    }, []);

    return (
        <section className="relative h-screen">
            <ResponsiveImage
                src="banner.webp"
                alt="Welcome to HS Global Export"
                className="absolute inset-0 w-full h-full object-cover"
                loading="eager"
            />

            <div className="relative z-10 flex items-center justify-center h-full bg-black bg-opacity-40">
                <div className="text-center text-white">
                    <h1 className="text-5xl font-bold mb-4">Premium Marble & Granite</h1>
                    <p className="text-xl mb-8">Exporting Excellence Worldwide</p>
                    <button className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg text-lg font-semibold">
                        Explore Collection
                    </button>
                </div>
            </div>
        </section>
    );
}

// ============================================================================
// Example 5: Manual srcSet for Custom Control
// ============================================================================

export function CustomResponsiveImage({ imagePath, alt, className }) {
    const srcSet = getSrcSet(imagePath);
    const defaultSrc = getResponsiveImage(imagePath, 'desktop');

    if (!defaultSrc) {
        return (
            <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
                <span className="text-gray-500">Image not found</span>
            </div>
        );
    }

    return (
        <img
            src={defaultSrc}
            srcSet={srcSet}
            sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            alt={alt}
            className={className}
            loading="lazy"
        />
    );
}

// ============================================================================
// Example 6: Background Image with Responsive URLs
// ============================================================================

export function BackgroundSection({ imagePath, children }) {
    const [backgroundUrl, setBackgroundUrl] = useState('');

    useEffect(() => {
        // Choose background based on screen size
        const updateBackground = () => {
            const width = window.innerWidth;
            let size = 'desktop';

            if (width <= 480) size = 'mobile';
            else if (width <= 768) size = 'tablet';
            else if (width <= 1200) size = 'desktop';
            else size = 'large';

            const url = getResponsiveImage(imagePath, size);
            setBackgroundUrl(url);
        };

        updateBackground();
        window.addEventListener('resize', updateBackground);

        return () => window.removeEventListener('resize', updateBackground);
    }, [imagePath]);

    return (
        <div
            className="relative min-h-screen bg-cover bg-center"
            style={{ backgroundImage: `url(${backgroundUrl})` }}
        >
            <div className="absolute inset-0 bg-black bg-opacity-50" />
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
}

// ============================================================================
// Example 7: Image Carousel/Slider
// ============================================================================

export function ImageCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [images, setImages] = useState([]);

    useEffect(() => {
        const bannerImages = getImagesByCategory('banners');
        setImages(bannerImages);
    }, []);

    const nextImage = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    if (images.length === 0) return null;

    return (
        <div className="relative w-full h-96">
            <ResponsiveImage
                src={images[currentIndex]}
                alt={`Slide ${currentIndex + 1}`}
                className="w-full h-full object-cover"
                loading="eager"
            />

            {/* Navigation Buttons */}
            <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-75 p-3 rounded-full"
            >
                ←
            </button>

            <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-75 p-3 rounded-full"
            >
                →
            </button>

            {/* Indicators */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                {images.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-3 h-3 rounded-full ${index === currentIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
}

// ============================================================================
// Example 8: Product Grid with Category Filter
// ============================================================================

export function ProductGrid() {
    const [products, setProducts] = useState([]);
    const [category, setCategory] = useState('all');

    useEffect(() => {
        const productImages = getImagesByCategory('products');
        setProducts(productImages);
    }, []);

    return (
        <div className="container mx-auto p-4">
            <div className="mb-6">
                <h2 className="text-3xl font-bold mb-4">Our Products</h2>

                {/* Category Filter */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setCategory('all')}
                        className={`px-4 py-2 rounded ${category === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                    >
                        All Products
                    </button>
                    <button
                        onClick={() => setCategory('marble')}
                        className={`px-4 py-2 rounded ${category === 'marble' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                    >
                        Marble
                    </button>
                    <button
                        onClick={() => setCategory('granite')}
                        className={`px-4 py-2 rounded ${category === 'granite' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                    >
                        Granite
                    </button>
                </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((productPath, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                        <ResponsiveImage
                            src={productPath}
                            alt={`Product ${index + 1}`}
                            className="w-full h-48 object-cover"
                            loading="lazy"
                        />
                        <div className="p-4">
                            <h3 className="font-semibold text-lg mb-2">
                                {productPath.split('/').pop().replace('.webp', '')}
                            </h3>
                            <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                                View Details
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ============================================================================
// Example 9: Lightbox/Modal with Full Resolution
// ============================================================================

export function ImageLightbox({ imagePath, isOpen, onClose }) {
    if (!isOpen) return null;

    const largeUrl = getResponsiveImage(imagePath, 'large');

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div className="relative max-w-7xl max-h-full">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300"
                >
                    ×
                </button>

                <img
                    src={largeUrl}
                    alt="Full resolution"
                    className="max-w-full max-h-screen object-contain"
                    onClick={(e) => e.stopPropagation()}
                />
            </div>
        </div>
    );
}

// ============================================================================
// Example 10: Performance Monitoring
// ============================================================================

export function ImageWithPerformance({ imagePath, alt }) {
    const [loadTime, setLoadTime] = useState(null);

    const handleLoad = (e) => {
        if (e.target.complete) {
            const perfEntries = performance.getEntriesByType('resource');
            const imgEntry = perfEntries.find(entry => entry.name.includes(imagePath));

            if (imgEntry) {
                setLoadTime(Math.round(imgEntry.duration));
            }
        }
    };

    return (
        <div className="relative">
            <ResponsiveImage
                src={imagePath}
                alt={alt}
                className="w-full h-auto"
                loading="lazy"
            />

            {loadTime && (
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                    Loaded in {loadTime}ms
                </div>
            )}
        </div>
    );
}

export default {
    SimpleImageExample,
    GalleryExample,
    ProductCard,
    HeroSection,
    CustomResponsiveImage,
    BackgroundSection,
    ImageCarousel,
    ProductGrid,
    ImageLightbox,
    ImageWithPerformance
};
