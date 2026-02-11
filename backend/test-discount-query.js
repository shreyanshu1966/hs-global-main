const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('./models/Product');

async function testDiscountQuery() {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hs_global_export';
        await mongoose.connect(uri);
        console.log('✅ Connected to MongoDB');
        console.log('Database:', mongoose.connection.db.databaseName);
        console.log('='.repeat(60));

        // Test 1: Total products
        const totalProducts = await Product.countDocuments();
        console.log(`\n📦 Total products: ${totalProducts}`);

        // Test 2: Products with discount field
        const withDiscountField = await Product.countDocuments({ discount: { $exists: true } });
        console.log(`📋 Products with discount field: ${withDiscountField}`);

        // Test 3: Products with discount.enabled = true
        const enabledDiscounts = await Product.countDocuments({ 'discount.enabled': true });
        console.log(`✅ Products with enabled discounts: ${enabledDiscounts}`);

        // Test 4: Sample product structure
        const sampleProduct = await Product.findOne().select('name productId discount');
        console.log('\n📄 Sample product structure:');
        console.log(JSON.stringify(sampleProduct, null, 2));

        // Test 5: Test the actual query used in getDiscountedProducts
        console.log('\n' + '='.repeat(60));
        console.log('Testing getDiscountedProducts queries:');
        console.log('='.repeat(60));

        // Test status='all'
        const allQuery = {};
        const allProducts = await Product.find(allQuery)
            .select('productId name category subcategory priceINR discount')
            .limit(5);
        console.log(`\n[status=all] Query: ${JSON.stringify(allQuery)}`);
        console.log(`[status=all] Found: ${allProducts.length} products`);

        // Test status='active'
        const now = new Date();
        const activeQuery = {
            'discount.enabled': true,
            $or: [
                { 'discount.startDate': null, 'discount.endDate': null },
                { 'discount.startDate': null, 'discount.endDate': { $gte: now } },
                { 'discount.startDate': { $lte: now }, 'discount.endDate': null },
                { 'discount.startDate': { $lte: now }, 'discount.endDate': { $gte: now } }
            ]
        };
        const activeProducts = await Product.find(activeQuery)
            .select('productId name discount')
            .limit(5);
        console.log(`\n[status=active] Query: ${JSON.stringify(activeQuery, null, 2)}`);
        console.log(`[status=active] Found: ${activeProducts.length} products`);
        if (activeProducts.length > 0) {
            console.log('Sample active product:', JSON.stringify(activeProducts[0], null, 2));
        }

        // Test 6: Check if getDiscountStatus method exists
        const testProduct = await Product.findOne();
        if (testProduct) {
            console.log('\n🔍 Testing Product methods:');
            console.log('Has getDiscountStatus:', typeof testProduct.getDiscountStatus === 'function');
            console.log('Has getFinalPrice:', typeof testProduct.getFinalPrice === 'function');
            
            if (typeof testProduct.getDiscountStatus === 'function') {
                const status = testProduct.getDiscountStatus();
                console.log('Discount status:', status);
            }
        }

        // Test 7: Test updateMany result
        console.log('\n' + '='.repeat(60));
        console.log('Testing updateMany (DRY RUN - no actual update):');
        console.log('='.repeat(60));
        
        const updateResult = await Product.updateMany(
            {},
            { $set: { testField: 'test' } }
        );
        console.log('Update result:', JSON.stringify(updateResult, null, 2));
        
        // Clean up test field
        await Product.updateMany({}, { $unset: { testField: 1 } });

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error.stack);
    } finally {
        await mongoose.connection.close();
        console.log('\n✅ Database connection closed');
    }
}

testDiscountQuery();
