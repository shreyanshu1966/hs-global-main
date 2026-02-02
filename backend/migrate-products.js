const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Import models
const Product = require('./models/Product');

// Connect to database
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hs_global_export');
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1);
    }
};

// Utility functions
const toSlug = (str) => {
    return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
};

// Sample furniture products data
const SAMPLE_FURNITURE_PRODUCTS = [
    // Tables
    {
        name: 'Black Galaxy Coffee Table',
        subcategory: 'Coffee Table',
        images: [
            'https://res.cloudinary.com/dti5vep0b/image/upload/furnitures/tables/coffee-table/black-galaxy-1.webp',
            'https://res.cloudinary.com/dti5vep0b/image/upload/furnitures/tables/coffee-table/black-galaxy-2.webp'
        ],
        priceINR: 45000,
        furnitureSpecs: {
            product: 'Coffee Table',
            type: 'Indoor',
            shape: 'Round',
            material: 'Black Galaxy Granite',
            size: '36 x 36 x 18 inch',
            surfaceFinish: 'Polished',
            delivery: '15-20 days',
            height: '18 inches',
            colorName: 'Black',
            packagingDetails: 'Wooden crate packaging',
            location: 'India'
        }
    },
    {
        name: 'Statuario Marble Console Table',
        subcategory: 'Console Table',
        images: [
            'https://res.cloudinary.com/dti5vep0b/image/upload/furnitures/tables/console-table/statuario-1.webp',
            'https://res.cloudinary.com/dti5vep0b/image/upload/furnitures/tables/console-table/statuario-2.webp'
        ],
        priceINR: 89000,
        furnitureSpecs: {
            product: 'Console Table',
            type: 'Indoor',
            shape: 'Rectangular',
            material: 'Statuario Marble',
            size: '60 x 18 x 32 inch',
            surfaceFinish: 'Polished',
            delivery: '15-20 days',
            height: '32 inches',
            colorName: 'White with Grey Veins',
            packagingDetails: 'Wooden crate packaging',
            location: 'India'
        }
    },
    {
        name: 'Calacatta Gold Dining Table',
        subcategory: 'Dining Table',
        images: [
            'https://res.cloudinary.com/dti5vep0b/image/upload/furnitures/tables/dining-table/calacatta-1.webp',
            'https://res.cloudinary.com/dti5vep0b/image/upload/furnitures/tables/dining-table/calacatta-2.webp'
        ],
        priceINR: 125000,
        furnitureSpecs: {
            product: 'Dining Table',
            type: 'Indoor',
            shape: 'Rectangular',
            material: 'Calacatta Gold Marble',
            size: '72 x 36 x 30 inch',
            surfaceFinish: 'Polished',
            delivery: '15-20 days',
            height: '30 inches',
            colorName: 'White with Gold Veins',
            packagingDetails: 'Wooden crate packaging',
            location: 'India'
        }
    },

    // Wash Basins
    {
        name: 'Black Granite Pedestal Basin',
        subcategory: 'Pedestal',
        images: [
            'https://res.cloudinary.com/dti5vep0b/image/upload/furnitures/wash-basins/pedestal/black-granite-1.webp',
            'https://res.cloudinary.com/dti5vep0b/image/upload/furnitures/wash-basins/pedestal/black-granite-2.webp'
        ],
        priceINR: 35000,
        furnitureSpecs: {
            product: 'Wash Basin',
            type: 'Indoor',
            shape: 'Oval',
            material: 'Black Granite',
            size: '24 x 18 x 6 inch',
            surfaceFinish: 'Polished',
            delivery: '10-15 days',
            height: '6 inches',
            colorName: 'Black',
            packagingDetails: 'Bubble wrap and wooden crate',
            location: 'India'
        }
    },
    {
        name: 'Marble Countertop Basin',
        subcategory: 'Countertop',
        images: [
            'https://res.cloudinary.com/dti5vep0b/image/upload/furnitures/wash-basins/countertop/marble-1.webp',
            'https://res.cloudinary.com/dti5vep0b/image/upload/furnitures/wash-basins/countertop/marble-2.webp'
        ],
        priceINR: 28000,
        furnitureSpecs: {
            product: 'Wash Basin',
            type: 'Indoor',
            shape: 'Round',
            material: 'White Marble',
            size: '20 x 20 x 5 inch',
            surfaceFinish: 'Polished',
            delivery: '10-15 days',
            height: '5 inches',
            colorName: 'White',
            packagingDetails: 'Bubble wrap and wooden crate',
            location: 'India'
        }
    },

    // Sculptures
    {
        name: 'Buddha Sculpture',
        subcategory: 'Sculptures',
        images: [
            'https://res.cloudinary.com/dti5vep0b/image/upload/furnitures/sculptures/buddha-1.webp',
            'https://res.cloudinary.com/dti5vep0b/image/upload/furnitures/sculptures/buddha-2.webp'
        ],
        priceINR: 65000,
        furnitureSpecs: {
            product: 'Sculpture',
            type: 'Indoor/Outdoor',
            shape: 'Traditional',
            material: 'White Marble',
            size: '24 x 18 x 36 inch',
            surfaceFinish: 'Hand Carved',
            delivery: '20-25 days',
            height: '36 inches',
            colorName: 'White',
            packagingDetails: 'Special artistic packaging',
            location: 'India'
        }
    },

    // Benches
    {
        name: 'Garden Granite Bench',
        subcategory: 'Benches',
        images: [
            'https://res.cloudinary.com/dti5vep0b/image/upload/furnitures/benches/garden-granite-1.webp',
            'https://res.cloudinary.com/dti5vep0b/image/upload/furnitures/benches/garden-granite-2.webp'
        ],
        priceINR: 42000,
        furnitureSpecs: {
            product: 'Bench',
            type: 'Outdoor',
            shape: 'Rectangular',
            material: 'Grey Granite',
            size: '48 x 18 x 18 inch',
            surfaceFinish: 'Flamed',
            delivery: '15-20 days',
            height: '18 inches',
            colorName: 'Grey',
            packagingDetails: 'Wooden crate packaging',
            location: 'India'
        }
    }
];

