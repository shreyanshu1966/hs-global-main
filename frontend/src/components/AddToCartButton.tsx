import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Check, FileText } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useSlabCustomization } from '../contexts/SlabCustomizationContext';
import { Product } from '../services/productService'; // Updated to use Service type
import { useTrackAddToCart } from '../hooks/useProducts';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

interface AddToCartButtonProps {
  product: Product;
  variant?: 'default' | 'compact';
  className?: string;
  iconOnly?: boolean;
  preselectedCustomization?: {
    finish?: string;
    thickness?: string;
  };
}

export const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  product,
  variant = 'default',
  className = '',
  iconOnly = false,
  preselectedCustomization,
}) => {
  const { state, addItem, toggleCart } = useCart();
  const { openModal: openSlabModal, setCustomization } = useSlabCustomization();
  const trackAddToCart = useTrackAddToCart();
  const [isAdded, setIsAdded] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const { contextSafe } = useGSAP({ scope: buttonRef });

  // Helper to get the correct product ID regardless of product shape
  // ProductCard uses product.productId, ProductDetails builds a local object with product.id or product._id
  const getProductId = (): string => {
    return (product as any).productId || (product as any)._id || (product as any).id || '';
  };

  // Helper to get the product's primary image
  const getProductImage = (): string => {
    return product.image || (product.images && product.images[0]) || '/demo2.webp';
  };

  // Helper to get raw INR price as number
  const getRawINRPrice = (): number => {
    // 1. Check if priceINR is directly available (preferred)
    if (product.priceINR) {
      return product.priceINR;
    }
    return 0; // Default fallback if no price
  };

  // Listen for phone verification completion
  useEffect(() => {
    const handlePhoneVerified = (e: Event) => {
      const customEvent = e as CustomEvent;
      const verifiedProductId = customEvent.detail?.productId;
      const resolvedId = getProductId();

      if (product.category === 'furniture' && verifiedProductId === resolvedId) {
        addItem({
          id: resolvedId,
          productId: (product as any).productId || resolvedId,
          name: product.name,
          image: getProductImage(),
          priceINR: getRawINRPrice(),
          category: product.category,
          subcategory: product.subcategory,
          discount: product.discount,
        });

        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
      }
    };

    window.addEventListener('phone-verified', handlePhoneVerified);
    return () => window.removeEventListener('phone-verified', handlePhoneVerified);
  }, [product, addItem, toggleCart]);


  const handleClick = () => {
    // For slabs: Request quotation (open modal directly)
    if (product.category === 'slabs') {
      // Apply preselected customization if provided
      if (preselectedCustomization) {
        setCustomization((prev) => ({
          ...prev,
          ...(preselectedCustomization.finish && { finish: preselectedCustomization.finish }),
          ...(preselectedCustomization.thickness && { thickness: preselectedCustomization.thickness }),
        }));
      }

      // Open slab customization modal directly
      openSlabModal(product, state.phoneNumber || '');
      return;
    }

    // For furniture: Add to cart directly with raw INR price
    const resolvedId = getProductId();
    const cartItem = {
      id: resolvedId, // Resolve ID from productId, _id, or id depending on product shape
      productId: (product as any).productId || resolvedId,
      name: product.name,
      image: getProductImage(),
      priceINR: getRawINRPrice(),
      category: product.category,
      subcategory: product.subcategory,
      discount: product.discount,
    };

    addItem(cartItem);

    // Track add to cart analytics
    trackAddToCart(resolvedId);

    // Button feedback animation
    setIsAdded(true);
    if (buttonRef.current) {
      gsap.to(buttonRef.current, {
        scale: 0.95,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut"
      });
    }
    
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleMouseEnter = contextSafe(() => {
    gsap.to(buttonRef.current, { scale: 1.02, duration: 0.2 });
  });

  const handleMouseLeave = contextSafe(() => {
    gsap.to(buttonRef.current, { scale: 1, duration: 0.2 });
  });

  const handleMouseDown = contextSafe(() => {
    gsap.to(buttonRef.current, { scale: 0.98, duration: 0.1 });
  });

  const handleMouseUp = contextSafe(() => {
    gsap.to(buttonRef.current, { scale: 1.02, duration: 0.1 });
  });

  // For slabs, show "Request Quotation" button
  if (product.category === 'slabs') {
    if (variant === 'compact') {
      return (
        <button
          onClick={handleClick}
          aria-label="Request quote"
          title="Request quote"
          className={`px-3 py-2 text-xs md:text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-1 ${className}`}
        >
          <FileText className="w-3.5 h-3.5" />
          {!iconOnly && <span>Request Quote</span>}
        </button>
      );
    }

    return (
      <button
        ref={buttonRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onClick={handleClick}
        className={`px-5 py-3 font-semibold transition-all duration-300 flex items-center gap-2 ${className}`}
      >
        <FileText className="w-4 h-4" />
        Request Quotation
      </button>
    );
  }

  // For furniture, show "Add to Cart" button
  if (variant === 'compact') {
    return (
      <button
        onClick={handleClick}
        aria-label={isAdded ? 'Added to cart' : 'Add to cart'}
        title={isAdded ? 'Added to cart' : 'Add to cart'}
        className={`px-3 py-2 text-xs md:text-sm font-semibold transition-all duration-300 ${className}`}
      >
        {iconOnly ? (
          isAdded ? <Check className="w-3.5 h-3.5" /> : <ShoppingCart className="w-3.5 h-3.5" />
        ) : (
          isAdded ? (
            <div className="flex items-center gap-1">
              <Check className="w-3 h-3" />
              Added
            </div>
          ) : (
            'Add to Cart'
          )
        )}
      </button>
    );
  }

  return (
    <button
      ref={buttonRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onClick={handleClick}
      className={`px-5 py-3 font-semibold transition-all duration-300 flex items-center gap-2 ${className}`}
    >
      {isAdded ? (
        <>
          <Check className="w-4 h-4" />
          Added to Cart
        </>
      ) : (
        <>
          <ShoppingCart className="w-4 h-4" />
          Add to Cart
        </>
      )}
    </button>
  );
};