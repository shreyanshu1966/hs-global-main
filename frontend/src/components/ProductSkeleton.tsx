import React from 'react';

export const ProductSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 h-full flex flex-col">
      {/* Image Skeleton */}
      <div className="relative aspect-[4/3] bg-gray-200 animate-pulse" />
      
      {/* Content Skeleton */}
      <div className="p-4 flex flex-col flex-grow space-y-3">
        {/* Title */}
        <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse" />
        
        {/* Subtitle */}
        <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
        
        {/* Price */}
        <div className="mt-auto pt-4 flex items-center justify-between">
          <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse" />
          <div className="h-10 bg-gray-200 rounded w-1/4 animate-pulse" />
        </div>
      </div>
    </div>
  );
};
