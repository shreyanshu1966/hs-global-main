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

// Quick test with minimal data
const quickTestReviews = async () => {
    try {
        console.log('🧪 Quick Review Test - Generating sample reviews');
        console.log('================================================');
        
        await connectDB();
        
        // Get first 3 products only for testing
        const products = await Product.find({ status: 'active' }).limit(3);
        console.log(`📦 Testing with ${products.length} products`);
        
        if (products.length === 0) {
            console.log('❌ No products found. Please run product migration first.');
            return;
        }
        
        // Simple test reviews
        const testReviews = [];
        
        for (const product of products) {
            console.log(`📝 Generating test review for: ${product.name}`);
            
            const review = {
                productId: product.productId,
                userName: 'Test Reviewer',
                userEmail: 'test@example.com',
                rating: 5,
                title: 'Excellent Quality!',
                comment: `Outstanding quality ${product.name}! Exceptional craftsmanship and beautiful finish. The ${product.category} exceeded all expectations. Highly recommend this premium piece!`,
                verified: true,
                helpful: 8,
                status: 'approved',
                createdAt: new Date(),
                updatedAt: new Date()
            };
            
            testReviews.push(review);
        }
        
        // Insert test reviews
        await Review.insertMany(testReviews);
        
        console.log('✅ Test reviews generated successfully!');
        console.log(`📊 Created ${testReviews.length} test reviews`);
        console.log('\n💡 Check your product pages to see the test reviews.');
        console.log('💡 Run the full seed-reviews.js script when ready for complete review generation.');
        
    } catch (error) {
        console.error('❌ Error during test:', error);
        throw error;
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
    }
};

// Execute quick test
if (require.main === module) {
    quickTestReviews().catch(console.error);
}

module.exports = { quickTestReviews };