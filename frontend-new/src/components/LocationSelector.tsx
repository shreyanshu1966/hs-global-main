'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, X } from 'lucide-react';
import { useRegion, REGION_CURRENCIES, REGION_LABELS, type Region } from '../contexts/RegionContext';
import { CURRENCY_SYMBOLS } from '../utils/pricing';

const REGIONS: { value: Region; label: string; flag: string; currency: string }[] = [
  { value: 'India',  label: 'India',  flag: '🇮🇳', currency: 'INR' },
  { value: 'USA',    label: 'USA',    flag: '🇺🇸', currency: 'USD' },
  { value: 'UAE',    label: 'UAE',    flag: '🇦🇪', currency: 'AED' },
  { value: 'UK',     label: 'UK',     flag: '🇬🇧', currency: 'GBP' },
  { value: 'Europe', label: 'Europe', flag: '🇪🇺', currency: 'EUR' },
  { value: 'default', label: 'Global', flag: '🌍', currency: 'USD' },
];

export const LocationSelector: React.FC = () => {
  const { region, setRegion, isAutoDetected } = useRegion();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  const current = REGIONS.find(r => r.value === region) || REGIONS[REGIONS.length - 1];
  const currencySymbol = CURRENCY_SYMBOLS[REGION_CURRENCIES[region] || 'USD'] || '$';

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        containerRef.current && !containerRef.current.contains(t) &&
        popupRef.current && !popupRef.current.contains(t)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Lock body scroll on mobile when open
  useEffect(() => {
    if (!isOpen) return;
    const orig = document.body.style.overflow;
    const origPad = document.body.style.paddingRight;
    const sbw = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${sbw}px`;
    return () => {
      document.body.style.overflow = orig;
      document.body.style.paddingRight = origPad;
    };
  }, [isOpen]);

  const handleSelect = (r: Region) => {
    setRegion(r);
    setIsOpen(false);
  };

  const content = (
    <>
      <div className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-lg p-2.5 mb-1">
        {isAutoDetected
          ? 'Region auto-detected from your location. Select manually to override.'
          : 'Manually selected. Prices and currency update per region.'}
      </div>
      <div className="grid grid-cols-1 gap-1">
        {REGIONS.map(r => {
          const selected = r.value === region;
          const sym = CURRENCY_SYMBOLS[r.currency] || '$';
          return (
            <button
              key={r.value}
              onClick={() => handleSelect(r.value)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left ${
                selected
                  ? 'bg-black text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
              type="button"
            >
              <span className="text-xl leading-none">{r.flag}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-semibold ${selected ? 'text-white' : 'text-gray-900'}`}>
                    {r.label}
                  </span>
                  <span className={`text-xs font-medium ${selected ? 'text-gray-300' : 'text-gray-500'}`}>
                    {r.currency} {sym}
                  </span>
                </div>
              </div>
              {selected && <div className="w-1.5 h-1.5 rounded-full bg-white flex-shrink-0" />}
            </button>
          );
        })}
      </div>
    </>
  );

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 md:px-3 md:py-2 rounded-lg bg-white/90 backdrop-blur-sm shadow-sm border border-gray-200 hover:shadow-md transition-all hover:border-gray-300"
        title="Change region"
        type="button"
      >
        <Globe className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-600" />
        <span className="text-xs md:text-sm font-medium text-gray-900">
          {current.flag} {currencySymbol}
        </span>
        <ChevronDown className={`w-3 h-3 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Mobile modal */}
          <div className="md:hidden fixed inset-0 z-[100] flex items-center justify-center px-4">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            <div
              ref={popupRef}
              className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-sm font-semibold text-gray-900">Select Region</h3>
                <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 space-y-3 max-h-[70vh] overflow-y-auto">{content}</div>
            </div>
          </div>

          {/* Desktop dropdown */}
          <div className="hidden md:block absolute top-full right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 z-50">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900">Select Region</h3>
            </div>
            <div className="p-3 space-y-2">{content}</div>
          </div>
        </>
      )}
    </div>
  );
};

export default LocationSelector;
