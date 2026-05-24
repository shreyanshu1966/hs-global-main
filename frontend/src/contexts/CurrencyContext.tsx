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
  formatPrice: (amountUSD: number) => string;
  convertFromUSD: (amountUSD: number) => number;
  getCurrencySymbol: () => string;
  getPaymentCurrency: () => { currency: string; rate: number };
}

export { CURRENCY_SYMBOLS, DEFAULT_RATES };
export const SUPPORTED_CURRENCIES = ['USD', 'INR', 'GBP'];

const API_URL = `${import.meta.env.VITE_API_URL || '/api'}/currency/rates`;

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { region } = useRegion();
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>(DEFAULT_RATES);
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
        }
      } catch {
        // keep default rates on failure
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
    const interval = setInterval(fetchRates, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const convertFromUSD = useCallback((amountUSD: number): number => {
    if (!amountUSD || amountUSD <= 0) return 0;
    const rate = exchangeRates[currency] || 1;
    return Math.round(amountUSD * rate * 100) / 100;
  }, [currency, exchangeRates]);

  const formatPrice = useCallback((amountUSD: number): string => {
    const converted = convertFromUSD(amountUSD);
    return formatCurrencyAmount(converted, currency);
  }, [currency, convertFromUSD]);

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
      convertFromUSD,
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
