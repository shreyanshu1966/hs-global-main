'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocalization } from './LocalizationContext';

export type Region = 'UAE' | 'Europe' | 'India' | 'USA' | 'UK' | 'default';

export const REGION_CURRENCIES: Record<Region, string> = {
    UAE: 'AED',
    Europe: 'EUR',
    India: 'INR',
    USA: 'USD',
    UK: 'GBP',
    default: 'USD',
};

export const REGION_LABELS: Record<Region, string> = {
    UAE: 'UAE',
    Europe: 'Europe',
    India: 'India',
    USA: 'USA',
    UK: 'UK',
    default: 'Global',
};

const COUNTRY_TO_REGION: Record<string, Region> = {
    AE: 'UAE',
    IN: 'India',
    US: 'USA',
    GB: 'UK',
    DE: 'Europe', FR: 'Europe', IT: 'Europe', ES: 'Europe', NL: 'Europe',
    BE: 'Europe', AT: 'Europe', PT: 'Europe', IE: 'Europe', GR: 'Europe',
    FI: 'Europe', SE: 'Europe', DK: 'Europe', NO: 'Europe', PL: 'Europe',
    CH: 'Europe', CZ: 'Europe', HU: 'Europe', RO: 'Europe', SK: 'Europe',
    SI: 'Europe', HR: 'Europe', BG: 'Europe', LT: 'Europe', LV: 'Europe',
    EE: 'Europe', MT: 'Europe', CY: 'Europe', LU: 'Europe',
};

// Instant, synchronous detection using timezone + browser language.
// Works without any API call — no latency, no rate limiting.
function detectRegionFromBrowser(): Region | null {
    try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';

        if (tz === 'Asia/Kolkata' || tz === 'Asia/Calcutta') return 'India';
        if (tz === 'Asia/Dubai' || tz === 'Asia/Muscat') return 'UAE';
        if (tz === 'Europe/London') return 'UK';
        if (tz.startsWith('Europe/')) return 'Europe';
        if (
            tz.startsWith('America/New_York') || tz.startsWith('America/Chicago') ||
            tz.startsWith('America/Los_Angeles') || tz.startsWith('America/Denver') ||
            tz.startsWith('America/Phoenix') || tz.startsWith('America/Anchorage') ||
            tz === 'Pacific/Honolulu'
        ) return 'USA';

        // Fallback: browser language tag (e.g. "en-IN", "en-GB")
        const langs = navigator.languages?.length ? navigator.languages : [navigator.language];
        for (const l of langs) {
            const tag = l?.split('-')[1]?.toUpperCase();
            if (tag && COUNTRY_TO_REGION[tag]) return COUNTRY_TO_REGION[tag];
        }
    } catch {
        // SSR or restricted environment — skip
    }
    return null;
}

const STORAGE_KEY = 'hs-global-region';

interface RegionContextType {
    region: Region;
    setRegion: (region: Region) => void;
    getCurrencyForRegion: () => string;
    isAutoDetected: boolean;
}

const RegionContext = createContext<RegionContextType | undefined>(undefined);

export const RegionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { location, loading: locationLoading } = useLocalization();

    const [region, setRegionState] = useState<Region>(() => {
        if (typeof window === 'undefined') return 'default'; // SSR-safe
        // Priority 1: saved manual selection (but NOT 'default' — that means "auto-detect")
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved && saved !== 'default') {
            console.log(`[Region] Loaded from localStorage: ${saved}`);
            return saved as Region;
        }
        // Priority 2: instant browser detection (timezone/language)
        const tz = typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : '';
        const detected = detectRegionFromBrowser();
        console.log(`[Region] Browser timezone: ${tz} → detected: ${detected || 'default'}`);
        return detected || 'default';
    });

    const [isAutoDetected, setIsAutoDetected] = useState(() => {
        if (typeof window === 'undefined') return true; // SSR-safe
        const saved = localStorage.getItem(STORAGE_KEY);
        return !saved || saved === 'default';
    });

    // Priority 3: IP-based detection (async, most accurate — only overrides if no manual selection)
    useEffect(() => {
        if (locationLoading || !location?.country) return;
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved && saved !== 'default') return; // respect manual override

        const detected = COUNTRY_TO_REGION[location.country.toUpperCase()];
        if (detected) {
            console.log(`[Region] IP detected: ${location.country} → ${detected}`);
            setRegionState(detected);
            setIsAutoDetected(true);
        }
    }, [location, locationLoading]);

    const setRegion = (r: Region) => {
        setRegionState(r);
        // 'default' (Global) means "auto-detect" — never persist it, so next load re-detects
        if (r === 'default') {
            localStorage.removeItem(STORAGE_KEY);
            setIsAutoDetected(true);
        } else {
            localStorage.setItem(STORAGE_KEY, r);
            setIsAutoDetected(false);
        }
    };

    const getCurrencyForRegion = () => REGION_CURRENCIES[region] || 'USD';

    return (
        <RegionContext.Provider value={{ region, setRegion, getCurrencyForRegion, isAutoDetected }}>
            {children}
        </RegionContext.Provider>
    );
};

export const useRegion = () => {
    const ctx = useContext(RegionContext);
    if (!ctx) throw new Error('useRegion must be used within RegionProvider');
    return ctx;
};
