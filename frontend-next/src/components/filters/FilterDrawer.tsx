'use client';
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Category } from '../../services/productService';
import { FilterSidebar } from './FilterSidebar';

interface FilterDrawerProps {
    isOpen: boolean;
    onClose: () => void;
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

export const FilterDrawer: React.FC<FilterDrawerProps> = ({
    isOpen,
    onClose,
    ...sidebarProps
}) => {
    // Prevent scrolling on body when drawer is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm lg:hidden"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 left-0 w-[85vw] sm:w-[350px] bg-white z-50 shadow-2xl overflow-y-auto lg:hidden"
                    >
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h2 className="text-xl font-medium text-gray-900">Filters</h2>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                aria-label="Close filters"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="p-6">
                            <FilterSidebar {...sidebarProps} />

                            <div className="mt-8 pt-6 border-t border-gray-100 mb-6">
                                <button
                                    onClick={onClose}
                                    className="w-full py-3 bg-gray-900 hover:bg-black text-white font-medium rounded-lg transition-colors shadow-sm"
                                >
                                    Show Results
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
