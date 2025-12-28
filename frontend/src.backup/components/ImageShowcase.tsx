import React, { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const showcaseImages = [
  {
    url: "/slider/slider1.webp",
    title: "Luxury Kitchen Design",
    description: "Premium granite countertops and backsplashes",
  },
  {
    url: "/slider/slider2.webp",
    title: "Modern Bathroom",
    description: "Elegant marble vanity and flooring",
  },
  {
    url: "/slider/slider3.webp",
    title: "Elegant Living Room",
    description: "Custom-cut stone features and fireplace",
  },
  {
    url: "/slider/slider4.webp",
    title: "Commercial Space",
    description: "Large-format stone installations",
  },
  {
    url: "/slider/slider5.jpg",
    title: "Hotel Lobby",
    description: "Luxurious marble and granite combinations",
  },
];

const ImageShowcase = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(0); // Track previous for exit animation
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const nextIndex = (currentIndex + 1) % showcaseImages.length;

  const { contextSafe } = useGSAP({ scope: containerRef });

  const handleNext = useCallback(() => {
    if (isAnimating) return;
    setPrevIndex(currentIndex);
    setIsAnimating(true);
    setCurrentIndex(nextIndex);
    // Animation duration + buffer
    setTimeout(() => setIsAnimating(false), 700);
  }, [currentIndex, isAnimating, nextIndex]);

  const handlePrev = useCallback(() => {
    if (isAnimating) return;
    setPrevIndex(currentIndex);
    setIsAnimating(true);
    setCurrentIndex(
      (prev) => (prev - 1 + showcaseImages.length) % showcaseImages.length
    );
    setTimeout(() => setIsAnimating(false), 700);
  }, [isAnimating, currentIndex]);

  useEffect(() => {
    const interval = setInterval(handleNext, 6000);
    return () => clearInterval(interval);
  }, [handleNext]);

  useGSAP(() => {
    // Initial load - show first slide immediately
    gsap.set(`.slide-${currentIndex}`, { opacity: 1, scale: 1, zIndex: 2 });

    // Animate text info for initial slide
    gsap.fromTo(`.info-${currentIndex}`,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, delay: 0.2 }
    );
  }, []); // Run once

  useGSAP(() => {
    if (currentIndex === prevIndex) return; // Skip if same (e.g. initial mount handled above)

    // Current Slide (Entering)
    gsap.fromTo(`.slide-${currentIndex}`,
      { opacity: 0, scale: 1.1, zIndex: 2 },
      { opacity: 1, scale: 1, duration: 0.7, ease: "power2.inOut" }
    );

    // Previous Slide (Exiting)
    gsap.to(`.slide-${prevIndex}`,
      { opacity: 0, scale: 0.9, zIndex: 1, duration: 0.7, ease: "power2.inOut" }
    );

    // Text animations
    gsap.fromTo(`.info-${currentIndex}`,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, delay: 0.2 }
    );

    gsap.to(`.info-${prevIndex}`,
      { opacity: 0, duration: 0.3 }
    );

  }, [currentIndex]); // Run when index changes

  // Hover effects
  const handleBtnEnter = contextSafe((e: React.MouseEvent) => gsap.to(e.currentTarget, { scale: 1.1, duration: 0.2 }));
  const handleBtnLeave = contextSafe((e: React.MouseEvent) => gsap.to(e.currentTarget, { scale: 1, duration: 0.2 }));
  const handleBtnDown = contextSafe((e: React.MouseEvent) => gsap.to(e.currentTarget, { scale: 0.9, duration: 0.1 }));
  const handleBtnUp = contextSafe((e: React.MouseEvent) => gsap.to(e.currentTarget, { scale: 1.1, duration: 0.1 }));

  return (
    <section ref={containerRef} className="relative w-full h-screen overflow-hidden bg-primary">
      {/* Main Slider */}
      <div className="absolute inset-0">
        {showcaseImages.map((img, index) => (
          <div
            key={index}
            className={`slide-${index} absolute inset-0 opacity-0`}
            style={{ zIndex: index === currentIndex ? 2 : 1 }}
          >
            <div
              className="w-full h-full bg-cover bg-center"
              style={{
                backgroundImage: `url(${img.url})`,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            </div>

            {/* Content */}
            <div className="absolute inset-0 flex items-center justify-center px-4">
              <div className="max-w-4xl">
                <div
                  className={`info-${index} text-center opacity-0`} // Initial opacity 0, animated in
                >
                  <h2 className="text-5xl md:text-7xl font-bold text-white mb-6">
                    {img.title}
                  </h2>
                  <p className="text-xl text-white/80 mb-8">
                    {img.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Next Image Preview (Hidden on mobile) */}
        <div className="absolute top-1/2 -translate-y-1/2 right-0 w-64 h-96 overflow-hidden hidden lg:block z-20">
          {/* Note: Simplified preview for migration stability - static or simple fade can work, but keeping it simple for now to ensure robustness */}
          <div
            className="relative w-full h-full cursor-pointer group"
            onClick={handleNext}
          >
            <div className="w-full h-full relative overflow-hidden">

              <div
                className="w-full h-full bg-cover bg-center filter brightness-75 group-hover:brightness-100 transition-all duration-300 transform scale-100 group-hover:scale-105"
                style={{
                  backgroundImage: `url(${showcaseImages[nextIndex].url})`,
                }}
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/0 transition-colors duration-300" />

              <div className="absolute bottom-8 left-6 right-6 text-white">
                <p className="text-sm font-medium mb-2 opacity-75">Next:</p>
                <p className="text-lg font-semibold mb-1">
                  {showcaseImages[nextIndex].title}
                </p>
                <p className="text-sm opacity-75">
                  {showcaseImages[nextIndex].description}
                </p>
              </div>
            </div>

          </div>
        </div>


        {/* Navigation Controls */}
        <div className="absolute inset-x-0 bottom-12 flex flex-col items-center z-20">
          {/* Thumbnails */}
          <div className="flex items-center space-x-4 mb-8">
            {showcaseImages.map((_, index) => (
              <button
                key={index}
                onClick={() => !isAnimating && setCurrentIndex(index)}
                onMouseEnter={handleBtnEnter}
                onMouseLeave={handleBtnLeave}
                className={`relative h-2 rounded-full transition-all duration-300 ${currentIndex === index
                    ? "w-12 bg-white"
                    : "w-2 bg-white/50 hover:bg-white/80"
                  }`}
              />
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center space-x-4">
            <button
              onMouseEnter={handleBtnEnter}
              onMouseLeave={handleBtnLeave}
              onMouseDown={handleBtnDown}
              onMouseUp={handleBtnUp}
              onClick={handlePrev}
              className="bg-white/10 backdrop-blur-sm p-4 rounded-full hover:bg-accent transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            <button
              onMouseEnter={handleBtnEnter}
              onMouseLeave={handleBtnLeave}
              onMouseDown={handleBtnDown}
              onMouseUp={handleBtnUp}
              onClick={handleNext}
              className="bg-white/10 backdrop-blur-sm p-4 rounded-full hover:bg-accent transition-colors"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ImageShowcase;
