import React from 'react';
import { Star, Package, Share2, MessageCircle, FileText } from 'lucide-react';
import { useCurrency } from '../../contexts/CurrencyContext';
import { AddToCartButton } from '../AddToCartButton';
import { QuantityHandler } from '../QuantityHandler';
import { Heading, Body, Caption } from '../ui/Typography';
import { Button } from '../ui/Button';

interface ProductInfoProps {
    product: any;
    reviewStats: any;
    isInCart: boolean;
    selectedFinish: string;
    setSelectedFinish: (val: string) => void;
    selectedThickness: string;
    setSelectedThickness: (val: string) => void;
    handleShare: () => void;
    reviewsRef: React.RefObject<HTMLDivElement>;
}

export function ProductInfo({
    product,
    reviewStats,
    isInCart,
    selectedFinish,
    setSelectedFinish,
    selectedThickness,
    setSelectedThickness,
    handleShare,
    reviewsRef,
}: ProductInfoProps) {
    const { formatPrice } = useCurrency();

    return (
        <div className="flex flex-col space-y-8">
            {/* Availability */}
            {product.available ? (
                <Caption className="text-[#2D5F3F] font-bold">In Stock</Caption>
            ) : (
                <Caption className="text-[#8B3A3A] font-bold">Out of Stock</Caption>
            )}

            {/* Title */}
            <Heading level={1} serif>
                {product.name}
            </Heading>

            {/* Rating */}
            <div className="flex items-center gap-3 border-b border-[#E8E3DC] pb-6">
                {reviewStats.totalReviews > 0 ? (
                    <>
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className={`w-5 h-5 ${star <= Math.round(reviewStats.averageRating)
                                        ? 'fill-[#B8944A] text-[#B8944A]'
                                        : 'text-[#E8E3DC]'
                                        }`}
                                />
                            ))}
                        </div>
                        <span className="text-lg font-medium text-[#2B2B2B]">
                            {reviewStats.averageRating.toFixed(1)}
                        </span>
                        <button
                            onClick={() => reviewsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                            className="text-sm text-[#6B6B6B] hover:text-[#2B2B2B] underline-offset-4 hover:underline transition-colors"
                        >
                            ({reviewStats.totalReviews} {reviewStats.totalReviews === 1 ? 'review' : 'reviews'})
                        </button>
                    </>
                ) : (
                    <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className="w-4 h-4 text-[#E8E3DC]" />
                        ))}
                        <span className="text-sm text-[#6B6B6B] ml-1">Be the first to review</span>
                    </div>
                )}
            </div>

            {/* Price */}
            <div className="space-y-4">
                {product.priceINR ? (
                    <>
                        {product.hasDiscount ? (
                            <div className="flex flex-col gap-2">
                                <Caption>Special Price</Caption>
                                <div className="flex items-end gap-3 flex-wrap">
                                    <span className="text-4xl lg:text-5xl font-sans font-bold text-[#8B3A3A]">
                                        {formatPrice(product.discountedPrice)}
                                    </span>
                                    <span className="text-xl text-[#6B6B6B] line-through mb-1">
                                        {formatPrice(product.originalPrice)}
                                    </span>
                                </div>
                                {product.discount?.description && (
                                    <p className="text-sm text-[#B8944A] italic leading-relaxed mt-2 p-3 bg-[#FAF8F5] border border-[#E8E3DC] rounded-sm">
                                        {product.discount.description}
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                <Caption>Price</Caption>
                                <div className="text-4xl lg:text-5xl font-sans font-bold text-[#2B2B2B]">
                                    {formatPrice(product.priceINR)}
                                </div>
                            </div>
                        )}
                        {product.moq && product.available && (
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#FAF8F5] border border-[#E8E3DC] text-sm text-[#6B6B6B]">
                                <Package className="w-4 h-4" />
                                {product.moq}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-3xl font-serif text-[#2B2B2B]">
                        {product.category === 'slabs' ? 'Custom Quote' : product.price}
                    </div>
                )}
            </div>

            <div className="w-full h-px bg-[#E8E3DC]" />

            {/* Description Snippet */}
            <Body color="secondary" className="line-clamp-4">
                {product.description}
            </Body>

            {/* Slab Selectors if required */}
            {product.category === 'slabs' && product.available && (
                <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-[#2B2B2B] uppercase tracking-wider">
                            Finish
                        </label>
                        <select
                            value={selectedFinish}
                            onChange={(e) => setSelectedFinish(e.target.value)}
                            className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#E8E3DC] focus:outline-none focus:border-[#2B2B2B] text-[#2B2B2B] transition-colors"
                        >
                            {['Polish', 'Flaming', 'Sand Blast', 'Shot Blast', 'Bush Hammer', 'River Wash', 'Honed', 'Leather', 'Lepatora'].map((f) => (
                                <option key={f} value={f}>{f}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-[#2B2B2B] uppercase tracking-wider">
                            Thickness
                        </label>
                        <select
                            value={selectedThickness}
                            onChange={(e) => setSelectedThickness(e.target.value)}
                            className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#E8E3DC] focus:outline-none focus:border-[#2B2B2B] text-[#2B2B2B] transition-colors"
                        >
                            {['12mm', '15mm', '18mm', '20mm', '25mm', '30mm'].map((t) => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            {/* CTA Buttons */}
            <div className="space-y-4 pt-4 border-t border-[#E8E3DC]">
                {product.available ? (
                    product.category === 'slabs' ? (
                        <AddToCartButton
                            product={product}
                            preselectedCustomization={{
                                finish: selectedFinish,
                                thickness: selectedThickness,
                            }}
                            className="w-full h-14 bg-[#B8944A] text-white hover:bg-[#A07D3C] transition-colors duration-300 font-medium tracking-wide flex items-center justify-center"
                        />
                    ) : isInCart ? (
                        <QuantityHandler product={product} />
                    ) : (
                        <AddToCartButton
                            product={product}
                            className="w-full h-14 bg-[#B8944A] text-white hover:bg-[#A07D3C] transition-colors duration-300 font-medium tracking-wide flex items-center justify-center"
                        />
                    )
                ) : (
                    <a
                        href={`https://wa.me/918107115116?text=${encodeURIComponent(
                            "Inquiry about " + product.name + " availability"
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full h-14 bg-[#2B2B2B] text-white hover:bg-black transition-colors duration-300 font-medium tracking-wide flex items-center justify-center gap-2"
                    >
                        <MessageCircle className="w-5 h-5" />
                        Contact for Availability
                    </a>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <Button variant="secondary" onClick={handleShare} className="h-14 font-sans tracking-wide">
                        <Share2 className="w-5 h-5 mr-2" />
                        Share
                    </Button>

                    {product.category === 'slabs' ? (
                        <a
                            href="/quotation"
                            className="h-14 flex items-center justify-center border-2 border-[#2B2B2B] text-[#2B2B2B] hover:bg-[#2B2B2B] hover:text-white transition-colors duration-300 font-medium tracking-wide font-sans gap-2"
                        >
                            <FileText className="w-4 h-4" />
                            Request Quote
                        </a>
                    ) : (
                        <a
                            href={`https://wa.me/918107115116?text=${encodeURIComponent('Hi! I am interested in ' + product.name + '. Can you share more details?')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="h-14 flex items-center justify-center border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white transition-colors duration-300 font-medium tracking-wide font-sans gap-2"
                        >
                            <MessageCircle className="w-4 h-4" />
                            WhatsApp
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}
