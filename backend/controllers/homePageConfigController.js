const HomePageConfig = require('../models/HomePageConfig');
const { uploadToCloudinary } = require('../utils/cloudinaryUpload');

const sanitizeLinkCard = (card) => ({
  title: String(card?.title || '').trim(),
  subtitle: String(card?.subtitle || '').trim(),
  image: String(card?.image || '').trim(),
  link: String(card?.link || '/products').trim() || '/products',
});

const sanitizeJournalArticle = (article) => ({
  title: String(article?.title || '').trim(),
  image: String(article?.image || '').trim(),
  link: String(article?.link || '/blog').trim() || '/blog',
  ctaText: String(article?.ctaText || 'Read More').trim() || 'Read More',
  imageAlt: String(article?.imageAlt || '').trim(),
  layout: article?.layout === 'portrait' ? 'portrait' : 'landscape',
});

const sanitizePromiseItem = (item) => ({
  icon: String(item?.icon || '').trim(),
  text: String(item?.text || '').trim(),
});

const sanitizeSourceType = (value) => {
  if (value === 'manual' || value === 'tag') {
    return value;
  }
  return 'category';
};

const sanitizeManualIds = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((id) => String(id || '').trim())
    .filter(Boolean)
    .slice(0, 30);
};

const sanitizeConfigPayload = (payload) => {
  const base = HomePageConfig.getDefaultConfig();

  const productCarouselsInput = Array.isArray(payload?.productCarousels)
    ? payload.productCarousels
    : base.productCarousels;

  const spotlightCardsInput = Array.isArray(payload?.spotlight?.cards)
    ? payload.spotlight.cards
    : base.spotlight.cards;

  const collectionsCardsInput = Array.isArray(payload?.collections?.cards)
    ? payload.collections.cards
    : base.collections.cards;

  const journalArticlesInput = Array.isArray(payload?.journal?.articles)
    ? payload.journal.articles
    : base.journal.articles;

  const promiseItemsInput = Array.isArray(payload?.promise?.items)
    ? payload.promise.items
    : base.promise.items;

  const categoryCardsInput = Array.isArray(payload?.categoryCards?.cards)
    ? payload.categoryCards.cards
    : base.categoryCards.cards;

  return {
    key: 'main',
    newArrivals: {
      title: String(payload?.newArrivals?.title || base.newArrivals.title).trim(),
      ctaText: String(payload?.newArrivals?.ctaText || base.newArrivals.ctaText).trim(),
      ctaLink: String(payload?.newArrivals?.ctaLink || base.newArrivals.ctaLink).trim(),
      sourceType: sanitizeSourceType(payload?.newArrivals?.sourceType || base.newArrivals.sourceType),
      manualProductIds: sanitizeManualIds(payload?.newArrivals?.manualProductIds || base.newArrivals.manualProductIds),
      tag: String(payload?.newArrivals?.tag || base.newArrivals.tag || '').trim(),
      limit: Math.min(24, Math.max(1, Number(payload?.newArrivals?.limit || base.newArrivals.limit || 12))),
      category: String(payload?.newArrivals?.category || base.newArrivals.category || '').trim(),
      featured: payload?.newArrivals?.featured === true,
      sortBy: String(payload?.newArrivals?.sortBy || base.newArrivals.sortBy || 'createdAt').trim(),
      sortOrder: payload?.newArrivals?.sortOrder === 'asc' ? 'asc' : 'desc',
      marbleFurnitureOnly: payload?.newArrivals?.marbleFurnitureOnly !== false,
    },
    personalizedCollection: {
      title: String(payload?.personalizedCollection?.title || base.personalizedCollection.title).trim(),
      subtitle: String(payload?.personalizedCollection?.subtitle || base.personalizedCollection.subtitle).trim(),
      viewMoreText: String(payload?.personalizedCollection?.viewMoreText || base.personalizedCollection.viewMoreText).trim(),
      viewMoreLink: String(payload?.personalizedCollection?.viewMoreLink || base.personalizedCollection.viewMoreLink).trim(),
    },
    productCarousels: productCarouselsInput
      .slice(0, 12)
      .map((item) => ({
        title: String(item?.title || '').trim(),
        viewAllLink: String(item?.viewAllLink || '/products').trim() || '/products',
        enabled: item?.enabled !== false,
        sourceType: sanitizeSourceType(item?.sourceType),
        manualProductIds: sanitizeManualIds(item?.manualProductIds),
        sourceCategory: String(item?.sourceCategory || '').trim(),
        sourceSubcategory: String(item?.sourceSubcategory || '').trim(),
        sourceTag: String(item?.sourceTag || '').trim(),
        limit: Math.max(1, Number(item?.limit || 10)),
        sortBy: String(item?.sortBy || 'createdAt').trim() || 'createdAt',
        sortOrder: item?.sortOrder === 'asc' ? 'asc' : 'desc',
      }))
      .filter((item) => item.title),
    spotlight: {
      title: String(payload?.spotlight?.title || base.spotlight.title).trim(),
      cards: spotlightCardsInput
        .slice(0, 20)
        .map(sanitizeLinkCard)
        .filter((item) => item.title && item.image),
    },
    collections: {
      title: String(payload?.collections?.title || base.collections.title).trim(),
      cards: collectionsCardsInput
        .slice(0, 20)
        .map(sanitizeLinkCard)
        .filter((item) => item.title && item.image),
    },
    videoCarousel: {
      title: String(payload?.videoCarousel?.title || base.videoCarousel.title).trim(),
      ctaText: String(payload?.videoCarousel?.ctaText || base.videoCarousel.ctaText).trim(),
      ctaLink: String(payload?.videoCarousel?.ctaLink || base.videoCarousel.ctaLink).trim(),
      enabled: payload?.videoCarousel?.enabled !== false,
      sourceType: sanitizeSourceType(payload?.videoCarousel?.sourceType || base.videoCarousel.sourceType),
      manualProductIds: sanitizeManualIds(payload?.videoCarousel?.manualProductIds || base.videoCarousel.manualProductIds),
      sourceCategory: String(payload?.videoCarousel?.sourceCategory || base.videoCarousel.sourceCategory || '').trim(),
      sourceTag: String(payload?.videoCarousel?.sourceTag || base.videoCarousel.sourceTag || '').trim(),
      limit: Math.min(24, Math.max(1, Number(payload?.videoCarousel?.limit || base.videoCarousel.limit || 8))),
      sortBy: String(payload?.videoCarousel?.sortBy || base.videoCarousel.sortBy || 'createdAt').trim() || 'createdAt',
      sortOrder: payload?.videoCarousel?.sortOrder === 'asc' ? 'asc' : 'desc',
    },
    featuredBanner: {
      title: String(payload?.featuredBanner?.title || base.featuredBanner.title).trim(),
      body: String(payload?.featuredBanner?.body || base.featuredBanner.body).trim(),
      ctaText: String(payload?.featuredBanner?.ctaText || base.featuredBanner.ctaText).trim(),
      link: String(payload?.featuredBanner?.link || base.featuredBanner.link).trim(),
      image: String(payload?.featuredBanner?.image || base.featuredBanner.image).trim(),
      fallbackImage: String(payload?.featuredBanner?.fallbackImage || base.featuredBanner.fallbackImage).trim(),
      imageAlt: String(payload?.featuredBanner?.imageAlt || base.featuredBanner.imageAlt).trim(),
    },
    journal: {
      titlePrefix: String(payload?.journal?.titlePrefix || base.journal.titlePrefix).trim(),
      titleSuffix: String(payload?.journal?.titleSuffix || base.journal.titleSuffix).trim(),
      articles: journalArticlesInput
        .slice(0, 10)
        .map(sanitizeJournalArticle)
        .filter((item) => item.title && item.image),
    },
    hero: {
      slides: (Array.isArray(payload?.hero?.slides) ? payload.hero.slides : base.hero.slides)
        .slice(0, 10)
        .map((s) => ({
          heading: String(s?.heading || '').trim(),
          subheading: String(s?.subheading || '').trim(),
          ctaText: String(s?.ctaText || '').trim(),
          ctaLink: String(s?.ctaLink || '/products').trim() || '/products',
          backgroundImage: String(s?.backgroundImage || '').trim(),
          overlayOpacity: Math.min(1, Math.max(0, Number(s?.overlayOpacity ?? 0.5))),
        })),
      autoplayInterval: Math.min(30000, Math.max(1000, Number(payload?.hero?.autoplayInterval ?? base.hero.autoplayInterval ?? 5000))),
    },
    categoryCards: {
      title: String(payload?.categoryCards?.title || base.categoryCards.title).trim(),
      cards: categoryCardsInput.slice(0, 4).map(sanitizeLinkCard),
    },
    promise: {
      titlePrefix: String(payload?.promise?.titlePrefix || base.promise.titlePrefix).trim(),
      titleHighlight: String(payload?.promise?.titleHighlight || base.promise.titleHighlight).trim(),
      body: String(payload?.promise?.body || base.promise.body).trim(),
      ctaText: String(payload?.promise?.ctaText || base.promise.ctaText).trim(),
      ctaLink: String(payload?.promise?.ctaLink || base.promise.ctaLink).trim(),
      items: promiseItemsInput
        .slice(0, 12)
        .map(sanitizePromiseItem)
        .filter((item) => item.icon && item.text),
    },
  };
};

