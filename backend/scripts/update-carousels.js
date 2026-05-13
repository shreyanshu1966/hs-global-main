require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

const HomePageConfig = require('../models/HomePageConfig');

async function updateCarousels() {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hs_global_export';
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to Database');

        let config = await HomePageConfig.findOne({ key: 'main' });
        
        if (!config) {
            console.log('⚠️ No main config found in database. Using defaults to create one.');
            config = new HomePageConfig(HomePageConfig.getDefaultConfig());
        }

        // Define the new product carousels based on the requested structure
        const newCarousels = [
            {
                title: "Tables & Seating",
                viewAllLink: "/products?cat=furniture",
                enabled: true,
                sourceType: "category",
                sourceCategory: "furniture",
                sourceSubcategory: "center table,chaise chair,coffee table,console table,dining table,side table",
                limit: 12,
                sortBy: "createdAt",
                sortOrder: "desc"
            },
            {
                title: "Bath & Basins",
                viewAllLink: "/products?cat=furniture",
                enabled: true,
                sourceType: "category",
                sourceCategory: "furniture",
                sourceSubcategory: "bathtub,pedestal sink,sink",
                limit: 12,
                sortBy: "createdAt",
                sortOrder: "desc"
            },
            {
                title: "Decor & Lighting",
                viewAllLink: "/products?cat=furniture",
                enabled: true,
                sourceType: "category",
                sourceCategory: "furniture",
                sourceSubcategory: "bowl,clock,lamp,mirror frame,tree sculpture,vase",
                limit: 12,
                sortBy: "createdAt",
                sortOrder: "desc"
            },
            {
                title: "Handicraft Collections",
                viewAllLink: "/products?cat=handicraft",
                enabled: true,
                sourceType: "category",
                sourceCategory: "handicraft",
                sourceSubcategory: "", // Empty means it pulls all handicraft products
                limit: 12,
                sortBy: "createdAt",
                sortOrder: "desc"
            },
            {
                title: "Handicraft Tables",
                viewAllLink: "/products?cat=handicraft",
                enabled: true,
                sourceType: "category",
                sourceCategory: "handicraft",
                sourceSubcategory: "coffee table,console table,dining table,side table",
                limit: 12,
                sortBy: "createdAt",
                sortOrder: "desc"
            },
            {
                title: "Handicraft Seating",
                viewAllLink: "/products?cat=handicraft",
                enabled: true,
                sourceType: "category",
                sourceCategory: "handicraft",
                sourceSubcategory: "stool,sofa,chair,bench,seating", 
                limit: 12,
                sortBy: "createdAt",
                sortOrder: "desc"
            }
        ];

        // Replace the old carousels with the new ones
        config.productCarousels = newCarousels;

        // Save to database
        await config.save();
        
        console.log('✅ Successfully updated HomePageConfig with the new dynamic carousels!');
        
    } catch (err) {
        console.error('❌ Error updating carousels:', err);
    } finally {
        await mongoose.disconnect();
        console.log('✅ Database connection closed.');
    }
}

// Execute the script
updateCarousels();
