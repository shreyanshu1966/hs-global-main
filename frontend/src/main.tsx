import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import "@fontsource/playfair-display"; // Defaults to weight 400
import "@fontsource/playfair-display/400-italic.css";
import "@fontsource/playfair-display/700.css";
import "@fontsource/inter";
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
import { PhoneVerificationProvider } from './contexts/PhoneVerificationContext';
import { SlabCustomizationProvider } from './contexts/SlabCustomizationContext';
import { SlabCustomizationModal } from './components/SlabCustomizationModal';
import { LocalizationProvider } from './contexts/LocalizationContext';
import { GoogleOAuthProvider } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '1047190342938-1234567890.apps.googleusercontent.com';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <LocalizationProvider>
        <CartProvider>
          <PhoneVerificationProvider>
            <SlabCustomizationProvider>
              <App />
              <SlabCustomizationModal />
            </SlabCustomizationProvider>
          </PhoneVerificationProvider>
        </CartProvider>
      </LocalizationProvider>
    </GoogleOAuthProvider>
  </StrictMode>
);
