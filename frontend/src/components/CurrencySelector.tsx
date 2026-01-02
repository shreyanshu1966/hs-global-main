// CurrencySelector.tsx - Simple Currency Selector Component
import React from 'react';
import { useCurrency } from '../contexts/CurrencyContext';
import { Globe } from 'lucide-react';

const CURRENCIES = [
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
];

export const CurrencySelector: React.FC = () => {
    const { currency, setCurrency, getCurrencySymbol } = useCurrency();

    return (
        <div className="relative group">
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                <Globe className="w-4 h-4" />
                <span className="text-sm font-medium">{getCurrencySymbol()} {currency}</span>
            </button>

            {/* Dropdown */}
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="p-2">
                    <div className="text-xs font-semibold text-gray-500 px-3 py-2">Select Currency</div>
                    {CURRENCIES.map((curr) => (
                        <button
                            key={curr.code}
                            onClick={() => setCurrency(curr.code)}
                            className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${currency === curr.code
                                    ? 'bg-black text-white'
                                    : 'hover:bg-gray-100 text-gray-700'
                                }`}
                        >
                            <span className="font-medium">{curr.symbol} {curr.code}</span>
                            <span className="text-xs ml-2 opacity-75">- {curr.name}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
