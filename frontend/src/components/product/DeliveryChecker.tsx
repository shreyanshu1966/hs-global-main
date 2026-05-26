import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { countries } from '../../data/countries';
import { API_BASE_URL } from '../../config';

// ─── Per-country postal patterns ─────────────────────────────────────────────
const POSTAL_PATTERNS: Record<string, { pattern: RegExp; hint: string }> = {
  IN: { pattern: /^\d{6}$/, hint: '6 digits, e.g. 400001' },
  US: { pattern: /^\d{5}(-\d{4})?$/, hint: '5 digits, e.g. 90210' },
  GB: { pattern: /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i, hint: 'e.g. SW1A 1AA' },
  CA: { pattern: /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i, hint: 'e.g. A1A 1A1' },
  AU: { pattern: /^\d{4}$/, hint: '4 digits, e.g. 2000' },
  DE: { pattern: /^\d{5}$/, hint: '5 digits, e.g. 10115' },
  FR: { pattern: /^\d{5}$/, hint: '5 digits, e.g. 75001' },
  JP: { pattern: /^\d{3}-?\d{4}$/, hint: 'e.g. 123-4567' },
  CN: { pattern: /^\d{6}$/, hint: '6 digits, e.g. 100000' },
  BR: { pattern: /^\d{5}-?\d{3}$/, hint: 'e.g. 01310-100' },
  IT: { pattern: /^\d{5}$/, hint: '5 digits, e.g. 00100' },
  ES: { pattern: /^\d{5}$/, hint: '5 digits, e.g. 28001' },
  NL: { pattern: /^\d{4}\s?[A-Z]{2}$/i, hint: 'e.g. 1011 AB' },
  SG: { pattern: /^\d{6}$/, hint: '6 digits, e.g. 018989' },
  MY: { pattern: /^\d{5}$/, hint: '5 digits, e.g. 50000' },
  RU: { pattern: /^\d{6}$/, hint: '6 digits, e.g. 101000' },
  SE: { pattern: /^\d{3}\s?\d{2}$/, hint: 'e.g. 111 22' },
  NO: { pattern: /^\d{4}$/, hint: '4 digits, e.g. 0150' },
  DK: { pattern: /^\d{4}$/, hint: '4 digits, e.g. 1000' },
  CH: { pattern: /^\d{4}$/, hint: '4 digits, e.g. 8001' },
  AT: { pattern: /^\d{4}$/, hint: '4 digits, e.g. 1010' },
  BE: { pattern: /^\d{4}$/, hint: '4 digits, e.g. 1000' },
  PT: { pattern: /^\d{4}-?\d{3}$/, hint: 'e.g. 1000-001' },
  PL: { pattern: /^\d{2}-?\d{3}$/, hint: 'e.g. 00-001' },
  AR: { pattern: /^[A-Z]\d{4}[A-Z]{3}$/i, hint: 'e.g. C1000AAA' },
  CL: { pattern: /^\d{7}$/, hint: '7 digits, e.g. 8320000' },
  NZ: { pattern: /^\d{4}$/, hint: '4 digits, e.g. 1010' },
  ZA: { pattern: /^\d{4}$/, hint: '4 digits, e.g. 0001' },
  TR: { pattern: /^\d{5}$/, hint: '5 digits, e.g. 34000' },
  KR: { pattern: /^\d{5}$/, hint: '5 digits, e.g. 03000' },
};

