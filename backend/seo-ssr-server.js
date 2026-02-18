/**
 * SEO Server-Side Rendering Server
 * 
 * This server detects bots and serves pre-rendered HTML with proper meta tags.
 * Regular users are served the React app normally.
 * 
 * Usage:
 * 1. Build your React app: npm run build
 * 2. Run this server: node backend/seo-ssr-server.js
 * 3. Point your domain to this server
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.SSR_PORT || 4000;

// MongoDB connection (use your existing connection)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hsglobal';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ MongoDB connected for SSR');
}).catch((err) => {
  console.error('❌ MongoDB connection error:', err);
});

// Import Product model
const Product = require('./models/Product');

// Bot detection regex
const BOT_USER_AGENTS = /googlebot|bingbot|yahoo|duckduckbot|baiduspider|yandex|facebookexternalhit|facebot|twitterbot|whatsapp|linkedinbot|slackbot|telegrambot|pinterest|discordbot/i;

// Site configuration
const SITE_URL = process.env.SITE_URL || 'https://www.hsglobalexport.com';
const SITE_NAME = 'HS Global Export';

// Serve static files from React build
const frontendBuildPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendBuildPath));

/**
 * Helper: Check if request is from a bot
 */
function isBot(userAgent) {
  return BOT_USER_AGENTS.test(userAgent);
}

/**
 * Helper: Fetch product by slug or ID
 */
async function fetchProduct(slugOrId) {
  try {
    // Try to find by slug first
    let product = await Product.findOne({ 'seo.slug': slugOrId });
    
    if (!product) {
      // Try by ID
      if (mongoose.Types.ObjectId.isValid(slugOrId)) {
        product = await Product.findById(slugOrId);
      }
    }
    
    if (!product) {
      // Try by name matching slug pattern
      const namePattern = slugOrId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      product = await Product.findOne({
        name: { $regex: new RegExp(namePattern, 'i') }
      });
    }
    
    return product;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

/**
 * Helper: Generate SEO meta tags for product
 */
function generateProductMetaTags(product) {
  const productId = product._id || product.id;
  const productUrl = `${SITE_URL}/products/${product.seo?.slug || productId}`;
  
  // Get product image
  let productImage = product.seo?.ogImage || product.image || 
    (product.images && product.images.length > 0 ? product.images[0] : null) ||
    `${SITE_URL}/og-image.jpg`;
  
  // Ensure absolute URL
  if (!productImage.startsWith('http')) {
    productImage = `${SITE_URL}${productImage}`;
  }
  
  // Generate title
  const categoryContext = product.category ? ` | ${product.category.charAt(0).toUpperCase() + product.category.slice(1)}` : '';
  const title = product.seo?.metaTitle || 
    `${product.name}${categoryContext} | ${SITE_NAME}`.substring(0, 60);
  
  // Generate description
  const description = product.seo?.metaDescription || 
    `${product.description.substring(0, 140)}. Premium ${product.category || 'marble'} from HS Global Export.`.substring(0, 160);
  
  // Keywords
  const keywords = product.seo?.keywords?.join(', ') || 
    `${product.name}, ${product.category || 'marble'}, premium stone, HS Global Export`;
  
  // Schema.org structured data
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "image": product.images || [productImage],
    "brand": {
      "@type": "Brand",
      "name": SITE_NAME
    },
    "offers": {
      "@type": "Offer",
      "price": product.priceINR || 0,
      "priceCurrency": "INR",
      "availability": product.available ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "url": productUrl
    }
  };
  
  // Add rating if available
  if (product.averageRating && product.totalReviews > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": product.averageRating,
      "reviewCount": product.totalReviews
    };
  }
  
  return {
    title,
    description,
    keywords,
    canonical: productUrl,
    ogTitle: title,
    ogDescription: description,
    ogImage: productImage,
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: productImage,
    schema
  };
}

/**
 * Helper: Generate HTML with meta tags for bots
 */
