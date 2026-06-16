'use client';
import React, { createContext, useContext, useMemo, useState, useEffect, ReactNode } from 'react';

export interface WishlistItem {
  id: string;
  title: string;
  image?: string;
  href?: string;
  designer?: string;
  price?: string;
}

interface WishlistContextType {
  items: WishlistItem[];
  count: number;
  isInWishlist: (id: string) => boolean;
  toggleWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (id: string) => void;
  clearWishlist: () => void;
}

const STORAGE_KEY = 'hs-global-wishlist-items';

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<WishlistItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setItems(parsed.filter((it) => it && typeof it.id === 'string'));
      }
    } catch {
      setItems([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const isInWishlist = (id: string) => items.some((item) => item.id === id);

  const toggleWishlist = (item: WishlistItem) => {
    setItems((prev) => {
      const exists = prev.some((entry) => entry.id === item.id);
      if (exists) {
        return prev.filter((entry) => entry.id !== item.id);
      }
      return [item, ...prev];
    });
  };

  const removeFromWishlist = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearWishlist = () => setItems([]);

  const value = useMemo(
    () => ({
      items,
      count: items.length,
      isInWishlist,
      toggleWishlist,
      removeFromWishlist,
      clearWishlist,
    }),
    [items]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
};
