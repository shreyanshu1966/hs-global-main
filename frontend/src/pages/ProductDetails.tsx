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
import { SimilarProducts } from "../components/product/SimilarProducts";

const ProductDetails = () => {
  const { id }: { id?: string } = useParams<{ id?: string }>();
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({ averageRating: 0, totalReviews: 0, ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } });
  const [reviewsLoading, setReviewsLoading] = useState(true);

  const { state: cartState } = useCart();
  const relatedRef = useRef<HTMLDivElement | null>(null);
  const reviewsRef = useRef<HTMLDivElement>(null);
  // Tall scroll-space wrapper — drives image transitions inside
  const heroWrapperRef = useRef<HTMLDivElement>(null);

  // Fetch product from database
  const { product: dbProduct, relatedProducts: dbRelatedProducts, similarProducts: dbSimilarProducts, loading, error, refetch } = useProduct(id);

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

    const category = dbProduct.category || "furniture";
    const subcategory = dbProduct.subcategory || "marble";

    // Related products from API (pass through normalized product shape)
    const relatedPick = dbRelatedProducts.slice(0, 10);
    const similarPick = dbSimilarProducts.slice(0, 20);

    // Build specs section
    let specs: Record<string, string> = {};

    if (category === "furniture" && dbProduct.furnitureSpecs) {
      specs = Object.entries(dbProduct.furnitureSpecs)
        .filter(([key, value]) => value && key !== 'etsyUrl')
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
    }

    const isAvailable = dbProduct.available !== false;

    const moq = "";

    return {
      id: dbProduct.productId || dbProduct._id,
      productId: dbProduct.productId,
      _id: dbProduct._id,
      name: dbProduct.name,
      category,
      subcategory,
      image: baseImages[0],
      images: baseImages,
      priceUSD: dbProduct.priceUSD,
      moq,
      specs,
      description: dbProduct.description || "Premium natural stone slab ideal for countertops, vanities, flooring and wall cladding with strict quality selection.",
      subDescription: dbProduct.subDescription || '',
      productCode: dbProduct.productCode || '',
      relatedProducts: relatedPick,
      similarProducts: similarPick,
      available: isAvailable,
      averageRating: dbProduct.averageRating,
      totalReviews: dbProduct.totalReviews,
      discount: dbProduct.discount,
      regionalPricing: dbProduct.regionalPricing,
    };
  }, [dbProduct, dbRelatedProducts, dbSimilarProducts]);

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
    <div className="min-h-screen bg-white">
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
              "price": product.priceUSD || 0,
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
        className="bg-white"
      >
        {/* Breadcrumbs moved to ProductInfo for cleaner layout */}

        {/* Similar Products — manually curated, shown at very top */}
        <SimilarProducts similarProducts={product.similarProducts} />

        {/*
          ── SCROLL-HIJACK HERO ──────────────────────────────────────────
          Outer wrapper is tall (images.length × 100vh) — creates scroll space.
          Inner pd-sticky section is position:sticky, height:100vh — pins to viewport.
          Window scroll progress through wrapper → drives image crossfade in gallery.
          After all images shown, the page scrolls normally to specs/reviews.
          ───────────────────────────────────────────────────────────────
        */}
        <div
          ref={heroWrapperRef}
          className="pd-hero-wrapper"
          style={{ height: `${Math.max(2, product.images.length) * 100}vh` }}
        >
          {/* Sticky panel — stays pinned while outer wrapper scrolls */}
          <div className="pd-sticky">

            {/* LEFT: gallery (images transition based on scroll) */}
            <div className="pd-gallery-col">
              <ProductGallery product={product} scrollWrapperRef={heroWrapperRef} />
            </div>

            {/* RIGHT: product info — completely frozen */}
            <div className="pd-info-col">
              <div className="pd-info-scroll">
                <ProductInfo
                  product={product}
                  reviewStats={reviewStats}
                  isInCart={isInCart}
                  handleShare={handleShare}
                  reviewsRef={reviewsRef}
                />
              </div>
            </div>

          </div>{/* /pd-sticky */}
        </div>{/* /pd-hero-wrapper */}

        {/* Layout styles */}
        <style>{`
          /*
           * OUTER WRAPPER: tall div creates scroll space.
           * Its height = images.length * 100vh so there's room to
           * scroll through all images before the page continues.
           */
          .pd-hero-wrapper {
            position: relative;
          }

          /*
           * STICKY INNER: pins to top of viewport (below header).
           * Both columns live here.
           */
          .pd-sticky {
            position: sticky;
            top: var(--itsbits-header-offset, 134px);
            height: calc(100vh - var(--itsbits-header-offset, 134px));
            max-height: 820px;
            display: flex;
            flex-direction: row;
            background: #ffffff;
            z-index: 1;
            overflow: hidden;
          }

          /* LEFT: gallery fills height, images crossfade inside */
          .pd-gallery-col {
            width: 58%;
            flex-shrink: 0;
            height: 100%;
            overflow: hidden;
            border-right: 1px solid #f3f4f6;
            padding: 28px 28px 28px 32px;
            box-sizing: border-box;
          }

          /* RIGHT: frozen info — no scroll */
          .pd-info-col {
            flex: 1;
            height: 100%;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            background: #ffffff;
          }

          /* Thin scrollable inner so info doesn't get clipped on short screens */
          .pd-info-scroll {
            flex: 1;
            overflow-y: auto;
            overflow-x: hidden;
            padding: 32px 32px 32px 28px;
            scrollbar-width: thin;
            scrollbar-color: #e2e8f0 transparent;
            box-sizing: border-box;
          }
          .pd-info-scroll::-webkit-scrollbar { width: 4px; }
          .pd-info-scroll::-webkit-scrollbar-track { background: transparent; }
          .pd-info-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 2px; }

          /* Mobile: disable scroll-hijack, normal stacked layout */
          @media (max-width: 1023px) {
            .pd-hero-wrapper { height: auto !important; }
            .pd-sticky {
              position: static;
              height: auto;
              flex-direction: column;
              overflow: visible;
            }
            .pd-gallery-col {
              width: 100%;
              height: auto;
              overflow: visible;
              border-right: none;
              border-bottom: 1px solid #e2e8f0;
              padding: 20px 16px;
            }
            .pd-info-col {
              height: auto;
              overflow: visible;
            }
            .pd-info-scroll {
              overflow: visible;
              padding: 24px 16px;
            }
          }
        `}</style>

        {/* Item Details */}
        <section className="bg-white py-14 lg:py-16 border-b border-[#e2e8f0]">
          <div className="container mx-auto px-6">
            <ProductSpecifications
              product={product}
            />
          </div>
        </section>

        {/* Trust / Delivery Info */}
        <section className="bg-[#fafafa] py-8 sm:py-10 border-b border-[#e2e8f0]">
          <div className="container mx-auto px-6 max-w-4xl">
            <div className="flex flex-row justify-center items-stretch gap-0">
              {/* Item 1 */}
              <div className="flex-1 flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4 text-center sm:text-left px-4 sm:px-8">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
                  <Package className="w-5 h-5 sm:w-6 sm:h-6 text-[#111]" strokeWidth={1.5} />
                </div>
                <div>
                  <h4 className="text-[13px] sm:text-[15px] font-semibold text-[#111] mb-1">100% Authentic Products</h4>
                  <p className="text-[11px] sm:text-[13px] text-[#666] leading-relaxed">Sourced directly from trusted manufacturers.</p>
                </div>
              </div>
              {/* Divider */}
              <div className="w-px bg-[#e2e8f0] self-stretch shrink-0"></div>
              {/* Item 2 */}
              <div className="flex-1 flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4 text-center sm:text-left px-4 sm:px-8">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
                  <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-[#111]" strokeWidth={1.5} />
                </div>
                <div>
                  <h4 className="text-[13px] sm:text-[15px] font-semibold text-[#111] mb-1">Global Shipping Available</h4>
                  <p className="text-[11px] sm:text-[13px] text-[#666] leading-relaxed">Contact us for precise delivery estimates to your region.</p>
                </div>
              </div>
            </div>
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
