import React, { useState, useEffect } from 'react';
import { Category } from '../../services/productService';
import { ChevronDown, ChevronUp, X } from 'lucide-react';

interface FilterSidebarProps {
    categories: Category[];
    activeCategory: string;
    activeSubcategory: string;
    minPrice?: number;
    maxPrice?: number;
    onCategoryChange: (cat: string) => void;
    onSubcategoryChange: (sub: string) => void;
    onPriceChange: (min?: number, max?: number) => void;
    onClearFilters: () => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
    categories,
    activeCategory,
    activeSubcategory,
    minPrice,
    maxPrice,
    onCategoryChange,
    onSubcategoryChange,
    onPriceChange,
    onClearFilters,
}) => {
    const [isCategoryOpen, setIsCategoryOpen] = useState(true);
    const [isPriceOpen, setIsPriceOpen] = useState(true);

    const [localMin, setLocalMin] = useState<string>(minPrice ? String(minPrice) : '');
    const [localMax, setLocalMax] = useState<string>(maxPrice ? String(maxPrice) : '');

    // Sync local state if props change from outside
    useEffect(() => {
        setLocalMin(minPrice ? String(minPrice) : '');
        setLocalMax(maxPrice ? String(maxPrice) : '');
    }, [minPrice, maxPrice]);

    const handlePriceSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const min = localMin ? Number(localMin) : undefined;
        const max = localMax ? Number(localMax) : undefined;
        onPriceChange(min, max);
    };

    const hasActiveFilters = activeCategory || activeSubcategory || minPrice || maxPrice;

    const currentCategoryData = categories.find(c => c.category === activeCategory);

    return (
        <aside className="w-full">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-medium text-gray-900">Filters</h2>
                {hasActiveFilters && (
                    <button
                        onClick={onClearFilters}
                        className="text-sm text-gray-500 hover:text-black transition-colors flex items-center gap-1"
                    >
                        <X className="w-3 h-3" />
                        Clear all
                    </button>
                )}
            </div>

            <div className="space-y-6">
                {/* Categories Section */}
                <div className="border-b border-gray-200 pb-6">
                    <button
                        className="flex w-full items-center justify-between text-gray-900 mb-4"
                        onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                    >
                        <span className="font-medium">Category</span>
                        {isCategoryOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {isCategoryOpen && (
                        <div className="space-y-3">
                            <button
                                key="all"
                                onClick={() => { onCategoryChange(""); onSubcategoryChange(""); }}
                                className={`block w-full text-left text-sm ${!activeCategory ? "text-amber-600 font-medium" : "text-gray-600 hover:text-black"}`}
                            >
                                All Categories
                            </button>
                            {categories.map((cat) => (
                                <div key={cat.category} className="space-y-2">
                                    <button
                                        onClick={() => {
                                            onCategoryChange(cat.category);
                                            if (activeCategory !== cat.category) {
                                                onSubcategoryChange("");
                                            }
                                        }}
                                        className={`block w-full text-left text-sm capitalize ${activeCategory === cat.category ? "text-amber-600 font-medium" : "text-gray-600 hover:text-black"}`}
                                    >
                                        {cat.category.replace(/-/g, ' ')}
                                    </button>

                                    {/* Subcategories (only show if category is active) */}
                                    {activeCategory === cat.category && cat.subcategories && cat.subcategories.length > 0 && (
                                        <div className="pl-4 space-y-2 mt-2 border-l border-gray-100">
                                            <button
                                                onClick={() => onSubcategoryChange("")}
                                                className={`block w-full text-left text-sm capitalize ${!activeSubcategory ? "text-amber-600 font-medium" : "text-gray-500 hover:text-black"}`}
                                            >
                                                All in {cat.category.replace(/-/g, ' ')}
                                            </button>
                                            {cat.subcategories.map(sub => (
                                                <button
                                                    key={sub}
                                                    onClick={() => onSubcategoryChange(sub)}
                                                    className={`block w-full text-left text-sm capitalize ${activeSubcategory === sub ? "text-amber-600 font-medium" : "text-gray-500 hover:text-black"}`}
                                                >
                                                    {sub.replace(/-/g, ' ')}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Price Section */}
                <div className="border-b border-gray-200 pb-6">
                    <button
                        className="flex w-full items-center justify-between text-gray-900 mb-4"
                        onClick={() => setIsPriceOpen(!isPriceOpen)}
                    >
                        <span className="font-medium">Price Range (OMR)</span>
                        {isPriceOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {isPriceOpen && (
                        <form onSubmit={handlePriceSubmit} className="space-y-3">
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    value={localMin}
                                    onChange={(e) => setLocalMin(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                                />
                                <span className="text-gray-400">-</span>
                                <input
                                    type="number"
                                    placeholder="Max"
                                    value={localMax}
                                    onChange={(e) => setLocalMax(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full py-2 bg-gray-50 hover:bg-gray-100 text-gray-800 text-sm font-medium rounded-md transition-colors border border-gray-200"
                            >
                                Apply Range
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </aside>
    );
};
