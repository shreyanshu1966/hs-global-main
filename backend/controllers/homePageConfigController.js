const HomePageConfig = require('../models/HomePageConfig');

const sanitizeLinkCard = (card) => ({
  title: String(card?.title || '').trim(),
  subtitle: String(card?.subtitle || '').trim(),
  image: String(card?.image || '').trim(),
  link: String(card?.link || '/products').trim() || '/products',
});

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

  return {
    key: 'main',
    newArrivals: {
      title: String(payload?.newArrivals?.title || base.newArrivals.title).trim(),
      ctaText: String(payload?.newArrivals?.ctaText || base.newArrivals.ctaText).trim(),
      ctaLink: String(payload?.newArrivals?.ctaLink || base.newArrivals.ctaLink).trim(),
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
    featuredBanner: {
      title: String(payload?.featuredBanner?.title || base.featuredBanner.title).trim(),
      body: String(payload?.featuredBanner?.body || base.featuredBanner.body).trim(),
      ctaText: String(payload?.featuredBanner?.ctaText || base.featuredBanner.ctaText).trim(),
      link: String(payload?.featuredBanner?.link || base.featuredBanner.link).trim(),
      image: String(payload?.featuredBanner?.image || base.featuredBanner.image).trim(),
      fallbackImage: String(payload?.featuredBanner?.fallbackImage || base.featuredBanner.fallbackImage).trim(),
      imageAlt: String(payload?.featuredBanner?.imageAlt || base.featuredBanner.imageAlt).trim(),
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

module.exports = {
  getHomePageConfig,
  updateHomePageConfig,
};
