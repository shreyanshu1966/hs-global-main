import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { getProductsForCategory, optimizeCloudinaryUrl } from '../utils/collectionCloudinary';

type MainCategory = "marble" | "granite" | "sandstone" | "onyx" | "travertine";

interface StoneItem {
  id: string;
  name: string;
  image: string;
  category: MainCategory;
}

interface StoneGroup {
  title: string;
  stones: StoneItem[];
}

function toTitle(text: string): string {
  return decodeURIComponent(text)
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function buildGroupsFromCloudinary(): StoneGroup[] {
  const mainCategories: { key: MainCategory; folder: string; title: string }[] = [
    { key: "marble", folder: "Marble", title: "Marble" },
    { key: "granite", folder: "Granite", title: "Granite" },
    { key: "sandstone", folder: "Sandstone", title: "Sandstone" },
    { key: "onyx", folder: "Onyx", title: "Onyx" },
    { key: "travertine", folder: "Travertine", title: "Travertine" },
  ];

  const result: StoneGroup[] = [];

  for (const cat of mainCategories) {
    // Get all products for this category from Cloudinary
    const products = getProductsForCategory(cat.folder);

    // Convert to StoneItem format with optimized images
    const items: StoneItem[] = products
      .filter(p => p.image) // Only include products with images
      .map((product, idx) => ({
        id: `${cat.key}-${idx}`,
        name: toTitle(product.name),
        image: optimizeCloudinaryUrl(product.image!, {
          width: 200,
          height: 200,
          quality: 85,
          format: 'auto'
        }),
        category: cat.key,
      }));

    // Shuffle and take up to 8
    const shuffled = [...items];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    result.push({ title: cat.title, stones: shuffled.slice(0, 8) });
  }

  return result;
}

const ChooseStone: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const DEMO_IMG = "/general/marble.jpg";
  const groups = useMemo(() => buildGroupsFromCloudinary(), []);

  const handleClick = (stone: StoneItem) => {
    // Ensure Onyx works like others; pass state and also set hash to main for fallback
    const main = stone.category;
    navigate(`/products#${main}`, { state: { targetProduct: stone.name, targetCategory: 'slabs', targetMain: main } });
  };

  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-primary">{t('home.choose_stone')}</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            {t('home.choose_stone_subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 md:gap-10">
          {groups.slice(0, 4).map((group) => (
            <div key={group.title} className="rounded-xs p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg md:text-xl font-semibold text-gray-900">{group.title}</h3>
                <button
                  onClick={() => navigate(`/products#${group.title.toLowerCase()}`, { state: { target: group.title.toLowerCase(), targetCategory: 'slabs' } })}
                  className="text-primary text-sm font-medium hover:underline"
                >
                  {t('home.view_more')}
                </button>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {group.stones.slice(0, 8).map((stone) => (
                  <button
                    key={stone.id}
                    onClick={() => handleClick(stone)}
                    className="group flex flex-col items-center text-center min-w-0"
                    aria-label={`View products in ${stone.name}`}
                  >
                    <span className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full overflow-hidden flex items-center justify-center bg-white shadow-sm mb-2 border-2 border-black">
                      <img
                        src={stone.image}
                        alt={stone.name}
                        className="w-full h-full object-cover transform scale-[2.00] group-hover:scale-[2.10] transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = DEMO_IMG;
                        }}
                        loading="lazy"
                      />
                    </span>
                    <span className="text-xs md:text-sm text-gray-700 group-hover:text-primary font-medium">
                      {stone.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {groups.length > 4 && (
          <div className="mt-6 md:mt-10 flex justify-center">
            <div className="w-full max-w-3xl rounded-xs p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg md:text-xl font-semibold text-gray-900">{groups[4].title}</h3>
                <button
                  onClick={() => navigate(`/products#${groups[4].title.toLowerCase()}`, { state: { target: groups[4].title.toLowerCase(), targetCategory: 'slabs' } })}
                  className="text-primary text-sm font-medium hover:underline"
                >
                  {t('home.view_more')}
                </button>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {groups[4].stones.slice(0, 8).map((stone) => (
                  <button
                    key={stone.id}
                    onClick={() => handleClick(stone)}
                    className="group flex flex-col items-center text-center min-w-0"
                    aria-label={`View products in ${stone.name}`}
                  >
                    <span className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full overflow-hidden flex items-center justify-center bg-white shadow-sm mb-2 border-2 border-black">
                      <img
                        src={stone.image}
                        alt={stone.name}
                        className="w-full h-full object-cover transform scale-[2.00] group-hover:scale-[2.10] transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = DEMO_IMG;
                        }}
                        loading="lazy"
                      />
                    </span>
                    <span className="text-xs md:text-sm text-gray-700 group-hover:text-primary font-medium">
                      {stone.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ChooseStone;

