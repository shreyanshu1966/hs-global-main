import { useRef, useLayoutEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface Category {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    image: string;
    link: string;
    target?: string;
}

const categories: Category[] = [
    {
        id: "coffee-tables",
        title: "Coffee Tables",
        subtitle: "Living Centerpieces",
        description:
            "Sculptural marble tables that anchor your living space with quiet elegance and commanding presence.",
        image: "/furniture/coffee-table.jpg",
        link: "/products?cat=furniture#coffee-table",
        target: "coffee-table",
    },
    {
        id: "console-tables",
        title: "Console Tables",
        subtitle: "Statement Pieces",
        description:
            "Refined entryway consoles that blend functional form with artistic expression in natural stone.",
        image: "/furniture/console.jpg",
        link: "/products?cat=furniture#console-table",
        target: "console-table",
    },
    {
        id: "side-tables",
        title: "Side Tables",
        subtitle: "Elegant Accents",
        description:
            "Compact marble side tables — the perfect companion beside your sofa or bedside.",
        image: "/furniture/console.jpg",
        link: "/products?cat=furniture#side-table",
        target: "side-table",
    },
    {
        id: "wash-basins",
        title: "Wash Basins",
        subtitle: "Bathroom Luxury",
        description:
            "Handcrafted marble basins that transform your bathing rituals into a daily indulgence.",
        image: "/furniture/decor.jpg",
        link: "/products?cat=furniture#pedestal",
        target: "pedestal",
    },
    {
        id: "sculptures",
        title: "Sculptures & Décor",
        subtitle: "Artistic Accents",
        description:
            "One-of-a-kind marble sculptures, bowls, and decorative objects that finish a space.",
        image: "/furniture/sculpture-stand.jpg",
        link: "/products?cat=furniture#sculptures",
        target: "sculptures",
    },
    {
        id: "slabs",
        title: "Premium Slabs",
        subtitle: "Raw Materials",
        description:
            "A curated collection of marble, granite, and natural stone slabs — straight from the quarry.",
        image: "/furniture/hero-dining.jpg",
        link: "/products?cat=slabs",
    },
];

const EditorialCategories = () => {
    const sectionRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            gsap.utils.toArray<HTMLElement>(".cat-card").forEach((card) => {
                gsap.from(card, {
                    y: 60,
                    opacity: 0,
                    duration: 0.9,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: card,
                        start: "top 85%",
                        toggleActions: "play none none none",
                    },
                });
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={sectionRef}
            className="py-20 md:py-32 lg:py-40 bg-white"
        >
            <div className="max-w-7xl mx-auto px-6 md:px-12">
                {/* Section Header */}
                <div className="mb-16 md:mb-24 max-w-3xl">
                    <span className="block text-[11px] font-semibold tracking-[0.25em] uppercase text-stone-400 mb-5">
                        Our Collections
                    </span>
                    <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-stone-900 leading-[1.05] mb-6">
                        Discover Your
                        <span className="block italic text-stone-400 mt-1">
                            Perfect Piece
                        </span>
                    </h2>
                    <p className="text-base md:text-lg text-stone-500 font-light leading-relaxed max-w-xl">
                        From sculptural tables to textured slabs — explore our
                        curated collection of handcrafted marble furniture.
                    </p>
                </div>

                {/* Categories: Editorial Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                    {categories.map((cat, index) => {
                        // First and last items are full-width
                        const isFullWidth =
                            index === 0 || index === categories.length - 1;

                        return (
                            <Link
                                key={cat.id}
                                to={cat.link}
                                state={
                                    cat.target
                                        ? { target: cat.target }
                                        : undefined
                                }
                                className={`cat-card group relative overflow-hidden bg-stone-100 ${isFullWidth ? "md:col-span-2" : ""
                                    }`}
                            >
                                {/* Image */}
                                <div
                                    className={`relative overflow-hidden ${isFullWidth
                                        ? "h-[50vh] md:h-[70vh]"
                                        : "h-[45vh] md:h-[55vh]"
                                        }`}
                                >
                                    <img
                                        src={cat.image}
                                        alt={cat.title}
                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
                                        loading="lazy"
                                    />
                                    {/* Gradient overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                                </div>

                                {/* Content overlay — bottom-left */}
                                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 lg:p-12">
                                    <span className="block text-[10px] font-semibold tracking-[0.2em] uppercase text-white/60 mb-2">
                                        {cat.subtitle}
                                    </span>
                                    <h3 className="font-serif text-2xl md:text-3xl lg:text-4xl text-white mb-3 leading-tight">
                                        {cat.title}
                                    </h3>
                                    <p className="text-sm text-white/60 mb-5 max-w-md leading-relaxed hidden md:block">
                                        {cat.description}
                                    </p>

                                    {/* CTA — text link */}
                                    <div className="inline-flex items-center gap-2 text-white/80 group-hover:text-white transition-colors duration-300">
                                        <span className="text-xs font-semibold tracking-[0.15em] uppercase">
                                            Explore
                                        </span>
                                        <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5" />
                                    </div>
                                </div>

                                {/* Hover border */}
                                <div className="absolute inset-0 border border-white/0 group-hover:border-white/20 transition-all duration-500 pointer-events-none" />
                            </Link>
                        );
                    })}
                </div>

                {/* View All */}
                <div className="mt-16 md:mt-20 text-center">
                    <Link
                        to="/products"
                        className="group inline-flex items-center gap-3 text-stone-900 hover:text-stone-600 transition-colors duration-300"
                    >
                        <span className="text-sm font-semibold tracking-[0.15em] uppercase">
                            View All Products
                        </span>
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default EditorialCategories;
