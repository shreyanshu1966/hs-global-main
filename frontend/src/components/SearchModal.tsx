import React, { useState, useEffect, useRef } from 'react';
import { X, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { categories, Product } from '../data/products';
import gsap from 'gsap';

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Array<{ product: Product; subcategoryId: string; categoryId: string }>>([]);
    const navigate = useNavigate();
    const modalRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const resultsRef = useRef<HTMLDivElement>(null);

    // Search through all products
    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }

        const query = searchQuery.toLowerCase();
        const results: Array<{ product: Product; subcategoryId: string; categoryId: string }> = [];

        categories.forEach((category) => {
            const searchInSubcategories = (subcategories: any[], categoryId: string) => {
                subcategories.forEach((subcategory) => {
                    if (subcategory.products) {
                        subcategory.products.forEach((product: Product) => {
                            if (
                                product.name.toLowerCase().includes(query) ||
                                product.description?.toLowerCase().includes(query)
                            ) {
                                results.push({
                                    product,
                                    subcategoryId: subcategory.id,
                                    categoryId,
                                });
                            }
                        });
                    }
                    if (subcategory.subcategories) {
                        searchInSubcategories(subcategory.subcategories, categoryId);
                    }
                });
            };

            searchInSubcategories(category.subcategories, category.id);
        });

        setSearchResults(results.slice(0, 10)); // Limit to 10 results
    }, [searchQuery]);

    // Handle product click
    const handleProductClick = (result: typeof searchResults[0]) => {
        sessionStorage.setItem('scrollY', '0');
        navigate(`/productsinfo/${result.product.id}`, {
            state: { targetProduct: result.product.name },
        });
        onClose();
        setSearchQuery('');
    };

    // Animation on open/close
    useEffect(() => {
        if (isOpen && modalRef.current) {
            gsap.fromTo(
                modalRef.current,
                { opacity: 0 },
                { opacity: 1, duration: 0.2 }
            );
            gsap.fromTo(
                modalRef.current.querySelector('.modal-content'),
                { y: -20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.3, delay: 0.1 }
            );
            // Focus input
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    // Animate results
    useEffect(() => {
        if (resultsRef.current && searchResults.length > 0) {
            const items = resultsRef.current.querySelectorAll('.search-result-item');
            gsap.fromTo(
                items,
                { opacity: 0, x: -10 },
                { opacity: 1, x: 0, stagger: 0.05, duration: 0.2 }
            );
        }
    }, [searchResults]);

    // Close on escape
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleEscape);
            return () => window.removeEventListener('keydown', handleEscape);
        }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            ref={modalRef}
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-start justify-center pt-20 px-4"
            onClick={onClose}
        >
            <div
                className="modal-content bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[70vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center gap-3 p-4 border-b border-gray-200">
                    <Search className="w-5 h-5 text-gray-400" />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 outline-none text-lg placeholder-gray-400"
                    />
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        aria-label="Close search"
                    >
                        <X className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                {/* Results */}
                <div ref={resultsRef} className="overflow-y-auto max-h-[calc(70vh-80px)]">
                    {searchQuery.trim() && searchResults.length === 0 && (
                        <div className="p-8 text-center text-gray-500">
                            No products found for "{searchQuery}"
                        </div>
                    )}

                    {searchResults.length > 0 && (
                        <div className="p-2">
                            {searchResults.map((result, index) => (
                                <button
                                    key={`${result.product.id}-${index}`}
                                    onClick={() => handleProductClick(result)}
                                    className="search-result-item w-full flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
                                    style={{ opacity: 0 }}
                                >
                                    {result.product.images && result.product.images[0] && (
                                        <img
                                            src={result.product.images[0]}
                                            alt={result.product.name}
                                            className="w-16 h-16 object-cover rounded-lg"
                                        />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium text-gray-900 truncate">
                                            {result.product.name}
                                        </h3>
                                        {result.product.description && (
                                            <p className="text-sm text-gray-500 truncate">
                                                {result.product.description}
                                            </p>
                                        )}
                                        <p className="text-xs text-gray-400 mt-1 capitalize">
                                            {result.categoryId} • {result.subcategoryId}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {!searchQuery.trim() && (
                        <div className="p-8 text-center text-gray-400">
                            <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p>Start typing to search products...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
