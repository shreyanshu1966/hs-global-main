import { useEffect, useRef, useState, useLayoutEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Info, Package, ShieldCheck, BadgeCheck, Truck, Scale } from "lucide-react";
import { motion } from "framer-motion";
import ContactUs from "../components/ContactUs";
import { ProductDetailsSkeleton } from "../components/ProductDetailsSkeleton";
import { ProductGallery } from "../components/product/ProductGallery";
import { useCart } from "../contexts/CartContext";
import { useProduct } from "../hooks/useProducts";
import { useProductSEO, formatRobotsMeta } from "../hooks/useProductSEO";
import { ProductInfo } from "../components/product/ProductInfo";
import { ProductSpecifications } from "../components/product/ProductSpecifications";
import { ProductReviews } from "../components/product/ProductReviews";
import { RelatedProducts } from "../components/product/RelatedProducts";

const ProductDetails = () => {
  const { id }: { id?: string } = useParams<{ id?: string }>();
  const [selectedFinish, setSelectedFinish] = useState("Polish");
  const [selectedThickness, setSelectedThickness] = useState("20mm");
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({ averageRating: 0, totalReviews: 0, ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } });
  const [reviewsLoading, setReviewsLoading] = useState(true);

  const { state: cartState } = useCart();
  const relatedRef = useRef<HTMLDivElement | null>(null);
  const reviewsRef = useRef<HTMLDivElement>(null);
  const galleryColRef = useRef<HTMLDivElement>(null);   // wrapper — keeps layout placeholder
  const galleryInnerRef = useRef<HTMLDivElement>(null); // the actual gallery — gets fixed/absolute
  const trustStripRef = useRef<HTMLDivElement>(null);  // stop sentinel

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

    // Related products from API (pass through normalized product shape)
    const relatedPick = dbRelatedProducts.slice(0, 10);

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

    const isAvailable = dbProduct.available !== false;

    const moq = category === "slabs" ? "MOQ: 20 m²" : "";

    return {
      id: dbProduct.productId || dbProduct._id,
      productId: dbProduct.productId,
      name: dbProduct.name,
      category,
      subcategory,
      image: baseImages[0],
      images: baseImages,
      priceINR: dbProduct.priceINR,
      moq,
      specs,
      description: dbProduct.description || "Premium natural stone slab ideal for countertops, vanities, flooring and wall cladding with strict quality selection.",
      relatedProducts: relatedPick,
      available: isAvailable,
      averageRating: dbProduct.averageRating,
      totalReviews: dbProduct.totalReviews,
      discount: dbProduct.discount,
    };
  }, [dbProduct, dbRelatedProducts, selectedFinish, selectedThickness]);

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

  // ─────────────────────────────────────────────────────────────────────────

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

  const scrollRelated = (dir: 'left' | 'right') => {
    if (!relatedRef.current) return;
    const amount = 360;
    relatedRef.current.scrollBy({
      left: dir === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  // Show loading state with skeleton
  if (loading) {
    return <ProductDetailsSkeleton />;
  }

  // Show error state with skeleton-like design and retry option
  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 md:py-12">
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
    <div className="min-h-screen bg-[#f8fafc]">
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
      <motion.main
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="min-h-screen bg-[#f8fafc] pb-20"
      >
        {/* Breadcrumbs - Minimal */}
        <div className="container mx-auto px-6 mt-5 md:mt-0 py-5 md:py-7 border-b border-[#e2e8f0] bg-white">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[11px] uppercase tracking-[0.11em] text-[#64748b]">
            <Link to="/" className="hover:text-[#111827] transition-colors focus:ring-2 focus:ring-slate-400 rounded px-1">Home</Link>
            <span aria-hidden="true" className="text-[#cbd5e1]">/</span>
            <Link to="/products" className="hover:text-[#111827] transition-colors capitalize focus:ring-2 focus:ring-slate-400 rounded px-1">{product.category}</Link>
            <span aria-hidden="true" className="text-[#cbd5e1]">/</span>
            <span aria-current="page" className="text-[#111827] font-semibold truncate max-w-[200px] md:max-w-none px-1 tracking-[0.07em]">{product.name}</span>
          </nav>
        </div>

        {/* Hero + Trust Strip: unified sticky container */}
        <div className="container mx-auto px-6 py-10 lg:py-14">
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start relative">

            {/* LEFT: Gallery — Vertical scroller */}
            <div className="w-full lg:w-[58%] flex-shrink-0">
              <ProductGallery product={product} />
            </div>

            {/* RIGHT: Info + Trust Strip stacked — Pinned to top */}
            <div className="w-full lg:w-[42%] flex-shrink-0 lg:sticky lg:top-28 h-fit">
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

              {/* Trust Strip */}
              <div className="mt-10 border border-[#e2e8f0] bg-[#f1f5f9] rounded-xl px-6 py-7">
                <div className="grid grid-cols-2 gap-5">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-[#475569] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.1em] text-[#64748b]">Guarantee</p>
                      <p className="text-sm text-[#111827]">Authenticity Assured</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <BadgeCheck className="w-5 h-5 text-[#475569] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.1em] text-[#64748b]">Promise</p>
                      <p className="text-sm text-[#111827]">Vetted Seller Network</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Truck className="w-5 h-5 text-[#475569] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.1em] text-[#64748b]">Delivery</p>
                      <p className="text-sm text-[#111827]">Trusted Global Shipping</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Scale className="w-5 h-5 text-[#475569] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.1em] text-[#64748b]">Price Match</p>
                      <p className="text-sm text-[#111827]">Best Value Commitment</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Item Details */}
        <section className="bg-white py-14 lg:py-16 border-b border-[#e2e8f0]">
          <div className="container mx-auto px-6">
            <ProductSpecifications
              product={product}
              selectedFinish={selectedFinish}
              selectedThickness={selectedThickness}
            />
          </div>
        </section>

        {/* Related Products */}
        {product.relatedProducts && product.relatedProducts.length > 0 && (
          <section className="py-14 lg:py-16 bg-[#f8fafc] border-b border-[#e2e8f0]">
            <div className="container mx-auto px-6">
              <RelatedProducts
                relatedProducts={product.relatedProducts}
                scrollRelated={scrollRelated}
                relatedRef={relatedRef}
              />
            </div>
          </section>
        )}

        {/* Reviews */}
        <section className="bg-white py-14 lg:py-16 border-y border-[#e2e8f0]">
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

        {/* Contact Strip */}
        <section className="border-t border-[#e2e8f0] bg-[#f8fafc]">
          <ContactUs />
        </section>
      </motion.main>
    </div>
  );
};

export default ProductDetails;
