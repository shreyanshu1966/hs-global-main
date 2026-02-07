const mongoose = require('mongoose');
const Product = require('./models/Product');
const Review = require('./models/Review');
require('dotenv').config();

// Connect to database
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hs_global_export');
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1);
    }
};

// Update rating statistics for all products
const updateAllProductRatings = async () => {
    try {
        console.log('🔄 Starting product rating statistics update...');
        console.log('=============================================');
        
        await connectDB();
        
        // Get all active products
        const products = await Product.find({ status: 'active' });
        console.log(`📦 Found ${products.length} products to update`);
        
        let updatedCount = 0;
        let skippedCount = 0;
        
        for (const product of products) {
            try {
                console.log(`📊 Calculating stats for: ${product.name}`);
                
                // Get product statistics using the existing model method
                const stats = await Review.getProductStats(product.productId);
                
                if (stats.totalReviews > 0) {
                    // Update the product with the new stats
                    await Product.findOneAndUpdate(
                        { productId: product.productId },
                        {
                            averageRating: stats.averageRating,
                            totalReviews: stats.totalReviews
                        }
                    );
                    
                    console.log(`   ✅ Updated: ${stats.averageRating.toFixed(1)} stars (${stats.totalReviews} reviews)`);
                    updatedCount++;
                } else {
                    // Set to 0 if no reviews
                    await Product.findOneAndUpdate(
                        { productId: product.productId },
                        {
                            averageRating: 0,
                            totalReviews: 0
                        }
                    );
                    console.log(`   ⚪ No reviews found - set to 0`);
                    skippedCount++;
                }
                
            } catch (error) {
                console.error(`   ❌ Error updating ${product.name}:`, error.message);
            }
        }
        
        // Generate summary
        console.log('\n✅ Rating statistics update completed!');
        console.log('=========================================');
        console.log(`📊 Products with reviews updated: ${updatedCount}`);
        console.log(`⚪ Products without reviews: ${skippedCount}`);
        console.log(`📈 Total products processed: ${products.length}`);
        
        // Show some sample updated products
        const samplesWithRatings = await Product.find({ 
            status: 'active', 
            totalReviews: { $gt: 0 } 
        })
        .sort({ averageRating: -1 })
        .limit(5)
        .select('name averageRating totalReviews');
        
        if (samplesWithRatings.length > 0) {
            console.log('\n🌟 Top rated products sample:');
            samplesWithRatings.forEach(product => {
                console.log(`   ${product.name}: ${product.averageRating.toFixed(1)} ⭐ (${product.totalReviews} reviews)`);
            });
        }
        
        console.log('\n🎉 Product ratings are now updated and will display in product listings!');
        
    } catch (error) {
        console.error('❌ Error during rating update:', error);
        throw error;
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
    }
};

// Execute the update
if (require.main === module) {
    updateAllProductRatings().catch(console.error);
}

module.exports = { updateAllProductRatings };