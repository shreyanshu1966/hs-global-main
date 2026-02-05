import { useRef, useLayoutEffect } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Draggable } from "gsap/Draggable";

gsap.registerPlugin(ScrollTrigger, Draggable);

const collections = [
    {
        id: "dining-tables",
        title: "Dining Tables",
        subtitle: "Gathering Stones",
        image: "/furniture/dining-table.jpg",
        link: "/products?cat=furniture#dining-table"
    },
    {
        id: "coffee-tables",
        title: "Coffee Tables",
        subtitle: "Living Centerpieces",
        image: "/furniture/coffee-table.jpg",
        link: "/products?cat=furniture#coffee-table"
    },
    {
        id: "wash-basins",
        title: "Wash Basins",
        subtitle: "Liquid Luxury",
        image: "/furniture/console.jpg",
        link: "/products?cat=furniture#pedestal"
    },
    {
        id: "sculptures",
        title: "Sculptures",
        subtitle: "Sculpted Artistry",
        image: "/furniture/sculpture-stand.jpg",
        link: "/products?cat=furniture#sculptures"
    },
    {
        id: "slabs",
        title: "Premium Slabs",
        subtitle: "Raw Materials",
        image: "/furniture/hero-dining.jpg",
        link: "/products?cat=slabs"
    }
];

const CollectionLookbook = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const sliderRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            // Horizontal Scroll Effect for Desktop
            // efficient dynamic width calculation
            const getScrollAmount = () => {
                if (!sliderRef.current) return 0;
                return -(sliderRef.current.scrollWidth - window.innerWidth);
            };

            if (window.innerWidth > 768) {
                gsap.to(sliderRef.current, {
                    x: getScrollAmount, // Dynamic value function
                    ease: "none",
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: "top top",
                        end: () => `+=${sliderRef.current ? sliderRef.current.scrollWidth : 2000}`, // Dynamic end
                        pin: true,
                        scrub: 1,
                        invalidateOnRefresh: true, // Recalculate on resize
                    }
                });
            }
        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <div ref={containerRef} className="relative bg-stone-100 overflow-hidden">
            {/* Standard "Lookbook" Header inside the flow for Mobile, Pinned for Desktop */}
            <div className="absolute top-10 left-6 md:left-20 z-10 mix-blend-difference text-white pointer-events-none">
                <h2 className="text-sm font-bold tracking-widest uppercase mb-2">The Collections</h2>
            </div>

            {/* Inner Slider Container */}
            <div
                ref={sliderRef}
                className="flex flex-col md:flex-row h-auto md:h-screen w-full md:w-max"
            >
                {/* Intro/Title Slide for Horizontal Scroll */}
                <div className="hidden md:flex flex-col justify-center px-20 h-screen w-[40vw] bg-stone-50 border-r border-stone-200">
                    <h2 className="font-serif text-7xl leading-[0.9] text-stone-900 mb-8">
                        Designed <br />
                        <span className="italic text-stone-400">for Life.</span>
                    </h2>
                    <p className="max-w-xs text-stone-500 font-light leading-relaxed">
                        Explore our categorized edits. From the centerpiece dining table to the smallest sculptural object.
                    </p>
                    <div className="mt-12 flex gap-4 text-xs font-bold tracking-widest uppercase opacity-40">
                        <span>Drag</span>
                        <div className="w-12 h-[1px] bg-black self-center"></div>
                        <span>Scroll</span>
                    </div>
                </div>

                {/* Collection Items */}
                {collections.map((item, index) => {
                    const [, hash] = item.link.split('#');
                    const targetId = hash ? hash : undefined;

                    return (
                        <div
                            key={item.id}
                            className="group relative h-[80vh] md:h-screen w-full md:w-[60vw] lg:w-[45vw] flex-shrink-0 border-r border-stone-200 bg-white overflow-hidden"
                        >
                            {/* Image Container */}
                            <div className="absolute inset-0 overflow-hidden">
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="h-full w-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500" />
                            </div>

                            {/* Content Overlay */}
                            <div className="absolute bottom-0 left-0 w-full p-8 md:p-12">
                                <div className="flex items-end justify-between text-white">
                                    <div>
                                        <span className="block text-xs font-bold tracking-[0.3em] uppercase mb-4 opacity-80">
                                            0{index + 1} — {item.subtitle}
                                        </span>
                                        <h3 className="font-serif text-5xl md:text-6xl lg:text-7xl leading-none mb-6">
                                            {item.title}
                                        </h3>
                                        <Link
                                            to={item.link}
                                            state={targetId ? { target: targetId } : undefined}
                                            className="inline-flex items-center gap-3 text-sm uppercase tracking-widest border-b border-white/40 pb-1 hover:border-white transition-all transform hover:translate-x-2"
                                        >
                                            View Category <ArrowRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Mobile Footer text since Pinning doesn't happen */}
            <div className="md:hidden p-8 bg-stone-50 text-center">
                <p className="font-serif italic text-stone-400">Discover more in our full catalog.</p>
            </div>
        </div>
    );
};

export default CollectionLookbook;
