import { LegacyProduct } from '../types';
import { geteffectivePriceUSD } from '../pricing/priceSelectors';

export const getProductPrimaryImage = (product: LegacyProduct): string => {
  if (product.image) {
    return product.image;
  }
  if (Array.isArray(product.images) && product.images.length > 0) {
    return product.images[0];
  }
  return '';
};

export const getProductDisplayImages = (product: LegacyProduct): string[] => {
  if (Array.isArray(product.sortedImages) && product.sortedImages.length > 0) {
    return product.sortedImages;
  }
  return product.images || [];
};

export const isProductDiscounted = (product: LegacyProduct): boolean =>
  geteffectivePriceUSD(product) < (product.priceUSD || 0);
