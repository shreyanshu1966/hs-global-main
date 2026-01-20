// CurrencyContext.tsx - Centralized Currency Management System
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useLocalization } from './LocalizationContext';

// ==================== TYPES ====================
interface ExchangeRates {
    [currencyCode: string]: number;
}

interface CurrencyContextType {
    currency: string;
    exchangeRates: ExchangeRates;
    loading: boolean;
    setCurrency: (code: string) => void;
    convertFromINR: (amountINR: number) => number;
    formatPrice: (amountINR: number) => string;
    getCurrencySymbol: () => string;
    getPaymentCurrency: () => { currency: string; rate: number };
}

// ==================== CONSTANTS ====================
export const CURRENCY_SYMBOLS: Record<string, string> = {
    USD: '$',
    INR: '₹',
    EUR: '€',
    GBP: '£',
    AED: 'د.إ',
    SAR: '﷼',
    AUD: 'A$',
    CAD: 'C$',
    SGD: 'S$',
    JPY: '¥',
};

// Supported Currencies for PayPal
export const PAYPAL_SUPPORTED_CURRENCIES = ['USD', 'EUR', 'GBP', 'AUD', 'CAD', 'JPY', 'SGD'];

export const DEFAULT_RATES: ExchangeRates = {
    USD: 0.012,    // 1 INR = 0.012 USD (1 USD = ~83 INR)
    INR: 1,        // Base currency
    EUR: 0.011,    // 1 INR = 0.011 EUR
    GBP: 0.0095,   // 1 INR = 0.0095 GBP
    AED: 0.044,    // 1 INR = 0.044 AED
    SAR: 0.045,    // 1 INR = 0.045 SAR
    AUD: 0.018,    // 1 INR = 0.018 AUD
    CAD: 0.016,    // 1 INR = 0.016 CAD
    SGD: 0.016,    // 1 INR = 0.016 SGD
    JPY: 1.8,      // 1 INR = 1.8 JPY
};

const STORAGE_KEY = 'hs-global-currency';
const AUTO_DETECT_KEY = 'hs-global-currency-auto-detect';
const API_URL = `${import.meta.env.VITE_API_URL || '/api'}/currency/rates`;

// Country code to currency mapping (Fallback if API doesn't provide it)
const COUNTRY_TO_CURRENCY: Record<string, string> = {
    US: 'USD', CA: 'CAD', GB: 'GBP', AU: 'AUD', NZ: 'NZD',
    IN: 'INR', PK: 'PKR', BD: 'BDT', LK: 'LKR', NP: 'NPR',
    AE: 'AED', SA: 'SAR', QA: 'QAR', KW: 'KWD', OM: 'OMR', BH: 'BHD',
    SG: 'SGD', MY: 'MYR', TH: 'THB', ID: 'IDR', PH: 'PHP', VN: 'VND',
    JP: 'JPY', KR: 'KRW', CN: 'CNY', HK: 'HKD', TW: 'TWD',
    DE: 'EUR', FR: 'EUR', IT: 'EUR', ES: 'EUR', NL: 'EUR', BE: 'EUR',
    AT: 'EUR', PT: 'EUR', IE: 'EUR', GR: 'EUR', FI: 'EUR',
    CH: 'CHF', NO: 'NOK', SE: 'SEK', DK: 'DKK', PL: 'PLN',
    BR: 'BRL', MX: 'MXN', AR: 'ARS', CL: 'CLP', CO: 'COP',
    ZA: 'ZAR', EG: 'EGP', NG: 'NGN', KE: 'KES', MA: 'MAD',
    TR: 'TRY', IL: 'ILS', RU: 'RUB', UA: 'UAH',
};

