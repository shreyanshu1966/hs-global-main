import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';

export interface CartItem {
  id: string;
  name: string;
  image: string;
  priceINR: number; // Always store in INR (base currency)
  quantity: number;
  category: string;
  subcategory: string;
  customization?: {
    finish: string;
    thickness: string;
    requirement: number;
    pricePerSqFt: number;
  };
}

interface CartState {
  items: CartItem[];
  isPhoneVerified: boolean;
  phoneNumber: string;
  isCartOpen: boolean;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'quantity'> }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: { id: string } }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_PHONE_VERIFIED'; payload: { phoneNumber: string } }
  | { type: 'TOGGLE_CART' }
  | { type: 'CLOSE_CART' }
  | { type: 'RESTORE_CART'; payload: { items: CartItem[] } };

const initialState: CartState = {
  items: [],
  isPhoneVerified: false,
  phoneNumber: '',
  isCartOpen: false,
};

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: 1 }],
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
    case 'RESTORE_CART':
      return {
        ...state,
        items: action.payload.items,
      };
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
  getTotalItems: () => number;
  getTotalPrice: () => string;
  getTotalPriceNumeric: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('hs-global-cart');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.isPhoneVerified && parsed.phoneNumber) {
          dispatch({ type: 'SET_PHONE_VERIFIED', payload: { phoneNumber: parsed.phoneNumber } });
        }
        // Restore items if they exist
        if (parsed.items && Array.isArray(parsed.items) && parsed.items.length > 0) {
          dispatch({ type: 'RESTORE_CART', payload: { items: parsed.items } });
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
    }));
  }, [state.isPhoneVerified, state.phoneNumber, state.items]);

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

  const getTotalItems = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPriceNumeric = (): number => {
    return state.items.reduce((sum, item) => {
      return sum + (item.priceINR * item.quantity);
    }, 0);
  };

  const getTotalPrice = (): string => {
    const total = getTotalPriceNumeric();
    return `₹${total.toLocaleString('en-IN')}`;
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
    getTotalItems,
    getTotalPrice,
    getTotalPriceNumeric,
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