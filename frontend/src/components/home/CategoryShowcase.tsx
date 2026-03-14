import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { productService, Product } from "../../services/productService";
import { getProductCloudinaryUrl } from "../../utils/productCloudinary";
import { useCurrency } from "../../contexts/CurrencyContext";

interface CategoryConfig {
    id: string;
    title: string;
    subtitle: string;
    primaryTarget: string;
    targets: string[];
}

interface CategoryProducts {
    config: CategoryConfig;
    products: Product[];
}

const categoryConfigs: CategoryConfig[] = [
    {
        id: "coffee-tables",
        title: "Coffee Tables",
        subtitle: "Living Centerpieces",
        primaryTarget: "coffee-table",
        targets: ["coffee-table", "coffee table"],
    },
    
    {
        id: "wash-basins",
        title: "Wash Basins",
        subtitle: "Bathroom Luxury",
        primaryTarget: "pedestal",
        targets: ["pedestal", "countertop", "wash-basin", "wash basin"],
    },
    {
        id: "countertops",
        title: "Countertops",
        subtitle: "Functional Luxury",
        primaryTarget: "countertop",
        targets: ["countertop", "counter-top"],
    },
    {
        id: "dining-tables",
        title: "Dining Tables",
        subtitle: "Gathering Spaces",
        primaryTarget: "dining-table",
        targets: ["center-table", "dining-table", "center table", "dining table"],
    },
    {
        id: "sculptures",
        title: "Sculptures & Décor",
        subtitle: "Artistic Accents",
        primaryTarget: "sculptures",
        targets: ["sculptures", "sculpture", "decor", "decorative"],
    },
];

const normalizeSubcategory = (value: string) =>
    value.toLowerCase().trim().replace(/\s+/g, "-");

