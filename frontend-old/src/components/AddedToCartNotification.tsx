import React, { useEffect, useRef } from 'react';
import { Check, ShoppingCart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useCurrency } from '../contexts/CurrencyContext';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export const AddedToCartNotification: React.FC = () => {
  const { state, hideAddedToCart, getRegionalEffectivePriceUSD } = useCart();
  const { formatPrice } = useCurrency();
  const notificationRef = useRef<HTMLDivElement>(null);

  const { contextSafe } = useGSAP({ scope: notificationRef });

  // Show notification when item is added
  useGSAP(() => {
    if (state.showAddedToCart && state.lastAddedItem && notificationRef.current) {
      // Animate in
      gsap.fromTo(notificationRef.current, 
        { 
          y: -100, 
          opacity: 0, 
          scale: 0.8 
        },
        { 
          y: 0, 
          opacity: 1, 
          scale: 1, 
          duration: 0.5, 
          ease: "back.out(1.7)" 
        }
      );
    }
  }, [state.showAddedToCart, state.lastAddedItem]);

  // Auto-hide after 3 seconds
  useEffect(() => {
    if (state.showAddedToCart) {
      const timer = setTimeout(() => {
        hideAndClose();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [state.showAddedToCart]);

  const hideAndClose = contextSafe(() => {
    if (notificationRef.current) {
      gsap.to(notificationRef.current, {
        y: -100,
        opacity: 0,
        scale: 0.8,
        duration: 0.3,
        ease: "back.in(1.7)",
        onComplete: hideAddedToCart
      });
    }
  });

  if (!state.showAddedToCart || !state.lastAddedItem) {
    return null;
  }

  return (
    <div
      ref={notificationRef}
      className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[60] bg-white border border-gray-200 rounded-2xl shadow-2xl p-4 max-w-sm w-full mx-4"
      style={{ opacity: 0 }}
    >
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
          <Check className="w-6 h-6 text-green-600" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-gray-600" />
            <p className="text-sm font-semibold text-gray-900">Added to Cart</p>
          </div>
          
          <div className="flex items-center gap-3 mt-1">
            <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={state.lastAddedItem.image}
                alt={state.lastAddedItem.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-800 truncate font-medium">
                {state.lastAddedItem.name}
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <span>Qty: {state.lastAddedItem.quantity}</span>
                <span>•</span>
                <span className="font-semibold">
                  {formatPrice(getRegionalEffectivePriceUSD(state.lastAddedItem))}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <button
          onClick={hideAndClose}
          className="flex-shrink-0 w-6 h-6 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>Cart Total: {formatPrice(
            state.items.reduce((sum, item) => sum + getRegionalEffectivePriceUSD(item) * item.quantity, 0)
          )}</span>
          <span>{state.items.reduce((total, item) => total + item.quantity, 0)} items</span>
        </div>
      </div>
    </div>
  );
};