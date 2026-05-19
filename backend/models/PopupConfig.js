const mongoose = require('mongoose');

const popupConfigSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: 'main' },
    entryPopup: {
      enabled:            { type: Boolean, default: true },
      timerSeconds:       { type: Number, default: 12, min: 1 },
      heading:            { type: String, default: 'Premium Stone & Marble', trim: true },
      subheading:         { type: String, default: 'Custom bulk orders, marble furniture & exclusive stone collections.', trim: true },
      backgroundImage:    { type: String, default: '', trim: true },
      couponCode:         { type: String, default: 'HS10', trim: true },
      discountPercentage: { type: Number, default: 10, min: 1, max: 100 },
    },
    exitIntent: {
      enabled:            { type: Boolean, default: true },
      heading:            { type: String, default: 'Exclusive Offer For You', trim: true },
      bodyText:           { type: String, default: '', trim: true },
      couponCode:         { type: String, default: 'HS10', trim: true },
      discountPercentage: { type: Number, default: 10, min: 1, max: 100 },
      expiryDate:         { type: String, default: '', trim: true },
    },
    pageToast: {
      enabled:            { type: Boolean, default: true },
      message:            { type: String, default: 'Apply at checkout for marble, granite & stone furniture orders.', trim: true },
      couponCode:         { type: String, default: 'HS10', trim: true },
      discountPercentage: { type: Number, default: 10, min: 1, max: 100 },
      expiryDate:         { type: String, default: '', trim: true },
      autoDismissSeconds: { type: Number, default: 8, min: 3 },
      showEveryNPages:    { type: Number, default: 3, min: 1 },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PopupConfig', popupConfigSchema);
