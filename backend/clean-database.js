const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hsglobal';

async function cleanDatabase() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const db = mongoose.connection.db;

        // Remove Discount collection (coupon-based discounts)
        console.log('🗑️  Removing Discount collection...');
        const collections = await db.listCollections({ name: 'discounts' }).toArray();
        
        if (collections.length > 0) {
            await db.collection('discounts').drop();
            console.log('✅ Discount collection removed successfully');
        } else {
            console.log('ℹ️  Discount collection does not exist (already cleaned)');
        }

        console.log('\n✨ Database cleanup completed successfully!');
        console.log('\nNote: Product-level discounts in the products collection are preserved.');

    } catch (error) {
        console.error('❌ Error cleaning database:', error.message);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
        process.exit(0);
    }
}

// Run the cleanup
cleanDatabase();
