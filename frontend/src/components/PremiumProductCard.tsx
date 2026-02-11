import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Eye, Sparkles } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Product } from '../services/productService';
import { useCurrency } from '../contexts/CurrencyContext';
import { useCart } from '../contexts/CartContext';
import { getProductCloudinaryUrl } from '../utils/productCloudinary';

interface PremiumProductCardProps {
    product: Product;
    index: number;
}

export const PremiumProductCard: React.FC<PremiumProductCardProps> = ({ product, index }) => {
    const { formatPrice } = useCurrency();
    const { addItem } = useCart();
    const [isHovered, setIsHovered] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);

    const { contextSafe } = useGSAP({ scope: cardRef });

    // Get primary image
    const primaryImage = product.sortedImages?.[0] || product.image || product.images?.[0] || '/demo2.webp';
    const imageUrl = primaryImage.startsWith('http') || primaryImage.startsWith('/')
        ? primaryImage
        : getProductCloudinaryUrl(primaryImage);

    // Calculate discount
    const hasDiscount = product.discount?.enabled &&
        product.discount.percentage > 0 &&
        (!product.discount.startDate || new Date(product.discount.startDate) <= new Date()) &&
        (!product.discount.endDate || new Date(product.discount.endDate) >= new Date());

    const discountPercentage = hasDiscount ? product.discount!.percentage : 0;
    const originalPrice = product.priceINR || 0;
    const finalPrice = hasDiscount
        ? originalPrice - (originalPrice * discountPercentage / 100)
        : originalPrice;

    // Hover animations
    const handleMouseEnter = contextSafe(() => {
        setIsHovered(true);

        // Image zoom
        gsap.to(imageRef.current, {
            scale: 1.1,
            duration: 0.6,
            ease: 'power2.out'
        });

        // Overlay fade in
        gsap.to(overlayRef.current, {
            opacity: 1,
            duration: 0.4,
            ease: 'power2.out'
        });
    });

    const handleMouseLeave = contextSafe(() => {
        setIsHovered(false);

        // Image zoom out
        gsap.to(imageRef.current, {
            scale: 1,
            duration: 0.6,
            ease: 'power2.out'
        });

        // Overlay fade out
        gsap.to(overlayRef.current, {
            opacity: 0,
            duration: 0.4,
            ease: 'power2.out'
        });
    });

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        addItem({
            id: product.productId || product._id,
            name: product.name,
            priceINR: finalPrice,
            image: imageUrl,
            category: product.category,
            subcategory: product.subcategory || '',
            discount: hasDiscount ? product.discount : undefined
        });
    };

    return (
        <div
            ref={cardRef}
            className="group relative bg-white overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{
                animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
            }}
        >
            {/* Discount Badge - Top Right Corner Ribbon */}
            {hasDiscount && (
                <div className="absolute top-0 right-0 z-20 overflow-hidden w-24 h-24 pointer-events-none">
                    <div className="absolute top-3 right-[-32px] w-32 bg-gradient-to-r from-red-600 to-red-500 text-white text-center py-1.5 rotate-45 shadow-lg">
                        <span className="text-xs font-bold tracking-wide flex items-center justify-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            -{discountPercentage}%
                        </span>
                    </div>
                </div>
            )}

            {/* Image Container */}
            <Link
                to={`/products/${product.productId || product._id}`}
                className="relative block overflow-hidden bg-gradient-to-br from-stone-100 to-stone-50"
                style={{ aspectRatio: '3/4' }}
            >
                {/* Main Image */}
                <img
                    ref={imageRef}
                    src={imageUrl}
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                />

                {/* Hover Overlay with Actions */}
                <div
                    ref={overlayRef}
                    className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end justify-center pb-8 opacity-0"
                >
                    <div className="flex gap-3">
                        <button
                            onClick={handleAddToCart}
                            className="flex items-center gap-2 px-6 py-3 bg-white text-black font-semibold rounded-full hover:bg-amber-500 hover:text-white transition-all duration-300 transform hover:scale-105 shadow-lg"
                        >
                            <ShoppingBag className="w-4 h-4" />
                            Add to Cart
                        </button>
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                window.location.href = `/products/${product.productId || product._id}`;
                            }}
                            className="flex items-center gap-2 px-6 py-3 bg-black/50 backdrop-blur-sm text-white font-semibold rounded-full hover:bg-black transition-all duration-300 transform hover:scale-105 shadow-lg border border-white/20"
                        >
                            <Eye className="w-4 h-4" />
                            View
                        </button>
                    </div>
                </div>

                {/* Decorative Corner */}
                <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-amber-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-amber-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </Link>

            {/* Product Info */}
            <div className="p-6 bg-white">
                {/* Category Badge */}
                <div className="mb-3">
                    <span className="inline-block px-3 py-1 bg-stone-100 text-stone-600 text-xs font-semibold tracking-wider uppercase rounded-full">
                        {product.category}
                    </span>
                </div>

                {/* Product Name */}
                <div>
                    <h3 className="font-serif text-xl text-stone-900 mb-3 line-clamp-2 group-hover:text-amber-600 transition-colors duration-300 cursor-pointer"
                        onClick={() => window.location.href = `/products/${product.productId || product._id}`}>
                        {product.name}
                    </h3>
                </div>

                {/* Rating */}
                {product.totalReviews && product.totalReviews > 0 ? (
                    <div className="flex items-center gap-2 mb-4">
                        <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <svg
                                    key={star}
                                    className={`w-4 h-4 ${star <= Math.round(product.averageRating || 0)
                                        ? 'fill-amber-500 text-amber-500'
                                        : 'fill-stone-200 text-stone-200'
                                        }`}
                                    viewBox="0 0 20 20"
                                >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            ))}
                        </div>
                        <span className="text-sm font-medium text-stone-700">
                            {(product.averageRating || 0).toFixed(1)}
                        </span>
                        <span className="text-sm text-stone-600">
                            ({product.totalReviews})
                        </span>
                    </div>
                ) : (
                    <div className="h-6 mb-4" />
                )}

                {/* Price */}
                <div className="flex items-baseline gap-3 pt-4 border-t border-stone-100">
                    {hasDiscount ? (
                        <>
                            <span className="text-2xl font-bold text-amber-600">
                                {formatPrice(finalPrice)}
                            </span>
                            <span className="text-sm text-stone-400 line-through">
                                {formatPrice(originalPrice)}
                            </span>
                        </>
                    ) : (
                        <span className="text-2xl font-bold text-stone-900">
                            {formatPrice(finalPrice)}
                        </span>
                    )}
                </div>

                {/* Savings Display */}
                {hasDiscount && (
                    <div className="mt-2 text-sm text-green-600 font-semibold">
                        Save {formatPrice(originalPrice - finalPrice)}
                    </div>
                )}
            </div>

            {/* Premium Shine Effect */}
            <div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none"
                style={{ transform: 'skewX(-20deg)' }}
            />
        </div>
    );
};

// Add keyframes for fade-in animation
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
document.head.appendChild(style);
