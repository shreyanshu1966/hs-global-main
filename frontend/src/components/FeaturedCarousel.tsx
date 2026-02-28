import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { productService, Product } from "../services/productService";
import { useCurrency } from "../contexts/CurrencyContext";
import { getProductCloudinaryUrl } from "../utils/productCloudinary";

const FeaturedCarousel = () => {
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
        const cardWidth = el.querySelector(".product-snap-card")
            ?.clientWidth || 320;
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
            <section className="py-20 md:py-32 bg-[#FAFAF8]">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <div className="mb-12">
                        <div className="h-4 w-32 bg-stone-200 rounded mb-4 animate-pulse" />
                        <div className="h-10 w-64 bg-stone-200 rounded animate-pulse" />
                    </div>
                    <div className="flex gap-5 overflow-hidden">
                        {[1, 2, 3, 4].map((i) => (
                            <div
                                key={i}
                                className="flex-shrink-0 w-72 bg-white animate-pulse"
                            >
                                <div className="h-80 bg-stone-200" />
                                <div className="p-5 space-y-3">
                                    <div className="h-3 w-16 bg-stone-200 rounded" />
                                    <div className="h-5 w-40 bg-stone-200 rounded" />
                                    <div className="h-4 w-24 bg-stone-200 rounded" />
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
        <section className="py-20 md:py-32 bg-[#FAFAF8]">
            <div className="max-w-7xl mx-auto px-6 md:px-12">
                {/* Section Header */}
                <div className="flex items-end justify-between mb-12 md:mb-16">
                    <div>
                        <span className="block text-[11px] font-semibold tracking-[0.25em] uppercase text-stone-400 mb-4">
                            Curated Selection
                        </span>
                        <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-stone-900 leading-tight">
                            Featured Pieces
                        </h2>
                    </div>

                    {/* Desktop nav + View All */}
                    <div className="hidden md:flex items-center gap-4">
                        <Link
                            to="/products?cat=furniture"
                            className="group inline-flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors duration-300 mr-4"
                        >
                            <span className="text-xs font-semibold tracking-[0.15em] uppercase">
                                View All
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                        </Link>

                        <button
                            onClick={() => scroll("left")}
                            disabled={!canScrollLeft}
                            className={`p-2.5 border transition-all duration-300 ${canScrollLeft
                                ? "border-stone-300 text-stone-700 hover:bg-stone-900 hover:text-white hover:border-stone-900"
                                : "border-stone-200 text-stone-300 cursor-not-allowed"
                                }`}
                            aria-label="Scroll left"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => scroll("right")}
                            disabled={!canScrollRight}
                            className={`p-2.5 border transition-all duration-300 ${canScrollRight
                                ? "border-stone-300 text-stone-700 hover:bg-stone-900 hover:text-white hover:border-stone-900"
                                : "border-stone-200 text-stone-300 cursor-not-allowed"
                                }`}
                            aria-label="Scroll right"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Carousel Container */}
                <div
                    ref={scrollRef}
                    className="flex gap-5 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4"
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
                            (originalPrice *
                                product.discount!.percentage) /
                            100
                            : originalPrice;

                        return (
                            <Link
                                key={product._id}
                                to={`/products/${product.productId || product._id}`}
                                className="product-snap-card flex-shrink-0 w-[75vw] sm:w-[45vw] md:w-[30vw] lg:w-[23vw] snap-start group bg-white"
                            >
                                {/* Image */}
                                <div
                                    className="relative overflow-hidden bg-stone-100"
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
                                        <div className="absolute top-3 left-3 bg-stone-900 text-white px-3 py-1">
                                            <span className="text-[10px] font-semibold tracking-wider uppercase">
                                                -
                                                {
                                                    product.discount!
                                                        .percentage
                                                }
                                                %
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="p-5">
                                    <span className="text-[10px] font-semibold tracking-[0.15em] uppercase text-stone-400 block mb-2">
                                        {product.subcategory ||
                                            product.category}
                                    </span>
                                    <h3 className="font-serif text-lg text-stone-900 mb-3 leading-snug line-clamp-2 group-hover:text-stone-600 transition-colors duration-300">
                                        {product.name}
                                    </h3>

                                    {/* Price */}
                                    <div className="flex items-baseline gap-2">
                                        <span
                                            className={`text-lg font-semibold ${hasDiscount
                                                ? "text-stone-900"
                                                : "text-stone-900"
                                                }`}
                                        >
                                            {formatPrice(finalPrice)}
                                        </span>
                                        {hasDiscount && (
                                            <span className="text-sm text-stone-400 line-through">
                                                {formatPrice(originalPrice)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* Mobile: View All link */}
                <div className="md:hidden mt-8 text-center">
                    <Link
                        to="/products?cat=furniture"
                        className="group inline-flex items-center gap-2 text-stone-600 hover:text-stone-900 transition-colors duration-300"
                    >
                        <span className="text-xs font-semibold tracking-[0.15em] uppercase">
                            View All Furniture
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default FeaturedCarousel;
