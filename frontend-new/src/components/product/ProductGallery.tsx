'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { ZoomIn, Heart, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getDiscountPercentage, hasActiveDiscount } from '../../modules/product/pricing';
import { getProductDisplayImages } from '../../modules/product/selectors';

/* ═══════════════════════════════════════════════════════════════
 *  ProductGallery — Scroll-driven image crossfade
 *
 *  HOW IT WORKS:
 *   • Parent (ProductDetails) renders a TALL wrapper div whose
 *     height = images.length × 100vh.
 *   • Inside that wrapper a STICKY panel (100vh) is pinned.
 *   • This gallery lives in the LEFT column of that sticky panel.
 *   • As the user scrolls through the tall wrapper, this component
 *     reads scroll progress and crossfades between images.
 *   • When the tall wrapper is fully scrolled past, the page
 *     continues scrolling normally to specs/reviews/etc.
 * ═══════════════════════════════════════════════════════════════ */

interface ProductGalleryProps {
    product: {
        name: string;
        images: string[];
        sortedImages?: string[];
        image?: string;
        priceINR?: number;
        discount?: {
            enabled: boolean;
            percentage: number;
            startDate?: string | null;
            endDate?: string | null;
            description?: string;
        };
    };
    /** Ref to the tall scroll-space wrapper in ProductDetails */
    scrollWrapperRef: React.RefObject<HTMLDivElement>;
    /** When set, overrides the gallery with the selected variant's photos */
    variantImages?: string[] | null;
}

