import { useEffect, useMemo, useState } from 'react';
import { HomePageConfig, HomePageLinkCard, homePageConfigService } from '../../services/homePageConfigService';

const createBlankLinkCard = (): HomePageLinkCard => ({
  title: '',
  subtitle: '',
  image: '',
  link: '/products',
});

const HomePageManagement = () => {
  const [config, setConfig] = useState<HomePageConfig>(homePageConfigService.getDefaultConfig());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const spotlightCount = useMemo(() => config.spotlight.cards.length, [config.spotlight.cards.length]);
  const collectionCount = useMemo(() => config.collections.cards.length, [config.collections.cards.length]);

  const load = async () => {
    try {
      setLoading(true);
      const data = await homePageConfigService.getAdminConfig();
      setConfig(data);
    } catch (error: any) {
      alert(error.message || 'Failed to load home page management data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateLinkCard = (
    section: 'spotlight' | 'collections',
    index: number,
    key: keyof HomePageLinkCard,
    value: string
  ) => {
    setConfig((prev) => {
      const next = { ...prev };
      const cards = [...next[section].cards];
      cards[index] = { ...cards[index], [key]: value };
      next[section] = { ...next[section], cards };
      return next;
    });
  };

  const addLinkCard = (section: 'spotlight' | 'collections') => {
    setConfig((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        cards: [...prev[section].cards, createBlankLinkCard()],
      },
    }));
  };

  const removeLinkCard = (section: 'spotlight' | 'collections', index: number) => {
    setConfig((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        cards: prev[section].cards.filter((_, i) => i !== index),
      },
    }));
  };

  const addProductCarousel = () => {
    setConfig((prev) => ({
      ...prev,
      productCarousels: [...prev.productCarousels, { title: '', viewAllLink: '/products', enabled: true }],
    }));
  };

  const removeProductCarousel = (index: number) => {
    setConfig((prev) => ({
      ...prev,
      productCarousels: prev.productCarousels.filter((_, i) => i !== index),
    }));
  };

  const save = async () => {
    try {
      setSaving(true);
      const updated = await homePageConfigService.updateAdminConfig(config);
      setConfig(updated);
      alert('Home page configuration saved successfully.');
    } catch (error: any) {
      alert(error.message || 'Failed to save home page configuration');
    } finally {
      setSaving(false);
    }
  };

  const resetToDefault = () => {
    if (!confirm('Reset form to default values? This only changes form values until you save.')) {
      return;
    }
    setConfig(homePageConfigService.getDefaultConfig());
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
        Loading home page settings...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Home Page Management</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage all homepage carousel sections from one place.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={resetToDefault}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Reset Form
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg text-sm font-semibold"
          >
            {saving ? 'Saving...' : 'Save Home Page'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Highlights Carousel Header</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            value={config.newArrivals.title}
            onChange={(e) => setConfig((prev) => ({ ...prev, newArrivals: { ...prev.newArrivals, title: e.target.value } }))}
            placeholder="Title"
            className="px-3 py-2 border border-gray-300 rounded-lg"
          />
          <input
            value={config.newArrivals.ctaText}
            onChange={(e) => setConfig((prev) => ({ ...prev, newArrivals: { ...prev.newArrivals, ctaText: e.target.value } }))}
            placeholder="CTA text"
            className="px-3 py-2 border border-gray-300 rounded-lg"
          />
          <input
            value={config.newArrivals.ctaLink}
            onChange={(e) => setConfig((prev) => ({ ...prev, newArrivals: { ...prev.newArrivals, ctaLink: e.target.value } }))}
            placeholder="CTA link"
            className="px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Collection Just For You Carousel Header</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            value={config.personalizedCollection.title}
            onChange={(e) =>
              setConfig((prev) => ({
                ...prev,
                personalizedCollection: { ...prev.personalizedCollection, title: e.target.value },
              }))
            }
            placeholder="Section title"
            className="px-3 py-2 border border-gray-300 rounded-lg"
          />
          <input
            value={config.personalizedCollection.subtitle}
            onChange={(e) =>
              setConfig((prev) => ({
                ...prev,
                personalizedCollection: { ...prev.personalizedCollection, subtitle: e.target.value },
              }))
            }
            placeholder="Section subtitle"
            className="px-3 py-2 border border-gray-300 rounded-lg"
          />
          <input
            value={config.personalizedCollection.viewMoreText}
            onChange={(e) =>
              setConfig((prev) => ({
                ...prev,
                personalizedCollection: { ...prev.personalizedCollection, viewMoreText: e.target.value },
              }))
            }
            placeholder="View more text"
            className="px-3 py-2 border border-gray-300 rounded-lg"
          />
          <input
            value={config.personalizedCollection.viewMoreLink}
            onChange={(e) =>
              setConfig((prev) => ({
                ...prev,
                personalizedCollection: { ...prev.personalizedCollection, viewMoreLink: e.target.value },
              }))
            }
            placeholder="View more link"
            className="px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Product Carousels</h3>
          <button
            onClick={addProductCarousel}
            className="px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50"
          >
            Add Carousel
          </button>
        </div>

        <div className="space-y-3">
          {config.productCarousels.map((carousel, index) => (
            <div key={`carousel-${index}`} className="grid grid-cols-1 md:grid-cols-12 gap-3 border border-gray-200 rounded-lg p-3">
              <input
                value={carousel.title}
                onChange={(e) => {
                  const value = e.target.value;
                  setConfig((prev) => {
                    const next = [...prev.productCarousels];
                    next[index] = { ...next[index], title: value };
                    return { ...prev, productCarousels: next };
                  });
                }}
                placeholder="Carousel title"
                className="md:col-span-5 px-3 py-2 border border-gray-300 rounded-lg"
              />
              <input
                value={carousel.viewAllLink}
                onChange={(e) => {
                  const value = e.target.value;
                  setConfig((prev) => {
                    const next = [...prev.productCarousels];
                    next[index] = { ...next[index], viewAllLink: value };
                    return { ...prev, productCarousels: next };
                  });
                }}
                placeholder="View all link"
                className="md:col-span-5 px-3 py-2 border border-gray-300 rounded-lg"
              />
              <label className="md:col-span-1 flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={carousel.enabled}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setConfig((prev) => {
                      const next = [...prev.productCarousels];
                      next[index] = { ...next[index], enabled: checked };
                      return { ...prev, productCarousels: next };
                    });
                  }}
                />
                Enabled
              </label>
              <button
                onClick={() => removeProductCarousel(index)}
                className="md:col-span-1 px-3 py-2 text-sm rounded-lg bg-red-50 text-red-700 hover:bg-red-100"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Spotlight Carousel ({spotlightCount})</h3>
          <button
            onClick={() => addLinkCard('spotlight')}
            className="px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50"
          >
            Add Slide
          </button>
        </div>

        <input
          value={config.spotlight.title}
          onChange={(e) => setConfig((prev) => ({ ...prev, spotlight: { ...prev.spotlight, title: e.target.value } }))}
          placeholder="Section title"
          className="w-full mb-3 px-3 py-2 border border-gray-300 rounded-lg"
        />

        <div className="space-y-3">
          {config.spotlight.cards.map((card, index) => (
            <div key={`spotlight-${index}`} className="grid grid-cols-1 md:grid-cols-4 gap-3 border border-gray-200 rounded-lg p-3">
              <input
                value={card.title}
                onChange={(e) => updateLinkCard('spotlight', index, 'title', e.target.value)}
                placeholder="Title"
                className="px-3 py-2 border border-gray-300 rounded-lg"
              />
              <input
                value={card.subtitle}
                onChange={(e) => updateLinkCard('spotlight', index, 'subtitle', e.target.value)}
                placeholder="Subtitle"
                className="px-3 py-2 border border-gray-300 rounded-lg"
              />
              <input
                value={card.image}
                onChange={(e) => updateLinkCard('spotlight', index, 'image', e.target.value)}
                placeholder="Image URL or path"
                className="px-3 py-2 border border-gray-300 rounded-lg"
              />
              <div className="flex gap-2">
                <input
                  value={card.link}
                  onChange={(e) => updateLinkCard('spotlight', index, 'link', e.target.value)}
                  placeholder="Link"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                />
                <button
                  onClick={() => removeLinkCard('spotlight', index)}
                  className="px-3 py-2 text-sm rounded-lg bg-red-50 text-red-700 hover:bg-red-100"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Collections Carousel ({collectionCount})</h3>
          <button
            onClick={() => addLinkCard('collections')}
            className="px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50"
          >
            Add Card
          </button>
        </div>

        <input
          value={config.collections.title}
          onChange={(e) => setConfig((prev) => ({ ...prev, collections: { ...prev.collections, title: e.target.value } }))}
          placeholder="Section title"
          className="w-full mb-3 px-3 py-2 border border-gray-300 rounded-lg"
        />

        <div className="space-y-3">
          {config.collections.cards.map((card, index) => (
            <div key={`collections-${index}`} className="grid grid-cols-1 md:grid-cols-4 gap-3 border border-gray-200 rounded-lg p-3">
              <input
                value={card.title}
                onChange={(e) => updateLinkCard('collections', index, 'title', e.target.value)}
                placeholder="Title"
                className="px-3 py-2 border border-gray-300 rounded-lg"
              />
              <input
                value={card.subtitle}
                onChange={(e) => updateLinkCard('collections', index, 'subtitle', e.target.value)}
                placeholder="Subtitle (optional)"
                className="px-3 py-2 border border-gray-300 rounded-lg"
              />
              <input
                value={card.image}
                onChange={(e) => updateLinkCard('collections', index, 'image', e.target.value)}
                placeholder="Image URL or path"
                className="px-3 py-2 border border-gray-300 rounded-lg"
              />
              <div className="flex gap-2">
                <input
                  value={card.link}
                  onChange={(e) => updateLinkCard('collections', index, 'link', e.target.value)}
                  placeholder="Link"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                />
                <button
                  onClick={() => removeLinkCard('collections', index)}
                  className="px-3 py-2 text-sm rounded-lg bg-red-50 text-red-700 hover:bg-red-100"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Featured Banner</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            value={config.featuredBanner.title}
            onChange={(e) =>
              setConfig((prev) => ({ ...prev, featuredBanner: { ...prev.featuredBanner, title: e.target.value } }))
            }
            placeholder="Banner title"
            className="px-3 py-2 border border-gray-300 rounded-lg"
          />
          <input
            value={config.featuredBanner.ctaText}
            onChange={(e) =>
              setConfig((prev) => ({ ...prev, featuredBanner: { ...prev.featuredBanner, ctaText: e.target.value } }))
            }
            placeholder="CTA text"
            className="px-3 py-2 border border-gray-300 rounded-lg"
          />
          <input
            value={config.featuredBanner.link}
            onChange={(e) =>
              setConfig((prev) => ({ ...prev, featuredBanner: { ...prev.featuredBanner, link: e.target.value } }))
            }
            placeholder="CTA link"
            className="px-3 py-2 border border-gray-300 rounded-lg"
          />
          <input
            value={config.featuredBanner.imageAlt}
            onChange={(e) =>
              setConfig((prev) => ({ ...prev, featuredBanner: { ...prev.featuredBanner, imageAlt: e.target.value } }))
            }
            placeholder="Image alt text"
            className="px-3 py-2 border border-gray-300 rounded-lg"
          />
          <input
            value={config.featuredBanner.image}
            onChange={(e) =>
              setConfig((prev) => ({ ...prev, featuredBanner: { ...prev.featuredBanner, image: e.target.value } }))
            }
            placeholder="Image URL/path"
            className="px-3 py-2 border border-gray-300 rounded-lg"
          />
          <input
            value={config.featuredBanner.fallbackImage}
            onChange={(e) =>
              setConfig((prev) => ({ ...prev, featuredBanner: { ...prev.featuredBanner, fallbackImage: e.target.value } }))
            }
            placeholder="Fallback image URL/path"
            className="px-3 py-2 border border-gray-300 rounded-lg"
          />
          <textarea
            value={config.featuredBanner.body}
            onChange={(e) =>
              setConfig((prev) => ({ ...prev, featuredBanner: { ...prev.featuredBanner, body: e.target.value } }))
            }
            placeholder="Banner description"
            rows={3}
            className="md:col-span-2 px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
      </div>
    </div>
  );
};

export default HomePageManagement;
