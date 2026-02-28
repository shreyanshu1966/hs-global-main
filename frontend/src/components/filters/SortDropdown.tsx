import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export type SortOption = {
    label: string;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
};

const SORT_OPTIONS: SortOption[] = [
    { label: 'Newest Arrivals', sortBy: 'createdAt', sortOrder: 'desc' },
    { label: 'Price: Low to High', sortBy: 'priceINR', sortOrder: 'asc' },
    { label: 'Price: High to Low', sortBy: 'priceINR', sortOrder: 'desc' },
    { label: 'Name: A-Z', sortBy: 'name', sortOrder: 'asc' },
    { label: 'Name: Z-A', sortBy: 'name', sortOrder: 'desc' },
];

interface SortDropdownProps {
    currentSortBy: string;
    currentSortOrder: 'asc' | 'desc';
    onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
}

export const SortDropdown: React.FC<SortDropdownProps> = ({
    currentSortBy,
    currentSortOrder,
    onSortChange,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const currentOption = SORT_OPTIONS.find(
        opt => opt.sortBy === currentSortBy && opt.sortOrder === currentSortOrder
    ) || SORT_OPTIONS[0];

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative inline-block text-left z-20" ref={dropdownRef}>
            <button
                type="button"
                className="flex items-center justify-between w-full md:w-56 px-4 py-2.5 bg-white border border-gray-200 rounded-lg shadow-sm text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                <span className="truncate mr-2">
                    <span className="text-gray-400 mr-2">Sort by:</span>
                    <span className="font-medium text-gray-900">{currentOption.label}</span>
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none top-full overflow-hidden">
                    <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                        {SORT_OPTIONS.map((option) => (
                            <button
                                key={`${option.sortBy}-${option.sortOrder}`}
                                onClick={() => {
                                    onSortChange(option.sortBy, option.sortOrder);
                                    setIsOpen(false);
                                }}
                                className={`flex items-center justify-between w-full px-4 py-2.5 text-sm text-left ${currentOption.sortBy === option.sortBy && currentOption.sortOrder === option.sortOrder
                                        ? 'bg-amber-50 text-amber-700 font-medium'
                                        : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                role="menuitem"
                            >
                                {option.label}
                                {currentOption.sortBy === option.sortBy && currentOption.sortOrder === option.sortOrder && (
                                    <Check className="w-4 h-4 text-amber-600" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
