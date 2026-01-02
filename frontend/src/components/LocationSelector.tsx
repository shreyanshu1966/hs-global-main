import React, { useState, useRef, useEffect } from 'react';
import { Globe, MapPin, RefreshCw, ChevronDown } from 'lucide-react';
import { useCurrency } from '../contexts/CurrencyContext';

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳' },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
  { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', flag: '🇦🇪' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal', flag: '🇸🇦' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', flag: '🇦🇺' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', flag: '🇨🇦' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', flag: '🇸🇬' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', flag: '🇯🇵' },
];

export const LocationSelector: React.FC = () => {
  const { currency, setCurrency, loading } = useCurrency();

  const [isOpen, setIsOpen] = useState(false);
  const [isAutoDetect, setIsAutoDetect] = useState(() => {
    return localStorage.getItem('hs-global-currency-auto-detect') !== 'false';
  });
  const popupRef = useRef<HTMLDivElement>(null);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    setCurrency(code);
    setIsAutoDetect(false);
  };

  const handleReEnableAutoDetect = () => {
    localStorage.removeItem('hs-global-currency');
    localStorage.removeItem('hs-global-currency-auto-detect');
    setIsAutoDetect(true);
    window.location.reload();
  };

  if (loading) {
    return (
      <button className="p-2 rounded-lg bg-white/90 backdrop-blur-sm shadow-sm border border-gray-200">
        <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
      </button>
    );
  }

  const getCurrentCurrency = () => CURRENCIES.find(c => c.code === currency);

  const renderContent = () => (
    <>
      {/* Auto-Detect Status */}
      {!isAutoDetect ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-blue-900">Manual Mode</p>
              <p className="text-xs text-blue-700 mt-0.5">
                Auto-detect is off. Click to re-enable.
              </p>
              <button
                onClick={handleReEnableAutoDetect}
                className="mt-2 flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Re-enable Auto-Detect
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-medium text-green-900">Auto-Detect Active</p>
              <p className="text-xs text-green-700 mt-0.5">
                Currency set by your location
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Currency Dropdown */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1.5">
          Select Currency
        </label>
        <div className="relative">
          <select
            value={currency}
            onChange={handleCurrencyChange}
            className="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg text-sm font-medium text-gray-900 bg-white cursor-pointer focus:ring-2 focus:ring-black focus:border-black transition-all appearance-none"
          >
            {CURRENCIES.map((curr) => (
              <option key={curr.code} value={curr.code}>
                {curr.flag} {curr.code} - {curr.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        </div>
      </div>

      {/* Current Selection Display */}
      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
        <p className="text-xs text-gray-600 mb-1">Current Currency</p>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{getCurrentCurrency()?.flag}</span>
          <div>
            <p className="text-sm font-semibold text-gray-900">
              {getCurrentCurrency()?.symbol} {getCurrentCurrency()?.code}
            </p>
            <p className="text-xs text-gray-600">{getCurrentCurrency()?.name}</p>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="text-xs text-gray-500 bg-amber-50 border border-amber-200 rounded-lg p-2.5">
        💱 Prices displayed in selected currency. Payments in INR.
      </div>
    </>
  );

  return (
    <div className="relative" ref={popupRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 md:px-3 md:py-2 rounded-lg bg-white/90 backdrop-blur-sm shadow-sm border border-gray-200 hover:shadow-md transition-all hover:border-gray-300"
        title="Change currency"
      >
        <Globe className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-600" />
        <span className="text-xs md:text-sm font-medium text-gray-900">
          {getCurrentCurrency()?.flag} {currency}
        </span>
        <ChevronDown className={`w-3 h-3 md:w-3.5 md:h-3.5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Popup */}
      {isOpen && (
        <>
          {/* Mobile: Fixed position, full width with padding */}
          <div className="md:hidden fixed inset-x-4 top-20 bg-white rounded-xl shadow-xl border border-gray-200 z-50 max-h-[calc(100vh-6rem)] overflow-y-auto">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900">Currency Settings</h3>
            </div>
            <div className="p-4 space-y-3">
              {renderContent()}
            </div>
          </div>

          {/* Desktop: Dropdown from button */}
          <div className="hidden md:block absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900">Currency Settings</h3>
            </div>
            <div className="p-4 space-y-3">
              {renderContent()}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LocationSelector;