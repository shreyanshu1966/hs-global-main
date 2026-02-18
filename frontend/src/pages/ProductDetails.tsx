import { useEffect, useRef, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Share2, ChevronRight, Quote, ChevronLeft, ChevronRight as ChevronRightIcon, Star, Shield, Truck, RotateCcw, Award, Heart, ZoomIn, X, Package, Ruler, Palette, MessageCircle, CheckCircle, Info } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import { AddToCartButton } from "../components/AddToCartButton";
import { QuantityHandler } from "../components/QuantityHandler";
import { useCart } from "../contexts/CartContext";
import { useProduct, useTrackAddToCart } from "../hooks/useProducts";
import { useCurrency } from "../contexts/CurrencyContext";
import { ReviewForm } from "../components/ReviewForm";
import { ReviewList } from "../components/ReviewList";
import { ReviewStats } from "../components/ReviewStats";
import { useAuth } from "../contexts/AuthContext";
import { useProductSEO, formatRobotsMeta } from "../hooks/useProductSEO";

const ProductDetails = () => {
  const { id }: { id?: string } = useParams<{ id?: string }>();
  const { formatPrice } = useCurrency();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedFinish, setSelectedFinish] = useState("Polish");
  const [selectedThickness, setSelectedThickness] = useState("20mm");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({ averageRating: 0, totalReviews: 0, ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } });
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('description');
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const { state: cartState } = useCart();
  const { user } = useAuth();
  const mainImageRef = useRef<HTMLDivElement>(null);
  const relatedRef = useRef<HTMLDivElement | null>(null);
  const reviewsRef = useRef<HTMLDivElement>(null);

  // Fetch product from database
  const { product: dbProduct, relatedProducts: dbRelatedProducts, loading, error } = useProduct(id);

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
        .filter(([_, value]) => value) // Only include non-empty values
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

  // Breadcrumb - simplified without catalog dependencies
  const breadcrumbPath = useMemo(() => {
    if (!product) return { top: null, chain: [] as { id: string; name: string }[] };
    return {
      top: product.category ? { id: product.category, name: product.category } : null,
      chain: [] as { id: string; name: string }[]
    };
  }, [product]);

  // Check if product is in cart
  const isInCart = product ? cartState.items.some((item) => item.id === product.id) : false;

  // GSAP animation for image changes
  useGSAP(() => {
    if (mainImageRef.current && product) {
      gsap.fromTo(mainImageRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5 });
    }
  }, [selectedImage, product]);

  // Auto image rotation
  useEffect(() => {
    if (!product) return;
    const t = setInterval(() => {
      setSelectedImage((prev) => (prev + 1) % product.images.length);
    }, 3500);

    return () => clearInterval(t);
  }, [product]);

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

  const slideWidth = 250;
  const gap = 20;

  const scrollToSlide = (index: number) => {
    const el = relatedRef.current;
    if (!el) return;
    el.scrollTo({ left: index * (slideWidth + gap), behavior: "smooth" });
    setCurrentSlide(index);
  };

  const scrollRelated = (dir: "left" | "right") => {
    if (!product) return;
    const maxSlides = product.relatedProducts.length;
    if (!maxSlides) return;

    setIsAutoPlaying(false);

    const newIndex =
      dir === "right"
        ? (currentSlide + 1) % maxSlides
        : (currentSlide - 1 + maxSlides) % maxSlides;

    scrollToSlide(newIndex);

    setTimeout(() => setIsAutoPlaying(true), 3000);
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
      } catch { }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  useEffect(() => {
    if (!isAutoPlaying || !product || !product.relatedProducts.length) return;

    const t = setInterval(() => {
      const maxSlides = product.relatedProducts.length;
      scrollToSlide((currentSlide + 1) % maxSlides);
    }, 2000);

    return () => clearInterval(t);
  }, [currentSlide, isAutoPlaying, product]);

  // Sticky CTA bar on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 600;
      setShowStickyBar(scrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The product you are looking for does not exist.'}</p>
          <Link to="/products" className="text-blue-600 hover:text-blue-700 font-medium">
            ← Back to Products
          </Link>
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


      {/* Main Content */}
      <div className="container mx-auto px-4 pt-24 md:pt-32 pb-8 md:pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Enhanced Image Gallery */}
          <div className="lg:sticky lg:top-4 h-fit">
            <div className="relative group">
              <div
                ref={mainImageRef}
                key={selectedImage}
                className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-2xl overflow-hidden mb-4 relative"
                style={{ opacity: 0 }}
              >
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Image Overlay Actions */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300">
                  <button
                    onClick={() => setIsImageZoomed(true)}
                    className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110"
                    aria-label="Zoom image"
                  >
                    <ZoomIn className="w-5 h-5 text-gray-700" />
                  </button>

                  <button
                    onClick={() => setIsFavorite(!isFavorite)}
                    className={`absolute top-4 left-4 backdrop-blur-sm p-2.5 rounded-full shadow-lg transition-all duration-300 hover:scale-110 ${isFavorite ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-700 hover:bg-white'
                      }`}
                    aria-label="Add to favorites"
                  >
                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* Discount Badge */}
                {product.hasDiscount && (
                  <div className="absolute bottom-4 right-4">
                    <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-full shadow-lg font-bold text-sm flex items-center gap-1.5">
                      <Award className="w-4 h-4" />
                      SAVE {product.discountPercentage}%
                    </div>
                  </div>
                )}
              </div>

              {/* Enhanced Thumbnail Gallery */}
              {product.images.length > 1 && (
                <div className="grid grid-cols-5 md:grid-cols-6 gap-2 md:gap-3">
                  {product.images.slice(0, 6).map((img, idx) => (
                    <button
                      key={img}
                      onClick={() => setSelectedImage(idx)}
                      className={`aspect-square bg-white rounded-lg md:rounded-xl overflow-hidden border-2 transition-all duration-300 hover:shadow-lg ${selectedImage === idx
                        ? "border-blue-600 ring-2 ring-blue-600/30 shadow-md scale-95"
                        : "border-gray-200 hover:border-blue-300"
                        }`}
                    >
                      <img
                        src={img}
                        alt={`${product.name} ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Product Info - Redesigned */}
          <div className="flex flex-col">
            {/* Availability Badge */}
            {product.available ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium mb-3 w-fit">
                <CheckCircle className="w-4 h-4" />
                In Stock
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm font-medium mb-3 w-fit">
                <Info className="w-4 h-4" />
                Out of Stock
              </span>
            )}

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              {seoMeta.h1Tag}
            </h1>

            {/* Rating & Reviews */}
            {reviewStats.totalReviews > 0 ? (
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${star <= Math.round(reviewStats.averageRating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                        }`}
                    />
                  ))}
                </div>
                <span className="text-lg font-semibold text-gray-900">
                  {reviewStats.averageRating.toFixed(1)}
                </span>
                <button
                  onClick={() => reviewsRef.current?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium"
                >
                  ({reviewStats.totalReviews} {reviewStats.totalReviews === 1 ? 'review' : 'reviews'})
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-4 h-4 text-gray-300" />
                ))}
                <span className="text-sm text-gray-500 ml-1">Be the first to review</span>
              </div>
            )}

            {/* Price Section - Enhanced */}
            <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 border-2 border-gray-200 rounded-2xl p-6 mb-6 shadow-sm">
              {product.priceINR ? (
                <div>
                  {product.hasDiscount ? (
                    <div className="space-y-3">
                      <div className="flex items-end gap-3 flex-wrap">
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Special Price</p>
                          <span className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
                            {formatPrice(product.discountedPrice)}
                          </span>
                        </div>
                        <span className="text-2xl text-gray-400 line-through mb-2">
                          {formatPrice(product.originalPrice)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm font-bold">
                          {product.discountPercentage}% OFF
                        </div>
                        <p className="text-lg text-green-600 font-bold">
                          Save {formatPrice(product.originalPrice - product.discountedPrice)}
                        </p>
                      </div>
                      {product.discount?.description && (
                        <p className="text-sm text-gray-600 italic bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
                          🎁 {product.discount.description}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Price</p>
                      <span className="text-4xl md:text-5xl font-black text-blue-600">
                        {formatPrice(product.priceINR)}
                      </span>
                    </div>
                  )}
                  {product.moq && product.available && (
                    <div className="mt-4 flex items-center gap-2 text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-lg w-fit">
                      <Package className="w-4 h-4" />
                      {product.moq}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <span className="text-3xl font-bold text-gray-900">
                    {product.category === "slabs" ? "Custom Quote Required" : product.price}
                  </span>
                  {!product.available && (
                    <span className="block mt-2 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium w-fit mx-auto">
                      Currently Unavailable
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                <Palette className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                <p className="text-xs font-medium text-gray-700">Custom Finish</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                <Ruler className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                <p className="text-xs font-medium text-gray-700">Any Size</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                <Award className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                <p className="text-xs font-medium text-gray-700">Premium</p>
              </div>
            </div>

            <p className="text-gray-600 text-base leading-relaxed mb-6 bg-gray-50 p-4 rounded-xl border border-gray-200">
              {product.description}
            </p>

            {/* Specifications */}
            <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-5 md:p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-600" />
                Specifications
              </h3>
              <div className="space-y-3">
                {product.category === "slabs" ? (
                  <>
                    {/* Finish selector */}
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <span className="font-semibold text-gray-700 flex items-center gap-2">
                        <Palette className="w-4 h-4 text-blue-600" />
                        Finish:
                      </span>
                      <select
                        value={selectedFinish}
                        onChange={(e) => setSelectedFinish(e.target.value)}
                        className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white font-medium text-gray-900 transition-all hover:border-blue-400"
                      >
                        {[
                          "Polish",
                          "Flaming",
                          "Sand Blast",
                          "Shot Blast",
                          "Bush Hammer",
                          "River Wash",
                          "Honed",
                          "Leather",
                          "Lepatora",
                        ].map((f) => (
                          <option key={f} value={f}>
                            {f}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Thickness selector */}
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <span className="font-semibold text-gray-700 flex items-center gap-2">
                        <Ruler className="w-4 h-4 text-blue-600" />
                        Thickness:
                      </span>
                      <select
                        value={selectedThickness}
                        onChange={(e) => setSelectedThickness(e.target.value)}
                        className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white font-medium text-gray-900 transition-all hover:border-blue-400"
                      >
                        {["12mm", "15mm", "18mm", "20mm", "25mm", "30mm"].map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Other specs */}
                    {Object.entries(product.specs)
                      .filter(([key]) => key !== "finish" && key !== "thickness")
                      .map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                          <span className="font-semibold text-gray-700 capitalize">{key}:</span>
                          <span className="text-gray-900 font-medium">{value}</span>
                        </div>
                      ))}
                  </>
                ) : (
                  // Furniture specs
                  Object.entries(product.specs).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                      <span className="font-semibold text-gray-700 capitalize">{key}:</span>
                      <span className="text-gray-900 font-medium">{value}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* CTA Buttons - Enhanced */}
            <div className="space-y-3 sticky bottom-0 lg:static bg-white lg:bg-transparent py-4 lg:py-0 -mx-4 px-4 lg:mx-0 lg:px-0 border-t lg:border-t-0 border-gray-200">
              {product.available ? (
                product.category === "slabs" ? (
                  <AddToCartButton
                    product={product}
                    preselectedCustomization={{
                      finish: selectedFinish,
                      thickness: selectedThickness,
                    }}
                    className="w-full h-14 inline-flex items-center justify-center gap-2 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300 font-bold text-lg group"
                  />
                ) : isInCart ? (
                  <QuantityHandler product={product} />
                ) : (
                  <AddToCartButton
                    product={product}
                    className="w-full h-14 inline-flex items-center justify-center gap-2 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300 font-bold text-lg group"
                  />
                )
              ) : (
                <a
                  href={`https://wa.me/918107115116?text=${encodeURIComponent(
                    "Inquiry about " + product.name + " availability"
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full h-14 inline-flex items-center justify-center gap-2 px-6 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 shadow-lg hover:shadow-xl transition-all duration-300 font-bold text-lg"
                >
                  <MessageCircle className="w-5 h-5" />
                  Contact for Availability
                </a>
              )}

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleShare}
                  className="h-12 inline-flex items-center justify-center gap-2 px-4 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all duration-300 font-semibold border-2 border-gray-200 hover:border-gray-300"
                >
                  <Share2 className="w-5 h-5" />
                  Share
                </button>

                <a
                  href={`https://wa.me/918107115116?text=${encodeURIComponent(
                    "Inquiry about " + product.name
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="h-12 inline-flex items-center justify-center gap-2 px-4 rounded-xl bg-green-600 text-white hover:bg-green-700 transition-all duration-300 font-semibold shadow-md hover:shadow-lg"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="h-5 w-5 fill-white"
                  >
                    <path d="M20.52 3.48A11.94 11.94 0 0 0 12.06 0C5.46.03.1 5.38.12 11.98c0 2.1.55 4.1 1.52 5.86L0 24l6.3-1.6a12.02 12.02 0 0 0 5.76 1.46h.03c6.6 0 11.97-5.36 12-11.96a11.94 11.94 0 0 0-3.57-8.42zM12.09 21.3h-.02a9.9 9.9 0 0 1-5.04-1.38l-.36-.2-3.74.95.99-3.64-.24-.38a9.36 9.36 0 0 1-1.45-4.96c-.02-5.16 4.18-9.38 9.34-9.4 2.5 0 4.86.98 6.64 2.77a9.32 9.32 0 0 1 2.75 6.65c-.02 5.16-4.22 9.39-9.37 9.39zm5.35-7.26c-.29-.15-1.72-.84-1.99-.94-.27-.1-.46-.15-.66.15-.2.29-.76.94-.92 1.12-.17.19-.34.22-.62.08-.29-.15-1.2-.44-2.28-1.41-1.68-1.5-1.92-2.33-2.14-2.62-.23-.29-.02-.45.13-.6.13-.13.3-.33.45-.5.15-.17.2-.29.3-.49.1-.2.05-.37-.02-.52-.07-.15-.66-1.55-.9-2.12-.24-.57-.48-.49-.66-.49-.17 0-.37-.02-.57-.02-.2 0-.52.08-.8.37-.27.29-1.03 1.01-1.03 2.47 0 1.45 1.06 2.86 1.21 3.06.15.2 2.08 3.16 5.04 4.43.71.31 1.26.48 1.69.62.71.22 1.34.2 1.85.12.57-.09 1.73-.7 1.98-1.39.25-.69.25-1.27.17-1.39-.07-.12-.27-.19-.55-.33z" />
                  </svg>
                  WhatsApp
                </a>
              </div>

              <Link
                to="/quotation"
                className="w-full h-12 flex items-center justify-center gap-2 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 transition-all duration-300 font-bold shadow-md hover:shadow-lg"
              >
                <Quote className="w-5 h-5" />
                Request Custom Quote
              </Link>
            </div>
          </div>
        </div>
      </div>
      {/* Description & Details Section - Tabbed Interface */}
      <div className="bg-gradient-to-b from-gray-50 to-white py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Tab Navigation */}
            <div className="flex items-center gap-2 border-b-2 border-gray-200 mb-8 overflow-x-auto">
              <button
                onClick={() => setActiveTab('description')}
                className={`px-6 py-3 font-semibold transition-all whitespace-nowrap ${activeTab === 'description'
                  ? 'text-blue-600 border-b-4 border-blue-600 -mb-0.5'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab('features')}
                className={`px-6 py-3 font-semibold transition-all whitespace-nowrap ${activeTab === 'features'
                  ? 'text-blue-600 border-b-4 border-blue-600 -mb-0.5'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                Features
              </button>
              <button
                onClick={() => setActiveTab('care')}
                className={`px-6 py-3 font-semibold transition-all whitespace-nowrap ${activeTab === 'care'
                  ? 'text-blue-600 border-b-4 border-blue-600 -mb-0.5'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                Care & Maintenance
              </button>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-10 border border-gray-200">
              {activeTab === 'description' && (
                <div className="space-y-6 animate-fadeIn">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <Info className="w-7 h-7 text-blue-600" />
                    About {product.name}
                  </h2>
                  <div className="space-y-4 text-gray-700 text-base md:text-lg leading-relaxed">
                    <p className="bg-blue-50 border-l-4 border-blue-600 pl-6 py-4 rounded-r-lg">
                      {product.category === "furniture"
                        ? "This handcrafted furniture piece combines natural stone elegance with functional design. Each piece is meticulously crafted to order, ensuring unique character and premium quality."
                        : "This stone offers a smooth, polished surface with subtle veining that elevates both contemporary and classic interiors. Its durability and low maintenance make it suitable for kitchens, bathrooms, living areas and commercial lobbies."}
                    </p>
                    <p>
                      {product.category === "furniture"
                        ? "Custom dimensions and finishes available. We work closely with designers and homeowners to create bespoke pieces that perfectly complement your space."
                        : "For best results, seal annually and clean with pH-neutral stone cleaners. Avoid harsh acids. We provide guidance on slab selection, edge profiles, and installation practices tailored to your project."}
                    </p>
                  </div>
                  <div className="mt-8 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 p-6 md:p-8">
                    <div className="flex items-start gap-4">
                      <Quote className="w-8 h-8 text-amber-600 flex-shrink-0 mt-1" />
                      <p className="text-gray-800 text-base md:text-lg leading-relaxed italic font-medium">
                        {product.category === "furniture"
                          ? "Each furniture piece is a unique work of art, combining traditional craftsmanship with modern design sensibilities. Request custom specifications to match your vision."
                          : "Crafted by nature over millennia, this stone delivers timeless elegance to modern spaces. Request a live video of current slabs to choose your exact piece."}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'features' && (
                <div className="space-y-6 animate-fadeIn">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <CheckCircle className="w-7 h-7 text-green-600" />
                    Key Features
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Premium Quality</h3>
                        <p className="text-sm text-gray-600">Handpicked materials ensuring exceptional quality</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Customizable</h3>
                        <p className="text-sm text-gray-600">Available in multiple finishes and sizes</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-xl border border-purple-200">
                      <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Durable</h3>
                        <p className="text-sm text-gray-600">Long-lasting and resistant to wear</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
                      <CheckCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Expert Craftsmanship</h3>
                        <p className="text-sm text-gray-600">Carefully crafted by skilled artisans</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'care' && (
                <div className="space-y-6 animate-fadeIn">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <Shield className="w-7 h-7 text-blue-600" />
                    Care & Maintenance
                  </h2>
                  <div className="space-y-4">
                    <div className="bg-blue-50 border-l-4 border-blue-600 p-5 rounded-r-lg">
                      <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                        <Info className="w-5 h-5 text-blue-600" />
                        Daily Cleaning
                      </h3>
                      <p className="text-gray-700">Clean with a soft, damp cloth and mild soap. Avoid abrasive cleaners that can damage the surface.</p>
                    </div>
                    <div className="bg-amber-50 border-l-4 border-amber-600 p-5 rounded-r-lg">
                      <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                        <Award className="w-5 h-5 text-amber-600" />
                        Protection
                      </h3>
                      <p className="text-gray-700">Use coasters and placemats to prevent stains. Seal stone surfaces annually for best results.</p>
                    </div>
                    <div className="bg-purple-50 border-l-4 border-purple-600 p-5 rounded-r-lg">
                      <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-purple-600" />
                        Long-term Care
                      </h3>
                      <p className="text-gray-700">Avoid prolonged exposure to direct sunlight. Professional maintenance recommended every 2-3 years.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section - Enhanced */}
      <div ref={reviewsRef} className="bg-gradient-to-b from-white to-gray-50 py-12 md:py-16 border-t-2 border-gray-200">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 flex items-center justify-center gap-3">
                <MessageCircle className="w-8 h-8 text-blue-600" />
                Customer Reviews
              </h2>
              {reviewStats.totalReviews > 0 && (
                <div className="inline-flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-md border border-gray-200">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${star <= Math.round(reviewStats.averageRating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                          }`}
                      />
                    ))}
                  </div>
                  <span className="text-xl font-bold text-gray-900">
                    {reviewStats.averageRating.toFixed(1)}
                  </span>
                  <span className="text-gray-400">|</span>
                  <span className="text-gray-600 font-medium">{reviewStats.totalReviews} {reviewStats.totalReviews === 1 ? 'review' : 'reviews'}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Review Stats */}
              <div className="lg:col-span-1">
                <ReviewStats stats={reviewStats} loading={reviewsLoading} />
              </div>

              {/* Review List and Form */}
              <div className="lg:col-span-2 space-y-8">
                <ReviewList reviews={reviews} loading={reviewsLoading} />

                {user ? (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Write a Review</h3>
                    <ReviewForm productId={product.id} onReviewSubmitted={handleReviewSubmitted} />
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                    <p className="text-gray-600 mb-4">Please sign in to write a review</p>
                    <Link
                      to="/login"
                      className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Sign In
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products - Enhanced */}
      {product.relatedProducts.length > 0 && (
        <div className="bg-gradient-to-b from-gray-50 to-white py-12 md:py-16 border-t border-gray-200">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center gap-3">
                  <Package className="w-8 h-8 text-blue-600" />
                  You May Also Like
                </h2>
                <p className="text-gray-600 mt-2">Explore our handpicked collection</p>
              </div>

              <div className="hidden md:flex gap-2">
                <button
                  onClick={() => scrollRelated("left")}
                  className="h-12 w-12 rounded-xl bg-white shadow-md hover:shadow-xl flex items-center justify-center transition-all border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 group"
                  aria-label="Previous products"
                >
                  <ChevronLeft className="w-6 h-6 text-gray-700 group-hover:text-blue-600" />
                </button>
                <button
                  onClick={() => scrollRelated("right")}
                  className="h-12 w-12 rounded-xl bg-white shadow-md hover:shadow-xl flex items-center justify-center transition-all border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 group"
                  aria-label="Next products"
                >
                  <ChevronRightIcon className="w-6 h-6 text-gray-700 group-hover:text-blue-600" />
                </button>
              </div>
            </div>

            <div className="relative">
              <div
                ref={relatedRef}
                className="flex gap-6 overflow-x-auto pb-4 no-scrollbar scroll-smooth"
                style={{ scrollSnapType: "x mandatory" }}
              >
                {product.relatedProducts.map((p) => (
                  <Link
                    key={p.id}
                    to={`/products/${p.id}`}
                    className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden transition-all duration-500 shrink-0 border-2 border-gray-100 hover:border-blue-300 transform hover:-translate-y-1"
                    style={{
                      width: `${slideWidth}px`,
                      scrollSnapAlign: "start",
                    }}
                  >
                    <div className="aspect-square overflow-hidden relative">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                        <ChevronRight className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="p-5">
                      <h4 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-3">
                        {p.name}
                      </h4>
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 group-hover:bg-blue-600 text-blue-600 group-hover:text-white rounded-lg text-sm font-semibold transition-all duration-300">
                        <span>View Details</span>
                        <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Zoom Modal */}
      {isImageZoomed && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setIsImageZoomed(false)}
        >
          <button
            onClick={() => setIsImageZoomed(false)}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all duration-300"
            aria-label="Close zoom"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <img
            src={product.images[selectedImage]}
            alt={product.name}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm">
            Image {selectedImage + 1} of {product.images.length}
          </div>
        </div>
      )}

      {/* Sticky Bottom CTA Bar - Mobile */}
      {showStickyBar && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t-2 border-gray-200 shadow-2xl p-4 animate-slideUp">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-14 h-14 object-cover rounded-lg border-2 border-gray-200"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-900 truncate text-sm">{product.name}</p>
              {product.hasDiscount ? (
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-green-600">
                    {formatPrice(product.discountedPrice)}
                  </span>
                  <span className="text-xs text-gray-500 line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                </div>
              ) : (
                <span className="text-lg font-bold text-blue-600">
                  {product.priceINR ? formatPrice(product.priceINR) : 'Custom Quote'}
                </span>
              )}
            </div>
            {product.available && (
              <AddToCartButton
                product={product}
                className="flex-shrink-0 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg font-bold text-sm whitespace-nowrap"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
