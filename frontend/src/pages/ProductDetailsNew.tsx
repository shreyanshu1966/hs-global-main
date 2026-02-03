import { useEffect, useRef, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Share2, ChevronRight, Quote, ChevronLeft, ChevronRight as ChevronRightIcon, Star } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import { AddToCartButton } from "../components/AddToCartButton";
import { QuantityHandler } from "../components/QuantityHandler";
import { ReviewStats } from "../components/ReviewStats";
import { ReviewList } from "../components/ReviewList";
import { ReviewForm } from "../components/ReviewForm";
import { useCart } from "../contexts/CartContext";
import { useProduct, useTrackAddToCart } from "../hooks/useProducts";
import { useCurrency } from "../contexts/CurrencyContext";

const ProductDetailsNew = () => {
  const { id }: { id?: string } = useParams<{ id?: string }>();
  const { formatPrice } = useCurrency();
  const trackAddToCart = useTrackAddToCart();

  const [selectedImage, setSelectedImage] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({ averageRating: 0, totalReviews: 0, ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } });
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const { state: cartState } = useCart();
  const { product, relatedProducts, loading, error } = useProduct(id);

  const mainImageRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (mainImageRef.current) {
      gsap.fromTo(mainImageRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5 });
    }
  }, [selectedImage]);

  // Track add to cart
  useEffect(() => {
    if (product && cartState.items.some(item => item.productId === product.productId)) {
      trackAddToCart(product.productId);
    }
  }, [cartState.items, product, trackAddToCart]);

  // Fetch reviews and stats
  useEffect(() => {
    const fetchReviews = async () => {
      if (!id) return;

      setReviewsLoading(true);
      try {
        const [reviewsRes, statsRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/reviews/product/${id}`),
          fetch(`${import.meta.env.VITE_API_URL}/reviews/product/${id}/stats`)
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
    setShowReviewForm(false);
    // Optionally refetch reviews
  };

  // Build rich product object
  const productData = useMemo(() => {
    if (!product) return null;

    const baseImages = product.images && product.images.length > 0
      ? product.images
      : product.image
        ? [product.image]
        : ["/demo2.webp"];

    const category = product.category || "slabs";
    const subcategory = product.subcategory || "marble";

    // Build specs section
    let specs: Record<string, string> = {};

    if (category === "furniture" && product.furnitureSpecs) {
      specs = {
        Product: product.furnitureSpecs.product || '',
        Type: product.furnitureSpecs.type || '',
        Shape: product.furnitureSpecs.shape || '',
        Material: product.furnitureSpecs.material || '',
        Size: product.furnitureSpecs.size || '',
        'Surface Finish': product.furnitureSpecs.surfaceFinish || '',
        Delivery: product.furnitureSpecs.delivery || '',
        Height: product.furnitureSpecs.height || '',
        'Color Name': product.furnitureSpecs.colorName || '',
        'Packaging Details': product.furnitureSpecs.packagingDetails || '',
        Location: product.furnitureSpecs.location || ''
      };
    } else {
      const slab = product.slabSpecs || {};
      specs = {
        finish: slab.finish || "Polished",
        thickness: slab.thickness || "18mm - 20mm",
        origin: slab.origin || "India",
        material: slab.material || subcategory.replace(/-/g, " "),
        application: slab.application || "Indoor / Outdoor",
      };
    }

    // Remove empty fields
    Object.keys(specs).forEach(key => {
        if (!specs[key]) delete specs[key];
    });

    // Pricing logic with discount
    let displayPrice = "Price on Request";
    let originalPrice = null;
    let discountPercentage = 0;
    let hasActiveDiscount = false;
    const isAvailable = product.available !== false;

    if (!isAvailable) {
      displayPrice = "Currently Unavailable";
    } else if (product.priceINR) {
      // Check if discount is active
      const now = new Date();
      const discount = product.discount;
      const isDiscountActive = discount?.enabled && 
        discount.percentage > 0 &&
        (!discount.startDate || new Date(discount.startDate) <= now) &&
        (!discount.endDate || new Date(discount.endDate) >= now);
      
      if (isDiscountActive) {
        hasActiveDiscount = true;
        discountPercentage = discount.percentage;
        originalPrice = product.priceINR;
        const discountAmount = Math.round((product.priceINR * discount.percentage) / 100);
        const finalPrice = product.priceINR - discountAmount;
        displayPrice = formatPrice(finalPrice);
      } else {
        displayPrice = formatPrice(product.priceINR);
      }
    }

    return {
      id: product.productId,
      name: product.name,
      category,
      subcategory,
      description: product.description,
      images: baseImages,
      specs,
      price: displayPrice,
      originalPrice,
      discountPercentage,
      hasActiveDiscount,
      discountDescription: product.discount?.description,
      priceINR: product.priceINR,
      available: isAvailable,
      hasVideo: product.hasVideo || false,
      etsyUrl: product.furnitureSpecs?.etsyUrl,
      averageRating: product.averageRating || 0,
      totalReviews: product.totalReviews || 0,
      seoTitle: product.seoTitle || `${product.name} - ${subcategory} | HS Global Export`,
      seoDescription: product.seoDescription || `Premium ${product.name} in ${subcategory}. High-quality ${category} products from HS Global Export.`
    };
  }, [product, formatPrice]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">
         <div className="container mx-auto px-4 py-8 animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
               {/* Image Skeleton */}
               <div className="aspect-square bg-gray-200 rounded-lg"></div>
               
               {/* Text Skeleton */}
               <div className="space-y-6">
                   <div className="h-10 bg-gray-200 rounded w-3/4"></div>
                   <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                   <div className="h-32 bg-gray-200 rounded"></div>
                   <div className="h-64 bg-gray-200 rounded border border-gray-100"></div>
                   <div className="flex gap-4">
                       <div className="h-12 bg-gray-200 rounded flex-1"></div>
                       <div className="h-12 bg-gray-200 rounded flex-1"></div>
                   </div>
               </div>
            </div>
         </div>
      </div>
    );
  }

  // Error state
  if (error || !productData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-8">The product you're looking for doesn't exist or has been moved.</p>
          <Link
            to="/products"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse All Products
          </Link>
        </div>
      </div>
    );
  }

  const isInCart = cartState.items.some((item) => item.productId === productData.id);

  return (
    <>
      <Helmet>
        <title>{productData.seoTitle}</title>
        <meta name="description" content={productData.seoDescription} />
        <meta name="keywords" content={`${productData.name}, ${productData.subcategory}, ${productData.category}, granite, marble, natural stone`} />
        
        {/* Open Graph */}
        <meta property="og:title" content={productData.seoTitle} />
        <meta property="og:description" content={productData.seoDescription} />
        <meta property="og:image" content={productData.images[0]} />
        <meta property="og:type" content="product" />
        
        {/* Product Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": productData.name,
            "description": productData.description,
            "image": productData.images,
            "brand": {
              "@type": "Brand",
              "name": "HS Global Export"
            },
            "offers": {
              "@type": "Offer",
              "price": productData.priceINR || 0,
              "priceCurrency": "INR",
              "availability": productData.available ? "InStock" : "OutOfStock"
            }
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex items-center space-x-2 text-sm text-gray-600">
              <Link to="/" className="hover:text-blue-600">Home</Link>
              <ChevronRight className="w-4 h-4" />
              <Link to="/products" className="hover:text-blue-600">Products</Link>
              <ChevronRight className="w-4 h-4" />
              <Link to={`/products?cat=${productData.category}`} className="hover:text-blue-600 capitalize">
                {productData.category}
              </Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-gray-900 font-medium">{productData.name}</span>
            </nav>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Image Gallery */}
            <div>
              <div ref={mainImageRef} className="aspect-square bg-white rounded-lg shadow-lg overflow-hidden mb-4">
                <img
                  src={productData.images[selectedImage]}
                  alt={productData.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Thumbnail Gallery */}
              {productData.images.length > 1 && (
                <div className="grid grid-cols-4 gap-4">
                  {productData.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square bg-white rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === index ? 'border-blue-600 ring-2 ring-blue-600/20' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${productData.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-3">{productData.name}</h1>
              
              {/* Rating Display */}
              {productData.totalReviews > 0 && (
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= Math.round(productData.averageRating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-lg font-medium text-gray-900">
                    {productData.averageRating.toFixed(1)}
                  </span>
                  <span className="text-gray-500">
                    ({productData.totalReviews} {productData.totalReviews === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
              )}
              
              <div className="mb-6">
                {productData.hasActiveDiscount ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex flex-col">
                        <span className="text-4xl font-bold text-green-600">{productData.price}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xl text-gray-500 line-through">{formatPrice(productData.originalPrice)}</span>
                          <span className="px-2.5 py-1 bg-red-500 text-white rounded-full text-sm font-semibold">
                            {productData.discountPercentage}% OFF
                          </span>
                        </div>
                      </div>
                      {!productData.available && (
                        <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                          Out of Stock
                        </span>
                      )}
                    </div>
                    {productData.discountDescription && (
                      <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
                        <p className="text-amber-900 text-sm font-medium flex items-center gap-2">
                          <span className="text-lg">🎉</span>
                          {productData.discountDescription}
                        </p>
                      </div>
                    )}
                    <p className="text-sm text-green-700 font-medium">
                      You save {formatPrice(productData.originalPrice - (productData.originalPrice * (100 - productData.discountPercentage) / 100))}
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-4xl font-bold text-blue-600">{productData.price}</span>
                    {!productData.available && (
                      <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                        Out of Stock
                      </span>
                    )}
                  </div>
                )}
              </div>

              <p className="text-gray-700 text-lg mb-8">{productData.description}</p>

              {/* Specifications */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(productData.specs).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
                      <span className="font-medium text-gray-700 capitalize">{key}:</span>
                      <span className="text-gray-900">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <QuantityHandler productId={productData.id} disabled={!productData.available} />
                  
                  <AddToCartButton
                    product={{
                      id: productData.id,
                      name: productData.name,
                      category: productData.category,
                      subcategory: productData.subcategory,
                      image: productData.images[0],
                      images: productData.images,
                      description: productData.description,
                      priceINR: productData.priceINR,
                      available: productData.available,
                      hasVideo: productData.hasVideo
                    }}
                    disabled={!productData.available}
                    className="flex-1"
                  />
                </div>

                {productData.etsyUrl && (
                  <a
                    href={productData.etsyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-orange-500 text-white py-3 px-6 rounded-lg text-center font-medium hover:bg-orange-600 transition-colors"
                  >
                    View on Etsy
                  </a>
                )}

                <button className="flex items-center justify-center w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors">
                  <Share2 className="w-5 h-5 mr-2" />
                  Share Product
                </button>

                <Link
                  to="/quotation"
                  className="flex items-center justify-center w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Quote className="w-5 h-5 mr-2" />
                  Request Quote
                </Link>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="mt-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Customer Reviews</h2>
                {reviewStats.totalReviews > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-5 h-5 ${
                            star <= Math.round(reviewStats.averageRating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-lg font-semibold text-gray-900">{reviewStats.averageRating.toFixed(1)}</span>
                    <span className="text-gray-600">({reviewStats.totalReviews} reviews)</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <ReviewStats stats={reviewStats} loading={reviewsLoading} />
                
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {reviewStats.totalReviews} Review{reviewStats.totalReviews !== 1 ? 's' : ''}
                  </h3>
                  <button
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {showReviewForm ? 'Cancel' : 'Write a Review'}
                  </button>
                </div>

                <ReviewList reviews={reviews} loading={reviewsLoading} />
              </div>

              <div className="lg:col-span-1">
                {showReviewForm && (
                  <div className="sticky top-24">
                    <ReviewForm productId={productData.id} onReviewSubmitted={handleReviewSubmitted} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Related Products</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((relatedProduct) => (
                  <Link
                    key={relatedProduct.productId}
                    to={`/products/${relatedProduct.productId}`}
                    className="group bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={relatedProduct.image}
                        alt={relatedProduct.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {relatedProduct.name}
                      </h3>
                      {relatedProduct.priceINR && (
                        <p className="text-blue-600 font-bold mt-2">{formatPrice(relatedProduct.priceINR)}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProductDetailsNew;