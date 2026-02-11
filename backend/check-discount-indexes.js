/**
 * Check Discount Indexes
 * 
 * Quick diagnostic script to check if discount indexes exist in the database.
 * Run this to diagnose discount management issues.
 * 
 * Usage:
 *   node backend/check-discount-indexes.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

async function checkDiscountIndexes() {
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
        
        // Get the products collection
        const collection = mongoose.connection.db.collection('products');
        
        // Get all indexes
        console.log('\n📊 Checking product collection indexes...\n');
        const indexes = await collection.indexes();
        
        // Check for discount-related indexes
        const discountIndexes = indexes.filter(idx => 
            JSON.stringify(idx.key).includes('discount')
        );
        
        console.log('='.repeat(60));
        console.log('DISCOUNT INDEXES STATUS');
        console.log('='.repeat(60));
        
        if (discountIndexes.length === 0) {
            console.log('❌ NO DISCOUNT INDEXES FOUND!');
            console.log('\nThis is likely why discount management is failing.');
            console.log('\n📌 Fix: Run the following command:');
            console.log('   node backend/ensure-discount-indexes.js\n');
        } else {
            console.log(`✅ Found ${discountIndexes.length} discount-related indexes:\n`);
            discountIndexes.forEach(idx => {
                console.log(`  ✓ ${idx.name}`);
                console.log(`    Keys: ${JSON.stringify(idx.key)}`);
                console.log('');
            });
        }
        
        // Check for required indexes
        console.log('='.repeat(60));
        console.log('REQUIRED INDEXES CHECK');
        console.log('='.repeat(60) + '\n');
        
        const hasEnabledEndDate = discountIndexes.some(idx => 
            idx.key['discount.enabled'] && idx.key['discount.endDate']
        );
        
        const hasEnabledStartDate = discountIndexes.some(idx => 
            idx.key['discount.enabled'] && idx.key['discount.startDate']
        );
        
        const hasEnabled = discountIndexes.some(idx => 
            idx.key['discount.enabled'] && !idx.key['discount.startDate'] && !idx.key['discount.endDate']
        ) || hasEnabledEndDate || hasEnabledStartDate;
        
        console.log(`${hasEnabledEndDate ? '✅' : '❌'} discount.enabled + discount.endDate`);
        console.log(`${hasEnabledStartDate ? '✅' : '❌'} discount.enabled + discount.startDate`);
        console.log(`${hasEnabled ? '✅' : '❌'} discount.enabled (general)`);
        
        // Overall status
        console.log('\n' + '='.repeat(60));
        const allRequired = hasEnabledEndDate && hasEnabledStartDate;
        if (allRequired) {
            console.log('✅ ALL REQUIRED INDEXES EXIST');
            console.log('   Discount management should work properly.');
        } else {
            console.log('❌ MISSING REQUIRED INDEXES');
            console.log('   Discount management will be slow or fail.');
            console.log('\n📌 Fix: Run the following command:');
            console.log('   node backend/ensure-discount-indexes.js');
        }
        console.log('='.repeat(60) + '\n');
        
        // Show all indexes for reference
        console.log('ALL PRODUCT INDEXES (' + indexes.length + ' total):');
        console.log('-'.repeat(60));
        indexes.forEach((idx, i) => {
            console.log(`${i + 1}. ${idx.name}`);
            console.log(`   ${JSON.stringify(idx.key)}`);
        });
        console.log('');
        
        // Test a simple discount query
        console.log('\n🧪 Testing discount query performance...');
        const now = new Date();
        const startTime = Date.now();
        
        const count = await collection.countDocuments({
            'discount.enabled': true,
            'discount.endDate': { $gte: now }
        });
        
        const duration = Date.now() - startTime;
        console.log(`✓ Query completed in ${duration}ms`);
        console.log(`  Found ${count} products with active discounts`);
        
        if (duration > 1000) {
            console.log('\n⚠️  WARNING: Query took over 1 second!');
            console.log('   This indicates missing indexes.');
            console.log('   Run: node backend/ensure-discount-indexes.js');
        } else {
            console.log('\n✅ Query performance is good!');
        }
        
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        throw error;
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Disconnected from MongoDB\n');
    }
}

// Run the script
if (require.main === module) {
    checkDiscountIndexes()
        .then(() => process.exit(0))
        .catch(error => {
            console.error('Script failed:', error);
            process.exit(1);
        });
}

module.exports = checkDiscountIndexes;
