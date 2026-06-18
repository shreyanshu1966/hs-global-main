'use client';
import React, { useState, useMemo } from 'react';
import { Star, Package, Share2, MessageCircle, FileText, Heart, Truck, Gem } from 'lucide-react';
import DeliveryChecker from './DeliveryChecker';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useTrackAddToCart } from '../../hooks/useProducts';
import { AddToCartButton } from '../AddToCartButton';
import { usePrice } from '../../hooks/usePrice';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useStoneQuotation } from '../../contexts/StoneQuotationContext';

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
    const { openModal: openStoneQuotationModal } = useStoneQuotation();
    const isFavorite = isInWishlist(product.id || product._id || product.productId || '');

    const isSemiPreciousStone = product.category === 'semi-precious-stone';
    const sqFtPrice = product.pricePerSqFt as number | undefined;
    const { formatPrice: formatCurrencyPrice, exchangeRates } = useCurrency();
    const formattedSqFtPrice = sqFtPrice && sqFtPrice > 0 && exchangeRates.INR
        ? formatCurrencyPrice(sqFtPrice / exchangeRates.INR)
        : null;
    const sellerRating = reviewStats.totalReviews > 0 ? reviewStats.averageRating.toFixed(1) : '5.0';

    // ── Variant state (must come before usePrice so we can pass the active price) ─
    const isConfigurable = product.productType === 'configurable';
    const variantAttributes: { name: string; values: string[] }[] = product.variantAttributes || [];
    const variantSkus: {
      attributes: Record<string, string>;
      priceUSD: number | null;
      stockQuantity: number;
      sku?: string | null;
      available: boolean;
    }[] = product.variants || [];

    const [selectedAttrs, setSelectedAttrs] = useState<Record<string, string>>(() => {
      const first: Record<string, string> = {};
      for (const attr of variantAttributes) {
        if (attr.values[0]) first[attr.name] = attr.values[0];
      }
      return first;
    });

    const selectedVariant = useMemo(() => {
      if (!isConfigurable || variantSkus.length === 0) return null;
      return variantSkus.find(v => {
        const attrs = v.attributes instanceof Map ? Object.fromEntries(v.attributes) : v.attributes;
        return Object.entries(selectedAttrs).every(([k, val]) => attrs[k] === val);
      }) ?? null;
    }, [isConfigurable, variantSkus, selectedAttrs]);

    const isValueAvailable = (attrName: string, value: string) => {
      if (variantSkus.length === 0) return false;
      const tentative = { ...selectedAttrs, [attrName]: value };
      return variantSkus.some(v => {
        const attrs = v.attributes instanceof Map ? Object.fromEntries(v.attributes) : v.attributes;
        return Object.entries(tentative).every(([k, val]) => attrs[k] === val) && v.available !== false;
      });
    };

    // Single source of pricing: if the selected variant has its own priceUSD, override
    // the product's base price before feeding into usePrice. This way regional adjustments,
    // discounts, currency formatting all flow through the same engine with no special-casing.
    const variantPriceUSD = selectedVariant?.priceUSD ?? null;
    const productForPrice = useMemo(
      () => variantPriceUSD != null ? { ...product, priceUSD: variantPriceUSD } : product,
      [product, variantPriceUSD]
    );

    // One call to usePrice, using whichever price is active (variant or base).
    const price = usePrice(productForPrice);
    const basePriceUSD = price.baseUSD;
    const hasDiscount = price.hasDiscount && !isSemiPreciousStone;
    const discountPercentage = Math.round(price.discountPercentage);

    const getProductId = (): string => {
        return product.productId || product._id || product.id || '';
    };

    const getProductImage = (): string => {
        return product.image || (product.images && product.images[0]) || '/demo2.webp';
    };

    const buildVariantCartId = (baseId: string) => {
        if (!isConfigurable || !selectedVariant) return baseId;
        const suffix = Object.entries(selectedAttrs).map(([k, v]) => `${k}:${v}`).join('__');
        return `${baseId}__${suffix}`;
    };

    const handleBuyNow = () => {
        const resolvedId = getProductId();

        if (!resolvedId) {
            navigate('/checkout');
            return;
        }

        const cartId = buildVariantCartId(resolvedId);
        if (!isInCart) {
            addItem({
                id: cartId,
                productId: product.productId || resolvedId,
                name: product.name,
                image: getProductImage(),
                // basePriceUSD already reflects the variant price (via productForPrice → usePrice)
                priceUSD: basePriceUSD || 0,
                regionalPricing: product.regionalPricing,
                category: product.category,
                subcategory: product.subcategory || '',
                discount: product.discount,
                selectedVariant: selectedVariant
                    ? { attributes: selectedAttrs, sku: selectedVariant.sku }
                    : undefined,
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

            {/* Variant Selector */}
            {isConfigurable && variantAttributes.length > 0 && (
                <div className="mb-4 space-y-3">
                    {variantAttributes.map(attr => (
                        <div key={attr.name}>
                            <p className="text-[11px] uppercase tracking-[0.12em] text-[#888] mb-2 font-medium">
                                {attr.name}
                                {selectedAttrs[attr.name] && (
                                    <span className="ml-1.5 normal-case text-[#111] font-semibold tracking-normal">
                                        — {selectedAttrs[attr.name]}
                                    </span>
                                )}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {attr.values.map(value => {
                                    const active = selectedAttrs[attr.name] === value;
                                    const avail = isValueAvailable(attr.name, value);
                                    return (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() => avail && setSelectedAttrs(prev => ({ ...prev, [attr.name]: value }))}
                                            className={[
                                                'px-3 py-1.5 text-[12px] font-medium border rounded-md transition-all duration-150',
                                                active
                                                    ? 'border-[#111827] bg-[#111827] text-white'
                                                    : avail
                                                    ? 'border-[#d1d5db] text-[#374151] hover:border-[#111827]'
                                                    : 'border-[#e5e7eb] text-[#d1d5db] cursor-not-allowed line-through',
                                            ].join(' ')}
                                        >
                                            {value}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                    {selectedVariant?.sku && (
                        <p className="text-[10px] tracking-[0.12em] text-[#aaa] uppercase">
                            SKU · {selectedVariant.sku}
                        </p>
                    )}
                    {isConfigurable && !selectedVariant && (
                        <p className="text-[11px] text-[#b91c1c]">This combination is unavailable.</p>
                    )}
                </div>
            )}

            {/* Price Area */}
            <div className="mb-4">
                {isSemiPreciousStone ? (
                    formattedSqFtPrice ? (
                        <div className="flex flex-col gap-1">
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-[28px] md:text-[32px] font-medium text-[#111827] leading-none">
                                    {formattedSqFtPrice}
                                </span>
                                <span className="text-[15px] text-[#6b7280]">/ sq.ft</span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-1">
                                <Gem className="w-3.5 h-3.5 text-[#7c5cbf]" />
                                <p className="text-[11px] text-[#7c5cbf] uppercase tracking-wide font-medium">
                                    Custom pricing — request a quotation
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-1">
                            <div className="text-[26px] font-medium text-[#111827]">Price on Request</div>
                            <div className="flex items-center gap-1.5">
                                <Gem className="w-3.5 h-3.5 text-[#7c5cbf]" />
                                <p className="text-[11px] text-[#7c5cbf] uppercase tracking-wide font-medium">
                                    Custom pricing — request a quotation
                                </p>
                            </div>
                        </div>
                    )
                ) : basePriceUSD ? (
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
                            Free shipping
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
                {isSemiPreciousStone ? (
                    <button
                        type="button"
                        onClick={() => openStoneQuotationModal(product)}
                        className="w-full h-[44px] bg-[#111827] text-white hover:bg-black transition-colors duration-300 font-semibold tracking-[0.1em] text-[12px] uppercase flex items-center justify-center gap-2"
                    >
                        <FileText className="w-4 h-4" />
                        Request Quotation
                    </button>
                ) : product.available ? (
                    <div className="flex flex-col gap-2">
                        <button
                            type="button"
                            onClick={handleBuyNow}
                            disabled={isConfigurable && !selectedVariant}
                            className="w-full h-[44px] bg-[#111827] text-white hover:bg-black transition-colors duration-300 font-semibold tracking-[0.1em] text-[12px] uppercase flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Buy Now
                        </button>
                        {isConfigurable ? (
                            <button
                                type="button"
                                disabled={!selectedVariant}
                                onClick={() => {
                                    if (!selectedVariant) return;
                                    const resolvedId = getProductId();
                                    const cartId = buildVariantCartId(resolvedId);
                                    addItem({
                                        id: cartId,
                                        productId: product.productId || resolvedId,
                                        name: product.name,
                                        image: getProductImage(),
                                        // basePriceUSD already reflects variant price (via productForPrice)
                                        priceUSD: basePriceUSD || 0,
                                        regionalPricing: product.regionalPricing,
                                        category: product.category,
                                        subcategory: product.subcategory || '',
                                        discount: product.discount,
                                        selectedVariant: { attributes: selectedAttrs, sku: selectedVariant.sku },
                                    });
                                    trackAddToCart(resolvedId);
                                }}
                                className="w-full h-[44px] bg-white border border-[#111827] text-[#111827] hover:bg-[#f9fafb] transition-colors duration-300 font-semibold tracking-[0.1em] text-[12px] uppercase flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                Add to Cart
                            </button>
                        ) : (
                            <AddToCartButton
                                product={product}
                                className="w-full h-[44px] bg-white border border-[#111827] text-[#111827] hover:bg-[#f9fafb] transition-colors duration-300 font-semibold tracking-[0.1em] text-[12px] uppercase flex items-center justify-center"
                            />
                        )}
                    </div>
                ) : (
                    <a
                        href={`https://wa.me/918107115116?text=${encodeURIComponent(
                            "Inquiry about " + product.name + " availability"
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full h-[44px] bg-[#111827] text-white hover:bg-black transition-colors duration-300 font-semibold tracking-[0.1em] text-[12px] uppercase flex items-center justify-center gap-2"
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
