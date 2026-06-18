'use client';
import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useHorizontalCarousel } from '../itsbits/useHorizontalCarousel';
import ItsbitsProductCard from '../itsbits/ProductCard';

interface CompactCarouselProps {
  title: string;
  products: any[];
  viewAllLink?: string;
}

// Map the full product DB shape → itsbits ProductCard props
function toCardProps(p: any) {
  const id = String(p.productId || p._id || p.id || '');
  const image =
    (p.images && p.images[0]) || p.image || '/demo2.webp';
  const title = p.name || '';
  const designer =
    p.category
      ? `${p.category}${p.subcategory ? ` · ${p.subcategory}` : ''}`
      : '';
  const productLink = `/product/${id}`;

  return {
    id,
    image,
    title,
    designer,
    productLink,
    priceUSD: p.priceUSD,
    regionalPricing: p.regionalPricing,
    discount: p.discount,
    averageRating: p.averageRating,
    totalReviews: p.totalReviews,
  };
}

export function CompactCarousel({ title, products, viewAllLink }: CompactCarouselProps) {
  const { trackRef, canScrollPrev, canScrollNext, scrollPrev, scrollNext } =
    useHorizontalCarousel(0.88);

  // Autoplay with pause-on-interaction
  const pausedRef = useRef(false);
  const resumeRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || products.length <= 1) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const pause = () => {
      pausedRef.current = true;
      if (resumeRef.current) clearTimeout(resumeRef.current);
      resumeRef.current = setTimeout(() => { pausedRef.current = false; }, 1800);
    };

    const step = () => {
      if (pausedRef.current) return;
      const maxScroll = track.scrollWidth - track.clientWidth;
      if (maxScroll <= 0) return;
      const card = track.firstElementChild as HTMLElement | null;
      const stride = (card ? card.offsetWidth : 200) + 16;
      const next = track.scrollLeft + stride;
      track.scrollTo({ left: next >= maxScroll - 8 ? 0 : next, behavior: 'smooth' });
    };

    track.addEventListener('pointerdown', pause, { passive: true });
    track.addEventListener('wheel',       pause, { passive: true });
    track.addEventListener('touchstart',  pause, { passive: true });
    const id = setInterval(step, 2800);

    return () => {
      clearInterval(id);
      if (resumeRef.current) clearTimeout(resumeRef.current);
      track.removeEventListener('pointerdown', pause);
      track.removeEventListener('wheel',       pause);
      track.removeEventListener('touchstart',  pause);
    };
  }, [products.length, trackRef]);

  if (!products?.length) return null;

  return (
    <div className="py-10 lg:py-12">
      <div className="container mx-auto px-6">

        {/* Header — matches home carousel style */}
        <div className="flex items-baseline justify-between mb-6">
          <h2
            className="font-serif font-normal text-[#222] leading-tight"
            style={{ fontSize: 'clamp(18px, 2vw, 22px)' }}
          >
            {title}
          </h2>
          {viewAllLink && (
            <Link
              to={viewAllLink}
              className="flex items-center gap-1 text-[10.5px] uppercase tracking-[0.14em] text-[#888] hover:text-[#111] underline underline-offset-2 transition-colors"
            >
              View All
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M8 5l8 7-8 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          )}
        </div>

        {/* Track + arrows */}
        <div className="relative">

          {/* Prev */}
          <button
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            aria-label="Previous"
            className="hidden md:flex absolute -left-4 top-[38%] -translate-y-1/2 z-10 w-[38px] h-[38px] rounded-full items-center justify-center border border-[rgba(34,34,34,0.18)] bg-[rgba(255,255,255,0.86)] backdrop-blur-sm shadow-sm hover:bg-white hover:border-[rgba(34,34,34,0.45)] disabled:opacity-0 disabled:pointer-events-none transition-all duration-150"
          >
            <svg width="18" height="18" viewBox="0 0 40 40" fill="currentColor">
              <path d="m22.762 32-9.828-12 9.828-12 2.477 2.014L17.069 20l8.17 9.986L22.762 32Z" />
            </svg>
          </button>

          {/* Scrollable track — no scrollbar, snap */}
          <div
            ref={trackRef}
            className="flex gap-4 overflow-x-auto pb-1"
            style={{
              scrollSnapType: 'x mandatory',
              scrollbarWidth: 'none',
              // @ts-ignore
              msOverflowStyle: 'none',
            }}
          >
            {products.map((p, i) => {
              const cardProps = toCardProps(p);
              return (
                <div
                  key={cardProps.id || i}
                  style={{
                    width: 'clamp(160px, 16vw, 200px)',
                    minWidth: 'clamp(160px, 16vw, 200px)',
                    flexShrink: 0,
                    scrollSnapAlign: 'start',
                  }}
                >
                  <ItsbitsProductCard {...cardProps} />
                </div>
              );
            })}
          </div>

          {/* Hide webkit scrollbar via inline style */}
          <style>{`.cc-track::-webkit-scrollbar{display:none}`}</style>

          {/* Swipe cue — mobile */}
          <p className="md:hidden mt-1.5 text-right text-[10px] uppercase tracking-[0.16em] text-[#ccc]">
            Swipe
          </p>

          {/* Next */}
          <button
            onClick={scrollNext}
            disabled={!canScrollNext}
            aria-label="Next"
            className="hidden md:flex absolute -right-4 top-[38%] -translate-y-1/2 z-10 w-[38px] h-[38px] rounded-full items-center justify-center border border-[rgba(34,34,34,0.18)] bg-[rgba(255,255,255,0.86)] backdrop-blur-sm shadow-sm hover:bg-white hover:border-[rgba(34,34,34,0.45)] disabled:opacity-0 disabled:pointer-events-none transition-all duration-150"
          >
            <svg width="18" height="18" viewBox="0 0 40 40" fill="currentColor">
              <path d="m17.238 32-2.476-2.014L22.934 20l-8.172-9.986L17.238 8l9.828 12-9.828 12Z" />
            </svg>
          </button>

        </div>
      </div>
    </div>
  );
}
