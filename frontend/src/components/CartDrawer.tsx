import React, { useEffect, useMemo, useRef, useState } from 'react';
import { X, Plus, Minus, Trash2, MessageCircle, Tag, Loader2 } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { useCurrency } from '../contexts/CurrencyContext';
import { useAuth } from '../contexts/AuthContext';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const CartDrawer: React.FC = () => {
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { state, updateQuantity, removeItem, closeCart, getTotalItems, getRegionalEffectivePriceUSD, getRegionalBasePriceUSD, applyCoupon, removeCoupon } = useCart();

  const [isRendered, setIsRendered] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  
  const totalItems = getTotalItems();

  useEffect(() => {
    if (state.isCartOpen) setIsRendered(true);
  }, [state.isCartOpen]);

  useGSAP(() => {
    if (state.isCartOpen && isRendered && backdropRef.current && drawerRef.current) {
      gsap.to(backdropRef.current, { opacity: 1, duration: 0.3 });
      gsap.to(drawerRef.current, { x: 0, duration: 0.36, ease: 'power3.out' });
    } else if (!state.isCartOpen && isRendered && backdropRef.current && drawerRef.current) {
      gsap.to(backdropRef.current, { opacity: 0, duration: 0.3 });
      gsap.to(drawerRef.current, {
        x: '100%',
        duration: 0.32,
        ease: 'power3.in',
        onComplete: () => setIsRendered(false),
      });
    }
  }, [state.isCartOpen, isRendered]);

  useEffect(() => {
    if (state.isCartOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      const originalPaddingRight = window.getComputedStyle(document.body).paddingRight;
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;

      return () => {
        document.body.style.overflow = originalStyle;
        document.body.style.paddingRight = originalPaddingRight;
      };
    }
  }, [state.isCartOpen]);

  const subtotalUSD = useMemo(() => {
    return state.items.reduce((sum, item) => sum + getRegionalEffectivePriceUSD(item) * item.quantity, 0);
  }, [state.items, getRegionalEffectivePriceUSD]);

  const totalAmount = useMemo(() => {
    if (state.appliedCoupon) {
      return Math.max(0, subtotalUSD - state.appliedCoupon.discountAmountUSD);
    }
    return subtotalUSD;
  }, [subtotalUSD, state.appliedCoupon]);

  const handleClose = () => closeCart();

  const WhatsAppSupportButton = () => {
    const getSupportMessage = () => {
      const itemsList = state.items.map((item) => `${item.name} (Qty: ${item.quantity})`).join(', ');
      return `Hi! I'm interested in these products in my cart: ${itemsList}. Can you help me with more details?`;
    };

    return (
      <a
        href={`https://wa.me/918107115116?text=${encodeURIComponent(getSupportMessage())}`}
        target="_blank"
        rel="noreferrer"
        className="cart-action-secondary w-full h-[44px] gap-2 transition-colors duration-300 flex items-center justify-center"
        aria-label="WhatsApp Inquiry"
        title="Inquire about cart items via WhatsApp"
      >
        <MessageCircle className="w-4 h-4 flex-shrink-0" />
        <span>WhatsApp</span>
      </a>
    );
  };

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(id);
    } else {
      updateQuantity(id, newQuantity);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError(null);
    try {
      const res = await fetch(`${API_URL}/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponInput.trim(), cartTotalUSD: subtotalUSD })
      });
      const data = await res.json();
      if (!data.ok) {
        setCouponError(data.message || 'Invalid coupon');
      } else {
        applyCoupon({
          code: data.code,
          discountType: data.discountType,
          discountValue: data.discountValue,
          discountAmountUSD: data.discountAmountUSD
        });
        setCouponInput('');
      }
    } catch {
      setCouponError('Failed to validate coupon. Please try again.');
    } finally {
      setCouponLoading(false);
    }
  };

  return (
    <>
      {isRendered && (
        <>
          <div
            ref={backdropRef}
            className="fixed inset-0 bg-black/55 backdrop-blur-[2px] z-40"
            onClick={handleClose}
            style={{ opacity: 0 }}
          />

          <div
            ref={drawerRef}
            className="fixed right-0 top-0 h-full w-full max-w-[30rem] bg-white text-[#111111] shadow-[0_20px_60px_rgba(0,0,0,0.28)] z-50 flex flex-col border-l border-[#e5e7eb]"
            style={{ transform: 'translateX(100%)' }}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e7eb] bg-white">
              <div className="flex items-center gap-3">
                <h2 className="cart-panel-title">Cart</h2>
                <span className="cart-panel-count">
                  {totalItems} {totalItems === 1 ? 'item' : 'items'}
                </span>
              </div>
              <button
                onClick={handleClose}
                className="p-2.5 hover:bg-[#f3f4f6] transition-colors border border-[#e5e7eb]"
                aria-label="Close cart"
              >
                <X className="w-4 h-4 text-[#374151]" />
              </button>
            </div>

            {state.isPhoneVerified && state.phoneNumber && (
              <div className="px-6 py-2.5 text-xs uppercase tracking-[0.08em] text-[#4b5563] border-b border-[#e5e7eb] bg-[#f9fafb]">
                Verified number: <span className="font-semibold">{state.phoneNumber}</span>
              </div>
            )}

            <div
              className="flex-1 overflow-x-hidden overflow-y-auto custom-scrollbar"
              style={{ overscrollBehavior: 'contain' }}
            >
              {state.items.length === 0 ? (
                <div className="px-6 py-10 text-center flex flex-col items-center justify-center h-full">
                  <h4 className="text-[1.35rem] leading-tight font-['Playfair_Display'] text-[#111111]">Your cart is empty</h4>
                  <p className="text-sm text-[#4b5563] mt-1">Add an item to begin checkout.</p>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={handleClose}
                    className="mt-4 h-[44px] flex items-center justify-center w-full px-5 border border-[#d1d5db] text-xs uppercase tracking-[0.08em] text-[#374151] font-semibold hover:bg-[#f9fafb] transition-colors cursor-pointer"
                  >
                    Continue Shopping
                  </div>
                </div>
              ) : (
                <div className="space-y-0">
                  {state.items.map((item) => {
                    const effectivePriceUSD = getRegionalEffectivePriceUSD(item);
                    const basePriceUSD = getRegionalBasePriceUSD(item);
                    const hasDiscount = effectivePriceUSD < basePriceUSD;

                    return (
                      <div key={item.id} className="px-6 py-4 border-b border-[#eceff1]">
                        <div className="flex flex-row gap-4 items-start w-full">
                          <div
                            onClick={() => {
                              handleClose();
                              navigate(`/product/${item.id}`);
                            }}
                            className="flex-shrink-0 w-20 h-20 bg-[#f8fafc] overflow-hidden border border-[#e5e7eb] block cursor-pointer relative"
                          >
                            <img
                              src={item.image}
                              alt={item.name}
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                          </div>

                          <div className="flex-1 min-w-0 flex flex-col w-full">
                            <div
                              onClick={() => {
                                handleClose();
                                navigate(`/product/${item.id}`);
                              }}
                              className="text-left w-full text-sm font-semibold text-gray-900 cursor-pointer hover:underline line-clamp-2"
                              title={item.name}
                            >
                              {item.name}
                            </div>

                            <div className="mt-1 flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-bold text-gray-900">{formatPrice(effectivePriceUSD)}</span>
                              {hasDiscount && (
                                <span className="text-xs text-gray-500 line-through">{formatPrice(basePriceUSD)}</span>
                              )}
                            </div>

                            <div className="mt-2.5 flex items-center justify-between w-full">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                  className="w-7 h-7 border border-[#d1d5db] text-[#111827] flex items-center justify-center hover:bg-[#f3f4f6] transition-colors"
                                  aria-label="Decrease quantity"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-8 text-center text-sm font-semibold text-[#111827]">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                  className="w-7 h-7 border border-[#d1d5db] text-[#111827] flex items-center justify-center hover:bg-[#f3f4f6] transition-colors"
                                  aria-label="Increase quantity"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                              <button
                                onClick={() => removeItem(item.id)}
                                className="w-7 h-7 text-gray-400 hover:text-red-600 transition-colors flex items-center justify-center ml-auto"
                                aria-label="Remove item"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {state.items.length > 0 && (
              <div className="px-6 py-5 border-t border-[#e5e7eb] bg-white flex flex-col gap-4">
                {/* Coupon Input */}
                {state.appliedCoupon ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 px-3 py-2 rounded">
                    <div className="flex items-center gap-2 text-green-800 text-sm">
                      <Tag className="w-4 h-4" />
                      <span className="font-semibold">{state.appliedCoupon.code}</span>
                      <span className="text-green-600">−{formatPrice(state.appliedCoupon.discountAmountUSD)}</span>
                    </div>
                    <button onClick={() => removeCoupon()} className="text-green-700 hover:text-red-600 transition-colors text-xs font-medium">Remove</button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponError(null); }}
                        onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                        placeholder="Coupon code"
                        className="flex-1 px-3 py-2 border border-[#d1d5db] text-sm outline-none focus:border-black transition-colors"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={couponLoading || !couponInput.trim()}
                        className="px-4 py-2 bg-black text-white text-xs font-semibold uppercase tracking-wide hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                      >
                        {couponLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Apply'}
                      </button>
                    </div>
                    {couponError && <p className="text-xs text-red-600">{couponError}</p>}
                  </div>
                )}

                {/* Subtotal */}
                <div className="flex items-center justify-between border border-[#e5e7eb] bg-[#f8fafc] px-4 py-3">
                  <span className="text-xs uppercase tracking-[0.1em] font-semibold text-[#374151]">
                    {state.appliedCoupon ? 'Total' : 'Subtotal'}
                  </span>
                  <span className="text-xl font-['Playfair_Display'] font-bold text-[#111111]">
                    {formatPrice(totalAmount)}
                  </span>
                </div>
                <div className="flex flex-col gap-3 w-full">
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      handleClose();
                      navigate('/checkout');
                    }}
                    className="cart-action-primary w-full transition-colors duration-300 h-[44px] cursor-pointer"
                    title={!isAuthenticated ? 'Login required to checkout' : 'Proceed to checkout'}
                  >
                    {!isAuthenticated ? 'Login to Checkout' : 'Checkout'}
                  </div>
                  <WhatsAppSupportButton />
                </div>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={handleClose}
                  className="w-full flex items-center justify-center h-[44px] px-4 border border-[#d1d5db] text-[#374151] text-[0.8rem] uppercase font-semibold tracking-[0.05em] hover:bg-[#f9fafb] transition-all duration-300 whitespace-nowrap cursor-pointer"
                >
                  Continue Shopping
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
};