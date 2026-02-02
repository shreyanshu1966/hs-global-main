import React from 'react';
import { Plus, Minus } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

// Accept either a full product (legacy) or just an ID
interface QuantityHandlerProps {
  product?: { id: string };
  productId?: string;
  className?: string;
  disabled?: boolean;
}

export const QuantityHandler: React.FC<QuantityHandlerProps> = ({ 
  product, 
  productId,
  className = '',
  disabled = false
}) => {
  const { state, updateQuantity, removeItem } = useCart();

  const id = productId || product?.id;

  if (!id) {
     return null;
  }

  const cartItem = state.items.find(item => item.id === id);
  const quantity = cartItem?.quantity || 0;

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(id);
    } else {
      updateQuantity(id, newQuantity);
    }
  };

  if (quantity === 0) {
    return null; // Don't render if not in cart
  }

  return (
    <div className={`flex items-center justify-between border-2 border-black bg-white text-black ${className} ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <button
        onClick={() => handleQuantityChange(quantity - 1)}
        disabled={disabled}
        className="p-2 hover:bg-black hover:text-white transition-all duration-200 flex items-center justify-center group"
        aria-label="Decrease quantity"
      >
        <Minus className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
      </button>

      <div className="px-3 py-2 bg-white text-black font-bold text-xs md:text-sm min-w-[40px] text-center">
        {quantity}
      </div>

      <button
        onClick={() => handleQuantityChange(quantity + 1)}
        disabled={disabled}
        className="p-2 hover:bg-black hover:text-white transition-all duration-200 flex items-center justify-center group"
        aria-label="Increase quantity"
      >
        <Plus className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
      </button>
    </div>
  );
};
