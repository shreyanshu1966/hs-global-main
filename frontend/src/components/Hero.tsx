import { useRef } from "react";
import { ArrowRight, MoveDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getRootImageUrl, optimizeCloudinaryUrl } from "../utils/rootCloudinary";
import TextReveal from "./TextReveal";
import MagneticButton from "./MagneticButton";

gsap.registerPlugin(ScrollTrigger);

const Hero = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  // Get banner from Cloudinary with fallback
  const bannerUrl = getRootImageUrl("banner.webp");
  const optimizedBannerUrl = bannerUrl
    ? optimizeCloudinaryUrl(bannerUrl, { width: 1920, quality: 90, format: 'auto' })
    : "/banner.webp";

  const slides = [
    {
      imageUrl: optimizedBannerUrl,
      title: t("home.hero_title") || "Timeless Elegance",
      subtitle: t("home.hero_subtitle") || "Natural Stone Collection",
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
          src={slides[0].imageUrl}
          alt={slides[0].subtitle || "Luxury Stone Background"}
          className="w-full h-full object-cover"
          width="1920"
          height="1080"
          fetchPriority="high"
          decoding="async"
        />
        <div className="absolute inset-0 bg-black/40 md:bg-black/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      </div>

      {/* Noise Texture Overlay for Premium Feel */}
      <div className="absolute inset-0 opacity-[0.015] mix-blend-overlay pointer-events-none"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' /%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' /%3E%3C/svg%3E")' }}
      />

      {/* Content */}
      <div ref={textRef} className="absolute inset-0 flex flex-col items-start justify-center md:justify-end pb-24 md:pb-32 lg:pb-40 px-6 md:px-12 lg:px-20 text-white z-10 w-full">
        <div className="max-w-7xl w-full">
          {/* Subtitle / Label */}
          <div className="overflow-hidden mb-8 md:mb-10">
            <TextReveal delay={0.2}>
              <div className="flex items-center gap-4">
                <span className="h-[1px] w-16 md:w-20 bg-white/40"></span>
                <span className="text-xs md:text-sm tracking-[0.4em] uppercase text-white/80 font-light">
                  {slides[0].subtitle}
                </span>
              </div>
            </TextReveal>
          </div>

          {/* Main Title - Enhanced Typography */}
          <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-[9rem] leading-[0.95] font-light tracking-tighter mb-6 md:mb-10">
            <TextReveal delay={0.4}>
              <div className="overflow-hidden">
                {slides[0].title}
              </div>
            </TextReveal>
          </h1>

          {/* Tagline */}
          <div className="overflow-hidden mb-12 md:mb-16 max-w-2xl">
            <TextReveal delay={0.6}>
              <p className="text-base md:text-lg lg:text-xl text-white/70 font-light leading-relaxed">
                {t("home.hero_tagline") || "Discover the world's finest natural stones, meticulously sourced and expertly crafted for timeless elegance."}
              </p>
            </TextReveal>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
            <div className="overflow-hidden">
              <TextReveal delay={0.8}>
                <MagneticButton strength={0.3}>
                  <button
                    onClick={() => navigate("/products")}
                    className="group relative px-10 py-5 bg-white text-black font-medium tracking-wide uppercase overflow-hidden hover:bg-white/90 transition-all duration-500 shadow-2xl hover:shadow-white/20"
                  >
                    <span className="relative flex items-center gap-3 text-sm md:text-base">
                      {t("home.explore_button") || "Explore Collection"}
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
                    </span>
                  </button>
                </MagneticButton>
              </TextReveal>
            </div>

            <div className="hidden md:flex items-center">
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
          </div>
        </div>
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
