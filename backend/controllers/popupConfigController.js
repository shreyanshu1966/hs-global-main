const PopupConfig = require('../models/PopupConfig');
const { uploadToCloudinary } = require('../utils/cloudinaryUpload');

const DEFAULT = {
  key: 'main',
  entryPopup: {
    enabled: true,
    timerSeconds: 12,
    heading: 'Premium Stone & Marble',
    subheading: 'Custom bulk orders, marble furniture & exclusive stone collections.',
    backgroundImage: '',
    couponCode: 'HS10',
    discountPercentage: 10,
  },
  exitIntent: {
    enabled: true,
    heading: 'Exclusive Offer For You',
    bodyText: '',
    couponCode: 'HS10',
    discountPercentage: 10,
    expiryDate: '',
  },
  pageToast: {
    enabled: true,
    message: 'Apply at checkout for marble, granite & stone furniture orders.',
    couponCode: 'HS10',
    discountPercentage: 10,
    expiryDate: '',
    autoDismissSeconds: 8,
    showEveryNPages: 3,
  },
};

const ensureConfig = async () => {
  let config = await PopupConfig.findOne({ key: 'main' }).lean();
  if (!config) {
    config = await PopupConfig.create(DEFAULT);
    return config.toObject ? config.toObject() : config;
  }
  return config;
};

const sanitize = (body) => ({
  key: 'main',
  entryPopup: {
    enabled:            body?.entryPopup?.enabled !== false,
    timerSeconds:       Math.max(1, Number(body?.entryPopup?.timerSeconds) || DEFAULT.entryPopup.timerSeconds),
    heading:            String(body?.entryPopup?.heading ?? DEFAULT.entryPopup.heading).trim(),
    subheading:         String(body?.entryPopup?.subheading ?? DEFAULT.entryPopup.subheading).trim(),
    backgroundImage:    String(body?.entryPopup?.backgroundImage ?? '').trim(),
    couponCode:         String(body?.entryPopup?.couponCode ?? DEFAULT.entryPopup.couponCode).trim().toUpperCase(),
    discountPercentage: Math.min(100, Math.max(1, Number(body?.entryPopup?.discountPercentage) || DEFAULT.entryPopup.discountPercentage)),
  },
  exitIntent: {
    enabled:            body?.exitIntent?.enabled !== false,
    heading:            String(body?.exitIntent?.heading ?? DEFAULT.exitIntent.heading).trim(),
    bodyText:           String(body?.exitIntent?.bodyText ?? '').trim(),
    couponCode:         String(body?.exitIntent?.couponCode ?? DEFAULT.exitIntent.couponCode).trim().toUpperCase(),
    discountPercentage: Math.min(100, Math.max(1, Number(body?.exitIntent?.discountPercentage) || DEFAULT.exitIntent.discountPercentage)),
    expiryDate:         String(body?.exitIntent?.expiryDate ?? '').trim(),
  },
  pageToast: {
    enabled:            body?.pageToast?.enabled !== false,
    message:            String(body?.pageToast?.message ?? DEFAULT.pageToast.message).trim(),
    couponCode:         String(body?.pageToast?.couponCode ?? DEFAULT.pageToast.couponCode).trim().toUpperCase(),
    discountPercentage: Math.min(100, Math.max(1, Number(body?.pageToast?.discountPercentage) || DEFAULT.pageToast.discountPercentage)),
    expiryDate:         String(body?.pageToast?.expiryDate ?? '').trim(),
    autoDismissSeconds: Math.max(3, Number(body?.pageToast?.autoDismissSeconds) || DEFAULT.pageToast.autoDismissSeconds),
    showEveryNPages:    Math.max(1, Number(body?.pageToast?.showEveryNPages) || DEFAULT.pageToast.showEveryNPages),
  },
});

// GET /api/popup-config  (public)
exports.getPublicConfig = async (req, res) => {
  try {
    const config = await ensureConfig();
    res.json({ success: true, data: config });
  } catch (error) {
    console.error('Failed to fetch popup config:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch popup config' });
  }
};

// GET /api/admin/popup-config  (admin)
exports.getAdminConfig = async (req, res) => {
  try {
    const config = await ensureConfig();
    res.json({ success: true, data: config });
  } catch (error) {
    console.error('Failed to fetch popup config:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch popup config' });
  }
};

// PUT /api/admin/popup-config  (admin)
exports.updateAdminConfig = async (req, res) => {
  try {
    const payload = sanitize(req.body || {});
    const updated = await PopupConfig.findOneAndUpdate(
      { key: 'main' },
      payload,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.json({ success: true, message: 'Popup configuration updated.', data: updated });
  } catch (error) {
    console.error('Failed to update popup config:', error);
    res.status(500).json({ success: false, message: 'Failed to update popup config' });
  }
};
