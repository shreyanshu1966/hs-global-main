require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

// Adjust paths depending on where the script runs from
const Product = require('../models/Product');
const HomePageConfig = require('../models/HomePageConfig');

async function updateSpotlightSubcategories() {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hs_global_export';
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to Database');

        // Step 1: Find all subcategories and pick one product image for each
        const subcatsWithImages = await Product.aggregate([
            { $match: { status: 'active', available: true } },
            {
                $group: {
                    _id: { category: '$category', subcategory: '$subcategory' },
                    image: { $first: '$image' }
                }
            }
        ]);

        console.log(`🔍 Found ${subcatsWithImages.length} subcategories from active products.`);

        if (subcatsWithImages.length === 0) {
            console.log('❌ No subcategories found. Exiting.');
            return;
        }

        // Step 2: Format them into the linkCardSchema structure used by Spotlight
        const newCards = subcatsWithImages
            .filter(item => item._id.subcategory) // Ignore empty subcategories
            .map(item => {
                const catId = item._id.category || 'furniture';
                const subId = item._id.subcategory.trim();
                
                // Capitalize the subcategory for the title (e.g. "coffee table" -> "Coffee Table")
                const title = subId
                    .split(/[- ]+/)
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');
                
                // Capitalize category for the subtitle
                const categoryTitle = catId.charAt(0).toUpperCase() + catId.slice(1);

                return {
                    title: title,
                    subtitle: `Explore ${categoryTitle}`,
                    image: item.image, // Product image as representative subcategory image
                    link: `/products?cat=${catId}#${subId.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
                };
            });

        console.log(`📝 Generated ${newCards.length} spotlight cards. Sample:`, newCards[0]);

        // Step 3: Fetch the main homepage config and update the spotlight cards
        let config = await HomePageConfig.findOne({ key: 'main' });
        
        if (!config) {
            console.log('⚠️ No main config found in database. Using defaults to create one.');
            config = new HomePageConfig(HomePageConfig.getDefaultConfig());
        }

        // Replace the old cards with the new ones
        config.spotlight.cards = newCards;
        // Optionally update the section title if needed
        config.spotlight.title = 'Explore All Subcategories'; 

        // Step 4: Save to database
        await config.save();
        
        console.log('✅ Successfully updated HomePageConfig spotlight with all subcategories!');
        
    } catch (err) {
        console.error('❌ Error updating spotlight:', err);
    } finally {
        await mongoose.disconnect();
        console.log('✅ Database connection closed.');
    }
}

// Execute the script
updateSpotlightSubcategories();
