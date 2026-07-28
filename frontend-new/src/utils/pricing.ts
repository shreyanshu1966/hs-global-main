// ============================================================
// CENTRALIZED PRICING ENGINE — single source of truth
// All price calculations across the app flow through here.
// Flow: base INR (canonical) → regional adjustment → discount → display currency
// INR display never involves a rate multiplication — it IS the stored value.
// ============================================================

export const REGION_CURRENCIES: Record<string, string> = {
  UAE: 'AED',
  Europe: 'EUR',
  India: 'USD',
  USA: 'USD',
  UK: 'GBP',
  default: 'USD',
};

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  INR: '₹',
  GBP: '£',
  EUR: '€',
  AED: 'AED',
};

// Cross-rates (1 USD = X currency), used only to convert the canonical INR
// price into non-INR display currencies. INR display itself never uses these.
export const DEFAULT_RATES: Record<string, number> = {
  USD: 1,
  INR: 83.5,
  GBP: 0.79,
  EUR: 0.92,
  AED: 3.67,
};

export interface RegionalPricingEntry {
  enabled: boolean;
  adjustmentType: 'percentage' | 'fixed';
  adjustmentValue: number;
}

export interface DiscountEntry {
  enabled: boolean;
  percentage: number;
  startDate?: string | null;
  endDate?: string | null;
}

export interface PriceResult {
  baseINR: number;               // Raw product.priceINR
  regionalINR: number;           // After regional adjustment, before discount
  finalINR: number;              // After regional + discount
  displayAmount: number;         // finalINR converted to display currency
  originalDisplayAmount: number; // regionalINR converted (strikethrough when discounted)
  formattedPrice: string;        // e.g. "₹8,350"
  originalFormattedPrice: string;// e.g. "₹10,000" (for strikethrough)
  currencyCode: string;
  symbol: string;
  hasDiscount: boolean;
  discountPercentage: number;
}

export function isDiscountActive(discount?: DiscountEntry | null): boolean {
  if (!discount?.enabled || !discount.percentage) return false;
  const now = new Date();
  if (discount.startDate && now < new Date(discount.startDate)) return false;
  if (discount.endDate && now > new Date(discount.endDate)) return false;
  return true;
}

export function getRegionalBaseINR(
  priceINR: number,
  region: string,
  regionalPricing?: Record<string, RegionalPricingEntry> | null,
): number {
  if (!regionalPricing || region === 'default') return priceINR;
  const rp = regionalPricing[region];
  if (!rp?.enabled || !rp.adjustmentValue) return priceINR;
  const adjusted = rp.adjustmentType === 'percentage'
    ? priceINR * (1 + rp.adjustmentValue / 100)
    : priceINR + rp.adjustmentValue;
  return Math.max(0, Math.round(adjusted * 100) / 100);
}

export function formatCurrencyAmount(amount: number, currencyCode: string): string {
  const symbol = CURRENCY_SYMBOLS[currencyCode] || '$';
  if (currencyCode === 'INR') {
    return `${symbol}${Math.round(amount).toLocaleString('en-IN')}`;
  }
  return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Converts a canonical INR amount to any display currency using the USD-based
// cross-rate table. For INR itself this is the identity (no rate involved).
function convertINRTo(amountINR: number, currencyCode: string, exchangeRates: Record<string, number>): number {
  if (currencyCode === 'INR') return Math.round(amountINR * 100) / 100;
  const inrRate = exchangeRates.INR || DEFAULT_RATES.INR;
  const targetRate = exchangeRates[currencyCode] || 1;
  return Math.round((amountINR / inrRate) * targetRate * 100) / 100;
}

export function computePrice(
  product: {
    priceINR?: number;
    regionalPricing?: Record<string, RegionalPricingEntry> | null;
    discount?: DiscountEntry | null;
  } | null | undefined,
  region: string,
  exchangeRates: Record<string, number>,
): PriceResult {
  const currencyCode = REGION_CURRENCIES[region] || 'USD';
  const symbol = CURRENCY_SYMBOLS[currencyCode] || '$';

  if (!product?.priceINR) {
    return {
      baseINR: 0, regionalINR: 0, finalINR: 0,
      displayAmount: 0, originalDisplayAmount: 0,
      formattedPrice: 'Price on Request',
      originalFormattedPrice: 'Price on Request',
      currencyCode, symbol,
      hasDiscount: false, discountPercentage: 0,
    };
  }

  const baseINR = product.priceINR;
  const regionalINR = getRegionalBaseINR(baseINR, region, product.regionalPricing);
  const hasDiscount = isDiscountActive(product.discount);
  const discountPercentage = hasDiscount ? (product.discount!.percentage || 0) : 0;
  const finalINR = hasDiscount
    ? Math.max(0, Math.round(regionalINR * (1 - discountPercentage / 100) * 100) / 100)
    : regionalINR;

  const displayAmount = convertINRTo(finalINR, currencyCode, exchangeRates);
  const originalDisplayAmount = convertINRTo(regionalINR, currencyCode, exchangeRates);

  return {
    baseINR, regionalINR, finalINR,
    displayAmount, originalDisplayAmount,
    formattedPrice: formatCurrencyAmount(displayAmount, currencyCode),
    originalFormattedPrice: formatCurrencyAmount(originalDisplayAmount, currencyCode),
    currencyCode, symbol,
    hasDiscount, discountPercentage,
  };
}

// Convert any canonical INR amount to display currency for a given region
export function formatINRInRegion(
  amountINR: number,
  region: string,
  exchangeRates: Record<string, number>,
): string {
  const currencyCode = REGION_CURRENCIES[region] || 'USD';
  const displayAmount = convertINRTo(amountINR, currencyCode, exchangeRates);
  return formatCurrencyAmount(displayAmount, currencyCode);
}

export function getCurrencySymbolForRegion(region: string): string {
  const currencyCode = REGION_CURRENCIES[region] || 'USD';
  return CURRENCY_SYMBOLS[currencyCode] || '$';
}

// Admin-only: format a canonical INR amount for Indian admin reference.
export function formatAdminINR(priceINR: number): string {
  return `₹${Math.round(priceINR).toLocaleString('en-IN')}`;
}
