import React, { useMemo, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../services/productService';
import { useCurrency } from '../../contexts/CurrencyContext';
import { getProductCloudinaryUrl } from '../../utils/productCloudinary';

interface ProductCardProps {
    product: Product;
    className?: string;
}

/* ---- Build video URL from product name + subcategory ---- */
const getVideoUrl = (name: string, subcategory: string): string => {
    const sub = subcategory.toLowerCase();

    // Convert hyphenated slug OR spaced string to folder-friendly title case:
    // "coffee-table" → "Coffee Table"    "Coffee Table" → "Coffee Table"
    const slugToFolder = (s: string) =>
        s.replace(/-/g, ' ')              // hyphens → spaces first
            .replace(/\s+/g, ' ')
            .trim()
            .replace(/\b\w/g, c => c.toUpperCase());

    // Use product name exactly as stored in DB (folder names match DB product names)
    const folderName = name.trim();
    const folderSub = slugToFolder(subcategory);

    if (sub.includes('table')) return `/videos/Tables/${folderSub}/${folderName}/video.mp4`;
    if (sub.includes('sculpture')) return `/videos/Sculptures/${folderName}/video.mp4`;
    if (sub.includes('pedestal') || sub.includes('countertop')) return `/videos/Wash Basins/${folderSub}/${folderName}/video.mp4`;
    if (sub.includes('basin')) return `/videos/Wash Basins/${folderSub}/${folderName}/video.mp4`;
    return `/videos/${folderSub}/${folderName}/video.mp4`;
};

export const ProductCard: React.FC<ProductCardProps> = ({ product, className = '' }) => {
    const { formatPrice } = useCurrency();
    const [showVideo, setShowVideo] = useState(false);
    const [videoError, setVideoError] = useState(false);
    const [videoReady, setVideoReady] = useState(false);
    const [imgHover, setImgHover] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    // ---- Pricing ----
    const { finalPrice, originalPrice, hasDiscount } = useMemo(() => {
        const now = new Date();
        const discount = product.discount;
        const active = discount?.enabled &&
            discount.percentage > 0 &&
            (!discount.startDate || new Date(discount.startDate) <= now) &&
            (!discount.endDate || new Date(discount.endDate) >= now);
        if (active && product.priceINR) {
            const off = Math.round((product.priceINR * discount.percentage) / 100);
            return { hasDiscount: true, finalPrice: product.priceINR - off, originalPrice: product.priceINR };
        }
        return { hasDiscount: false, finalPrice: product.priceINR || 0, originalPrice: product.priceINR || 0 };
    }, [product]);

    const displayPrice = product.priceINR ? formatPrice(finalPrice) : 'Price on Request';

    // ---- Images ----
    const images = useMemo(() => {
        const src = (product.sortedImages?.length ?? 0) > 0
            ? product.sortedImages!
            : [product.image, ...(product.images || [])].filter(Boolean);
        const transformed = src.map(p => {
            if (!p) return '';
            if (p.startsWith('http') || p.startsWith('data:') || p.startsWith('/')) return p;
            return getProductCloudinaryUrl(p);
        }).filter(Boolean);
        return Array.from(new Set(transformed));
    }, [product]);

    const primaryImage = images[0] || '';
    const secondaryImage = images[1] || primaryImage;

    // ---- Video URL (only for furniture, never null here — errors handled by onError) ----
    const isFurniture = product.category === 'furniture';
    const videoUrl = isFurniture ? getVideoUrl(product.name, product.subcategory || '') : null;

    // ---- Hover handlers ----
    const handleEnter = () => {
        setImgHover(true);
        if (isFurniture && videoUrl && !videoError) {
            setShowVideo(true);
            setVideoReady(false);
        }
    };

    const handleLeave = () => {
        setImgHover(false);
        setShowVideo(false);
        setVideoReady(false);
        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
        }
    };

    return (
        <div
            className={`group ${className}`}
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
        >
            <Link to={`/products/${product.productId || product._id}`} className="block">
                {/* ---- Image / Video container ---- */}
                <div className="aspect-[4/3] bg-[#FAF8F5] overflow-hidden relative">

                    {/* Primary image */}
                    <img
                        src={primaryImage}
                        alt={product.name}
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${(showVideo && videoReady) || (imgHover && !showVideo && images.length > 1)
                            ? 'opacity-0'
                            : 'opacity-100'
                            }`}
                        loading="lazy"
                    />

                    {/* Secondary image (image-swap fallback when no video) */}
                    {!showVideo && images.length > 1 && (
                        <img
                            src={secondaryImage}
                            alt={`${product.name} secondary view`}
                            className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 transition-opacity duration-500 ${imgHover ? 'opacity-100' : 'opacity-0'
                                }`}
                            loading="lazy"
                        />
                    )}

                    {/* VIDEO — only rendered when hovered + furniture + no prior error */}
                    {showVideo && videoUrl && !videoError && (
                        <video
                            ref={videoRef}
                            key={videoUrl}
                            src={videoUrl}
                            autoPlay
                            muted
                            loop
                            playsInline
                            preload="auto"
                            className={`absolute inset-0 w-full h-full object-contain z-10 bg-transparent transition-opacity duration-500 ${videoReady ? 'opacity-100' : 'opacity-0'
                                }`}
                            onError={() => {
                                // 404 or unplayable — silently fall back to image swap
                                setVideoError(true);
                                setShowVideo(false);
                            }}
                            onCanPlay={() => {
                                setVideoReady(true);
                                videoRef.current?.play().catch(() => { });
                            }}
                        />
                    )}

                    {/* Discount badge */}
                    {hasDiscount && (
                        <div className="absolute top-4 left-4 bg-[#8B3A3A] text-white text-xs font-bold px-2 py-1 uppercase tracking-wider z-20">
                            Sale
                        </div>
                    )}
                </div>

                {/* ---- Info ---- */}
                <div className="space-y-2 mt-4">
                    <h3 className="font-serif text-xl text-[#2B2B2B] group-hover:text-[#B8944A] transition-colors truncate">
                        {product.name}
                    </h3>
                    <p className="text-sm text-[#6B6B6B] uppercase tracking-wider truncate">
                        {product.category}{product.subcategory ? ` · ${product.subcategory}` : ''}
                    </p>
                    <div className="flex items-baseline gap-2">
                        <p className="text-lg font-medium text-[#2B2B2B]">{displayPrice}</p>
                        {hasDiscount && (
                            <p className="text-sm text-[#6B6B6B] line-through">{formatPrice(originalPrice)}</p>
                        )}
                    </div>
                </div>
            </Link>
        </div>
    );
};
