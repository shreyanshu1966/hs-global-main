'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MessageCircle, Minus, Plus, Trash2, Tag, Loader2 } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { CartIcon } from './CartIcon';
import { useAuth } from '../contexts/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const CartMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { state, toggleCart, updateQuantity, removeItem, getTotalItems, getRegionalEffectivePriceUSD, getRegionalBasePriceUSD, applyCoupon, removeCoupon } = useCart();
  const { formatPrice } = useCurrency();
  const { isAuthenticated } = useAuth();
  const totalItems = getTotalItems();

  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  const subtotalUSD = useMemo(() => {
    return state.items.reduce((sum, item) => sum + getRegionalEffectivePriceUSD(item) * item.quantity, 0);
  }, [state.items, getRegionalEffectivePriceUSD]);

  const totalAfterCoupon = useMemo(() => {
    if (state.appliedCoupon) return Math.max(0, subtotalUSD - state.appliedCoupon.discountAmountUSD);
    return subtotalUSD;
  }, [subtotalUSD, state.appliedCoupon]);

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

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const handleIconClick = () => {
    if (typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches) {
      setIsOpen((prev) => !prev);
      return;
    }
    toggleCart();
  };

  const handleQty = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    updateQuantity(id, quantity);
  };

  const handleWhatsApp = () => {
    const itemsList = state.items.map((item) => `${item.name} (Qty: ${item.quantity})`).join(', ');
    const message = `Hi! I'm interested in these products in my cart: ${itemsList}. Can you help me with more details?`;
    window.open('https://wa.me/918107115116?text=' + encodeURIComponent(message), '_blank', 'noreferrer');
  };

  return (
    <div className="relative" ref={menuRef}>
      <CartIcon onClick={handleIconClick} />
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-[199]"
            onClick={() => setIsOpen(false)}
          />

          <div
            className="hidden md:flex md:flex-col absolute right-0 top-full mt-3 bg-white border border-[#e5e7eb] shadow-[0_20px_48px_rgba(0,0,0,0.22)] z-[200]"
            style={{ width: '400px', maxWidth: '90vw', height: 'min(85vh, 600px)' }}
            onWheel={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex-none px-6 py-4 border-b border-[#e5e7eb]">
              <div className="flex items-center justify-between">
                <h3 className="cart-panel-title">Cart</h3>
                <span className="cart-panel-count">
                  {totalItems} {totalItems === 1 ? 'item' : 'items'}
                </span>
              </div>
            </div>

            {state.isPhoneVerified && state.phoneNumber && (
              <div className="flex-none px-6 py-2.5 text-xs uppercase tracking-[0.08em] text-[#4b5563] border-b border-[#e5e7eb] bg-[#f9fafb]">
                Verified number: <span className="font-semibold">{state.phoneNumber}</span>
              </div>
            )}

            {state.items.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <h4 className="text-[1.35rem] leading-tight font-['Playfair_Display'] text-[#111111]">
                  Your cart is empty
                </h4>
                <p className="text-sm text-[#4b5563] mt-1">Add an item to begin checkout.</p>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setIsOpen(false)}
                  className="mt-4 h-[44px] flex items-center justify-center w-full px-5 border border-[#d1d5db] text-xs uppercase tracking-[0.08em] text-[#374151] font-semibold hover:bg-[#f9fafb] transition-colors cursor-pointer"
                >
                  Continue Shopping
                </div>
              </div>
            ) : (
              <>
                {/* Scrollable items */}
                <div
                  className="flex-1 min-h-0 overflow-y-auto overscroll-contain custom-scrollbar"
                  onWheel={(e) => e.stopPropagation()}
                >
                  {state.items.map((item) => {
                    const effectivePriceUSD = getRegionalEffectivePriceUSD(item);
                    const basePriceUSD = getRegionalBasePriceUSD(item);
                    const hasDiscount = effectivePriceUSD < basePriceUSD;

                    return (
                      <div key={item.id} className="px-6 py-4 border-b border-[#eceff1]">
                        <div className="flex flex-row gap-4 items-start w-full">
                          <div
                            onClick={() => {
                              setIsOpen(false);
                              navigate(`/product/${item.id}`);
                            }}
                            className="flex-shrink-0 w-20 h-20 border border-[#e5e7eb] bg-[#f8fafc] overflow-hidden cursor-pointer relative"
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
                                setIsOpen(false);
                                navigate(`/product/${item.id}`);
                              }}
                              className="text-left w-full text-sm font-semibold text-gray-900 cursor-pointer hover:underline line-clamp-2"
                              title={item.name}
                            >
                              {item.name}
                            </div>

                            <div className="mt-1 flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-bold text-gray-900">
                                {formatPrice(effectivePriceUSD)}
                              </span>
                              {hasDiscount && (
                                <span className="text-xs text-gray-500 line-through">
                                  {formatPrice(basePriceUSD)}
                                </span>
                              )}
                            </div>

                            <div className="mt-2.5 flex items-center justify-between w-full">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleQty(item.id, item.quantity - 1)}
                                  className="w-7 h-7 border border-[#d1d5db] text-[#111827] flex items-center justify-center hover:bg-[#f3f4f6] transition-colors"
                                  aria-label="Decrease quantity"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-8 text-center text-sm font-semibold text-[#111827]">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => handleQty(item.id, item.quantity + 1)}
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

                {/* Footer */}
                <div className="flex-none px-6 py-5 border-t border-[#e5e7eb] bg-white flex flex-col gap-4">
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

                  <div className="flex items-center justify-between border border-[#e5e7eb] bg-[#f8fafc] px-4 py-3">
                    <span className="text-xs uppercase tracking-[0.1em] font-semibold text-[#374151]">
                      {state.appliedCoupon ? 'Total' : 'Subtotal'}
                    </span>
                    <span className="text-xl font-['Playfair_Display'] font-bold text-[#111111]">
                      {formatPrice(totalAfterCoupon)}
                    </span>
                  </div>

                  <div className="flex flex-col gap-3 w-full">
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        setIsOpen(false);
                        navigate('/checkout');
                      }}
                      className="cart-action-primary w-full transition-colors duration-300 h-[44px] cursor-pointer"
                      title={!isAuthenticated ? 'Login to Checkout' : 'Checkout'}
                    >
                      {!isAuthenticated ? 'Login to Checkout' : 'Checkout'}
                    </div>

                    <button
                      type="button"
                      onClick={handleWhatsApp}
                      className="cart-action-secondary w-full transition-colors duration-300 flex items-center justify-center gap-2 h-[44px] cursor-pointer"
                      aria-label="WhatsApp Inquiry"
                      title="Inquire about cart items via WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4 flex-shrink-0" />
                      <span>WhatsApp</span>
                    </button>
                  </div>

                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setIsOpen(false)}
                    className="w-full flex items-center justify-center h-[44px] px-4 border border-[#d1d5db] text-[#374151] text-[0.8rem] uppercase font-semibold tracking-[0.05em] hover:bg-[#f9fafb] transition-all duration-300 whitespace-nowrap cursor-pointer"
                  >
                    Continue Shopping
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};