const ensureConfig = async () => {
  let config = await HomePageConfig.findOne({ key: 'main' }).lean();

  if (!config) {
    const defaults = HomePageConfig.getDefaultConfig();
    config = await HomePageConfig.create(defaults);
    return config.toObject();
  }

  return config;
};

const getHomePageConfig = async (req, res) => {
  try {
    const config = await ensureConfig();
    res.json({ success: true, data: config });
  } catch (error) {
    console.error('Failed to fetch home page config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch home page configuration',
      error: error.message,
    });
  }
};

const updateHomePageConfig = async (req, res) => {
  try {
    const payload = sanitizeConfigPayload(req.body || {});

    const updated = await HomePageConfig.findOneAndUpdate(
      { key: 'main' },
      payload,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({ success: true, message: 'Home page configuration updated.', data: updated });
  } catch (error) {
    console.error('Failed to update home page config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update home page configuration',
      error: error.message,
    });
  }
};

const uploadHomePageImage = async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        success: false,
        message: 'Image file is required',
      });
    }

    const result = await uploadToCloudinary(req.file.buffer, 'hs-global/homepage');

    return res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
      },
    });
  } catch (error) {
    console.error('Failed to upload homepage image:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to upload homepage image',
      error: error.message,
    });
  }
};

module.exports = {
  getHomePageConfig,
  updateHomePageConfig,
  uploadHomePageImage,
};
