import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export const FloatingCartButton: React.FC = () => {
  const { toggleCart, getTotalItems } = useCart();
  const totalItems = getTotalItems();
  const [shouldRender, setShouldRender] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { contextSafe } = useGSAP({ scope: containerRef });

  useEffect(() => {
    if (totalItems > 0 && !shouldRender) {
      setShouldRender(true);
    }
  }, [totalItems, shouldRender]);

  useGSAP(() => {
    if (!buttonRef.current) return;

    if (totalItems > 0) {
      // Animate In if hidden, or stay visible
      gsap.to(buttonRef.current, {
        scale: 1,
        opacity: 1,
        duration: 0.3,
        ease: "back.out(1.7)"
      });

      // Animate badge bump on count change
      gsap.fromTo(".cart-badge",
        { scale: 0.5 },
        { scale: 1, duration: 0.4, ease: "elastic.out(1, 0.5)" }
      );

    } else {
      // Animate Out
      gsap.to(buttonRef.current, {
        scale: 0,
        opacity: 0,
        duration: 0.3,
        ease: "back.in(1.7)",
        onComplete: () => setShouldRender(false)
      });
    }
  }, [totalItems]);

  const handleHover = contextSafe(() => {
    gsap.to(buttonRef.current, { scale: 1.05, duration: 0.2 });
  });

  const handleHoverEnd = contextSafe(() => {
    gsap.to(buttonRef.current, { scale: 1, duration: 0.2 });
  });

  const handleTap = contextSafe(() => {
    gsap.to(buttonRef.current, { scale: 0.95, duration: 0.1 });
  });

  if (!shouldRender) return null;

  return (
    <div ref={containerRef}>
      <button
        ref={buttonRef}
        onClick={toggleCart}
        onMouseEnter={handleHover}
        onMouseLeave={handleHoverEnd}
        onMouseDown={handleTap}
        onMouseUp={handleHover}
        style={{ transform: 'scale(0)', opacity: 0 }} // Initial state
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 bg-black text-white p-3 sm:p-4 rounded-full shadow-2xl hover:bg-gray-800 transition-colors border-2 border-white"
        aria-label={`Shopping cart with ${totalItems} items`}
      >
        <div className="relative">
          <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />

          {/* Item count badge */}
          <div
            className="cart-badge absolute -top-2 -right-2 bg-white text-black text-xs font-bold rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center shadow-lg border-2 border-black"
          >
            {totalItems > 99 ? '99+' : totalItems}
          </div>

        </div>
      </button>
    </div>
  );
};