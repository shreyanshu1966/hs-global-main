import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import "@fontsource/inter";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import './i18n';

// Unregister any existing service workers to fix caching issues
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (let registration of registrations) {
      registration.unregister().then(
        (success) => console.log('ServiceWorker unregistered: ', success)
      );
    }
  }).catch((err) => {
    console.log('Service Worker unregistration failed: ', err);
  });
}
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { PhoneVerificationProvider } from './contexts/PhoneVerificationContext';
import { SlabCustomizationProvider } from './contexts/SlabCustomizationContext';
import { SlabCustomizationModal } from './components/SlabCustomizationModal';
import { StoneQuotationProvider } from './contexts/StoneQuotationContext';
import { StoneQuotationModal } from './components/StoneQuotationModal';
import { LocalizationProvider } from './contexts/LocalizationContext';
import { RegionProvider } from './contexts/RegionContext';
import { GoogleOAuthProvider } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '1047190342938-1234567890.apps.googleusercontent.com';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <LocalizationProvider>
        <RegionProvider>
          <CartProvider>
            <WishlistProvider>
            <PhoneVerificationProvider>
              <SlabCustomizationProvider>
                <StoneQuotationProvider>
                  <App />
                  <SlabCustomizationModal />
                  <StoneQuotationModal />
                </StoneQuotationProvider>
              </SlabCustomizationProvider>
            </PhoneVerificationProvider>
            </WishlistProvider>
          </CartProvider>
        </RegionProvider>
      </LocalizationProvider>
    </GoogleOAuthProvider>
  </StrictMode>
);
