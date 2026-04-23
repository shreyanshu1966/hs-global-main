import { useState } from 'react';
import { ZoomIn, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { getDiscountPercentage, hasActiveDiscount } from '../../modules/product/pricing';
import { getProductDisplayImages } from '../../modules/product/selectors';

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
}

export function ProductGallery({ product }: ProductGalleryProps) {
    const [selectedImage, setSelectedImage] = useState(0);
    const [isImageZoomed, setIsImageZoomed] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);

    const galleryImages = getProductDisplayImages(product as any);
    const images = galleryImages.length > 0 ? galleryImages : product.images;
    const hasDiscount = hasActiveDiscount(product as any) && Boolean(product.priceINR && product.priceINR > 0);
    const discountPercentage = getDiscountPercentage(product as any);

    const prev = () => setSelectedImage(i => (i - 1 + images.length) % images.length);
    const next = () => setSelectedImage(i => (i + 1) % images.length);

    return (
        <div className="flex flex-col gap-3">

            {/* ── Main Image ── */}
            <div className="relative group bg-[#f8fafc] border border-[#e2e8f0] overflow-hidden"
                 style={{ maxHeight: '480px' }}>

                {/* Image — object-contain so full image is always visible */}
                <img
                    src={images[selectedImage]}
                    alt={product.name}
                    className="w-full object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                    style={{ maxHeight: '480px', display: 'block' }}
                />

                {/* Prev / Next arrows (only when multiple images) */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={prev}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 border border-[#e2e8f0] rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-white hover:scale-105 shadow-sm"
                            aria-label="Previous image"
                        >
                            <ChevronLeft className="w-4 h-4 text-[#374151]" />
                        </button>
                        <button
                            onClick={next}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 border border-[#e2e8f0] rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-white hover:scale-105 shadow-sm"
                            aria-label="Next image"
                        >
                            <ChevronRight className="w-4 h-4 text-[#374151]" />
                        </button>
                    </>
                )}

                {/* Zoom button */}
                <button
                    onClick={() => setIsImageZoomed(true)}
                    className="absolute top-3 right-3 bg-white/90 border border-[#e2e8f0] p-2.5 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-white rounded-sm shadow-sm"
                    aria-label="Zoom image"
                >
                    <ZoomIn className="w-4 h-4 text-[#2d2a25]" />
                </button>

                {/* Favourite button */}
                <button
                    onClick={() => setIsFavorite(!isFavorite)}
                    className={`absolute top-3 left-3 p-2.5 border border-[#e2e8f0] rounded-sm transition-all duration-200 hover:scale-105 shadow-sm ${
                        isFavorite ? 'bg-[#8b3131] text-white' : 'bg-white/90 text-[#1f2937] hover:bg-white'
                    }`}
                    aria-label="Add to favourites"
                >
                    <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                </button>

                {/* Discount badge */}
                {hasDiscount && discountPercentage > 0 && (
                    <div className="absolute bottom-3 right-3 bg-[#111827] text-[#f8fafc] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em]">
                        Sale −{discountPercentage}%
                    </div>
                )}

                {/* Dot indicator (mobile) */}
                {images.length > 1 && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 md:hidden">
                        {images.slice(0, 6).map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setSelectedImage(i)}
                                className={`w-1.5 h-1.5 rounded-full transition-all ${
                                    i === selectedImage ? 'bg-[#111827] w-4' : 'bg-[#111827]/40'
                                }`}
                                aria-label={`Image ${i + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* ── Thumbnails (hidden on mobile — use dots instead) ── */}
            {images.length > 1 && (
                <div className="hidden md:flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                    {images.slice(0, 8).map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => setSelectedImage(idx)}
                            className={`flex-shrink-0 w-16 h-16 bg-[#f8fafc] overflow-hidden border transition-all duration-200 ${
                                selectedImage === idx
                                    ? 'border-[#22201c] ring-1 ring-[#22201c]'
                                    : 'border-[#e2e8f0] hover:border-[#94a3b8]'
                            }`}
                            aria-label={`View image ${idx + 1}`}
                        >
                            <img
                                src={img}
                                alt={`${product.name} ${idx + 1}`}
                                className="w-full h-full object-contain"
                                loading="lazy"
                            />
                        </button>
                    ))}
                </div>
            )}

            {/* ── Zoom Modal ── */}
            {isImageZoomed && (
                <div
                    className="fixed inset-0 z-50 bg-[#0a0a0a]/96 flex items-center justify-center p-4 cursor-zoom-out"
                    onClick={() => setIsImageZoomed(false)}
                >
                    <img
                        src={images[selectedImage]}
                        alt={product.name}
                        className="max-w-full max-h-[90vh] object-contain cursor-default"
                        onClick={e => e.stopPropagation()}
                    />
                    {images.length > 1 && (
                        <>
                            <button
                                onClick={e => { e.stopPropagation(); prev(); }}
                                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 rounded-full p-3 transition-colors"
                            >
                                <ChevronLeft className="w-6 h-6 text-white" />
                            </button>
                            <button
                                onClick={e => { e.stopPropagation(); next(); }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 rounded-full p-3 transition-colors"
                            >
                                <ChevronRight className="w-6 h-6 text-white" />
                            </button>
                        </>
                    )}
                    <div className="absolute bottom-6 text-white/60 text-xs uppercase tracking-[0.12em]">
                        {selectedImage + 1} / {images.length}
                    </div>
                </div>
            )}
        </div>
    );
}