// Sample slab products data
const SAMPLE_SLAB_PRODUCTS = [
    // Granite Slabs
    {
        name: 'Black Galaxy Granite Slab',
        subcategory: 'Black Galaxy',
        category: 'slabs',
        images: [
            'https://res.cloudinary.com/dti5vep0b/image/upload/slabs/granite/black-galaxy-1.webp',
            'https://res.cloudinary.com/dti5vep0b/image/upload/slabs/granite/black-galaxy-2.webp'
        ],
        priceINR: 2500,
        slabSpecs: {
            finish: 'Polished',
            thickness: '20mm',
            origin: 'India',
            material: 'Black Galaxy Granite',
            application: 'Indoor/Outdoor'
        }
    },
    {
        name: 'Alaska Pink Granite Slab',
        subcategory: 'Alaska Pink',
        category: 'slabs',
        images: [
            'https://res.cloudinary.com/dti5vep0b/image/upload/slabs/granite/alaska-pink-1.webp',
            'https://res.cloudinary.com/dti5vep0b/image/upload/slabs/granite/alaska-pink-2.webp'
        ],
        priceINR: 2200,
        slabSpecs: {
            finish: 'Polished',
            thickness: '20mm',
            origin: 'India',
            material: 'Alaska Pink Granite',
            application: 'Indoor/Outdoor'
        }
    },

    // Marble Slabs
    {
        name: 'Statuario White Marble Slab',
        subcategory: 'Statuario',
        category: 'slabs',
        images: [
            'https://res.cloudinary.com/dti5vep0b/image/upload/slabs/marble/statuario-1.webp',
            'https://res.cloudinary.com/dti5vep0b/image/upload/slabs/marble/statuario-2.webp'
        ],
        priceINR: 4500,
        slabSpecs: {
            finish: 'Polished',
            thickness: '20mm',
            origin: 'Italy',
            material: 'Statuario White Marble',
            application: 'Indoor'
        }
    },
    {
        name: 'Carrara White Marble Slab',
        subcategory: 'Carrara',
        category: 'slabs',
        images: [
            'https://res.cloudinary.com/dti5vep0b/image/upload/slabs/marble/carrara-1.webp',
            'https://res.cloudinary.com/dti5vep0b/image/upload/slabs/marble/carrara-2.webp'
        ],
        priceINR: 3800,
        slabSpecs: {
            finish: 'Polished',
            thickness: '20mm',
            origin: 'Italy',
            material: 'Carrara White Marble',
            application: 'Indoor'
        }
    },
    {
        name: 'Calacatta Gold Marble Slab',
        subcategory: 'Calacatta',
        category: 'slabs',
        images: [
            'https://res.cloudinary.com/dti5vep0b/image/upload/slabs/marble/calacatta-gold-1.webp',
            'https://res.cloudinary.com/dti5vep0b/image/upload/slabs/marble/calacatta-gold-2.webp'
        ],
        priceINR: 6500,
        slabSpecs: {
            finish: 'Polished',
            thickness: '20mm',
            origin: 'Italy',
            material: 'Calacatta Gold Marble',
            application: 'Indoor'
        }
    }
];

