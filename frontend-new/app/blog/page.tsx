import type { Metadata } from 'next';
import { getAllBlogs, getPageSeo, absoluteImage, SITE_NAME, SITE_URL } from '@/server/api';
import Client from './client';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo('/blog');
  const title =
    seo?.title || `Marble & Granite Blog — Design Trends & Industry Insights | ${SITE_NAME}`;
  const description =
    seo?.description ||
    'Expert articles on marble and granite design trends, stone care tips, export insights and product updates from HS Global Export.';
  const canonical = seo?.canonical || `${SITE_URL}/blog`;
  const image = seo?.image ? absoluteImage(seo.image) : `${SITE_URL}/og-image.jpg`;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    openGraph: { type: 'website', siteName: SITE_NAME, title, description, url: canonical, images: [{ url: image, width: 1200, height: 630, alt: SITE_NAME }] },
    twitter: { card: 'summary_large_image', title, description, images: [{ url: image, alt: SITE_NAME }] },
  };
}

export default async function Page() {
  const blogs = await getAllBlogs();
  return (
    <>
      <h1 className="sr-only">Marble &amp; Granite Blog — Design Trends &amp; Industry Insights</h1>
      <Client initialBlogs={blogs} />
    </>
  );
}
