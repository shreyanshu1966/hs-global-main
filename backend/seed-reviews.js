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
    // International buyers
    { name: 'Sarah Johnson', region: 'USA', buyerType: 'interior_designer' },
    { name: 'Michael Davis', region: 'USA', buyerType: 'homeowner' },
    { name: 'Emma Thompson', region: 'UK', buyerType: 'architect' },
    { name: 'James Wilson', region: 'UK', buyerType: 'contractor' },
    { name: 'Isabella Rossi', region: 'Italy', buyerType: 'hotel_owner' },
    { name: 'Mohammed Al-Rahman', region: 'UAE', buyerType: 'developer' },
    { name: 'Chen Wei', region: 'Singapore', buyerType: 'homeowner' },
    { name: 'Priya Sharma', region: 'India', buyerType: 'interior_designer' },
    { name: 'Rajesh Patel', region: 'India', buyerType: 'architect' },
    { name: 'David Kim', region: 'South Korea', buyerType: 'contractor' },
    { name: 'Ana García', region: 'Spain', buyerType: 'homeowner' },
    { name: 'François Dubois', region: 'France', buyerType: 'hotel_owner' },
    { name: 'Hans Mueller', region: 'Germany', buyerType: 'developer' },
    { name: 'Yuki Tanaka', region: 'Japan', buyerType: 'architect' },
    { name: 'Sophie Anderson', region: 'Australia', buyerType: 'interior_designer' },
    { name: 'Marco Silva', region: 'Brazil', buyerType: 'contractor' },
    { name: 'Olivia Brown', region: 'Canada', buyerType: 'homeowner' },
    { name: 'Ahmed Hassan', region: 'Egypt', buyerType: 'developer' },
    { name: 'Linda Martinez', region: 'Mexico', buyerType: 'hotel_owner' },
    { name: 'Sergei Petrov', region: 'Russia', buyerType: 'architect' },
    { name: 'Aisha Okonkwo', region: 'Nigeria', buyerType: 'homeowner' },
    { name: 'Kevin O\'Connor', region: 'Ireland', buyerType: 'contractor' },
    { name: 'Maria Gonzalez', region: 'Argentina', buyerType: 'interior_designer' },
    { name: 'Alexander Popov', region: 'Bulgaria', buyerType: 'developer' },
    { name: 'Lisa Zhang', region: 'Australia', buyerType: 'architect' },
];

