import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { ArrowUpRight, Play } from "lucide-react";
import TextReveal from "./TextReveal";
import Magnet from "./Magnet";
import ShinyText from "./ShinyText";

const AboutCompany: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Replace with your actual YouTube video ID
  const YOUTUBE_VIDEO_ID = "5QtYShLtba8";

  return (
    <section className="relative py-20 md:py-32 lg:py-40 bg-white overflow-hidden">
      {/* Decorative large text background - More subtle */}
      <div className="absolute top-20 left-0 w-full overflow-hidden pointer-events-none opacity-[0.02] select-none">
        <h2 className="text-[8rem] md:text-[15rem] lg:text-[20rem] font-bold text-center leading-none tracking-tighter text-black whitespace-nowrap">
          HERITAGE
        </h2>
      </div>

      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Left Content */}
          <div className="order-2 lg:order-1">
            <div className="inline-flex items-center gap-3 mb-8">
              <span className="h-[1px] w-12 bg-stone-300"></span>
              <span className="text-xs tracking-[0.3em] uppercase text-stone-500 font-medium">Since 2010</span>
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-light text-primary mb-8 leading-[1.1] tracking-tight">
              <TextReveal>
                {t('home.about_title') || "Crafting the Future of"} <br />
                <span className="italic text-accent font-normal">
                  <ShinyText text="Luxury Stone" speed={3} />
                </span>
              </TextReveal>
            </h2>

            <div className="space-y-6 text-gray-600 text-base md:text-lg leading-relaxed font-light mb-10">
              <TextReveal delay={0.2}>
                <p>{t('home.about_description_1') || "We search the globe for the earth's most exquisite materials, bringing the raw beauty of nature directly to your architectural masterpieces."}</p>
              </TextReveal>
              <TextReveal delay={0.3}>
                <p>{t('home.about_description_2') || "From the quarries of Italy to the mountains of India, our collection represents the pinnacle of quality and aesthetic refinement."}</p>
              </TextReveal>
            </div>

            <div className="flex flex-wrap gap-8 items-center">
              <TextReveal delay={0.4}>
                <Magnet padding={50} magnetStrength={2}>
                  <button
                    onClick={() => navigate("/about")}
                    className="group inline-flex items-center gap-3 bg-primary text-white px-8 py-4 hover:bg-accent transition-all duration-500 shadow-lg hover:shadow-2xl"
                  >
                    <span className="tracking-wide uppercase text-sm font-medium">{t('home.about_button') || "Our Story"}</span>
                    <ArrowUpRight className="w-5 h-5 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform duration-300" />
                  </button>
                </Magnet>
              </TextReveal>

              <TextReveal delay={0.5}>
                <div className="flex items-center gap-8">
                  <div className="flex flex-col">
                    <span className="text-4xl md:text-5xl font-serif font-light text-primary">500+</span>
                    <span className="text-xs text-gray-500 uppercase tracking-wider mt-1">Projects Completed</span>
                  </div>
                  <div className="h-12 w-[1px] bg-stone-200"></div>
                  <div className="flex flex-col">
                    <span className="text-4xl md:text-5xl font-serif font-light text-primary">15+</span>
                    <span className="text-xs text-gray-500 uppercase tracking-wider mt-1">Years Experience</span>
                  </div>
                </div>
              </TextReveal>
            </div>
          </div>

          {/* Right Video/Image */}
          <div className="order-1 lg:order-2 w-full relative">
            <div className="relative w-full aspect-[4/5] md:aspect-[3/4] bg-stone-100 overflow-hidden shadow-2xl">
              {/* Video Overlay / Placeholder */}
              <div className={`absolute inset-0 transition-opacity duration-700 ${isPlaying ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                <img
                  src="/video-poster.jpg"
                  onError={(e) => (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=2000&auto=format&fit=crop'}
                  alt="About HS Global"
                  className="w-full h-full object-cover filter grayscale-[30%] hover:grayscale-0 transition-all duration-700"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/10 transition-colors cursor-pointer group"
                  onClick={() => setIsPlaying(true)}>
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-white/40 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center pl-1 shadow-2xl">
                      <Magnet magnetStrength={5} padding={20}>
                        <Play className="w-6 h-6 text-primary fill-primary" />
                      </Magnet>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actual Video Frame */}
              {(isPlaying || isVideoLoaded) && (
                <iframe
                  className={`absolute inset-0 w-full h-full ${isPlaying ? 'opacity-100' : 'opacity-0'}`}
                  src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?autoplay=${isPlaying ? 1 : 0}&rel=0&modestbranding=1&controls=0`}
                  title="HS Global Video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  onLoad={() => setIsVideoLoaded(true)}
                />
              )}
            </div>

            {/* Floating Quote Element - Refined */}
            <div className="absolute -bottom-8 -left-8 md:-left-12 bg-white p-6 md:p-8 shadow-2xl max-w-xs z-20 hidden md:block border-l-4 border-accent">
              <p className="font-serif italic text-lg md:text-xl text-primary leading-snug">
                "Quality is not an act, it is a habit."
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="w-10 h-[2px] bg-accent"></div>
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Our Philosophy</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutCompany;