import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './i18n'; 

// Register service worker for caching
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}
import { CartProvider } from './contexts/CartContext';
import { PhoneVerificationProvider } from './contexts/PhoneVerificationContext';
import { SlabCustomizationProvider } from './contexts/SlabCustomizationContext';
import { SlabCustomizationModal } from './components/SlabCustomizationModal';
import { LocalizationProvider } from './contexts/LocalizationContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
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
  </StrictMode>
);
