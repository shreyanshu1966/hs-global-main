import { useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const HeroMonolith = () => {
    const component = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLHeadingElement>(null);
    const subRef = useRef<HTMLDivElement>(null);
    const lineRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline();

            tl.from(textRef.current, {
                y: 100,
                opacity: 0,
                duration: 1.5,
                ease: "power4.out",
                delay: 0.5
            })
                .from(subRef.current, {
                    y: 20,
                    opacity: 0,
                    duration: 1,
                    ease: "power2.out"
                }, "-=1")
                .from(lineRef.current, {
                    height: 0,
                    duration: 1.5,
                    ease: "power3.inOut"
                }, "-=0.5");

            // Parallax background
            gsap.to(".hero-bg", {
                yPercent: 30,
                ease: "none",
                scrollTrigger: {
                    trigger: component.current,
                    start: "top top",
                    end: "bottom top",
                    scrub: true
                }
            });

        }, component);
        return () => ctx.revert();
    }, []);

    return (
        <section ref={component} className="relative h-[100dvh] w-full overflow-hidden bg-stone-950 text-stone-100 flex flex-col justify-center items-center">
            {/* Background */}
            <div className="hero-bg absolute inset-0 z-0 opacity-70">
                <img
                    src="/furniture/hero-dining.jpg"
                    alt="Marble Texture"
                    className="w-full h-full object-cover object-center grayscale-[20%] contrast-110 scale-105"
                />
            </div>

            {/* Gradient Overlay for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-stone-950/40 via-transparent to-stone-950/90 z-0 pointer-events-none" />

            {/* Main Content */}
            <div className="relative z-10 text-center px-4 md:px-6 max-w-7xl mx-auto mix-blend-lighten">
                <div ref={subRef} className="flex items-center justify-center gap-4 mb-6 md:mb-10">
                    <div className="h-[1px] w-8 md:w-16 bg-white/60"></div>
                    <p className="text-xs md:text-sm font-medium tracking-[0.4em] uppercase text-stone-200">
                        Est. 2025 • Italy
                    </p>
                    <div className="h-[1px] w-8 md:w-16 bg-white/60"></div>
                </div>

                <h1 ref={textRef} className="font-serif text-[15vw] md:text-[10vw] lg:text-[8vw] leading-[0.8] tracking-tighter text-white/90 drop-shadow-2xl">
                    STONE <br className="md:hidden" />
                    <span className="italic font-light text-white/70">&</span> SOUL
                </h1>
            </div>

            {/* Bottom Scroll Indicator */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 pb-8 z-10 mix-blend-screen">
                <span className="text-[10px] uppercase tracking-[0.2em] opacity-80">Scroll to Discover</span>
                <div ref={lineRef} className="w-[1px] h-16 md:h-24 bg-gradient-to-b from-white to-transparent" />
            </div>
        </section>
    );
};

export default HeroMonolith;