// Review templates by buyer type and rating
const reviewTemplates = {
    furniture: {
        5: {
            interior_designer: [
                "Absolutely stunning piece! The {material} finish is exceptional and the craftsmanship is top-notch. My clients are thrilled with how this {product} transformed their space. Perfect proportions and the quality is evident in every detail.",
                "As an interior designer, I'm quite particular about furniture quality. This {product} exceeded all expectations! The {material} has the most beautiful natural patterns and the finishing work is impeccable. Will definitely order more pieces.",
                "Outstanding quality and design! This {product} became the centerpiece of our luxury hotel lobby. The {material} is gorgeous and guests constantly compliment it. Fast shipping to {region} and excellent packaging.",
            ],
            homeowner: [
                "Love this {product}! Perfect addition to our living room. The {material} is beautiful and feels very premium. Delivery to {region} was smooth and the team was professional. Highly recommend!",
                "This {product} is absolutely gorgeous! The natural beauty of {material} adds such elegance to our home. Quality is amazing and it's exactly as described. Worth every penny!",
                "Couldn't be happier with this purchase! The {product} fits perfectly in our space and the {material} finish is stunning. Great communication from the seller and fast shipping to {region}.",
            ],
            architect: [
                "Exceptional architectural element! This {product} perfectly complements our modern design aesthetic. The {material} quality is superior and the dimensions are exactly as specified. Professional service throughout.",
                "High-quality {material} with excellent structural integrity. This {product} meets all our architectural standards and the finish is remarkable. Reliable supplier with consistent quality.",
                "Perfect for our luxury residential project! The {material} texture and color are exactly what we needed. Professional handling and delivery. Will use HS Global for future projects.",
            ],
            contractor: [
                "Solid construction and beautiful finish! This {product} was perfect for our high-end residential project. {material} quality is excellent and installation was straightforward. Client is very happy.",
                "Great quality {material} and precise dimensions. This {product} fits perfectly and the finish work is professional grade. Good value for luxury projects. Timely delivery to {region}.",
                "Excellent build quality! The {material} is premium grade and the {product} exceeded client expectations. Professional packaging and delivery. Reliable supplier for commercial projects.",
            ],
            developer: [
                "Outstanding {product} for our luxury development! The {material} quality is exceptional and clients are thrilled. Perfect for high-end residential projects.",
                "Excellent {product} choice for our commercial development. The {material} finish is beautiful and installation was seamless. Will use for future projects.",
                "Premium quality {product} for our luxury hotel project. The {material} adds elegance and guests constantly compliment it. Highly recommend.",
            ],
            hotel_owner: [
                "Perfect addition to our luxury hotel! This {product} creates a stunning impression in our lobby. The {material} is beautiful and guests love it.",
                "Outstanding {product} for our hotel renovation! The {material} quality is exceptional and adds such elegance to our space. Highly recommend!",
                "Excellent {product} choice for our boutique hotel. The {material} finish is gorgeous and creates the perfect ambiance. Premium quality throughout.",
            ]
        },
        4: {
            interior_designer: [
                "Very good quality {product}! The {material} has lovely natural patterns. Minor imperfection in finish but overall very pleased. Good value for the price and clients are happy with it.",
                "Nice piece overall. The {material} quality is good and the design works well in modern spaces. Delivery to {region} took a bit longer than expected but arrived safely.",
                "Solid {product} with beautiful {material}. The finish could be slightly better but it's a good piece for the price range. Would consider ordering again for appropriate projects.",
            ],
            homeowner: [
                "Really happy with this {product}! The {material} looks great in our home. Only minor issue was a small scratch on arrival but doesn't affect the overall beauty. Good purchase!",
                "Good quality {product} at a fair price. The {material} is beautiful and adds character to our space. Took a while to arrive in {region} but worth the wait.",
                "Nice {product} overall. The {material} has some lovely natural variation. Packaging could be improved but the item arrived safely. Happy with the purchase.",
            ],
            architect: [
                "Good structural quality and acceptable finish. This {product} meets our project requirements though the {material} grade could be slightly higher. Reliable delivery to our site.",
                "Decent {material} quality for the price point. The {product} serves its architectural purpose well. Few minor finish imperfections but acceptable for this project level.",
                "Acceptable quality for commercial use. The {product} dimensions are accurate and {material} is decent grade. Service was professional and delivery was on time.",
            ],
            contractor: [
                "Solid construction and beautiful finish! This {product} was perfect for our high-end residential project. {material} quality is excellent and installation was straightforward. Client is very happy.",
                "Great quality {material} and precise dimensions. This {product} fits perfectly and the finish work is professional grade. Good value for luxury projects. Timely delivery to {region}.",
                "Good build quality! The {material} is good grade and the {product} met client expectations. Professional packaging and delivery. Reliable supplier for commercial projects.",
            ],
            developer: [
                "Good quality {product} for our development project. The {material} works well and clients are satisfied. Minor finish variations but overall acceptable for mid-range projects.",
                "Decent {product} choice for commercial use. The {material} quality is good and installation went smoothly. Would consider for future developments.",
                "Fair quality {product} for the price point. The {material} serves its purpose and dimensions are accurate. Professional service and timely delivery.",
            ],
            hotel_owner: [
                "Good addition to our hotel lobby. The {product} looks nice and guests comment positively. The {material} quality is decent for commercial use.",
                "Nice {product} for our hotel renovation. The {material} finish is acceptable and it fits well with our design. Good value for hospitality projects.",
                "Decent quality {product} for commercial hospitality use. The {material} holds up well to daily use. Professional delivery and service.",
            ]
        }
    },
    slabs: {
        5: {
            architect: [
                "Exceptional {material} slab! Perfect for our luxury project. The {finish} finish is flawless and the natural patterns are stunning. Consistent thickness of {thickness} throughout. Professional service from HS Global.",
                "Outstanding quality {material} from {origin}! The color consistency and {finish} finish exceeded our expectations. This slab was perfect for our high-end residential project. Excellent for {application}.",
                "Premium grade {material} slab! Beautiful natural veining and perfect {finish} finish. The {thickness} thickness is exactly as specified. Will definitely use HS Global again for future projects.",
            ],
            developer: [
                "Excellent {material} quality for our commercial project! Consistent color and beautiful {finish} finish. The {thickness} slabs arrived perfectly packaged. Great for large-scale {application} installations.",
                "Top-quality {origin} {material}! Perfect for our luxury development. The {finish} finish is professional grade and the slabs have beautiful natural characteristics. Reliable supplier.",
                "Outstanding {material} slabs! Used these for multiple units and the consistency is remarkable. Beautiful {finish} finish and perfect dimensions. Excellent value for premium projects.",
            ],
            contractor: [
                "Fantastic {material} slabs! Easy to work with and the {finish} finish is excellent. Perfect {thickness} and great for {application}. Installation went smoothly and client loves the result.",
                "High-quality {origin} {material}! Beautiful natural patterns and consistent {finish} finish. The {thickness} thickness made installation efficient. Professional grade material.",
                "Excellent quality control! These {material} slabs are premium grade with perfect {finish} finish. Dimensions accurate and great for high-end {application} work.",
            ],
            interior_designer: [
                "Absolutely love this {origin} {material}! The {finish} finish brings out the natural beauty perfectly. Used it for {application} and the result is stunning. Premium quality throughout.",
                "Perfect {material} for luxury interiors! The natural patterns in this {origin} stone are breathtaking. {finish} finish is flawless and the {thickness} works perfectly for {application}.",
                "Designer quality {material} slab! Beautiful {finish} finish and consistent color. This {origin} stone adds such elegance to the space. Excellent for high-end {application} projects.",
            ],
            homeowner: [
                "Love this {origin} {material}! Perfect for our home renovation. The {finish} finish is gorgeous and the quality is evident in every detail. Highly recommend!",
                "This {material} is absolutely beautiful! The natural patterns are stunning and the {finish} finish is flawless. Worth every penny for our dream kitchen!",
                "Couldn't be happier with this {material}! The {finish} finish adds such elegance to our home. Professional delivery to {region} and excellent packaging.",
            ],
            hotel_owner: [
                "Outstanding {material} for our luxury hotel! This slab creates a stunning impression in our lobby. The {finish} finish is flawless and guests constantly compliment it.",
                "Perfect choice for our boutique hotel renovation! The {origin} {material} with {finish} finish adds incredible elegance. Premium quality throughout.",
                "Exceptional {material} for hospitality use! The {finish} finish is gorgeous and holds up beautifully to commercial use. Guests love the luxurious feel.",
            ]
        },
        4: {
            architect: [
                "Good quality {material} overall. The {finish} finish is nice and the {origin} sourcing is evident. Minor variations in thickness but acceptable for our project requirements.",
                "Solid {material} choice. Good {finish} finish and decent consistency. The {thickness} specification was mostly accurate. Would consider for appropriate project applications.",
                "Nice {origin} {material} with good structural properties. The {finish} finish is professional though not exceptional. Good value for mid-range projects.",
            ],
            contractor: [
                "Good working material. This {material} processes well and the {finish} finish is decent. Some minor inconsistencies but overall good for {application} installations.",
                "Decent {material} slabs. The {finish} finish is acceptable and dimensions are mostly accurate. Installation went well though prep time was longer due to variations.",
                "Fair quality {origin} {material}. Good for standard {application} work. The {finish} finish is consistent enough for most commercial applications.",
            ],
            developer: [
                "Good {material} quality for our development project. The {finish} finish works well and the {thickness} is acceptable. Minor variations but good for mid-range projects.",
                "Decent {origin} {material} for commercial use. The {finish} finish is professional and installation went smoothly. Would consider for future developments.",
                "Fair quality {material} for the price point. The {finish} finish serves its purpose and dimensions are mostly accurate. Professional service.",
            ],
            interior_designer: [
                "Good {material} for interior projects. The {finish} finish looks nice and the {origin} sourcing is apparent. Minor inconsistencies but acceptable for most applications.",
                "Decent {material} choice for design projects. The {finish} finish works well with our aesthetic. Some variation in quality but overall satisfied.",
                "Fair quality {origin} {material} for the price. The {finish} finish is acceptable and clients are generally happy with the result.",
            ],
            homeowner: [
                "Happy with this {material} purchase! The {finish} finish looks great in our home. Minor imperfections but overall good value for money.",
                "Good {origin} {material} for our renovation. The {finish} finish is nice and installation went well. Worth the investment.",
                "Nice {material} overall. The {finish} finish adds character to our space. Some minor variations but we're pleased with the result.",
            ],
            hotel_owner: [
                "Good {material} for our hotel renovation. The {finish} finish looks professional and holds up well to commercial use. Acceptable quality.",
                "Decent {origin} {material} for hospitality projects. The {finish} finish works well and guests haven't complained. Good for commercial applications.",
                "Fair quality {material} for our hotel lobby. The {finish} finish is acceptable and fits our budget. Professional service throughout.",
            ]
        }
    }
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
    
    // Only good reviews - 4 and 5 star ratings only
    const ratingDistribution = [5, 5, 5, 5, 5, 5, 5, 4, 4, 4]; // 70% 5-star, 30% 4-star
    const rating = ratingDistribution[Math.floor(Math.random() * ratingDistribution.length)];
    
    // Get appropriate templates with better fallback logic
    const categoryTemplates = reviewTemplates[product.category] || reviewTemplates.furniture;
    const ratingTemplates = categoryTemplates[rating] || categoryTemplates[5]; // Fallback to 5-star
    
    // Get buyer templates with multiple fallback options
    let buyerTemplates = ratingTemplates[reviewer.buyerType];
    if (!buyerTemplates) {
        // Try common fallback buyer types
        buyerTemplates = ratingTemplates.homeowner || ratingTemplates.interior_designer || ratingTemplates.architect;
    }
    
    // If still no templates, use any available templates from this rating level
    if (!buyerTemplates) {
        const availableBuyerTypes = Object.keys(ratingTemplates);
        if (availableBuyerTypes.length > 0) {
            buyerTemplates = ratingTemplates[availableBuyerTypes[0]];
        }
    }
    
    // Final fallback - use 5-star homeowner templates
    if (!buyerTemplates || !Array.isArray(buyerTemplates)) {
        buyerTemplates = reviewTemplates.furniture[5].homeowner;
    }
    
    // Ensure we use a unique template
    const availableTemplates = buyerTemplates.filter(template => 
        !usedTemplates.has(`${product.productId}-${template.substring(0, 20)}`)
    );
    
    let selectedTemplate;
    if (availableTemplates.length > 0) {
        selectedTemplate = availableTemplates[Math.floor(Math.random() * availableTemplates.length)];
    } else {
        // If all templates used, pick any and modify slightly
        selectedTemplate = buyerTemplates[Math.floor(Math.random() * buyerTemplates.length)];
    }
    
    usedTemplates.add(`${product.productId}-${selectedTemplate.substring(0, 20)}`);
    
    // Get product specifications for template replacement
    const specs = getProductSpecs(product);
    
    // Fill template
    const comment = fillTemplate(selectedTemplate, specs, reviewer);
    
    // Generate review title
    const titleTemplates = {
        5: ['Excellent Quality!', 'Outstanding!', 'Perfect Choice!', 'Highly Recommend!', 'Premium Quality', 'Love It!', 'Exceeded Expectations!', 'Amazing Product!', 'Superb Craftsmanship!'],
        4: ['Great Quality', 'Very Good!', 'Happy with Purchase', 'Good Value', 'Satisfied', 'Nice Product', 'Good Choice', 'Really Good!', 'Solid Purchase']
    };
    
    const titles = titleTemplates[rating] || titleTemplates[4];
    const title = titles[Math.floor(Math.random() * titles.length)];
    
    // Generate review date (between 3 months ago and 1 week ago)
    const maxAge = 90 * 24 * 60 * 60 * 1000; // 3 months in milliseconds
    const minAge = 7 * 24 * 60 * 60 * 1000; // 1 week in milliseconds
    const reviewDate = new Date(Date.now() - minAge - Math.random() * (maxAge - minAge));
    
    return {
        productId: product.productId,
        userName: reviewer.name,
        userEmail: generateEmail(reviewer.name, reviewer.region),
        rating: rating,
        title: title,
        comment: comment,
        verified: Math.random() > 0.3, // 70% verified reviews
        helpful: getHelpfulVotes(rating),
        status: Math.random() > 0.1 ? 'approved' : 'pending', // 90% approved
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
            // Generate 3-8 reviews per product
            const numberOfReviews = Math.floor(Math.random() * 6) + 3; // 3 to 8 reviews
            
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