'use client';
import React from 'react';
import { CompactCarousel } from './CompactCarousel';

interface RelatedProductsProps {
  relatedProducts: any[];
  scrollRelated?: (dir: 'left' | 'right') => void;
  relatedRef?: React.RefObject<HTMLDivElement>;
}

export function RelatedProducts({ relatedProducts }: RelatedProductsProps) {
  return <CompactCarousel title="You May Also Like" products={relatedProducts} />;
}
