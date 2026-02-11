/**
 * Automatic Discount Expiration Handler
 * This script disables expired discounts and can be run as a cron job
 * 
 * Usage:
 * - Run manually: node backend/utils/discountExpirationHandler.js
 * - Run as cron: Add to crontab or Windows Task Scheduler
 *   Example cron: 0 * * * * (runs every hour)
 */

const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('../models/Product');

/**
 * Main function to check and disable expired discounts
 */
async function handleExpiredDiscounts() {
    try {
        console.log('🔍 Checking for expired discounts...');
        
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
        
        // Get analytics before cleanup
        const analyticsBefore = await Product.getDiscountAnalytics();
        console.log('\n📊 Discount Analytics (Before):');
        console.log('   Total discounts enabled:', analyticsBefore.total);
        console.log('   Active discounts:', analyticsBefore.active);
        console.log('   Scheduled discounts:', analyticsBefore.scheduled);
        console.log('   Expired discounts (still enabled):', analyticsBefore.expired);
        
        if (analyticsBefore.expired === 0) {
            console.log('\n✨ No expired discounts found. All good!');
            await mongoose.connection.close();
            return;
        }
        
        // Get list of products with expired discounts
        const now = new Date();
        const expiredProducts = await Product.find({
            'discount.enabled': true,
            'discount.endDate': { $lt: now }
        }).select('productId name discount');
        
        console.log('\n🗑️  Found expired discounts:');
        expiredProducts.forEach(product => {
            const daysExpired = Math.ceil((now - new Date(product.discount.endDate)) / (1000 * 60 * 60 * 24));
            console.log(`   - ${product.name} (${product.productId})`);
            console.log(`     ${product.discount.percentage}% off, expired ${daysExpired} day(s) ago`);
        });
        
        // Disable expired discounts
        const disabledCount = await Product.disableExpiredDiscounts();
        
        console.log(`\n✅ Successfully disabled ${disabledCount} expired discount(s)`);
        
        // Get analytics after cleanup
        const analyticsAfter = await Product.getDiscountAnalytics();
        console.log('\n📊 Discount Analytics (After):');
        console.log('   Total discounts enabled:', analyticsAfter.total);
        console.log('   Active discounts:', analyticsAfter.active);
        console.log('   Scheduled discounts:', analyticsAfter.scheduled);
        console.log('   Expired discounts (still enabled):', analyticsAfter.expired);
        
        // Get expiring soon (next 3 days)
        const expiringSoon = await Product.getExpiringSoonDiscounts(3);
        
        if (expiringSoon.length > 0) {
            console.log('\n⚠️  Discounts expiring in the next 3 days:');
            expiringSoon.forEach(product => {
                const daysRemaining = Math.ceil((new Date(product.discount.endDate) - now) / (1000 * 60 * 60 * 24));
                console.log(`   - ${product.name} (${product.productId})`);
                console.log(`     ${product.discount.percentage}% off, expires in ${daysRemaining} day(s)`);
            });
        }
        
        console.log('\n✨ Discount expiration check complete!');
        
        // Close connection
        await mongoose.connection.close();
        console.log('👋 MongoDB connection closed\n');
        
    } catch (error) {
        console.error('\n❌ Error handling expired discounts:', error);
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
        }
        process.exit(1);
    }
}

// Run if executed directly
if (require.main === module) {
    handleExpiredDiscounts()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error('Fatal error:', error);
            process.exit(1);
        });
}

module.exports = { handleExpiredDiscounts };
