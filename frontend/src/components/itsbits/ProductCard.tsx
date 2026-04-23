import type { KeyboardEventHandler } from 'react';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useWishlist } from '../../contexts/WishlistContext';

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
}

const ProductCard = ({ id, image, title, designer, price, originalPrice, priceINR, originalPriceINR, priceLabel, productLink, showPrice = true }: ProductCardProps) => {
  const { formatPrice } = useCurrency();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const wishlistId = id || productLink || title;
  const isWishlisted = isInWishlist(wishlistId);

  const resolvedPrice = priceLabel || (typeof priceINR === 'number' ? formatPrice(priceINR) : (price || 'Request Quote'));
  const resolvedOriginalPrice = typeof originalPriceINR === 'number' ? formatPrice(originalPriceINR) : originalPrice;
  const hasValidPrice =
    (typeof priceINR === 'number' && priceINR > 0) ||
    (typeof originalPriceINR === 'number' && originalPriceINR > 0);
  const isDiscountActive = Boolean(
    (typeof originalPriceINR === 'number' && typeof priceINR === 'number' && originalPriceINR > priceINR) ||
    (resolvedOriginalPrice && resolvedOriginalPrice !== resolvedPrice)
  );
  const showDiscount = isDiscountActive && hasValidPrice;
  const discountPercentage =
    typeof originalPriceINR === 'number' &&
    typeof priceINR === 'number' &&
    originalPriceINR > priceINR &&
    originalPriceINR > 0
      ? Math.round(((originalPriceINR - priceINR) / originalPriceINR) * 100)
      : null;

  const navigateToProduct = () => {
    if (productLink) {
      window.location.href = productLink;
    }
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
        <img 
          src={image} 
          alt={title} 
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover" 
          onError={(e) => {
            e.currentTarget.src = `https://placehold.co/400x500/f0efe8/aaa?text=${encodeURIComponent(title)}`;
          }}
        />

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
      </div>

      {/* Details */}
      <div className="flex flex-col flex-1">
        <div className="itsbits-product-title itsbits-product-title-text text-[14px] text-[#222] leading-tight mb-[2px]">
          {title}
        </div>
        <div className="itsbits-product-designer itsbits-product-designer-text text-[14px] text-[#666] leading-tight mb-[6px]">
          {designer}
        </div>
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
