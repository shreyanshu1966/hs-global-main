import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import TextReveal from "../components/TextReveal";
import { Award, Users, Globe, Target, ChevronRight, CheckCircle } from "lucide-react";

const YouTubeVideo = ({ videoId, title }: { videoId: string; title: string }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) observer.observe(containerRef.current);

    return () => {
      if (containerRef.current) observer.unobserve(containerRef.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-gray-900 rounded-xl overflow-hidden shadow-2xl"
      style={{ paddingBottom: "56.25%" }}
    >
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center backdrop-blur-sm animate-pulse">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center shadow-lg transform transition-transform hover:scale-110">
                <svg
                  className="w-8 h-8 text-white ml-1"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}
      {inView && (
        <iframe
          className="absolute top-0 left-0 w-full h-full border-0"
          src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&autoplay=1&mute=1&controls=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
        />
      )}
    </div>
  );
};

const SectionHeading = ({ tag, title, align = "left" }: { tag: string, title: string, align?: "left" | "center" }) => {
  return (
    <div className={`mb-6 sm:mb-8 ${align === "center" ? "text-center" : "text-left"}`}>
      <span
        className="inline-block py-1 px-2 sm:px-3 bg-accent/10 text-accent text-xs font-bold tracking-widest uppercase rounded-full mb-3 sm:mb-4"
      >
        {tag}
      </span>
      <h2
        className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-primary leading-tight"
      >
        {title}
      </h2>
    </div>
  );
};

