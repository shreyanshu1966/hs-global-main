// ============================================================
// CENTRALIZED PRICING ENGINE — single source of truth
// All price calculations across the app flow through here.
// Flow: base USD → regional adjustment → discount → display currency
// ============================================================

export const REGION_CURRENCIES: Record<string, string> = {
  UAE: 'USD',
  Europe: 'GBP',
  India: 'INR',
  USA: 'USD',
  UK: 'GBP',
  default: 'USD',
};

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  INR: '₹',
  GBP: '£',
};

export const DEFAULT_RATES: Record<string, number> = {
  USD: 1,
  INR: 83.5,
  GBP: 0.79,
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
  baseUSD: number;               // Raw product.priceUSD
  regionalUSD: number;           // After regional adjustment, before discount
  finalUSD: number;              // After regional + discount
  displayAmount: number;         // finalUSD converted to display currency
  originalDisplayAmount: number; // regionalUSD converted (strikethrough when discounted)
  formattedPrice: string;        // e.g. "₹8,350.00"
  originalFormattedPrice: string;// e.g. "₹10,000.00" (for strikethrough)
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

export function getRegionalBaseUSD(
  priceUSD: number,
  region: string,
  regionalPricing?: Record<string, RegionalPricingEntry> | null,
): number {
  if (!regionalPricing || region === 'default') return priceUSD;
  const rp = regionalPricing[region];
  if (!rp?.enabled || !rp.adjustmentValue) return priceUSD;
  const adjusted = rp.adjustmentType === 'percentage'
    ? priceUSD * (1 + rp.adjustmentValue / 100)
    : priceUSD + rp.adjustmentValue;
  return Math.max(0, Math.round(adjusted * 100) / 100);
}

export function formatCurrencyAmount(amount: number, currencyCode: string): string {
  const symbol = CURRENCY_SYMBOLS[currencyCode] || '$';
  return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function computePrice(
  product: {
    priceUSD?: number;
    regionalPricing?: Record<string, RegionalPricingEntry> | null;
    discount?: DiscountEntry | null;
  } | null | undefined,
  region: string,
  exchangeRates: Record<string, number>,
): PriceResult {
  const currencyCode = REGION_CURRENCIES[region] || 'USD';
  const symbol = CURRENCY_SYMBOLS[currencyCode] || '$';
  const rate = exchangeRates[currencyCode] || 1;

  if (!product?.priceUSD) {
    return {
      baseUSD: 0, regionalUSD: 0, finalUSD: 0,
      displayAmount: 0, originalDisplayAmount: 0,
      formattedPrice: 'Price on Request',
      originalFormattedPrice: 'Price on Request',
      currencyCode, symbol,
      hasDiscount: false, discountPercentage: 0,
    };
  }

  const baseUSD = product.priceUSD;
  const regionalUSD = getRegionalBaseUSD(baseUSD, region, product.regionalPricing);
  const hasDiscount = isDiscountActive(product.discount);
  const discountPercentage = hasDiscount ? (product.discount!.percentage || 0) : 0;
  const finalUSD = hasDiscount
    ? Math.max(0, Math.round(regionalUSD * (1 - discountPercentage / 100) * 100) / 100)
    : regionalUSD;

  const displayAmount = Math.round(finalUSD * rate * 100) / 100;
  const originalDisplayAmount = Math.round(regionalUSD * rate * 100) / 100;

  return {
    baseUSD, regionalUSD, finalUSD,
    displayAmount, originalDisplayAmount,
    formattedPrice: formatCurrencyAmount(displayAmount, currencyCode),
    originalFormattedPrice: formatCurrencyAmount(originalDisplayAmount, currencyCode),
    currencyCode, symbol,
    hasDiscount, discountPercentage,
  };
}

// Convert any USD amount to display currency for a given region
export function formatUSDInRegion(
  amountUSD: number,
  region: string,
  exchangeRates: Record<string, number>,
): string {
  const currencyCode = REGION_CURRENCIES[region] || 'USD';
  const rate = exchangeRates[currencyCode] || 1;
  const displayAmount = Math.round(amountUSD * rate * 100) / 100;
  return formatCurrencyAmount(displayAmount, currencyCode);
}

export function getCurrencySymbolForRegion(region: string): string {
  const currencyCode = REGION_CURRENCIES[region] || 'USD';
  return CURRENCY_SYMBOLS[currencyCode] || '$';
}

// Admin-only: always display a USD amount as INR for Indian admin reference.
// Uses live rates if provided, otherwise falls back to DEFAULT_RATES.
export function formatAdminINR(priceUSD: number, rates?: Record<string, number>): string {
  const inrRate = (rates && rates.INR) || DEFAULT_RATES.INR;
  const inrAmount = Math.round(priceUSD * inrRate);
  return `₹${inrAmount.toLocaleString('en-IN')}`;
}
