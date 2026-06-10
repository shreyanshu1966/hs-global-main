import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../services/productService';
import { useWishlist } from '../../contexts/WishlistContext';
import { getProductCloudinaryUrl } from '../../utils/productCloudinary';
import { AddToCartButton } from '../AddToCartButton';
import { getProductDisplayImages } from '../../modules/product/selectors';
import { usePrice } from '../../hooks/usePrice';

interface ProductCardProps {
    product: Product;
    className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, className = '' }) => {
    const VIDEO_START_DELAY_MS = 1300;
    const { isInWishlist, toggleWishlist } = useWishlist();
    const [showVideo, setShowVideo] = useState(false);
    const [videoError, setVideoError] = useState(false);
    const [videoReady, setVideoReady] = useState(false);
    const [imgHover, setImgHover] = useState(false);
    const [isTouchDevice, setIsTouchDevice] = useState(false);
    const [isInMiddleBand, setIsInMiddleBand] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const videoStartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ---- Pricing (centralized engine) ----
    const isSemiPreciousStone = product.category === 'semi-precious-stone';
    const price = usePrice(product);
    const hasValidPrice = price.baseUSD > 0;
    const showDiscount = price.hasDiscount && hasValidPrice && !isSemiPreciousStone;
    const displayPrice = price.formattedPrice;
    const originalDisplayPrice = price.originalFormattedPrice;
    const sqFtPrice = (product as any).pricePerSqFt as number | undefined;
    const wishlistId = String(product.productId || product._id || product.name);
    const isWishlisted = isInWishlist(wishlistId);

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
            <Link to={`/product/${product.productId || product._id}`} className="block">
                {/* ---- Image / Video container ---- */}
                <div className="aspect-[4/3] bg-[#FAF8F5] overflow-hidden relative">

                    <button
                        type="button"
                        aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                        className={`absolute top-3 right-3 z-30 w-9 h-9 rounded-full flex items-center justify-center shadow-sm transition-colors ${isWishlisted ? 'bg-[#8b3a3a] text-white' : 'bg-white/95 text-[#222] hover:bg-white'}`}
                        onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            toggleWishlist({
                                id: wishlistId,
                                title: product.name,
                                image: primaryImage,
                                href: `/product/${product.productId || product._id}`,
                                designer: product.category,
                                price: displayPrice,
                            });
                        }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.6">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                    </button>

                    {product.productType !== 'configurable' && (
                        <div
                            className="absolute top-[3.25rem] right-3 z-30"
                            onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                            }}
                        >
                            <AddToCartButton
                                product={product}
                                variant="compact"
                                iconOnly
                                className="w-9 h-9 p-0 rounded-full border border-white/70 bg-white/95 text-[#111827] shadow-sm backdrop-blur-[2px] hover:bg-white"
                            />
                        </div>
                    )}

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
                    {showDiscount && (
                        <div className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-[#b91c1c] text-white text-[9px] sm:text-xs font-bold px-2 sm:px-3 py-1 sm:py-1.5 uppercase tracking-[0.05em] sm:tracking-[0.06em] rounded-full shadow-sm z-20">
                            {price.discountPercentage > 0 ? `${Math.round(price.discountPercentage)}% Off` : 'On Sale'}
                        </div>
                    )}
                </div>

                {/* ---- Info ---- */}
                <div className="space-y-2 mt-4">
                    <h3 className="font-serif text-xl text-[#2B2B2B] group-hover:text-[#111827] transition-colors truncate">
                        {product.name}
                    </h3>
                    <p className="text-sm text-[#6B6B6B] uppercase tracking-wider truncate">
                        {product.category}{product.subcategory ? ` · ${product.subcategory}` : ''}
                    </p>
                    {/* Rating Section — only shown when real reviews exist */}
                    {product.averageRating > 0 && product.totalReviews > 0 && (
                        <div className="flex items-center gap-1.5 mt-1 mb-2">
                            <div className="flex text-[#f59e0b]">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <svg
                                        key={star}
                                        className={`w-3.5 h-3.5 ${star <= Math.round(product.averageRating) ? 'fill-current' : 'fill-transparent stroke-current stroke-[1.5]'}`}
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                    </svg>
                                ))}
                            </div>
                            <span className="text-[13px] text-[#6B6B6B]">
                                ({product.totalReviews})
                            </span>
                        </div>
                    )}
                    {/* Variant indicator */}
                    {product.productType === 'configurable' && product.variants && product.variants.length > 0 && (() => {
                        const colorAttr = product.variantAttributes?.find(a => /color|colour/i.test(a.name));
                        return (
                            <div className="flex items-center gap-1.5 mt-1 mb-1">
                                {colorAttr ? (
                                    colorAttr.values.slice(0, 5).map(v => (
                                        <span
                                            key={v}
                                            title={v}
                                            className="w-3 h-3 rounded-full border border-[#e5e7eb] inline-block"
                                            style={{ backgroundColor: v.toLowerCase() }}
                                        />
                                    ))
                                ) : null}
                                <span className="text-[10px] text-[#9ca3af] leading-none">
                                    {product.variants.length} variant{product.variants.length !== 1 ? 's' : ''}
                                </span>
                            </div>
                        );
                    })()}

                    {isSemiPreciousStone ? (
                        sqFtPrice && sqFtPrice > 0 ? (
                            <div className="space-y-0.5">
                                <p className="text-[16px] sm:text-lg font-medium text-[#2B2B2B] leading-none">
                                    ₹{sqFtPrice.toLocaleString('en-IN')}
                                    <span className="text-sm font-normal text-[#6B7280] ml-1">/ sq.ft</span>
                                </p>
                                <p className="text-[10px] text-[#9ca3af] uppercase tracking-wide">Request quotation to buy</p>
                            </div>
                        ) : (
                            <div className="space-y-0.5">
                                <p className="text-[16px] sm:text-lg font-medium text-[#2B2B2B] leading-none">Price on Request</p>
                                <p className="text-[10px] text-[#9ca3af] uppercase tracking-wide">Request quotation to buy</p>
                            </div>
                        )
                    ) : showDiscount ? (
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                                <p className="text-[16px] sm:text-lg font-semibold text-[#b91c1c] leading-none">{displayPrice}</p>
                                {price.discountPercentage > 0 && (
                                    <p className="inline-flex items-center rounded-full border border-[#fecaca] bg-[#fef2f2] px-1.5 sm:px-2 py-[2px] text-[10px] sm:text-[11px] font-semibold tracking-[0.01em] sm:tracking-[0.02em] text-[#b91c1c] leading-none">Save {Math.round(price.discountPercentage)}%</p>
                                )}
                            </div>
                            <p className="text-[12px] sm:text-sm text-[#6B7280] line-through leading-none">{originalDisplayPrice}</p>
                        </div>
                    ) : (
                        <p className="text-[16px] sm:text-lg font-medium text-[#2B2B2B] leading-none">{displayPrice}</p>
                    )}
                </div>
            </Link>

        </div>
    );
};