const CategoryShowcase = () => {
    const [sections, setSections] = useState<CategoryProducts[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const { formatPrice } = useCurrency();

    useEffect(() => {
        let isMounted = true;

        const loadCategoryProducts = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await productService.getProductsByCategory("furniture", {
                    limit: 120,
                    sortBy: "createdAt",
                    sortOrder: "desc",
                });

                const allFurnitureProducts = response.success
                    ? response.data.products.map((product) => {
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
                    })
                    : [];

                const data = categoryConfigs.map((config) => {
                    const targetSet = new Set(config.targets.map(normalizeSubcategory));
                    const categoryProducts = allFurnitureProducts.filter((product) =>
                        targetSet.has(normalizeSubcategory(product.subcategory || ""))
                    );

                    const featuredProducts = categoryProducts.filter((product) => product.featured);
                    const products = (featuredProducts.length > 0 ? featuredProducts : categoryProducts).slice(0, 10);

                    return { config, products };
                });

                if (!isMounted) return;
                setSections(data.filter((section) => section.products.length > 0));
            } catch (loadError) {
                console.error("Failed to load category products", loadError);
                if (isMounted) setError("Unable to load category collections right now.");
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        loadCategoryProducts();

        return () => {
            isMounted = false;
        };
    }, []);

    const getImageUrl = useMemo(
        () => (product: Product) => {
            const img =
                product.sortedImages?.[0] ||
                product.image ||
                product.images?.[0] ||
                "/demo2.webp";

            return img.startsWith("http") || img.startsWith("/")
                ? img
                : getProductCloudinaryUrl(img);
        },
        []
    );

    const scrollRow = (id: string, direction: "left" | "right") => {
        const row = rowRefs.current[id];
        if (!row) return;

        const cardWidth = row.querySelector(".category-product-card")?.clientWidth || 280;
        const distance = cardWidth + 20;
        row.scrollBy({
            left: direction === "left" ? -distance : distance,
            behavior: "smooth",
        });
    };

    if (loading) {
        return (
            <section className="py-12 md:py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 md:px-6">
                    <div className="h-3 w-36 bg-[#E8E3DC] rounded mb-5 animate-pulse" />
                    <div className="h-10 w-72 bg-[#E8E3DC] rounded mb-10 animate-pulse" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((skeleton) => (
                            <div key={skeleton} className="bg-[#F7F5F0] animate-pulse">
                                <div className="aspect-[4/5] bg-[#E8E3DC]" />
                                <div className="p-4 space-y-2">
                                    <div className="h-4 w-24 bg-[#E8E3DC] rounded" />
                                    <div className="h-5 w-40 bg-[#E8E3DC] rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (error || sections.length === 0) {
        return null;
    }

    return (
        <section className="py-8 md:py-10 bg-white">
            <div className="space-y-14 md:space-y-16 px-2 md:px-3 lg:px-4">
                {sections.map((section) => (
                    <div key={section.config.id}>
                        <div className="max-w-7xl mx-auto px-2 md:px-3 mb-6 flex items-end justify-between gap-4">
                            <div>
                                <span className="block text-[10px] font-semibold tracking-[0.2em] uppercase text-[#8A8682] mb-2">
                                    {section.config.subtitle}
                                </span>
                                <h3 className="font-serif text-2xl md:text-3xl lg:text-4xl text-[#1a1a1a] leading-tight !font-normal">
                                    {section.config.title}
                                </h3>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => scrollRow(section.config.id, "left")}
                                    className="hidden md:flex w-10 h-10 items-center justify-center border border-[#1a1a1a]/20 text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white transition-colors"
                                    aria-label={`Scroll ${section.config.title} left`}
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => scrollRow(section.config.id, "right")}
                                    className="hidden md:flex w-10 h-10 items-center justify-center border border-[#1a1a1a]/20 text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white transition-colors"
                                    aria-label={`Scroll ${section.config.title} right`}
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>

                                <Link
                                    to={`/products?subcategory=${section.config.primaryTarget}`}
                                    state={{ target: section.config.primaryTarget }}
                                    className="group inline-flex items-center gap-2 text-[#8A8682] hover:text-[#1a1a1a] transition-colors duration-300"
                                >
                                    <span className="text-xs font-semibold tracking-[0.15em] uppercase">
                                        View All
                                    </span>
                                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                                </Link>
                            </div>
                        </div>

                        <div
                            ref={(el) => {
                                rowRefs.current[section.config.id] = el;
                            }}
                            className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-2"
                            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                        >
                            {section.products.map((product) => {
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
                                        key={`${section.config.id}-${product._id}`}
                                        to={`/products/${product.productId || product._id}`}
                                        className="category-product-card flex-shrink-0 w-[74vw] sm:w-[46vw] md:w-[30vw] lg:w-[22vw] snap-start group"
                                    >
                                        <div className="relative overflow-hidden bg-[#F7F5F0]" style={{ aspectRatio: "4/5" }}>
                                            <img
                                                src={getImageUrl(product)}
                                                alt={product.name}
                                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                loading="lazy"
                                            />

                                            {hasDiscount && (
                                                <div className="absolute top-3 left-3 bg-[#1a1a1a] text-white px-3 py-1">
                                                    <span className="text-[10px] font-semibold tracking-wider uppercase">
                                                        Save {product.discount!.percentage}%
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="py-4">
                                            <span className="text-[10px] font-semibold tracking-[0.15em] uppercase text-[#8A8682] block mb-2">
                                                {section.config.title}
                                            </span>
                                            <h4 className="font-serif text-lg text-[#1a1a1a] mb-2 leading-snug line-clamp-2 !font-normal group-hover:text-[#C4A265] transition-colors duration-300">
                                                {product.name}
                                            </h4>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-base font-semibold text-[#1a1a1a]">
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
                    </div>
                ))}
            </div>

            <div className="mt-14 md:mt-16 text-center">
                <Link
                    to="/products"
                    className="group inline-flex items-center gap-3 px-6 py-3 rounded-full font-semibold tracking-[0.15em] uppercase text-white bg-[#1a1a1a] shadow-lg hover:bg-[#333] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#8A8682] focus:ring-offset-2"
                    style={{ fontSize: "1.05rem", letterSpacing: "0.15em" }}
                >
                    <span>View All Products</span>
                    <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1.5" />
                </Link>
            </div>

            <style>{`
                .category-product-card::-webkit-scrollbar { display: none; }
                div[class*="overflow-x-auto"]::-webkit-scrollbar { display: none; }
            `}</style>
        </section>
    );
};

export default CategoryShowcase;
