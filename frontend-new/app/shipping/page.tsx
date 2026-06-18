import type { Metadata } from 'next';
import { getPageSeo, absoluteImage, SITE_NAME, SITE_URL } from '@/server/api';
import Client from './client';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo('/shipping');
  const title =
    seo?.title ?? `Worldwide Shipping & Export Logistics | ${SITE_NAME}`;
  const description =
    seo?.description ??
    'Worldwide shipping for granite and marble: export logistics, secure packaging, customs support and reliable delivery to the USA, UK and beyond.';
  const canonical = seo?.canonical ?? `${SITE_URL}/shipping`;
  const image = seo?.image ? absoluteImage(seo.image) : `${SITE_URL}/og-image.jpg`;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, images: [{ url: image, width: 1200, height: 630, alt: SITE_NAME }] },
    twitter: { card: 'summary_large_image', title, description, images: [{ url: image, alt: SITE_NAME }] },
  };
}

export default function Page() {
  return <Client />;
}
