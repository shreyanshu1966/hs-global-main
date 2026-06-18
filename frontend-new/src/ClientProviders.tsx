'use client';
/**
 * Replicates the exact provider tree from the Vite app's main.tsx + App.tsx,
 * plus the shared <Layout> (Header/Footer), SmoothScroll, ScrollToTop and the
 * global modals — so the migrated pages render identically.
 */
import { useEffect } from 'react';
import axios from 'axios';
import { HelmetProvider } from 'react-helmet-async';
import { GoogleOAuthProvider } from '@react-oauth/google';

import '@/i18n';

import { LocalizationProvider } from '@/contexts/LocalizationContext';
import { RegionProvider } from '@/contexts/RegionContext';
import { CartProvider } from '@/contexts/CartContext';
import { WishlistProvider } from '@/contexts/WishlistContext';
import { PhoneVerificationProvider } from '@/contexts/PhoneVerificationContext';
import { SlabCustomizationProvider } from '@/contexts/SlabCustomizationContext';
import { StoneQuotationProvider } from '@/contexts/StoneQuotationContext';
import { CurrencyProvider } from '@/contexts/CurrencyContext';
import { AuthProvider } from '@/contexts/AuthContext';

import { SlabCustomizationModal } from '@/components/SlabCustomizationModal';
import { StoneQuotationModal } from '@/components/StoneQuotationModal';
import Layout from '@/components/Layout';
import ScrollToTop from '@/components/ScrollToTop';
import SmoothScroll from '@/components/SmoothScroll';

const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '1047190342938-1234567890.apps.googleusercontent.com';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // 401 → clear auth (ported from main.tsx).
    const id = axios.interceptors.response.use(
      (r) => r,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('authUser');
          window.dispatchEvent(new Event('auth-change'));
          if (window.location.pathname.startsWith('/admin')) window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(id);
  }, []);

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <LocalizationProvider>
        <RegionProvider>
          <CartProvider>
            <WishlistProvider>
              <PhoneVerificationProvider>
                <SlabCustomizationProvider>
                  <StoneQuotationProvider>
                    <HelmetProvider>
                      <CurrencyProvider>
                        <AuthProvider>
                          <SmoothScroll>
                            <ScrollToTop />
                            <Layout>{children}</Layout>
                          </SmoothScroll>
                        </AuthProvider>
                      </CurrencyProvider>
                    </HelmetProvider>
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
  );
}
