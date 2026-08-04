'use client';

import { useEffect, useState } from 'react';
import { GoogleAnalytics } from '@next/third-parties/google';

const STORAGE_KEY = 'hs-cookie-consent';
type Consent = 'accepted' | 'rejected';

// Other parts of the app (e.g. the Cookie Policy page) can re-open the banner
// so visitors can change or withdraw consent at any time.
export const OPEN_COOKIE_PREFERENCES_EVENT = 'open-cookie-preferences';

export default function CookieConsent({ gaId }: { gaId: string }) {
  const [consent, setConsent] = useState<Consent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(STORAGE_KEY);
    } catch {
      // localStorage unavailable (private mode / blocked) — treat as no choice yet
    }
    if (stored === 'accepted' || stored === 'rejected') {
      setConsent(stored);
    } else {
      setVisible(true);
    }

    const reopen = () => setVisible(true);
    window.addEventListener(OPEN_COOKIE_PREFERENCES_EVENT, reopen);
    return () => window.removeEventListener(OPEN_COOKIE_PREFERENCES_EVENT, reopen);
  }, []);

  const choose = (value: Consent) => {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // ignore write failures
    }
    setConsent(value);
    setVisible(false);
  };

  return (
    <>
      {/* Analytics loads only after explicit consent */}
      {consent === 'accepted' && <GoogleAnalytics gaId={gaId} />}

      {visible && (
        <div
          role="dialog"
          aria-live="polite"
          aria-label="Cookie consent"
          className="fixed inset-x-0 bottom-0 z-[9999] border-t border-[#e2e8f0] bg-white px-5 py-4 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] sm:px-8"
        >
          <div className="mx-auto flex max-w-5xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm leading-relaxed text-gray-700">
              We use essential cookies to run this site and, with your consent, analytics cookies to understand how
              it is used. See our{' '}
              <a href="/cookies" className="underline">Cookie Policy</a>.
            </p>
            <div className="flex shrink-0 gap-3">
              <button
                type="button"
                onClick={() => choose('rejected')}
                className="border border-[#111827] px-4 py-2 text-sm text-[#111827] transition-colors hover:bg-[#f1f5f9]"
              >
                Reject non-essential
              </button>
              <button
                type="button"
                onClick={() => choose('accepted')}
                className="bg-[#111827] px-4 py-2 text-sm text-white transition-colors hover:bg-[#334155]"
              >
                Accept all
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
