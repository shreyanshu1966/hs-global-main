import { useRef, useLayoutEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const SignatureSpotlight = () => {
    const sectionRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            // Parallax on image
            gsap.to(imageRef.current, {
                yPercent: 12,
                ease: "none",
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true,
                },
            });

            // Text reveal
            gsap.from(".spotlight-text", {
                y: 50,
                opacity: 0,
                duration: 0.9,
                stagger: 0.15,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: ".spotlight-content",
                    start: "top 75%",
                },
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className="bg-[#F7F5F0]">
            <div className="grid lg:grid-cols-2 min-h-[80vh]">
                {/* Image Side */}
                <div className="relative h-[55vh] lg:h-auto overflow-hidden">
                    <div
                        ref={imageRef}
                        className="absolute inset-[-15%] w-[130%] h-[130%]"
                    >
                        <img
                            src="/gallery/Coffee Table/IMG-20250525-WA0088.webp"
                            alt="Signature marble coffee table in a luxury living room"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    {/* Subtle gradient */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#F7F5F0]/30 hidden lg:block" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#F7F5F0]/30 lg:hidden" />
                </div>

                {/* Content Side */}
                <div className="spotlight-content flex flex-col justify-center px-8 md:px-12 lg:px-16 xl:px-24 py-16 md:py-20 lg:py-28">
                    <span className="spotlight-text text-[11px] font-semibold tracking-[0.3em] uppercase text-[#C4A265] mb-6">
                        Signature Piece
                    </span>

                    <h2 className="spotlight-text font-serif text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-[#1a1a1a] leading-[1.08] mb-8 !font-normal">
                        A Masterpiece of
                        <span className="block italic text-[#8A8682] mt-1">
                            Natural Elegance
                        </span>
                    </h2>

                    <p className="spotlight-text text-base md:text-lg text-[#8A8682] font-light leading-relaxed mb-8 max-w-lg">
                        Each marble coffee table is sculpted from a single block of rare
                        Italian Calacatta marble. Over 40 hours of handcrafting go into
                        every piece — from quarry selection to the final hand-polish that
                        brings the stone's natural veining to life.
                    </p>

                    <div className="spotlight-text flex items-center gap-8 mb-10">
                        <div>
                            <span className="block font-serif text-3xl md:text-4xl text-[#1a1a1a]">
                                40+
                            </span>
                            <span className="text-[10px] uppercase tracking-[0.15em] text-[#8A8682]">
                                Hours of Craft
                            </span>
                        </div>
                        <div className="w-[1px] h-12 bg-[#E8E3DC]" />
                        <div>
                            <span className="block font-serif text-3xl md:text-4xl text-[#1a1a1a]">
                                28
                            </span>
                            <span className="text-[10px] uppercase tracking-[0.15em] text-[#8A8682]">
                                Stone Varieties
                            </span>
                        </div>
                        <div className="w-[1px] h-12 bg-[#E8E3DC]" />
                        <div>
                            <span className="block font-serif text-3xl md:text-4xl text-[#1a1a1a]">
                                ∞
                            </span>
                            <span className="text-[10px] uppercase tracking-[0.15em] text-[#8A8682]">
                                Possibilities
                            </span>
                        </div>
                    </div>

                    <div className="spotlight-text">
                        <Link
                            to="/products?cat=furniture#coffee-table"
                            state={{ target: "coffee-table" }}
                            className="group inline-flex items-center gap-3 px-8 py-4 bg-[#1a1a1a] text-white hover:bg-[#C4A265] transition-all duration-500"
                        >
                            <span className="text-sm font-semibold tracking-[0.15em] uppercase">
                                Discover Collection
                            </span>
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SignatureSpotlight;
