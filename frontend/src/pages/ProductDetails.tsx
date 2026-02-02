import { useEffect, useRef, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Share2, ChevronRight, Quote, ChevronLeft, ChevronRight as ChevronRightIcon } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import { AddToCartButton } from "../components/AddToCartButton";
import { QuantityHandler } from "../components/QuantityHandler";
import { useCart } from "../contexts/CartContext";
import { useProduct, useTrackAddToCart } from "../hooks/useProducts";
import { useCurrency } from "../contexts/CurrencyContext";

const ProductDetails = () => {
  const { id }: { id?: string } = useParams<{ id?: string }>();
  const { formatPrice } = useCurrency();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedFinish, setSelectedFinish] = useState("Polish");
  const [selectedThickness, setSelectedThickness] = useState("20mm");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const { state: cartState } = useCart();
  const mainImageRef = useRef<HTMLDivElement>(null);
  const relatedRef = useRef<HTMLDivElement | null>(null);

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

    if (category === "furniture" && dbProduct.specifications) {
      // Use specifications from database
      specs = dbProduct.specifications;
    } else {
      specs = {
        finish: selectedFinish,
        thickness: selectedThickness,
        origin: dbProduct.specifications?.origin || "India",
        material: subcategory.replace(/-/g, " "),
        application: "Indoor / Outdoor",
      };
    }

    // Pricing logic
    let displayPrice = "Price on Request";
    const isAvailable = dbProduct.available !== false;

    if (!isAvailable) {
      displayPrice = "Currently Unavailable";
    } else if (dbProduct.priceINR) {
      displayPrice = formatPrice(dbProduct.priceINR);
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
    };
  }, [dbProduct, dbRelatedProducts, selectedFinish, selectedThickness, formatPrice]);

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

  // Get Etsy URL if available from specifications
  const etsyUrl = dbProduct?.specifications?.etsyUrl;

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
        <title>{product.name} | HS Global Export</title>
        <meta name="title" content={product.name} />
        <meta name="description" content={product.description} />
        <meta property="og:title" content={`${product.name} | HS Global Export`} />
        <meta property="og:description" content={product.description} />
        <meta property="og:image" content={product.image} />
      </Helmet>
      
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center text-sm text-gray-600">
            <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4 mx-2" />

            <Link
              to={
                breadcrumbPath.top
                  ? `/products?cat=${breadcrumbPath.top.id}`
                  : "/products"
              }
              className="hover:text-blue-600 transition-colors"
            >
              Products
            </Link>

            {breadcrumbPath.top && (
              <>
                <ChevronRight className="w-4 h-4 mx-2" />
                <Link
                  to={`/products?cat=${breadcrumbPath.top.id}`}
                  className="hover:text-blue-600 transition-colors capitalize"
                >
                  {breadcrumbPath.top.name}
                </Link>
              </>
            )}

            {breadcrumbPath.chain.map((node) => (
              <span key={node.id} className="flex items-center">
                <ChevronRight className="w-4 h-4 mx-2" />
                <Link
                  to={`/products?cat=${breadcrumbPath.top?.id || ""}#${node.id}`}
                  className="hover:text-blue-600 transition-colors"
                >
                  {node.name}
                </Link>
              </span>
            ))}

            <ChevronRight className="w-4 h-4 mx-2" />
            <span className="text-gray-900 font-medium">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div>
            <div
              ref={mainImageRef}
              key={selectedImage}
              className="aspect-square bg-white rounded-2xl shadow-xl overflow-hidden mb-6"
              style={{ opacity: 0 }}
            >
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnail Gallery */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-5 gap-3">
                {product.images.slice(0, 5).map((img, idx) => (
                  <button
                    key={img}
                    onClick={() => setSelectedImage(idx)}
                    className={`aspect-square bg-white rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === idx
                        ? "border-blue-600 ring-2 ring-blue-600/20 scale-95"
                        : "border-gray-200 hover:border-gray-300"
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

          {/* Product Info */}
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
              {product.name}
            </h1>
            
            <div className="flex items-center gap-4 mb-6">
              <span className="text-3xl font-bold text-blue-600">
                {product.category === "slabs" ? "Custom Quote" : product.price}
              </span>
              
              {!product.available && (
                <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                  Out of Stock
                </span>
              )}
              
              {product.moq && product.available && (
                <span className="text-sm text-gray-600">{product.moq}</span>
              )}
            </div>

            <p className="text-gray-700 text-lg leading-relaxed mb-8">
              {product.description}
            </p>

            {/* Specifications */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Specifications</h3>
              <div className="space-y-3">
                {product.category === "slabs" ? (
                  <>
                    {/* Finish selector */}
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <span className="font-medium text-gray-700">Finish:</span>
                      <select
                        value={selectedFinish}
                        onChange={(e) => setSelectedFinish(e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
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
                      <span className="font-medium text-gray-700">Thickness:</span>
                      <select
                        value={selectedThickness}
                        onChange={(e) => setSelectedThickness(e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
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
                          <span className="font-medium text-gray-700 capitalize">{key}:</span>
                          <span className="text-gray-900">{value}</span>
                        </div>
                      ))}
                  </>
                ) : (
                  // Furniture specs
                  Object.entries(product.specs).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                      <span className="font-medium text-gray-700 capitalize">{key}:</span>
                      <span className="text-gray-900">{value}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {product.available ? (
                  product.category === "slabs" ? (
                    <AddToCartButton
                      product={product}
                      preselectedCustomization={{
                        finish: selectedFinish,
                        thickness: selectedThickness,
                      }}
                      className="flex-1 h-12 inline-flex items-center justify-center gap-2 px-6 rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
                    />
                  ) : isInCart ? (
                    <QuantityHandler product={product} />
                  ) : (
                    <AddToCartButton
                      product={product}
                      className="flex-1 h-12 inline-flex items-center justify-center gap-2 px-6 rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
                    />
                  )
                ) : (
                  <a
                    href={`https://wa.me/918107115116?text=${encodeURIComponent(
                      "Inquiry about " + product.name + " availability"
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 h-12 inline-flex items-center justify-center gap-2 px-6 rounded-lg bg-red-600 text-white hover:bg-red-700 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
                  >
                    Contact for Availability
                  </a>
                )}
              </div>

              {product.available && etsyUrl && (
                <a
                  href={etsyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-12 flex items-center justify-center gap-2 px-6 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors font-semibold"
                >
                  View on Etsy
                </a>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleShare}
                  className="flex-1 h-12 inline-flex items-center justify-center gap-2 px-4 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
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
                  className="flex-1 h-12 inline-flex items-center justify-center gap-2 px-4 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors font-semibold"
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
                className="w-full h-12 flex items-center justify-center gap-2 px-6 rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors font-semibold"
              >
                <Quote className="w-5 h-5" />
                Request Quote
              </Link>
            </div>
          </div>
        </div>
      </div>
      {/* Description & Details Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              About {product.name}
            </h2>

            <div className="space-y-6 text-gray-700 text-lg leading-relaxed">
              <p>
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

            {/* QUOTE BOX */}
            <div className="mt-10 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 p-8">
              <div className="flex items-start gap-4">
                <Quote className="w-8 h-8 text-amber-600 flex-shrink-0" />
                <p className="text-gray-800 text-lg leading-relaxed italic">
                  {product.category === "furniture"
                    ? "Each furniture piece is a unique work of art, combining traditional craftsmanship with modern design sensibilities. Request custom specifications to match your vision."
                    : "Crafted by nature over millennia, this stone delivers timeless elegance to modern spaces. Request a live video of current slabs to choose your exact piece."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {product.relatedProducts.length > 0 && (
        <div className="bg-gray-50 py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Related Products</h2>

              <div className="flex gap-2">
                <button
                  onClick={() => scrollRelated("left")}
                  className="h-10 w-10 rounded-full bg-white shadow-md hover:shadow-lg flex items-center justify-center transition-all border border-gray-200"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-700" />
                </button>
                <button
                  onClick={() => scrollRelated("right")}
                  className="h-10 w-10 rounded-full bg-white shadow-md hover:shadow-lg flex items-center justify-center transition-all border border-gray-200"
                >
                  <ChevronRightIcon className="w-5 h-5 text-gray-700" />
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
                    className="group bg-white rounded-xl shadow-md hover:shadow-xl overflow-hidden transition-all duration-300 shrink-0"
                    style={{
                      width: `${slideWidth}px`,
                      scrollSnapAlign: "start",
                    }}
                  >
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-4">
                      <h4 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {p.name}
                      </h4>
                      <div className="mt-3 inline-flex items-center text-blue-600 text-sm font-medium group-hover:gap-2 transition-all">
                        View Details
                        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
