const mongoose = require('mongoose');
const Product = require('./models/Product');
const Review = require('./models/Review');
require('dotenv').config();

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

// Realistic reviewer names and regions
const reviewerProfiles = [
    // USA
    { name: 'Sarah Johnson', region: 'USA', buyerType: 'interior_designer' },
    { name: 'Michael Davis', region: 'USA', buyerType: 'homeowner' },
    { name: 'Jennifer Smith', region: 'USA', buyerType: 'architect' },
    { name: 'David Wilson', region: 'USA', buyerType: 'contractor' },
    { name: 'Robert Taylor', region: 'USA', buyerType: 'developer' },
    { name: 'Jessica Anderson', region: 'USA', buyerType: 'hotel_owner' },
    { name: 'William Thomas', region: 'USA', buyerType: 'homeowner' },
    { name: 'Ashley Jackson', region: 'USA', buyerType: 'interior_designer' },
    { name: 'Matthew White', region: 'USA', buyerType: 'contractor' },
    { name: 'Elizabeth Harris', region: 'USA', buyerType: 'architect' },
    // UK
    { name: 'Emma Thompson', region: 'UK', buyerType: 'architect' },
    { name: 'James Wilson', region: 'UK', buyerType: 'contractor' },
    { name: 'Oliver Hughes', region: 'UK', buyerType: 'homeowner' },
    { name: 'Charlotte Green', region: 'UK', buyerType: 'interior_designer' },
    { name: 'George Wood', region: 'UK', buyerType: 'developer' },
    { name: 'Sophie Martin', region: 'UK', buyerType: 'hotel_owner' },
    // Europe
    { name: 'Isabella Rossi', region: 'Italy', buyerType: 'hotel_owner' },
    { name: 'Marco Bianchi', region: 'Italy', buyerType: 'architect' },
    { name: 'Ana García', region: 'Spain', buyerType: 'homeowner' },
    { name: 'Carlos Martinez', region: 'Spain', buyerType: 'contractor' },
    { name: 'François Dubois', region: 'France', buyerType: 'hotel_owner' },
    { name: 'Marie Laurent', region: 'France', buyerType: 'interior_designer' },
    { name: 'Hans Mueller', region: 'Germany', buyerType: 'developer' },
    { name: 'Julia Weber', region: 'Germany', buyerType: 'architect' },
    { name: 'Lukas Wagner', region: 'Germany', buyerType: 'contractor' },
    { name: 'Sergei Petrov', region: 'Russia', buyerType: 'architect' },
    { name: 'Elena Ivanova', region: 'Russia', buyerType: 'interior_designer' },
    { name: 'Kevin O\'Connor', region: 'Ireland', buyerType: 'contractor' },
    { name: 'Alexander Popov', region: 'Bulgaria', buyerType: 'developer' },
    // Asia & Middle East
    { name: 'Mohammed Al-Rahman', region: 'UAE', buyerType: 'developer' },
    { name: 'Fatima Al-Sayed', region: 'UAE', buyerType: 'interior_designer' },
    { name: 'Chen Wei', region: 'Singapore', buyerType: 'homeowner' },
    { name: 'Li Jie', region: 'Singapore', buyerType: 'architect' },
    { name: 'Priya Sharma', region: 'India', buyerType: 'interior_designer' },
    { name: 'Rajesh Patel', region: 'India', buyerType: 'architect' },
    { name: 'Amit Kumar', region: 'India', buyerType: 'developer' },
    { name: 'Neha Gupta', region: 'India', buyerType: 'homeowner' },
    { name: 'David Kim', region: 'South Korea', buyerType: 'contractor' },
    { name: 'Ji-Yeon Park', region: 'South Korea', buyerType: 'interior_designer' },
    { name: 'Yuki Tanaka', region: 'Japan', buyerType: 'architect' },
    { name: 'Kenji Sato', region: 'Japan', buyerType: 'hotel_owner' },
    // Australia & Americas
    { name: 'Sophie Anderson', region: 'Australia', buyerType: 'interior_designer' },
    { name: 'Lisa Zhang', region: 'Australia', buyerType: 'architect' },
    { name: 'Jack Taylor', region: 'Australia', buyerType: 'developer' },
    { name: 'Marco Silva', region: 'Brazil', buyerType: 'contractor' },
    { name: 'Camila Santos', region: 'Brazil', buyerType: 'homeowner' },
    { name: 'Olivia Brown', region: 'Canada', buyerType: 'homeowner' },
    { name: 'Liam Tremblay', region: 'Canada', buyerType: 'developer' },
    { name: 'Linda Martinez', region: 'Mexico', buyerType: 'hotel_owner' },
    { name: 'Maria Gonzalez', region: 'Argentina', buyerType: 'interior_designer' },
    // Africa
    { name: 'Ahmed Hassan', region: 'Egypt', buyerType: 'developer' },
    { name: 'Aisha Okonkwo', region: 'Nigeria', buyerType: 'homeowner' },
    { name: 'Chidi Eze', region: 'Nigeria', buyerType: 'contractor' },
    { name: 'Johan Van Der Merwe', region: 'South Africa', buyerType: 'architect' }
];