const About = () => {
  const { t } = useTranslation();

  useEffect(() => {
    const criticalImages = ["/about-hero.webp", "/export.webp", "/marble-solutions.webp", "/granite-solutions.webp"];
    criticalImages.forEach((url) => {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = url;
      document.head.appendChild(link);
    });
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[60vh] sm:h-[70vh] md:h-[80vh] lg:h-[85vh] bg-primary overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/about-hero.webp')",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
        </div>

        <div className="relative h-full flex flex-col justify-center items-center container mx-auto px-4 sm:px-6 z-10">
          <div className="max-w-4xl text-center">
            <TextReveal className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-serif font-bold text-white mb-4 sm:mb-6 leading-tight px-2">
              {t("about.hero_title")}
            </TextReveal>

            <TextReveal delay={0.3} className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-200 mb-6 sm:mb-8 md:mb-10 font-light max-w-2xl mx-auto px-4">
              {t("about.hero_subtitle")}
            </TextReveal>

            <div>
              <a
                href="/products"
                className="inline-flex items-center gap-2 sm:gap-3 bg-accent text-white hover:bg-accent2 px-6 sm:px-8 py-3 sm:py-4 rounded-full text-sm sm:text-base font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-accent/50 group"
              >
                {t("about.hero_button")}
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </div>

        <div
          className="hidden sm:flex absolute bottom-10 left-1/2 transform -translate-x-1/2 flex-col items-center gap-2"
        >
          <span className="text-white/60 text-xs tracking-widest uppercase">Scroll</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-white to-transparent opacity-50"></div>
        </div>
      </section>

      {/* Heritage Section (Left Text, Right Content) */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
            <div>
              <SectionHeading
                tag={t("about.heritage_tag")}
                title={t("about.heritage_title")}
              />
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-4 sm:mb-6 font-light">
                {t("about.heritage_paragraph_1")}
              </p>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-6 sm:mb-8 font-light">
                {t("about.heritage_paragraph_2")}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-6 sm:mt-8">
                <div className="p-4 sm:p-5 bg-secondary rounded-lg border border-gray-100">
                  <h4 className="font-serif font-bold text-lg sm:text-xl text-primary mb-1 sm:mb-2">Premium Quality</h4>
                  <p className="text-xs sm:text-sm text-gray-500">Sourced from the finest mines.</p>
                </div>
                <div className="p-4 sm:p-5 bg-secondary rounded-lg border border-gray-100">
                  <h4 className="font-serif font-bold text-lg sm:text-xl text-primary mb-1 sm:mb-2">Expert Craftsmanship</h4>
                  <p className="text-xs sm:text-sm text-gray-500">Processed with precision.</p>
                </div>
              </div>
            </div>

            <div className="space-y-6 sm:space-y-8">
              <div
                className="rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl relative group"
              >
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500 z-10" />
                <img src="/export.webp" alt="Global Export" className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700" />
              </div>

              <YouTubeVideo
                videoId="GJVq2byJkbg"
                title={t("about.video_title_1")}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Marble Section (Right Text, Left Content) */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-secondary/50 relative">
        {/* Background Pattern */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-accent/5 rounded-full filter blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
            {/* Order 2 on Mobile, Order 1 on LG (Image Left) */}
            <div className="order-2 lg:order-1 space-y-6 sm:space-y-8">
              <div
                className="relative"
              >
                <div className="absolute -top-4 -left-4 w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 border-t-4 border-l-4 border-accent hidden lg:block"></div>
                <div className="absolute -bottom-4 -right-4 w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 border-b-4 border-r-4 border-accent hidden lg:block"></div>
                <img src="/marble-solutions.webp" alt="Marble Solutions" className="w-full h-[300px] sm:h-[400px] md:h-[450px] lg:h-[500px] object-cover rounded-xl sm:rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300" />
              </div>

              <YouTubeVideo
                videoId="vE9QEk9uzRc"
                title={t("about.video_title_2")}
              />
            </div>

            <div
              className="order-1 lg:order-2"
            >
              <SectionHeading
                tag={t("about.marble_tag")}
                title={t("about.marble_title")}
              />
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-4 sm:mb-6 font-light">
                {t("about.marble_paragraph_1")}
              </p>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-4 sm:mb-6 font-light">
                {t("about.marble_paragraph_2")}
              </p>

              <div className="p-4 sm:p-6 bg-white rounded-lg sm:rounded-xl shadow-sm border-l-4 border-accent">
                <p className="text-sm sm:text-base text-gray-700 italic">
                  "{t("about.marble_paragraph_3")}"
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Granite Section (Left Text, Right Image) */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
            <div>
              <SectionHeading
                tag={t("about.granite_tag")}
                title={t("about.granite_title")}
              />
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-6 sm:mb-8 font-light">
                {t("about.granite_paragraph_1")}
              </p>

              <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                {[
                  "Durability & Strength",
                  "Heat & Scratch Resistance",
                  "Unique Natural Patterns",
                  "Low Maintenance"
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base text-gray-700">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-accent flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <a href="/products" className="text-sm sm:text-base text-accent font-semibold hover:text-accent2 flex items-center gap-2 group">
                Explore Granite Collection <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>

            <div
              className="h-[300px] sm:h-[400px] md:h-[450px] lg:h-[500px] rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl"
            >
              <div
                className="w-full h-full bg-cover bg-center hover:scale-110 transition-transform duration-[2s]"
                style={{ backgroundImage: "url('/granite-solutions.webp')" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Global Reach Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-primary text-white relative overflow-hidden">
        {/* Background Map Effect (Simulated) */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle at center, #B8860B 1px, transparent 1px)",
            backgroundSize: "40px 40px"
          }}
        />

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <SectionHeading
            tag={t("about.global_tag")}
            title={t("about.global_title")}
            align="center"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-8 sm:mt-12 lg:mt-16">
            {[
              { icon: Globe, title: t("about.global_network_title"), text: t("about.global_network_text") },
              { icon: Users, title: t("about.global_team_title"), text: t("about.global_team_text") },
              { icon: Target, title: t("about.global_success_title"), text: t("about.global_success_text") },
              { icon: Award, title: t("about.global_awards_title"), text: t("about.global_awards_text") }
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-sm p-6 sm:p-8 rounded-xl sm:rounded-2xl border border-white/10 hover:border-accent/50 hover:bg-white/10 transition-all duration-300 group"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-accent/20 rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-accent transition-colors duration-300">
                  <item.icon className="w-6 h-6 sm:w-7 sm:h-7 text-accent group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-lg sm:text-xl font-serif font-bold mb-2 sm:mb-3">{item.title}</h3>
                <p className="text-white/60 leading-relaxed text-xs sm:text-sm">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
