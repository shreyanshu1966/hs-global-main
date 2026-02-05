import { useRef, useLayoutEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface CategoryCard {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    image: string;
    link: string;
    productCount?: string;
}

const categories: CategoryCard[] = [
    {
        id: "dining-tables",
        title: "Dining Tables",
        subtitle: "The Heart of Home",
        description: "Monolithic marble dining tables that transform meals into experiences",
        image: "/furniture/dining-table.jpg",
        link: "/products?cat=furniture#dining-table",
        productCount: "12+ Designs"
    },
    {
        id: "coffee-tables",
        title: "Coffee Tables",
        subtitle: "Living Centerpieces",
        description: "Sculptural coffee tables that anchor your living space with elegance",
        image: "/furniture/coffee-table.jpg",
        link: "/products?cat=furniture#coffee-table",
        productCount: "15+ Designs"
    },
    {
        id: "console-tables",
        title: "Console Tables",
        subtitle: "Statement Pieces",
        description: "Refined console tables that blend function with artistic expression",
        image: "/furniture/console.jpg",
        link: "/products?cat=furniture#console-table",
        productCount: "8+ Designs"
    },
    {
        id: "wash-basins",
        title: "Wash Basins",
        subtitle: "Bathroom Luxury",
        description: "Handcrafted marble basins that elevate your daily rituals",
        image: "/furniture/console.jpg", // Replace with actual wash basin image
        link: "/products?cat=furniture#pedestal",
        productCount: "10+ Designs"
    },
    {
        id: "sculptures",
        title: "Sculptures & Décor",
        subtitle: "Artistic Accents",
        description: "Unique marble sculptures, bowls, and decorative pieces",
        image: "/furniture/sculpture-stand.jpg",
        link: "/products?cat=furniture#sculptures",
        productCount: "20+ Pieces"
    },
    {
        id: "slabs",
        title: "Premium Slabs",
        subtitle: "Raw Materials",
        description: "Curated selection of marble, granite, and natural stone slabs",
        image: "/furniture/hero-dining.jpg", // Replace with slab image
        link: "/products?cat=slabs",
        productCount: "500+ Options"
    }
];

const ProductCategoriesGrid = () => {
    const sectionRef = useRef<HTMLElement>(null);
    const cardsRef = useRef<(HTMLAnchorElement | null)[]>([]);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            // Animate section title
            gsap.from(".section-title", {
                opacity: 0,
                duration: 0.8,
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top 80%",
                }
            });

            // Stagger animate cards
            cardsRef.current.forEach((card, index) => {
                if (!card) return;

                gsap.from(card, {
                    opacity: 0,
                    duration: 0.7,
                    delay: index * 0.1,
                    scrollTrigger: {
                        trigger: card,
                        start: "top 85%",
                    }
                });
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={sectionRef}
            className="py-16 md:py-24 bg-white"
        >
            <div className="container mx-auto px-4 md:px-6">
                {/* Section Header */}
                <div className="section-title max-w-3xl mb-12 md:mb-16">
                    <span className="block text-xs md:text-sm font-bold tracking-[0.3em] uppercase text-amber-600 mb-4">
                        Our Collections
                    </span>
                    <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-stone-900 mb-6 leading-tight">
                        Discover Your Perfect
                        <span className="block italic text-stone-500">Marble Piece</span>
                    </h2>
                    <p className="text-lg text-stone-600 font-light leading-relaxed">
                        From grand dining tables to delicate decorative accents, explore our curated collection of handcrafted marble furniture and natural stone slabs.
                    </p>
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {categories.map((category, index) => {
                        const [, hash] = category.link.split('#');
                        const targetId = hash ? hash : undefined;

                        return (
                            <Link
                                key={category.id}
                                to={category.link}
                                state={targetId ? { target: targetId } : undefined}
                                ref={(el) => cardsRef.current[index] = el}
                                className="group relative overflow-hidden bg-stone-50 hover:bg-stone-100 transition-all duration-500 rounded-sm"
                            >
                                {/* Image Container */}
                                <div className="relative h-72 md:h-80 overflow-hidden">
                                    <img
                                        src={category.image}
                                        alt={category.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    {/* Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                                    {/* Product Count Badge */}
                                    {category.productCount && (
                                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
                                            <span className="text-xs font-semibold text-stone-900">
                                                {category.productCount}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                                    <span className="block text-xs font-bold tracking-[0.2em] uppercase opacity-80 mb-2">
                                        {category.subtitle}
                                    </span>
                                    <h3 className="font-serif text-2xl md:text-3xl mb-3 leading-tight">
                                        {category.title}
                                    </h3>
                                    <p className="text-sm text-white/80 mb-4 leading-relaxed">
                                        {category.description}
                                    </p>

                                    {/* CTA */}
                                    <div className="flex items-center gap-2 text-sm font-semibold group-hover:gap-4 transition-all">
                                        <span>Explore Collection</span>
                                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                    </div>
                                </div>

                                {/* Hover Border Effect */}
                                <div className="absolute inset-0 border-2 border-transparent group-hover:border-amber-600 transition-colors duration-300 pointer-events-none" />
                            </Link>
                        );
                    })}
                </div>

                {/* View All CTA */}
                <div className="mt-12 md:mt-16 text-center">
                    <Link
                        to="/products"
                        className="inline-flex items-center gap-3 px-8 py-4 bg-stone-900 text-white hover:bg-amber-600 transition-colors duration-300 group"
                    >
                        <span className="text-sm font-bold tracking-[0.2em] uppercase">
                            View All Products
                        </span>
                        <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default ProductCategoriesGrid;
