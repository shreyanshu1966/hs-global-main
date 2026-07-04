'use client';
import React, { useState, useEffect } from 'react';
import { Category } from '../../services/productService';

const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  furniture: 'Marble Furniture',
  'wooden-furniture': 'Wooden Furniture',
  leather: 'Leather Furniture',
  'semi-precious-stone': 'Semi Precious Stone',
};
const getCatDisplayName = (cat: string) =>
  CATEGORY_DISPLAY_NAMES[cat] ?? cat.replace(/-/g, ' ');
import { ChevronDown, X } from 'lucide-react';
import * as Accordion from '@radix-ui/react-accordion';
import * as Slider from '@radix-ui/react-slider';
import { useCurrency, DEFAULT_RATES } from '../../contexts/CurrencyContext';

interface FilterSidebarProps {
    categories: Category[];
    activeCategory: string;
    activeSubcategory: string;
    hideCategorySelection?: boolean;
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
    hideCategorySelection = false,
    minPrice,
    maxPrice,
    onCategoryChange,
    onSubcategoryChange,
    onPriceChange,
    onClearFilters,
}) => {
    const { getCurrencySymbol, exchangeRates, currency } = useCurrency();
    // minPrice/maxPrice are canonical INR. Convert to the display currency via the
    // INR cross-rate — for the India region this is an identity (rate = 1), so the
    // slider never drifts for the common case, matching the rest of the pricing engine.
    const inrRate = exchangeRates.INR || DEFAULT_RATES.INR;
    const rate = currency === 'INR' ? 1 : (exchangeRates[currency] || 1) / inrRate;

    // We arbitrarily choose 1,000,000 INR as the max slider value for the UI if we don't know the catalogue max
    const GLOBAL_MAX_INR = 1000000;
    const maxLocalLimit = Math.ceil(GLOBAL_MAX_INR * rate);
    const stepLocal = Math.ceil(50 * rate);

    const [localRange, setLocalRange] = useState<[number, number]>([
        minPrice ? Math.floor(minPrice * rate) : 0,
        maxPrice ? Math.ceil(maxPrice * rate) : maxLocalLimit
    ]);

    // Sync local state if props change from outside
    useEffect(() => {
        setLocalRange([
            minPrice ? Math.floor(minPrice * rate) : 0,
            maxPrice ? Math.ceil(maxPrice * rate) : maxLocalLimit
        ]);
    }, [minPrice, maxPrice, rate, maxLocalLimit]);

    const handlePriceCommit = (value: number[]) => {
        const [minLocal, maxLocal] = value;
        const newMinINR = minLocal > 0 ? Math.floor(minLocal / rate) : undefined;
        // If maxLocal is at absolute maximum, we set max to undefined to not limit upper bound
        const newMaxINR = maxLocal < maxLocalLimit ? Math.ceil(maxLocal / rate) : undefined;
        onPriceChange(newMinINR, newMaxINR);
    };

    const hasActiveFilters =
        (!hideCategorySelection && !!activeCategory) ||
        !!activeSubcategory ||
        !!minPrice ||
        !!maxPrice;

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

            <Accordion.Root type="multiple" defaultValue={hideCategorySelection ? ['price'] : ['categories', 'price']} className="space-y-6">
                {!hideCategorySelection && (
                    <Accordion.Item value="categories" className="border-b border-gray-200 pb-6">
                        <Accordion.Header>
                            <Accordion.Trigger className="flex w-full items-center justify-between text-gray-900 mb-4 group">
                                <span className="font-medium">Category</span>
                                <ChevronDown className="w-4 h-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                            </Accordion.Trigger>
                        </Accordion.Header>
                        <Accordion.Content className="overflow-hidden data-[state=closed]:animate-slideUp data-[state=open]:animate-slideDown">
                            <div className="space-y-3 pt-1">
                                <div className="space-y-4">
                                    <button
                                        key="all"
                                        onClick={() => {
                                            onCategoryChange("");
                                            onSubcategoryChange("");
                                        }}
                                        className={`block w-full text-left text-sm ${!activeCategory ? "text-gray-900 font-medium" : "text-gray-600 hover:text-black"}`}
                                    >
                                        All Categories
                                    </button>
                                    {categories.map((cat) => (
                                        <div key={cat.category} className="space-y-3">
                                            <button
                                                onClick={() => {
                                                    onCategoryChange(cat.category);
                                                    if (activeCategory !== cat.category) {
                                                        onSubcategoryChange("");
                                                    }
                                                }}
                                                className={`block w-full text-left text-sm capitalize ${activeCategory === cat.category ? "text-gray-900 font-medium" : "text-gray-600 hover:text-black"}`}
                                            >
                                                {getCatDisplayName(cat.category)}
                                            </button>

                                            {/* Subcategories */}
                                            {activeCategory === cat.category && cat.subcategories && cat.subcategories.length > 0 && (
                                                <div className="pl-4 space-y-2 mt-2 border-l border-gray-100">
                                                    <button
                                                        onClick={() => onSubcategoryChange("")}
                                                        className={`block w-full text-left text-sm capitalize ${!activeSubcategory ? "text-gray-900 font-medium" : "text-gray-500 hover:text-black"}`}
                                                    >
                                                        All in {getCatDisplayName(cat.category)}
                                                    </button>
                                                    {cat.subcategories.map(sub => (
                                                        <button
                                                            key={sub}
                                                            onClick={() => onSubcategoryChange(sub)}
                                                            className={`block w-full text-left text-sm capitalize ${activeSubcategory === sub ? "text-gray-900 font-medium" : "text-gray-500 hover:text-black"}`}
                                                        >
                                                            {sub.replace(/-/g, ' ')}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Accordion.Content>
                    </Accordion.Item>
                )}

                {/* Price Section */}
                <Accordion.Item value="price" className="border-b border-gray-200 pb-6">
                    <Accordion.Header>
                        <Accordion.Trigger className="flex w-full items-center justify-between text-gray-900 mb-4 group">
                            <span className="font-medium">Price Range ({currency})</span>
                            <ChevronDown className="w-4 h-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                        </Accordion.Trigger>
                    </Accordion.Header>
                    <Accordion.Content className="overflow-hidden data-[state=closed]:animate-slideUp data-[state=open]:animate-slideDown">
                        <div className="pt-2 px-2 pb-4">
                            <Slider.Root
                                className="relative flex items-center select-none touch-none w-full h-5"
                                value={localRange}
                                max={maxLocalLimit}
                                step={stepLocal}
                                onValueChange={(val: number[]) => setLocalRange([val[0], val[1]])}
                                onValueCommit={handlePriceCommit}
                            >
                                <Slider.Track className="bg-gray-200 relative grow rounded-full h-[3px]">
                                    <Slider.Range className="absolute bg-gray-900 rounded-full h-full" />
                                </Slider.Track>
                                <Slider.Thumb className="block w-5 h-5 bg-white border-2 border-gray-900 shadow-md rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors cursor-grab active:cursor-grabbing" aria-label="Min price" />
                                <Slider.Thumb className="block w-5 h-5 bg-white border-2 border-gray-900 shadow-md rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors cursor-grab active:cursor-grabbing" aria-label="Max price" />
                            </Slider.Root>
                            
                            <div className="flex items-center justify-between mt-6">
                                <span className="text-sm font-medium text-gray-600 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-200">
                                    {getCurrencySymbol()}{localRange[0].toLocaleString()}
                                </span>
                                <span className="text-gray-400 text-sm">-</span>
                                <span className="text-sm font-medium text-gray-600 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-200">
                                    {localRange[1] >= maxLocalLimit ? `${getCurrencySymbol()}${localRange[1].toLocaleString()}+` : `${getCurrencySymbol()}${localRange[1].toLocaleString()}`}
                                </span>
                            </div>
                        </div>
                    </Accordion.Content>
                </Accordion.Item>
            </Accordion.Root>
        </aside>
    );
};
