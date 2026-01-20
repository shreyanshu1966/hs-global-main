// ⭐ UPDATED ProductCard.tsx — Correct INR → USD → User Currency Conversion

import React, { useEffect, useMemo, useRef, useState, memo } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { Product } from '../data/products';
import { AddToCartButton } from './AddToCartButton';
import { QuantityHandler } from './QuantityHandler';
import { useCart } from '../contexts/CartContext';
import { useCurrency } from '../contexts/CurrencyContext';

import { getFurnitureSpecs } from '../data/furnitureSpecs';
import { loadImageUrl } from '../data/slabs.loader';

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
     ⭐ PRICING LOGIC (SIMPLIFIED)
     ------------------------------------------------------ */

  const specs = useMemo(() => {
    if (product.category === 'furniture') return getFurnitureSpecs(product.name);
    return null;
  }, [product.name, product.category]);

  const displayPrice = useMemo(() => {
    // Case 1: Furniture with price from specs
    if (product.category === 'furniture' && specs?.priceINR) {
      return formatPrice(specs.priceINR);
    }

    // Case 2: products.ts priceINR
    if ((product as any).priceINR) {
      return formatPrice((product as any).priceINR);
    }

    // Case 3: slabs or fallback - use formatPrice for consistency
    return formatPrice(2499); // 2499 INR base price
  }, [product, specs, formatPrice]);

  /* ------------------------------------------------------
     Rest of your existing card logic unchanged
     ------------------------------------------------------ */

  const [isHovering, setIsHovering] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [isInViewport, setIsInViewport] = useState(false);
  const [isVideoInView, setIsVideoInView] = useState(false);

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
      return product.sortedImages;
    }
    // Fallback for slabs or products without sortedImages
    if (isSlab) {
      const all = [...(product.images || [])].filter(Boolean);
      return Array.from(new Set(all));
    } else {
      const all = [product.image, ...(product.images || [])].filter(Boolean);
      return Array.from(new Set(all));
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
          // Start playing video when card is 50% visible
          setShowVideo(true);
        } else {
          // Pause video when card is not visible
          setShowVideo(false);
          if (videoRef.current) {
            videoRef.current.pause();
          }
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




  const etsyUrl = specs?.etsyUrl || null;
  const videoUrl = product.category === 'furniture'
    ? getProductVideoUrl(product.name, product.category, (product as any).subcategory || '')
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
      }, 1100);
    }, 50);

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
    }
  });

  const handleMouseLeave = contextSafe(() => {
    if (isMobile) return; // Skip hover logic on mobile

    setIsHovering(false);
    gsap.to(cardRef.current, { y: 0, duration: 0.2, ease: "power1.in" });
    setShowVideo(false);
    setSlideIndex(0);
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
      className="relative overflow-hidden group transition-transform duration-300 bg-transparent shadow-lg hover:shadow-xl rounded-lg flex flex-col"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      // Initial style handled by GSAP from()
      style={{ opacity: 0, transform: 'translateY(30px)' }}
    >
      {/* IMAGE + VIDEO */}
      <Link
        to={`/products/${product.id}`}
        onClick={handleCardClick}
        className="relative block overflow-hidden bg-transparent"
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
            className="absolute inset-0 w-full h-full object-contain z-20 bg-transparent"
            onError={(e) => {
              // Gracefully handle video 404 by setting error state
              console.log(`Video failed to load: ${videoUrl}`);
              setVideoError(true);
              setShowVideo(false);
            }}
            onLoadStart={() => {
              // Reset error state when video starts loading
              setVideoError(false);
            }}
            onLoadedData={() => {
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
        {showContent && (!product.hasVideo || !showVideo || videoError) &&
          slideshowImages.map((src, idx) => {
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

        {/* PRICE BADGE */}
        {product.category === 'furniture' && (
          <div className="absolute top-3 left-3 z-30">
            <span className="inline-block px-3 py-1.5 text-xs md:text-sm font-semibold rounded-full bg-amber-100/95 text-amber-900 border border-amber-300 shadow-sm">
              {displayPrice}
            </span>
          </div>
        )}

        <div className="absolute inset-0 pointer-events-none ring-1 ring-black/5 rounded-lg" />
      </Link>

      {/* BOTTOM CONTENT */}
      <div className="flex flex-col flex-grow p-4 md:p-5 bg-white rounded-b-lg">
        <Link to={`/products/${product.id}`} onClick={handleCardClick}>
          <h3 className="text-base md:text-lg font-bold text-gray-900 line-clamp-2 mb-3">
            {product.name}
          </h3>
        </Link>

        <div className="mt-auto pt-2 flex gap-2">

          {/* Add to Cart */}
          <div className="flex-grow">
            {state.items.find(i => i.id === product.id) ? (
              <QuantityHandler product={product} className="w-full h-11 md:h-12" />
            ) : (
              <AddToCartButton
                product={product}
                variant="compact"
                className="w-full h-11 md:h-12 bg-black text-white border-2 border-black hover:bg-gray-800 transition-all rounded-lg font-semibold text-xs md:text-sm"
              />
            )}
          </div>

          {/* Etsy */}
          {etsyUrl && (
            <a
              href={etsyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="h-11 md:h-12 px-3 flex items-center justify-center rounded-lg"
              style={{ backgroundColor: "#ff5c01" }}
            >
              <img src="/etsy_logo.webp" alt="Etsy" className="w-8 h-8 object-contain" />
            </a>
          )}

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
