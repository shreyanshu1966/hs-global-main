import React from 'react';
import { Star, Package, Share2, MessageCircle, FileText, Heart, Truck } from 'lucide-react';
import DeliveryChecker from './DeliveryChecker';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useTrackAddToCart } from '../../hooks/useProducts';
import { AddToCartButton } from '../AddToCartButton';
import { usePrice } from '../../hooks/usePrice';
import { useWishlist } from '../../contexts/WishlistContext';

import { Heading, Body, Caption } from '../ui/Typography';
import { Button } from '../ui/Button';

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
    const { isInWishlist, toggleWishlist } = useWishlist();
    const isFavorite = isInWishlist(product.id || product._id || product.productId || '');

    const price = usePrice(product);
    const basePriceUSD = price.baseUSD;
    const hasDiscount = price.hasDiscount;
    const discountPercentage = Math.round(price.discountPercentage);
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
                regionalPricing: product.regionalPricing,
                category: product.category,
                subcategory: product.subcategory || '',
                discount: product.discount,
            });
            trackAddToCart(resolvedId);
        }

        navigate('/checkout');
    };

    return (
        <div className="flex flex-col max-w-xl">
            {/* Breadcrumbs + Share row */}
            <div className="flex items-center justify-between mb-3">
                <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-[10px] uppercase tracking-[0.15em] text-[#888]">
                    <Link to="/" className="hover:text-[#111] transition-colors">Home</Link>
                    <span aria-hidden="true" className="text-[#ccc] px-0.5">/</span>
                    <Link to={`/products/${product.category?.toLowerCase()}`} className="hover:text-[#111] transition-colors">{product.category}</Link>
                    <span aria-hidden="true" className="text-[#ccc] px-0.5">/</span>
                    <span aria-current="page" className="text-[#111] font-medium truncate max-w-[120px]">{product.name}</span>
                </nav>
                <div className="flex items-center gap-2.5 shrink-0 ml-3">
                    <button onClick={handleShare} className="text-[#111827] hover:opacity-70 transition-opacity">
                        <Share2 className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                    <button
                        onClick={() => toggleWishlist({
                            id: product.id || product._id || product.productId || '',
                            title: product.name,
                            image: product.image || (product.images && product.images[0]),
                            href: `/products/${product.id || product._id || product.productId}`,
                        })}
                        className="text-[#111827] hover:opacity-70 transition-opacity"
                        aria-label={isFavorite ? 'Remove from wishlist' : 'Add to wishlist'}
                    >
                        <Heart className={`w-4 h-4 ${isFavorite ? 'fill-[#111827]' : ''}`} strokeWidth={1.5} />
                    </button>
                </div>
            </div>

            {/* Title */}
            <h1 className="font-serif text-[22px] md:text-[26px] text-[#222222] leading-[1.2] mb-1">
                {product.name}
            </h1>

            {/* SKU */}
            {product.productCode && (
                <p className="text-[10px] tracking-[0.12em] text-[#aaa] uppercase mb-2">
                    SKU · {product.productCode}
                </p>
            )}

            {/* Sub Description */}
            {product.subDescription && (
                <p className="text-[12.5px] text-[#6b7280] leading-relaxed mb-2" style={{ fontWeight: 300 }}>
                    {product.subDescription}
                </p>
            )}

            {/* Rating */}
            <div
                className="flex items-center gap-2 mb-3 cursor-pointer group"
                onClick={() => reviewsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            >
                <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map(star => (
                        <Star
                            key={star}
                            className={`w-3.5 h-3.5 transition-colors ${
                                star <= Math.round(reviewStats.averageRating)
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-[#d1d5db]'
                            }`}
                        />
                    ))}
                </div>
                {reviewStats.totalReviews > 0 ? (
                    <span className="text-[11px] text-[#555] group-hover:underline">
                        <span className="font-semibold">{reviewStats.averageRating.toFixed(1)}</span>
                        {' · '}{reviewStats.totalReviews} review{reviewStats.totalReviews !== 1 ? 's' : ''}
                    </span>
                ) : (
                    <span className="text-[11px] text-[#9ca3af] group-hover:underline">No reviews yet</span>
                )}
            </div>

            {/* Price Area */}
            <div className="mb-4">
                {basePriceUSD ? (
                    <div className="flex flex-col gap-0.5">
                        <div className="flex items-end gap-2.5 flex-wrap">
                            <span className="text-[24px] md:text-[28px] font-medium text-[#111827] leading-none">
                                {price.formattedPrice}
                            </span>
                            {hasDiscount && (
                                <>
                                    <span className="text-[13px] text-[#757575] line-through mb-[2px]">
                                        MRP: {price.originalFormattedPrice}
                                    </span>
                                    {discountPercentage > 0 && (
                                        <span className="text-[12px] font-semibold text-[#b82121] mb-[2px]">
                                            ({discountPercentage}% OFF)
                                        </span>
                                    )}
                                </>
                            )}
                        </div>
                        <p className="text-[10px] text-[#757575] uppercase tracking-wide">
                            Inclusive of all taxes
                        </p>
                    </div>
                ) : (
                    <div className="text-[24px] font-medium text-[#111827]">
                        Price on Request
                    </div>
                )}
            </div>

            {/* CTA Buttons */}
            <div className="mb-4">
                {product.available ? (
                    <div className="flex flex-col gap-2">
                        <button
                            type="button"
                            onClick={handleBuyNow}
                            className="w-full h-[44px] bg-[#111827] text-white hover:bg-black transition-colors duration-300 font-semibold tracking-[0.1em] text-[12px] uppercase flex items-center justify-center"
                        >
                            Buy Now
                        </button>
                        <AddToCartButton
                            product={product}
                            className="w-full h-[44px] bg-white border border-[#111827] text-[#111827] hover:bg-[#f9fafb] transition-colors duration-300 font-semibold tracking-[0.1em] text-[12px] uppercase flex items-center justify-center"
                        />
                    </div>
                ) : (
                    <a
                        href={`https://wa.me/918107115116?text=${encodeURIComponent(
                            "Inquiry about " + product.name + " availability"
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full h-[44px] bg-[#111827] text-white hover:bg-black transition-colors duration-300 font-semibold tracking-[0.1em] text-[12px] uppercase flex items-center justify-center gap-2 block"
                    >
                        Contact for Availability
                    </a>
                )}
            </div>

            {/* Delivery Checker */}
            <div className="border-t border-[#e5e7eb] pt-3 pb-3">
                <DeliveryChecker shippingConfig={product.shipping} productId={product.productId || product._id || ''} />
            </div>

            {/* Seller Contact */}
            <div className="border-t border-[#e5e7eb] pt-3">
                <a
                    href={`https://wa.me/918107115116?text=${encodeURIComponent('Hi! I want to discuss ' + product.name + ' before purchase.')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#111] hover:text-[#555] transition-colors"
                >
                    <MessageCircle className="w-3.5 h-3.5" strokeWidth={1.5} />
                    Contact Seller for Bulk Pricing
                </a>
            </div>
        </div>
    );
}
