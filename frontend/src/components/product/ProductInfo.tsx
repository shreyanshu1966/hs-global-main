import React, { useState } from 'react';
import { Star, Package, Share2, MessageCircle, FileText, Heart, Truck } from 'lucide-react';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useTrackAddToCart } from '../../hooks/useProducts';
import { AddToCartButton } from '../AddToCartButton';

import { Heading, Body, Caption } from '../ui/Typography';
import { Button } from '../ui/Button';
import { getbasePriceUSD, getDiscountPercentage, geteffectivePriceUSD, hasActiveDiscount } from '../../modules/product/pricing';

interface ProductInfoProps {
    product: any;
    reviewStats: any;
    isInCart: boolean;
    handleShare: () => void;
    reviewsRef: React.RefObject<HTMLDivElement>;
}

export function ProductInfo({
    product,
    reviewStats,
    isInCart,
    handleShare,
    reviewsRef,
}: ProductInfoProps) {
    const navigate = useNavigate();
    const { addItem } = useCart();
    const trackAddToCart = useTrackAddToCart();
    const { formatPrice } = useCurrency();
    const [isFavorite, setIsFavorite] = useState(false);
    
    const basePriceUSD = getbasePriceUSD(product);
    const hasDiscount = hasActiveDiscount(product) && basePriceUSD > 0;
    const discountPercentage = Math.round(getDiscountPercentage(product));
    const effectivePriceUSD = geteffectivePriceUSD(product);
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
                priceUSD: product.priceUSD || basePriceUSD || 0,
                category: product.category,
                subcategory: product.subcategory || '',
                discount: product.discount,
            });
            trackAddToCart(resolvedId);
        }

        navigate('/checkout');
    };

    return (
        <div className="flex flex-col px-4 md:px-8 py-6 md:py-10 max-w-xl">
            {/* Breadcrumbs - Minimal */}
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.15em] text-[#888] mb-8">
                <Link to="/" className="hover:text-[#111] transition-colors">Home</Link>
                <span aria-hidden="true" className="text-[#ccc] px-1">/</span>
                <Link to={`/products/${product.category?.toLowerCase()}`} className="hover:text-[#111] transition-colors">{product.category}</Link>
                <span aria-hidden="true" className="text-[#ccc] px-1">/</span>
                <span aria-current="page" className="text-[#111] font-medium truncate max-w-[150px]">{product.name}</span>
            </nav>

            {/* Share / Favourite */}
            <div className="flex justify-end items-center gap-3 mb-4">
                <button onClick={handleShare} className="text-[#111827] hover:opacity-70 transition-opacity">
                    <Share2 className="w-5 h-5" strokeWidth={1.5} />
                </button>
                <button onClick={() => setIsFavorite(!isFavorite)} className="text-[#111827] hover:opacity-70 transition-opacity">
                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-[#111827]' : ''}`} strokeWidth={1.5} />
                </button>
            </div>

            {/* Title */}
            <h1 className="font-serif text-[26px] md:text-[32px] text-[#222222] leading-[1.2] mb-1">
                {product.name}
            </h1>

            {/* SKU */}
            {product.productCode && (
                <p className="text-[11px] tracking-[0.12em] text-[#aaa] uppercase mb-3">
                    SKU · {product.productCode}
                </p>
            )}

            {/* Sub Description */}
            {product.subDescription && (
                <p className="text-[13.5px] text-[#6b7280] leading-relaxed mb-4" style={{ fontWeight: 300 }}>
                    {product.subDescription}
                </p>
            )}

            {/* Rating */}
            {reviewStats.totalReviews > 0 && (
                <div 
                    className="flex items-center gap-2 mb-6 cursor-pointer group"
                    onClick={() => reviewsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                >
                    <div className="flex items-center">
                        <Star className="w-4 h-4 fill-[#111827] text-[#111827]" />
                        <span className="text-sm font-semibold ml-1">{reviewStats.averageRating.toFixed(1)}</span>
                    </div>
                    <span className="text-xs text-[#666666] group-hover:underline">
                        ({reviewStats.totalReviews} Reviews)
                    </span>
                </div>
            )}

            {/* Price Area */}
            <div className="mb-8">
                {basePriceUSD ? (
                    <div className="flex flex-col gap-1">
                        <div className="flex items-end gap-3 flex-wrap">
                            <span className="text-[28px] md:text-[34px] font-medium text-[#111827] leading-none">
                                {formatPrice(effectivePriceUSD)}
                            </span>
                            {hasDiscount && (
                                <>
                                    <span className="text-[16px] text-[#757575] line-through mb-[4px]">
                                        MRP: {formatPrice(basePriceUSD)}
                                    </span>
                                    {discountPercentage > 0 && (
                                        <span className="text-[14px] font-semibold text-[#b82121] mb-[4px]">
                                            ({discountPercentage}% OFF)
                                        </span>
                                    )}
                                </>
                            )}
                        </div>
                        <p className="text-[11px] text-[#757575] mt-1 uppercase tracking-wide">
                            Inclusive of all taxes
                        </p>
                    </div>
                ) : (
                    <div className="text-[28px] font-medium text-[#111827]">
                        {product.price}
                    </div>
                )}
            </div>

            {/* CTA Buttons */}
            <div className="space-y-4 mb-8">
                {product.available ? (
                    <div className="flex flex-col gap-3">
                        <button
                            type="button"
                            onClick={handleBuyNow}
                            className="w-full h-[52px] bg-[#111827] text-white hover:bg-black transition-colors duration-300 font-semibold tracking-[0.1em] text-[13px] uppercase flex items-center justify-center"
                        >
                            Buy Now
                        </button>
                        <AddToCartButton
                            product={product}
                            className="w-full h-[52px] bg-white border border-[#111827] text-[#111827] hover:bg-[#f9fafb] transition-colors duration-300 font-semibold tracking-[0.1em] text-[13px] uppercase flex items-center justify-center"
                        />
                    </div>
                ) : (
                    <a
                        href={`https://wa.me/918107115116?text=${encodeURIComponent(
                            "Inquiry about " + product.name + " availability"
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full h-[52px] bg-[#111827] text-white hover:bg-black transition-colors duration-300 font-semibold tracking-[0.1em] text-[13px] uppercase flex items-center justify-center gap-2"
                    >
                        Contact for Availability
                    </a>
                )}
            </div>


            
            {/* Seller Contact */}
            <div className="border-t border-[#e5e7eb] pt-5 mt-5">
                 <a
                    href={`https://wa.me/918107115116?text=${encodeURIComponent('Hi! I want to discuss ' + product.name + ' before purchase.')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#111] hover:text-[#555] transition-colors"
                >
                    <MessageCircle className="w-4 h-4" strokeWidth={1.5} />
                    Contact Seller for Bulk Pricing
                </a>
            </div>


        </div>
    );
}
