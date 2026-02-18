/**
 * useProductSEO Hook
 * 
 * Generates comprehensive SEO metadata for product pages following best practices.
 * Handles Title, Description, OG tags, Twitter Cards, and Canonical URLs.
 * 
 * Best Practices Implemented:
 * - Title: 50-60 characters, includes brand name
 * - Meta Description: 150-160 characters, compelling and informative
 * - Open Graph: Complete metadata for social sharing
 * - Twitter Cards: Large image format
 * - Canonical URL: Prevents duplicate content issues
 * - Schema.org: Product structured data (handled in component)
 */

interface Product {
  _id?: string;
  id?: string;
  name: string;
  description: string;
  image?: string;
  images?: string[];
  category?: string;
  subcategory?: string;
  priceINR?: number;
  available?: boolean;
  averageRating?: number;
  totalReviews?: number;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
    h1Tag?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    twitterTitle?: string;
    twitterDescription?: string;
    twitterImage?: string;
    canonicalUrl?: string;
    slug?: string;
  };
  // Legacy fields for backward compatibility
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
}

interface ProductSEOMetadata {
  // Page Title
  title: string;
  
  // Meta Tags
  metaDescription: string;
  metaKeywords: string;
  
  // H1 Tag
  h1Tag: string;
  
  // Open Graph
  ogType: string;
  ogUrl: string;
  ogSiteName: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogImageWidth: string;
  ogImageHeight: string;
  ogImageAlt: string;
  ogLocale: string;
  
  // Twitter Cards
  twitterCard: string;
  twitterUrl: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  twitterImageAlt: string;
  
  // Canonical
  canonicalUrl: string;
  
  // Additional
  robotsIndex: boolean;
}

const SITE_URL = 'https://www.hsglobalexport.com';
const SITE_NAME = 'HS Global Export';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;

/**
 * Truncate text to specified length with ellipsis
 */
const truncate = (text: string, maxLength: number): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3).trim() + '...';
};

/**
 * Generate comprehensive SEO metadata for a product
 */
export const useProductSEO = (product: Product | null): ProductSEOMetadata => {
  if (!product) {
    return {
      title: `Product Not Found | ${SITE_NAME}`,
      metaDescription: 'The requested product could not be found.',
      metaKeywords: '',
      h1Tag: 'Product Not Found',
      ogType: 'website',
      ogUrl: SITE_URL,
      ogSiteName: SITE_NAME,
      ogTitle: `Product Not Found | ${SITE_NAME}`,
      ogDescription: 'The requested product could not be found.',
      ogImage: DEFAULT_OG_IMAGE,
      ogImageWidth: '1200',
      ogImageHeight: '630',
      ogImageAlt: SITE_NAME,
      ogLocale: 'en_US',
      twitterCard: 'summary_large_image',
      twitterUrl: SITE_URL,
      twitterTitle: `Product Not Found | ${SITE_NAME}`,
      twitterDescription: 'The requested product could not be found.',
      twitterImage: DEFAULT_OG_IMAGE,
      twitterImageAlt: SITE_NAME,
      canonicalUrl: SITE_URL,
      robotsIndex: false
    };
  }

  const productId = product._id || product.id || '';
  const productName = product.name || 'Premium Product';
  const productDescription = product.description || 'High-quality marble and granite product from HS Global Export';
  
  // Build product URL (using slug in future, productId for now)
  const productUrl = product.seo?.canonicalUrl || `${SITE_URL}/products/${productId}`;
  
  // Get product image
  const productImage = product.seo?.ogImage || 
                      product.image || 
                      (product.images && product.images.length > 0 ? product.images[0] : null) ||
                      DEFAULT_OG_IMAGE;
  
  // Ensure image is absolute URL
  const absoluteImageUrl = productImage.startsWith('http') 
    ? productImage 
    : `${SITE_URL}${productImage}`;
  
  // Generate category context
  const categoryContext = product.category ? ` | ${product.category.charAt(0).toUpperCase() + product.category.slice(1)}` : '';
  const subcategoryContext = product.subcategory ? ` - ${product.subcategory.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}` : '';
  
  // 1. PAGE TITLE (50-60 characters ideal)
  const pageTitle = product.seo?.metaTitle || 
                   product.seoTitle || 
                   truncate(`${productName}${categoryContext} | ${SITE_NAME}`, 60);
  
  // 2. META DESCRIPTION (150-160 characters ideal)
  const metaDescription = product.seo?.metaDescription || 
                         product.seoDescription || 
                         truncate(`${productDescription}. Premium ${product.category || 'marble and granite'} products from ${SITE_NAME}. Global shipping available.`, 160);
  
  // 3. META KEYWORDS
  const keywords = product.seo?.keywords || product.seoKeywords || [];
  const defaultKeywords = [
    productName.toLowerCase(),
    product.category || 'marble',
    product.subcategory || 'natural stone',
    'premium marble',
    'granite products',
    'natural stone',
    'HS Global Export',
    'luxury stone products'
  ];
  const metaKeywords = keywords.length > 0 
    ? keywords.join(', ') 
    : defaultKeywords.join(', ');
  
  // 4. H1 TAG
  const h1Tag = product.seo?.h1Tag || productName;
  
  // 5. OPEN GRAPH TITLE (should be compelling, can be slightly different from page title)
  const ogTitle = product.seo?.ogTitle || 
                 truncate(`${productName}${categoryContext}${subcategoryContext}`, 60);
  
  // 6. OPEN GRAPH DESCRIPTION
  const ogDescription = product.seo?.ogDescription || 
                       truncate(`${productDescription}. Shop premium ${product.category || 'stone'} products at ${SITE_NAME}.`, 160);
  
  // 7. TWITTER TITLE
  const twitterTitle = product.seo?.twitterTitle || ogTitle;
  
  // 8. TWITTER DESCRIPTION
  const twitterDescription = product.seo?.twitterDescription || ogDescription;
  
  // 9. IMAGE ALT TEXT
  const imageAlt = `${productName} - Premium ${product.category || 'Stone'} Product from ${SITE_NAME}`;
  
  // 10. ROBOTS META (index product pages with valid availability)
  const robotsIndex = product.available !== false;
  
  return {
    // Page Title
    title: pageTitle,
    
    // Meta Tags
    metaDescription,
    metaKeywords,
    
    // H1 Tag
    h1Tag,
    
    // Open Graph
    ogType: 'product',
    ogUrl: productUrl,
    ogSiteName: SITE_NAME,
    ogTitle,
    ogDescription,
    ogImage: absoluteImageUrl,
    ogImageWidth: '1200',
    ogImageHeight: '630',
    ogImageAlt: imageAlt,
    ogLocale: 'en_US',
    
    // Twitter Cards
    twitterCard: 'summary_large_image',
    twitterUrl: productUrl,
    twitterTitle,
    twitterDescription,
    twitterImage: absoluteImageUrl,
    twitterImageAlt: imageAlt,
    
    // Canonical
    canonicalUrl: productUrl,
    
    // Additional
    robotsIndex
  };
};

/**
 * Format robots meta content
 */
export const formatRobotsMeta = (shouldIndex: boolean): string => {
  return shouldIndex ? 'index, follow' : 'noindex, nofollow';
};

export default useProductSEO;
