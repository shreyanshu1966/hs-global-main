import type { Metadata } from 'next';
import { getPageSeo, absoluteImage, SITE_NAME, SITE_URL } from '@/server/api';
import Client from './client';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo('/gallery');
  const title =
    seo?.title ?? `Marble & Granite Project Gallery | ${SITE_NAME}`;
  const description =
    seo?.description ??
    'Browse our gallery of premium marble and granite installations — luxury stone countertops, art pieces and bespoke projects delivered worldwide.';
  const canonical = seo?.canonical ?? `${SITE_URL}/gallery`;
  const image = seo?.image ? absoluteImage(seo.image) : `${SITE_URL}/og-image.jpg`;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    openGraph: { type: 'website', siteName: SITE_NAME, title, description, url: canonical, images: [{ url: image, width: 1200, height: 630, alt: SITE_NAME }] },
    twitter: { card: 'summary_large_image', title, description, images: [{ url: image, alt: SITE_NAME }] },
  };
}

export default function Page() {
  return (
    <>
      <h1 className="sr-only">Luxury Marble &amp; Granite Project Gallery — HS Global Export</h1>
      <Client />
    </>
  );
}
