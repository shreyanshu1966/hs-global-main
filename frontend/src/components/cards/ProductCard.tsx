import React, { useEffect, useMemo, useState, useRef } from 'react';
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
    const VIDEO_START_DELAY_MS = 1300;
    const { formatPrice } = useCurrency();
    const [showVideo, setShowVideo] = useState(false);
    const [videoError, setVideoError] = useState(false);
    const [videoReady, setVideoReady] = useState(false);
    const [imgHover, setImgHover] = useState(false);
    const [isTouchDevice, setIsTouchDevice] = useState(false);
    const [isInMiddleBand, setIsInMiddleBand] = useState(false);
    const [hasUserInteracted, setHasUserInteracted] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const videoStartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const mediaQuery = window.matchMedia('(hover: none), (pointer: coarse)');

        const updateTouchMode = () => {
            setIsTouchDevice(mediaQuery.matches);
        };

        updateTouchMode();

        if (typeof mediaQuery.addEventListener === 'function') {
            mediaQuery.addEventListener('change', updateTouchMode);
        } else {
            mediaQuery.addListener(updateTouchMode);
        }

        return () => {
            if (typeof mediaQuery.removeEventListener === 'function') {
                mediaQuery.removeEventListener('change', updateTouchMode);
            } else {
                mediaQuery.removeListener(updateTouchMode);
            }
        };
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const markUserInteracted = () => {
            setHasUserInteracted(true);
        };

        const options: AddEventListenerOptions = { passive: true };
        window.addEventListener('scroll', markUserInteracted, options);
        window.addEventListener('touchstart', markUserInteracted, options);
        window.addEventListener('mousemove', markUserInteracted, options);
        window.addEventListener('wheel', markUserInteracted, options);
        window.addEventListener('keydown', markUserInteracted);

        return () => {
            window.removeEventListener('scroll', markUserInteracted);
            window.removeEventListener('touchstart', markUserInteracted);
            window.removeEventListener('mousemove', markUserInteracted);
            window.removeEventListener('wheel', markUserInteracted);
            window.removeEventListener('keydown', markUserInteracted);
        };
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined' || !cardRef.current || typeof IntersectionObserver === 'undefined') {
            return;
        }

        // Treat middle ~30% of viewport as active autoplay zone.
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsInMiddleBand(entry.isIntersecting);
            },
            {
                root: null,
                rootMargin: '-35% 0px -35% 0px',
                threshold: 0,
            }
        );

        observer.observe(cardRef.current);
        return () => {
            observer.disconnect();
        };
    }, []);

    const shouldShowVideo = Boolean(
        hasUserInteracted && isFurniture && videoUrl && !videoError && (imgHover || isInMiddleBand)
    );

    useEffect(() => {
        if (videoStartTimerRef.current) {
            clearTimeout(videoStartTimerRef.current);
            videoStartTimerRef.current = null;
        }

        if (shouldShowVideo) {
            videoStartTimerRef.current = setTimeout(() => {
                setShowVideo(true);
                videoStartTimerRef.current = null;
            }, VIDEO_START_DELAY_MS);
            return;
        }

        setShowVideo(false);

        setVideoReady(false);
        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
        }
    }, [VIDEO_START_DELAY_MS, shouldShowVideo]);

    useEffect(() => {
        return () => {
            if (!videoStartTimerRef.current) return;
            clearTimeout(videoStartTimerRef.current);
            videoStartTimerRef.current = null;
        };
    }, []);

    // ---- Hover handlers ----
    const handleEnter = () => {
        if (isTouchDevice) return;
        setImgHover(true);
    };

    const handleLeave = () => {
        if (isTouchDevice) return;
        setImgHover(false);
    };

    return (
        <div
            ref={cardRef}
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
                            className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${imgHover ? 'opacity-100' : 'opacity-0'
                                }`}
                            loading="lazy"
                        />
                    )}

                    {/* VIDEO — rendered only when user has interacted and card is active */}
                    {showVideo && videoUrl && !videoError && (
                        <video
                            ref={videoRef}
                            key={videoUrl}
                            src={videoUrl}
                            poster={primaryImage}
                            autoPlay
                            muted
                            loop
                            playsInline
                            preload={isTouchDevice ? 'metadata' : 'auto'}
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
