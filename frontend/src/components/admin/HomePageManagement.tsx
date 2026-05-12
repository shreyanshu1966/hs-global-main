import { useEffect, useMemo, useState, type DragEvent } from 'react';
import { GripVertical, Plus, RotateCcw, Save, Sparkles, Trash2 } from 'lucide-react';
import {
  HomePageConfig,
  HomePageJournalArticle,
  HomePageLinkCard,
  HomePagePromiseItem,
  homePageConfigService,
} from '../../services/homePageConfigService';
import AdminImageUploadField from './AdminImageUploadField';
import ProductSearchSelector from './ProductSearchSelector';

type DragSection = 'productCarousels' | 'spotlight' | 'collections' | 'journal' | 'promise';

const inputClass =
  'w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm transition focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100';
const panelClass = 'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm';

const createBlankLinkCard = (): HomePageLinkCard => ({
  title: '',
  subtitle: '',
  image: '',
  link: '/products',
});

const createBlankJournalArticle = (): HomePageJournalArticle => ({
  title: '',
  image: '',
  link: '/about',
  ctaText: 'Read Story',
  imageAlt: '',
  layout: 'landscape',
});

const createBlankPromiseItem = (): HomePagePromiseItem => ({
  icon: '',
  text: '',
});

const moveItem = <T,>(items: T[], from: number, to: number): T[] => {
  if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) {
    return items;
  }
  const next = [...items];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
};

