import React, { Suspense, lazy } from 'react';
import { Product } from '../data/products';

// Lazy load ProductCard for code splitting
const ProductCard = lazy(() => import('./ProductCard').then(module => ({ default: module.ProductCard })));

interface LazyProductCardProps {
    product: Product;
    variant: 'modern' | 'luxury' | 'industrial' | 'elegant';
    index: number;
}

/**
 * Wrapper component for lazy-loaded ProductCard with loading skeleton
 * This enables code splitting and reduces initial bundle size
 */
export const LazyProductCard: React.FC<LazyProductCardProps> = (props) => {
    return (
        <Suspense fallback={<ProductCardSkeleton />}>
            <ProductCard {...props} />
        </Suspense>
    );
};

/**
 * Lightweight skeleton loader for ProductCard
 * Shown while the actual component is being loaded
 */
const ProductCardSkeleton: React.FC = () => {
    return (
        <div className="relative overflow-hidden bg-transparent shadow-lg rounded-lg flex flex-col animate-pulse">
            {/* Image skeleton */}
            <div
                className="relative bg-gradient-to-br from-gray-100 to-gray-200"
                style={{ aspectRatio: '4/5' }}
            >
                <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-16 h-16 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4z" />
                    </svg>
                </div>
            </div>

            {/* Content skeleton */}
            <div className="flex flex-col flex-grow p-4 md:p-5 bg-white rounded-b-lg">
                {/* Title skeleton */}
                <div className="h-6 bg-gray-200 rounded mb-3 w-3/4"></div>

                {/* Buttons skeleton */}
                <div className="mt-auto pt-2 flex gap-2">
                    <div className="flex-grow h-11 md:h-12 bg-gray-200 rounded-lg"></div>
                    <div className="h-11 md:h-12 w-12 bg-gray-200 rounded-lg"></div>
                </div>
            </div>
        </div>
    );
};
