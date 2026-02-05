import { useRef, useLayoutEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Heart } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface FeaturedProduct {
    id: string;
    name: string;
    category: string;
    image: string;
    price?: string;
    description: string;
    link: string;
    badge?: string;
}

const featuredProducts: FeaturedProduct[] = [
    {
        id: "calacatta-dining",
        name: "Calacatta Dining Table",
        category: "Dining Tables",
        image: "/furniture/dining-table.jpg",
        price: "₹2,50,000",
        description: "Monolithic marble dining table with dramatic veining",
        link: "/products?cat=furniture#dining-table",
        badge: "Bestseller"
    },
    {
        id: "nero-coffee",
        name: "Nero Marquina Coffee Table",
        category: "Coffee Tables",
        image: "/furniture/coffee-table.jpg",
        price: "₹1,80,000",
        description: "Sleek black marble with white lightning veins",
        link: "/products?cat=furniture#coffee-table",
        badge: "New Arrival"
    },
    {
        id: "travertine-console",
        name: "Roman Travertine Console",
        category: "Console Tables",
        image: "/furniture/console.jpg",
        price: "₹1,20,000",
        description: "Earthy tones with natural character",
        link: "/products?cat=furniture#console-table"
    },
    {
        id: "sculpture-viola",
        name: "Viola Sculpture",
        category: "Sculptures",
        image: "/furniture/sculpture-stand.jpg",
        price: "₹85,000",
        description: "Artistic marble sculpture with burgundy veining",
        link: "/products?cat=furniture#sculptures",
        badge: "Featured"
    }
];

const FeaturedProducts = () => {
    const sectionRef = useRef<HTMLElement>(null);
    const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
    const [favorites, setFavorites] = useState<Set<string>>(new Set());

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            // Animate section title
            gsap.from(".featured-title", {
                opacity: 0,
                duration: 0.8,
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top 80%",
                }
            });

            // Stagger animate product cards
            cardsRef.current.forEach((card, index) => {
                if (!card) return;

                gsap.from(card, {
                    opacity: 0,
                    duration: 0.8,
                    delay: index * 0.15,
                    scrollTrigger: {
                        trigger: card,
                        start: "top 90%",
                    }
                });
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    const toggleFavorite = (productId: string) => {
        setFavorites(prev => {
            const newSet = new Set(prev);
            if (newSet.has(productId)) {
                newSet.delete(productId);
            } else {
                newSet.add(productId);
            }
            return newSet;
        });
    };

    return (
        <section
            ref={sectionRef}
            className="py-16 md:py-24 bg-stone-50"
        >
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

                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                    {featuredProducts.map((product, index) => (
                        <div
                            key={product.id}
                            ref={(el) => cardsRef.current[index] = el}
                            className="group relative bg-white rounded-sm overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500"
                        >
                            {/* Image Container */}
                            <Link to={product.link} className="block relative h-80 overflow-hidden">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />

                                {/* Badge */}
                                {product.badge && (
                                    <div className="absolute top-4 left-4 bg-amber-600 text-white px-3 py-1.5 rounded-full">
                                        <span className="text-xs font-bold uppercase tracking-wide">
                                            {product.badge}
                                        </span>
                                    </div>
                                )}

                                {/* Favorite Button */}
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        toggleFavorite(product.id);
                                    }}
                                    className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
                                    aria-label="Add to favorites"
                                >
                                    <Heart
                                        className={`w-5 h-5 transition-all ${favorites.has(product.id)
                                            ? 'fill-red-500 text-red-500'
                                            : 'text-stone-600'
                                            }`}
                                    />
                                </button>

                                {/* Quick View Overlay */}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0">
                                        <span className="inline-flex items-center gap-2 px-6 py-3 bg-white text-stone-900 font-semibold text-sm">
                                            View Details
                                            <ArrowRight className="w-4 h-4" />
                                        </span>
                                    </div>
                                </div>
                            </Link>

                            {/* Product Info */}
                            <div className="p-6">
                                <span className="block text-xs font-semibold uppercase tracking-wider text-amber-600 mb-2">
                                    {product.category}
                                </span>
                                <h3 className="font-serif text-xl md:text-2xl text-stone-900 mb-2 leading-tight">
                                    {product.name}
                                </h3>
                                <p className="text-sm text-stone-600 mb-4 leading-relaxed">
                                    {product.description}
                                </p>

                                {/* Price & CTA */}
                                <div className="flex items-center justify-between pt-4 border-t border-stone-200">
                                    {product.price ? (
                                        <span className="text-lg font-bold text-stone-900">
                                            {product.price}
                                        </span>
                                    ) : (
                                        <span className="text-sm text-stone-500 italic">
                                            Price on request
                                        </span>
                                    )}
                                    <Link
                                        to={product.link}
                                        className="inline-flex items-center gap-1 text-sm font-semibold text-amber-600 hover:text-amber-700 hover:gap-2 transition-all"
                                    >
                                        Explore
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* View All CTA */}
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
            </div>
        </section>
    );
};

export default FeaturedProducts;
