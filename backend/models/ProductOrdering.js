const mongoose = require('mongoose');

const productOrderingSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      default: null,
    },
    subcategory: {
      type: String,
      default: null,
    },
    productIds: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

// Unique ordering doc per scope (global, category, or category+subcategory)
productOrderingSchema.index({ category: 1, subcategory: 1 }, { unique: true });

module.exports = mongoose.model('ProductOrdering', productOrderingSchema);
