import type { Metadata } from 'next';
import { Suspense } from 'react';
import '@/index.css';
import ClientProviders from '@/ClientProviders';
import { SITE_NAME, SITE_URL } from '@/server/api';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Marble & Granite Furniture Manufacturer & Exporter | HS Global Export',
    template: `%s | ${SITE_NAME}`,
  },
  description:
    'HS Global Export — premium granite & marble solutions. Handcrafted products with worldwide delivery to the USA, UK and beyond.',
  alternates: { canonical: '/' },
  openGraph: { type: 'website', siteName: SITE_NAME, url: SITE_URL, images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: SITE_NAME }] },
  twitter: { card: 'summary_large_image', images: [{ url: '/og-image.jpg', alt: SITE_NAME }] },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* Suspense boundary required because the router shim uses
            useSearchParams (CSR bailout) — keeps the rest statically renderable. */}
        <Suspense>
          <ClientProviders>{children}</ClientProviders>
        </Suspense>
      </body>
    </html>
  );
}
