import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../services/productService';
import { useCurrency } from '../../contexts/CurrencyContext';
import { getProductCloudinaryUrl } from '../../utils/productCloudinary';
import {
    hasActiveDiscount,
    getBasePriceINR,
    getEffectivePriceINR,
} from '../../modules/product/pricing';
import { getProductDisplayImages } from '../../modules/product/selectors';

interface ProductCardProps {
    product: Product;
    className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, className = '' }) => {
    const VIDEO_START_DELAY_MS = 1300;
    const { formatPrice } = useCurrency();
    const [showVideo, setShowVideo] = useState(false);
    const [videoError, setVideoError] = useState(false);
    const [videoReady, setVideoReady] = useState(false);
    const [imgHover, setImgHover] = useState(false);
    const [isTouchDevice, setIsTouchDevice] = useState(false);
    const [isInMiddleBand, setIsInMiddleBand] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const videoStartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ---- Pricing ----
    const hasDiscount = useMemo(() => hasActiveDiscount(product), [product]);
    const finalPrice = useMemo(() => getEffectivePriceINR(product), [product]);
    const originalPrice = useMemo(() => getBasePriceINR(product), [product]);

    const displayPrice = product.priceINR ? formatPrice(finalPrice) : 'Price on Request';

    // ---- Images ----
    const images = useMemo(() => {
        const src = getProductDisplayImages(product).length > 0
            ? getProductDisplayImages(product)
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
    const videoUrl = isFurniture && (product.hasVideo || Boolean(product.videoUrl)) ? product.videoUrl || null : null;

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
        isFurniture &&
        videoUrl &&
        !videoError &&
        (isTouchDevice ? isInMiddleBand : imgHover)
    );

    useEffect(() => {
        if (videoStartTimerRef.current) {
            clearTimeout(videoStartTimerRef.current);
            videoStartTimerRef.current = null;
        }

        if (shouldShowVideo) {
            const startDelay = isTouchDevice ? VIDEO_START_DELAY_MS : 0;
            videoStartTimerRef.current = setTimeout(() => {
                setShowVideo(true);
                videoStartTimerRef.current = null;
            }, startDelay);
            return;
        }

        setShowVideo(false);

        setVideoReady(false);
        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
        }
    }, [VIDEO_START_DELAY_MS, isTouchDevice, shouldShowVideo]);

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
                            onLoadedData={() => {
                                setVideoReady(true);
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
