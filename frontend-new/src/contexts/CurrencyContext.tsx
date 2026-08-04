'use client';
// CurrencyContext — provides exchange rates and helpers.
// Currency is ALWAYS derived from region (useRegion). No independent currency state.
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRegion, REGION_CURRENCIES } from './RegionContext';
import { CURRENCY_SYMBOLS, DEFAULT_RATES, formatCurrencyAmount } from '../utils/pricing';

interface ExchangeRates {
  [currencyCode: string]: number;
}

interface CurrencyContextType {
  currency: string;
  exchangeRates: ExchangeRates;
  loading: boolean;
  formatPrice: (amountINR: number) => string;
  convertFromINR: (amountINR: number) => number;
  getCurrencySymbol: () => string;
  getPaymentCurrency: () => { currency: string; rate: number };
}

export { CURRENCY_SYMBOLS, DEFAULT_RATES };
export const SUPPORTED_CURRENCIES = ['USD', 'INR', 'GBP', 'EUR', 'AED'];

const API_URL = `${process.env.NEXT_PUBLIC_API_URL || '/api'}/currency/rates`;
const RATES_CACHE_KEY = 'currencyRatesCache';

// Seed from the last successfully fetched rates (if any) instead of the
// hardcoded DEFAULT_RATES, which can drift far from reality over time and
// causes prices to render differently depending on whether the live fetch
// has resolved yet on a given page load.
const getInitialRates = (): ExchangeRates => {
  if (typeof window === 'undefined') return DEFAULT_RATES;
  try {
    const cached = window.localStorage.getItem(RATES_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && typeof parsed === 'object') return parsed;
    }
  } catch {
    // ignore malformed cache
  }
  return DEFAULT_RATES;
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { region } = useRegion();
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>(getInitialRates);
  const [loading, setLoading] = useState(true);

  // Currency is purely derived from region — no manual selection
  const currency = REGION_CURRENCIES[region] || 'USD';

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const response = await fetch(API_URL);
        const data = await response.json();
        if (data.ok && data.rates) {
          setExchangeRates(data.rates);
          try {
            window.localStorage.setItem(RATES_CACHE_KEY, JSON.stringify(data.rates));
          } catch {
            // ignore storage quota/availability errors
          }
        }
      } catch {
        // keep cached/default rates on failure
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
    const interval = setInterval(fetchRates, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Converts a canonical INR amount to the region's display currency. For the
  // India region (currency === 'INR') this is the identity — no rate involved.
  const convertFromINR = useCallback((amountINR: number): number => {
    if (!amountINR || amountINR <= 0) return 0;
    if (currency === 'INR') return Math.round(amountINR * 100) / 100;
    const inrRate = exchangeRates.INR || DEFAULT_RATES.INR;
    const targetRate = exchangeRates[currency] || 1;
    return Math.round((amountINR / inrRate) * targetRate * 100) / 100;
  }, [currency, exchangeRates]);

  const formatPrice = useCallback((amountINR: number): string => {
    const converted = convertFromINR(amountINR);
    return formatCurrencyAmount(converted, currency);
  }, [currency, convertFromINR]);

  const getCurrencySymbol = useCallback((): string => {
    return CURRENCY_SYMBOLS[currency] || '$';
  }, [currency]);

  // PayPal always charges in USD
  const getPaymentCurrency = useCallback(() => ({ currency: 'USD', rate: 1 }), []);

  return (
    <CurrencyContext.Provider value={{
      currency,
      exchangeRates,
      loading,
      formatPrice,
      convertFromINR,
      getCurrencySymbol,
      getPaymentCurrency,
    }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error('useCurrency must be used within CurrencyProvider');
  return context;
};