export function ProductGallery({ product, scrollWrapperRef, variantImages }: ProductGalleryProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [direction, setDirection] = useState<1 | -1>(1);
    const [isImageZoomed, setIsImageZoomed] = useState(false);
    const [zoomedImageIndex, setZoomedImageIndex] = useState(0);
    const [isFavorite, setIsFavorite] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Touch swipe state
    const touchStartX = useRef<number | null>(null);
    const touchStartY = useRef<number | null>(null);

    const galleryImages = getProductDisplayImages(product as any);
    const images = (variantImages && variantImages.length > 0)
        ? variantImages
        : (galleryImages.length > 0 ? galleryImages : product.images);

    // Reset to the first frame whenever the active image set changes (e.g. variant switch)
    useEffect(() => {
        setActiveIndex(0);
        setZoomedImageIndex(0);
    }, [variantImages]);
    const hasDiscountFlag = hasActiveDiscount(product as any) && Boolean(product.priceINR && product.priceINR > 0);
    const discountPercentage = getDiscountPercentage(product as any);

    // ─── MOBILE DETECTION ────────────────────────────────────
    useEffect(() => {
        const mq = window.matchMedia('(max-width: 1023px)');
        setIsMobile(mq.matches);
        const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, []);

    // ─── MOBILE SWIPE HANDLERS ───────────────────────────────
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
        touchStartY.current = e.touches[0].clientY;
    }, []);

    const handleTouchEnd = useCallback((e: React.TouchEvent) => {
        if (touchStartX.current === null || touchStartY.current === null) return;
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        const dy = e.changedTouches[0].clientY - touchStartY.current;
        // Only swipe if mostly horizontal (not a scroll)
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
            if (dx < 0) {
                setDirection(1);
                setActiveIndex(i => Math.min(i + 1, images.length - 1));
            } else {
                setDirection(-1);
                setActiveIndex(i => Math.max(i - 1, 0));
            }
        }
        touchStartX.current = null;
        touchStartY.current = null;
    }, [images.length]);

    // ─── MOBILE PREV/NEXT ────────────────────────────────────
    const prevImage = useCallback(() => {
        setDirection(-1);
        setActiveIndex(i => Math.max(i - 1, 0));
    }, []);

    const nextImage = useCallback(() => {
        setDirection(1);
        setActiveIndex(i => Math.min(i + 1, images.length - 1));
    }, [images.length]);

    // ─── SCROLL → IMAGE INDEX ─────────────────────────────────
    // Uses requestAnimationFrame for smooth reading.
    // Compatible with Lenis (reads actual scroll position).
    // Disabled on mobile — image nav is handled by swipe/buttons instead.
    useEffect(() => {
        if (isMobile) return;
        if (images.length <= 1) return;

        let rafId: number;
        const tick = () => {
            const wrapper = scrollWrapperRef.current;
            if (!wrapper) { rafId = requestAnimationFrame(tick); return; }

            // getBoundingClientRect is reliable regardless of margins/transforms
            const rect = wrapper.getBoundingClientRect();
            const wrapperH = wrapper.offsetHeight;
            const viewH = window.innerHeight;
            const scrollableH = wrapperH - viewH;
            if (scrollableH <= 0) { rafId = requestAnimationFrame(tick); return; }

            // scrolled = how far past the top of wrapper
            const scrolled = -rect.top;
            const progress = Math.max(0, Math.min(1, scrolled / scrollableH));
            // Map progress [0,1] → imageIndex [0, n-1]
            const newIdx = Math.min(
                images.length - 1,
                Math.floor(progress * images.length)
            );

            setActiveIndex(prev => {
                if (prev === newIdx) return prev;
                setDirection(newIdx > prev ? 1 : -1);
                return newIdx;
            });

            rafId = requestAnimationFrame(tick);
        };

        rafId = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafId);
    }, [isMobile, images.length, scrollWrapperRef]);

    // ─── DOT CLICK → SCROLL PAGE ─────────────────────────────
    const scrollToImage = useCallback((idx: number) => {
        const wrapper = scrollWrapperRef.current;
        if (!wrapper) return;
        const rect = wrapper.getBoundingClientRect();
        const wrapperH = wrapper.offsetHeight;
        const viewH = window.innerHeight;
        const scrollableH = wrapperH - viewH;
        const currentScroll = window.scrollY ?? window.pageYOffset;
        const wrapperTop = currentScroll + rect.top;
        const target = wrapperTop + (idx / images.length) * scrollableH;

        const lenis = (window as any).lenis;
        if (lenis?.scrollTo) {
            lenis.scrollTo(target, { duration: 1.2 });
        } else {
            window.scrollTo({ top: target, behavior: 'smooth' });
        }
    }, [images.length, scrollWrapperRef]);

    // ─── ZOOM KEYBOARD NAV ───────────────────────────────────
    const prevZoom = () => setZoomedImageIndex(i => (i - 1 + images.length) % images.length);
    const nextZoom = () => setZoomedImageIndex(i => (i + 1) % images.length);

    useEffect(() => {
        if (!isImageZoomed) return;
        const k = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') prevZoom();
            if (e.key === 'ArrowRight') nextZoom();
            if (e.key === 'Escape') setIsImageZoomed(false);
        };
        window.addEventListener('keydown', k);
        return () => window.removeEventListener('keydown', k);
    }, [isImageZoomed]);

    // ═════════════════════════════════════════════════════════
    return (
        <>
            <div className="pg-root">
                {/* ── Dot nav ── */}
                {images.length > 1 && (
                    <div className="pg-dotnav">
                        {images.map((_, i) => (
                            <button
                                key={i}
                                className={`pg-dot${i === activeIndex ? ' is-active' : ''}`}
                                onClick={() => scrollToImage(i)}
                                aria-label={`Image ${i + 1}`}
                            />
                        ))}
                    </div>
                )}

                {/* ── Image stage ── */}
                <div
                    className="pg-stage"
                    onTouchStart={isMobile ? handleTouchStart : undefined}
                    onTouchEnd={isMobile ? handleTouchEnd : undefined}
                >
                    <AnimatePresence mode="popLayout" initial={false}>
                        <motion.div
                            key={activeIndex}
                            className="pg-frame"
                            initial={{ opacity: 0, x: isMobile ? direction * 60 : 0, y: isMobile ? 0 : direction * 30 }}
                            animate={{ opacity: 1, x: 0, y: 0 }}
                            exit={{ opacity: 0, x: isMobile ? -direction * 60 : 0, y: isMobile ? 0 : -direction * 30 }}
                            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        >
                            <img
                                src={images[activeIndex]}
                                alt={`${product.name} — ${activeIndex + 1}`}
                                className="pg-img"
                                draggable={false}
                            />
                        </motion.div>
                    </AnimatePresence>

                    {/* Overlay buttons */}
                    <div className="pg-overlay">
                        <button
                            className="pg-icon-btn pg-btn-zoom"
                            onClick={() => { setZoomedImageIndex(activeIndex); setIsImageZoomed(true); }}
                        >
                            <ZoomIn className="w-4 h-4" />
                        </button>
                        <button
                            className={`pg-icon-btn pg-btn-fav${isFavorite ? ' is-fav' : ''}`}
                            onClick={() => setIsFavorite(!isFavorite)}
                        >
                            <Heart className={`w-4 h-4${isFavorite ? ' fill-current' : ''}`} />
                        </button>
                    </div>

                    {/* Mobile prev/next arrows */}
                    {isMobile && images.length > 1 && (
                        <>
                            <button
                                className="pg-mob-arrow pg-mob-arrow-left"
                                onClick={prevImage}
                                aria-label="Previous image"
                                style={{ opacity: activeIndex === 0 ? 0.3 : 1 }}
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                className="pg-mob-arrow pg-mob-arrow-right"
                                onClick={nextImage}
                                aria-label="Next image"
                                style={{ opacity: activeIndex === images.length - 1 ? 0.3 : 1 }}
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </>
                    )}

                    {/* Discount badge */}
                    {hasDiscountFlag && discountPercentage > 0 && (
                        <div className="pg-badge">Sale −{discountPercentage}%</div>
                    )}

                    {/* Desktop: counter + progress bar */}
                    {!isMobile && images.length > 1 && (
                        <>
                            <div className="pg-counter">
                                {String(activeIndex + 1).padStart(2, '0')}
                                <span style={{ opacity: 0.45, margin: '0 4px' }}>/</span>
                                <span style={{ opacity: 0.55 }}>{String(images.length).padStart(2, '0')}</span>
                            </div>
                        </>
                    )}

                    {/* Desktop: scroll hint on first image */}
                    {!isMobile && activeIndex === 0 && images.length > 1 && (
                        <motion.div
                            className="pg-scroll-hint"
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1, duration: 0.5 }}
                        >
                            <span>Scroll to explore</span>
                            <svg width="12" height="18" viewBox="0 0 12 18" fill="none">
                                <rect x="1" y="1" width="10" height="16" rx="5" stroke="currentColor" strokeWidth="1.2"/>
                                <motion.rect
                                    x="5" y="4" width="2" height="4" rx="1" fill="currentColor"
                                    animate={{ y: [4, 8, 4] }}
                                    transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                                />
                            </svg>
                        </motion.div>
                    )}
                </div>

                {/* Mobile: horizontal dot nav below image */}
                {isMobile && images.length > 1 && (
                    <div className="pg-mob-dots">
                        {images.map((_, i) => (
                            <button
                                key={i}
                                className={`pg-mob-dot${i === activeIndex ? ' is-active' : ''}`}
                                onClick={() => { setDirection(i > activeIndex ? 1 : -1); setActiveIndex(i); }}
                                aria-label={`Image ${i + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* ── Zoom Modal ── */}
            <AnimatePresence>
                {isImageZoomed && (
                    <motion.div
                        className="pg-modal"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        transition={{ duration: 0.22 }}
                        onClick={() => setIsImageZoomed(false)}
                    >
                        <motion.img
                            key={zoomedImageIndex}
                            src={images[zoomedImageIndex]}
                            alt={product.name}
                            className="pg-modal-img"
                            initial={{ opacity: 0, scale: 0.94 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.97 }}
                            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                            onClick={e => e.stopPropagation()}
                        />
                        <button className="pg-modal-close" onClick={() => setIsImageZoomed(false)}>
                            <X className="w-5 h-5" />
                        </button>
                        {images.length > 1 && (
                            <>
                                <button className="pg-modal-nav left" onClick={e => { e.stopPropagation(); prevZoom(); }}>
                                    <ChevronLeft className="w-6 h-6 text-white" />
                                </button>
                                <button className="pg-modal-nav right" onClick={e => { e.stopPropagation(); nextZoom(); }}>
                                    <ChevronRight className="w-6 h-6 text-white" />
                                </button>
                            </>
                        )}
                        <div className="pg-modal-count">{zoomedImageIndex + 1} / {images.length}</div>
                        {images.length > 1 && (
                            <div className="pg-zoom-thumbs" onClick={e => e.stopPropagation()}>
                                {images.map((img, i) => (
                                    <button
                                        key={i}
                                        className={`pg-zoom-thumb${i === zoomedImageIndex ? ' is-active' : ''}`}
                                        onClick={() => setZoomedImageIndex(i)}
                                    >
                                        <img src={img} alt="" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Styles ── */}
            <style>{`
                .pg-root {
                    display: flex;
                    width: 100%;
                    height: 100%;
                    gap: 0;
                }

                /* Dots */
                .pg-dotnav {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    padding-right: 16px;
                    position: relative;
                    flex-shrink: 0;
                    width: 32px;
                }
                .pg-dotnav-track {
                    position: absolute;
                    left: calc(50% - 8px);
                    top: 0; bottom: 0;
                    width: 1.5px;
                    background: #e2e8f0;
                    border-radius: 2px;
                    overflow: hidden;
                    pointer-events: none;
                }
                .pg-dotnav-fill {
                    width: 100%;
                    background: #111827;
                    transition: height 0.5s cubic-bezier(0.16,1,0.3,1);
                }
                .pg-dot {
                    width: 7px; height: 7px;
                    border-radius: 50%;
                    background: #cbd5e1;
                    border: none;
                    cursor: pointer;
                    position: relative; z-index: 1;
                    flex-shrink: 0;
                    transition: all 0.35s cubic-bezier(0.16,1,0.3,1);
                }
                .pg-dot.is-active {
                    width: 10px; height: 10px;
                    background: #111827;
                    box-shadow: 0 0 0 2px #fff, 0 0 0 3.5px #111827;
                }

                /* Stage */
                .pg-stage {
                    position: relative;
                    flex: 1;
                    min-width: 0;
                    height: 100%;
                    background: #ffffff;
                    overflow: hidden;
                }

                .pg-frame {
                    position: absolute;
                    inset: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #ffffff;
                }

                .pg-img {
                    width: 100%; height: 100%;
                    object-fit: contain;
                    display: block;
                    user-select: none;
                }

                /* Overlay */
                .pg-overlay {
                    position: absolute; inset: 0;
                    pointer-events: none;
                    z-index: 2;
                }
                .pg-icon-btn {
                    position: absolute;
                    pointer-events: all;
                    background: rgba(255,255,255,0.9);
                    border: 1px solid rgba(226,232,240,0.8);
                    border-radius: 4px;
                    padding: 9px;
                    cursor: pointer;
                    color: #1f2937;
                    opacity: 0;
                    transform: translateY(-5px);
                    transition: opacity 0.22s, transform 0.22s, background 0.18s;
                    backdrop-filter: blur(4px);
                }
                .pg-stage:hover .pg-icon-btn { opacity: 1; transform: translateY(0); }
                .pg-btn-zoom { top: 14px; right: 14px; }
                .pg-btn-fav  { top: 14px; left: 14px; }
                .pg-icon-btn.is-fav {
                    background: #8b3131 !important;
                    color: white !important;
                    opacity: 1 !important;
                    transform: translateY(0) !important;
                    border-color: #8b3131 !important;
                }
                .pg-icon-btn:hover:not(.is-fav) { background: #fff; }

                .pg-badge {
                    position: absolute;
                    bottom: 14px; right: 14px;
                    background: #111827; color: #f8fafc;
                    padding: 5px 10px;
                    font-size: 10px; font-weight: 600;
                    letter-spacing: 0.1em; text-transform: uppercase;
                    z-index: 2;
                }

                .pg-progress-bar {
                    position: absolute;
                    bottom: 0; left: 0; right: 0;
                    height: 2px;
                    background: rgba(226,232,240,0.5);
                    z-index: 2;
                }
                .pg-progress-fill {
                    height: 100%;
                    background: #111827;
                    transition: width 0.5s cubic-bezier(0.16,1,0.3,1);
                }

                .pg-counter {
                    position: absolute;
                    bottom: 14px; left: 50%;
                    transform: translateX(-50%);
                    background: rgba(0,0,0,0.35);
                    color: white;
                    padding: 4px 10px;
                    border-radius: 20px;
                    backdrop-filter: blur(4px);
                    font-size: 11px; font-weight: 600;
                    letter-spacing: 0.06em;
                    pointer-events: none;
                    z-index: 2;
                }

                .pg-scroll-hint {
                    position: absolute;
                    bottom: 14px; right: 14px;
                    display: flex; align-items: center; gap: 6px;
                    color: rgba(0,0,0,0.4);
                    font-size: 10px; letter-spacing: 0.08em;
                    text-transform: uppercase;
                    pointer-events: none;
                    z-index: 2;
                }

                /* Zoom modal */
                .pg-modal {
                    position: fixed; inset: 0; z-index: 9999;
                    background: rgba(5,5,5,0.96);
                    display: flex; align-items: center; justify-content: center;
                    padding: 16px; cursor: zoom-out;
                }
                .pg-modal-img {
                    max-width: min(90vw,900px); max-height: 80vh;
                    object-fit: contain; cursor: default; user-select: none;
                }
                .pg-modal-close {
                    position: absolute; top: 20px; right: 20px;
                    background: rgba(255,255,255,0.1);
                    border: 1px solid rgba(255,255,255,0.15);
                    color: white; border-radius: 50%;
                    width: 42px; height: 42px;
                    display: flex; align-items: center; justify-content: center;
                    cursor: pointer; transition: background 0.2s;
                }
                .pg-modal-close:hover { background: rgba(255,255,255,0.2); }
                .pg-modal-nav {
                    position: absolute; top: 50%; transform: translateY(-50%);
                    background: rgba(255,255,255,0.08);
                    border: 1px solid rgba(255,255,255,0.12);
                    border-radius: 50%; width: 50px; height: 50px;
                    display: flex; align-items: center; justify-content: center;
                    cursor: pointer; transition: background 0.2s;
                }
                .pg-modal-nav:hover { background: rgba(255,255,255,0.18); }
                .pg-modal-nav.left { left: 20px; }
                .pg-modal-nav.right { right: 20px; }
                .pg-modal-count {
                    position: absolute; bottom: 90px;
                    left: 50%; transform: translateX(-50%);
                    color: rgba(255,255,255,0.5);
                    font-size: 11px; letter-spacing: 0.12em;
                }
                .pg-zoom-thumbs {
                    position: absolute; bottom: 20px;
                    left: 50%; transform: translateX(-50%);
                    display: flex; gap: 8px;
                    max-width: 90vw; overflow-x: auto;
                    padding: 4px; scrollbar-width: none;
                }
                .pg-zoom-thumbs::-webkit-scrollbar { display: none; }
                .pg-zoom-thumb {
                    width: 52px; height: 52px; flex-shrink: 0;
                    border: 1.5px solid rgba(255,255,255,0.15);
                    border-radius: 4px; overflow: hidden; cursor: pointer;
                    background: rgba(255,255,255,0.05);
                    transition: border-color 0.2s, transform 0.2s;
                    padding: 3px;
                }
                .pg-zoom-thumb img { width: 100%; height: 100%; object-fit: contain; }
                .pg-zoom-thumb:hover { border-color: rgba(255,255,255,0.5); transform: scale(1.05); }
                .pg-zoom-thumb.is-active { border-color: white; transform: scale(1.05); }

                @media (max-width: 1023px) {
                    .pg-root {
                        height: auto;
                        flex-direction: column;
                    }
                    .pg-stage {
                        height: auto;
                        aspect-ratio: 1 / 1;
                    }
                    .pg-dotnav { display: none; }

                    /* Always show overlay buttons on touch (no hover) */
                    .pg-icon-btn {
                        opacity: 1 !important;
                        transform: translateY(0) !important;
                    }

                    /* Mobile prev/next arrow buttons */
                    .pg-mob-arrow {
                        position: absolute;
                        top: 50%; transform: translateY(-50%);
                        background: rgba(255,255,255,0.88);
                        border: 1px solid rgba(226,232,240,0.9);
                        border-radius: 50%;
                        width: 36px; height: 36px;
                        display: flex; align-items: center; justify-content: center;
                        cursor: pointer; z-index: 3;
                        color: #1f2937;
                        backdrop-filter: blur(4px);
                        transition: background 0.18s, opacity 0.2s;
                    }
                    .pg-mob-arrow-left  { left: 10px; }
                    .pg-mob-arrow-right { right: 10px; }
                    .pg-mob-arrow:active { background: rgba(255,255,255,1); }

                    /* Mobile horizontal dot nav */
                    .pg-mob-dots {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        gap: 8px;
                        padding: 12px 0 4px;
                    }
                    .pg-mob-dot {
                        width: 7px; height: 7px;
                        border-radius: 50%;
                        background: #cbd5e1;
                        border: none; cursor: pointer;
                        padding: 0;
                        flex-shrink: 0;
                        transition: all 0.3s cubic-bezier(0.16,1,0.3,1);
                    }
                    .pg-mob-dot.is-active {
                        width: 20px;
                        border-radius: 4px;
                        background: #111827;
                    }
                }

                /* Desktop: hide mobile-only elements */
                @media (min-width: 1024px) {
                    .pg-mob-arrow { display: none; }
                    .pg-mob-dots  { display: none; }
                }
            `}</style>
        </>
    );
}
