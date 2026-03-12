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
    image: string;
    link: string;
    target?: string;
    layout: "full" | "half";
}

const categories: Category[] = [
    {
        id: "coffee-tables",
        title: "Coffee Tables",
        subtitle: "Living Centerpieces",
        image: "/furniture/coffee-table.jpg",
        link: "/products?cat=furniture#coffee-table",
        target: "coffee-table",
        layout: "full",
    },
    {
        id: "console-tables",
        title: "Console Tables",
        subtitle: "Statement Pieces",
        image: "/furniture/console.jpg",
        link: "/products?cat=furniture#console-table",
        target: "console-table",
        layout: "half",
    },
    {
        id: "wash-basins",
        title: "Wash Basins",
        subtitle: "Bathroom Luxury",
        image: "/gallery/Wash Basins/IMG-20250525-WA0109.webp",
        link: "/products?cat=furniture#pedestal",
        target: "pedestal",
        layout: "half",
    },
    {
        id: "dining-tables",
        title: "Dining Tables",
        subtitle: "Gathering Spaces",
        image: "/furniture/dining-table.jpg",
        link: "/products?cat=furniture#dining-table",
        target: "dining-table",
        layout: "half",
    },
    {
        id: "sculptures",
        title: "Sculptures & Décor",
        subtitle: "Artistic Accents",
        image: "/furniture/sculpture-stand.jpg",
        link: "/products?cat=furniture#sculptures",
        target: "sculptures",
        layout: "half",
    },
    {
        id: "slabs",
        title: "Premium Slabs",
        subtitle: "Raw Materials",
        image: "/gallery/Slabs/WhatsApp Image 2025-11-05 at 1.45.19 PM (2).webp",
        link: "/products?cat=slabs",
        layout: "full",
    },
];

const CategoryShowcase = () => {
    const sectionRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            gsap.utils.toArray<HTMLElement>(".cat-item").forEach((card) => {
                gsap.from(card, {
                    y: 80,
                    opacity: 0,
                    duration: 1,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: card,
                        start: "top 88%",
                        toggleActions: "play none none none",
                    },
                });
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className="py-4 md:py-4 lg:py-4 bg-white">
            {/* Section Header — centered with normal padding */}
            <div className="max-w-7xl mx-auto px-4 md:px-6 mb-16 md:mb-24">
                <div className="max-w-3xl">
                    <span className="block text-[11px] font-semibold tracking-[0.3em] uppercase text-[#C4A265] mb-5">
                        Shop by Category
                    </span>
                    <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-[#1a1a1a] leading-[1.05] mb-6 !font-normal">
                        Explore Our
                        <span className="block italic text-[#8A8682] mt-1">
                            Collections
                        </span>
                    </h2>
                    <p className="text-base md:text-lg text-[#8A8682] font-light leading-relaxed max-w-xl">
                        From sculptural tables to textured slabs — every piece is
                        handcrafted from the world's finest natural stone.
                    </p>
                </div>
            </div>

            {/* Categories Grid — edge-to-edge with minimal padding */}
            <div className="px-2 md:px-3 lg:px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                    {categories.map((cat) => (
                        <Link
                            key={cat.id}
                            to={cat.link}
                            state={cat.target ? { target: cat.target } : undefined}
                            className={`cat-item group relative overflow-hidden bg-[#F7F5F0] ${cat.layout === "full" ? "md:col-span-2" : ""
                                }`}
                        >
                            {/* Image */}
                            <div
                                className={`relative overflow-hidden ${cat.layout === "full"
                                    ? "h-[50vh] md:h-[65vh]"
                                    : "h-[40vh] md:h-[50vh]"
                                    }`}
                            >
                                <img
                                    src={cat.image}
                                    alt={cat.title}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-105"
                                    loading="lazy"
                                />
                                {/* Gradient overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                            </div>

                            {/* Content overlay */}
                            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                                <span className="block text-[10px] font-semibold tracking-[0.2em] uppercase text-[#C4A265] mb-2">
                                    {cat.subtitle}
                                </span>
                                <h3 className="font-serif text-2xl md:text-3xl lg:text-4xl text-white mb-4 leading-tight !font-normal">
                                    {cat.title}
                                </h3>

                                {/* CTA */}
                                <div className="inline-flex items-center gap-2 text-white/70 group-hover:text-white transition-colors duration-300">
                                    <span className="text-xs font-semibold tracking-[0.15em] uppercase">
                                        Explore
                                    </span>
                                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5" />
                                </div>
                            </div>

                            {/* Hover border */}
                            <div className="absolute inset-0 border border-white/0 group-hover:border-white/15 transition-all duration-500 pointer-events-none" />
                        </Link>
                    ))}
                </div>
            </div>

            {/* View All Products */}
            <div className="mt-16 md:mt-20 text-center">
                <Link
                    to="/products"
                    className="group inline-flex items-center gap-3 px-6 py-3 rounded-full font-semibold tracking-[0.15em] uppercase text-white bg-[#1a1a1a] shadow-lg hover:bg-[#333] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#8A8682] focus:ring-offset-2"
                    style={{ fontSize: "1.05rem", letterSpacing: "0.15em" }}
                >
                    <span className="">View All Products</span>
                    <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1.5" />
                </Link>
            </div>
        </section>
    );
};

export default CategoryShowcase;
