// ⭐ UPDATED ProductCard.tsx — Correct INR → USD → User Currency Conversion

import React, { useEffect, useMemo, useRef, useState, memo } from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { Product } from '../services/productService'; // Updated import to API type
import { AddToCartButton } from './AddToCartButton';
import { QuantityHandler } from './QuantityHandler';
import { useCart } from '../contexts/CartContext';
import { useCurrency } from '../contexts/CurrencyContext';

import { getProductCloudinaryUrl } from '../utils/productCloudinary';
import { loadImageUrl } from '../data/slabs.loader'; // Keep for slabs lazy load if needed

gsap.registerPlugin(ScrollTrigger);

interface ProductCardProps {
  product: Product;
  variant: 'modern' | 'luxury' | 'industrial' | 'elegant';
  index: number;
}


/* ---------- helper normalizer ----------- */
const normalizeName = (name: string) =>
  name.replace(/[^a-z0-9\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());

/* ---------- video paths ----------- */
const getProductVideoUrl = (productName: string, category: string, subcategory: string) => {
  if (category !== 'furniture') return null;

  const folderProduct = normalizeName(productName);
  const folderSub = normalizeName(subcategory);

  if (subcategory.toLowerCase().includes('table')) {
    return `/videos/Tables/${folderSub}/${folderProduct}/video.mp4`;
  }
  if (subcategory.toLowerCase().includes('pedestal') || subcategory.toLowerCase().includes('countertop')) {
    return `/videos/Wash Basins/${folderSub}/${folderProduct}/video.mp4`;
  }
  return `/videos/${folderSub}/${folderProduct}/video.mp4`;
};

export const ProductCard: React.FC<ProductCardProps> = memo(({ product, variant, index }) => {
  const { state } = useCart();
  const { formatPrice } = useCurrency();

  /* ------------------------------------------------------
     ⭐ PRICING LOGIC (API DRIVEN) WITH DISCOUNT
     ------------------------------------------------------ */
  const { hasDiscount, discountPercentage, finalPrice, originalPrice } = useMemo(() => {
    const now = new Date();
    const discount = product.discount;

    // Check if discount is active
    const isDiscountActive = discount?.enabled &&
      discount.percentage > 0 &&
      (!discount.startDate || new Date(discount.startDate) <= now) &&
      (!discount.endDate || new Date(discount.endDate) >= now);

    if (isDiscountActive && product.priceINR) {
      const discountAmount = Math.round((product.priceINR * discount.percentage) / 100);
      return {
        hasDiscount: true,
        discountPercentage: discount.percentage,
        finalPrice: product.priceINR - discountAmount,
        originalPrice: product.priceINR
      };
    }

    return {
      hasDiscount: false,
      discountPercentage: 0,
      finalPrice: product.priceINR || 0,
      originalPrice: product.priceINR || 0
    };
  }, [product]);

  const displayPrice = useMemo(() => {
    if (!product.available) return "Unavailable";

    if (product.priceINR) {
      return formatPrice(finalPrice);
    }

    // Fallback for slabs or items without price
    return "Price on Request";
  }, [product, formatPrice, finalPrice]);

  /* ------------------------------------------------------
     Rest of your existing card logic unchanged
     ------------------------------------------------------ */

  const [isHovering, setIsHovering] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [isInViewport, setIsInViewport] = useState(false);
  const [isVideoInView, setIsVideoInView] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoCanPlay, setVideoCanPlay] = useState(false);

  const [loadedImages, setLoadedImages] = useState<string[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [primaryImageLoaded, setPrimaryImageLoaded] = useState(false);

  const intervalRef = useRef<number | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const { contextSafe } = useGSAP({ scope: cardRef });

  // Detect mobile device
  const isMobile = useMemo(() => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      ('ontouchstart' in window) ||
      (window.innerWidth <= 768);
  }, []);

  const isSlab = product.category === 'slabs';

  // Use pre-sorted images from product data (no runtime sorting!)
  const imagePaths = useMemo(() => {
    if (product.sortedImages && product.sortedImages.length > 0) {
      // If we have sorted images, treat them same as regular images
      // Check if they look like Cloudinary paths or raw paths
      const paths = product.sortedImages;
      if (isSlab) return paths;

      return paths.map(path => {
        if (path.startsWith('http') || path.startsWith('data:') || path.startsWith('/')) return path;
        return getProductCloudinaryUrl(path);
      });
    }

    // Fallback for slabs or products without sortedImages
    if (isSlab) {
      const all = [...(product.images || [])].filter(Boolean);
      return Array.from(new Set(all));
    } else {
      const all = [product.image, ...(product.images || [])].filter(Boolean);
      const transformed = all.map(path => {
        if (!path) return '';
        if (path.startsWith('http') || path.startsWith('data:') || path.startsWith('/')) return path;
        return getProductCloudinaryUrl(path);
      }).filter(Boolean);
      return Array.from(new Set(transformed));
    }
  }, [product, isSlab]);

  /* ---- lazy image load for slabs ---- */
  useEffect(() => {
    if (!isSlab || !isInViewport || loadedImages.length > 0 || isLoadingImages) return;

    setIsLoadingImages(true);

    if (imagePaths.length > 0) {
      loadImageUrl(imagePaths[0])
        .then(url => {
          if (url) {
            setLoadedImages([url]);
            setPrimaryImageLoaded(true);

            setTimeout(() => {
              if (imagePaths.length > 1) {
                Promise.all(imagePaths.slice(1, 4).map(loadImageUrl))
                  .then(urls => setLoadedImages(prev => [...prev, ...urls.filter(Boolean)]))
                  .finally(() => setIsLoadingImages(false));
              } else setIsLoadingImages(false);
            }, 150);
          }
        });
    }
  }, [isSlab, isInViewport, imagePaths, isLoadingImages, loadedImages.length]);

  const slideshowImages = isSlab ? loadedImages : imagePaths;

  // Optimized: Use IntersectionObserver for animation trigger instead of GSAP ScrollTrigger
  // This is more performant for large lists
  useEffect(() => {
    if (!cardRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          gsap.to(entry.target, {
            opacity: 1,
            y: 0,
            duration: 0.5,
            delay: index * 0.02, // Reduced stagger for faster appearance
            ease: "power2.out",
          });
          observer.disconnect(); // Only animate once
        }
      },
      {
        threshold: 0.1,
        rootMargin: "50px", // Start animation slightly before visible
      }
    );

    observer.observe(cardRef.current);

    return () => observer.disconnect();
  }, [index]);

  /* ---- video viewport detection for mobile auto-play ---- */
  useEffect(() => {
    if (!cardRef.current || !isMobile || !product.hasVideo || videoError) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isVisible = entry.isIntersecting;
        setIsVideoInView(isVisible);

        if (isVisible) {
          // Start playing video when card is 50% visible (with delay for smoother experience)
          setTimeout(() => {
            setShowVideo(true);
            // Reset video loading states for new video load
            setVideoLoaded(false);
            setVideoCanPlay(false);
          }, isMobile ? 3000 : 800); // 3s delay on mobile, 800ms on desktop
        } else {
          // Pause video when card is not visible
          setShowVideo(false);
          if (videoRef.current) {
            videoRef.current.pause();
          }
          // Reset video loading states
          setVideoLoaded(false);
          setVideoCanPlay(false);
        }
      },
      {
        threshold: 0.5, // Play when 50% of card is visible
        rootMargin: '0px 0px -100px 0px' // Start slightly before fully visible
      }
    );

    observer.observe(cardRef.current);

    return () => observer.disconnect();
  }, [isMobile, product.hasVideo, videoError]);

  /* ---- viewport detect ---- */
  useEffect(() => {
    if (!cardRef.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInViewport(true);
        observer.disconnect();
      }
    }, { rootMargin: "400px" });

    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  const videoUrl = product.category === 'furniture'
    ? getProductVideoUrl(product.name, product.category, product.subcategory || '')
    : null;

  /* ---- slideshow ---- */
  useEffect(() => {
    // On mobile, don't slideshow if video is playing
    const shouldSkipSlideshow = isMobile
      ? (product.category === 'furniture' && product.hasVideo && !videoError && isVideoInView)
      : (product.category === 'furniture' && product.hasVideo && !videoError);

    const shouldShowSlideshow = isMobile
      ? !shouldSkipSlideshow && slideshowImages.length > 1
      : !shouldSkipSlideshow && isHovering && slideshowImages.length > 1;

    if (!shouldShowSlideshow) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setSlideIndex(0);
      return;
    }

    const t = setTimeout(() => {
      intervalRef.current = window.setInterval(() => {
        setSlideIndex(prev => (prev + 1) % slideshowImages.length);
      }, isMobile ? 3000 : 1100); // 3s for mobile, 1.1s for desktop
    }, 500); // 500ms initial delay before slideshow starts

    return () => {
      clearTimeout(t);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isHovering, product.hasVideo, slideshowImages.length, product.category, videoError, isMobile, isVideoInView]);

  /* ---- hover handlers ---- */
  const handleMouseEnter = contextSafe(() => {
    if (isMobile) return; // Skip hover logic on mobile

    setIsHovering(true);
    gsap.to(cardRef.current, { y: -4, duration: 0.2, ease: "power1.out" });
    if (product.category === 'furniture' && product.hasVideo && !videoError) {
      setShowVideo(true);
      // Reset video loading states for new video load
      setVideoLoaded(false);
      setVideoCanPlay(false);
    }
  });

  const handleMouseLeave = contextSafe(() => {
    if (isMobile) return; // Skip hover logic on mobile

    setIsHovering(false);
    gsap.to(cardRef.current, { y: 0, duration: 0.2, ease: "power1.in" });
    setShowVideo(false);
    setSlideIndex(0);
    // Reset video loading states
    setVideoLoaded(false);
    setVideoCanPlay(false);
  });

  /* ---- click memory ---- */
  const handleCardClick = () => {
    sessionStorage.setItem('scrollY', window.scrollY.toString());
  };

  const showPlaceholder = isSlab && !primaryImageLoaded && isInViewport;
  const showContent = !isSlab || primaryImageLoaded;

  /* ------------------------------------------------------
     RENDER
     ------------------------------------------------------ */

  return (
    <div
      ref={cardRef}
      data-variant={variant}
      className="relative overflow-hidden group transition-transform duration-300 bg-white shadow-lg hover:shadow-xl rounded-lg flex flex-col"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      // Initial style handled by GSAP from()
      style={{ opacity: 0, transform: 'translateY(30px)' }}
    >
      {/* IMAGE + VIDEO */}
      <Link
        to={`/products/${product.productId || product._id}`}
        onClick={handleCardClick}
        className="relative block overflow-hidden bg-gray-100"
        style={{ aspectRatio: '4/5' }}
      >

        {/* VIDEO */}
        {showVideo && product.hasVideo && videoUrl && !videoError && (
          <video
            ref={videoRef}
            key={videoUrl}
            src={videoUrl}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className={`absolute inset-0 w-full h-full object-contain z-20 bg-transparent transition-opacity duration-500 ${videoLoaded && videoCanPlay ? 'opacity-100' : 'opacity-0'
              }`}
            onError={(e) => {
              // Gracefully handle video 404 by setting error state
              console.log(`Video failed to load: ${videoUrl}`);
              setVideoError(true);
              setShowVideo(false);
              setVideoLoaded(false);
              setVideoCanPlay(false);
            }}
            onLoadStart={() => {
              // Reset error state when video starts loading
              setVideoError(false);
              setVideoLoaded(false);
              setVideoCanPlay(false);
            }}
            onLoadedData={() => {
              // Video metadata loaded, but might not be ready to play
              setVideoLoaded(true);
            }}
            onCanPlay={() => {
              // Video is ready to play without interruption
              setVideoCanPlay(true);
              // Ensure video plays on mobile when loaded
              if (isMobile && isVideoInView && videoRef.current) {
                videoRef.current.play().catch(console.warn);
              }
            }}
          />
        )}

        {/* PLACEHOLDER */}
        {showPlaceholder && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse flex items-center justify-center">
            <svg className="w-16 h-16 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4z" />
            </svg>
          </div>
        )}

        {/* IMAGE SLIDESHOW */}
        {showContent && (
          !product.hasVideo ||
          !showVideo ||
          videoError ||
          !videoLoaded ||
          !videoCanPlay
        ) && slideshowImages.map((src, idx) => {
          const visible = idx === slideIndex;
          return (
            <img
              key={src}
              src={src}
              alt={product.name}
              width="400"
              height="500"
              loading={idx === 0 ? "eager" : "lazy"}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${visible ? "opacity-100" : "opacity-0"
                }`}
            />
          );
        })
        }

        {/* DISCOUNT RIBBON - Top Right Corner */}
        {product.category === 'furniture' && hasDiscount && (
          <div className="absolute top-0 right-0 z-30 overflow-hidden w-24 h-24 pointer-events-none">
            <div className="absolute top-3 right-[-32px] w-32 bg-gradient-to-r from-red-600 to-red-500 text-white text-center py-1.5 rotate-45 shadow-lg">
              <span className="text-xs font-bold tracking-wide">-{discountPercentage}%</span>
            </div>
          </div>
        )}

        {/* PRICE BADGE - Bottom Left Corner */}
        {product.category === 'furniture' && (
          <div className="absolute bottom-3 left-3 z-30">
            {hasDiscount ? (
              <div className="bg-white/95 backdrop-blur-md rounded-lg shadow-lg border border-gray-200 px-3 py-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-lg md:text-xl font-bold text-green-600">{displayPrice}</span>
                  <span className="text-xs text-gray-500 line-through">{formatPrice(originalPrice)}</span>
                </div>
                <div className="text-xs text-green-600 font-semibold mt-0.5">
                  Save {formatPrice(originalPrice - finalPrice)}
                </div>
              </div>
            ) : (
              <div className="bg-white/95 backdrop-blur-md rounded-lg shadow-lg border border-gray-200 px-3 py-2">
                <span className="text-base md:text-lg font-bold text-gray-900">{displayPrice}</span>
              </div>
            )}
          </div>
        )}

        <div className="absolute inset-0 pointer-events-none ring-1 ring-black/5 rounded-lg" />
      </Link>

      {/* BOTTOM CONTENT */}
      <div className="flex flex-col flex-grow p-4 md:p-5 bg-white rounded-b-lg">
        <Link to={`/products/${product.productId || product._id}`} onClick={handleCardClick}>
          <h3 className="text-base md:text-lg font-bold text-gray-900 line-clamp-2 mb-2">
            {product.name}
          </h3>
        </Link>

        {/* Rating Display */}
        {product.totalReviews && product.totalReviews > 0 ? (
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${star <= Math.round(product.averageRating || 0)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                    }`}
                />
              ))}
            </div>
            <span className="text-sm font-medium text-gray-700">
              {(product.averageRating || 0).toFixed(1)}
            </span>
            <span className="text-xs text-gray-500">
              ({product.totalReviews})
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1 mb-3 text-gray-400">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className="w-3.5 h-3.5" />
            ))}
            <span className="text-xs text-gray-500 ml-1">No reviews</span>
          </div>
        )}

        {/* Price for Slabs */}
        {product.category === 'slabs' && product.priceINR && (
          <div className="mb-3">
            {hasDiscount ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xl font-bold text-green-600">{displayPrice}</span>
                  <span className="px-2 py-0.5 bg-red-500 text-white rounded-full text-xs font-bold">
                    {discountPercentage}% OFF
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  <span className="line-through">{formatPrice(originalPrice)}</span>
                  <span className="ml-2 text-green-600 font-semibold">Save {formatPrice(originalPrice - finalPrice)}</span>
                </div>
              </div>
            ) : (
              <span className="text-lg font-bold text-gray-900">{displayPrice}</span>
            )}
          </div>
        )}

        <div className="mt-auto pt-2 flex gap-2">

          {/* Add to Cart */}
          <div className="flex-grow">
            {state.items.find(i => i.id === product.productId) ? (
              <QuantityHandler productId={product.productId} className="w-full h-11 md:h-12" />
            ) : (
              <AddToCartButton
                product={product}
                variant="compact"
                className="w-full h-11 md:h-12 bg-black text-white border-2 border-black hover:bg-gray-800 transition-all rounded-lg font-semibold text-xs md:text-sm"
              />
            )}
          </div>

          {/* WhatsApp */}
          <a
            href={`https://wa.me/918107115116?text=${encodeURIComponent("Inquiry about " + product.name)}`}
            target="_blank"
            rel="noreferrer"
            className="h-11 md:h-12 px-3 flex items-center justify-center bg-green-500 hover:bg-green-600 rounded-lg"
          >
            <svg className="h-6 w-6 fill-white" viewBox="0 0 24 24">
              <path d="M20.52 3.48A11.94 11.94 0 0 0 12.06 0C5.46.03.1 5.38.12 11.98c0 2.1.55 4.1 1.52 5.86L0 24l6.3-1.6a12.02 12.02 0 0 0 5.76 1.46h.03c6.6 0 11.97-5.36 12-11.96a11.94 11.94 0  0 0-3.57-8.42zM12.09 21.3h-.02a9.9 9.9 0  0 1-5.04-1.38l-.36-.2-3.74.95.99-3.64-.24-.38a9.36 9.36 0  0 1-1.45-4.96c-.02-5.16 4.18-9.38 9.34-9.4 2.5 0 4.86.98 6.64 2.77a9.32 9.32 0  0 1 2.75 6.65c-.02 5.16-4.22 9.39-9.37 9.39zm5.35-7.26c-.29-.15-1.72-.84-1.99-.94-.27-.1-.46-.15-.66.15-.2.29-.76.94-.92 1.12-.17.19-.34.22-.62.08-.29-.15-1.2-.44-2.28-1.41-1.68-1.5-1.92-2.33-2.14-2.62-.23-.29-.02-.45.13-.6.13-.13.3-.33.45-.5.15-.17.2-.29.3-.49.1-.2.05-.37-.02-.52-.07-.15-.66-1.55-.9-2.12-.24-.57-.48-.49-.66-.49-.17 0-.37-.02-.57-.02-.2 0-.52.08-.8.37-.27.29-1.03 1.01-1.03 2.47 0 1.45 1.06 2.86 1.21 3.06.15.2 2.08 3.16 5.04 4.43.71.31 1.26.48 1.69.62.71.22 1.34.2 1.85.12.57-.09 1.73-.7 1.98-1.39.25-.69.25-1.27.17-1.39-.07-.12-.27-.19-.55-.33z" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
});
