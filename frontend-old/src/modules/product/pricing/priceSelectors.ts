import { LegacyProduct } from '../types';

type PriceLike = Pick<LegacyProduct, 'priceUSD' | 'discount'>;

const isDiscountActive = (item: PriceLike): boolean => {
  const discount = item.discount;
  if (!discount?.enabled || !discount.percentage || discount.percentage <= 0) {
    return false;
  }

  const now = new Date();
  const startsAt = discount.startDate ? new Date(discount.startDate) : null;
  const endsAt = discount.endDate ? new Date(discount.endDate) : null;

  if (startsAt && now < startsAt) {
    return false;
  }

  if (endsAt && now > endsAt) {
    return false;
  }

  return true;
};

export const getbasePriceUSD = (item: PriceLike): number => item.priceUSD || 0;

export const getDiscountPercentage = (item: PriceLike): number => {
  if (!isDiscountActive(item)) {
    return 0;
  }
  return item.discount?.percentage || 0;
};

export const geteffectivePriceUSD = (item: PriceLike): number => {
  const base = getbasePriceUSD(item);
  const discount = getDiscountPercentage(item);
  if (!base || !discount) {
    return base;
  }
  return Math.max(0, Math.round(base * (1 - discount / 100) * 100) / 100);
};

export const hasActiveDiscount = (item: PriceLike): boolean => getDiscountPercentage(item) > 0;
