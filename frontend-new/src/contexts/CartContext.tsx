'use client';
import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { hasActiveDiscount, getDiscountPercentage } from '../modules/product/pricing';
import { useRegion } from './RegionContext';

export interface CartItem {
  id: string;
  productId?: string;
  name: string;
  image: string;
  priceUSD: number; // Always store in USD (base currency)
  regionalPricing?: Record<string, { enabled: boolean; adjustmentType: 'percentage' | 'fixed'; adjustmentValue: number }>;
  quantity: number;
  category: string;
  subcategory: string;
  customization?: {
    finish: string;
    thickness: string;
    requirement: number;
    pricePerSqFt: number;
  };
  selectedVariant?: {
    attributes: Record<string, string>;
    sku?: string | null;
  };
  discount?: {
    enabled: boolean;
    percentage: number;
    startDate?: string | null;
    endDate?: string | null;
    description?: string;
  };
}


export interface AppliedCoupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  discountAmountUSD: number;
}

interface CartState {
  items: CartItem[];
  isPhoneVerified: boolean;
  phoneNumber: string;
  isCartOpen: boolean;
  showAddedToCart: boolean;
  lastAddedItem: CartItem | null;
  appliedCoupon: AppliedCoupon | null;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'quantity'> }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: { id: string } }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_PHONE_VERIFIED'; payload: { phoneNumber: string } }
  | { type: 'TOGGLE_CART' }
  | { type: 'CLOSE_CART' }
  | { type: 'HIDE_ADDED_TO_CART' }
  | { type: 'RESTORE_CART'; payload: { items: CartItem[] } }
  | { type: 'APPLY_COUPON'; payload: AppliedCoupon }
  | { type: 'REMOVE_COUPON' };

const initialState: CartState = {
  items: [],
  isPhoneVerified: false,
  phoneNumber: '',
  isCartOpen: false,
  showAddedToCart: false,
  lastAddedItem: null,
  appliedCoupon: null,
};

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      const newItem = { ...action.payload, quantity: 1 };

      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
          showAddedToCart: true,
          lastAddedItem: { ...existingItem, quantity: existingItem.quantity + 1 },
        };
      }
      return {
        ...state,
        items: [...state.items, newItem],
        showAddedToCart: true,
        lastAddedItem: newItem,
      };
    }
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: Math.max(0, action.payload.quantity) }
            : item
        ).filter(item => item.quantity > 0),
      };
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload.id),
      };
    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        appliedCoupon: null,
      };
    case 'SET_PHONE_VERIFIED':
      return {
        ...state,
        isPhoneVerified: true,
        phoneNumber: action.payload.phoneNumber,
      };
    case 'TOGGLE_CART':
      return {
        ...state,
        isCartOpen: !state.isCartOpen,
      };
    case 'CLOSE_CART':
      return {
        ...state,
        isCartOpen: false,
      };
    case 'HIDE_ADDED_TO_CART':
      return {
        ...state,
        showAddedToCart: false,
        lastAddedItem: null,
      };
    case 'RESTORE_CART':
      return {
        ...state,
        items: action.payload.items,
      };
    case 'APPLY_COUPON':
      return { ...state, appliedCoupon: action.payload };
    case 'REMOVE_COUPON':
      return { ...state, appliedCoupon: null };
    default:
      return state;
  }
}

interface CartContextType {
  state: CartState;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  setPhoneVerified: (phoneNumber: string) => void;
  toggleCart: () => void;
  closeCart: () => void;
  hideAddedToCart: () => void;
  getTotalItems: () => number;
  getTotalPriceNumeric: () => number;
  getRegionalBasePriceUSD: (item: CartItem) => number;
  getRegionalEffectivePriceUSD: (item: CartItem) => number;
  applyCoupon: (coupon: AppliedCoupon) => void;
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { region } = useRegion();

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('hs-global-cart');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.isPhoneVerified && parsed.phoneNumber) {
          dispatch({ type: 'SET_PHONE_VERIFIED', payload: { phoneNumber: parsed.phoneNumber } });
        }
        if (parsed.items && Array.isArray(parsed.items) && parsed.items.length > 0) {
          dispatch({ type: 'RESTORE_CART', payload: { items: parsed.items } });
        }
        if (parsed.appliedCoupon) {
          dispatch({ type: 'APPLY_COUPON', payload: parsed.appliedCoupon });
        }
      } catch (e) {
        console.warn('Failed to load cart from localStorage:', e);
      }
    }
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    localStorage.setItem('hs-global-cart', JSON.stringify({
      isPhoneVerified: state.isPhoneVerified,
      phoneNumber: state.phoneNumber,
      items: state.items,
      appliedCoupon: state.appliedCoupon,
    }));
  }, [state.isPhoneVerified, state.phoneNumber, state.items, state.appliedCoupon]);

  const addItem = (item: Omit<CartItem, 'quantity'>) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  };

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };

  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { id } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const setPhoneVerified = (phoneNumber: string) => {
    dispatch({ type: 'SET_PHONE_VERIFIED', payload: { phoneNumber } });
  };

  const toggleCart = () => {
    dispatch({ type: 'TOGGLE_CART' });
  };

  const closeCart = () => {
    dispatch({ type: 'CLOSE_CART' });
  };

  const hideAddedToCart = () => {
    dispatch({ type: 'HIDE_ADDED_TO_CART' });
  };

  const getTotalItems = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0);
  };

  // Regional price without discount (for strikethrough display)
  const getRegionalBasePriceUSD = (item: CartItem): number => {
    const base = item.priceUSD;
    const rp = item.regionalPricing?.[region];
    if (!rp?.enabled || !rp.adjustmentValue) return base;
    const adjusted = rp.adjustmentType === 'percentage'
      ? base * (1 + rp.adjustmentValue / 100)
      : base + rp.adjustmentValue;
    return Math.round(Math.max(0, adjusted) * 100) / 100;
  };

  const getRegionalEffectivePriceUSD = (item: CartItem): number => {
    // Step 1: apply regional adjustment to base price first (matches backend order)
    const base = item.priceUSD;
    const rp = item.regionalPricing?.[region];
    let regionalPrice = base;
    if (rp?.enabled && rp.adjustmentValue) {
      regionalPrice = rp.adjustmentType === 'percentage'
        ? base * (1 + rp.adjustmentValue / 100)
        : base + rp.adjustmentValue;
      regionalPrice = Math.max(0, regionalPrice);
    }
    // Step 2: apply discount on top of regional price
    if (hasActiveDiscount(item)) {
      const pct = getDiscountPercentage(item);
      regionalPrice = regionalPrice * (1 - pct / 100);
    }
    return Math.round(Math.max(0, regionalPrice) * 100) / 100;
  };

  const getTotalPriceNumeric = (): number => {
    const itemsTotal = state.items.reduce((sum, item) => {
      return sum + (getRegionalEffectivePriceUSD(item) * item.quantity);
    }, 0);
    if (state.appliedCoupon) {
      return Math.max(0, itemsTotal - state.appliedCoupon.discountAmountUSD);
    }
    return itemsTotal;
  };

  const applyCoupon = (coupon: AppliedCoupon) => {
    dispatch({ type: 'APPLY_COUPON', payload: coupon });
  };

  const removeCoupon = () => {
    dispatch({ type: 'REMOVE_COUPON' });
  };


  const value: CartContextType = {
    state,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    setPhoneVerified,
    toggleCart,
    closeCart,
    hideAddedToCart,
    getTotalItems,
    getTotalPriceNumeric,
    getRegionalBasePriceUSD,
    getRegionalEffectivePriceUSD,
    applyCoupon,
    removeCoupon,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};