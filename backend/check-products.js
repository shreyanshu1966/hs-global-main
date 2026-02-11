const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('./models/Product');

async function checkProducts() {
    try {
        // Connect to database
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hs_global_export';
        await mongoose.connect(uri);
        console.log('✅ Connected to MongoDB');
        console.log('URI:', uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')); // Hide credentials
        console.log('Database:', mongoose.connection.db.databaseName);
        console.log('---');

        // Count total products
        const totalCount = await Product.countDocuments();
        console.log(`📦 Total products in database: ${totalCount}`);

        if (totalCount === 0) {
            console.log('⚠️  WARNING: No products found in the database!');
            console.log('   Your live database appears to be empty.');
            console.log('   You need to migrate products from local to live database.');
        } else {
            // Show sample products
            const sampleProducts = await Product.find().limit(5).select('name productId category');
            console.log('\n📋 Sample products:');
            sampleProducts.forEach(p => {
                console.log(`  - ${p.name} (${p.productId}) - ${p.category}`);
            });

            // Check products with discounts
            const productsWithDiscounts = await Product.countDocuments({ 'discount.enabled': true });
            console.log(`\n💰 Products with active discounts: ${productsWithDiscounts}`);
        }

        // Check collections in database
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('\n📚 Collections in database:');
        collections.forEach(c => {
            console.log(`  - ${c.name}`);
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('\n✅ Database connection closed');
    }
}

checkProducts();