const migrateProduct = async (productData, category) => {
    // Check if product already exists
    const productId = toSlug(productData.name);
    const existing = await Product.findOne({ productId });
    if (existing) {
        console.log(`⚠️ Product ${productId} already exists, skipping...`);
        return;
    }

    // Create product document
    const product = new Product({
        productId,
        name: productData.name,
        category: category,
        subcategory: productData.subcategory,
        description: productData.description || `Premium ${productData.name} from HS Global Export`,
        image: productData.images[0],
        images: productData.images,
        sortedImages: productData.images,
        priceINR: productData.priceINR,
        available: true,
        hasVideo: false,
        furnitureSpecs: productData.furnitureSpecs || undefined,
        slabSpecs: productData.slabSpecs || undefined,
        status: 'active',
        featured: Math.random() < 0.2, // 20% chance of being featured
        tags: [category, productData.subcategory, productData.name.toLowerCase()],
        seoTitle: `${productData.name} - ${productData.subcategory} | HS Global Export`,
        seoDescription: `Premium ${productData.name} in ${productData.subcategory}. High-quality ${category} products from HS Global Export.`,
        seoKeywords: [productData.name.toLowerCase(), productData.subcategory.toLowerCase(), category, 'premium', 'export', 'india']
    });

    await product.save();
    console.log(`✅ Migrated: ${productData.name}`);
};

// Migration functions
const migrateFurnitureProducts = async () => {
    console.log('🪑 Starting furniture products migration...');
    
    let count = 0;
    for (const product of SAMPLE_FURNITURE_PRODUCTS) {
        try {
            await migrateProduct(product, 'furniture');
            count++;
        } catch (error) {
            console.error(`Error migrating furniture product ${product.name}:`, error.message);
        }
    }
    
    console.log(`✅ Migrated ${count} furniture products`);
};

const migrateSlabProducts = async () => {
    console.log('🪨 Starting slab products migration...');
    
    let count = 0;
    for (const product of SAMPLE_SLAB_PRODUCTS) {
        try {
            await migrateProduct(product, 'slabs');
            count++;
        } catch (error) {
            console.error(`Error migrating slab product ${product.name}:`, error.message);
        }
    }
    
    console.log(`✅ Migrated ${count} slab products`);
};

// Main migration function
const migrateAllProducts = async () => {
    try {
        console.log('🚀 Starting products migration...');
        console.log('==================================');
        
        await connectDB();
        
        // Clear existing products collection to avoid index conflicts
        console.log('🗑️ Clearing existing products...');
        try {
            await mongoose.connection.db.dropCollection('products');
            console.log('✅ Collection cleared');
        } catch (err) {
            console.log('ℹ️ Collection does not exist, continuing...');
        }

        await migrateFurnitureProducts();
        await migrateSlabProducts();

        const totalProducts = await Product.countDocuments();
        console.log('==================================');
        console.log(`🎉 Migration completed! Total products in database: ${totalProducts}`);
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
    }
};

// Script execution
if (require.main === module) {
    migrateAllProducts();
}

module.exports = {
    migrateAllProducts,
    migrateFurnitureProducts,
    migrateSlabProducts,
    connectDB
};