// Dynamic review phrases
const reviewPhrases = {
    openers: [
        "Absolutely stunning piece!", "As an interior designer, I'm quite particular.", 
        "Outstanding quality and design!", "Love this {product}!", 
        "This {product} is absolutely gorgeous!", "Couldn't be happier with this purchase!",
        "Exceptional architectural element!", "High-quality {material} with excellent structural integrity.",
        "Perfect for our luxury project!", "Solid construction and beautiful finish!",
        "Great quality {material} and precise dimensions.", "Excellent build quality!",
        "Outstanding {product} for our development!", "Premium quality {product} for our project.",
        "Perfect addition to our space!", "Very impressed with the craftsmanship.",
        "Exactly what we were looking for.", "Beyond my expectations.",
        "Incredible attention to detail.", "A truly magnificent {product}.",
        "I was blown away by the quality.", "Such a beautiful {material} finish.",
        "This {product} is a game changer for our design.", "Exquisite {material} and superb finish.",
        "Fantastic experience from start to finish.", "The finest {product} I've purchased in years."
    ],
    mids: [
        "The {material} finish is exceptional and the craftsmanship is top-notch.",
        "The {material} has the most beautiful natural patterns.",
        "This {product} became the centerpiece of our space.",
        "The natural beauty of {material} adds such elegance.",
        "The {product} fits perfectly in our space.",
        "This {product} perfectly complements our modern design aesthetic.",
        "The {material} quality is superior and the dimensions are exact.",
        "The {material} texture and color are exactly what we needed.",
        "{material} quality is excellent and installation was straightforward.",
        "The finish work is professional grade.",
        "The {material} adds elegance and guests constantly compliment it.",
        "The {finish} finish is flawless and the natural patterns are stunning.",
        "Consistent thickness and perfect finish.",
        "The color consistency is remarkable.",
        "It elevates the entire room immediately.",
        "The {material} feels incredibly durable yet elegant.",
        "I've received so many compliments on this {product}.",
        "Installation went smoothly and the {finish} finish is holding up perfectly.",
        "Every single detail showcases premium craftsmanship.",
        "The {material} brings a unique character that you just can't find elsewhere."
    ],
    closers: [
        "My clients are thrilled.", "Will definitely order more pieces.",
        "Fast shipping to {region} and excellent packaging.",
        "Highly recommend!", "Worth every penny!",
        "Great communication from the seller.",
        "Professional service throughout.", "Reliable supplier with consistent quality.",
        "Will use HS Global for future projects.", "Client is very happy.",
        "Timely delivery to {region}.", "Reliable supplier for commercial projects.",
        "Professional packaging and delivery.", "Premium quality throughout.",
        "Cannot wait to install more of these.",
        "Will be purchasing again for my next project.",
        "Five stars all the way!",
        "Thanks for a wonderful transaction.",
        "Delivery to {region} was faster than expected.",
        "A truly worthwhile investment."
    ]
};

// Quality adjectives for different materials
const materialDescriptors = {
    'granite': ['durable', 'polished', 'lustrous', 'speckled', 'crystalline', 'resistant'],
    'marble': ['elegant', 'veined', 'smooth', 'luxurious', 'classic', 'pristine'],
    'tables': ['sturdy', 'finished', 'crafted', 'designed', 'balanced', 'proportioned'],
    'wash basins': ['smooth', 'curved', 'polished', 'seamless', 'refined', 'sculptural'],
    'benches': ['solid', 'comfortable', 'weatherproof', 'stable', 'architectural', 'durable']
};

// Helpful vote patterns (more helpful votes for higher ratings)
const getHelpfulVotes = (rating) => {
    const baseVotes = Math.floor(Math.random() * 8);
    if (rating >= 5) return baseVotes + Math.floor(Math.random() * 15);
    if (rating >= 4) return baseVotes + Math.floor(Math.random() * 10);
    if (rating >= 3) return Math.floor(Math.random() * 5);
    return Math.floor(Math.random() * 3);
};

