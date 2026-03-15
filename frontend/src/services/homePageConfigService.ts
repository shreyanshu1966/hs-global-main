const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

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
}

export interface HomePageConfig {
  key?: string;
  newArrivals: {
    title: string;
    ctaText: string;
    ctaLink: string;
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
  featuredBanner: {
    title: string;
    body: string;
    ctaText: string;
    link: string;
    image: string;
    fallbackImage: string;
    imageAlt: string;
  };
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const defaultConfig: HomePageConfig = {
  newArrivals: {
    title: 'HS Global Highlights',
    ctaText: 'Explore All Products',
    ctaLink: '/products',
  },
  personalizedCollection: {
    title: 'Collection Just For You',
    subtitle: 'Get Inspired by this collection of items picked just for you',
    viewMoreText: 'View More',
    viewMoreLink: '/products',
  },
  productCarousels: [
    { title: 'Signature Marble Furniture', viewAllLink: '/products?cat=furniture', enabled: true },
    { title: 'Luxury Marble Furniture Series', viewAllLink: '/products?cat=furniture', enabled: true },
    { title: 'Marble Furniture Favorites', viewAllLink: '/products?cat=furniture', enabled: true },
    { title: 'Export-Ready Marble Furniture', viewAllLink: '/products?cat=furniture', enabled: true },
  ],
  spotlight: {
    title: 'HS Global Spotlight',
    cards: [
      { title: 'Italian Marble Excellence', subtitle: 'Browse Slab Collections', image: '/marble-solutions.webp', link: '/products' },
      { title: 'Premium Granite Program', subtitle: 'Explore Granite Range', image: '/granite-solutions.webp', link: '/products' },
      { title: 'Luxury Furniture Craft', subtitle: 'View Furniture Pieces', image: '/service.webp', link: '/products?cat=furniture' },
      { title: 'Global Export Network', subtitle: 'See Delivery Capability', image: '/export.webp', link: '/services' },
      { title: 'Tailored Fabrication', subtitle: 'Review Custom Services', image: '/services-custom-fabrication.png', link: '/services' },
      { title: 'Project Gallery', subtitle: 'Discover Completed Works', image: '/gallery-hero.webp', link: '/gallery' },
    ],
  },
  collections: {
    title: 'Explore HS Global Collections',
    cards: [
      { title: 'Marble Coffee Tables', subtitle: '', image: '/marble-solutions.webp', link: '/products?cat=furniture#coffee-table' },
      { title: 'Marble Console Tables', subtitle: '', image: '/granite-solutions.webp', link: '/products?cat=furniture#console-table' },
      { title: 'Luxury Marble Furniture', subtitle: '', image: '/service.webp', link: '/products?cat=furniture' },
      { title: 'Project Gallery', subtitle: '', image: '/gallery-hero.webp', link: '/gallery' },
      { title: 'Talk to HS Global Team', subtitle: '', image: '/export.webp', link: '/contact' },
    ],
  },
  featuredBanner: {
    title: 'Build Your Signature Stone Collection',
    body: 'From concept and cutting to export logistics, HS Global delivers premium marble and granite solutions for architects, designers, and global buyers.',
    ctaText: 'Start Your Project',
    link: '/contact',
    image: '/banner4.webp',
    fallbackImage: '/banner.webp',
    imageAlt: 'HS Global Export Services',
  },
};

const normalizeConfig = (config?: Partial<HomePageConfig> | null): HomePageConfig => ({
  ...defaultConfig,
  ...config,
  newArrivals: { ...defaultConfig.newArrivals, ...(config?.newArrivals || {}) },
  personalizedCollection: { ...defaultConfig.personalizedCollection, ...(config?.personalizedCollection || {}) },
  spotlight: {
    ...defaultConfig.spotlight,
    ...(config?.spotlight || {}),
    cards: Array.isArray(config?.spotlight?.cards) ? config!.spotlight!.cards : defaultConfig.spotlight.cards,
  },
  collections: {
    ...defaultConfig.collections,
    ...(config?.collections || {}),
    cards: Array.isArray(config?.collections?.cards) ? config!.collections!.cards : defaultConfig.collections.cards,
  },
  featuredBanner: { ...defaultConfig.featuredBanner, ...(config?.featuredBanner || {}) },
  productCarousels: Array.isArray(config?.productCarousels) ? config!.productCarousels! : defaultConfig.productCarousels,
});

export const homePageConfigService = {
  getDefaultConfig(): HomePageConfig {
    return JSON.parse(JSON.stringify(defaultConfig));
  },

  async getPublicConfig(): Promise<HomePageConfig> {
    const response = await fetch(`${API_URL}/homepage`, {
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
};
