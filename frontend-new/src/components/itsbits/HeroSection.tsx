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
  const [prev, setPrev] = useState<number | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const [hovered, setHovered] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const count = slides.length;

  const goTo = useCallback(
    (index: number) => {
      if (transitioning || count <= 1 || index === active) return;
      setTransitioning(true);
      setPrev(active);
      setActive(index);
      setTimeout(() => {
        setPrev(null);
        setTransitioning(false);
      }, 900);
    },
    [transitioning, count, active]
  );

  const next = useCallback(() => goTo((active + 1) % count), [active, count, goTo]);
  const prevSlide = useCallback(() => goTo((active - 1 + count) % count), [active, count, goTo]);

  useEffect(() => {
    if (count <= 1 || autoplayInterval <= 0) return;
    timerRef.current = setTimeout(next, autoplayInterval);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [active, count, autoplayInterval, next]);

  if (count === 0) return null;

  return (
    <section
      className="hero-section"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label="Hero banner"
    >
      {/* Slides */}
      {slides.map((s, i) =>
        s.backgroundImage ? (
          <div
            key={i}
            className={`hero-slide ${i === active ? 'hero-slide--active' : ''} ${i === prev ? 'hero-slide--prev' : ''}`}
            aria-hidden={i !== active}
          >
            {!s.backgroundImage.startsWith('data:') ? (
              <Image
                fill
                src={s.backgroundImage}
                alt={s.heading || 'HS Global Export banner'}
                className="hero-image"
                sizes="(max-width: 768px) 100vw, (max-width: 1920px) 100vw, 1920px"
                priority={i === 0}
                quality={100}
              />
            ) : (
              <img
                src={s.backgroundImage}
                alt={s.heading || 'HS Global Export banner'}
                className="hero-image-fallback"
                loading={i === 0 ? 'eager' : 'lazy'}
              />
            )}
          </div>
        ) : null
      )}

      {/* Arrows — appear on hover, only when multiple slides */}
      {count > 1 && (
        <>
          <button
            onClick={prevSlide}
            aria-label="Previous slide"
            className={`hero-arrow hero-arrow--left ${hovered ? 'hero-arrow--visible' : ''}`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            onClick={next}
            aria-label="Next slide"
            className={`hero-arrow hero-arrow--right ${hovered ? 'hero-arrow--visible' : ''}`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </>
      )}

      {/* Dot / pill indicators */}
      {count > 1 && (
        <div className="hero-dots">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`hero-dot ${i === active ? 'hero-dot--active' : ''}`}
            />
          ))}
        </div>
      )}

      <style>{`
        .hero-section {
          position: relative;
          width: 100%;
          /* 21:9 cinematic ratio — industry standard for wide e-commerce banners.
             At 1540px wide  →  660px tall  (~84% of a 788px viewport). Perfect.
             At 1920px wide  →  823px tall. Still fits comfortably. */
          aspect-ratio: 21 / 9;
          /* Hard ceiling so it never overflows on any screen */
          max-height: 85vh;
          overflow: hidden;
          background: #0a0a0a;
        }

        /* Mobile: 4:3 feels natural on portrait phones */
        @media (max-width: 640px) {
          .hero-section {
            aspect-ratio: 4 / 3;
            max-height: 75vw;
          }
        }

        /* ---- Slides — clean crossfade only, no zoom/pan ---- */
        .hero-slide {
          position: absolute;
          inset: 0;
          opacity: 0;
          z-index: 0;
          transition: opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1);
          will-change: opacity;
        }

        .hero-slide--active {
          opacity: 1;
          z-index: 1;
        }

        .hero-slide--prev {
          opacity: 0;
          z-index: 0;
        }

        /* ---- Images ---- */
        .hero-image {
          object-fit: cover;
          object-position: center center;
        }

        .hero-image-fallback {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center center;
        }

        /* ---- Arrows ---- */
        .hero-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 20;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.35);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          opacity: 0;
          transition: opacity 0.3s ease, background 0.25s ease, transform 0.25s ease;
          pointer-events: none;
        }

        .hero-arrow--visible {
          opacity: 1;
          pointer-events: auto;
        }

        .hero-arrow--left {
          left: clamp(12px, 3vw, 40px);
        }

        .hero-arrow--right {
          right: clamp(12px, 3vw, 40px);
        }

        .hero-arrow:hover {
          background: rgba(255, 255, 255, 0.28);
          transform: translateY(-50%) scale(1.08);
        }

        .hero-arrow:active {
          transform: translateY(-50%) scale(0.95);
        }

        /* ---- Dots ---- */
        .hero-dots {
          position: absolute;
          bottom: clamp(14px, 3vh, 28px);
          left: 50%;
          transform: translateX(-50%);
          z-index: 20;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .hero-dot {
          border-radius: 100px;
          background: rgba(255, 255, 255, 0.45);
          border: none;
          cursor: pointer;
          transition: width 0.35s cubic-bezier(0.4, 0, 0.2, 1),
                      background 0.35s ease,
                      height 0.35s ease;
          width: 8px;
          height: 8px;
        }

        .hero-dot--active {
          width: 28px;
          height: 8px;
          background: #ffffff;
        }

        .hero-dot:hover:not(.hero-dot--active) {
          background: rgba(255, 255, 255, 0.75);
        }

        /* ---- Mobile ---- */
        @media (max-width: 640px) {
          .hero-arrow {
            width: 38px;
            height: 38px;
          }

          .hero-dot--active {
            width: 20px;
          }
        }
      `}</style>
    </section>
  );
};

export default HeroSection;
