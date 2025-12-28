import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';

const AboutCompany: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  
  // Replace with your actual YouTube video ID
  const YOUTUBE_VIDEO_ID = "5QtYShLtba8";

  return (
    <section className="relative py-12 md:py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Video Container - Same dimensions as image */}
          <div className="relative rounded-2xl overflow-hidden shadow-lg bg-gray-200">
            {/* Fixed height matching image: 280px mobile, 420px desktop */}
            <div className="relative w-full h-[280px] md:h-[420px]">
              {/* Loading placeholder */}
              {!isVideoLoaded && (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                  <div className="animate-pulse">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-gray-600"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}
              
              {/* YouTube Embed */}
              <iframe
                className="absolute inset-0 w-full h-full border-0"
                src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?rel=0&modestbranding=1&autoplay=1&mute=1`}
                title="HS-Globals About Company Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
                onLoad={() => setIsVideoLoaded(true)}
              />
            </div>
          </div>

          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-primary mb-4">
            {t('home.about_title')}
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>{t('home.about_description_1')}</p>
            <p>{t('home.about_description_2')}</p>
            </div>
            <button
              onClick={() => navigate("/about")}
              className="mt-6 inline-flex items-center gap-2 bg-black text-white hover:bg-white hover:text-black font-semibold px-6 py-3 rounded-lg shadow-md transition-colors"
            >
              {t('home.about_button')}
              <span aria-hidden>→</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutCompany;