const mongoose = require('mongoose');

const deliveryCheckSchema = new mongoose.Schema({
    countryCode: { type: String, trim: true, required: true },
    countryName: { type: String, trim: true, required: true },
    postalCode:  { type: String, trim: true, default: '' },
    productId:   { type: String, trim: true, default: '' },
    result:      { type: String, enum: ['available', 'unavailable'], required: true },
    ipAddress:   { type: String, trim: true, default: '' },
}, { timestamps: true });

deliveryCheckSchema.index({ countryCode: 1 });
deliveryCheckSchema.index({ createdAt: -1 });
deliveryCheckSchema.index({ productId: 1 });

module.exports = mongoose.model('DeliveryCheckAnalytics', deliveryCheckSchema);
