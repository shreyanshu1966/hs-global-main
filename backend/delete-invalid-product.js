const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

const deleteInvalidProduct = async () => {
    try {
        // Connect to MongoDB
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hs_global';
        await mongoose.connect(uri, { dbName: 'hs_global_export' });
        console.log('✅ Connected to MongoDB');

        // Find the product with the URL as productId
        const productId = 'https://www.shopify.com/in';
        
        console.log(`\n🔍 Looking for product with ID: ${productId}`);
        const product = await Product.findOne({ productId: productId });
        
        if (!product) {
            console.log('❌ Product not found');
            process.exit(0);
        }

        console.log('\n📦 Found product:');
        console.log({
            productId: product.productId,
            name: product.name,
            category: product.category,
            createdAt: product.createdAt
        });

        // Delete the product
        await Product.deleteOne({ productId: productId });
        console.log('\n✅ Product deleted successfully!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

deleteInvalidProduct();
