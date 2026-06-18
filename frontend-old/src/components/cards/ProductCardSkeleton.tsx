import React from 'react';

export const ProductCardSkeleton: React.FC = () => {
    return (
        <div className="group animate-pulse">
            {/* Image Skeleton */}
            <div className="aspect-[4/3] bg-[#FAF8F5] overflow-hidden relative">
                <div className="absolute inset-0 bg-[#E8E3DC] w-full h-full"></div>
            </div>

            {/* Info Skeleton */}
            <div className="space-y-3 mt-4">
                <div className="h-6 bg-[#E8E3DC] rounded w-3/4"></div>
                <div className="h-4 bg-[#E8E3DC] rounded w-1/2"></div>
                <div className="h-5 bg-[#E8E3DC] rounded w-1/4"></div>
            </div>
        </div>
    );
};
