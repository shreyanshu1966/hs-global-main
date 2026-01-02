import React, { useEffect, useMemo, useState, useRef } from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, MessageCircle } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { useLocalization } from '../contexts/LocalizationContext';
import { useAuth } from '../contexts/AuthContext';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export const CartDrawer: React.FC = () => {
  const { formatPrice, getCurrencySymbol, convertPrice, convertINRtoUSD } = useLocalization();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { state, updateQuantity, removeItem, closeCart } = useCart();

  const [isRendered, setIsRendered] = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Handle drawer visibility state
  useEffect(() => {
    if (state.isCartOpen) setIsRendered(true);
  }, [state.isCartOpen]);

  useGSAP(() => {
    if (state.isCartOpen && isRendered && backdropRef.current && drawerRef.current) {
      gsap.to(backdropRef.current, { opacity: 1, duration: 0.3 });
      gsap.to(drawerRef.current, { x: 0, duration: 0.4, ease: "power3.out" });
    } else if (!state.isCartOpen && isRendered && backdropRef.current && drawerRef.current) {
      gsap.to(backdropRef.current, { opacity: 0, duration: 0.3 });
      gsap.to(drawerRef.current, { x: '100%', duration: 0.4, ease: "power3.in", onComplete: () => setIsRendered(false) });
    }
  }, [state.isCartOpen, isRendered]);

  // Helper to extract numeric price from price string (always in INR)
  const extractPriceInINR = (priceString: string): number => {
    // Remove all non-numeric characters except decimal point
    const cleaned = priceString.replace(/[^0-9.]/g, '');
    const price = parseFloat(cleaned);
    return isNaN(price) ? 0 : price;
  };

  // 1. Calculate Subtotal in INR (Base)
  const subtotalINR = useMemo(() => {
    return state.items.reduce((sum, item) => {
      const priceInINR = extractPriceInINR(item.price);
      return sum + priceInINR * item.quantity;
    }, 0);
  }, [state.items]);

  // 2. Convert to USD (Intermediate)
  const subtotalUSD = useMemo(() => convertINRtoUSD(subtotalINR), [subtotalINR, convertINRtoUSD]);

  // 3. Convert to User's Currency
  const subtotal = useMemo(() => convertPrice(subtotalUSD), [subtotalUSD, convertPrice]);

  // 4. Total
  const totalAmount = useMemo(() => subtotal, [subtotal]);

  const handleClose = () => {
    closeCart();
  };

  const WhatsAppSupportButton = () => {
    const getSupportMessage = () => {
      const itemsList = state.items.map(item => `${item.name} (Qty: ${item.quantity})`).join(', ');
      return `Hi! I'm interested in these products in my cart: ${itemsList}. Can you help me with more details?`;
    };

    return (
      <a
        href={`https://wa.me/918107115116?text=${encodeURIComponent(getSupportMessage())}`}
        target="_blank"
        rel="noreferrer"
        className="flex items-center justify-center gap-2 py-3 px-4 bg-black text-white font-medium rounded-lg hover:bg-white hover:text-black transition-all duration-300 border-2 border-black hover:border-white"
        aria-label="WhatsApp Inquiry"
        title="Inquire about cart items via WhatsApp"
      >
        <MessageCircle className="w-4 h-4" />
        WhatsApp
      </a>
    );
  };

  // Group cart items by category
  const groupedItems = useMemo(() => {
    const groups: { [key: string]: typeof state.items } = {};
    state.items.forEach(item => {
      const category = item.category || 'Other';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(item);
    });
    return groups;
  }, [state.items]);

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(id);
    } else {
      updateQuantity(id, newQuantity);
    }
  };

  return (
    <>
      {isRendered && (
        <>
          {/* Backdrop */}
          <div
            ref={backdropRef}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={handleClose}
            style={{ opacity: 0 }}
          />

          {/* Drawer */}
          <div
            ref={drawerRef}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white/70 backdrop-blur-xl text-black shadow-2xl z-50 flex flex-col border-l border-black/10"
            style={{ transform: 'translateX(100%)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-black/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-black rounded-full">
                  <ShoppingBag className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-black">Shopping Cart</h2>
                  <p className="text-sm text-gray-700">
                    {state.items.length} {state.items.length === 1 ? 'item' : 'items'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-black/10 rounded-full transition-colors border border-black/10"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {state.isPhoneVerified && state.phoneNumber && (
              <div className="px-6 py-2 text-sm text-gray-700 border-b border-black/10">
                Verified number: <span className="font-semibold">{state.phoneNumber}</span>
              </div>
            )}

            {/* Body */}
            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
              {state.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mb-4 border border-black/10">
                    <ShoppingBag className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-medium text-black mb-2">Your cart is empty</h3>
                  <p className="text-gray-700 mb-6">Add some products to get started</p>
                  <button
                    onClick={handleClose}
                    className="px-6 py-3 bg-black text-white font-semibold rounded-lg hover:bg-black/90 transition-all duration-200 border border-black/10"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(groupedItems).map(([category, items]) => (
                    <div key={category} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-black capitalize">{category}</h3>
                        <div className="flex-1 h-px bg-black/10"></div>
                        <span className="text-sm text-gray-600">
                          {items.length} item{items.length !== 1 ? 's' : ''}
                        </span>
                      </div>

                      <div className="space-y-3">
                        {items.map((item) => (
                          <div
                            key={item.id}
                            className="flex gap-4 p-4 bg-white/60 backdrop-blur-md rounded-xl border border-black/10"
                          >
                            <div
                              className="w-16 h-16 bg-white rounded-lg overflow-hidden flex-shrink-0 border border-black/10 cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => {
                                handleClose();
                                navigate(`/productsinfo/${item.id}`);
                              }}
                            >
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>

                            <div className="flex-1 min-w-0">
                              <h3
                                className="font-medium text-black truncate cursor-pointer hover:underline"
                                onClick={() => {
                                  handleClose();
                                  navigate(`/productsinfo/${item.id}`);
                                }}
                              >
                                {item.name}
                              </h3>
                              <p className="text-sm text-gray-700">{formatPrice(convertINRtoUSD(extractPriceInINR(item.price)))}</p>

                              <div className="flex items-center gap-2 mt-2">
                                <button
                                  onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                  className="w-6 h-6 bg-black text-white border border-black/10 rounded-full flex items-center justify-center hover:bg-black/90 transition-colors"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-8 text-center text-sm font-medium text-black">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                  className="w-6 h-6 bg-black text-white border border-black/10 rounded-full flex items-center justify-center hover:bg-black/90 transition-colors"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            <button
                              onClick={() => removeItem(item.id)}
                              className="p-2 text-gray-500 hover:text-red-500 transition-colors border border-black/10 rounded-full hover:border-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {state.items.length > 0 && (
              <div className="border-t border-black/10 p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-black">Total</span>
                  <span className="text-xl font-bold text-black">
                    {getCurrencySymbol()}{totalAmount.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </span>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      handleClose();
                      navigate('/checkout');
                    }}
                    className="flex-1 py-3 px-4 bg-black text-white font-semibold rounded-lg hover:bg-white hover:text-black border-2 border-black hover:border-white transition-all duration-300"
                    title={!isAuthenticated ? "Login required to checkout" : "Proceed to checkout"}
                  >
                    {!isAuthenticated ? 'Login to Checkout' : 'Proceed to Checkout'}
                  </button>
                  <WhatsAppSupportButton />
                </div>
                <button
                  onClick={handleClose}
                  className="w-full py-2 px-4 border-2 border-black text-black font-medium rounded-lg hover:bg-black hover:text-white transition-all duration-300"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
};