import { useState } from 'react';
import { ZoomIn, Heart } from 'lucide-react';
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
    const hasDiscount = hasActiveDiscount(product as any);
    const discountPercentage = getDiscountPercentage(product as any);

    return (
        <div className="flex flex-col gap-5 lg:gap-6">
            {/* Main Image */}
            <div className="aspect-[4/3] bg-[#f8fafc] relative group overflow-hidden border border-[#e2e8f0]">
                <img
                    src={images[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.035]"
                />

                {/* Hover Actions */}
                <div className="absolute inset-0 bg-transparent group-hover:bg-black/10 transition-colors duration-300">
                    <button
                        onClick={() => setIsImageZoomed(true)}
                        className="absolute top-4 right-4 bg-white/95 border border-[#e2e8f0] p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-[#f8fafc] hover:scale-105"
                        aria-label="Zoom image"
                    >
                        <ZoomIn className="w-5 h-5 text-[#2d2a25]" />
                    </button>

                    <button
                        onClick={() => setIsFavorite(!isFavorite)}
                        className={`absolute top-4 left-4 p-3 border border-[#e2e8f0] transition-all duration-300 hover:scale-105 ${isFavorite ? 'bg-[#8b3131] text-[#fff8ee]' : 'bg-white/95 text-[#1f2937] hover:bg-[#f8fafc]'
                            }`}
                        aria-label="Add to favorites"
                    >
                        <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                    </button>
                </div>

                {/* Discount Badge */}
                {hasDiscount && discountPercentage > 0 && (
                    <div className="absolute bottom-4 right-4">
                        <div className="bg-[#111827] text-[#f8fafc] border border-[#1f2937] px-3.5 py-2 text-[11px] font-semibold flex items-center gap-1.5 uppercase tracking-[0.1em]">
                            Sale -{discountPercentage}%
                        </div>
                    </div>
                )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
                <div className="grid grid-cols-5 md:grid-cols-6 gap-2.5">
                    {images.slice(0, 6).map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => setSelectedImage(idx)}
                                className={`aspect-[4/3] bg-[#f8fafc] overflow-hidden transition-all duration-300 border ${selectedImage === idx
                                    ? 'border-[#22201c] ring-1 ring-[#22201c]'
                                    : 'border-[#e2e8f0] hover:border-[#64748b]'
                                }`}
                        >
                            <img
                                src={img}
                                alt={`${product.name} ${idx + 1}`}
                                className="w-full h-full object-cover"
                                loading="lazy"
                            />
                        </button>
                    ))}
                </div>
            )}

            {/* Zoom Modal */}
            {isImageZoomed && (
                <div
                    className="fixed inset-0 z-50 bg-[#131210]/95 flex items-center justify-center p-4 cursor-zoom-out"
                    onClick={() => setIsImageZoomed(false)}
                >
                    <img
                        src={images[selectedImage]}
                        alt={product.name}
                        className="max-w-full max-h-[90vh] object-contain cursor-default border border-[#475569]"
                        onClick={(e) => e.stopPropagation()}
                    />
                    <div className="absolute bottom-8 text-[#ebe5d8] text-xs uppercase tracking-[0.12em]">
                        {selectedImage + 1} / {images.length}
                    </div>
                </div>
            )}
        </div>
    );
}