// Generate email from name and region
const generateEmail = (name, region) => {
    const firstName = name.split(' ')[0].toLowerCase();
    const lastName = name.split(' ')[1].toLowerCase();
    const domains = {
        USA: ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'],
        UK: ['gmail.com', 'outlook.com', 'btinternet.com', 'yahoo.co.uk'],
        Italy: ['gmail.com', 'libero.it', 'yahoo.it', 'outlook.com'],
        UAE: ['gmail.com', 'yahoo.com', 'outlook.com'],
        Singapore: ['gmail.com', 'yahoo.com.sg', 'outlook.com'],
        India: ['gmail.com', 'yahoo.com', 'outlook.com', 'rediffmail.com'],
        default: ['gmail.com', 'yahoo.com', 'outlook.com']
    };
    
    const domainList = domains[region] || domains.default;
    const domain = domainList[Math.floor(Math.random() * domainList.length)];
    
    const patterns = [
        `${firstName}.${lastName}`,
        `${firstName}${lastName}`,
        `${firstName}.${lastName}${Math.floor(Math.random() * 99)}`,
        `${firstName}${Math.floor(Math.random() * 999)}`
    ];
    
    const pattern = patterns[Math.floor(Math.random() * patterns.length)];
    return `${pattern}@${domain}`;
};

// Extract product specifications for template replacement
const getProductSpecs = (product) => {
    if (product.category === 'furniture' && product.furnitureSpecs) {
        return {
            material: product.furnitureSpecs.material || product.furnitureSpecs.colorName || 'premium stone',
            product: product.furnitureSpecs.product || product.subcategory || 'furniture piece',
            finish: product.furnitureSpecs.surfaceFinish || 'polished',
            size: product.furnitureSpecs.size || 'standard size'
        };
    } else if (product.category === 'slabs' && product.slabSpecs) {
        return {
            material: product.slabSpecs.material || product.subcategory,
            finish: product.slabSpecs.finish || 'polished',
            thickness: product.slabSpecs.thickness || 'standard thickness',
            origin: product.slabSpecs.origin || 'premium source',
            application: product.slabSpecs.application || 'architectural use'
        };
    }
    
    // Fallback for products without specs
    return {
        material: product.subcategory || 'natural stone',
        product: product.name,
        finish: 'polished',
        thickness: 'standard thickness',
        origin: 'premium source',
        application: 'architectural use'
    };
};

// Replace template variables
const fillTemplate = (template, specs, reviewer) => {
    let filled = template;
    Object.keys(specs).forEach(key => {
        const regex = new RegExp(`\\{${key}\\}`, 'g');
        filled = filled.replace(regex, specs[key]);
    });
    filled = filled.replace(/\{region\}/g, reviewer.region);
    return filled;
};

