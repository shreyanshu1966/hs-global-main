'use client';
import { LegacyProduct } from '../types';

type PriceLike = Pick<LegacyProduct, 'priceINR' | 'discount'>;

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

export const getbasePriceINR = (item: PriceLike): number => item.priceINR || 0;

export const getDiscountPercentage = (item: PriceLike): number => {
  if (!isDiscountActive(item)) {
    return 0;
  }
  return item.discount?.percentage || 0;
};

export const geteffectivePriceINR = (item: PriceLike): number => {
  const base = getbasePriceINR(item);
  const discount = getDiscountPercentage(item);
  if (!base || !discount) {
    return base;
  }
  return Math.max(0, Math.round(base * (1 - discount / 100) * 100) / 100);
};

export const hasActiveDiscount = (item: PriceLike): boolean => getDiscountPercentage(item) > 0;
