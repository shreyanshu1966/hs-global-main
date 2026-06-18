import type { Metadata } from 'next';
import galaryDetails from '@/static/galaryDetail';
import { SITE_NAME, SITE_URL } from '@/server/api';
import GalleryClient from './client';

type Params = { params: Promise<{ id: string }> };

// On-demand ISR: nothing pre-rendered at build; first request renders + caches.
// GalleryClient is ssr:false so there is no server-rendered content to justify
// pre-generating all 232 entries and blowing up the static worker's heap.
export const revalidate = 86400;
export const dynamicParams = true;
export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const details = galaryDetails.find((d) => d.id === parseInt(id));
  if (!details) return { title: 'Gallery Not Found', robots: { index: false, follow: true } };

  const title = `${details.title} — ${details.location} | ${SITE_NAME}`;
  const description = details.description;
  const canonical = `${SITE_URL}/gallery/${id}`;
  const image = details.images[0].startsWith('http')
    ? details.images[0]
    : `${SITE_URL}${details.images[0]}`;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [{ url: image, alt: title }],
    },
  };
}

export default async function Page({ params }: Params) {
  const { id } = await params;
  const details = galaryDetails.find((d) => d.id === parseInt(id));

  if (!details) return <GalleryClient />;

  const canonical = `${SITE_URL}/gallery/${id}`;

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Gallery', item: `${SITE_URL}/gallery` },
      { '@type': 'ListItem', position: 3, name: details.title, item: canonical },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <GalleryClient />
    </>
  );
}
