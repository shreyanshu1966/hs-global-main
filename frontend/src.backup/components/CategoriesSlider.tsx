import React, { useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { useTranslation } from 'react-i18next';

import { categories as productCategories, Subcategory } from "../data/products";

interface SliderItem { 
  id: string; 
  title: string; 
  image: string;
  videoUrl?: string;
}

const useFurnitureSlides = (): SliderItem[] => {
  return useMemo(() => {
    // Get all video files from furniture folders
    const videoFiles = import.meta.glob('/src/assets/furnitures/**/*.{mp4,webm,mov}', {
      query: '?url',
      import: 'default',
      eager: true
    }) as Record<string, string>;

    const furniture = productCategories.find(c => c.id === 'furniture');
    if (!furniture) return [];
    
    const slides: SliderItem[] = [];
    
    const pushFromSub = (sub: Subcategory) => {
      const firstProduct = sub.products && sub.products[0];
      const img = firstProduct?.image;
      
      if (img && firstProduct) {
        // Find matching video for this subcategory
        const productName = firstProduct.name.toLowerCase().trim();
        const subcategoryName = sub.name.toLowerCase().trim();
        
        let matchedVideo: string | undefined;
        
        for (const [videoPath, videoUrl] of Object.entries(videoFiles)) {
          const pathParts = videoPath.split('/').filter(Boolean);
          const videoProductFolder = pathParts[pathParts.length - 2]?.toLowerCase().trim();
          const videoSubcategory = pathParts[pathParts.length - 3]?.toLowerCase().trim();
          
          if (videoProductFolder === productName && videoSubcategory === subcategoryName) {
            matchedVideo = videoUrl;
            break;
          }
        }
        
        slides.push({ 
          id: sub.id, 
          title: sub.name, 
          image: img,
          videoUrl: matchedVideo
        });
      }
    };
    
    furniture.subcategories.forEach(main => {
      if (Array.isArray(main.subcategories) && main.subcategories.length) {
        main.subcategories.forEach(child => pushFromSub(child));
      } else if (Array.isArray(main.products) && main.products.length) {
        pushFromSub(main);
      }
    });
    
    return slides;
  }, []);
};

const CategorySlide: React.FC<{ 
  cat: SliderItem; 
  onClick: () => void;
}> = ({ cat, onClick }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    // Auto-play video when it loads
    if (videoRef.current && cat.videoUrl) {
      videoRef.current.play().catch(() => {
        // Silently handle autoplay errors
      });
    }
  }, [cat.videoUrl]);

  return (
    <button
      onClick={onClick}
      className="group w-full text-left"
      aria-label={`View ${cat.title}`}
    >
      <div className="relative overflow-hidden rounded-xl shadow-md bg-white border-2 border-black">
        <div className="w-full" style={{ aspectRatio: '897 / 1147' }}>
          {cat.videoUrl ? (
            /* Show Video if available */
            <video
              ref={videoRef}
              src={cat.videoUrl}
              className="w-full h-full object-cover"
              loop
              muted
              playsInline
              autoPlay
              preload="auto"
            />
          ) : (
            /* Show Image as fallback */
            <img
              src={cat.image}
              alt={cat.title}
              className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              decoding="async"
              sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
            />
          )}
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
          <span className="inline-block text-[10px] tracking-wider uppercase text-white/80">Furniture</span>
          <h3 className="text-white text-lg md:text-xl font-bold leading-tight drop-shadow-sm">{cat.title}</h3>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-transparent" />
        <div className="absolute inset-0 ring-1 ring-black/5 rounded-xl" />
      </div>
    </button>
  );
};

const CategoriesSlider: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const furnitureSlides = useFurnitureSlides();

  return (
    <section className="relative z-10 py-10 md:py-14 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-primary">{t('home.categories_title')}</h2>
            <p className="text-gray-600">{t('home.categories_subtitle')}</p>
          </div>
        </div>

        <div className="relative">
          <div className="hidden md:flex gap-2 absolute -top-12 right-0">
            <button className="hs-cat-prev px-3 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50">{t('home.prev')}</button>
            <button className="hs-cat-next px-3 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50">{t('home.next')}</button>
          </div>

          <Swiper
            modules={[Navigation, Autoplay]}
            navigation={{ prevEl: ".hs-cat-prev", nextEl: ".hs-cat-next" }}
            autoplay={{ delay: 1800, disableOnInteraction: false }}
            loop
            spaceBetween={18}
            breakpoints={{
              0: { slidesPerView: 1.05 },
              640: { slidesPerView: 1.5 },
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
              1280: { slidesPerView: 3 },
            }}
            className="!px-1"
          >
            {furnitureSlides.map((cat) => (
              <SwiperSlide key={cat.id}>
                <CategorySlide
                  cat={cat}
                  onClick={() => {
                    navigate(`/products?cat=furniture#${cat.id}`, { 
                      state: { targetCategory: 'furniture', target: cat.id } 
                    });
                  }}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default CategoriesSlider;