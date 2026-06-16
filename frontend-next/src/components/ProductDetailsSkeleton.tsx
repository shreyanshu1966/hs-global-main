'use client';
import React, { useLayoutEffect } from 'react';

/**
 * Skeleton component for ProductDetails page
 * Mirrors the actual layout to prevent layout shift (CLS)
 */
export const ProductDetailsSkeleton: React.FC = () => {
  // Scroll to top immediately when skeleton mounts (before paint)
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 overflow-hidden">
      {/* Main Content */}
      <div className="container mx-auto px-4 pt-24 md:pt-32 pb-8 md:pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery Skeleton */}
          <div className="lg:sticky lg:top-4 h-fit">
            <div className="relative">
              {/* Main Image Skeleton */}
              <div className="aspect-square bg-gray-200 rounded-2xl mb-4 animate-pulse" />
              
              {/* Thumbnail Gallery Skeleton */}
              <div className="grid grid-cols-5 md:grid-cols-6 gap-2 md:gap-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="aspect-square bg-gray-200 rounded-lg md:rounded-xl animate-pulse"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Product Info Skeleton */}
          <div className="flex flex-col">
            {/* Availability Badge Skeleton */}
            <div className="h-7 w-24 bg-gray-200 rounded-full mb-3 animate-pulse" />

            {/* Title Skeleton */}
            <div className="h-10 md:h-12 bg-gray-200 rounded-lg w-3/4 mb-2 animate-pulse" />
            <div className="h-10 md:h-12 bg-gray-200 rounded-lg w-1/2 mb-4 animate-pulse" />

            {/* Rating Skeleton */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
                ))}
              </div>
              <div className="h-5 w-12 bg-gray-200 rounded animate-pulse" />
              <div className="h-5 w-20 bg-gray-200 rounded animate-pulse" />
            </div>

            {/* Price Section Skeleton */}
            <div className="bg-gray-100 border-2 border-gray-200 rounded-2xl p-6 mb-6">
              <div className="h-4 w-16 bg-gray-200 rounded mb-2 animate-pulse" />
              <div className="h-12 w-40 bg-gray-200 rounded animate-pulse" />
            </div>

            {/* Quick Info Skeleton */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-3 bg-gray-100 rounded-lg border border-gray-200">
                  <div className="w-5 h-5 bg-gray-200 rounded mx-auto mb-1 animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded w-full animate-pulse" />
                </div>
              ))}
            </div>

            {/* Description Skeleton */}
            <div className="bg-gray-100 p-4 rounded-xl border border-gray-200 mb-6">
              <div className="h-4 bg-gray-200 rounded w-full mb-2 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-5/6 mb-2 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-4/5 animate-pulse" />
            </div>

            {/* Specifications Skeleton */}
            <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-5 md:p-6 mb-6">
              <div className="h-6 w-32 bg-gray-200 rounded mb-4 animate-pulse" />
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Buttons Skeleton */}
            <div className="space-y-3">
              <div className="h-14 bg-gray-200 rounded-xl w-full animate-pulse" />
              <div className="grid grid-cols-2 gap-3">
                <div className="h-12 bg-gray-200 rounded-xl animate-pulse" />
                <div className="h-12 bg-gray-200 rounded-xl animate-pulse" />
              </div>
              <div className="h-12 bg-gray-200 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Description Section Skeleton */}
      <div className="bg-gradient-to-b from-gray-50 to-white py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Tab Navigation Skeleton */}
            <div className="flex items-center gap-2 border-b-2 border-gray-200 mb-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 w-28 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>

            {/* Tab Content Skeleton */}
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-10 border border-gray-200">
              <div className="h-8 w-48 bg-gray-200 rounded mb-6 animate-pulse" />
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-4/5 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section Skeleton */}
      <div className="bg-gradient-to-b from-white to-gray-50 py-12 md:py-16 border-t-2 border-gray-200">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Section Header Skeleton */}
            <div className="text-center mb-10">
              <div className="h-10 w-64 bg-gray-200 rounded mx-auto mb-3 animate-pulse" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Review Stats Skeleton */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <div className="h-16 w-16 bg-gray-200 rounded-full mx-auto mb-4 animate-pulse" />
                  <div className="h-6 w-20 bg-gray-200 rounded mx-auto mb-2 animate-pulse" />
                  <div className="space-y-2 mt-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="h-4 w-8 bg-gray-200 rounded animate-pulse" />
                        <div className="flex-1 h-2 bg-gray-200 rounded animate-pulse" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Review List Skeleton */}
              <div className="lg:col-span-2 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
                      <div>
                        <div className="h-4 w-24 bg-gray-200 rounded mb-1 animate-pulse" />
                        <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                      <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Skeleton */}
      <div className="bg-gradient-to-b from-gray-50 to-white py-12 md:py-16 border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <div className="h-10 w-64 bg-gray-200 rounded mb-2 animate-pulse" />
              <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>

          <div className="flex gap-6 overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl shadow-lg overflow-hidden shrink-0 border-2 border-gray-100"
                style={{ width: '250px' }}
              >
                <div className="aspect-square bg-gray-200 animate-pulse" />
                <div className="p-5">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-3 animate-pulse" />
                  <div className="h-10 bg-gray-200 rounded w-1/2 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsSkeleton;
