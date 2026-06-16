import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enTranslation from './locales/en/translation.json';
import esTranslation from './locales/es/translation.json';
import frTranslation from './locales/fr/translation.json';
import deTranslation from './locales/de/translation.json';
import arTranslation from './locales/ar/translation.json';
import hiTranslation from './locales/hi/translation.json';

const isBrowser = typeof window !== 'undefined';

// LanguageDetector reads navigator/document.cookie → only use it in the browser.
// On the server we render the default language ('en') so SSR is deterministic
// and matches the initial client render (avoids hydration mismatch).
const instance = i18n.use(initReactI18next);
if (isBrowser) instance.use(LanguageDetector);

instance.init({
  resources: {
    en: { translation: enTranslation },
    es: { translation: esTranslation },
    fr: { translation: frTranslation },
    de: { translation: deTranslation },
    ar: { translation: arTranslation },
    hi: { translation: hiTranslation },
  },
  fallbackLng: 'en',
  lng: isBrowser ? undefined : 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;