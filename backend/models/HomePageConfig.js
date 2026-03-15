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
      body:
        'From concept and cutting to export logistics, HS Global delivers premium marble and granite solutions for architects, designers, and global buyers.',
      ctaText: 'Start Your Project',
      link: '/contact',
      image: '/banner4.webp',
      fallbackImage: '/banner.webp',
      imageAlt: 'HS Global Export Services',
    },
  };
};

module.exports = mongoose.model('HomePageConfig', homePageConfigSchema);
