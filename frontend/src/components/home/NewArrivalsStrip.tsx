import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { productService, Product } from "../../services/productService";
import { useCurrency } from "../../contexts/CurrencyContext";
import { getProductCloudinaryUrl } from "../../utils/productCloudinary";

const NewArrivalsStrip = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
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
          limit: 12,
          sortBy: "createdAt",
          sortOrder: "desc",
        });

        if (response.success && Array.isArray(response.data)) {
          setProducts(normalizeProducts(response.data));
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error("Failed to load new arrivals:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

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

  const arrivalProducts = useMemo(() => products.slice(0, 10), [products]);

  const isNewArrival = (createdAt: string) => {
    const createdAtTs = new Date(createdAt).getTime();
    const now = Date.now();
    const days = (now - createdAtTs) / (1000 * 60 * 60 * 24);
    return days <= 30;
  };

  if (loading) {
    return (
      <section className="py-12 md:py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="mb-8">
            <div className="h-3 w-24 bg-[#E8E3DC] rounded mb-4 animate-pulse" />
            <div className="h-10 w-64 bg-[#E8E3DC] rounded animate-pulse" />
          </div>
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="w-64 flex-shrink-0 animate-pulse">
                <div className="h-72 bg-[#E8E3DC] mb-4" />
                <div className="h-4 bg-[#E8E3DC] rounded mb-2" />
                <div className="h-5 w-1/2 bg-[#E8E3DC] rounded" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (arrivalProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-12 md:py-14 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6 mb-8 md:mb-10">
        <div className="flex items-end justify-between">
          <div>
            <span className="block text-[11px] font-semibold tracking-[0.3em] uppercase text-[#C4A265] mb-3">
              Just In
            </span>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-[#1a1a1a] leading-tight !font-normal">
              New Arrivals
            </h2>
          </div>

          <Link
            to="/products"
            className="group hidden md:inline-flex items-center gap-2 text-[#8A8682] hover:text-[#1a1a1a] transition-colors duration-300"
          >
            <span className="text-xs font-semibold tracking-[0.15em] uppercase">Browse New</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      <div
        className="px-2 md:px-3 lg:px-4"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4">
          {arrivalProducts.map((product) => {
            const originalPrice = product.priceINR || 0;
            const hasDiscount = Boolean(product.discount?.enabled && product.discount.percentage > 0);
            const finalPrice = hasDiscount
              ? originalPrice - (originalPrice * product.discount!.percentage) / 100
              : originalPrice;

            return (
              <Link
                key={product._id}
                to={`/products/${product.productId || product._id}`}
                className="flex-shrink-0 w-[68vw] sm:w-[40vw] md:w-[28vw] lg:w-[21vw] snap-start group"
              >
                <div className="relative overflow-hidden bg-[#F7F5F0]" style={{ aspectRatio: "3/4" }}>
                  <img
                    src={getImageUrl(product)}
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />

                  {isNewArrival(product.createdAt) && (
                    <div className="absolute top-3 left-3 bg-[#1a1a1a] text-white px-3 py-1">
                      <span className="text-[9px] font-semibold tracking-[0.12em] uppercase">New</span>
                    </div>
                  )}
                </div>

                <div className="py-4">
                  <span className="text-[10px] font-semibold tracking-[0.12em] uppercase text-[#8A8682] block mb-2">
                    {product.category}
                  </span>
                  <h3 className="font-serif text-lg text-[#1a1a1a] leading-snug line-clamp-2 mb-2 group-hover:text-[#C4A265] transition-colors duration-300 !font-normal">
                    {product.name}
                  </h3>
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

        <div className="md:hidden mt-6 text-center">
          <Link
            to="/products"
            className="group inline-flex items-center gap-2 text-[#1a1a1a] hover:text-[#C4A265] transition-colors duration-300"
          >
            <span className="text-xs font-semibold tracking-[0.15em] uppercase">Browse New</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      <style>{`
        div[class*="overflow-x-auto"]::-webkit-scrollbar { display: none; }
      `}</style>
    </section>
  );
};

export default NewArrivalsStrip;
