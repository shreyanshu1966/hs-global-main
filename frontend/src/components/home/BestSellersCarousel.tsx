import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { productService, Product } from "../../services/productService";
import { useCurrency } from "../../contexts/CurrencyContext";
import { getProductCloudinaryUrl } from "../../utils/productCloudinary";

const BestSellersCarousel = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);
    const { formatPrice } = useCurrency();
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const response = await productService.getFeaturedProducts(8);
                if (response.success && Array.isArray(response.data)) {
                    const normalized = response.data.map((product) => {
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
                    setProducts(normalized);
                }
            } catch (error) {
                console.error("Failed to load featured products:", error);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const checkScroll = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 10);
        setCanScrollRight(
            el.scrollLeft < el.scrollWidth - el.clientWidth - 10
        );
    }, []);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        el.addEventListener("scroll", checkScroll, { passive: true });
        checkScroll();
        return () => el.removeEventListener("scroll", checkScroll);
    }, [checkScroll, products]);

    const scroll = (direction: "left" | "right") => {
        const el = scrollRef.current;
        if (!el) return;
        const cardWidth =
            el.querySelector(".bs-card")?.clientWidth || 320;
        const gap = 20;
        const distance = cardWidth + gap;
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

    // Loading skeleton
    if (loading) {
        return (
            <section className="py-24 md:py-36 bg-white">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <div className="mb-12">
                        <div className="h-3 w-28 bg-[#E8E3DC] rounded mb-4 animate-pulse" />
                        <div className="h-10 w-60 bg-[#E8E3DC] rounded animate-pulse" />
                    </div>
                    <div className="flex gap-5 overflow-hidden">
                        {[1, 2, 3, 4].map((i) => (
                            <div
                                key={i}
                                className="flex-shrink-0 w-72 bg-[#F7F5F0] animate-pulse"
                            >
                                <div className="h-80 bg-[#E8E3DC]" />
                                <div className="p-5 space-y-3">
                                    <div className="h-3 w-16 bg-[#E8E3DC] rounded" />
                                    <div className="h-5 w-40 bg-[#E8E3DC] rounded" />
                                    <div className="h-4 w-24 bg-[#E8E3DC] rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (products.length === 0) return null;

    return (
        <section className="py-12 md:py-12 bg-white">
            {/* Section Header */}
            <div className="max-w-7xl mx-auto px-4 md:px-6 mb-12 md:mb-16">
                <div className="flex items-end justify-between">
                    <div>
                        <span className="block text-[11px] font-semibold tracking-[0.3em] uppercase text-[#C4A265] mb-4">
                            Curated Selection
                        </span>
                        <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-[#1a1a1a] leading-tight !font-normal">
                            Best Sellers
                        </h2>
                    </div>

                    {/* Desktop nav */}
                    <div className="hidden md:flex items-center gap-4">
                        <Link
                            to="/products?cat=furniture"
                            className="group inline-flex items-center gap-2 text-[#8A8682] hover:text-[#1a1a1a] transition-colors duration-300 mr-4"
                        >
                            <span className="text-xs font-semibold tracking-[0.15em] uppercase">
                                View All
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                        </Link>

                        <button
                            onClick={() => scroll("left")}
                            disabled={!canScrollLeft}
                            className={`w-11 h-11 flex items-center justify-center border transition-all duration-300 ${canScrollLeft
                                ? "border-[#1a1a1a]/20 text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white"
                                : "border-[#E8E3DC] text-[#E8E3DC] cursor-not-allowed"
                                }`}
                            aria-label="Scroll left"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => scroll("right")}
                            disabled={!canScrollRight}
                            className={`w-11 h-11 flex items-center justify-center border transition-all duration-300 ${canScrollRight
                                ? "border-[#1a1a1a]/20 text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white"
                                : "border-[#E8E3DC] text-[#E8E3DC] cursor-not-allowed"
                                }`}
                            aria-label="Scroll right"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Carousel Content */}
            <div className="px-2 md:px-3 lg:px-4">

                {/* Carousel */}
                <div
                    ref={scrollRef}
                    className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4"
                    style={{
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                    }}
                >
                    {products.map((product) => {
                        const imgUrl = getImageUrl(product);
                        const hasDiscount =
                            product.discount?.enabled &&
                            product.discount.percentage > 0;
                        const originalPrice = product.priceINR || 0;
                        const finalPrice = hasDiscount
                            ? originalPrice -
                            (originalPrice * product.discount!.percentage) / 100
                            : originalPrice;

                        return (
                            <Link
                                key={product._id}
                                to={`/products/${product.productId || product._id}`}
                                className="bs-card flex-shrink-0 w-[72vw] sm:w-[42vw] md:w-[30vw] lg:w-[23vw] snap-start group"
                            >
                                {/* Image */}
                                <div
                                    className="relative overflow-hidden bg-[#F7F5F0]"
                                    style={{ aspectRatio: "3/4" }}
                                >
                                    <img
                                        src={imgUrl}
                                        alt={product.name}
                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        loading="lazy"
                                    />

                                    {/* Discount badge */}
                                    {hasDiscount && (
                                        <div className="absolute top-3 left-3 bg-[#1a1a1a] text-white px-3 py-1">
                                            <span className="text-[10px] font-semibold tracking-wider uppercase">
                                                Save {product.discount!.percentage}%
                                            </span>
                                        </div>
                                    )}

                                    {/* Stone type badge */}
                                    {product.subcategory && (
                                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-[#1a1a1a] px-3 py-1">
                                            <span className="text-[9px] font-semibold tracking-[0.1em] uppercase">
                                                {product.subcategory}
                                            </span>
                                        </div>
                                    )}

                                    {/* Hover overlay */}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-500" />
                                </div>

                                {/* Info */}
                                <div className="py-5">
                                    <span className="text-[10px] font-semibold tracking-[0.15em] uppercase text-[#8A8682] block mb-2">
                                        {product.category}
                                    </span>
                                    <h3 className="font-serif text-lg text-[#1a1a1a] mb-3 leading-snug line-clamp-2 group-hover:text-[#C4A265] transition-colors duration-300 !font-normal">
                                        {product.name}
                                    </h3>

                                    {/* Price */}
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-lg font-semibold text-[#1a1a1a]">
                                            {formatPrice(finalPrice)}
                                        </span>
                                        {hasDiscount && (
                                            <span className="text-sm text-[#8A8682] line-through">
                                                {formatPrice(originalPrice)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* Mobile View All */}
                <div className="md:hidden mt-8 text-center">
                    <Link
                        to="/products?cat=furniture"
                        className="group inline-flex items-center gap-2 text-[#1a1a1a] hover:text-[#C4A265] transition-colors duration-300"
                    >
                        <span className="text-xs font-semibold tracking-[0.15em] uppercase">
                            View All Furniture
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>
            </div>

            {/* Hide scrollbar */}
            <style>{`
        .bs-card::-webkit-scrollbar { display: none; }
        div[class*="overflow-x-auto"]::-webkit-scrollbar { display: none; }
      `}</style>
        </section>
    );
};

export default BestSellersCarousel;
