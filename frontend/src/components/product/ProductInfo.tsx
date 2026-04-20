import React from 'react';
import { Star, Package, Share2, MessageCircle, FileText } from 'lucide-react';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useTrackAddToCart } from '../../hooks/useProducts';
import { AddToCartButton } from '../AddToCartButton';
import { QuantityHandler } from '../QuantityHandler';
import { Heading, Body, Caption } from '../ui/Typography';
import { Button } from '../ui/Button';
import { getBasePriceINR, getEffectivePriceINR, hasActiveDiscount } from '../../modules/product/pricing';

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
    const navigate = useNavigate();
    const { addItem } = useCart();
    const trackAddToCart = useTrackAddToCart();
    const { formatPrice } = useCurrency();
    const hasDiscount = hasActiveDiscount(product);
    const basePriceINR = getBasePriceINR(product);
    const effectivePriceINR = getEffectivePriceINR(product);
    const sellerRating = reviewStats.totalReviews > 0 ? reviewStats.averageRating.toFixed(1) : '5.0';

    const getProductId = (): string => {
        return product.productId || product._id || product.id || '';
    };

    const getProductImage = (): string => {
        return product.image || (product.images && product.images[0]) || '/demo2.webp';
    };

    const handleBuyNow = () => {
        const resolvedId = getProductId();

        if (!resolvedId) {
            navigate('/checkout');
            return;
        }

        if (!isInCart) {
            addItem({
                id: resolvedId,
                productId: product.productId || resolvedId,
                name: product.name,
                image: getProductImage(),
                priceINR: product.priceINR || basePriceINR || 0,
                category: product.category,
                subcategory: product.subcategory || '',
                discount: product.discount,
            });
            trackAddToCart(resolvedId);
        }

        navigate('/checkout');
    };

    return (
        <div className="flex flex-col space-y-5 bg-white border border-[#e2e8f0] px-6 md:px-7 py-7">
            {/* Availability */}
            {product.available ? (
                <Caption className="text-[#2d5f3f] font-semibold uppercase tracking-[0.12em]">In Stock</Caption>
            ) : (
                <Caption className="text-[#8b3a3a] font-semibold uppercase tracking-[0.12em]">Out of Stock</Caption>
            )}

            {/* Title */}
            <h1 className="font-serif font-bold text-2xl md:text-3xl lg:text-4xl text-[#23201a] leading-[1.07]">
                {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3 border-b border-[#e2e8f0] pb-4">
                {reviewStats.totalReviews > 0 ? (
                    <>
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className={`w-5 h-5 ${star <= Math.round(reviewStats.averageRating)
                                        ? 'fill-[#334155] text-[#334155]'
                                        : 'text-[#E8E3DC]'
                                        }`}
                                />
                            ))}
                        </div>
                        <span className="text-lg font-semibold text-[#2a251f]">
                            {reviewStats.averageRating.toFixed(1)}
                        </span>
                        <button
                            onClick={() => reviewsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                            className="text-xs uppercase tracking-[0.08em] text-[#6f6657] hover:text-[#2B2B2B] underline-offset-4 hover:underline transition-colors"
                        >
                            ({reviewStats.totalReviews} {reviewStats.totalReviews === 1 ? 'review' : 'reviews'})
                        </button>
                    </>
                ) : (
                    <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className="w-4 h-4 text-[#E8E3DC]" />
                        ))}
                        <span className="text-sm text-[#6b6255] ml-1">Be the first to review</span>
                    </div>
                )}
            </div>

            {/* Price */}
            <div className="space-y-3 bg-[#f8fafc] border border-[#e2e8f0] p-4">
                {basePriceINR ? (
                    <>
                        {hasDiscount ? (
                            <div className="flex flex-col gap-2">
                                <Caption className="uppercase tracking-[0.1em]">Special Price</Caption>
                                <div className="flex items-end gap-3 flex-wrap">
                                    <span className="text-4xl lg:text-[2.6rem] font-['Playfair_Display'] font-bold text-[#5a2a2a] leading-none">
                                        {formatPrice(effectivePriceINR)}
                                    </span>
                                    <span className="text-lg text-[#766d5f] line-through mb-1">
                                        {formatPrice(basePriceINR)}
                                    </span>
                                </div>
                                {product.discount?.description && (
                                    <p className="text-sm text-[#6b5a36] italic leading-relaxed mt-2 p-3 bg-white border border-[#e2e8f0]">
                                        {product.discount.description}
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                <Caption className="uppercase tracking-[0.1em]">Price</Caption>
                                <div className="text-4xl lg:text-[2.6rem] font-['Playfair_Display'] font-bold text-[#24201b] leading-none">
                                    {formatPrice(basePriceINR)}
                                </div>
                            </div>
                        )}
                        {product.moq && product.available && (
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] text-xs uppercase tracking-[0.08em] text-[#475569]">
                                <Package className="w-4 h-4" />
                                {product.moq}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-3xl font-['Playfair_Display'] text-[#2B2B2B]">
                        {product.category === 'slabs' ? 'Custom Quote' : product.price}
                    </div>
                )}

                <div className="flex items-center justify-between border-t border-[#e2e8f0] pt-3">
                    <Caption className="uppercase tracking-[0.1em]">Quantity</Caption>
                    {isInCart ? (
                        <div className="scale-90 origin-right">
                            <QuantityHandler product={product} />
                        </div>
                    ) : (
                        <span className="text-sm text-[#334155]">1</span>
                    )}
                </div>
            </div>

            <div className="w-full h-px bg-[#e2e8f0]" />

            {/* Slab Selectors if required */}
            {product.category === 'slabs' && product.available && (
                <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-[#2b2b2b] uppercase tracking-[0.1em]">
                            Finish
                        </label>
                        <select
                            value={selectedFinish}
                            onChange={(e) => setSelectedFinish(e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-[#cbd5e1] focus:outline-none focus:border-[#111827] text-[#2B2B2B] transition-colors"
                        >
                            {['Polish', 'Flaming', 'Sand Blast', 'Shot Blast', 'Bush Hammer', 'River Wash', 'Honed', 'Leather', 'Lepatora'].map((f) => (
                                <option key={f} value={f}>{f}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-[#2b2b2b] uppercase tracking-[0.1em]">
                            Thickness
                        </label>
                        <select
                            value={selectedThickness}
                            onChange={(e) => setSelectedThickness(e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-[#cbd5e1] focus:outline-none focus:border-[#111827] text-[#2B2B2B] transition-colors"
                        >
                            {['12mm', '15mm', '18mm', '20mm', '25mm', '30mm'].map((t) => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            {/* CTA Buttons */}
            <div className="space-y-4 pt-1">
                {product.available ? (
                    product.category === 'slabs' ? (
                        <AddToCartButton
                            product={product}
                            preselectedCustomization={{
                                finish: selectedFinish,
                                thickness: selectedThickness,
                            }}
                            className="w-full h-14 bg-[#1f1c18] text-[#f8f3ea] hover:bg-[#35302a] transition-colors duration-300 font-semibold tracking-[0.08em] uppercase flex items-center justify-center"
                        />
                    ) : (
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={handleBuyNow}
                                className="h-14 bg-[#0f766e] text-[#f0fdfa] hover:bg-[#115e59] transition-colors duration-300 font-semibold tracking-[0.08em] uppercase flex items-center justify-center"
                            >
                                Buy Now
                            </button>
                            <AddToCartButton
                                product={product}
                                className="w-full h-14 bg-[#1f1c18] text-[#f8f3ea] hover:bg-[#35302a] transition-colors duration-300 font-semibold tracking-[0.08em] uppercase flex items-center justify-center"
                            />
                        </div>
                    )
                ) : (
                    <a
                        href={`https://wa.me/918107115116?text=${encodeURIComponent(
                            "Inquiry about " + product.name + " availability"
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full h-14 bg-[#2B2B2B] text-white hover:bg-black transition-colors duration-300 font-semibold tracking-[0.08em] uppercase flex items-center justify-center gap-2"
                    >
                        <MessageCircle className="w-5 h-5" />
                        Contact for Availability
                    </a>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <Button variant="secondary" onClick={handleShare} className="h-14 font-sans tracking-[0.08em] uppercase border-[#cbd5e1] bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#1f2937]">
                        <Share2 className="w-5 h-5 mr-2" />
                        Save / Share
                    </Button>

                    {product.category === 'slabs' ? (
                        <a
                            href="/quotation"
                            className="h-14 flex items-center justify-center border border-[#2B2B2B] text-[#2B2B2B] hover:bg-[#2B2B2B] hover:text-[#f8f2e8] transition-colors duration-300 font-semibold text-[11px] sm:text-xs tracking-[0.04em] sm:tracking-[0.08em] normal-case sm:uppercase font-sans gap-2 bg-white px-2 text-center leading-tight"
                        >
                            <FileText className="w-4 h-4" />
                            Contact Seller
                        </a>
                    ) : (
                        <a
                            href={`https://wa.me/918107115116?text=${encodeURIComponent('Hi! I am interested in ' + product.name + '. Can you share more details?')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="h-14 flex items-center justify-center border border-[#1f6b55] text-[#1f6b55] hover:bg-[#1f6b55] hover:text-[#f5efe2] transition-colors duration-300 font-semibold text-[11px] sm:text-xs tracking-[0.04em] sm:tracking-[0.08em] normal-case sm:uppercase font-sans gap-2 bg-white px-2 text-center leading-tight"
                        >
                            <MessageCircle className="w-4 h-4" />
                            Contact Seller
                        </a>
                    )}
                </div>
            </div>

            {/* Shipping */}
            <div className="border-t border-[#e2e8f0] pt-4 space-y-1.5">
                <p className="text-[11px] uppercase tracking-[0.1em] text-[#64748b]">Shipping</p>
                <p className="text-sm text-[#111827]">Ships from India: Rates vary</p>
            </div>

            {/* Confidence */}
            <div className="border-t border-[#e2e8f0] pt-4 space-y-1.5">
                <p className="text-[11px] uppercase tracking-[0.1em] text-[#64748b]">Shop With Confidence</p>
                <p className="text-sm text-[#111827]">Authenticity Guarantee, Money-Back Guarantee, 24-Hour Cancellation</p>
            </div>

            {/* Seller Info */}
            <div className="border border-[#e2e8f0] bg-[#f8fafc] px-4 py-4 space-y-2">
                <p className="text-[11px] uppercase tracking-[0.1em] text-[#64748b]">Diamond Seller</p>
                <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-semibold text-[#111827]">HS Global Export</p>
                    <p className="text-sm text-[#334155]">{sellerRating}</p>
                </div>
                <a
                    href={`https://wa.me/918107115116?text=${encodeURIComponent('Hi! I want to discuss ' + product.name + ' before purchase.')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.1em] text-[#0f766e] hover:text-[#115e59] transition-colors"
                >
                    <MessageCircle className="w-4 h-4" />
                    Message The Seller
                </a>
            </div>

            {/* Description Snippet */}
            <Body color="secondary" className="line-clamp-3 text-[#4f493f] leading-relaxed border-t border-[#e2e8f0] pt-4">
                {product.description}
            </Body>
        </div>
    );
}
