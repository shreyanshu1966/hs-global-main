import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import gsap from "gsap";

interface Slide {
    image: string;
    video?: string;
    tagline: string;
    heading: string[];
    cta: { label: string; to: string };
}

const slides: Slide[] = [
    {
        image: "/furniture/coffee-table.jpg",
        video: "/videos/Tables/Coffee%20Table/Panda%20White/video.mp4",
        tagline: "The Art of Living",
        heading: ["Sculpted in Stone.", "Crafted for Life."],
        cta: { label: "Explore Furniture", to: "/products?cat=furniture" },
    },
    {
        image: "/gallery/Wash Basins/IMG-20250525-WA0109.webp",
        tagline: "Bathroom Atelier",
        heading: ["Where Water", "Meets Marble."],
        cta: { label: "View Wash Basins", to: "/products?cat=furniture#pedestal" },
    },
    {
        image: "/gallery/Slabs/WhatsApp Image 2025-11-05 at 1.45.20 PM (1).webp",
        tagline: "Raw Materiality",
        heading: ["Rare Stones,", "Infinite Possibility."],
        cta: { label: "Browse Slabs", to: "/products?cat=slabs" },
    },
    {
        image: "/gallery/Coffee Table/IMG-20250525-WA0046.webp",
        tagline: "New Arrivals",
        heading: ["Timeless Tables,", "Modern Sensibility."],
        cta: { label: "Shop Collection", to: "/products?cat=furniture#coffee-table" },
    },
];

