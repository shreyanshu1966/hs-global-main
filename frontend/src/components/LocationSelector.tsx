import React, { useState, useRef, useEffect } from 'react';
import { Globe, MapPin, RefreshCw, ChevronDown, X } from 'lucide-react';
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

  // Update handler to accept code directly
  const handleCurrencySelect = (code: string) => {
    setCurrency(code);
    setIsAutoDetect(false);
    // Optionally close on selection if desired, or keep open. User didn't specify closing behavior but standard is often to stay or close. 
    // Given the modal nature on mobile, closing feels natural.
    setIsOpen(false);
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
                type="button"
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

      {/* Currency Selection List */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2">
          Select Currency
        </label>
        <div className="grid grid-cols-1 gap-1 max-h-60 overflow-y-auto pr-1">
          {CURRENCIES.map((curr) => {
            const isSelected = curr.code === currency;
            return (
              <button
                key={curr.code}
                onClick={() => handleCurrencySelect(curr.code)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-left group ${isSelected
                  ? 'bg-black text-white hover:bg-gray-800'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 hover:border-gray-300'
                  }`}
                type="button"
              >
                <span className="text-xl leading-none">{curr.flag}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                      {curr.code}
                    </span>
                    <span className={`text-xs opacity-75 ${isSelected ? 'text-white' : 'text-gray-500'}`}>
                      {curr.symbol}
                    </span>
                  </div>
                  <p className={`text-xs truncate ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
                    {curr.name}
                  </p>
                </div>
                {isSelected && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Info */}
      <div className="text-xs text-gray-500 bg-amber-50 border border-amber-200 rounded-lg p-2.5 flex items-start gap-2">
        <span className="text-lg leading-none">💱</span>
        <span className="pt-0.5">Prices displayed in selected currency. Payments in INR.</span>
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
          {/* Mobile: Centered Modal with Overlay */}
          <div className="md:hidden fixed inset-0 z-[100] flex items-center justify-center px-4">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
              onClick={() => setIsOpen(false)}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-sm font-semibold text-gray-900">Currency Settings</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
                {renderContent()}
              </div>
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