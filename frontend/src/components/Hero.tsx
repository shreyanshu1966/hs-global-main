import { useRef } from "react";
import { ArrowRight, MoveDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getResponsiveImage, getSrcSet } from "../utils/responsive-image-helper";
import TextReveal from "./TextReveal";
import MagneticButton from "./MagneticButton";

gsap.registerPlugin(ScrollTrigger);

const Hero = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);


  // Get responsive banner data directly - let the browser choose the best size via srcSet/sizes
  // TODO: Replace with new generated "luxury_marble_dining_hero" image
  const bannerUrl = "/furniture/hero-dining.jpg";
  const bannerSrcSet = ""; // Temporarily empty until we have real assets

  const slides = [
    {
      imageUrl: bannerUrl,
      title: t("home.hero_title") || "Living in Stone",
      subtitle: t("home.hero_subtitle") || "The Art of Marble Furniture",
    },
  ];

  useGSAP(() => {
    // Parallax Effect - with null check
    if (bgRef.current && containerRef.current) {
      gsap.to(bgRef.current, {
        yPercent: 30,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        }
      });
    }

    // Text Parallax (gentle fade out on scroll) - with null check
    if (textRef.current && containerRef.current) {
      gsap.to(textRef.current, {
        yPercent: -20,
        opacity: 0,
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "50% top",
          scrub: true,
        }
      });
    }

  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="relative h-screen min-h-[700px] md:min-h-[800px] w-full overflow-hidden bg-black">
      {/* Background Image with Parallax */}
      {/* Background Image with Parallax - Optimized for LCP */}
      <div
        ref={bgRef}
        className="absolute inset-0 scale-110 will-change-transform"
      >
        <img
          src={bannerUrl}
          alt={slides[0].subtitle || "Luxury Stone Furniture"}
          className="w-full h-full object-cover"
          width="1920"
          height="1080"
          fetchPriority="high"
          decoding="async"
        />
        <div className="absolute inset-0 bg-black/30 md:bg-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
      </div>

      {/* Noise Texture Overlay for Premium Feel */}
      <div className="absolute inset-0 opacity-[0.015] mix-blend-overlay pointer-events-none"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' /%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' /%3E%3C/svg%3E")' }}
      />

      {/* Content */}
      <div ref={textRef} className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-end pb-24 md:pb-32 lg:pb-40 px-6 md:px-12 lg:px-20 text-white z-10 w-full text-center">
        <div className="max-w-5xl w-full">
          {/* Subtitle / Label */}
          <div className="overflow-hidden mb-6 md:mb-8 flex justify-center">
            <TextReveal delay={0.2}>
              <div className="flex items-center gap-4">
                <span className="h-[1px] w-12 bg-white/60"></span>
                <span className="text-xs md:text-sm tracking-[0.4em] uppercase text-white/90 font-light">
                  {slides[0].subtitle}
                </span>
                <span className="h-[1px] w-12 bg-white/60"></span>
              </div>
            </TextReveal>
          </div>

          {/* Main Title - Enhanced Typography */}
          <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-9xl leading-[0.9] font-medium tracking-tighter mb-8 md:mb-12">
            <TextReveal delay={0.4}>
              <div className="overflow-hidden text-center">
                {slides[0].title}
              </div>
            </TextReveal>
          </h1>

          {/* Tagline */}
          <div className="overflow-hidden mb-12 md:mb-16 max-w-2xl mx-auto">
            <TextReveal delay={0.6}>
              <p className="text-base md:text-xl text-white/80 font-light leading-relaxed">
                {t("home.hero_tagline") || "Elevate your interiors with our bespoke collection of marble furniture. Where timeless nature meets modern architecture."}
              </p>
            </TextReveal>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 items-center justify-center">
            <div className="overflow-hidden">
              <TextReveal delay={0.8}>
                <MagneticButton strength={0.3}>
                  <button
                    onClick={() => navigate("/products?cat=furniture")}
                    className="group relative px-10 py-5 bg-white text-black font-medium tracking-wide uppercase overflow-hidden hover:bg-white/90 transition-all duration-500 shadow-2xl hover:shadow-white/20"
                  >
                    <span className="relative flex items-center gap-3 text-sm md:text-base">
                      Explore Furniture
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
                    </span>
                  </button>
                </MagneticButton>
              </TextReveal>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden md:flex absolute bottom-10 left-10 z-20">
        <TextReveal delay={1.0}>
          <button
            onClick={() => document.getElementById('feature-marquee')?.scrollIntoView({ behavior: 'smooth' })}
            className="group flex items-center gap-4 text-white/70 hover:text-white transition-all duration-300"
          >
            <span className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:border-white/40 transition-colors backdrop-blur-sm">
              <MoveDown className="w-5 h-5 animate-bounce" />
            </span>
            <span className="text-sm uppercase tracking-[0.2em] font-light">Discover More</span>
          </button>
        </TextReveal>
      </div>

      {/* Scroll Progress Indicator */}
      <div className="absolute bottom-8 right-6 md:right-12 z-20 hidden lg:block">
        <div className="flex flex-col items-center gap-2 text-white/50 text-xs tracking-widest">
          <span className="rotate-90 origin-center mb-8">SCROLL</span>
          <div className="w-[1px] h-20 bg-white/20 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1/3 bg-white/60 animate-pulse"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