const HeroSlider = () => {
    const [active, setActive] = useState(0);
    const [prev, setPrev] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const heroRef = useRef<HTMLDivElement>(null);
    const textRefs = useRef<(HTMLDivElement | null)[]>([]);
    const imageRefs = useRef<(HTMLDivElement | null)[]>([]);
    const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    const animateSlide = useCallback(
        (index: number, prevIndex: number) => {
            if (isTransitioning) return;
            setIsTransitioning(true);

            // Fade out previous text
            const prevText = textRefs.current[prevIndex];
            if (prevText) {
                gsap.to(prevText.children, {
                    y: -40,
                    opacity: 0,
                    duration: 0.4,
                    stagger: 0.05,
                    ease: "power2.in",
                });
            }

            // Animate previous image out (Ken Burns reset)
            const prevImg = imageRefs.current[prevIndex];
            if (prevImg) {
                gsap.to(prevImg, { opacity: 0, duration: 0.8, ease: "power2.inOut" });
            }

            // Animate new image in with Ken Burns
            const newImg = imageRefs.current[index];
            if (newImg) {
                gsap.fromTo(
                    newImg,
                    { opacity: 0, scale: 1.1 },
                    { opacity: 1, scale: 1, duration: 1.2, ease: "power2.out" }
                );
                // Slow Ken Burns zoom
                gsap.to(newImg, {
                    scale: 1.08,
                    duration: 8,
                    ease: "none",
                    delay: 0.5,
                });
            }

            // Animate new text in
            const newText = textRefs.current[index];
            if (newText) {
                gsap.fromTo(
                    newText.children,
                    { y: 60, opacity: 0 },
                    {
                        y: 0,
                        opacity: 1,
                        duration: 0.8,
                        stagger: 0.12,
                        ease: "power3.out",
                        delay: 0.3,
                        onComplete: () => setIsTransitioning(false),
                    }
                );
            } else {
                setIsTransitioning(false);
            }
        },
        [isTransitioning]
    );

    const goTo = useCallback(
        (index: number) => {
            if (index === active || isTransitioning) return;
            setPrev(active);
            setActive(index);
            animateSlide(index, active);
        },
        [active, isTransitioning, animateSlide]
    );

    const next = useCallback(() => {
        goTo((active + 1) % slides.length);
    }, [active, goTo]);

    const prevSlide = useCallback(() => {
        goTo((active - 1 + slides.length) % slides.length);
    }, [active, goTo]);

    // Initial entrance animation
    useEffect(() => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        const firstImg = imageRefs.current[0];
        const firstText = textRefs.current[0];

        if (firstImg) {
            tl.fromTo(
                firstImg,
                { scale: 1.15, opacity: 0 },
                { scale: 1, opacity: 1, duration: 1.5 }
            );
            gsap.to(firstImg, { scale: 1.08, duration: 8, ease: "none", delay: 1 });
        }
        if (firstText) {
            tl.fromTo(
                firstText.children,
                { y: 80, opacity: 0 },
                { y: 0, opacity: 1, duration: 1, stagger: 0.15, delay: 0.2 },
                "-=1"
            );
        }
    }, []);

    // Autoplay
    useEffect(() => {
        autoplayRef.current = setInterval(next, 6000);
        return () => {
            if (autoplayRef.current) clearInterval(autoplayRef.current);
        };
    }, [next]);

    return (
        <section
            ref={heroRef}
            className="relative flex items-center justify-center overflow-hidden bg-[#0a0a0a]"
            style={{ minHeight: "100svh" }}
        >
            {/* Background Slides */}
            {slides.map((slide, i) => (
                <div
                    key={i}
                    ref={(el) => { imageRefs.current[i] = el; }}
                    className="absolute inset-0 w-full h-full"
                    style={{ opacity: i === 0 ? 1 : 0 }}
                >
                    <img
                        src={slide.image}
                        alt={slide.heading.join(" ")}
                        className="w-full h-full object-cover"
                    />
                </div>
            ))}

            {/* Video overlay for first slide (desktop only) */}
            {slides[0].video && active === 0 && (
                <video
                    ref={videoRef}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                    className="hidden lg:block absolute inset-0 w-full h-full object-cover z-[1]"
                >
                    <source src={slides[0].video} type="video/mp4" />
                </video>
            )}

            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-black/45 z-[2]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 z-[2]" />

            {/* Text Content */}
            <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 flex items-center" style={{ minHeight: "100svh" }}>
                {slides.map((slide, i) => (
                    <div
                        key={i}
                        ref={(el) => { textRefs.current[i] = el; }}
                        className={`absolute inset-0 flex flex-col justify-center px-6 md:px-12 ${i === active ? "pointer-events-auto" : "pointer-events-none"}`}
                        style={{ display: i === active || i === prev ? "flex" : "none" }}
                    >
                        {/* Tagline */}
                        <span className="block text-[11px] md:text-xs font-semibold tracking-[0.3em] uppercase text-white/50 mb-5 md:mb-6">
                            {slide.tagline}
                        </span>

                        {/* Heading */}
                        <h1 className="font-serif text-[clamp(2.5rem,7vw,6rem)] text-white leading-[1.05] tracking-tight mb-6 md:mb-8 !font-normal">
                            {slide.heading.map((line, j) => (
                                <span key={j} className={`block ${j > 0 ? "italic text-white/70" : ""}`}>
                                    {line}
                                </span>
                            ))}
                        </h1>

                        {/* CTA */}
                        <div>
                            <Link
                                to={slide.cta.to}
                                className="group inline-flex items-center gap-3 px-8 py-4 border border-white/30 text-white hover:bg-white hover:text-[#1a1a1a] transition-all duration-500"
                            >
                                <span className="text-sm font-semibold tracking-[0.15em] uppercase">
                                    {slide.cta.label}
                                </span>
                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {/* Navigation Arrows */}
            <div className="absolute bottom-8 right-6 md:right-12 z-20 flex items-center gap-3">
                <button
                    onClick={prevSlide}
                    className="w-11 h-11 flex items-center justify-center border border-white/25 text-white/60 hover:bg-white hover:text-[#1a1a1a] transition-all duration-300"
                    aria-label="Previous slide"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                    onClick={next}
                    className="w-11 h-11 flex items-center justify-center border border-white/25 text-white/60 hover:bg-white hover:text-[#1a1a1a] transition-all duration-300"
                    aria-label="Next slide"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            {/* Slide Indicators */}
            <div className="absolute bottom-8 left-6 md:left-12 z-20 flex items-center gap-3">
                {slides.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => goTo(i)}
                        className="relative h-[2px] bg-white/20 overflow-hidden transition-all duration-500"
                        style={{ width: i === active ? 48 : 20 }}
                        aria-label={`Go to slide ${i + 1}`}
                    >
                        {i === active && (
                            <div
                                className="absolute inset-0 bg-white"
                                style={{
                                    animation: "slideProgress 6s linear forwards",
                                }}
                            />
                        )}
                    </button>
                ))}
                <span className="text-[11px] text-white/40 tracking-wider ml-2 font-light">
                    {String(active + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
                </span>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 text-white/30 hidden md:flex">
                <span className="text-[10px] uppercase tracking-[0.3em] font-light">
                    Scroll
                </span>
                <div className="w-[1px] h-10 bg-gradient-to-b from-white/30 to-transparent animate-pulse" />
            </div>

            {/* CSS for progress animation */}
            <style>{`
        @keyframes slideProgress {
          from { transform: scaleX(0); transform-origin: left; }
          to { transform: scaleX(1); transform-origin: left; }
        }
      `}</style>
        </section>
    );
};

export default HeroSlider;
