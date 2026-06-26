import type { Metadata } from 'next';
import { getPageSeo, absoluteImage, SITE_NAME, SITE_URL } from '@/server/api';
import Client from './client';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo('/about');
  const title =
    seo?.title || `About Us | Premium Marble & Granite Manufacturer — ${SITE_NAME}`;
  const description =
    seo?.description ||
    `${SITE_NAME} is a leading manufacturer and exporter of premium marble and granite products, delivering handcrafted stone solutions to the USA, UK and worldwide since our founding in India.`;
  const canonical = seo?.canonical || `${SITE_URL}/about`;
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
      <h1 className="sr-only">About HS Global Export — Our Story, Vision &amp; Heritage</h1>
      <Client />
    </>
  );
}
