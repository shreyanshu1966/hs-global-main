'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import blogService, { Blog } from '../../services/blogService';
import { STATIC_BLOGS } from '../../data/staticBlogs';

interface JournalArticle {
  title: string;
  image: string;
  link: string;
  ctaText: string;
  imageAlt: string;
  layout: 'landscape' | 'portrait';
}

interface IntrospectiveMagazineProps {
  titlePrefix?: string;
  titleSuffix?: string;
  articles?: JournalArticle[];
}

/** Map a blog post to the journal card shape used by this section. */
const blogToArticle = (blog: Blog): JournalArticle => ({
  title: blog.title,
  image: blog.featuredImage,
  link: `/blog/${blog.slug}`,
  ctaText: 'Read Article',
  imageAlt: blog.title,
  layout: 'landscape',
});

/** Newest first, using publishedAt and falling back to createdAt. */
const blogDate = (blog: Blog): number =>
  new Date(blog.publishedAt || blog.createdAt || 0).getTime();

const IntrospectiveMagazine = ({
  titlePrefix = '',
  titleSuffix = '',
  articles = [],
}: IntrospectiveMagazineProps) => {
  // Show the latest blog posts here. Start with any configured articles so the
  // section still renders before/if the blog fetch resolves.
  const [items, setItems] = useState<JournalArticle[]>(articles);

  useEffect(() => {
    let mounted = true;

    const loadBlogs = async () => {
      try {
        const { blogs } = await blogService.getAllBlogs({ limit: 6, sort: '-publishedAt' });
        // Merge DB blogs with the hand-authored static posts, de-duped by slug.
        const merged = [
          ...STATIC_BLOGS,
          ...blogs.filter((b) => !STATIC_BLOGS.some((s) => s.slug === b.slug)),
        ]
          .sort((a, b) => blogDate(b) - blogDate(a))
          .slice(0, 2)
          .map(blogToArticle);

        if (mounted && merged.length > 0) {
          setItems(merged);
        }
      } catch {
        // Keep the configured articles if blogs cannot be fetched.
      }
    };

    loadBlogs();

    return () => {
      mounted = false;
    };
  }, []);

  const first = items[0];
  const second = items[1];

  return (
    <section className="itsbits-section-rail itsbits-journal-section">

      {/* Header */}
      <div className="itsbits-journal-header">
        <h2 className="dibs-section-title itsbits-journal-heading">
          <span className="itsbits-journal-heading-em">{titlePrefix}</span>
          <span> {titleSuffix}</span>
        </h2>
      </div>

      {/* spacer */}
      <div />

      {/* Grid */}
      <div className="itsbits-journal-grid itsbits-journal-grid-gap">

        {first && (
        <a href={first.link} className="group itsbits-journal-article-link">
          <div className="itsbits-journal-landscape itsbits-journal-media-wrap">
            <Image
              fill
              src={first.image}
              alt={first.imageAlt || first.title}
              className="itsbits-journal-media group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <h3 className="itsbits-journal-title itsbits-journal-title-base">
            {first.title}
          </h3>
          <div className="itsbits-journal-link itsbits-journal-link-base">
            {first.ctaText}
          </div>
        </a>
        )}

        {second && (
        <a href={second.link} className="group itsbits-journal-article-link">
          <div className="itsbits-journal-landscape itsbits-journal-media-wrap">
            <Image
              fill
              src={second.image}
              alt={second.imageAlt || second.title}
              className="itsbits-journal-media group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <h3 className="itsbits-journal-title itsbits-journal-title-base">
            {second.title}
          </h3>
          <div className="itsbits-journal-link itsbits-journal-link-base">
            {second.ctaText}
          </div>
        </a>
        )}

      </div>
    </section>
  );
};

export default IntrospectiveMagazine;
