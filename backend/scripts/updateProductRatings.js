const mongoose = require('mongoose');
const Product = require('../models/Product');
const Review = require('../models/Review');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hsglobal');
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

// Update all product ratings
const updateAllProductRatings = async () => {
    try {
        console.log('Starting to update product ratings...\n');

        // Get all products
        const products = await Product.find({});
        console.log(`Found ${products.length} products to update\n`);

        let updatedCount = 0;
        let skippedCount = 0;

        for (const product of products) {
            try {
                // Get review stats for this product
                const stats = await Review.getProductStats(product.productId);

                // Update the product
                await Product.findByIdAndUpdate(
                    product._id,
                    {
                        averageRating: stats.averageRating,
                        totalReviews: stats.totalReviews
                    }
                );

                if (stats.totalReviews > 0) {
                    console.log(`✓ Updated ${product.name}:`);
                    console.log(`  - Average Rating: ${stats.averageRating}`);
                    console.log(`  - Total Reviews: ${stats.totalReviews}\n`);
                    updatedCount++;
                } else {
                    console.log(`○ ${product.name} - No reviews yet\n`);
                    skippedCount++;
                }
            } catch (error) {
                console.error(`✗ Error updating ${product.name}:`, error.message);
            }
        }

        console.log('\n=== Update Summary ===');
        console.log(`Total products: ${products.length}`);
        console.log(`Products with reviews updated: ${updatedCount}`);
        console.log(`Products without reviews: ${skippedCount}`);
        console.log('======================\n');

    } catch (error) {
        console.error('Error updating product ratings:', error);
    }
};

// Main execution
const main = async () => {
    await connectDB();
    await updateAllProductRatings();
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
};

main();
