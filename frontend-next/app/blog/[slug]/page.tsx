import type { Metadata } from 'next';
import { getBlog, SITE_NAME, SITE_URL } from '@/server/api';
import BlogClient from './client';

type Params = { params: Promise<{ slug: string }> };

export const revalidate = 3600;
export const dynamicParams = true;
export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const data = await getBlog(slug);
  if (!data) return { title: 'Blog Not Found', robots: { index: false, follow: true } };

  const { blog } = data;
  const title = blog.seo?.metaTitle || blog.title;
  const description = blog.seo?.metaDescription || blog.excerpt;
  const image = blog.featuredImage || `${SITE_URL}/og-image.jpg`;
  const canonical = `${SITE_URL}/blog/${slug}`;

  return {
    title: { absolute: `${title} | ${SITE_NAME}` },
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'article',
      publishedTime: blog.publishedAt,
      modifiedTime: blog.updatedAt,
      authors: [blog.author.name],
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
  const { slug } = await params;
  const data = await getBlog(slug);

  if (!data) return <BlogClient />;

  const { blog } = data;
  const canonical = `${SITE_URL}/blog/${slug}`;

  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: blog.title,
    description: blog.excerpt,
    image: blog.featuredImage || `${SITE_URL}/og-image.jpg`,
    author: { '@type': 'Person', name: blog.author.name },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/og-image.jpg` },
    },
    datePublished: blog.publishedAt,
    dateModified: blog.updatedAt || blog.publishedAt,
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
      { '@type': 'ListItem', position: 3, name: blog.title, item: canonical },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <BlogClient initialData={data} />
    </>
  );
}
