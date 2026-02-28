import React, { useEffect, useRef, useState, useLayoutEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Info, Package } from "lucide-react";
import ContactUs from "../components/ContactUs";
import { ProductDetailsSkeleton } from "../components/ProductDetailsSkeleton";
import { ProductGallery } from "../components/product/ProductGallery";
import { useCart } from "../contexts/CartContext";
import { useProduct } from "../hooks/useProducts";
import { useCurrency } from "../contexts/CurrencyContext";
import { useProductSEO, formatRobotsMeta } from "../hooks/useProductSEO";
import { ProductInfo } from "../components/product/ProductInfo";
import { ProductOverview } from "../components/product/ProductOverview";
import { ProductSpecifications } from "../components/product/ProductSpecifications";
import { ProductStory } from "../components/product/ProductStory";
import { ProductReviews } from "../components/product/ProductReviews";
import { RelatedProducts } from "../components/product/RelatedProducts";

const ProductDetails = () => {
  const { id }: { id?: string } = useParams<{ id?: string }>();
  const { formatPrice } = useCurrency();
  const [selectedFinish, setSelectedFinish] = useState("Polish");
  const [selectedThickness, setSelectedThickness] = useState("20mm");
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({ averageRating: 0, totalReviews: 0, ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } });
  const [reviewsLoading, setReviewsLoading] = useState(true);

  const { state: cartState } = useCart();
  const relatedRef = useRef<HTMLDivElement | null>(null);
  const reviewsRef = useRef<HTMLDivElement>(null);

  // Fetch product from database
  const { product: dbProduct, relatedProducts: dbRelatedProducts, loading, error, refetch } = useProduct(id);

  // Build product object from database data - MUST be before early returns
  const product = useMemo(() => {
    if (!dbProduct) {
      return null;
    }
    const baseImages = dbProduct.images && dbProduct.images.length > 0
      ? dbProduct.images
      : dbProduct.image
        ? [dbProduct.image]
        : ["/demo2.webp"];

    const category = dbProduct.category || "slabs";
    const subcategory = dbProduct.subcategory || "marble";

    // Related products from API
    const relatedPick = dbRelatedProducts.slice(0, 10).map((p) => ({
      id: p._id,
      name: p.name,
      image: p.image || p.images?.[0] || "/demo2.webp",
    }));

    // Build specs section
    let specs: Record<string, string> = {};

    if (category === "furniture" && dbProduct.furnitureSpecs) {
      // Use furniture specifications from database
      specs = Object.entries(dbProduct.furnitureSpecs)
        .filter(([key, value]) => value && key !== 'etsyUrl') // Exclude empty values and etsyUrl
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
    } else if (category === "slabs" && dbProduct.slabSpecs) {
      // Use slab specifications from database
      specs = {
        finish: dbProduct.slabSpecs.finish || selectedFinish,
        thickness: dbProduct.slabSpecs.thickness || selectedThickness,
        origin: dbProduct.slabSpecs.origin || "India",
        material: dbProduct.slabSpecs.material || subcategory.replace(/-/g, " "),
        application: dbProduct.slabSpecs.application || "Indoor / Outdoor",
      };
    } else {
      // Default specs for slabs without specifications
      specs = {
        finish: selectedFinish,
        thickness: selectedThickness,
        origin: "India",
        material: subcategory.replace(/-/g, " "),
        application: "Indoor / Outdoor",
      };
    }

    // Pricing logic
    let displayPrice = "Price on Request";
    const isAvailable = dbProduct.available !== false;

    // Discount calculation (do this first)
    const hasDiscount = dbProduct.discount?.enabled &&
      dbProduct.discount?.percentage > 0 &&
      (!dbProduct.discount?.startDate || new Date(dbProduct.discount.startDate) <= new Date()) &&
      (!dbProduct.discount?.endDate || new Date(dbProduct.discount.endDate) >= new Date());

    const discountPercentage = hasDiscount ? dbProduct.discount!.percentage : 0;
    const originalPrice = dbProduct.priceINR || 0;
    const discountedPrice = hasDiscount && originalPrice > 0
      ? originalPrice * (1 - discountPercentage / 100)
      : originalPrice;

    if (!isAvailable) {
      displayPrice = "Currently Unavailable";
    } else if (dbProduct.priceINR) {
      // Use discounted price if discount is active
      displayPrice = formatPrice(hasDiscount ? discountedPrice : dbProduct.priceINR);
    }

    const moq = category === "slabs" ? "MOQ: 20 m²" : "";

    return {
      id: dbProduct._id,
      name: dbProduct.name,
      category,
      subcategory,
      image: baseImages[0],
      images: baseImages,
      price: displayPrice,
      priceINR: dbProduct.priceINR,
      moq,
      specs,
      description: dbProduct.description || "Premium natural stone slab ideal for countertops, vanities, flooring and wall cladding with strict quality selection.",
      relatedProducts: relatedPick,
      available: isAvailable,
      averageRating: dbProduct.averageRating,
      totalReviews: dbProduct.totalReviews,
      discount: dbProduct.discount,
      hasDiscount,
      discountPercentage,
      originalPrice,
      discountedPrice,
    };
  }, [dbProduct, dbRelatedProducts, selectedFinish, selectedThickness, formatPrice]);

  // Generate comprehensive SEO metadata using the hook
  const seoMeta = useProductSEO(product);



  // Check if product is in cart
  const isInCart = product ? cartState.items.some((item) => item.id === product.id) : false;

  // Scroll to top immediately when navigating to product (before paint)
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Fetch reviews and stats
  useEffect(() => {
    const fetchReviews = async () => {
      if (!id) return;

      setReviewsLoading(true);
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
        const [reviewsRes, statsRes] = await Promise.all([
          fetch(`${API_URL}/reviews/product/${id}`),
          fetch(`${API_URL}/reviews/product/${id}/stats`)
        ]);

        if (reviewsRes.ok) {
          const reviewsData = await reviewsRes.json();
          setReviews(reviewsData.reviews);
        }

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setReviewStats(statsData.stats);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchReviews();
  }, [id]);

  const handleReviewSubmitted = () => {
    // Refetch reviews after submission
    if (id) {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      Promise.all([
        fetch(`${API_URL}/reviews/product/${id}`).then(r => r.json()),
        fetch(`${API_URL}/reviews/product/${id}/stats`).then(r => r.json())
      ]).then(([reviewsData, statsData]) => {
        setReviews(reviewsData.reviews);
        setReviewStats(statsData.stats);
      }).catch(console.error);
    }
  };

  // Browser Share API
  const handleShare = async () => {
    if (!product) return;
    const shareData = {
      title: product.name,
      text: `Check out this ${product.name} from HS Global Export`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  // Show loading state with skeleton
  if (loading) {
    return <ProductDetailsSkeleton />;
  }

  // Show error state with skeleton-like design and retry option
  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 pt-24 md:pt-32 pb-8 md:pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Image placeholder */}
            <div className="lg:sticky lg:top-4 h-fit">
              <div className="aspect-square bg-gray-100 rounded-2xl flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="w-10 h-10 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-sm">Image unavailable</p>
                </div>
              </div>
            </div>

            {/* Error content */}
            <div className="flex flex-col items-start">
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 w-full mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <Info className="w-5 h-5 text-red-500" />
                  {error?.includes('fetch') ? 'Connection Error' : 'Product Not Found'}
                </h2>
                <p className="text-gray-600 mb-4">
                  {error?.includes('fetch')
                    ? 'Unable to load product. Please check your internet connection and try again.'
                    : 'The product you are looking for does not exist or has been removed.'}
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => refetch()}
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Try Again
                  </button>
                  <Link
                    to="/products"
                    className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Browse Products
                  </Link>
                </div>
              </div>

              {/* Placeholder specs */}
              <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-5 w-full">
                <div className="h-6 w-32 bg-gray-200 rounded mb-4" />
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                      <div className="h-4 w-20 bg-gray-200 rounded" />
                      <div className="h-4 w-24 bg-gray-200 rounded" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render UI
  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        {/* ========== COMPREHENSIVE SEO META TAGS ========== */}

        {/* Basic SEO */}
        <title>{seoMeta.title}</title>
        <meta name="description" content={seoMeta.metaDescription} />
        <meta name="keywords" content={seoMeta.metaKeywords} />
        <meta name="author" content="HS Global Export" />
        <meta name="robots" content={formatRobotsMeta(seoMeta.robotsIndex)} />

        {/* Canonical URL */}
        <link rel="canonical" href={seoMeta.canonicalUrl} />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content={seoMeta.ogType} />
        <meta property="og:url" content={seoMeta.ogUrl} />
        <meta property="og:site_name" content={seoMeta.ogSiteName} />
        <meta property="og:title" content={seoMeta.ogTitle} />
        <meta property="og:description" content={seoMeta.ogDescription} />
        <meta property="og:image" content={seoMeta.ogImage} />
        <meta property="og:image:width" content={seoMeta.ogImageWidth} />
        <meta property="og:image:height" content={seoMeta.ogImageHeight} />
        <meta property="og:image:alt" content={seoMeta.ogImageAlt} />
        <meta property="og:locale" content={seoMeta.ogLocale} />

        {/* Twitter Card */}
        <meta name="twitter:card" content={seoMeta.twitterCard} />
        <meta name="twitter:url" content={seoMeta.twitterUrl} />
        <meta name="twitter:title" content={seoMeta.twitterTitle} />
        <meta name="twitter:description" content={seoMeta.twitterDescription} />
        <meta name="twitter:image" content={seoMeta.twitterImage} />
        <meta name="twitter:image:alt" content={seoMeta.twitterImageAlt} />

        {/* Product Schema.org Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": product.name,
            "description": product.description,
            "image": product.images,
            "brand": {
              "@type": "Brand",
              "name": "HS Global Export"
            },
            "offers": {
              "@type": "Offer",
              "price": product.priceINR || 0,
              "priceCurrency": "INR",
              "availability": product.available ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
              "url": seoMeta.canonicalUrl
            },
            ...(reviewStats.totalReviews > 0 && {
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": reviewStats.averageRating,
                "reviewCount": reviewStats.totalReviews
              }
            })
          })}
        </script>
      </Helmet>


      {/* Main Content using new modular approach */}
      <main className="min-h-screen bg-white pb-20">
        {/* Breadcrumbs - Minimal */}
        <div className="container mx-auto px-6 py-4 md:py-6 mt-20 md:mt-24 border-b border-[#E8E3DC]">
          <nav className="flex items-center gap-2 text-sm text-[#6B6B6B]">
            <Link to="/" className="hover:text-[#2B2B2B] transition-colors">Home</Link>
            <span className="text-[#E8E3DC]">/</span>
            <Link to="/products" className="hover:text-[#2B2B2B] transition-colors capitalize">{product.category}</Link>
            <span className="text-[#E8E3DC]">/</span>
            <span className="text-[#2B2B2B] font-medium truncate max-w-[200px] md:max-w-none">{product.name}</span>
          </nav>
        </div>

        {/* Hero: 60/40 split */}
        <section className="container mx-auto px-6 py-12 lg:py-20 mb-10">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-20">
            <div className="lg:col-span-7">
              <ProductGallery product={product} />
            </div>
            <div className="lg:col-span-5 lg:sticky lg:top-32 h-fit">
              <ProductInfo
                product={product}
                reviewStats={reviewStats}
                isInCart={isInCart}
                selectedFinish={selectedFinish}
                setSelectedFinish={setSelectedFinish}
                selectedThickness={selectedThickness}
                setSelectedThickness={setSelectedThickness}
                handleShare={handleShare}
                reviewsRef={reviewsRef}
              />
            </div>
          </div>
        </section>

        {/* Overview Container */}
        <section className="bg-[#FAF8F5] py-20 lg:py-32">
          <div className="container mx-auto px-6">
            <ProductOverview product={product} />
          </div>
        </section>

        {/* Specs & Story Split */}
        <section className="py-20 lg:py-32">
          <div className="container mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
              <ProductSpecifications
                product={product}
                selectedFinish={selectedFinish}
                selectedThickness={selectedThickness}
              />
              <ProductStory product={product} />
            </div>
          </div>
        </section>

        {/* Reviews */}
        <section className="bg-[#FAF8F5] py-20 lg:py-32">
          <div className="container mx-auto px-6">
            <ProductReviews
              product={product}
              reviewStats={reviewStats}
              reviews={reviews}
              reviewsLoading={reviewsLoading}
              onReviewSubmitted={handleReviewSubmitted}
              reviewsRef={reviewsRef}
            />
          </div>
        </section>

        {/* Related Products */}
        {product.relatedProducts && product.relatedProducts.length > 0 && (
          <section className="py-20 lg:py-32">
            <div className="container mx-auto px-6">
              <RelatedProducts
                relatedProducts={product.relatedProducts}
                scrollRelated={() => { }} // We need to update RelatedProducts as well to use a ref-based scroll, or re-add the function
                relatedRef={relatedRef}
              />
            </div>
          </section>
        )}

        {/* Contact Strip */}
        <section className="border-t border-[#E8E3DC]">
          <ContactUs />
        </section>
      </main>
    </div>
  );
};

export default ProductDetails;
