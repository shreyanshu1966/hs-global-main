/**
 * update-carousels-to-categories.js
 *
 * Configures exactly 4 product carousels, one for each category (Furniture, Handcrafted, Leather, Semi-Precious Stone),
 * in the HomePageConfig.productCarousels array.
 *
 * Usage:
 *   node backend/scripts/update-carousels-to-categories.js
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const HomePageConfig = require('../models/HomePageConfig');

const newCarousels = [
  {
    title: "Marble Furniture",
    viewAllLink: "/products?cat=furniture",
    enabled: true,
    sourceType: "category",
    manualProductIds: [],
    sourceCategory: "furniture",
    sourceSubcategory: "",
    sourceTag: "",
    limit: 12,
    sortBy: "createdAt",
    sortOrder: "desc"
  },
  {
    title: "Handcrafted Furniture",
    viewAllLink: "/products?cat=handcrafted",
    enabled: true,
    sourceType: "category",
    manualProductIds: [],
    sourceCategory: "handcrafted",
    sourceSubcategory: "",
    sourceTag: "",
    limit: 12,
    sortBy: "createdAt",
    sortOrder: "desc"
  },
  {
    title: "Leather Furniture",
    viewAllLink: "/products?cat=leather",
    enabled: true,
    sourceType: "category",
    manualProductIds: [],
    sourceCategory: "leather",
    sourceSubcategory: "",
    sourceTag: "",
    limit: 12,
    sortBy: "createdAt",
    sortOrder: "desc"
  },
  {
    title: "Semi Precious Stone",
    viewAllLink: "/products?cat=semi-precious-stone",
    enabled: true,
    sourceType: "category",
    manualProductIds: [],
    sourceCategory: "semi-precious-stone",
    sourceSubcategory: "",
    sourceTag: "",
    limit: 12,
    sortBy: "createdAt",
    sortOrder: "desc"
  }
];

async function updateDb(conn, label) {
  const HPC = conn.model('HomePageConfig', HomePageConfig.schema);
  let config = await HPC.findOne({ key: 'main' });
  if (!config) {
    console.log(`⚠️ [${label}] No "main" HomePageConfig found. Creating from defaults...`);
    config = new HPC(HomePageConfig.getDefaultConfig());
  }

  config.productCarousels = newCarousels;
  await config.save();
  console.log(`✅ [${label}] Successfully updated productCarousels to exactly 4 category carousels!`);
}

async function run() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hs_global_export';
  console.log('Connecting to local database...');
  await mongoose.connect(mongoUri);
  console.log('Connected!');

  await updateDb(mongoose.connection, 'local');

  const liveUri = process.env.LIVE_MONGODB_URI;
  if (liveUri) {
    console.log('\n🌐 Connecting to live database...');
    const liveConn = await mongoose.createConnection(liveUri).asPromise();
    console.log('Connected to live database!');
    await updateDb(liveConn, 'live');
    await liveConn.close();
    console.log('Closed live database connection.');
  } else {
    console.log('\nℹ️ LIVE_MONGODB_URI is not set in backend/.env, skipping live DB update.');
  }

  await mongoose.disconnect();
  console.log('Closed local database connection.');
}

run().catch((err) => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