// Generate review for a product
const generateReviewForProduct = (product, usedTemplates) => {
    // Select random reviewer
    const reviewer = reviewerProfiles[Math.floor(Math.random() * reviewerProfiles.length)];
    
    // User wants 4.5 to 5 rating -> 85% 5-star, 15% 4-star averages to ~4.85
    const actualRating = Math.random() > 0.15 ? 5 : 4; 
    
    const specs = getProductSpecs(product);
    
    // Dynamic comment generation
    const openers = reviewPhrases.openers;
    const mids = reviewPhrases.mids;
    const closers = reviewPhrases.closers;
    
    // Sometimes add a second middle sentence for variety
    const o = openers[Math.floor(Math.random() * openers.length)];
    let m = mids[Math.floor(Math.random() * mids.length)];
    if (Math.random() > 0.5) {
        let m2 = mids[Math.floor(Math.random() * mids.length)];
        if (m !== m2) m += " " + m2;
    }
    const c = closers[Math.floor(Math.random() * closers.length)];
    
    let comment = `${o} ${m} ${c}`;
    
    // Fill template
    comment = fillTemplate(comment, specs, reviewer);
    
    // Generate review title
    const titleTemplates = [
        'Excellent Quality!', 'Outstanding!', 'Perfect Choice!', 'Highly Recommend!', 
        'Premium Quality', 'Love It!', 'Exceeded Expectations!', 'Amazing Product!', 
        'Superb Craftsmanship!', 'Great Value', 'Beautiful Addition', 'Very Satisfied',
        'Stunning Material', 'Five Stars', 'Incredible Finish', 'Top Notch',
        'Beautiful and Durable', 'Highly Professional', 'Best Purchase', 'Flawless'
    ];
    
    const title = titleTemplates[Math.floor(Math.random() * titleTemplates.length)];
    
    // Generate review date (between 1 year ago and 1 week ago) to spread out 100-150 reviews
    const maxAge = 365 * 24 * 60 * 60 * 1000; 
    const minAge = 7 * 24 * 60 * 60 * 1000; 
    const reviewDate = new Date(Date.now() - minAge - Math.random() * (maxAge - minAge));
    
    return {
        productId: product.productId,
        userName: reviewer.name,
        userEmail: generateEmail(reviewer.name, reviewer.region),
        rating: actualRating,
        title: title,
        comment: comment,
        verified: Math.random() > 0.1, // 90% verified reviews
        helpful: getHelpfulVotes(actualRating),
        status: Math.random() > 0.05 ? 'approved' : 'pending', // 95% approved
        createdAt: reviewDate,
        updatedAt: reviewDate
    };
};
// Update rating statistics for all products after seeding
const updateAllProductRatings = async () => {
    console.log('📊 Calculating rating statistics for all products...');
    
    const products = await Product.find({ status: 'active' });
    let updatedCount = 0;
    
    for (const product of products) {
        try {
            const stats = await Review.getProductStats(product.productId);
            
            await Product.findOneAndUpdate(
                { productId: product.productId },
                {
                    averageRating: stats.averageRating,
                    totalReviews: stats.totalReviews
                }
            );
            
            if (stats.totalReviews > 0) {
                console.log(`   ✅ ${product.name}: ${stats.averageRating.toFixed(1)} ⭐ (${stats.totalReviews} reviews)`);
                updatedCount++;
            }
            
        } catch (error) {
            console.error(`   ❌ Error updating ${product.name}:`, error.message);
        }
    }
    
    console.log(`🎯 Updated rating stats for ${updatedCount} products with reviews`);
};
// Main seeding function
const seedReviews = async () => {
    try {
        console.log('🌱 Starting review seeding process...');
        console.log('======================================');
        
        await connectDB();
        
        // Get active products that have stable product identifiers
        const products = await Product.find({
            status: 'active',
            productId: { $exists: true, $ne: '' }
        }).select('productId name category subcategory furnitureSpecs slabSpecs');
        console.log(`📦 Found ${products.length} products to generate reviews for`);
        
        if (products.length === 0) {
            console.log('❌ No products found. Please run product migration first.');
            return;
        }
        
        // Clear existing reviews (optional - comment out if you want to keep existing reviews)
        console.log('🗑️ Clearing existing reviews...');
        const deletedCount = await Review.deleteMany({});
        console.log(`✅ Removed ${deletedCount.deletedCount} existing reviews`);
        
        const allReviews = [];
        const usedTemplates = new Set();
        let totalReviewsGenerated = 0;
        
        for (const product of products) {
            // Generate 100-150 reviews per product
            const numberOfReviews = Math.floor(Math.random() * 51) + 100; // 100 to 150 reviews
            
            console.log(`📝 Generating ${numberOfReviews} reviews for: ${product.name}`);
            
            for (let i = 0; i < numberOfReviews; i++) {
                const review = generateReviewForProduct(product, usedTemplates);
                allReviews.push(review);
                totalReviewsGenerated++;
            }
        }
        
        // Batch insert all reviews
        console.log(`💾 Inserting ${totalReviewsGenerated} reviews into database...`);
        await Review.insertMany(allReviews);
        
        // Generate statistics
        const stats = await Review.aggregate([
            { $match: { status: 'approved' } },
            {
                $group: {
                    _id: '$rating',
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: -1 } }
        ]);
        
        console.log('✅ Review seeding completed successfully!');
        console.log('==========================================');
        console.log(`📊 Generated ${totalReviewsGenerated} total reviews`);
        console.log('📈 Rating distribution:');
        stats.forEach(stat => {
            console.log(`   ${stat._id} stars: ${stat.count} reviews`);
        });
        
        const verifiedCount = await Review.countDocuments({ verified: true });
        const approvedCount = await Review.countDocuments({ status: 'approved' });
        console.log(`✅ Verified reviews: ${verifiedCount}`);
        console.log(`✅ Approved reviews: ${approvedCount}`);
        
        console.log('\n🎉 All reviews have been generated successfully!');
        console.log('💡 You can now view reviews on your product pages.');
        
        // Update product rating statistics
        console.log('\n🔄 Updating product rating statistics...');
        await updateAllProductRatings();
        
    } catch (error) {
        console.error('❌ Error during review seeding:', error);
        throw error;
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
    }
};

// Execute seeding
if (require.main === module) {
    seedReviews().catch(console.error);
}

module.exports = { seedReviews };