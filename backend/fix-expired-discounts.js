const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('./models/Product');

async function fixExpiredDiscounts() {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hs_global_export';
        await mongoose.connect(uri);
        console.log('✅ Connected to MongoDB\n');

        // Option 1: Disable all expired discounts
        const now = new Date();
        const result = await Product.updateMany(
            {
                'discount.enabled': true,
                'discount.endDate': { $lt: now }
            },
            {
                $set: { 'discount.enabled': false }
            }
        );

        console.log('🧹 Disabled expired discounts:');
        console.log(`   Matched: ${result.matchedCount}`);
        console.log(`   Modified: ${result.modifiedCount}`);

        // Check remaining active discounts
        const activeCount = await Product.countDocuments({
            'discount.enabled': true,
            $or: [
                { 'discount.endDate': null },
                { 'discount.endDate': { $gte: now } }
            ]
        });
        console.log(`\n✅ Active discounts remaining: ${activeCount}`);

        console.log('\n✅ Done! Your discount page should now work.');
        console.log('   Refresh the page and you should see products with "all" filter.');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.connection.close();
    }
}

fixExpiredDiscounts();
