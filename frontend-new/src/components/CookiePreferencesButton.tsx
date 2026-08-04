'use client';

import { OPEN_COOKIE_PREFERENCES_EVENT } from '@/components/CookieConsent';

export default function CookiePreferencesButton() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_COOKIE_PREFERENCES_EVENT))}
      className="mt-3 inline-block border border-[#111827] px-4 py-2 text-sm text-[#111827] transition-colors hover:bg-[#f1f5f9]"
    >
      Manage cookie preferences
    </button>
  );
}
