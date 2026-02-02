import { useRef, useLayoutEffect } from "react";
import { ArrowRight, ArrowDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const HeroFurniture = () => {
    const navigate = useNavigate();
    const component = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const subtitleRef = useRef<HTMLParagraphElement>(null);
    const ctaRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline();

            // Initial Reveal
            tl.from(imageRef.current, {
                scale: 1.2,
                duration: 2,
                ease: "power3.out",
            })
                .from(titleRef.current, {
                    y: 100,
                    opacity: 0,
                    duration: 1.2,
                    ease: "power4.out",
                }, "-=1.5")
                .from(subtitleRef.current, {
                    y: 50,
                    opacity: 0,
                    duration: 1,
                    ease: "power3.out",
                }, "-=1")
                .from(ctaRef.current, {
                    y: 30,
                    opacity: 0,
                    duration: 0.8,
                    ease: "back.out(1.7)",
                }, "-=0.8");

            // Parallax on Scroll
            gsap.to(imageRef.current, {
                yPercent: 20,
                ease: "none",
                scrollTrigger: {
                    trigger: component.current,
                    start: "top top",
                    end: "bottom top",
                    scrub: true,
                },
            });

        }, component);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={component} className="relative h-screen w-full overflow-hidden bg-stone-900 text-white">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <img
                    ref={imageRef}
                    src="/furniture/hero-dining.jpg"
                    alt="Luxury Marble Dining Table"
                    className="h-full w-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80" />
            </div>

            {/* Content Container */}
            <div className="relative z-10 flex h-full flex-col justify-end pb-20 px-6 md:px-20 lg:pb-32 container mx-auto">

                {/* Brand/Collection Tag */}
                <div className="mb-6 overflow-hidden">
                    <span className="inline-block border border-white/30 bg-white/10 px-4 py-1 backdrop-blur-md text-xs font-medium tracking-[0.2em] uppercase text-white/90">
                        2025 Collection
                    </span>
                </div>

                {/* Main Title */}
                <div className="overflow-hidden">
                    <h1
                        ref={titleRef}
                        className="font-serif text-5xl md:text-7xl lg:text-9xl leading-[0.9] tracking-tighter mb-6"
                    >
                        Sculpted <br className="md:hidden" />
                        <span className="italic font-light text-white/80">Living.</span>
                    </h1>
                </div>

                {/* Subtitle & CTA Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
                    <div className="md:col-span-5 lg:col-span-4">
                        <p
                            ref={subtitleRef}
                            className="text-lg md:text-xl text-stone-300 font-light leading-relaxed"
                        >
                            Transform your space with furniture carved from the earth itself.
                            Minimalist forms meeting maximalist stone.
                        </p>
                    </div>

                    <div
                        ref={ctaRef}
                        className="md:col-span-7 lg:col-span-8 flex flex-col md:flex-row gap-6 md:justify-end items-start md:items-center"
                    >
                        <button
                            onClick={() => navigate("/products?category=dining")}
                            className="group relative flex items-center gap-4 px-8 py-4 bg-white text-black overflow-hidden transition-all hover:bg-stone-200"
                        >
                            <span className="relative z-10 text-sm font-medium tracking-widest uppercase">
                                View Collection
                            </span>
                            <ArrowRight className="relative z-10 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                        </button>

                        <button
                            onClick={() => document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' })}
                            className="flex items-center gap-3 text-sm font-medium tracking-widest uppercase text-white/70 hover:text-white transition-colors"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/5 backdrop-blur-sm">
                                <ArrowDown className="h-4 w-4 animate-bounce" />
                            </div>
                            <span>Scroll</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeroFurniture;
