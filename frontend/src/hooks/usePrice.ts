import { useRegion } from '../contexts/RegionContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { computePrice, formatUSDInRegion, type PriceResult } from '../utils/pricing';

const DEV = import.meta.env.DEV;

export function usePrice(product: any): PriceResult {
  const { region } = useRegion();
  const { exchangeRates } = useCurrency();
  const result = computePrice(product, region, exchangeRates);
  if (DEV && product?.productId) {
    console.log(
      `[usePrice] ${product.productId} | region=${region} | priceUSD=${product.priceUSD} | regionalPricing=${JSON.stringify(product.regionalPricing)} | result=${result.formattedPrice}`
    );
  }
  return result;
}

// Returns a function that formats any USD amount in the user's regional display currency
export function useFormatPrice(): (amountUSD: number) => string {
  const { region } = useRegion();
  const { exchangeRates } = useCurrency();
  return (amountUSD: number) => formatUSDInRegion(amountUSD, region, exchangeRates);
}
