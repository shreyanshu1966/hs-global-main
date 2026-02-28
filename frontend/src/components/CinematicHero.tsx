import { useRef, useLayoutEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import gsap from "gsap";

const CinematicHero = () => {
    const heroRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [videoLoaded, setVideoLoaded] = useState(false);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

            // Entrance animations
            tl.from(".hero-line", {
                y: 80,
                opacity: 0,
                duration: 1,
                stagger: 0.15,
                delay: 0.4,
            })
                .from(
                    ".hero-sub",
                    {
                        y: 30,
                        opacity: 0,
                        duration: 0.8,
                    },
                    "-=0.4"
                )
                .from(
                    ".hero-cta",
                    {
                        y: 20,
                        opacity: 0,
                        duration: 0.6,
                        stagger: 0.1,
                    },
                    "-=0.4"
                )
                .from(
                    ".hero-scroll",
                    {
                        opacity: 0,
                        duration: 0.6,
                    },
                    "-=0.2"
                );
        }, heroRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={heroRef}
            className="relative flex items-center justify-center overflow-hidden bg-stone-950"
            style={{ minHeight: "100svh" }}
        >
            {/* Background Video with Fallback Image */}
            <div className="absolute inset-0 z-0">
                {/* Fallback Image (always rendered) */}
                <img
                    src="/furniture/hero-cinematic.png"
                    alt="Luxury marble furniture"
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${videoLoaded ? "opacity-0" : "opacity-100"
                        }`}
                />

                {/* Video (desktop only) */}
                <video
                    ref={videoRef}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                    onLoadedData={() => setVideoLoaded(true)}
                    className={`hidden md:block absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${videoLoaded ? "opacity-100" : "opacity-0"
                        }`}
                >
                    <source
                        src="/videos/Tables/Coffee%20Table/Panda%20White/video.mp4"
                        type="video/mp4"
                    />
                </video>

                {/* Gradient Overlays */}
                <div
                    ref={overlayRef}
                    className="absolute inset-0 bg-black/50"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
            </div>

            {/* Content — Centered */}
            <div className="relative z-10 text-center px-6 md:px-12 max-w-5xl mx-auto">
                <div ref={textRef}>
                    {/* Main Heading */}
                    <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl text-white mb-6 md:mb-8 leading-[1.05] tracking-tight">
                        <span className="hero-line block">Where Stone</span>
                        <span className="hero-line block italic text-white/80">
                            Becomes Art
                        </span>
                    </h1>

                    {/* Subheading */}
                    <p className="hero-sub text-base sm:text-lg md:text-xl text-white/70 font-light leading-relaxed mb-10 md:mb-14 max-w-2xl mx-auto">
                        Handcrafted marble furniture, sculpted from the
                        world's finest natural stone. Each piece — a timeless
                        masterpiece.
                    </p>

                    {/* CTAs — Ghost Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            to="/products?cat=furniture"
                            className="hero-cta group inline-flex items-center justify-center gap-3 px-8 py-4 border border-white/40 text-white hover:bg-white hover:text-stone-900 transition-all duration-500 min-w-[220px]"
                        >
                            <span className="text-sm font-semibold tracking-[0.15em] uppercase">
                                Explore Furniture
                            </span>
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </Link>

                        <Link
                            to="/products?cat=slabs"
                            className="hero-cta group inline-flex items-center justify-center gap-3 px-8 py-4 border border-white/20 text-white/80 hover:border-white/60 hover:text-white transition-all duration-500 min-w-[220px]"
                        >
                            <span className="text-sm font-semibold tracking-[0.15em] uppercase">
                                View Slabs
                            </span>
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="hero-scroll absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40">
                <span className="text-[10px] uppercase tracking-[0.3em] font-light">
                    Scroll
                </span>
                <div className="w-[1px] h-10 bg-gradient-to-b from-white/40 to-transparent animate-pulse" />
            </div>
        </section>
    );
};

export default CinematicHero;
