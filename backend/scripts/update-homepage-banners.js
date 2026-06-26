require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const HomePageConfig = require('../models/HomePageConfig');

async function updateHomepageBanners() {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hs_global_export';
        console.log(`Connecting to database at ${mongoUri}...`);
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to Database');

        let config = await HomePageConfig.findOne({ key: 'main' });

        if (!config) {
            console.log('⚠️ No existing configuration found for key "main". Creating from defaults...');
            config = new HomePageConfig(HomePageConfig.getDefaultConfig());
        } else {
            console.log('📝 Found existing configuration for key "main". Updating hero slides...');
            
            // Set the new slides
            config.hero = {
                slides: [
                    {
                        heading: 'Premium Natural Stone & Marble',
                        subheading: 'Discover our exquisite collection of marble, granite, and natural stone products crafted for architects, designers, and global buyers.',
                        ctaText: 'Explore Products',
                        ctaLink: '/products',
                        backgroundImage: 'https://res.cloudinary.com/dynd1aan0/image/upload/f_auto,q_auto/hs-global/public/banner1',
                        overlayOpacity: 0.5,
                    },
                    {
                        heading: 'Luxury Handcrafted Marble Furniture',
                        subheading: 'Artisanal coffee tables, consoles, and bespoke pieces designed to elevate luxury interiors.',
                        ctaText: 'View Furniture',
                        ctaLink: '/products?cat=furniture',
                        backgroundImage: 'https://res.cloudinary.com/dynd1aan0/image/upload/f_auto,q_auto/hs-global/public/banner2',
                        overlayOpacity: 0.5,
                    },
                    {
                        heading: 'Durable Premium Granite',
                        subheading: 'Exceptional quality granite slabs and tiles, custom finished and ready for global export.',
                        ctaText: 'Explore Granite',
                        ctaLink: '/products?cat=granite',
                        backgroundImage: 'https://res.cloudinary.com/dynd1aan0/image/upload/f_auto,q_auto/hs-global/public/banner3',
                        overlayOpacity: 0.5,
                    },
                    {
                        heading: 'Global Export & Precision Logistics',
                        subheading: 'From in-house manufacturing to secure container loading and shipping, we deliver worldwide.',
                        ctaText: 'Our Services',
                        ctaLink: '/services',
                        backgroundImage: 'https://res.cloudinary.com/dynd1aan0/image/upload/f_auto,q_auto/hs-global/public/banner4',
                        overlayOpacity: 0.5,
                    },
                ],
                autoplayInterval: 5000,
            };
        }

        await config.save();
        console.log('✅ Successfully updated HomePageConfig with the new 4-slide hero banners!');
        console.log('Updated slides:', JSON.stringify(config.hero.slides, null, 2));

        await mongoose.connection.close();
        console.log('👋 MongoDB connection closed.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Failed to update homepage banners:', error);
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
        }
        process.exit(1);
    }
}

updateHomepageBanners();
