import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { productService, Product } from "../../services/productService";
import { useCurrency } from "../../contexts/CurrencyContext";
import { getProductCloudinaryUrl } from "../../utils/productCloudinary";

const CustomerFavoritesCarousel = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    const normalizeProducts = (items: Product[]) =>
      items.map((product) => {
        const baseImages =
          product.images && product.images.length > 0
            ? product.images
            : product.image
              ? [product.image]
              : ["/demo2.webp"];

        return {
          ...product,
          images: baseImages,
          image: baseImages[0] || "/demo2.webp",
        };
      });

    const load = async () => {
      try {
        setLoading(true);
        const response = await productService.getAllProducts({
          category: "furniture",
          limit: 30,
          sortBy: "createdAt",
          sortOrder: "desc",
        });

        if (response.success && Array.isArray(response.data)) {
          setProducts(normalizeProducts(response.data));
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error("Failed to load customer favorites:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const getReviewCount = (product: Product) => {
    const value = Number(product.totalReviews ?? 0);
    return Number.isFinite(value) ? value : 0;
  };

  const getRating = (product: Product) => {
    const value = Number(product.averageRating ?? 0);
    if (!Number.isFinite(value)) {
      return 0;
    }
    return Math.max(0, Math.min(5, value));
  };

  const favorites = useMemo(() => {
    if (products.length === 0) {
      return [];
    }

    const withReviews = products
      .filter((product) => getReviewCount(product) > 0)
      .sort((a, b) => {
        const aScore = getRating(a) * 100 + getReviewCount(a);
        const bScore = getRating(b) * 100 + getReviewCount(b);
        return bScore - aScore;
      });

    return withReviews.slice(0, 8);
  }, [products]);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) {
      return;
    }

    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) {
      return;
    }

    el.addEventListener("scroll", checkScroll, { passive: true });
    checkScroll();

    return () => {
      el.removeEventListener("scroll", checkScroll);
    };
  }, [checkScroll, favorites]);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) {
      return;
    }

    const cardWidth = el.querySelector(".favorites-card")?.clientWidth || 320;
    const distance = cardWidth + 20;

    el.scrollBy({
      left: direction === "left" ? -distance : distance,
      behavior: "smooth",
    });
  };

  const getImageUrl = (product: Product) => {
    const img =
      product.sortedImages?.[0] ||
      product.image ||
      product.images?.[0] ||
      "/demo2.webp";

    return img.startsWith("http") || img.startsWith("/")
      ? img
      : getProductCloudinaryUrl(img);
  };

  if (loading) {
    return (
      <section className="py-12 md:py-14 bg-[#FAF8F5]">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="mb-8">
            <div className="h-3 w-32 bg-[#E8E3DC] rounded mb-4 animate-pulse" />
            <div className="h-10 w-72 bg-[#E8E3DC] rounded animate-pulse" />
          </div>
          <div className="flex gap-5 overflow-hidden">
            {[1, 2, 3].map((item) => (
              <div key={item} className="w-72 flex-shrink-0 bg-white animate-pulse">
                <div className="h-80 bg-[#E8E3DC]" />
                <div className="p-5 space-y-3">
                  <div className="h-4 w-1/2 bg-[#E8E3DC] rounded" />
                  <div className="h-5 w-3/4 bg-[#E8E3DC] rounded" />
                  <div className="h-4 w-1/3 bg-[#E8E3DC] rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (favorites.length === 0) {
    return null;
  }

  return (
    <section className="py-12 md:py-14 bg-[#FAF8F5]">
      <div className="max-w-7xl mx-auto px-4 md:px-6 mb-8 md:mb-10">
        <div className="flex items-end justify-between">
          <div>
            <span className="block text-[11px] font-semibold tracking-[0.3em] uppercase text-[#C4A265] mb-3">
              Trusted Picks
            </span>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-[#1a1a1a] leading-tight !font-normal">
              Customer Favorites
            </h2>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/products"
              className="group inline-flex items-center gap-2 text-[#8A8682] hover:text-[#1a1a1a] transition-colors duration-300 mr-4"
            >
              <span className="text-xs font-semibold tracking-[0.15em] uppercase">View All</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>

            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className={`w-11 h-11 flex items-center justify-center border transition-all duration-300 ${
                canScrollLeft
                  ? "border-[#1a1a1a]/20 text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white"
                  : "border-[#E8E3DC] text-[#E8E3DC] cursor-not-allowed"
              }`}
              aria-label="Scroll customer favorites left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className={`w-11 h-11 flex items-center justify-center border transition-all duration-300 ${
                canScrollRight
                  ? "border-[#1a1a1a]/20 text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white"
                  : "border-[#E8E3DC] text-[#E8E3DC] cursor-not-allowed"
              }`}
              aria-label="Scroll customer favorites right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="px-2 md:px-3 lg:px-4">
        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {favorites.map((product) => {
            const originalPrice = product.priceINR || 0;
            const hasDiscount = Boolean(product.discount?.enabled && product.discount.percentage > 0);
            const finalPrice = hasDiscount
              ? originalPrice - (originalPrice * product.discount!.percentage) / 100
              : originalPrice;
            const rating = getRating(product);
            const reviews = getReviewCount(product);

            return (
              <Link
                key={product._id}
                to={`/products/${product.productId || product._id}`}
                className="favorites-card flex-shrink-0 w-[74vw] sm:w-[44vw] md:w-[30vw] lg:w-[23vw] snap-start group bg-white border border-[#ECE7DF]"
              >
                <div className="relative overflow-hidden bg-[#F7F5F0]" style={{ aspectRatio: "3/4" }}>
                  <img
                    src={getImageUrl(product)}
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>

                <div className="p-5">
                  <span className="text-[10px] font-semibold tracking-[0.12em] uppercase text-[#8A8682] block mb-2">
                    {product.category}
                  </span>

                  <h3 className="font-serif text-lg text-[#1a1a1a] leading-snug mb-3 line-clamp-2 group-hover:text-[#C4A265] transition-colors duration-300 !font-normal">
                    {product.name}
                  </h3>

                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${star <= Math.round(rating) ? "text-[#C4A265] fill-[#C4A265]" : "text-[#D6D1C8]"}`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-semibold text-[#1a1a1a]">{rating.toFixed(1)}</span>
                    <span className="text-xs text-[#8A8682]">({reviews} reviews)</span>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-semibold text-[#1a1a1a]">{formatPrice(finalPrice)}</span>
                    {hasDiscount && (
                      <span className="text-sm text-[#8A8682] line-through">{formatPrice(originalPrice)}</span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="md:hidden mt-8 text-center">
          <Link
            to="/products"
            className="group inline-flex items-center gap-2 text-[#1a1a1a] hover:text-[#C4A265] transition-colors duration-300"
          >
            <span className="text-xs font-semibold tracking-[0.15em] uppercase">View All Products</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      <style>{`
        .favorites-card::-webkit-scrollbar { display: none; }
        div[class*="overflow-x-auto"]::-webkit-scrollbar { display: none; }
      `}</style>
    </section>
  );
};

export default CustomerFavoritesCarousel;