const HomePageManagement = () => {
  const [config, setConfig] = useState<HomePageConfig>(homePageConfigService.getDefaultConfig());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSnapshot, setSavedSnapshot] = useState('');
  const [dragged, setDragged] = useState<{ section: DragSection; index: number } | null>(null);
  const [dragOver, setDragOver] = useState<{ section: DragSection; index: number } | null>(null);

  const spotlightCount = useMemo(() => config.spotlight.cards.length, [config.spotlight.cards.length]);
  const collectionCount = useMemo(() => config.collections.cards.length, [config.collections.cards.length]);
  const journalCount = useMemo(() => config.journal.articles.length, [config.journal.articles.length]);
  const promiseCount = useMemo(() => config.promise.items.length, [config.promise.items.length]);
  const carouselCount = useMemo(() => config.productCarousels.length, [config.productCarousels.length]);

  const currentSnapshot = useMemo(() => JSON.stringify(config), [config]);
  const isDirty = currentSnapshot !== savedSnapshot;

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const data = await homePageConfigService.getAdminConfig();
        if (!mounted) {
          return;
        }
        setConfig(data);
        setSavedSnapshot(JSON.stringify(data));
      } catch (error: any) {
        if (mounted) {
          alert(error.message || 'Failed to load home page management data');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const onDragStart = (section: DragSection, index: number) => {
    setDragged({ section, index });
  };

  const onDragOver = (event: DragEvent<HTMLDivElement>, section: DragSection, index: number) => {
    event.preventDefault();
    if (dragged?.section === section) {
      setDragOver({ section, index });
    }
  };

  const clearDrag = () => {
    setDragged(null);
    setDragOver(null);
  };

  const handleDrop = (section: DragSection, toIndex: number) => {
    if (!dragged || dragged.section !== section) {
      clearDrag();
      return;
    }

    const fromIndex = dragged.index;
    if (fromIndex === toIndex) {
      clearDrag();
      return;
    }

    setConfig((prev) => {
      if (section === 'productCarousels') {
        return { ...prev, productCarousels: moveItem(prev.productCarousels, fromIndex, toIndex) };
      }
      if (section === 'spotlight') {
        return {
          ...prev,
          spotlight: { ...prev.spotlight, cards: moveItem(prev.spotlight.cards, fromIndex, toIndex) },
        };
      }
      if (section === 'collections') {
        return {
          ...prev,
          collections: { ...prev.collections, cards: moveItem(prev.collections.cards, fromIndex, toIndex) },
        };
      }
      if (section === 'journal') {
        return {
          ...prev,
          journal: { ...prev.journal, articles: moveItem(prev.journal.articles, fromIndex, toIndex) },
        };
      }
      return {
        ...prev,
        promise: { ...prev.promise, items: moveItem(prev.promise.items, fromIndex, toIndex) },
      };
    });

    clearDrag();
  };

  const updateLinkCard = (section: 'spotlight' | 'collections', index: number, key: keyof HomePageLinkCard, value: string) => {
    setConfig((prev) => {
      const cards = [...prev[section].cards];
      cards[index] = { ...cards[index], [key]: value };
      return { ...prev, [section]: { ...prev[section], cards } };
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
      productCarousels: [
        ...prev.productCarousels,
        {
          title: '',
          viewAllLink: '/products',
          enabled: true,
          sourceType: 'category',
          manualProductIds: [],
          sourceCategory: 'furniture',
          sourceSubcategory: '',
          sourceTag: '',
          limit: 10,
          sortBy: 'createdAt',
          sortOrder: 'desc',
        },
      ],
    }));
  };

  const removeProductCarousel = (index: number) => {
    setConfig((prev) => ({
      ...prev,
      productCarousels: prev.productCarousels.filter((_, i) => i !== index),
    }));
  };

  const addJournalArticle = () => {
    setConfig((prev) => ({
      ...prev,
      journal: {
        ...prev.journal,
        articles: [...prev.journal.articles, createBlankJournalArticle()],
      },
    }));
  };

  const removeJournalArticle = (index: number) => {
    setConfig((prev) => ({
      ...prev,
      journal: {
        ...prev.journal,
        articles: prev.journal.articles.filter((_, i) => i !== index),
      },
    }));
  };

  const addPromiseItem = () => {
    setConfig((prev) => ({
      ...prev,
      promise: {
        ...prev.promise,
        items: [...prev.promise.items, createBlankPromiseItem()],
      },
    }));
  };

  const removePromiseItem = (index: number) => {
    setConfig((prev) => ({
      ...prev,
      promise: {
        ...prev.promise,
        items: prev.promise.items.filter((_, i) => i !== index),
      },
    }));
  };

  const save = async () => {
    try {
      setSaving(true);
      const updated = await homePageConfigService.updateAdminConfig(config);
      setConfig(updated);
      setSavedSnapshot(JSON.stringify(updated));
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
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
        Loading home page settings...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="sticky top-4 z-20 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-cyan-50 px-5 py-4 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-700">
              <Sparkles size={16} />
              <span className="text-xs font-semibold uppercase tracking-wider">Shopify Style Editor</span>
            </div>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">Home Page Management</h2>
            <p className="mt-1 text-sm text-slate-600">Drag cards to reorder. Changes are saved exactly as arranged.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isDirty ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
              {isDirty ? 'Unsaved changes' : 'All changes saved'}
            </span>
            <button
              onClick={resetToDefault}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <RotateCcw size={14} />
              Reset Form
            </button>
            <button
              onClick={save}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
            >
              <Save size={14} />
              {saving ? 'Saving...' : 'Save Home'}
            </button>
          </div>
        </div>
      </div>

      <div className={panelClass}>
        <h3 className="text-lg font-semibold text-slate-900">Highlights Carousel Header</h3>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <input
            value={config.newArrivals.title}
            onChange={(e) => setConfig((prev) => ({ ...prev, newArrivals: { ...prev.newArrivals, title: e.target.value } }))}
            placeholder="Title"
            className={inputClass}
          />
          <input
            value={config.newArrivals.ctaText}
            onChange={(e) => setConfig((prev) => ({ ...prev, newArrivals: { ...prev.newArrivals, ctaText: e.target.value } }))}
            placeholder="CTA text"
            className={inputClass}
          />
          <input
            value={config.newArrivals.ctaLink}
            onChange={(e) => setConfig((prev) => ({ ...prev, newArrivals: { ...prev.newArrivals, ctaLink: e.target.value } }))}
            placeholder="CTA link"
            className={inputClass}
          />
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <select
            value={config.newArrivals.sourceType}
            onChange={(e) =>
              setConfig((prev) => ({
                ...prev,
                newArrivals: { ...prev.newArrivals, sourceType: e.target.value as 'category' | 'tag' | 'manual' },
              }))
            }
            className={inputClass}
          >
            <option value="category">Source: Category</option>
            <option value="tag">Source: Tag</option>
            <option value="manual">Source: Manual Product IDs</option>
          </select>
          <input
            type="number"
            min={1}
            max={24}
            value={config.newArrivals.limit}
            onChange={(e) => {
              const value = Math.min(24, Math.max(1, Number(e.target.value || 12)));
              setConfig((prev) => ({ ...prev, newArrivals: { ...prev.newArrivals, limit: value } }));
            }}
            placeholder="Products count"
            className={inputClass}
          />
          {config.newArrivals.sourceType === 'category' && (
            <input
              value={config.newArrivals.category}
              onChange={(e) => setConfig((prev) => ({ ...prev, newArrivals: { ...prev.newArrivals, category: e.target.value } }))}
              placeholder="Category (example: furniture)"
              className={inputClass}
            />
          )}
          {config.newArrivals.sourceType === 'tag' && (
            <input
              value={config.newArrivals.tag}
              onChange={(e) => setConfig((prev) => ({ ...prev, newArrivals: { ...prev.newArrivals, tag: e.target.value } }))}
              placeholder="Tag (example: best seller)"
              className={inputClass}
            />
          )}
          {config.newArrivals.sourceType === 'manual' && (
            <ProductSearchSelector
              selectedProductIds={config.newArrivals.manualProductIds}
              onChange={(manualProductIds: string[]) =>
                setConfig((prev) => ({
                  ...prev,
                  newArrivals: { ...prev.newArrivals, manualProductIds },
                }))
              }
            />
          )}
          <input
            value={config.newArrivals.sortBy}
            onChange={(e) => setConfig((prev) => ({ ...prev, newArrivals: { ...prev.newArrivals, sortBy: e.target.value } }))}
            placeholder="Sort by (createdAt/priceUSD/name)"
            className={inputClass}
          />
          <select
            value={config.newArrivals.sortOrder}
            onChange={(e) =>
              setConfig((prev) => ({
                ...prev,
                newArrivals: { ...prev.newArrivals, sortOrder: e.target.value as 'asc' | 'desc' },
              }))
            }
            className={inputClass}
          >
            <option value="desc">Sort: Descending</option>
            <option value="asc">Sort: Ascending</option>
          </select>
          <label className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={config.newArrivals.featured}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  newArrivals: { ...prev.newArrivals, featured: e.target.checked },
                }))
              }
            />
            Featured only
          </label>
          <label className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={config.newArrivals.marbleFurnitureOnly}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  newArrivals: { ...prev.newArrivals, marbleFurnitureOnly: e.target.checked },
                }))
              }
            />
            Marble furniture only
          </label>
        </div>
      </div>

      <div className={panelClass}>
        <h3 className="text-lg font-semibold text-slate-900">Collection Just For You Header</h3>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <input
            value={config.personalizedCollection.title}
            onChange={(e) => setConfig((prev) => ({ ...prev, personalizedCollection: { ...prev.personalizedCollection, title: e.target.value } }))}
            placeholder="Section title"
            className={inputClass}
          />
          <input
            value={config.personalizedCollection.subtitle}
            onChange={(e) => setConfig((prev) => ({ ...prev, personalizedCollection: { ...prev.personalizedCollection, subtitle: e.target.value } }))}
            placeholder="Section subtitle"
            className={inputClass}
          />
          <input
            value={config.personalizedCollection.viewMoreText}
            onChange={(e) => setConfig((prev) => ({ ...prev, personalizedCollection: { ...prev.personalizedCollection, viewMoreText: e.target.value } }))}
            placeholder="View more text"
            className={inputClass}
          />
          <input
            value={config.personalizedCollection.viewMoreLink}
            onChange={(e) => setConfig((prev) => ({ ...prev, personalizedCollection: { ...prev.personalizedCollection, viewMoreLink: e.target.value } }))}
            placeholder="View more link"
            className={inputClass}
          />
        </div>
      </div>

      <div className={panelClass}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Product Carousels ({carouselCount})</h3>
          <button
            onClick={addProductCarousel}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Plus size={14} /> Add Carousel
          </button>
        </div>
        <p className="mt-1 text-xs text-slate-500">Drag rows by the grip icon to reorder homepage carousels.</p>

        <div className="mt-4 space-y-3">
          {config.productCarousels.map((carousel, index) => (
            <div
              key={`carousel-${index}`}
              draggable
              onDragStart={() => onDragStart('productCarousels', index)}
              onDragOver={(e) => onDragOver(e, 'productCarousels', index)}
              onDrop={() => handleDrop('productCarousels', index)}
              onDragEnd={clearDrag}
              className={`grid grid-cols-1 gap-3 rounded-xl border bg-slate-50/70 p-3 md:grid-cols-12 ${dragOver?.section === 'productCarousels' && dragOver.index === index ? 'border-emerald-400' : 'border-slate-200'}`}
            >
              <div className="md:col-span-1 flex items-center justify-center text-slate-400 cursor-grab active:cursor-grabbing">
                <GripVertical size={18} />
              </div>
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
                className="md:col-span-4 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm"
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
                className="md:col-span-4 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm"
              />
              <label className="md:col-span-2 flex items-center gap-2 text-sm text-slate-700">
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
              <select
                value={carousel.sourceType || 'category'}
                onChange={(e) => {
                  const value = e.target.value as 'category' | 'tag' | 'manual';
                  setConfig((prev) => {
                    const next = [...prev.productCarousels];
                    next[index] = { ...next[index], sourceType: value };
                    return { ...prev, productCarousels: next };
                  });
                }}
                className="md:col-span-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm"
              >
                <option value="category">Category</option>
                <option value="tag">Tag</option>
                <option value="manual">Manual IDs</option>
              </select>
              {(carousel.sourceType || 'category') === 'category' && (
                <>
                  <select
                    value={carousel.sourceCategory || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      setConfig((prev) => {
                        const next = [...prev.productCarousels];
                        next[index] = { ...next[index], sourceCategory: value, sourceSubcategory: '' };
                        return { ...prev, productCarousels: next };
                      });
                    }}
                    className="md:col-span-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm"
                  >
                    <option value="">-- Category --</option>
                    <option value="furniture">Furniture</option>
                    <option value="slabs">Slabs</option>
                    <option value="tiles">Tiles</option>
                    <option value="artifacts">Artifacts</option>
                  </select>
                  <select
                    value={carousel.sourceSubcategory || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      setConfig((prev) => {
                        const next = [...prev.productCarousels];
                        next[index] = { ...next[index], sourceSubcategory: value };
                        return { ...prev, productCarousels: next };
                      });
                    }}
                    className="md:col-span-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm"
                  >
                    <option value="">-- All subcategories --</option>
                    {carousel.sourceCategory === 'furniture' && (
                      <>
                        <option value="coffee-table">Coffee Table</option>
                        <option value="console-table">Console Table</option>
                        <option value="dining-table">Dining Table</option>
                        <option value="side-table">Side Table</option>
                        <option value="tables">Tables</option>
                        <option value="wash-basins">Wash Basins</option>
                        <option value="pedestal">Pedestal</option>
                        <option value="countertop">Countertop</option>
                        <option value="sculptures">Sculptures</option>
                        <option value="benches">Benches</option>
                        <option value="planters">Planters</option>
                        <option value="fountains">Fountains</option>
                        <option value="fireplace">Fireplace</option>
                        <option value="columns">Columns</option>
                        <option value="urns">Urns</option>
                      </>
                    )}
                    {carousel.sourceCategory === 'slabs' && (
                      <>
                        <option value="granite">Granite</option>
                        <option value="marble">Marble</option>
                        <option value="quartzite">Quartzite</option>
                        <option value="onyx">Onyx</option>
                        <option value="limestone">Limestone</option>
                        <option value="travertine">Travertine</option>
                        <option value="sandstone">Sandstone</option>
                        <option value="slate">Slate</option>
                      </>
                    )}
                  </select>
                </>
              )}
              {(carousel.sourceType || 'category') === 'tag' && (
                <input
                  value={carousel.sourceTag || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    setConfig((prev) => {
                      const next = [...prev.productCarousels];
                      next[index] = { ...next[index], sourceTag: value };
                      return { ...prev, productCarousels: next };
                    });
                  }}
                  placeholder="Source tag"
                  className="md:col-span-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm"
                />
              )}
              {(carousel.sourceType || 'category') === 'manual' && (
                <ProductSearchSelector
                  selectedProductIds={carousel.manualProductIds || []}
                  onChange={(manualProductIds: string[]) => {
                    setConfig((prev) => {
                      const next = [...prev.productCarousels];
                      next[index] = { ...next[index], manualProductIds };
                      return { ...prev, productCarousels: next };
                    });
                  }}
                  maxItems={24}
                  className="md:col-span-3"
                />
              )}
              <input
                type="number"
                min={1}
                max={24}
                value={carousel.limit || 10}
                onChange={(e) => {
                  const value = Math.min(24, Math.max(1, Number(e.target.value || 10)));
                  setConfig((prev) => {
                    const next = [...prev.productCarousels];
                    next[index] = { ...next[index], limit: value };
                    return { ...prev, productCarousels: next };
                  });
                }}
                placeholder="Limit"
                className="md:col-span-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm"
              />
              <button
                onClick={() => removeProductCarousel(index)}
                className="md:col-span-1 inline-flex items-center justify-center rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className={panelClass}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Spotlight Carousel ({spotlightCount})</h3>
          <button
            onClick={() => addLinkCard('spotlight')}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Plus size={14} /> Add Slide
          </button>
        </div>

        <input
          value={config.spotlight.title}
          onChange={(e) => setConfig((prev) => ({ ...prev, spotlight: { ...prev.spotlight, title: e.target.value } }))}
          placeholder="Section title"
          className={`mt-4 ${inputClass}`}
        />

        <div className="mt-4 space-y-3">
          {config.spotlight.cards.map((card, index) => (
            <div
              key={`spotlight-${index}`}
              draggable
              onDragStart={() => onDragStart('spotlight', index)}
              onDragOver={(e) => onDragOver(e, 'spotlight', index)}
              onDrop={() => handleDrop('spotlight', index)}
              onDragEnd={clearDrag}
              className={`grid grid-cols-1 gap-3 rounded-xl border bg-slate-50/70 p-3 md:grid-cols-12 ${dragOver?.section === 'spotlight' && dragOver.index === index ? 'border-emerald-400' : 'border-slate-200'}`}
            >
              <div className="md:col-span-1 flex items-center justify-center text-slate-400 cursor-grab active:cursor-grabbing"><GripVertical size={18} /></div>
              <input value={card.title} onChange={(e) => updateLinkCard('spotlight', index, 'title', e.target.value)} placeholder="Title" className="md:col-span-3 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm" />
              <input value={card.subtitle} onChange={(e) => updateLinkCard('spotlight', index, 'subtitle', e.target.value)} placeholder="Subtitle" className="md:col-span-3 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm" />
              <AdminImageUploadField
                value={card.image}
                onChange={(url) => updateLinkCard('spotlight', index, 'image', url)}
                placeholder="Image URL/path"
                className="md:col-span-2"
              />
              <input value={card.link} onChange={(e) => updateLinkCard('spotlight', index, 'link', e.target.value)} placeholder="Link" className="md:col-span-2 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm" />
              <button onClick={() => removeLinkCard('spotlight', index)} className="md:col-span-1 inline-flex items-center justify-center rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      </div>

      <div className={panelClass}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Collections Carousel ({collectionCount})</h3>
          <button
            onClick={() => addLinkCard('collections')}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Plus size={14} /> Add Card
          </button>
        </div>

        <input
          value={config.collections.title}
          onChange={(e) => setConfig((prev) => ({ ...prev, collections: { ...prev.collections, title: e.target.value } }))}
          placeholder="Section title"
          className={`mt-4 ${inputClass}`}
        />

        <div className="mt-4 space-y-3">
          {config.collections.cards.map((card, index) => (
            <div
              key={`collections-${index}`}
              draggable
              onDragStart={() => onDragStart('collections', index)}
              onDragOver={(e) => onDragOver(e, 'collections', index)}
              onDrop={() => handleDrop('collections', index)}
              onDragEnd={clearDrag}
              className={`grid grid-cols-1 gap-3 rounded-xl border bg-slate-50/70 p-3 md:grid-cols-12 ${dragOver?.section === 'collections' && dragOver.index === index ? 'border-emerald-400' : 'border-slate-200'}`}
            >
              <div className="md:col-span-1 flex items-center justify-center text-slate-400 cursor-grab active:cursor-grabbing"><GripVertical size={18} /></div>
              <input value={card.title} onChange={(e) => updateLinkCard('collections', index, 'title', e.target.value)} placeholder="Title" className="md:col-span-3 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm" />
              <input value={card.subtitle} onChange={(e) => updateLinkCard('collections', index, 'subtitle', e.target.value)} placeholder="Subtitle" className="md:col-span-2 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm" />
              <AdminImageUploadField
                value={card.image}
                onChange={(url) => updateLinkCard('collections', index, 'image', url)}
                placeholder="Image URL/path"
                className="md:col-span-3"
              />
              <input value={card.link} onChange={(e) => updateLinkCard('collections', index, 'link', e.target.value)} placeholder="Link" className="md:col-span-2 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm" />
              <button onClick={() => removeLinkCard('collections', index)} className="md:col-span-1 inline-flex items-center justify-center rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      </div>

      <div className={panelClass}>
        <h3 className="text-lg font-semibold text-slate-900">Product Video Carousel</h3>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <input
            value={config.videoCarousel.title}
            onChange={(e) => setConfig((prev) => ({ ...prev, videoCarousel: { ...prev.videoCarousel, title: e.target.value } }))}
            placeholder="Section title"
            className={inputClass}
          />
          <input
            value={config.videoCarousel.ctaText}
            onChange={(e) => setConfig((prev) => ({ ...prev, videoCarousel: { ...prev.videoCarousel, ctaText: e.target.value } }))}
            placeholder="CTA text"
            className={inputClass}
          />
          <input
            value={config.videoCarousel.ctaLink}
            onChange={(e) => setConfig((prev) => ({ ...prev, videoCarousel: { ...prev.videoCarousel, ctaLink: e.target.value } }))}
            placeholder="CTA link"
            className={inputClass}
          />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <label className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={config.videoCarousel.enabled}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  videoCarousel: { ...prev.videoCarousel, enabled: e.target.checked },
                }))
              }
            />
            Enable video carousel
          </label>

          <select
            value={config.videoCarousel.sourceType}
            onChange={(e) =>
              setConfig((prev) => ({
                ...prev,
                videoCarousel: {
                  ...prev.videoCarousel,
                  sourceType: e.target.value as 'category' | 'tag' | 'manual',
                },
              }))
            }
            className={inputClass}
          >
            <option value="category">Source: Category</option>
            <option value="tag">Source: Tag</option>
            <option value="manual">Source: Manual Product IDs</option>
          </select>

          <input
            type="number"
            min={1}
            max={24}
            value={config.videoCarousel.limit}
            onChange={(e) => {
              const value = Math.min(24, Math.max(1, Number(e.target.value || 8)));
              setConfig((prev) => ({ ...prev, videoCarousel: { ...prev.videoCarousel, limit: value } }));
            }}
            placeholder="Videos count"
            className={inputClass}
          />

          {config.videoCarousel.sourceType === 'category' && (
            <input
              value={config.videoCarousel.sourceCategory}
              onChange={(e) => setConfig((prev) => ({ ...prev, videoCarousel: { ...prev.videoCarousel, sourceCategory: e.target.value } }))}
              placeholder="Category (example: furniture)"
              className={inputClass}
            />
          )}

          {config.videoCarousel.sourceType === 'tag' && (
            <input
              value={config.videoCarousel.sourceTag}
              onChange={(e) => setConfig((prev) => ({ ...prev, videoCarousel: { ...prev.videoCarousel, sourceTag: e.target.value } }))}
              placeholder="Tag (example: best seller)"
              className={inputClass}
            />
          )}

          {config.videoCarousel.sourceType === 'manual' && (
            <ProductSearchSelector
              selectedProductIds={config.videoCarousel.manualProductIds}
              onChange={(manualProductIds: string[]) =>
                setConfig((prev) => ({
                  ...prev,
                  videoCarousel: { ...prev.videoCarousel, manualProductIds },
                }))
              }
              maxItems={24}
              className="md:col-span-3"
            />
          )}

          <input
            value={config.videoCarousel.sortBy}
            onChange={(e) => setConfig((prev) => ({ ...prev, videoCarousel: { ...prev.videoCarousel, sortBy: e.target.value } }))}
            placeholder="Sort by (createdAt/priceUSD/name)"
            className={inputClass}
          />
          <select
            value={config.videoCarousel.sortOrder}
            onChange={(e) =>
              setConfig((prev) => ({
                ...prev,
                videoCarousel: {
                  ...prev.videoCarousel,
                  sortOrder: e.target.value as 'asc' | 'desc',
                },
              }))
            }
            className={inputClass}
          >
            <option value="desc">Sort: Descending</option>
            <option value="asc">Sort: Ascending</option>
          </select>
        </div>
      </div>

      <div className={panelClass}>
        <h3 className="text-lg font-semibold text-slate-900">Featured Banner</h3>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <input value={config.featuredBanner.title} onChange={(e) => setConfig((prev) => ({ ...prev, featuredBanner: { ...prev.featuredBanner, title: e.target.value } }))} placeholder="Banner title" className={inputClass} />
          <input value={config.featuredBanner.ctaText} onChange={(e) => setConfig((prev) => ({ ...prev, featuredBanner: { ...prev.featuredBanner, ctaText: e.target.value } }))} placeholder="CTA text" className={inputClass} />
          <input value={config.featuredBanner.link} onChange={(e) => setConfig((prev) => ({ ...prev, featuredBanner: { ...prev.featuredBanner, link: e.target.value } }))} placeholder="CTA link" className={inputClass} />
          <input value={config.featuredBanner.imageAlt} onChange={(e) => setConfig((prev) => ({ ...prev, featuredBanner: { ...prev.featuredBanner, imageAlt: e.target.value } }))} placeholder="Image alt text" className={inputClass} />
          <AdminImageUploadField
            value={config.featuredBanner.image}
            onChange={(url) => setConfig((prev) => ({ ...prev, featuredBanner: { ...prev.featuredBanner, image: url } }))}
            placeholder="Image URL/path"
            aspectRatio={16 / 9}
          />
          <AdminImageUploadField
            value={config.featuredBanner.fallbackImage}
            onChange={(url) => setConfig((prev) => ({ ...prev, featuredBanner: { ...prev.featuredBanner, fallbackImage: url } }))}
            placeholder="Fallback image URL/path"
            aspectRatio={16 / 9}
          />
          <textarea value={config.featuredBanner.body} onChange={(e) => setConfig((prev) => ({ ...prev, featuredBanner: { ...prev.featuredBanner, body: e.target.value } }))} placeholder="Banner description" rows={3} className="md:col-span-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm transition focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100" />
        </div>
      </div>

      <div className={panelClass}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Journal Section ({journalCount})</h3>
          <button onClick={addJournalArticle} className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"><Plus size={14} /> Add Journal Card</button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <input value={config.journal.titlePrefix} onChange={(e) => setConfig((prev) => ({ ...prev, journal: { ...prev.journal, titlePrefix: e.target.value } }))} placeholder="Title prefix" className={inputClass} />
          <input value={config.journal.titleSuffix} onChange={(e) => setConfig((prev) => ({ ...prev, journal: { ...prev.journal, titleSuffix: e.target.value } }))} placeholder="Title suffix" className={inputClass} />
        </div>

        <div className="mt-4 space-y-3">
          {config.journal.articles.map((article, index) => (
            <div
              key={`journal-${index}`}
              draggable
              onDragStart={() => onDragStart('journal', index)}
              onDragOver={(e) => onDragOver(e, 'journal', index)}
              onDrop={() => handleDrop('journal', index)}
              onDragEnd={clearDrag}
              className={`grid grid-cols-1 gap-3 rounded-xl border bg-slate-50/70 p-3 md:grid-cols-12 ${dragOver?.section === 'journal' && dragOver.index === index ? 'border-emerald-400' : 'border-slate-200'}`}
            >
              <div className="md:col-span-1 flex items-center justify-center text-slate-400 cursor-grab active:cursor-grabbing"><GripVertical size={18} /></div>
              <input value={article.title} onChange={(e) => setConfig((prev) => {
                const next = [...prev.journal.articles];
                next[index] = { ...next[index], title: e.target.value };
                return { ...prev, journal: { ...prev.journal, articles: next } };
              })} placeholder="Article title" className="md:col-span-3 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm" />
              <AdminImageUploadField
                value={article.image}
                onChange={(url) => setConfig((prev) => {
                  const next = [...prev.journal.articles];
                  next[index] = { ...next[index], image: url };
                  return { ...prev, journal: { ...prev.journal, articles: next } };
                })}
                placeholder="Image URL/path"
                className="md:col-span-2"
              />
              <input value={article.link} onChange={(e) => setConfig((prev) => {
                const next = [...prev.journal.articles];
                next[index] = { ...next[index], link: e.target.value };
                return { ...prev, journal: { ...prev.journal, articles: next } };
              })} placeholder="Link" className="md:col-span-2 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm" />
              <input value={article.ctaText} onChange={(e) => setConfig((prev) => {
                const next = [...prev.journal.articles];
                next[index] = { ...next[index], ctaText: e.target.value };
                return { ...prev, journal: { ...prev.journal, articles: next } };
              })} placeholder="CTA text" className="md:col-span-2 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm" />
              <input value={article.imageAlt} onChange={(e) => setConfig((prev) => {
                const next = [...prev.journal.articles];
                next[index] = { ...next[index], imageAlt: e.target.value };
                return { ...prev, journal: { ...prev.journal, articles: next } };
              })} placeholder="Image alt" className="md:col-span-1 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm" />
              <select value={article.layout} onChange={(e) => setConfig((prev) => {
                const next = [...prev.journal.articles];
                next[index] = { ...next[index], layout: e.target.value as 'landscape' | 'portrait' };
                return { ...prev, journal: { ...prev.journal, articles: next } };
              })} className="md:col-span-1 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm">
                <option value="landscape">Landscape</option>
                <option value="portrait">Portrait</option>
              </select>
              <button onClick={() => removeJournalArticle(index)} className="md:col-span-1 inline-flex items-center justify-center rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      </div>

      <div className={panelClass}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Promise Section ({promiseCount})</h3>
          <button onClick={addPromiseItem} className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"><Plus size={14} /> Add Promise Item</button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <input value={config.promise.titlePrefix} onChange={(e) => setConfig((prev) => ({ ...prev, promise: { ...prev.promise, titlePrefix: e.target.value } }))} placeholder="Title prefix" className={inputClass} />
          <input value={config.promise.titleHighlight} onChange={(e) => setConfig((prev) => ({ ...prev, promise: { ...prev.promise, titleHighlight: e.target.value } }))} placeholder="Title highlight" className={inputClass} />
          <input value={config.promise.ctaText} onChange={(e) => setConfig((prev) => ({ ...prev, promise: { ...prev.promise, ctaText: e.target.value } }))} placeholder="CTA text" className={inputClass} />
          <input value={config.promise.ctaLink} onChange={(e) => setConfig((prev) => ({ ...prev, promise: { ...prev.promise, ctaLink: e.target.value } }))} placeholder="CTA link" className={inputClass} />
          <textarea value={config.promise.body} onChange={(e) => setConfig((prev) => ({ ...prev, promise: { ...prev.promise, body: e.target.value } }))} placeholder="Promise description" rows={3} className="md:col-span-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm transition focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100" />
        </div>

        <div className="mt-4 space-y-3">
          {config.promise.items.map((item, index) => (
            <div
              key={`promise-${index}`}
              draggable
              onDragStart={() => onDragStart('promise', index)}
              onDragOver={(e) => onDragOver(e, 'promise', index)}
              onDrop={() => handleDrop('promise', index)}
              onDragEnd={clearDrag}
              className={`grid grid-cols-1 gap-3 rounded-xl border bg-slate-50/70 p-3 md:grid-cols-12 ${dragOver?.section === 'promise' && dragOver.index === index ? 'border-emerald-400' : 'border-slate-200'}`}
            >
              <div className="md:col-span-1 flex items-center justify-center text-slate-400 cursor-grab active:cursor-grabbing"><GripVertical size={18} /></div>
              <input value={item.icon} onChange={(e) => setConfig((prev) => {
                const next = [...prev.promise.items];
                next[index] = { ...next[index], icon: e.target.value };
                return { ...prev, promise: { ...prev.promise, items: next } };
              })} placeholder="SVG path icon" className="md:col-span-6 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm" />
              <input value={item.text} onChange={(e) => setConfig((prev) => {
                const next = [...prev.promise.items];
                next[index] = { ...next[index], text: e.target.value };
                return { ...prev, promise: { ...prev.promise, items: next } };
              })} placeholder="Promise text" className="md:col-span-4 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm" />
              <button onClick={() => removePromiseItem(index)} className="md:col-span-1 inline-flex items-center justify-center rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePageManagement;
