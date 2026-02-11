/**
 * View Database Data Script
 * 
 * This script displays all important database information including:
 * - Database statistics
 * - Collections overview
 * - Products data (with and without discounts)
 * - Sample records from each collection
 * 
 * Usage:
 *   node backend/view-database-data.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('./models/Product');

async function viewDatabaseData() {
    try {
        console.log('🔍 Connecting to MongoDB...\n');
        
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            throw new Error('MONGODB_URI is not defined in .env file');
        }

        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
            dbName: 'hs_global_export',
        });

        console.log('✅ Connected to MongoDB\n');
        console.log('='.repeat(80));
        console.log('DATABASE OVERVIEW');
        console.log('='.repeat(80));
        
        const db = mongoose.connection.db;
        const dbName = db.databaseName;
        
        console.log(`📦 Database Name: ${dbName}`);
        console.log(`🔗 Connection: ${mongoose.connection.host}\n`);
        
        // Get all collections
        const collections = await db.listCollections().toArray();
        console.log(`📚 Total Collections: ${collections.length}`);
        console.log('\nCollections:');
        for (const coll of collections) {
            const count = await db.collection(coll.name).countDocuments();
            console.log(`  - ${coll.name.padEnd(25)} (${count} documents)`);
        }
        
        // Products Statistics
        console.log('\n' + '='.repeat(80));
        console.log('PRODUCTS STATISTICS');
        console.log('='.repeat(80) + '\n');
        
        const totalProducts = await Product.countDocuments();
        const activeProducts = await Product.countDocuments({ status: 'active' });
        const inactiveProducts = await Product.countDocuments({ status: 'inactive' });
        const draftProducts = await Product.countDocuments({ status: 'draft' });
        
        console.log(`📊 Total Products: ${totalProducts}`);
        console.log(`  ✅ Active: ${activeProducts}`);
        console.log(`  ⏸️  Inactive: ${inactiveProducts}`);
        console.log(`  📝 Draft: ${draftProducts}`);
        
        // Category breakdown
        console.log('\n📂 Products by Category:');
        const categoryStats = await Product.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        
        categoryStats.forEach(cat => {
            const categoryName = cat._id || 'No Category';
            console.log(`  - ${categoryName.padEnd(20)} ${cat.count} products`);
        });
        
        // Discount Statistics
        console.log('\n' + '='.repeat(80));
        console.log('DISCOUNT STATISTICS');
        console.log('='.repeat(80) + '\n');
        
        const analytics = await Product.getDiscountAnalytics();
        
        console.log(`📈 Discount Overview:`);
        console.log(`  Total Products: ${analytics.totalProducts}`);
        console.log(`  With Discount Enabled: ${analytics.total}`);
        console.log(`  ✅ Active Discounts: ${analytics.active}`);
        console.log(`  📅 Scheduled Discounts: ${analytics.scheduled}`);
        console.log(`  ⏰ Expired Discounts: ${analytics.expired}`);
        console.log(`  🧹 Needs Cleanup: ${analytics.needsCleanup}`);
        
        if (analytics.total > 0) {
            console.log(`\n💰 Discount Percentages:`);
            console.log(`  Average: ${analytics.avgPercentage.toFixed(2)}%`);
            console.log(`  Maximum: ${analytics.maxPercentage}%`);
            console.log(`  Minimum: ${analytics.minPercentage}%`);
        }
        
        // Products with Discounts
        const productsWithDiscounts = await Product.find({ 'discount.enabled': true })
            .select('productId name category discount priceINR')
            .limit(20)
            .lean();
        
        if (productsWithDiscounts.length > 0) {
            console.log('\n' + '='.repeat(80));
            console.log(`PRODUCTS WITH DISCOUNTS (Showing ${Math.min(20, productsWithDiscounts.length)} of ${analytics.total})`);
            console.log('='.repeat(80) + '\n');
            
            productsWithDiscounts.forEach((product, index) => {
                console.log(`${index + 1}. ${product.name}`);
                console.log(`   ID: ${product.productId}`);
                console.log(`   Category: ${product.category}`);
                console.log(`   Price: ₹${product.priceINR?.toLocaleString('en-IN') || 'N/A'}`);
                console.log(`   Discount: ${product.discount.percentage}%`);
                if (product.discount.startDate) {
                    console.log(`   Start: ${new Date(product.discount.startDate).toLocaleDateString()}`);
                }
                if (product.discount.endDate) {
                    console.log(`   End: ${new Date(product.discount.endDate).toLocaleDateString()}`);
                }
                console.log('');
            });
        }
        
        // Sample Products (without discounts)
        console.log('='.repeat(80));
        console.log('SAMPLE PRODUCTS (First 10)');
        console.log('='.repeat(80) + '\n');
        
        const sampleProducts = await Product.find()
            .select('productId name category subcategory priceINR status discount')
            .limit(10)
            .lean();
        
        sampleProducts.forEach((product, index) => {
            console.log(`${index + 1}. ${product.name}`);
            console.log(`   ID: ${product.productId}`);
            console.log(`   Category: ${product.category} > ${product.subcategory || 'N/A'}`);
            console.log(`   Price: ₹${product.priceINR?.toLocaleString('en-IN') || 'N/A'}`);
            console.log(`   Status: ${product.status}`);
            console.log(`   Discount: ${product.discount?.enabled ? `${product.discount.percentage}% OFF` : 'None'}`);
            console.log('');
        });
        
        // Other Collections Data
        console.log('='.repeat(80));
        console.log('OTHER COLLECTIONS');
        console.log('='.repeat(80) + '\n');
        
        // Users
        const usersCollection = db.collection('users');
        const usersCount = await usersCollection.countDocuments();
        console.log(`👥 Users: ${usersCount}`);
        if (usersCount > 0) {
            const adminCount = await usersCollection.countDocuments({ role: 'admin' });
            const userCount = await usersCollection.countDocuments({ role: 'user' });
            console.log(`   - Admins: ${adminCount}`);
            console.log(`   - Regular Users: ${userCount}`);
        }
        
        // Orders
        const ordersCollection = db.collection('orders');
        const ordersCount = await ordersCollection.countDocuments();
        console.log(`\n📦 Orders: ${ordersCount}`);
        if (ordersCount > 0) {
            const ordersByStatus = await ordersCollection.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ]).toArray();
            ordersByStatus.forEach(status => {
                console.log(`   - ${status._id || 'Unknown'}: ${status.count}`);
            });
        }
        
        // Reviews
        const reviewsCollection = db.collection('reviews');
        const reviewsCount = await reviewsCollection.countDocuments();
        console.log(`\n⭐ Reviews: ${reviewsCount}`);
        
        // Quotations
        const quotationsCollection = db.collection('quotations');
        const quotationsCount = await quotationsCollection.countDocuments();
        console.log(`📋 Quotations: ${quotationsCount}`);
        
        // Contacts
        const contactsCollection = db.collection('contacts');
        const contactsCount = await contactsCollection.countDocuments();
        console.log(`📧 Contact Submissions: ${contactsCount}`);
        
        // Data Quality Check
        console.log('\n' + '='.repeat(80));
        console.log('DATA QUALITY CHECK');
        console.log('='.repeat(80) + '\n');
        
        // Products without prices
        const productsNoPrices = await Product.countDocuments({ 
            $or: [
                { priceINR: { $exists: false } },
                { priceINR: null },
                { priceINR: 0 }
            ]
        });
        console.log(`${productsNoPrices > 0 ? '⚠️' : '✅'}  Products without prices: ${productsNoPrices}`);
        
        // Products without images
        const productsNoImages = await Product.countDocuments({ 
            $or: [
                { image: { $exists: false } },
                { image: null },
                { image: '' }
            ]
        });
        console.log(`${productsNoImages > 0 ? '⚠️' : '✅'}  Products without main image: ${productsNoImages}`);
        
        // Products without productId
        const productsNoId = await Product.countDocuments({ 
            $or: [
                { productId: { $exists: false } },
                { productId: null },
                { productId: '' }
            ]
        });
        console.log(`${productsNoId > 0 ? '❌' : '✅'}  Products without productId: ${productsNoId}`);
        
        // Products with invalid discount percentages
        const invalidDiscounts = await Product.countDocuments({
            'discount.enabled': true,
            $or: [
                { 'discount.percentage': { $lte: 0 } },
                { 'discount.percentage': { $gt: 100 } }
            ]
        });
        console.log(`${invalidDiscounts > 0 ? '❌' : '✅'}  Products with invalid discount %: ${invalidDiscounts}`);
        
        // Expired discounts still enabled
        const now = new Date();
        const expiredEnabled = await Product.countDocuments({
            'discount.enabled': true,
            'discount.endDate': { $lt: now }
        });
        console.log(`${expiredEnabled > 0 ? '⚠️' : '✅'}  Expired discounts still enabled: ${expiredEnabled}`);
        
        if (expiredEnabled > 0) {
            console.log(`\n   💡 Tip: Run "node fix-expired-discounts.js" to clean these up`);
        }
        
        // Summary
        console.log('\n' + '='.repeat(80));
        console.log('SUMMARY');
        console.log('='.repeat(80) + '\n');
        
        const issues = [];
        if (productsNoPrices > 0) issues.push(`${productsNoPrices} products missing prices`);
        if (productsNoImages > 0) issues.push(`${productsNoImages} products missing images`);
        if (productsNoId > 0) issues.push(`${productsNoId} products missing IDs`);
        if (invalidDiscounts > 0) issues.push(`${invalidDiscounts} invalid discounts`);
        if (expiredEnabled > 0) issues.push(`${expiredEnabled} expired discounts`);
        
        if (issues.length === 0) {
            console.log('✅ Database looks healthy! No critical issues found.');
        } else {
            console.log('⚠️  Issues found:');
            issues.forEach(issue => console.log(`   - ${issue}`));
        }
        
        console.log(`\n📊 Overall Status:`);
        console.log(`   Total Products: ${totalProducts}`);
        console.log(`   Active Discounts: ${analytics.active}`);
        console.log(`   Data Quality: ${issues.length === 0 ? 'Good' : 'Needs Attention'}`);
        
        console.log('\n✅ Database inspection complete!\n');
        
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error('\nFull error:', error);
        throw error;
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Disconnected from MongoDB\n');
    }
}

// Run the script
if (require.main === module) {
    viewDatabaseData()
        .then(() => process.exit(0))
        .catch(error => {
            console.error('Script failed:', error);
            process.exit(1);
        });
}

module.exports = viewDatabaseData;