// ==================== CONTEXT ====================
const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { location, loading: locationLoading } = useLocalization();
    const [currency, setCurrencyState] = useState<string>('INR');
    const [exchangeRates, setExchangeRates] = useState<ExchangeRates>(DEFAULT_RATES);
    const [loading, setLoading] = useState(true);
    const [isAutoDetectEnabled, setIsAutoDetectEnabled] = useState(true);

    // ==================== 1. LOAD SAVED PREFERENCES ====================
    useEffect(() => {
        const savedCurrency = localStorage.getItem(STORAGE_KEY);
        const autoDetect = localStorage.getItem(AUTO_DETECT_KEY);

        if (autoDetect === 'false' && savedCurrency) {
            setCurrencyState(savedCurrency);
            setIsAutoDetectEnabled(false);
            console.log(`💱 [Currency] Using saved currency: ${savedCurrency}`);
        }
    }, []);

    // ==================== 2. LISTEN TO LOCATION CHANGES ====================
    useEffect(() => {
        if (!isAutoDetectEnabled || locationLoading || !location) return;

        console.log('🌍 [Currency] Adapting to location:', location.country);

        // Use currency from location API if available, else map country code
        let detectedCurrency = location.currency;

        if (!detectedCurrency && location.country) {
            detectedCurrency = COUNTRY_TO_CURRENCY[location.country];
        }

        if (detectedCurrency) {
            // Only auto-switch if no valid saved preference overrides it (handled by check above)
            setCurrencyState(detectedCurrency);
            console.log(`✅ [Currency] Auto-detected: ${location.countryName} → ${detectedCurrency}`);
        } else {
            console.log('⚠️ [Currency] Could not map location to currency, keeping default.');
        }

    }, [location, locationLoading, isAutoDetectEnabled]);

    // ==================== 3. FETCH EXCHANGE RATES ====================
    useEffect(() => {
        const fetchRates = async () => {
            try {
                const response = await fetch(API_URL);
                const data = await response.json();

                if (data.ok && data.rates) {
                    setExchangeRates(data.rates);
                    console.log(`✅ [Currency] Rates loaded from ${data.source}`);

                    if (data.nextUpdate) {
                        console.log(`🕐 [Currency] Next update: ${new Date(data.nextUpdate).toLocaleString()}`);
                    }
                } else {
                    console.warn('⚠️ [Currency] Using default rates');
                }
            } catch (error) {
                console.error('❌ [Currency] Failed to fetch rates:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRates();

        // Check for updates every 30 minutes
        const interval = setInterval(fetchRates, 30 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    // ==================== SET CURRENCY ====================
    const setCurrency = useCallback((code: string) => {
        setCurrencyState(code);
        localStorage.setItem(STORAGE_KEY, code);
        localStorage.setItem(AUTO_DETECT_KEY, 'false'); // Disable auto-detect on manual selection
        setIsAutoDetectEnabled(false);
        console.log(`💱 [Currency] Manually changed to ${code} (auto-detect disabled)`);
    }, []);

    // ==================== CONVERT FROM INR ====================
    const convertFromINR = useCallback((amountINR: number): number => {
        if (!amountINR || amountINR <= 0) return 0;

        const rate = exchangeRates[currency] || exchangeRates.INR || 1;
        const converted = amountINR * rate;

        // Round to 2 decimal places
        return Math.round(converted * 100) / 100;
    }, [currency, exchangeRates]);

    // ==================== FORMAT PRICE ====================
    const formatPrice = useCallback((amountINR: number): string => {
        const converted = convertFromINR(amountINR);
        const symbol = getCurrencySymbol();

        // Format with proper decimal places
        const formatted = converted.toLocaleString('en-US', {
            minimumFractionDigits: currency === 'JPY' ? 0 : 2,
            maximumFractionDigits: currency === 'JPY' ? 0 : 2,
        });

        return `${symbol}${formatted}`;
    }, [currency, convertFromINR]);

    // ==================== GET CURRENCY SYMBOL ====================
    const getCurrencySymbol = useCallback((): string => {
        return CURRENCY_SYMBOLS[currency] || currency;
    }, [currency]);

    // ==================== GET PAYMENT CURRENCY (For PayPal/Gateways) ====================
    // Returns the calculated currency and rate to use for payments
    const getPaymentCurrency = useCallback(() => {
        const isSupported = PAYPAL_SUPPORTED_CURRENCIES.includes(currency);
        const code = isSupported ? currency : 'USD';
        const rate = exchangeRates[code] || DEFAULT_RATES[code] || DEFAULT_RATES.USD;
        return { currency: code, rate };
    }, [currency, exchangeRates]);

    // ==================== PROVIDER ====================
    return (
        <CurrencyContext.Provider
            value={{
                currency,
                exchangeRates,
                loading,
                setCurrency,
                convertFromINR,
                formatPrice,
                getCurrencySymbol,
                getPaymentCurrency
            }}
        >
            {children}
        </CurrencyContext.Provider>
    );
};

// ==================== HOOK ====================
export const useCurrency = () => {
    const context = useContext(CurrencyContext);
    if (!context) {
        throw new Error('useCurrency must be used within CurrencyProvider');
    }
    return context;
};
