/**
 * Currency Utility Functions
 * Centralized price handling and conversion utilities
 */

/**
 * Extract numeric price from a string or number
 * Handles various currency symbols and formats
 */
export const extractPriceInINR = (priceString: string | number): number => {
    if (typeof priceString === 'number') return priceString;

    // Remove all currency symbols and non-numeric characters except dots
    const cleaned = priceString.replace(/[₹$€£¥₩د.إ﷼฿₺₱₫RM,\s]/g, '').trim();
    const price = parseFloat(cleaned);

    return isNaN(price) ? 0 : price;
};

/**
 * Format price with proper currency symbol and locale
 */
export const formatPriceWithCurrency = (
    amountINR: number,
    currency: string,
    exchangeRates: Record<string, number>,
    currencySymbols: Record<string, string>
): string => {
    const rate = exchangeRates[currency] || 1;
    const converted = Math.round(amountINR * rate * 100) / 100;
    const symbol = currencySymbols[currency] || currency;

    const formatted = converted.toLocaleString('en-US', {
        minimumFractionDigits: currency === 'JPY' ? 0 : 2,
        maximumFractionDigits: currency === 'JPY' ? 0 : 2,
    });

    return `${symbol}${formatted}`;
};

/**
 * Convert amount from INR to target currency
 */
export const convertCurrency = (
    amountINR: number,
    targetCurrency: string,
    exchangeRates: Record<string, number>
): number => {
    const rate = exchangeRates[targetCurrency] || 1;
    return Math.round(amountINR * rate * 100) / 100;
};

/**
 * Validate if currency is supported
 */
export const SUPPORTED_CURRENCIES = [
    'USD', 'INR', 'EUR', 'GBP', 'AED', 'SAR',
    'AUD', 'CAD', 'SGD', 'JPY'
] as const;

export type SupportedCurrency = typeof SUPPORTED_CURRENCIES[number];

export const isSupportedCurrency = (currency: string): currency is SupportedCurrency => {
    return SUPPORTED_CURRENCIES.includes(currency as SupportedCurrency);
};

/**
 * Get PayPal supported currencies
 * PayPal has specific currency support
 */
export const PAYPAL_SUPPORTED_CURRENCIES = [
    'USD', 'EUR', 'GBP', 'AUD', 'CAD', 'JPY', 'SGD'
] as const;

export const isPayPalSupported = (currency: string): boolean => {
    return PAYPAL_SUPPORTED_CURRENCIES.includes(currency as any);
};

/**
 * Get fallback currency for PayPal if user's currency is not supported
 */
export const getPayPalCurrency = (userCurrency: string): string => {
    if (isPayPalSupported(userCurrency)) {
        return userCurrency;
    }
    // Default to USD for unsupported currencies
    return 'USD';
};
