const mongoose = require('mongoose');

const PageSeoSchema = new mongoose.Schema(
  {
    path:                { type: String, unique: true, required: true, index: true },
    h1:                  String,
    title:               String,
    description:         String,
    keywords:            [String],
    image:               String,
    canonical:           String,
    ogTitle:             String,
    ogDescription:       String,
    ogImage:             String,
    twitterTitle:        String,
    twitterDescription:  String,
    twitterImage:        String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('PageSeo', PageSeoSchema);
