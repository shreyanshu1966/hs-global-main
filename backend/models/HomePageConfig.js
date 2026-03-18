const mongoose = require('mongoose');

const linkCardSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, default: '', trim: true },
    image: { type: String, required: true, trim: true },
    link: { type: String, default: '/products', trim: true },
  },
  { _id: false }
);

const promiseItemSchema = new mongoose.Schema(
  {
    icon: { type: String, required: true, trim: true },
    text: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const homePageConfigSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: 'main',
      trim: true,
    },
    newArrivals: {
      title: { type: String, default: 'HS Global Highlights', trim: true },
      ctaText: { type: String, default: 'Explore All Products', trim: true },
      ctaLink: { type: String, default: '/products', trim: true },
      sourceType: { type: String, enum: ['category', 'tag', 'manual'], default: 'category' },
      manualProductIds: { type: [String], default: [] },
      tag: { type: String, default: '', trim: true },
      limit: { type: Number, default: 12, min: 1, max: 24 },
      category: { type: String, default: '', trim: true },
      featured: { type: Boolean, default: false },
      sortBy: { type: String, default: 'createdAt', trim: true },
      sortOrder: { type: String, enum: ['asc', 'desc'], default: 'desc' },
      marbleFurnitureOnly: { type: Boolean, default: true },
    },
    personalizedCollection: {
      title: { type: String, default: 'Collection Just For You', trim: true },
      subtitle: {
        type: String,
        default: 'Get Inspired by this collection of items picked just for you',
        trim: true,
      },
      viewMoreText: { type: String, default: 'View More', trim: true },
      viewMoreLink: { type: String, default: '/products', trim: true },
    },
    productCarousels: [
      {
        title: { type: String, required: true, trim: true },
        viewAllLink: { type: String, required: true, trim: true },
        enabled: { type: Boolean, default: true },
        sourceType: { type: String, enum: ['category', 'tag', 'manual'], default: 'category' },
        manualProductIds: { type: [String], default: [] },
        sourceCategory: { type: String, default: '', trim: true },
        sourceTag: { type: String, default: '', trim: true },
        limit: { type: Number, default: 10, min: 1, max: 24 },
        sortBy: { type: String, default: 'createdAt', trim: true },
        sortOrder: { type: String, enum: ['asc', 'desc'], default: 'desc' },
      },
    ],
    spotlight: {
      title: { type: String, default: 'HS Global Spotlight', trim: true },
      cards: {
        type: [linkCardSchema],
        default: [],
      },
    },
    collections: {
      title: { type: String, default: 'Explore HS Global Collections', trim: true },
      cards: {
        type: [linkCardSchema],
        default: [],
      },
    },
    videoCarousel: {
      title: { type: String, default: 'Product Videos', trim: true },
      ctaText: { type: String, default: 'View All Products', trim: true },
      ctaLink: { type: String, default: '/products', trim: true },
      enabled: { type: Boolean, default: true },
      sourceType: { type: String, enum: ['category', 'tag', 'manual'], default: 'category' },
      manualProductIds: { type: [String], default: [] },
      sourceCategory: { type: String, default: 'furniture', trim: true },
      sourceTag: { type: String, default: '', trim: true },
      limit: { type: Number, default: 8, min: 1, max: 24 },
      sortBy: { type: String, default: 'createdAt', trim: true },
      sortOrder: { type: String, enum: ['asc', 'desc'], default: 'desc' },
    },
    featuredBanner: {
      title: { type: String, default: 'Build Your Signature Stone Collection', trim: true },
      body: {
        type: String,
        default:
          'From concept and cutting to export logistics, HS Global delivers premium marble and granite solutions for architects, designers, and global buyers.',
        trim: true,
      },
      ctaText: { type: String, default: 'Start Your Project', trim: true },
      link: { type: String, default: '/contact', trim: true },
      image: { type: String, default: '/banner4.webp', trim: true },
      fallbackImage: { type: String, default: '/banner.webp', trim: true },
      imageAlt: { type: String, default: 'HS Global Export Services', trim: true },
    },
    journal: {
      titlePrefix: { type: String, default: 'HS Global', trim: true },
      titleSuffix: { type: String, default: 'Journal', trim: true },
      articles: {
        type: [
          new mongoose.Schema(
            {
              title: { type: String, required: true, trim: true },
              image: { type: String, required: true, trim: true },
              link: { type: String, default: '/blog', trim: true },
              ctaText: { type: String, default: 'Read More', trim: true },
              imageAlt: { type: String, default: '', trim: true },
              layout: { type: String, enum: ['landscape', 'portrait'], default: 'landscape' },
            },
            { _id: false }
          ),
        ],
        default: [],
      },
    },
    promise: {
      titlePrefix: { type: String, default: 'The HS Global', trim: true },
      titleHighlight: { type: String, default: 'Promise', trim: true },
      body: {
        type: String,
        default:
          'We commit to premium quality, transparent communication, and dependable execution for every stone project.',
        trim: true,
      },
      ctaText: { type: String, default: 'Learn More', trim: true },
      ctaLink: { type: String, default: '/contact', trim: true },
      items: {
        type: [promiseItemSchema],
        default: [],
      },
    },
  },
  {
    timestamps: true,
  }
);