// ─── Country auto-detection from postal format ────────────────────────────────
function detectCountry(raw: string): string {
  const val = raw.trim().toUpperCase();
  if (!val) return '';

  // Unique alphanumeric formats — unambiguous
  if (/^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i.test(val)) return 'GB';
  if (/^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i.test(val))            return 'CA';
  if (/^[A-Z]\d{4}[A-Z]{3}$/i.test(val))                   return 'AR';
  if (/^\d{5}-\d{3}$/.test(val))                            return 'BR';
  if (/^\d{4}-?\d{3}$/.test(val))                           return 'PT';
  if (/^\d{2}-\d{3}$/.test(val))                            return 'PL';
  if (/^\d{3}-\d{4}$/.test(val))                            return 'JP';
  if (/^\d{4}\s[A-Z]{2}$/i.test(val))                       return 'NL';
  if (/^\d{3}\s\d{2}$/.test(val))                           return 'SE';

  // Pure numeric — detect by length + leading digit heuristics
  if (/^\d{7}$/.test(val)) return 'CL';

  if (/^\d{6}$/.test(val)) {
    // Indian pincodes: first digit 1–8, very predictable
    const first = val[0];
    if (first >= '1' && first <= '8') return 'IN';
    // SG starts with 01–82; CN/RU are the other 6-digit codes
    if (first === '0') return 'SG';
    return 'IN'; // fallback for 9xx (India APO)
  }

  if (/^\d{5}$/.test(val)) return 'US';

  if (/^\d{4}$/.test(val)) {
    // AU (2000–9999), NZ, CH (1000–9999), NO, DK, AT, BE
    const num = parseInt(val, 10);
    if (num >= 2000 && num <= 9999) return 'AU'; // AU is most common for this biz
    return 'NZ';
  }

  return '';
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface ShippingConfig {
  shipsWorldwide?: boolean;
  excludedCountries?: string[];
}
interface DeliveryCheckerProps {
  shippingConfig?: ShippingConfig;
  productId?: string;
}
type CheckResult = 'available' | 'unavailable' | null;

// ─── Component ────────────────────────────────────────────────────────────────
const DeliveryChecker: React.FC<DeliveryCheckerProps> = ({ shippingConfig, productId }) => {
  const [postalCode, setPostalCode]       = useState('');
  const [detectedCode, setDetectedCode]   = useState('');
  const [result, setResult]               = useState<CheckResult>(null);
  const [formatError, setFormatError]     = useState('');

  const shipsWorldwide    = shippingConfig?.shipsWorldwide !== false;
  const excludedCountries = shippingConfig?.excludedCountries || [];

  const detectedCountry = countries.find(c => c.code === detectedCode);
  const postalConfig    = POSTAL_PATTERNS[detectedCode];

  const handleInput = (val: string) => {
    setPostalCode(val);
    setResult(null);
    setFormatError('');
    setDetectedCode(detectCountry(val));
  };

  const handleCheck = () => {
    setFormatError('');
    setResult(null);

    if (!postalCode.trim()) return;

    if (!detectedCode) {
      setFormatError('Could not detect country — try a different format');
      return;
    }

    if (postalConfig && !postalConfig.pattern.test(postalCode.trim().toUpperCase())) {
      setFormatError(`Expected format: ${postalConfig.hint}`);
      return;
    }

    const isExcluded    = excludedCountries.includes(detectedCode);
    const checkResult: CheckResult = shipsWorldwide && !isExcluded ? 'available' : 'unavailable';
    setResult(checkResult);

    fetch(`${API_BASE_URL}/delivery-analytics/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        countryCode: detectedCode,
        countryName: detectedCountry?.name ?? detectedCode,
        postalCode:  postalCode.trim(),
        productId:   productId || '',
        result:      checkResult,
      }),
    }).catch(() => {});
  };

  const reset = () => {
    setResult(null);
    setPostalCode('');
    setDetectedCode('');
    setFormatError('');
  };

  return (
    <div className="overflow-hidden">
      <AnimatePresence mode="wait" initial={false}>

        {/* ── INPUT STATE ─────────────────────────────── */}
        {!result && (
          <motion.div
            key="input"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#888] shrink-0" strokeWidth={1.8} />
              <span className="text-[11px] font-semibold text-[#888] uppercase tracking-[0.08em] shrink-0">
                Check Delivery
              </span>

              <div className="flex-1 flex items-center border-b border-[#d1d5db] focus-within:border-[#111] transition-colors gap-1">
                {detectedCountry && (
                  <span className="text-sm leading-none select-none">{detectedCountry.flag}</span>
                )}
                <input
                  type="text"
                  value={postalCode}
                  onChange={e => handleInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCheck()}
                  placeholder="Postal / ZIP code"
                  className="flex-1 py-1 text-[12.5px] text-[#111] bg-transparent outline-none placeholder-[#bbb] min-w-0"
                />
              </div>

              <button
                onClick={handleCheck}
                disabled={!postalCode.trim()}
                className="text-[11px] font-semibold text-[#111] uppercase tracking-[0.08em] hover:text-[#555] disabled:opacity-30 disabled:cursor-not-allowed transition-colors shrink-0"
              >
                Check
              </button>
            </div>

            {/* Sub-line hints */}
            <AnimatePresence>
              {detectedCountry && !formatError && (
                <motion.p
                  key="hint"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="mt-1 ml-[calc(0.875rem+0.5rem+4.5rem)] text-[10.5px] text-[#aaa]"
                >
                  {detectedCountry.flag} {detectedCountry.name}
                </motion.p>
              )}
              {formatError && (
                <motion.p
                  key="error"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="mt-1 ml-[calc(0.875rem+0.5rem+4.5rem)] text-[10.5px] text-red-400 flex items-center gap-1"
                >
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  {formatError}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── RESULT STATE ────────────────────────────── */}
        {result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.26, ease: [0.4, 0, 0.2, 1] }}
            className="flex items-center gap-2"
          >
            <MapPin className="w-3.5 h-3.5 text-[#888] shrink-0" strokeWidth={1.8} />

            {result === 'available' ? (
              <span className="flex items-center gap-1.5 text-[12px] font-medium text-[#1a1a1a]">
                <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" strokeWidth={2} />
                Ships to {detectedCountry?.flag} {detectedCountry?.name}
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-[12px] font-medium text-[#1a1a1a]">
                <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" strokeWidth={2} />
                Not available for {detectedCountry?.flag} {detectedCountry?.name}
              </span>
            )}

            <button
              onClick={reset}
              className="ml-auto text-[10px] text-[#aaa] hover:text-[#555] uppercase tracking-[0.08em] transition-colors shrink-0"
            >
              Change
            </button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};

export default DeliveryChecker;
