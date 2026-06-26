const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export interface HomePageLinkCard {
  title: string;
  subtitle: string;
  image: string;
  link: string;
}

export interface HomePageProductCarousel {
  title: string;
  viewAllLink: string;
  enabled: boolean;
  sourceType: 'category' | 'tag' | 'manual';
  manualProductIds: string[];
  sourceCategory: string;
  sourceSubcategory: string;
  sourceTag: string;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface HomePageJournalArticle {
  title: string;
  image: string;
  link: string;
  ctaText: string;
  imageAlt: string;
  layout: 'landscape' | 'portrait';
}

export interface HomePagePromiseItem {
  icon: string;
  text: string;
}

export interface HomePageHeroSlide {
  heading: string;
  subheading: string;
  ctaText: string;
  ctaLink: string;
  backgroundImage: string;
  overlayOpacity: number;
}

export interface HomePageHero {
  slides: HomePageHeroSlide[];
  autoplayInterval: number;
}

export interface HomePageCategoryCards {
  title: string;
  cards: HomePageLinkCard[];
}

export interface HomePageConfig {
  key?: string;
  hero: HomePageHero;
  categoryCards: HomePageCategoryCards;
  newArrivals: {
    title: string;
    ctaText: string;
    ctaLink: string;
    sourceType: 'category' | 'tag' | 'manual';
    manualProductIds: string[];
    tag: string;
    limit: number;
    category: string;
    featured: boolean;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    marbleFurnitureOnly: boolean;
  };
  personalizedCollection: {
    title: string;
    subtitle: string;
    viewMoreText: string;
    viewMoreLink: string;
  };
  productCarousels: HomePageProductCarousel[];
  spotlight: {
    title: string;
    cards: HomePageLinkCard[];
  };
  collections: {
    title: string;
    cards: HomePageLinkCard[];
  };
  videoCarousel: {
    title: string;
    ctaText: string;
    ctaLink: string;
    enabled: boolean;
    sourceType: 'category' | 'tag' | 'manual';
    manualProductIds: string[];
    sourceCategory: string;
    sourceTag: string;
    limit: number;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  };
  featuredBanner: {
    title: string;
    body: string;
    ctaText: string;
    link: string;
    image: string;
    fallbackImage: string;
    imageAlt: string;
  };
  journal: {
    titlePrefix: string;
    titleSuffix: string;
    articles: HomePageJournalArticle[];
  };
  promise: {
    titlePrefix: string;
    titleHighlight: string;
    body: string;
    ctaText: string;
    ctaLink: string;
    items: HomePagePromiseItem[];
  };
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const getAuthToken = () => localStorage.getItem('authToken');

const defaultConfig: HomePageConfig = {
  hero: {
    slides: [
      {
        heading: 'Premium Natural Stone & Marble',
        subheading: 'Discover our exquisite collection of marble, granite, and natural stone products crafted for architects, designers, and global buyers.',
        ctaText: 'Explore Products',
        ctaLink: '/products',
        backgroundImage: 'https://res.cloudinary.com/dynd1aan0/image/upload/f_auto,q_auto/hs-global/public/banner1',
        overlayOpacity: 0.5,
      },
      {
        heading: 'Luxury Handcrafted Marble Furniture',
        subheading: 'Artisanal coffee tables, consoles, and bespoke pieces designed to elevate luxury interiors.',
        ctaText: 'View Furniture',
        ctaLink: '/products?cat=furniture',
        backgroundImage: 'https://res.cloudinary.com/dynd1aan0/image/upload/f_auto,q_auto/hs-global/public/banner2',
        overlayOpacity: 0.5,
      },
      {
        heading: 'Durable Premium Granite',
        subheading: 'Exceptional quality granite slabs and tiles, custom finished and ready for global export.',
        ctaText: 'Explore Granite',
        ctaLink: '/products?cat=granite',
        backgroundImage: 'https://res.cloudinary.com/dynd1aan0/image/upload/f_auto,q_auto/hs-global/public/banner3',
        overlayOpacity: 0.5,
      },
      {
        heading: 'Global Export & Precision Logistics',
        subheading: 'From in-house manufacturing to secure container loading and shipping, we deliver worldwide.',
        ctaText: 'Our Services',
        ctaLink: '/services',
        backgroundImage: 'https://res.cloudinary.com/dynd1aan0/image/upload/f_auto,q_auto/hs-global/public/banner4',
        overlayOpacity: 0.5,
      },
    ],
    autoplayInterval: 5000,
  },
  categoryCards: {
    title: 'Shop By Category',
    cards: [
      { title: 'Marble', subtitle: 'Premium slabs & tiles', image: '/marble-solutions.webp', link: '/products?cat=marble' },
      { title: 'Granite', subtitle: 'Durable natural stone', image: '/granite-solutions.webp', link: '/products?cat=granite' },
      { title: 'Furniture', subtitle: 'Luxury marble furniture', image: '/service.webp', link: '/products?cat=furniture' },
      { title: 'Export', subtitle: 'Global delivery network', image: '/export.webp', link: '/services' },
    ],
  },
  newArrivals: {
    title: '',
    ctaText: '',
    ctaLink: '',
    sourceType: 'category',
    manualProductIds: [],
    tag: '',
    limit: 0,
    category: '',
    featured: false,
    sortBy: '',
    sortOrder: 'desc',
    marbleFurnitureOnly: false,
  },
  personalizedCollection: {
    title: '',
    subtitle: '',
    viewMoreText: '',
    viewMoreLink: '',
  },
  productCarousels: [],
  spotlight: {
    title: '',
    cards: [],
  },
  collections: {
    title: '',
    cards: [],
  },
  videoCarousel: {
    title: '',
    ctaText: '',
    ctaLink: '',
    enabled: false,
    sourceType: 'category',
    manualProductIds: [],
    sourceCategory: '',
    sourceTag: '',
    limit: 0,
    sortBy: '',
    sortOrder: 'desc',
  },
  featuredBanner: {
    title: '',
    body: '',
    ctaText: '',
    link: '',
    image: '',
    fallbackImage: '',
    imageAlt: '',
  },
  journal: {
    titlePrefix: '',
    titleSuffix: '',
    articles: [],
  },
  promise: {
    titlePrefix: '',
    titleHighlight: '',
    body: '',
    ctaText: '',
    ctaLink: '',
    items: [],
  },
};

const normalizeConfig = (config?: Partial<HomePageConfig> | null): HomePageConfig => ({
  ...defaultConfig,
  ...config,
  hero: {
    slides: Array.isArray(config?.hero?.slides) && config.hero.slides.length > 0 ? config.hero.slides : defaultConfig.hero.slides,
    autoplayInterval: config?.hero?.autoplayInterval ?? defaultConfig.hero.autoplayInterval,
  },
  categoryCards: {
    ...defaultConfig.categoryCards,
    ...(config?.categoryCards || {}),
    cards: Array.isArray(config?.categoryCards?.cards) && config.categoryCards.cards.length > 0 ? config.categoryCards.cards : defaultConfig.categoryCards.cards,
  },
  newArrivals: { ...defaultConfig.newArrivals, ...(config?.newArrivals || {}) },
  personalizedCollection: { ...defaultConfig.personalizedCollection, ...(config?.personalizedCollection || {}) },
  spotlight: {
    ...defaultConfig.spotlight,
    ...(config?.spotlight || {}),
    cards: Array.isArray(config?.spotlight?.cards) && config.spotlight.cards.length > 0 ? config.spotlight.cards : defaultConfig.spotlight.cards,
  },
  collections: {
    ...defaultConfig.collections,
    ...(config?.collections || {}),
    cards: Array.isArray(config?.collections?.cards) && config.collections.cards.length > 0 ? config.collections.cards : defaultConfig.collections.cards,
  },
  videoCarousel: { ...defaultConfig.videoCarousel, ...(config?.videoCarousel || {}) },
  featuredBanner: { ...defaultConfig.featuredBanner, ...(config?.featuredBanner || {}) },
  journal: {
    ...defaultConfig.journal,
    ...(config?.journal || {}),
    articles: Array.isArray(config?.journal?.articles) && config.journal.articles.length > 0 ? config.journal.articles : defaultConfig.journal.articles,
  },
  promise: {
    ...defaultConfig.promise,
    ...(config?.promise || {}),
    items: Array.isArray(config?.promise?.items) && config.promise.items.length > 0 ? config.promise.items : defaultConfig.promise.items,
  },
  productCarousels: Array.isArray(config?.productCarousels) && config.productCarousels.length > 0 ? config.productCarousels : defaultConfig.productCarousels,
});

export const homePageConfigService = {
  getDefaultConfig(): HomePageConfig {
    return JSON.parse(JSON.stringify(defaultConfig));
  },

  async getPublicConfig(): Promise<HomePageConfig> {
    // Always revalidate so admin edits to the homepage (hero banners, etc.)
    // appear immediately instead of being masked by the browser's HTTP cache
    // (the API sends Cache-Control: max-age=3600).
    const response = await fetch(`${API_URL}/homepage`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return this.getDefaultConfig();
    }

    const data = await response.json();
    if (!data?.success) {
      return this.getDefaultConfig();
    }

    return normalizeConfig(data.data);
  },

  async getAdminConfig(): Promise<HomePageConfig> {
    const response = await fetch(`${API_URL}/admin/homepage`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to fetch home page configuration');
    }

    const data = await response.json();
    if (!data?.success) {
      throw new Error(data?.message || 'Failed to fetch home page configuration');
    }

    return normalizeConfig(data.data);
  },

  async updateAdminConfig(config: HomePageConfig): Promise<HomePageConfig> {
    const response = await fetch(`${API_URL}/admin/homepage`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to update home page configuration');
    }

    const data = await response.json();
    if (!data?.success) {
      throw new Error(data?.message || 'Failed to update home page configuration');
    }

    return normalizeConfig(data.data);
  },

  async uploadHomePageImage(file: File): Promise<string> {
    const token = getAuthToken();
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_URL}/admin/homepage/upload-image`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to upload image');
    }

    const data = await response.json();
    if (!data?.success || !data?.data?.url) {
      throw new Error(data?.message || 'Failed to upload image');
    }

    return data.data.url;
  },
};
