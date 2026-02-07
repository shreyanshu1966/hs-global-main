import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { productService, Product } from "../services/productService";
import { PremiumProductCard } from "./PremiumProductCard";

const FeaturedProducts = () => {
    const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadFeaturedProducts = async () => {
            try {
                setLoading(true);
                const response = await productService.getFeaturedProducts(4);
                if (response.success && Array.isArray(response.data)) {
                    const normalizedProducts = response.data.map(product => {
                        // Normalize images using logic consistent with ProductDetails
                        const baseImages = product.images && product.images.length > 0
                            ? product.images
                            : product.image
                                ? [product.image]
                                : ["/demo2.webp"];

                        return {
                            ...product,
                            images: baseImages,
                            image: baseImages[0] || "/demo2.webp"
                        };
                    });
                    setFeaturedProducts(normalizedProducts);
                    if (response.data.length === 0) {
                        console.warn("No featured products found. Mark products as 'featured' in admin panel.");
                    }
                } else {
                    console.error("Invalid response format:", response);
                }
            } catch (error) {
                console.error("Failed to load featured products:", error);
                setFeaturedProducts([]);
            } finally {
                setLoading(false);
            }
        };

        loadFeaturedProducts();
    }, []);

    // Fade-in animations removed per user request

    return (
        <section className="py-16 md:py-24 bg-stone-50">
            <div className="container mx-auto px-4 md:px-6">
                {/* Section Header */}
                <div className="featured-title text-center max-w-3xl mx-auto mb-12 md:mb-16">
                    <span className="block text-xs md:text-sm font-bold tracking-[0.3em] uppercase text-amber-600 mb-4">
                        Curated Selection
                    </span>
                    <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-stone-900 mb-6 leading-tight">
                        Featured
                        <span className="block italic text-stone-500">Masterpieces</span>
                    </h2>
                    <p className="text-lg text-stone-600 font-light leading-relaxed">
                        Discover our most sought-after marble furniture pieces, handpicked for their exceptional craftsmanship and timeless design.
                    </p>
                </div>

                {/* Loading State */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-white rounded-sm overflow-hidden shadow-sm animate-pulse">
                                <div className="h-80 bg-stone-200"></div>
                                <div className="p-6 space-y-3">
                                    <div className="h-4 bg-stone-200 rounded w-1/3"></div>
                                    <div className="h-6 bg-stone-200 rounded w-2/3"></div>
                                    <div className="h-4 bg-stone-200 rounded"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : featuredProducts.length === 0 ? (
                    /* Empty State */
                    <div className="text-center py-16">
                        <p className="text-lg text-stone-600 mb-4">
                            No featured products available at the moment.
                        </p>
                        <p className="text-sm text-stone-500">
                            Check back soon for our curated selection of masterpieces.
                        </p>
                    </div>
                ) : (
                    /* Products Grid */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 justify-items-center">
                        {featuredProducts.map((product, index) => (
                            <PremiumProductCard
                                key={product._id}
                                product={product}
                                index={index}
                            />
                        ))}
                    </div>
                )}

                {/* View All CTA - Only show if there are products */}
                {!loading && featuredProducts.length > 0 && (
                    <div className="mt-12 md:mt-16 text-center">
                        <Link
                            to="/products?cat=furniture"
                            className="inline-flex items-center gap-3 px-8 py-4 bg-stone-900 text-white hover:bg-amber-600 transition-colors duration-300 group"
                        >
                            <span className="text-sm font-bold tracking-[0.2em] uppercase">
                                View All Furniture
                            </span>
                            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
};

export default FeaturedProducts;
