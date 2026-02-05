import React, { useRef, useLayoutEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, ArrowDown } from "lucide-react";
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
}

const categories: Category[] = [
    {
        id: "dining",
        title: "Dining",
        subtitle: "The Centerpiece",
        description: "Grand tables carved from single blocks of stone. Where conversations are grounded in geology.",
        image: "/furniture/dining-table.jpg",
        link: "/products?category=dining",
    },
    {
        id: "coffee",
        title: "Low Tables",
        subtitle: "Sculptural Forms",
        description: "Grounding geometry for the living space. Low centers of gravity, high impact.",
        image: "/furniture/coffee-table.jpg",
        link: "/products?category=coffee",
    },
    {
        id: "decor",
        title: "Objects",
        subtitle: "Vases & Plinths",
        description: "The finishing nuance. Small scale, massive presence.",
        image: "/furniture/decor.jpg",
        link: "/products?category=decor",
    },
    {
        id: "consoles",
        title: "Consoles",
        subtitle: "Transitional Spaces",
        description: "Elegant surfaces for entryways. Bridging the gap between architecture and art.",
        image: "/furniture/console.jpg",
        link: "/products?category=consoles",
    },
];

const CategoryCard = ({ category, onClick, className = "" }: { category: Category, onClick: () => void, className?: string }) => (
    <div
        onClick={onClick}
        className={`group cursor-pointer relative ${className}`}
    >
        <div className="overflow-hidden bg-stone-200 relative aspect-[3/4]">
            <img
                src={category.image}
                alt={category.title}
                className="h-full w-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110"
            />
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500" />

            {/* View Button - Appears on Hover */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="h-20 w-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-white">
                    <span className="text-xs uppercase tracking-widest">View</span>
                </div>
            </div>
        </div>

        <div className="mt-6 flex justify-between items-start border-t border-stone-300 pt-4">
            <div>
                <span className="text-xs font-bold tracking-[0.2em] uppercase text-stone-500 mb-2 block">
                    {category.subtitle}
                </span>
                <h3 className="font-serif text-3xl md:text-4xl text-stone-900 group-hover:italic transition-all">
                    {category.title}
                </h3>
            </div>
            <ArrowUpRight className="h-6 w-6 text-stone-400 group-hover:text-stone-900 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
        </div>
        <p className="mt-4 text-stone-600 font-light max-w-sm leading-relaxed">
            {category.description}
        </p>
    </div>
);

const FurnitureCategories: React.FC = () => {
    const navigate = useNavigate();
    const containerRef = useRef<HTMLDivElement>(null);
    const rightColRef = useRef<HTMLDivElement>(null);

    // Split categories for desktop staggered layout
    const leftColumn = categories.filter((_, i) => i % 2 === 0);
    const rightColumn = categories.filter((_, i) => i % 2 !== 0);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            // Desktop Parallax Effect
            // The right column moves slightly faster/more to create offset shift
            if (window.innerWidth >= 768) {
                gsap.to(rightColRef.current, {
                    yPercent: 15, // Moves down relative to scroll
                    ease: "none",
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: "top bottom",
                        end: "bottom top",
                        scrub: true,
                    }
                });
            }
        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <section ref={containerRef} className="py-20 md:py-40 bg-stone-50 text-stone-900 overflow-hidden relative">

            {/* Section Header */}
            <div className="container mx-auto px-6 md:px-12 mb-20 md:mb-32">
                <div className="flex flex-col md:flex-row justify-between items-end gap-8 border-b border-stone-200 pb-8">
                    <h2 className="font-serif text-5xl md:text-8xl leading-[0.9]">
                        The <br /> <span className="italic text-stone-400">Catalogue.</span>
                    </h2>
                    <div className="max-w-md text-right md:text-right">
                        <p className="text-stone-500 text-lg font-light leading-relaxed">
                            Curated selections of stone furniture.
                            Each category represents a distinct conversation between nature and geometry.
                        </p>
                    </div>
                </div>
            </div>

            {/* --- DESKTOP: Asymmetric Broken Grid --- */}
            <div className="hidden md:grid grid-cols-2 gap-12 lg:gap-24 container mx-auto px-6 md:px-12 relative min-h-screen">

                {/* Left Column - Starts Normal */}
                <div className="flex flex-col gap-32 lg:gap-40 pb-20">
                    {leftColumn.map((cat) => (
                        <CategoryCard
                            key={cat.id}
                            category={cat}
                            onClick={() => navigate(cat.link)}
                        />
                    ))}
                </div>

                {/* Right Column - Starts Lower & Parallax applied via Ref */}
                <div ref={rightColRef} className="flex flex-col gap-32 lg:gap-40 pt-32 lg:pt-56">
                    {rightColumn.map((cat) => (
                        <CategoryCard
                            key={cat.id}
                            category={cat}
                            onClick={() => navigate(cat.link)}
                        />
                    ))}
                </div>
            </div>

            {/* --- MOBILE: "TikTok/Reels" Style Vertical Deck --- */}
            <div className="md:hidden flex flex-col w-full">
                {categories.map((cat, index) => (
                    <div
                        key={cat.id}
                        className="relative w-full h-[85vh] sticky top-0 border-b border-white/10 overflow-hidden"
                        onClick={() => navigate(cat.link)}
                    >
                        {/* Full Background Image */}
                        <img
                            src={cat.image}
                            alt={cat.title}
                            className="absolute inset-0 w-full h-full object-cover"
                        />

                        {/* Gradient Scrim for Readability */}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/90" />

                        {/* Content Overlay - Bottom Aligned */}
                        <div className="absolute bottom-0 left-0 w-full p-8 z-10 text-white">
                            <div className="flex items-center gap-2 mb-3 opacity-80">
                                <span className="text-[10px] font-bold tracking-[0.3em] uppercase">
                                    0{index + 1}
                                </span>
                                <div className="h-[1px] w-8 bg-white/50" />
                                <span className="text-[10px] font-bold tracking-[0.3em] uppercase">
                                    {cat.subtitle}
                                </span>
                            </div>

                            <h3 className="font-serif text-5xl mb-3 leading-none">
                                {cat.title}
                            </h3>

                            <p className="text-white/80 font-light text-sm line-clamp-2 max-w-[80%] mb-6 leading-relaxed">
                                {cat.description}
                            </p>

                            <button className="flex items-center gap-3 text-xs uppercase tracking-widest border border-white/30 rounded-full px-6 py-3 bg-white/5 backdrop-blur-md">
                                Explore Collection
                                <ArrowUpRight className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Scroll indicator for the first item */}
                        {index === 0 && (
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 animate-bounce">
                                <ArrowDown className="w-5 h-5" />
                            </div>
                        )}
                    </div>
                ))}
            </div>

        </section>
    );
};

export default FurnitureCategories;
