import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { useTranslation } from 'react-i18next';
import { ArrowRight } from "lucide-react";
import { productService } from "../services/productService";

interface SliderItem {
  id: string;
  title: string;
  image: string;
}

const CategorySlide: React.FC<{
  cat: SliderItem;
  onClick: () => void;
}> = ({ cat, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="group relative cursor-pointer block w-full aspect-[3/4] overflow-hidden bg-stone-100"
    >
      <div className="absolute inset-0 overflow-hidden">
        {/* Always show image first as fallback */}
        <img
          src={cat.image}
          alt={cat.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
          loading="lazy"
        />
        
        {/* Cinematic Noir Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
      </div>

      <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 flex flex-col items-start justify-end z-10 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
        <div className="overflow-hidden mb-2">
          <span className="text-[10px] items-center gap-2 font-bold tracking-[0.2em] text-white/70 uppercase inline-flex transform translate-y-full group-hover:translate-y-0 transition-transform duration-500 delay-100">
            <span className="w-8 h-[1px] bg-accent"></span>
            Collection
          </span>
        </div>

        <h3 className="text-3xl md:text-4xl font-serif text-white mb-4 leading-none">
          {cat.title}
        </h3>

        <div className="w-full flex justify-between items-center opacity-0 group-hover:opacity-100 transition-all duration-500 delay-200 border-t border-white/20 pt-4 mt-2">
          <span className="text-sm text-white/90 font-medium tracking-wide">View Products</span>
          <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center transform -rotate-45 group-hover:rotate-0 transition-transform duration-500">
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
};

const CategoriesSlider: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [furnitureSlides, setFurnitureSlides] = useState<SliderItem[]>([]);

  useEffect(() => {
    let isCancelled = false;

    const loadSlides = async () => {
      try {
        const response = await productService.getProductsByCategory('furniture', {
          limit: 200,
          sortBy: 'featured',
          sortOrder: 'desc',
        });

        if (!response.success || isCancelled) {
          if (!isCancelled) setFurnitureSlides([]);
          return;
        }

        const seen = new Set<string>();
        const nextSlides: SliderItem[] = [];

        response.data.products.forEach((product) => {
          const subKey = String(product.subcategory || '').trim().toLowerCase();
          if (!subKey || seen.has(subKey)) return;

          seen.add(subKey);
          nextSlides.push({
            id: subKey,
            title: product.subcategory,
            image: product.image || product.images?.[0] || '/general/marble.jpg',
          });
        });

        setFurnitureSlides(nextSlides);
      } catch (error) {
        console.error('Failed to load furniture slides:', error);
        if (!isCancelled) setFurnitureSlides([]);
      }
    };

    loadSlides();
    return () => {
      isCancelled = true;
    };
  }, []);

  return (
    <section className="py-20 md:py-32 bg-white overflow-hidden">
      <div className="container mx-auto px-4 mb-12 flex items-end justify-start">
        <div className="max-w-xl">
          <h2 className="text-4xl md:text-5xl font-serif font-medium text-primary mb-6">
            {t('home.categories_title') || "Artisan Furniture"}
          </h2>
          <p className="text-gray-500 text-lg font-light leading-relaxed">
            {t('home.categories_subtitle') || "Modern designs carved from the world's most durable stones."}
          </p>
        </div>
      </div>

      <div className="pl-4 md:pl-[max(1rem,calc((100vw-1280px)/2))]">
        <Swiper
          modules={[Navigation, Autoplay]}
          autoplay={{ delay: 2500, disableOnInteraction: false }}
          spaceBetween={1}
          slidesPerView={1.2}
          breakpoints={{
            640: { slidesPerView: 2.2 },
            768: { slidesPerView: 2.5 },
            1024: { slidesPerView: 3.5 },
          }}
          className="!overflow-visible"
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
    </section>
  );
};

export default CategoriesSlider;