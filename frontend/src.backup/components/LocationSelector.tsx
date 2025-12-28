import React, { useState, useRef, useEffect } from 'react';
import { Globe, DollarSign, X, MapPin } from 'lucide-react';
import { useLocalization } from '../contexts/LocalizationContext';

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
];

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht' },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso' },
  { code: 'VND', symbol: '₫', name: 'Vietnamese Dong' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'MXN', symbol: 'Mex$', name: 'Mexican Peso' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
  { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
];

export const LocationSelector: React.FC = () => {
  const {
    language,
    currency,
    isAutoDetect,
    location,
    loading,
    setLanguage,
    setCurrency,
    toggleAutoDetect,
  } = useLocalization();

  const [isOpen, setIsOpen] = useState(false);
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

  if (loading) {
    return (
      <button className="p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-md border border-gray-200 hover:shadow-lg transition-all">
        <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
      </button>
    );
  }

  const getCurrentLanguage = () => LANGUAGES.find(l => l.code === language);
  const getCurrentCurrency = () => CURRENCIES.find(c => c.code === currency);

  return (
    <div className="relative" ref={popupRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/90 backdrop-blur-sm shadow-md border border-gray-200 hover:shadow-lg transition-all hover:scale-105"
        title="Change language and currency"
      >
        <Globe className="w-4 h-4 text-gray-700" />
        <span className="text-sm font-medium text-gray-900">
          {getCurrentLanguage()?.flag} {getCurrentCurrency()?.symbol}
        </span>
      </button>

      {/* Floating Popup */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-black to-gray-800 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              <h3 className="font-semibold">Preferences</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {/* Location Info */}
            {location && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-200">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-blue-900">Detected Location</p>
                    <p className="text-sm text-blue-800 truncate">{location.countryName}</p>
                    {location.city && (
                      <p className="text-xs text-blue-700">{location.city}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Auto-detect Toggle */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div>
                <p className="text-sm font-semibold text-gray-900">Auto-Detect</p>
                <p className="text-xs text-gray-600">Set based on location</p>
              </div>
              <button
                onClick={toggleAutoDetect}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  isAutoDetect ? 'bg-black' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                    isAutoDetect ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Language Selector */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                <Globe className="w-3 h-3" />
                Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                disabled={isAutoDetect}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-black focus:border-black bg-white cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Currency Selector */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                disabled={isAutoDetect}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-black focus:border-black bg-white cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
              >
                {CURRENCIES.map((curr) => (
                  <option key={curr.code} value={curr.code}>
                    {curr.symbol} {curr.code} - {curr.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Info Text */}
            <div className="text-xs text-gray-500 bg-amber-50 border border-amber-200 rounded-lg p-2">
              {isAutoDetect ? (
                <p>🌍 Auto-detect is enabled. Settings are based on your location.</p>
              ) : (
                <p>✋ Manual mode. You can select your preferred language and currency.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationSelector;