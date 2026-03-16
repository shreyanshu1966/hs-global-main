import type { KeyboardEventHandler } from 'react';

interface ProductCardProps {
  image: string;
  title: string;
  designer: string;
  price: string;
  originalPrice?: string;
  productLink?: string;
  showPrice?: boolean;
}

const ProductCard = ({ image, title, designer, price, originalPrice, productLink, showPrice = true }: ProductCardProps) => {
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
          className="w-full h-full object-cover" 
          onError={(e) => {
            e.currentTarget.src = `https://placehold.co/400x500/f0efe8/aaa?text=${encodeURIComponent(title)}`;
          }}
        />
        {/* Favorite Button Overlay */}
        <button className="absolute top-[9px] right-[9px] w-[32px] h-[32px] bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10 hover:bg-gray-50" aria-label="Add to favorites" type="button" onClick={(event) => event.stopPropagation()}>
           <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
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
          <div className="flex items-center gap-[6px] mt-auto">
            {originalPrice && (
              <span className="itsbits-price-old text-[14px] text-[#222] line-through decoration-1">{originalPrice}</span>
            )}
            <span className={`itsbits-price-new text-[14px] ${originalPrice ? 'text-[#d60000] itsbits-price-new-discount' : 'text-[#222]'}`}>
              {price}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
