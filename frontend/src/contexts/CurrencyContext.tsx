// CurrencyContext.tsx - Centralized Currency Management System
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

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
}

// ==================== CONSTANTS ====================
const CURRENCY_SYMBOLS: Record<string, string> = {
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

const DEFAULT_RATES: ExchangeRates = {
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
const API_URL = 'http://localhost:3000/api/currency/rates';

// Country code to currency mapping
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
    const [currency, setCurrencyState] = useState<string>('INR');
    const [exchangeRates, setExchangeRates] = useState<ExchangeRates>(DEFAULT_RATES);
    const [loading, setLoading] = useState(true);
    const [isAutoDetectEnabled, setIsAutoDetectEnabled] = useState(true);

    // ==================== DETECT LOCATION & SET CURRENCY ====================
    useEffect(() => {
        const initializeCurrency = async () => {
            // Check if user has manually set currency (auto-detect disabled)
            const savedCurrency = localStorage.getItem(STORAGE_KEY);
            const autoDetect = localStorage.getItem(AUTO_DETECT_KEY);

            if (autoDetect === 'false' && savedCurrency) {
                // User has manually selected a currency
                setCurrencyState(savedCurrency);
                setIsAutoDetectEnabled(false);
                console.log(`💱 [Currency] Using saved currency: ${savedCurrency}`);
                return;
            }

            // Auto-detect based on location
            try {
                console.log('🌍 [Currency] Detecting location...');
                const response = await fetch('https://ipapi.co/json/');
                const data = await response.json();

                if (data.country_code) {
                    const detectedCurrency = COUNTRY_TO_CURRENCY[data.country_code] || 'INR';
                    setCurrencyState(detectedCurrency);
                    console.log(`✅ [Currency] Auto-detected: ${data.country_name} → ${detectedCurrency}`);
                } else {
                    setCurrencyState(savedCurrency || 'INR');
                    console.log('⚠️ [Currency] Could not detect location, using default: INR');
                }
            } catch (error) {
                console.error('❌ [Currency] Location detection failed:', error);
                setCurrencyState(savedCurrency || 'INR');
            }
        };

        initializeCurrency();
    }, []);

    // ==================== FETCH EXCHANGE RATES ====================
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
        // Backend will serve cached rates if within 24 hours
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

        const rate = exchangeRates[currency] || exchangeRates.INR;
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
