'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';

interface HeroSlide {
  heading?: string;
  subheading?: string;
  ctaText?: string;
  ctaLink?: string;
  backgroundImage?: string;
  overlayOpacity?: number;
}

interface HeroSectionProps {
  slides?: HeroSlide[];
  autoplayInterval?: number;
}

const HeroSection = ({ slides = [], autoplayInterval = 5000 }: HeroSectionProps) => {
  const [active, setActive] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const count = slides.length;

  const goTo = useCallback(
    (index: number) => {
      if (transitioning || count <= 1) return;
      setTransitioning(true);
      setTimeout(() => {
        setActive(index);
        setTransitioning(false);
      }, 400);
    },
    [transitioning, count]
  );

  const next = useCallback(() => goTo((active + 1) % count), [active, count, goTo]);
  const prev = useCallback(() => goTo((active - 1 + count) % count), [active, count, goTo]);

  // Autoplay
  useEffect(() => {
    if (count <= 1 || autoplayInterval <= 0) return;
    timerRef.current = setTimeout(next, autoplayInterval);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [active, count, autoplayInterval, next]);

  if (count === 0) return null;

  const slide = slides[active] || {};
  const overlay = `rgba(0,0,0,${Math.min(1, Math.max(0, slide.overlayOpacity ?? 0.5))})`;

  return (
    <section
      className="relative w-full flex items-center justify-center overflow-hidden"
      style={{ minHeight: 'min(90vh, 720px)' }}
    >
      {/* Background images — all mounted, active one is visible */}
      {slides.map((s, i) =>
        s.backgroundImage ? (
          <div
            key={i}
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: i === active ? 1 : 0, zIndex: 0 }}
            aria-hidden={i !== active}
          >
            {!s.backgroundImage.startsWith('data:') ? (
              <Image
                fill
                src={s.backgroundImage}
                alt={s.heading || ''}
                className="object-cover"
                sizes="100vw"
                priority={i === 0}
              />
            ) : (
              <img
                src={s.backgroundImage}
                alt={s.heading || ''}
                className="absolute inset-0 w-full h-full object-cover"
                loading={i === 0 ? 'eager' : 'lazy'}
              />
            )}
          </div>
        ) : null
      )}

      {/* Overlay */}
      <div
        className="absolute inset-0 transition-all duration-700"
        style={{ background: overlay, zIndex: 1 }}
        aria-hidden="true"
      />

      {/* Content */}
      <div
        className="relative w-full max-w-4xl mx-auto px-6 md:px-12 text-center py-20"
        style={{
          zIndex: 2,
          opacity: transitioning ? 0 : 1,
          transition: 'opacity 0.4s ease',
        }}
      >
        {slide.heading && (
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight drop-shadow-lg">
            {slide.heading}
          </h1>
        )}
        {slide.subheading && (
          <p className="mt-5 text-base md:text-lg text-white/85 max-w-2xl mx-auto leading-relaxed drop-shadow">
            {slide.subheading}
          </p>
        )}
        {slide.ctaText && slide.ctaLink && (
          <div className="mt-8">
            <a
              href={slide.ctaLink}
              className="inline-block px-8 py-3.5 bg-white text-gray-900 font-semibold text-sm rounded-full hover:bg-gray-100 transition-colors shadow-lg"
            >
              {slide.ctaText}
            </a>
          </div>
        )}
      </div>

      {/* Prev / Next arrows — only when multiple slides */}
      {count > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Previous slide"
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center text-white transition-colors backdrop-blur-sm"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            onClick={next}
            aria-label="Next slide"
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center text-white transition-colors backdrop-blur-sm"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </>
      )}

      {/* Dot indicators */}
      {count > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${
                i === active ? 'w-6 h-2.5 bg-white' : 'w-2.5 h-2.5 bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default HeroSection;
