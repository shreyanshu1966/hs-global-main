'use client';
import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';

interface HeroSlide {
  heading?: string;
  subheading?: string;
  ctaText?: string;
  ctaLink?: string;
  backgroundImage?: string;
  mobileBackgroundImage?: string;
  overlayOpacity?: number;
}

interface HeroSectionProps {
  slides?: HeroSlide[];
  autoplayInterval?: number;
}

const HeroSection = ({ slides: _slides = [], autoplayInterval = 5000 }: HeroSectionProps) => {
  const slides = [
    { 
      backgroundImage: '/jgjhg.png', 
      mobileBackgroundImage: '/mobile.png',
      heading: 'HS Global Export' 
    }
  ];
  
  const [active, setActive] = useState(0);
  const count = slides.length;

  const nextSlide = useCallback(() => {
    setActive((prev) => (prev + 1) % count);
  }, [count]);

  const prevSlide = useCallback(() => {
    setActive((prev) => (prev - 1 + count) % count);
  }, [count]);

  useEffect(() => {
    if (count <= 1 || autoplayInterval <= 0) return;
    const timer = setInterval(nextSlide, autoplayInterval);
    return () => clearInterval(timer);
  }, [count, autoplayInterval, nextSlide]);

  if (count === 0) return null;

  return (
    <section className="relative w-full overflow-hidden bg-black flex items-center justify-center mt-12 md:mt-0">
      {/* 
        Dual-Banner Layout.
        Zero Cropping. Desktop image is visible on md+, Mobile image is visible on < md.
        Images naturally dictate height via h-auto w-full.
      */}
      <div className="relative w-full flex items-center justify-center">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`w-full transition-opacity duration-1000 ease-in-out ${
              index === active ? 'opacity-100 relative z-10' : 'opacity-0 absolute inset-0 z-0'
            }`}
          >
            {/* DESKTOP IMAGE (Hidden on mobile) */}
            <Image
              src={slide.backgroundImage || ''}
              alt={slide.heading || 'HS Global Export Desktop'}
              width={1920}
              height={640}
              className="hidden md:block w-full h-auto object-contain select-none"
              priority={index === 0}
              quality={100}
            />
            {/* MOBILE IMAGE (Hidden on desktop) */}
            <Image
              src={slide.mobileBackgroundImage || slide.backgroundImage || ''}
              alt={slide.heading || 'HS Global Export Mobile'}
              width={1122}
              height={1402}
              className="block md:hidden w-full h-auto object-contain select-none"
              priority={index === 0}
              quality={100}
            />
          </div>
        ))}
      </div>

      {/* Navigation Controls (Arrows & Dots) - Only show if there's more than 1 slide */}
      {count > 1 && (
        <>
          <button 
            onClick={prevSlide}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/20 text-white backdrop-blur-md border border-white/10 hover:bg-black/40 transition-all hover:scale-110 active:scale-95"
            aria-label="Previous slide"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
          
          <button 
            onClick={nextSlide}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/20 text-white backdrop-blur-md border border-white/10 hover:bg-black/40 transition-all hover:scale-110 active:scale-95"
            aria-label="Next slide"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`transition-all duration-300 ease-out rounded-full ${
                  i === active 
                    ? 'w-8 h-2 bg-white' 
                    : 'w-2 h-2 bg-white/50 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
};

export default HeroSection;