function generateBotHTML(metaTags) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- Primary Meta Tags -->
  <title>${metaTags.title}</title>
  <meta name="title" content="${metaTags.title}">
  <meta name="description" content="${metaTags.description}">
  <meta name="keywords" content="${metaTags.keywords}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${metaTags.canonical}">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="product">
  <meta property="og:url" content="${metaTags.canonical}">
  <meta property="og:site_name" content="${SITE_NAME}">
  <meta property="og:title" content="${metaTags.ogTitle}">
  <meta property="og:description" content="${metaTags.ogDescription}">
  <meta property="og:image" content="${metaTags.ogImage}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${metaTags.title}">
  <meta property="og:locale" content="en_US">
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${metaTags.canonical}">
  <meta name="twitter:title" content="${metaTags.twitterTitle}">
  <meta name="twitter:description" content="${metaTags.twitterDescription}">
  <meta name="twitter:image" content="${metaTags.twitterImage}">
  <meta name="twitter:image:alt" content="${metaTags.title}">
  
  <!-- Schema.org for structured data -->
  <script type="application/ld+json">${JSON.stringify(metaTags.schema, null, 2)}</script>
  
  <style>
    body { 
      font-family: Arial, sans-serif; 
      max-width: 800px; 
      margin: 50px auto; 
      padding: 20px; 
      line-height: 1.6;
    }
    img { max-width: 100%; height: auto; border-radius: 8px; margin: 20px 0; }
    .button { 
      display: inline-block; 
      background: #3b82f6; 
      color: white; 
      padding: 12px 24px; 
      border-radius: 6px; 
      text-decoration: none;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <h1>${metaTags.title}</h1>
  <img src="${metaTags.ogImage}" alt="${metaTags.title}">
  <p>${metaTags.description}</p>
  <a href="${metaTags.canonical}" class="button">View Full Product Details</a>
  
  <noscript>
    <p>This is a JavaScript application. Please <a href="${metaTags.canonical}">click here</a> to view the full product.</p>
  </noscript>
  
  <!-- Redirect after 2 seconds -->
  <script>
    setTimeout(function() {
      window.location.href = '${metaTags.canonical}';
    }, 2000);
  </script>
</body>
</html>`;
}

/**
 * Main route handler
 */
app.get('*', async (req, res) => {
  const userAgent = req.get('user-agent') || '';
  const isUserBot = isBot(userAgent);
  
  console.log(`[${isUserBot ? 'BOT' : 'USER'}] ${req.path} - ${userAgent.substring(0, 50)}`);
  
  // Handle product pages
  if (req.path.startsWith('/products/')) {
    const productSlug = req.path.split('/').pop();
    
    if (!productSlug || productSlug === 'products') {
      // Products listing page - serve normal React app
      return res.sendFile(path.join(frontendBuildPath, 'index.html'));
    }
    
    try {
      const product = await fetchProduct(productSlug);
      
      if (product && isUserBot) {
        // Bot detected - serve pre-rendered HTML with meta tags
        const metaTags = generateProductMetaTags(product);
        return res.send(generateBotHTML(metaTags));
      }
      
      if (!product && isUserBot) {
        // Product not found for bot
        res.status(404).send(`<!DOCTYPE html>
<html>
<head>
  <title>Product Not Found | ${SITE_NAME}</title>
  <meta name="robots" content="noindex">
</head>
<body>
  <h1>Product Not Found</h1>
  <p>The product you're looking for could not be found.</p>
  <a href="${SITE_URL}">Return to Homepage</a>
</body>
</html>`);
        return;
      }
    } catch (error) {
      console.error('Error processing product page:', error);
    }
  }
  
  // For all other paths (including regular users on product pages)
  // serve the React SPA
  const indexPath = path.join(frontendBuildPath, 'index.html');
  
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Frontend build not found. Please run: npm run build');
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════╗
║   🚀 SEO SSR Server Running                   ║
║                                               ║
║   Port: ${PORT}                                  ║
║   MongoDB: ${MONGODB_URI.includes('localhost') ? 'Local' : 'Remote'}                       ║
║   Site URL: ${SITE_URL}    ║
║                                               ║
║   Bot Detection: ✅ Active                    ║
║   SEO Meta Tags: ✅ Dynamic                   ║
║                                               ║
║   🔍 Test with:                               ║
║   curl -A "facebookexternalhit" \\            ║
║        http://localhost:${PORT}/products/PRODUCT_ID ║
╚═══════════════════════════════════════════════╝
  `);
});

module.exports = app;
