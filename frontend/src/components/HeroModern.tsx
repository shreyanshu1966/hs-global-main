import { useRef, useLayoutEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const HeroModern = () => {
    const heroRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

            // Entrance animations
            tl.from(textRef.current, {
                y: 100,
                opacity: 0,
                duration: 1.2,
                delay: 0.3
            })
                .from(imageRef.current, {
                    scale: 1.2,
                    opacity: 0,
                    duration: 1.5,
                }, "-=0.8");

            // Parallax effect on scroll
            gsap.to(imageRef.current, {
                yPercent: 20,
                ease: "none",
                scrollTrigger: {
                    trigger: heroRef.current,
                    start: "top top",
                    end: "bottom top",
                    scrub: true
                }
            });
        }, heroRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={heroRef}
            className="relative min-h-[90vh] md:min-h-screen flex items-center overflow-hidden bg-stone-50 pt-20 md:pt-24"
        >
            {/* Background Image */}
            <div
                ref={imageRef}
                className="absolute inset-0 z-0"
            >
                <img
                    src="/furniture/hero-dining.jpg"
                    alt="Luxury Marble Furniture"
                    className="w-full h-full object-cover"
                />
                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <div
                    ref={textRef}
                    className="max-w-3xl"
                >


                    {/* Main Heading */}
                    <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-white mb-6 md:mb-8 leading-[1.1]">
                        <span className="block">Best Marble Furniture</span>
                        <span className="block">Manufacturer, Supplier</span>
                        <span className="block text-white/90">& Exporter</span>
                        <span className="block text-amber-400">Worldwide</span>
                    </h1>

                    {/* Subheading */}
                    <p className="text-lg md:text-xl text-white/90 font-light leading-relaxed mb-8 md:mb-12 max-w-2xl">
                        Transform your space with handcrafted marble furniture. Each piece is a unique masterpiece,
                        carved from premium natural stone to elevate your interior design.
                    </p>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link
                            to="/products?cat=furniture"
                            className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-stone-900 hover:bg-amber-600 hover:text-white transition-all duration-300"
                        >
                            <span className="text-sm md:text-base font-bold tracking-wide">
                                Explore Furniture
                            </span>
                            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                        </Link>

                        <Link
                            to="/products?cat=slabs"
                            className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-transparent border-2 border-white text-white hover:bg-white hover:text-stone-900 transition-all duration-300"
                        >
                            <span className="text-sm md:text-base font-bold tracking-wide">
                                Browse Slabs
                            </span>
                            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </div>

                    {/* Trust Indicators */}
                    <div className="mt-12 md:mt-16 flex flex-wrap items-center gap-8 text-white/80">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-[1px] bg-white/40" />
                            <div>
                                <p className="text-2xl md:text-3xl font-serif font-bold text-white">500+</p>
                                <p className="text-xs uppercase tracking-wider">Products</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-[1px] bg-white/40" />
                            <div>
                                <p className="text-2xl md:text-3xl font-serif font-bold text-white">100%</p>
                                <p className="text-xs uppercase tracking-wider">Handcrafted</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-[1px] bg-white/40" />
                            <div>
                                <p className="text-2xl md:text-3xl font-serif font-bold text-white">Premium</p>
                                <p className="text-xs uppercase tracking-wider">Quality</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 text-white/60 animate-bounce">
                <span className="text-xs uppercase tracking-[0.2em]">Scroll</span>
                <div className="w-[1px] h-12 bg-gradient-to-b from-white/60 to-transparent" />
            </div>
        </section>
    );
};

export default HeroModern;
