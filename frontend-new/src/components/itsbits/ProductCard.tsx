'use client';
import { useState, type KeyboardEventHandler } from 'react';
import Image from 'next/image';
import { useWishlist } from '../../contexts/WishlistContext';
import { useCart } from '../../contexts/CartContext';
import { usePrice } from '../../hooks/usePrice';
import type { Product } from '../../services/productService';

interface ProductCardProps {
  id?: string;
  image: string;
  title: string;
  designer: string;
  price?: string;
  originalPrice?: string;
  priceINR?: number;
  originalPriceINR?: number;
  priceLabel?: string;
  productLink?: string;
  showPrice?: boolean;
  averageRating?: number;
  totalReviews?: number;
  regionalPricing?: Product['regionalPricing'];
  discount?: Product['discount'];
}

const ProductCard = ({ id, image, title, designer, price, originalPrice, priceINR, originalPriceINR, priceLabel, productLink, showPrice = true, averageRating, totalReviews, regionalPricing, discount }: ProductCardProps) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addItem } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  const wishlistId = id || productLink || title;
  const isWishlisted = isInWishlist(wishlistId);

  // Build minimal product shape so usePrice applies regional + discount logic correctly
  const computed = usePrice(
    priceINR != null ? { priceINR, regionalPricing, discount } : null
  );

  const resolvedPrice = priceLabel || (priceINR != null ? computed.formattedPrice : (price || 'Request Quote'));
  const resolvedOriginalPrice = (priceINR != null && computed.hasDiscount) ? computed.originalFormattedPrice : originalPrice;
  const hasValidPrice = (priceINR != null && priceINR > 0) || (typeof originalPriceINR === 'number' && originalPriceINR > 0);
  const showDiscount = hasValidPrice && computed.hasDiscount;
  const discountPercentage = computed.hasDiscount ? computed.discountPercentage : null;

  const navigateToProduct = () => {
    if (productLink) {
      window.location.href = productLink;
    }
  };

  const handleAddToCart = () => {
    if (!(typeof priceINR === 'number' && priceINR > 0)) {
      return;
    }

    const resolvedId = id || productLink || title;

    addItem({
      id: resolvedId,
      productId: resolvedId,
      name: title,
      image,
      priceINR,
      category: 'furniture',
      subcategory: designer,
      regionalPricing,
      discount,
    });

    setIsAdded(true);
    window.setTimeout(() => setIsAdded(false), 1500);
  };

  const handleKeyDown: KeyboardEventHandler<HTMLDivElement> = (event) => {
    if (!productLink) {
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      navigateToProduct();
    }
  };

  return (
    <div
      className="group cursor-pointer flex flex-col w-full itsbits-product-card"
      onClick={navigateToProduct}
      onKeyDown={handleKeyDown}
      role={productLink ? 'link' : undefined}
      tabIndex={productLink ? 0 : undefined}
      aria-label={productLink ? `Open ${title}` : undefined}
    >
      {/* Image Container */}
      <div className="relative w-full aspect-[4/5] bg-[#f0efe8] mb-[10px] overflow-hidden transition-opacity duration-200 group-hover:opacity-90">
        {image && !image.startsWith('data:') ? (
          <Image
            fill
            src={image}
            alt={title}
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            loading="lazy"
            quality={65}
          />
        ) : (
          <img
            src={image || `https://placehold.co/400x500/f0efe8/aaa?text=${encodeURIComponent(title)}`}
            alt={title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover"
          />
        )}

        {showDiscount && (
          <span className="absolute top-[8px] left-[8px] z-10 bg-[#b91c1c] text-white text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.05em] px-2 sm:px-[10px] py-1 sm:py-[5px] rounded-full shadow-sm">
            {discountPercentage ? `${discountPercentage}% Off` : 'On Sale'}
          </span>
        )}

        {/* Favorite Button Overlay */}
        <button
          className={`absolute top-[9px] right-[9px] w-[32px] h-[32px] rounded-full flex items-center justify-center transition-colors shadow-sm z-10 ${isWishlisted ? 'bg-[#8b3a3a] text-white' : 'bg-white text-[#1f2937] hover:bg-gray-50'}`}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            toggleWishlist({
              id: wishlistId,
              title,
              image,
              href: productLink,
              designer,
              price: resolvedPrice,
            });
          }}
        >
           <svg width="18" height="18" viewBox="0 0 24 24" fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
             <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
           </svg>
        </button>

        <button
          type="button"
          className="absolute top-[47px] right-[9px] w-[32px] h-[32px] rounded-full flex items-center justify-center transition-all shadow-sm z-10 border border-white/70 bg-white/95 text-[#111827] hover:bg-white disabled:bg-white/80 disabled:text-[#9ca3af] disabled:cursor-not-allowed"
          disabled={!(typeof priceINR === 'number' && priceINR > 0)}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            handleAddToCart();
          }}
          aria-label={typeof priceINR === 'number' && priceINR > 0 ? `Add ${title} to cart` : `${title} is available on request`}
          title={typeof priceINR === 'number' && priceINR > 0 ? (isAdded ? 'Added to cart' : 'Add to cart') : 'Price on request'}
        >
          {typeof priceINR === 'number' && priceINR > 0 ? (
            isAdded ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
            )
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          )}
        </button>
      </div>

      {/* Details */}
      <div className="flex flex-col flex-1">
        <div className="itsbits-product-title itsbits-product-title-text text-[14px] text-[#222] leading-tight mb-[2px]">
          {title}
        </div>
        <div className="itsbits-product-designer itsbits-product-designer-text text-[14px] text-[#666] leading-tight mb-[4px]">
          {designer}
        </div>
        
        {/* Rating Section — identical logic to products-page ProductCard */}
        {(averageRating || 0) > 0 && (totalReviews || 0) > 0 && (
          <div className="flex items-center gap-1.5 mb-[6px]">
            <div className="flex text-[#f59e0b]">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`w-3.5 h-3.5 ${star <= Math.round(averageRating || 0) ? 'fill-current' : 'fill-transparent stroke-current stroke-[1.5]'}`}
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
            </div>
            <span className="text-[13px] text-[#6B6B6B]">
              ({totalReviews})
            </span>
          </div>
        )}
        {showPrice && (
          showDiscount ? (
            <div className="mt-auto space-y-1.5">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <span className="itsbits-price-new text-[14px] sm:text-[15px] text-[#b91c1c] itsbits-price-new-discount font-semibold leading-none">
                  {resolvedPrice}
                </span>
                {discountPercentage && (
                  <span className="inline-flex items-center rounded-full border border-[#fecaca] bg-[#fef2f2] px-1.5 sm:px-2 py-[2px] text-[10px] sm:text-[11px] font-semibold tracking-[0.01em] sm:tracking-[0.02em] text-[#b91c1c] leading-none">
                    Save {discountPercentage}%
                  </span>
                )}
              </div>
              {resolvedOriginalPrice && (
                <span className="itsbits-price-old text-[12px] sm:text-[13px] text-[#6b7280] line-through decoration-1 leading-none block">
                  {resolvedOriginalPrice}
                </span>
              )}
            </div>
          ) : (
            <div className="mt-auto">
              <span className="itsbits-price-new text-[14px] sm:text-[15px] text-[#222] leading-none">
                {resolvedPrice}
              </span>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default ProductCard;
