'use client';
import { useRegion } from '../contexts/RegionContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { computePrice, formatINRInRegion, type PriceResult } from '../utils/pricing';

const DEV = (process.env.NODE_ENV !== 'production');

export function usePrice(product: any): PriceResult {
  const { region } = useRegion();
  const { exchangeRates } = useCurrency();
  const result = computePrice(product, region, exchangeRates);
  if (DEV && product?.productId) {
    console.log(
      `[usePrice] ${product.productId} | region=${region} | priceINR=${product.priceINR} | regionalPricing=${JSON.stringify(product.regionalPricing)} | result=${result.formattedPrice}`
    );
  }
  return result;
}

// Returns a function that formats any canonical INR amount in the user's regional display currency
export function useFormatPrice(): (amountINR: number) => string {
  const { region } = useRegion();
  const { exchangeRates } = useCurrency();
  return (amountINR: number) => formatINRInRegion(amountINR, region, exchangeRates);
}
