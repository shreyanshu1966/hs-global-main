import React, { useRef } from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export const CartIcon: React.FC = () => {
  const { state, toggleCart, getTotalItems } = useCart();
  const totalItems = getTotalItems();
  const iconRef = useRef<HTMLButtonElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);

  const { contextSafe } = useGSAP({ scope: iconRef });

  useGSAP(() => {
    if (totalItems > 0 && badgeRef.current) {
      gsap.fromTo(badgeRef.current,
        { scale: 0 },
        { scale: 1, duration: 0.3, ease: "back.out(1.7)" }
      );
    }
  }, [totalItems]);

  const handleMouseEnter = contextSafe(() => {
    gsap.to(iconRef.current, { scale: 1.05, duration: 0.2 });
  });

  const handleMouseLeave = contextSafe(() => {
    gsap.to(iconRef.current, { scale: 1, duration: 0.2 });
  });

  const handleMouseDown = contextSafe(() => {
    gsap.to(iconRef.current, { scale: 0.95, duration: 0.1 });
  });

  const handleMouseUp = contextSafe(() => {
    gsap.to(iconRef.current, { scale: 1.05, duration: 0.1 });
  });

  return (
    <button
      ref={iconRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onClick={toggleCart}
      className="relative p-2 text-gray-700 hover:text-amber-600 transition-colors"
      aria-label={`Shopping cart with ${totalItems} items`}
    >
      <ShoppingCart className="w-6 h-6" />
      {totalItems > 0 && (
        <div
          ref={badgeRef}
          className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg transform scale-0"
        >
          {totalItems > 99 ? '99+' : totalItems}
        </div>
      )}
    </button>
  );
};
