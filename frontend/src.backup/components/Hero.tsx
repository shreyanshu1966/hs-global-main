import React, { useRef } from "react";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const Hero = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);

  const slides = [
    {
      imageUrl: "/banner.webp",
      title: t("home.hero_title"),
      subtitle: t("home.hero_subtitle"),
      description: t("home.hero_subtitle_2"),
      navigation: "/products",
    },
  ];

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

    tl.fromTo(".hero-title",
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8 },
      0
    )
      .fromTo(".hero-subtitle",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 },
        0.3
      )
      .fromTo(".hero-separator",
        { scaleX: 0 },
        { scaleX: 1, duration: 0.8 },
        0.5
      )
      .fromTo(".hero-desc",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 },
        0.6
      )
      .fromTo(".hero-btn-wrapper",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 },
        0.9
      )
      .fromTo(".scroll-indicator",
        { opacity: 0 },
        { opacity: 1, duration: 1 },
        1.5
      );
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="relative h-screen overflow-hidden bg-primary">
      {/* Fixed Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat md:bg-fixed transform scale-105"
        style={{
          backgroundImage: `url(${slides[0].imageUrl})`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70" />
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center text-white z-10">
        <div className="max-w-5xl space-y-6">
          <h1
            className="hero-title font-serif text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight drop-shadow-lg"
          >
            {slides[0].title}
          </h1>

          <div
            className="hero-separator w-24 h-1 bg-accent mx-auto"
          />

          <h2
            className="hero-subtitle font-light text-2xl md:text-3xl lg:text-4xl tracking-widest uppercase text-white/90"
          >
            {slides[0].subtitle}
          </h2>

          <p
            className="hero-desc text-lg md:text-xl text-gray-200 max-w-2xl mx-auto font-light leading-relaxed"
          >
            {slides[0].description}
          </p>

          <div
            className="hero-btn-wrapper pt-8"
          >
            <button
              onClick={() => navigate("/products")}
              className="group relative px-8 py-4 bg-transparent border border-white/30 text-white font-medium tracking-wider uppercase overflow-hidden hover:border-white transition-colors duration-300"
            >
              <div className="absolute inset-0 w-0 bg-white transition-all duration-[250ms] ease-out group-hover:w-full opacity-10"></div>
              <span className="relative flex items-center gap-3">
                {t("home.explore_button") || "Explore Collection"}
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div
        className="scroll-indicator absolute bottom-10 left-1/2 -translate-x-1/2 text-white/70 flex flex-col items-center gap-2"
      >
        <span className="text-xs uppercase tracking-[0.2em]">Scroll</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-white to-transparent" />
      </div>
    </section>
  );
};

export default Hero;
