const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            console.warn('⚠️ MONGODB_URI is not defined in .env. MongoDB connection will fail.');
        }

        // Enable automatic index creation (important for production)
        mongoose.set('autoIndex', true);

        const conn = await mongoose.connect(uri || 'mongodb://localhost:27017/hs_global', {
            serverSelectionTimeoutMS: 5000,
            dbName: 'hs_global_export', // Explicit DB name
        });

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        
        // Ensure indexes are created after connection
        console.log('🔧 Ensuring database indexes...');
        try {
            await ensureIndexes();
            console.log('✅ Database indexes verified');
        } catch (indexError) {
            console.error('⚠️ Warning: Failed to ensure indexes:', indexError.message);
        }
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        // Do not exit process, so the server can still run in "degraded" mode (e.g. for health checks)
    }
};

/**
 * Ensure critical indexes exist
 * This is especially important for production where autoIndex might be disabled
 */
async function ensureIndexes() {
    try {
        const Product = require('../models/Product');
        
        // Sync indexes from schema
        await Product.syncIndexes();
        
        // Verify critical discount indexes exist
        const collection = mongoose.connection.db.collection('products');
        const indexes = await collection.indexes();
        const indexNames = indexes.map(idx => idx.name);
        
        const requiredIndexes = [
            'discount.enabled_1_discount.endDate_1',
            'discount.enabled_1_discount.startDate_1'
        ];
        
        const missingIndexes = requiredIndexes.filter(name => 
            !indexNames.some(idx => idx.includes('discount'))
        );
        
        if (missingIndexes.length > 0) {
            console.warn('⚠️ Some discount indexes may be missing. Run: node backend/ensure-discount-indexes.js');
        }
    } catch (error) {
        console.error('Error in ensureIndexes:', error.message);
        throw error;
    }
}

module.exports = connectDB;