homePageConfigSchema.statics.getDefaultConfig = function getDefaultConfig() {
  return {
    key: 'main',
    newArrivals: {
      title: 'HS Global Highlights',
      ctaText: 'Explore All Products',
      ctaLink: '/products',
      sourceType: 'category',
      manualProductIds: [],
      tag: '',
      limit: 12,
      category: 'furniture',
      featured: false,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      marbleFurnitureOnly: true,
    },
    personalizedCollection: {
      title: 'Collection Just For You',
      subtitle: 'Get Inspired by this collection of items picked just for you',
      viewMoreText: 'View More',
      viewMoreLink: '/products',
    },
    productCarousels: [
      { title: 'Signature Marble Furniture', viewAllLink: '/products?cat=furniture', enabled: true, sourceType: 'category', manualProductIds: [], sourceCategory: 'furniture', sourceTag: '', limit: 10, sortBy: 'createdAt', sortOrder: 'desc' },
      { title: 'Luxury Marble Furniture Series', viewAllLink: '/products?cat=furniture', enabled: true, sourceType: 'category', manualProductIds: [], sourceCategory: 'furniture', sourceTag: '', limit: 10, sortBy: 'createdAt', sortOrder: 'desc' },
      { title: 'Marble Furniture Favorites', viewAllLink: '/products?cat=furniture', enabled: true, sourceType: 'category', manualProductIds: [], sourceCategory: 'furniture', sourceTag: '', limit: 10, sortBy: 'createdAt', sortOrder: 'desc' },
      { title: 'Export-Ready Marble Furniture', viewAllLink: '/products?cat=furniture', enabled: true, sourceType: 'category', manualProductIds: [], sourceCategory: 'furniture', sourceTag: '', limit: 10, sortBy: 'createdAt', sortOrder: 'desc' },
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
    videoCarousel: {
      title: 'Product Videos',
      ctaText: 'View All Products',
      ctaLink: '/products',
      enabled: true,
      sourceType: 'category',
      manualProductIds: [],
      sourceCategory: 'furniture',
      sourceTag: '',
      limit: 8,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    },
    featuredBanner: {
      title: 'Build Your Signature Stone Collection',
      body:
        'From concept and cutting to export logistics, HS Global delivers premium marble and granite solutions for architects, designers, and global buyers.',
      ctaText: 'Start Your Project',
      link: '/contact',
      image: '/banner4.webp',
      fallbackImage: '/banner.webp',
      imageAlt: 'HS Global Export Services',
    },
    journal: {
      titlePrefix: 'HS Global',
      titleSuffix: 'Journal',
      articles: [
        {
          title: 'Inside HS Global: How Our Craft and Sourcing Teams Deliver Premium Natural Stone Worldwide',
          image: '/about-hero.webp',
          link: '/about',
          ctaText: 'Read Story',
          imageAlt: 'About HS Global',
          layout: 'landscape',
        },
        {
          title: 'End-to-End Services: Quarry Selection, Precision Fabrication, QA, and Export Logistics',
          image: '/services-hero.webp',
          link: '/services',
          ctaText: 'Explore Services',
          imageAlt: 'HS Global Services',
          layout: 'portrait',
        },
      ],
    },
    promise: {
      titlePrefix: 'The HS Global',
      titleHighlight: 'Promise',
      body: 'We commit to premium quality, transparent communication, and dependable execution for every stone project.',
      ctaText: 'Learn More',
      ctaLink: '/contact',
      items: [
        { icon: 'M10.95 15.55 16.6 9.9l-1.425-1.425L10.95 12.7l-2.1-2.1-1.425 1.425 3.525 3.525ZM12 22c-2.317-.583-4.23-1.913-5.737-3.988C4.754 15.938 4 13.633 4 11.1V5l8-3 8 3v6.1c0 2.533-.754 4.838-2.262 6.912C16.229 20.087 14.317 21.418 12 22Zm0-2.1c1.733-.55 3.167-1.65 4.3-3.3s1.7-3.483 1.7-5.5V6.375l-6-2.25-6 2.25V11.1c0 2.017.567 3.85 1.7 5.5s2.567 2.75 4.3 3.3Z', text: 'Verified Premium Stone Sourcing' },
        { icon: 'M4 8h16V6H4v2ZM2 6c0-.55.196-1.02.587-1.412A1.926 1.926 0 0 1 4 4h16c.55 0 1.02.196 1.413.588.391.391.587.862.587 1.412v6H4v6h4.1v2H4c-.55 0-1.02-.196-1.413-.587A1.926 1.926 0 0 1 2 18V6Zm12.95 16-4.25-4.25 1.4-1.4 2.85 2.8 5.65-5.65 1.4 1.45L14.95 22ZM4 6v12-4.5 2.825V6Z', text: 'Transparent Quotations' },
        { icon: 'M15.25 5.5c-.35 0-.646-.12-.887-.362A1.207 1.207 0 0 1 14 4.25c0-.35.12-.646.363-.888.241-.241.537-.362.887-.362s.646.12.887.362c.242.242.363.538.363.888s-.12.646-.363.888a1.207 1.207 0 0 1-.887.362Zm0 16.5c-.35 0-.646-.12-.887-.363A1.207 1.207 0 0 1 14 20.75c0-.35.12-.646.363-.887.241-.242.537-.363.887-.363s.646.12.887.363c.242.241.363.537.363.887s-.12.646-.363.887a1.207 1.207 0 0 1-.887.363Zm4-13c-.35 0-.646-.12-.887-.363A1.207 1.207 0 0 1 18 7.75c0-.35.12-.646.363-.888.241-.241.537-.362.887-.362s.646.12.887.362c.242.242.363.538.363.888s-.12.646-.363.887A1.207 1.207 0 0 1 19.25 9Zm0 9.5c-.35 0-.646-.12-.887-.363A1.207 1.207 0 0 1 18 17.25c0-.35.12-.646.363-.887.241-.242.537-.363.887-.363s.646.12.887.363c.242.241.363.537.363.887s-.12.646-.363.887a1.207 1.207 0 0 1-.887.363Zm1.5-4.75c-.35 0-.646-.12-.887-.363a1.207 1.207 0 0 1-.363-.887c0-.35.12-.646.363-.887.241-.242.537-.363.887-.363s.646.12.887.363c.242.241.363.537.363.887s-.12.646-.363.887a1.207 1.207 0 0 1-.887.363ZM12 22.5a9.738 9.738 0 0 1-3.9-.788 10.099 10.099 0 0 1-3.175-2.137c-.9-.9-1.612-1.958-2.137-3.175A9.738 9.738 0 0 1 2 12.5c0-1.383.263-2.683.788-3.9a10.099 10.099 0 0 1 2.137-3.175c.9-.9 1.958-1.612 3.175-2.137A9.738 9.738 0 0 1 12 2.5v2c-2.233 0-4.125.775-5.675 2.325C4.775 8.375 4 10.267 4 12.5c0 2.233.775 4.125 2.325 5.675C7.875 19.725 9.767 20.5 12 20.5v2Zm3.3-5.3L11 12.9V7.5h2v4.6l3.7 3.7-1.4 1.4Z', text: 'On-Time Production Timelines' },
        { icon: 'M21.025 11.05V19c0 .55-.196 1.02-.587 1.413a1.926 1.926 0 0 1-1.413.587h-14c-.55 0-1.02-.196-1.412-.587A1.926 1.926 0 0 1 3.025 19v-7.95c-.383-.35-.68-.8-.887-1.35-.209-.55-.213-1.15-.013-1.8l1.05-3.4a2.21 2.21 0 0 1 .713-1.075A1.805 1.805 0 0 1 5.075 3h13.9c.45 0 .842.138 1.175.413.333.275.575.637.725 1.087l1.05 3.4c.2.65.196 1.242-.012 1.775a3.95 3.95 0 0 1-.888 1.375Zm-6.8-1.05c.45 0 .792-.154 1.025-.463.233-.308.325-.654.275-1.037l-.55-3.5h-1.95v3.7c0 .35.117.654.35.913.233.258.517.387.85.387Zm-4.5 0c.383 0 .696-.13.938-.387.241-.259.362-.563.362-.913V5h-1.95l-.55 3.5c-.067.4.02.75.263 1.05.241.3.554.45.937.45Zm-4.45 0c.3 0 .563-.108.788-.325.225-.217.362-.492.412-.825L7.025 5h-1.95l-1 3.35c-.1.333-.046.692.163 1.075.208.383.554.575 1.037.575Zm13.5 0c.483 0 .833-.192 1.05-.575.217-.383.267-.742.15-1.075L18.925 5h-1.9l.55 3.85c.05.333.188.608.413.825a1.1 1.1 0 0 0 .787.325Zm-13.75 9h14v-7.05a.605.605 0 0 1-.162.05h-.088c-.45 0-.846-.075-1.188-.225-.341-.15-.679-.392-1.012-.725-.3.3-.642.533-1.025.7-.383.167-.792.25-1.225.25-.45 0-.87-.083-1.262-.25a3.259 3.259 0 0 1-1.038-.7 3.05 3.05 0 0 1-.988.7 2.95 2.95 0 0 1-1.212.25 3.32 3.32 0 0 1-1.312-.25 3.258 3.258 0 0 1-1.038-.7c-.35.35-.696.596-1.037.737A3.01 3.01 0 0 1 5.275 12h-.112a.254.254 0 0 1-.138-.05V19Z', text: 'Multi-Stage Quality Assurance' },
        { icon: 'M2 21v-2h9V7.825A2.92 2.92 0 0 1 9.175 6H6l3 7c0 .833-.342 1.542-1.025 2.125-.683.583-1.508.875-2.475.875-.967 0-1.792-.292-2.475-.875S2 13.833 2 13l3-7H3V4h6.175a2.91 2.91 0 0 1 1.075-1.438A2.906 2.906 0 0 1 12 2c.65 0 1.233.188 1.75.563A2.91 2.91 0 0 1 14.825 4H21v2h-2l3 7c0 .833-.342 1.542-1.025 2.125-.683.583-1.508.875-2.475.875-.967 0-1.792-.292-2.475-.875S15 13.833 15 13l3-7h-3.175A2.918 2.918 0 0 1 13 7.825V19h9v2H2Zm14.625-8h3.75L18.5 8.65 16.625 13Zm-13 0h3.75L5.5 8.65 3.625 13ZM12 6c.283 0 .52-.096.713-.287A.967.967 0 0 0 13 5a.967.967 0 0 0-.287-.713A.968.968 0 0 0 12 4a.968.968 0 0 0-.713.287A.967.967 0 0 0 11 5c0 .283.096.52.287.713.192.191.43.287.713.287Z', text: 'Custom Fabrication Expertise' },
        { icon: 'M6 20a2.893 2.893 0 0 1-2.125-.875A2.893 2.893 0 0 1 3 17H1V6c0-.55.196-1.02.587-1.412A1.926 1.926 0 0 1 3 4h14v4h3l3 4v5h-2c0 .833-.292 1.542-.875 2.125A2.893 2.893 0 0 1 18 20a2.893 2.893 0 0 1-2.125-.875A2.893 2.893 0 0 1 15 17H9c0 .833-.292 1.542-.875 2.125A2.893 2.893 0 0 1 6 20Zm0-2c.283 0 .52-.096.713-.288A.968.968 0 0 0 7 17a.968.968 0 0 0-.287-.712A.967.967 0 0 0 6 16a.967.967 0 0 0-.713.288A.968.968 0 0 0 5 17c0 .283.096.52.287.712.192.192.43.288.713.288Zm-3-3h.8c.283-.3.608-.542.975-.725A2.701 2.701 0 0 1 6 14c.45 0 .858.092 1.225.275.367.183.692.425.975.725H15V6H3v9Zm15 3c.283 0 .52-.096.712-.288A.968.968 0 0 0 19 17a.968.968 0 0 0-.288-.712A.968.968 0 0 0 18 16a.968.968 0 0 0-.712.288A.968.968 0 0 0 17 17c0 .283.096.52.288.712.191.192.429.288.712.288Zm-1-5h4.25L19 10h-2v3Z', text: 'Secure Worldwide Export Delivery' },
      ],
    },
  };
};

module.exports = mongoose.model('HomePageConfig', homePageConfigSchema);
