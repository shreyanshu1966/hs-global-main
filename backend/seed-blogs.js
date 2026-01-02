const mongoose = require('mongoose');
const Blog = require('./models/Blog');
require('dotenv').config();

// Sample blog posts
const sampleBlogs = [
    {
        title: 'The Future of Sustainable Furniture Design',
        slug: 'the-future-of-sustainable-furniture-design',
        excerpt: 'Discover how eco-friendly materials and innovative design are shaping the future of furniture manufacturing.',
        content: `
      <p>The furniture industry is undergoing a significant transformation as sustainability becomes a core focus for manufacturers and consumers alike. At HS Global Export, we're committed to leading this change.</p>
      
      <h2>Eco-Friendly Materials</h2>
      <p>We're increasingly using sustainable materials like reclaimed wood, bamboo, and recycled metals in our furniture designs. These materials not only reduce environmental impact but also create unique, beautiful pieces.</p>
      
      <h2>Manufacturing Innovation</h2>
      <p>Our manufacturing processes have been optimized to minimize waste and reduce energy consumption. We've implemented water-based finishes and low-VOC adhesives to ensure our products are safe for both people and the planet.</p>
      
      <h2>The Road Ahead</h2>
      <p>As we look to the future, we're excited about the possibilities that sustainable design offers. From biodegradable packaging to carbon-neutral shipping, we're committed to making every aspect of our business more environmentally friendly.</p>
    `,
        author: {
            name: 'HS Global Team',
            avatar: 'https://res.cloudinary.com/dpztytsoz/image/upload/v1766858534/hs-global/root/logo.png'
        },
        featuredImage: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=1200&h=800&fit=crop',
        category: 'Design Trends',
        tags: ['Sustainability', 'Eco-Friendly', 'Innovation', 'Furniture Design'],
        status: 'published',
        seo: {
            metaTitle: 'Sustainable Furniture Design - The Future is Green',
            metaDescription: 'Learn about the latest trends in sustainable furniture design and how HS Global Export is leading the way.',
            keywords: ['sustainable furniture', 'eco-friendly design', 'green manufacturing']
        }
    },
    {
        title: 'Marble vs. Quartz: Choosing the Right Surface for Your Space',
        slug: 'marble-vs-quartz-choosing-the-right-surface-for-your-space',
        excerpt: 'A comprehensive guide to help you decide between marble and quartz surfaces for your home or commercial project.',
        content: `
      <p>When it comes to premium surfaces, marble and quartz are two of the most popular choices. Each has its unique characteristics, benefits, and ideal use cases.</p>
      
      <h2>Natural Beauty of Marble</h2>
      <p>Marble is a natural stone that has been prized for centuries for its timeless elegance and unique veining patterns. No two marble slabs are exactly alike, making each installation truly one-of-a-kind.</p>
      
      <h2>Engineered Excellence of Quartz</h2>
      <p>Quartz surfaces are engineered from natural quartz crystals combined with resins and pigments. This manufacturing process creates a non-porous, highly durable surface that's resistant to stains and scratches.</p>
      
      <h2>Making Your Choice</h2>
      <p>Consider your lifestyle, budget, and aesthetic preferences when choosing between marble and quartz. Our team at HS Global Export can help you make the perfect selection for your project.</p>
    `,
        author: {
            name: 'HS Global Team',
            avatar: 'https://res.cloudinary.com/dpztytsoz/image/upload/v1766858534/hs-global/root/logo.png'
        },
        featuredImage: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&h=800&fit=crop',
        category: 'How-To Guides',
        tags: ['Marble', 'Quartz', 'Surfaces', 'Interior Design'],
        status: 'published',
        seo: {
            metaTitle: 'Marble vs Quartz - Complete Comparison Guide',
            metaDescription: 'Compare marble and quartz surfaces to find the perfect material for your project.',
            keywords: ['marble vs quartz', 'surface comparison', 'countertop materials']
        }
    },
    {
        title: 'HS Global Export Expands Product Line with New Designer Collection',
        slug: 'hs-global-export-expands-product-line-with-new-designer-collection',
        excerpt: 'We\'re excited to announce the launch of our new designer furniture collection, featuring contemporary pieces from renowned designers.',
        content: `
      <p>We're thrilled to announce the expansion of our product line with an exclusive designer furniture collection that brings together contemporary aesthetics and exceptional craftsmanship.</p>
      
      <h2>The Collection</h2>
      <p>Our new designer collection features pieces that blend modern design principles with traditional craftsmanship. Each piece is carefully curated to meet the highest standards of quality and style.</p>
      
      <h2>Collaboration with Top Designers</h2>
      <p>We've partnered with some of the industry's most talented designers to create furniture that's not just functional, but truly artistic. These collaborations bring fresh perspectives and innovative designs to our catalog.</p>
      
      <h2>Available Now</h2>
      <p>The new collection is now available for viewing in our gallery and can be ordered through our website. Contact our team to learn more about these exclusive pieces.</p>
    `,
        author: {
            name: 'HS Global Team',
            avatar: 'https://res.cloudinary.com/dpztytsoz/image/upload/v1766858534/hs-global/root/logo.png'
        },
        featuredImage: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&h=800&fit=crop',
        category: 'Company News',
        tags: ['New Products', 'Designer Collection', 'Furniture', 'Launch'],
        status: 'published',
        seo: {
            metaTitle: 'New Designer Furniture Collection Launch - HS Global Export',
            metaDescription: 'Explore our new designer furniture collection featuring contemporary pieces from renowned designers.',
            keywords: ['designer furniture', 'new collection', 'contemporary furniture']
        }
    },
    {
        title: 'Top 5 Kitchen Design Trends for 2026',
        slug: 'top-5-kitchen-design-trends-for-2026',
        excerpt: 'Stay ahead of the curve with these emerging kitchen design trends that are set to dominate in 2026.',
        content: `
      <p>The kitchen continues to be the heart of the home, and 2026 brings exciting new trends that combine functionality with stunning aesthetics.</p>
      
      <h2>1. Bold Color Palettes</h2>
      <p>Say goodbye to all-white kitchens. 2026 is all about bold, rich colors like deep navy, forest green, and warm terracotta.</p>
      
      <h2>2. Mixed Materials</h2>
      <p>Combining different materials like wood, metal, and stone creates visual interest and depth in kitchen design.</p>
      
      <h2>3. Smart Storage Solutions</h2>
      <p>Innovative storage solutions that maximize space while maintaining a clean, minimalist aesthetic are more popular than ever.</p>
      
      <h2>4. Sustainable Materials</h2>
      <p>Eco-friendly materials and energy-efficient appliances are becoming standard in modern kitchen design.</p>
      
      <h2>5. Statement Lighting</h2>
      <p>Oversized pendant lights and sculptural fixtures are being used to create focal points in kitchen spaces.</p>
    `,
        author: {
            name: 'HS Global Team',
            avatar: 'https://res.cloudinary.com/dpztytsoz/image/upload/v1766858534/hs-global/root/logo.png'
        },
        featuredImage: 'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?w=1200&h=800&fit=crop',
        category: 'Design Trends',
        tags: ['Kitchen Design', 'Trends 2026', 'Interior Design', 'Modern Kitchens'],
        status: 'published',
        seo: {
            metaTitle: 'Top Kitchen Design Trends 2026 - Expert Guide',
            metaDescription: 'Discover the top 5 kitchen design trends for 2026 and transform your space.',
            keywords: ['kitchen trends 2026', 'modern kitchen design', 'kitchen renovation']
        }
    },
    {
        title: 'Case Study: Luxury Hotel Renovation with Premium Surfaces',
        slug: 'case-study-luxury-hotel-renovation-with-premium-surfaces',
        excerpt: 'How we helped transform a historic hotel with our premium marble and granite surfaces.',
        content: `
      <p>When a prestigious hotel in the heart of the city needed to renovate its lobby and guest rooms, they turned to HS Global Export for premium surface solutions.</p>
      
      <h2>The Challenge</h2>
      <p>The hotel wanted to maintain its historic charm while incorporating modern luxury. They needed surfaces that were both beautiful and durable enough to withstand high traffic.</p>
      
      <h2>Our Solution</h2>
      <p>We provided custom-cut marble for the lobby floors and reception desk, complemented by granite countertops in the guest bathrooms. Each piece was carefully selected to match the hotel's aesthetic vision.</p>
      
      <h2>The Results</h2>
      <p>The renovation was completed on schedule, and the hotel has received rave reviews for its stunning new look. The premium surfaces have proven to be both beautiful and practical, maintaining their appearance despite heavy use.</p>
      
      <h2>Client Testimonial</h2>
      <p>"Working with HS Global Export was a pleasure. Their expertise and attention to detail helped us achieve the perfect balance between historic elegance and modern luxury." - Hotel General Manager</p>
    `,
        author: {
            name: 'HS Global Team',
            avatar: 'https://res.cloudinary.com/dpztytsoz/image/upload/v1766858534/hs-global/root/logo.png'
        },
        featuredImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=800&fit=crop',
        category: 'Case Studies',
        tags: ['Hotel Renovation', 'Marble', 'Granite', 'Commercial Projects'],
        status: 'published',
        seo: {
            metaTitle: 'Luxury Hotel Renovation Case Study - HS Global Export',
            metaDescription: 'See how we transformed a historic hotel with premium marble and granite surfaces.',
            keywords: ['hotel renovation', 'commercial surfaces', 'marble installation']
        }
    },
    {
        title: 'How to Care for Your Marble Surfaces',
        slug: 'how-to-care-for-your-marble-surfaces',
        excerpt: 'Essential tips and tricks to keep your marble surfaces looking pristine for years to come.',
        content: `
      <p>Marble is a beautiful and luxurious material, but it requires proper care to maintain its stunning appearance. Here's everything you need to know about marble maintenance.</p>
      
      <h2>Daily Cleaning</h2>
      <p>Use a soft cloth and warm water for daily cleaning. Avoid acidic cleaners like vinegar or lemon juice, as they can etch the marble surface.</p>
      
      <h2>Dealing with Spills</h2>
      <p>Wipe up spills immediately, especially acidic substances like wine, coffee, or citrus juices. Blot rather than wipe to prevent spreading the spill.</p>
      
      <h2>Sealing</h2>
      <p>Marble should be sealed regularly to protect against stains. Depending on use, resealing every 6-12 months is recommended.</p>
      
      <h2>Professional Maintenance</h2>
      <p>For deep cleaning and restoration, consider hiring professional marble care services annually.</p>
      
      <h2>Prevention Tips</h2>
      <p>Use coasters under glasses, trivets under hot dishes, and cutting boards when preparing food to prevent damage to your marble surfaces.</p>
    `,
        author: {
            name: 'HS Global Team',
            avatar: 'https://res.cloudinary.com/dpztytsoz/image/upload/v1766858534/hs-global/root/logo.png'
        },
        featuredImage: 'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=1200&h=800&fit=crop',
        category: 'How-To Guides',
        tags: ['Marble Care', 'Maintenance', 'Cleaning Tips', 'Surface Care'],
        status: 'published',
        seo: {
            metaTitle: 'Complete Guide to Marble Care and Maintenance',
            metaDescription: 'Learn how to properly care for and maintain your marble surfaces with expert tips.',
            keywords: ['marble care', 'marble maintenance', 'cleaning marble']
        }
    }
];

// Connect to MongoDB and seed data
async function seedBlogs() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing blogs to avoid duplicates
        await Blog.deleteMany({});
        console.log('Cleared existing blogs');

        // Insert sample blogs
        const blogs = await Blog.insertMany(sampleBlogs);
        console.log(`Successfully created ${blogs.length} blog posts`);

        // Display created blogs
        blogs.forEach(blog => {
            console.log(`- ${blog.title} (${blog.slug})`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Error seeding blogs:', error.message);
        if (error.errors) {
            console.error('Validation errors:');
            Object.keys(error.errors).forEach(key => {
                console.error(`  - ${key}: ${error.errors[key].message}`);
            });
        }
        process.exit(1);
    }
}

seedBlogs();
