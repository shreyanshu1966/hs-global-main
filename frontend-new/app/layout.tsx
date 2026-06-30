import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Inter } from 'next/font/google';
import '@/index.css';
import ClientProviders from '@/ClientProviders';
import CookieConsent from '@/components/CookieConsent';
import { SITE_NAME, SITE_URL } from '@/server/api';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Marble & Granite Furniture Manufacturer & Exporter | HS Global Export',
    template: `%s | ${SITE_NAME}`,
  },
  description:
    'HS Global Export — premium granite & marble solutions. Handcrafted products with worldwide delivery to the USA, UK and beyond.',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    url: SITE_URL,
    title: 'Marble & Granite Furniture Manufacturer & Exporter | HS Global Export',
    description: 'HS Global Export — premium granite & marble solutions. Handcrafted products with worldwide delivery to the USA, UK and beyond.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Marble & Granite Furniture Manufacturer & Exporter | HS Global Export',
    description: 'HS Global Export — premium granite & marble solutions. Handcrafted products with worldwide delivery to the USA, UK and beyond.',
    images: [{ url: '/og-image.jpg', alt: SITE_NAME }],
  },
  robots: { index: true, follow: true },
  icons: {
    icon: '/logo.svg',
    shortcut: '/logo.svg',
    apple: '/logo.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/* Preconnect only to origins that load resources in the critical path */}
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        {/* ipapi.co removed: geolocation is loaded lazily on user interaction,
            not in the critical path — preconnecting wasted a slot and could
            add latency if the external service is slow. */}
      </head>
      <body>
        {/* Suspense boundary required because the router shim uses
            useSearchParams (CSR bailout) — keeps the rest statically renderable. */}
        <Suspense>
          <ClientProviders>{children}</ClientProviders>
        </Suspense>
        <CookieConsent gaId="G-LDEFWLFCYY" />
      </body>
    </html>
  );
}
