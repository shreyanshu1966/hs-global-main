'use client';
import { useEffect, useMemo, useState } from 'react';
import { Product, productService } from '../../services/productService';
import { getItsbitsProductImage } from './productData';
import { useHorizontalCarousel } from './useHorizontalCarousel';
import { useInView } from 'react-intersection-observer';

type CarouselSourceType = 'category' | 'tag' | 'manual';

interface VideoProductCarouselProps {
  title: string;
  ctaText?: string;
  ctaLink?: string;
  sourceType?: CarouselSourceType;
  manualProductIds?: string[];
  sourceCategory?: string;
  sourceTag?: string;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface VideoItem {
  id: string;
  title: string;
  videoUrl: string;
  image: string;
  href: string;
  category: string;
}

const VideoCarouselCard = ({ item }: { item: VideoItem }) => {
  const { ref, inView } = useInView({
    threshold: 0.35,
    rootMargin: '200px 0px',
    triggerOnce: false,
  });

  return (
    <div ref={ref} className="itsbits-rail-item itsbits-track-item-no-shrink">
      <a href={item.href} className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="relative aspect-video bg-slate-900">
          {inView ? (
            <video
              src={item.videoUrl}
              poster={item.image}
              className="h-full w-full object-cover"
              muted
              autoPlay
              loop
              playsInline
              preload="metadata"
            />
          ) : (
            <img
              src={item.image}
              alt={item.title}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          )}
        </div>
        <div className="p-3">
          <p className="line-clamp-1 text-sm font-semibold text-slate-900 group-hover:underline">{item.title}</p>
          <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">{item.category}</p>
        </div>
      </a>
    </div>
  );
};

const toVideoItem = (product: Product): VideoItem | null => {
  if (!product.hasVideo || !product.videoUrl) {
    return null;
  }

  const id = product.productId || product._id;
  return {
    id,
    title: product.name,
    videoUrl: product.videoUrl,
    image: getItsbitsProductImage(product),
    href: `/product/${id}`,
    category: product.subcategory || product.category || 'Product Video',
  };
};

const hasTag = (product: Product, tag: string): boolean => {
  const expected = tag.trim().toLowerCase();
  if (!expected) {
    return true;
  }
  return (product.tags || []).some((item) => String(item || '').trim().toLowerCase() === expected);
};

const VideoProductCarousel = ({
  title,
  ctaText = '',
  ctaLink = '',
  sourceType = 'category',
  manualProductIds = [],
  sourceCategory = '',
  sourceTag = '',
  limit = 0,
  sortBy = '',
  sortOrder = 'desc',
}: VideoProductCarouselProps) => {
  const { trackRef, canScrollPrev, canScrollNext, scrollPrev, scrollNext } = useHorizontalCarousel(0.9);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const manualIdsKey = useMemo(() => manualProductIds.join('|'), [manualProductIds]);

  useEffect(() => {
    let isActive = true;
    setIsLoading(true);

    const loadVideos = async () => {
      try {
        let products: Product[] = [];

        if (sourceType === 'manual' && manualProductIds.length > 0) {
          const results = await Promise.all(
            manualProductIds.map(async (id) => {
              try {
                const response = await productService.getProductById(id);
                return response.success ? response.data?.product || null : null;
              } catch {
                return null;
              }
            })
          );
          products = results.filter(Boolean) as Product[];
        } else if (sourceType === 'category' && sourceCategory) {
          const response = await productService.getProductsByCategory(sourceCategory, {
            limit: Math.min(50, Math.max(limit * 3, limit)),
            sortBy,
            sortOrder,
          });
          if (response.success && Array.isArray(response.data.products)) {
            products = response.data.products;
          }
        } else {
          const response = await productService.getAllProducts({
            limit: Math.min(80, Math.max(limit * 4, limit)),
            sortBy,
            sortOrder,
          });

          if (response.success && Array.isArray(response.data)) {
            products = response.data;
          }
        }

        let filtered = products;
        if (sourceType === 'tag' && sourceTag.trim()) {
          filtered = products.filter((product) => hasTag(product, sourceTag));
        }

        const videoItems = filtered
          .map(toVideoItem)
          .filter(Boolean) as VideoItem[];

        if (!isActive) {
          return;
        }

        setVideos(videoItems.slice(0, limit));
      } catch (error) {
        console.error('Failed to load product videos for homepage carousel:', error);
        if (isActive) {
          setVideos([]);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadVideos();

    return () => {
      isActive = false;
    };
  }, [sourceType, manualIdsKey, sourceCategory, sourceTag, limit, sortBy, sortOrder, manualProductIds]);

  const items = videos;

  return (
    <section>
      <div className="itsbits-section-header itsbits-carousel-header">
        <h2 className="dibs-section-title">{title}</h2>
        <a href={ctaLink} className="itsbits-carousel-link">
          <span>{ctaText}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M8 5l8 7-8 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </div>

      <div className="itsbits-section-rail itsbits-carousel-rail">
        <div className="relative">
          <button
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            className="itsbits-arrow itsbits-arrow-left hidden md:flex"
            aria-label={`Previous ${title}`}
          >
            <svg width="30" height="30" viewBox="0 0 40 40" fill="currentColor">
              <path d="m22.762 32-9.828-12 9.828-12 2.477 2.014L17.069 20l8.17 9.986L22.762 32Z" />
            </svg>
          </button>

          <div className="itsbits-rail-shell">
            <div ref={trackRef} className="itsbits-track itsbits-track-standard overflow-x-auto scroll-smooth">
              {isLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={`video-skeleton-${i}`} className="itsbits-rail-item itsbits-track-item-no-shrink">
                      <div className="dibs-skeleton" style={{ width: '100%', aspectRatio: '16 / 9', marginBottom: '10px' }} />
                      <div className="dibs-skeleton" style={{ width: '86%', height: '16px', marginBottom: '6px' }} />
                      <div className="dibs-skeleton" style={{ width: '52%', height: '14px' }} />
                    </div>
                  ))
                : items.map((item) => <VideoCarouselCard key={item.id} item={item} />)}
            </div>
            <div className="itsbits-swipe-cue md:hidden" aria-hidden="true">Swipe</div>
          </div>

          <button
            onClick={scrollNext}
            disabled={!canScrollNext}
            className="itsbits-arrow itsbits-arrow-right hidden md:flex"
            aria-label={`Next ${title}`}
          >
            <svg width="30" height="30" viewBox="0 0 40 40" fill="currentColor">
              <path d="m17.238 32-2.476-2.014L22.934 20l-8.172-9.986L17.238 8l9.828 12-9.828 12Z" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default VideoProductCarousel;
