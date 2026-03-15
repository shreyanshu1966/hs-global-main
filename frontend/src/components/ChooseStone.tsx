import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { optimizeCloudinaryUrl } from '../utils/collectionCloudinary';
import { productService } from '../services/productService';

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

const ChooseStone: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const DEMO_IMG = "/general/marble.jpg";
  const [groups, setGroups] = useState<StoneGroup[]>([]);

  useEffect(() => {
    let isCancelled = false;

    const loadGroups = async () => {
      const mainCategories: { key: MainCategory; title: string }[] = [
        { key: "marble", title: "Marble" },
        { key: "granite", title: "Granite" },
        { key: "sandstone", title: "Sandstone" },
        { key: "onyx", title: "Onyx" },
        { key: "travertine", title: "Travertine" },
      ];

      try {
        const responses = await Promise.all(
          mainCategories.map((cat) =>
            productService.getProductsByCategory('slabs', {
              subcategory: cat.key,
              limit: 8,
              sortBy: 'featured',
              sortOrder: 'desc',
            })
          )
        );

        if (isCancelled) return;

        const nextGroups: StoneGroup[] = responses.map((response, index) => {
          const categoryInfo = mainCategories[index];
          const items: StoneItem[] = response.success
            ? (response.data.products || []).map((product) => ({
                id: product.productId,
                name: product.name,
                image: optimizeCloudinaryUrl(product.image || product.images?.[0] || DEMO_IMG, {
                  width: 200,
                  height: 200,
                  quality: 85,
                  format: 'auto',
                }),
                category: categoryInfo.key,
              }))
            : [];

          return { title: categoryInfo.title, stones: items.slice(0, 8) };
        });

        setGroups(nextGroups.filter((group) => group.stones.length > 0));
      } catch (error) {
        console.error('Failed to load stone groups:', error);
        if (!isCancelled) setGroups([]);
      }
    };

    loadGroups();
    return () => {
      isCancelled = true;
    };
  }, []);

  const handleClick = (stone: StoneItem) => {
    navigate(`/products/${stone.id}`);
  };

  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-primary">The Material Library</h2>
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
