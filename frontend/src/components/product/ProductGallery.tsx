import React, { useState } from 'react';
import { ZoomIn, Heart, Award } from 'lucide-react';

interface ProductGalleryProps {
    product: {
        name: string;
        images: string[];
        hasDiscount?: boolean;
        discountPercentage?: number;
    };
}

export function ProductGallery({ product }: ProductGalleryProps) {
    const [selectedImage, setSelectedImage] = useState(0);
    const [isImageZoomed, setIsImageZoomed] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);

    return (
        <div className="flex flex-col gap-6">
            {/* Main Image */}
            <div className="aspect-[4/3] bg-[#FAF8F5] relative group overflow-hidden">
                <img
                    src={product.images[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Hover Actions */}
                <div className="absolute inset-0 bg-transparent group-hover:bg-black/5 transition-colors duration-300">
                    <button
                        onClick={() => setIsImageZoomed(true)}
                        className="absolute top-4 right-4 bg-white/90 p-3 shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-105"
                        aria-label="Zoom image"
                    >
                        <ZoomIn className="w-5 h-5 text-[#2B2B2B]" />
                    </button>

                    <button
                        onClick={() => setIsFavorite(!isFavorite)}
                        className={`absolute top-4 left-4 p-3 shadow-sm transition-all duration-300 hover:scale-105 ${isFavorite ? 'bg-[#8B3A3A] text-white' : 'bg-white/90 text-[#2B2B2B] hover:bg-white'
                            }`}
                        aria-label="Add to favorites"
                    >
                        <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                    </button>
                </div>

                {/* Discount Badge */}
                {product.hasDiscount && product.discountPercentage && (
                    <div className="absolute bottom-4 right-4">
                        <div className="bg-[#8B3A3A] text-white px-4 py-2 font-bold text-sm flex items-center gap-1.5 uppercase tracking-wide">
                            Sale -{product.discountPercentage}%
                        </div>
                    </div>
                )}
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
                <div className="grid grid-cols-5 md:grid-cols-6 gap-3">
                    {product.images.slice(0, 6).map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => setSelectedImage(idx)}
                            className={`aspect-[4/3] bg-[#FAF8F5] overflow-hidden transition-all duration-300 ${selectedImage === idx
                                    ? 'border-2 border-[#2B2B2B]'
                                    : 'border border-[#E8E3DC] hover:border-[#2B2B2B]'
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
                    className="fixed inset-0 z-50 bg-[#FAF8F5] flex items-center justify-center p-4 cursor-zoom-out"
                    onClick={() => setIsImageZoomed(false)}
                >
                    <img
                        src={product.images[selectedImage]}
                        alt={product.name}
                        className="max-w-full max-h-[90vh] object-contain cursor-default"
                        onClick={(e) => e.stopPropagation()}
                    />
                    <div className="absolute bottom-8 text-[#2B2B2B] text-sm uppercase tracking-wider">
                        {selectedImage + 1} / {product.images.length}
                    </div>
                </div>
            )}
        </div>
    );
}
