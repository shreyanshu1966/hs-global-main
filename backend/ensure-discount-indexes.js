/**
 * Ensure Discount Indexes Script
 * 
 * This script ensures all necessary database indexes for discount management are created.
 * Run this on your live server to fix discount management issues.
 * 
 * Usage:
 *   node backend/ensure-discount-indexes.js
 */

const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Import the Product model to get its schema
const Product = require('./models/Product');

async function ensureDiscountIndexes() {
    try {
        console.log('🔍 Connecting to MongoDB...');
        
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            throw new Error('MONGODB_URI is not defined in .env file');
        }

        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
            dbName: 'hs_global_export',
        });

        console.log('✅ Connected to MongoDB');
        
        // Get the collection
        const collection = mongoose.connection.db.collection('products');
        
        console.log('\n📊 Checking existing indexes...');
        const existingIndexes = await collection.indexes();
        console.log('Current indexes:', existingIndexes.map(idx => idx.name).join(', '));
        
        // Create discount-related indexes
        console.log('\n🔧 Creating/ensuring discount indexes...');
        
        // Index 1: discount.enabled + discount.endDate (for active/expired queries)
        try {
            await collection.createIndex(
                { 'discount.enabled': 1, 'discount.endDate': 1 },
                { name: 'discount_enabled_endDate', background: true }
            );
            console.log('✅ Created index: discount.enabled + discount.endDate');
        } catch (error) {
            if (error.code === 85 || error.code === 86) {
                console.log('ℹ️  Index already exists: discount.enabled + discount.endDate');
            } else {
                throw error;
            }
        }
        
        // Index 2: discount.enabled + discount.startDate (for scheduled queries)
        try {
            await collection.createIndex(
                { 'discount.enabled': 1, 'discount.startDate': 1 },
                { name: 'discount_enabled_startDate', background: true }
            );
            console.log('✅ Created index: discount.enabled + discount.startDate');
        } catch (error) {
            if (error.code === 85 || error.code === 86) {
                console.log('ℹ️  Index already exists: discount.enabled + discount.startDate');
            } else {
                throw error;
            }
        }
        
        // Index 3: discount.enabled alone (for general discount queries)
        try {
            await collection.createIndex(
                { 'discount.enabled': 1 },
                { name: 'discount_enabled', background: true }
            );
            console.log('✅ Created index: discount.enabled');
        } catch (error) {
            if (error.code === 85 || error.code === 86) {
                console.log('ℹ️  Index already exists: discount.enabled');
            } else {
                throw error;
            }
        }
        
        // Also ensure other important indexes from the schema
        console.log('\n🔧 Ensuring other product indexes...');
        
        // Use Mongoose's built-in method to sync all indexes from schema
        await Product.syncIndexes();
        console.log('✅ Synced all indexes from Product schema');
        
        // Show all indexes after creation
        console.log('\n📊 Final index list:');
        const finalIndexes = await collection.indexes();
        finalIndexes.forEach(idx => {
            console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)}`);
        });
        
        // Test a discount analytics query
        console.log('\n🧪 Testing discount analytics query...');
        const analytics = await Product.getDiscountAnalytics();
        console.log('Analytics result:', {
            totalProducts: analytics.totalProducts,
            totalWithDiscounts: analytics.total,
            active: analytics.active,
            scheduled: analytics.scheduled,
            expired: analytics.expired
        });
        
        console.log('\n✅ All indexes created successfully!');
        console.log('✅ Discount management should now work on live server.');
        
    } catch (error) {
        console.error('\n❌ Error ensuring indexes:', error);
        throw error;
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Disconnected from MongoDB');
    }
}

// Run the script
if (require.main === module) {
    ensureDiscountIndexes()
        .then(() => {
            console.log('\n🎉 Script completed successfully!');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n💥 Script failed:', error);
            process.exit(1);
        });
}

module.exports = ensureDiscountIndexes;
