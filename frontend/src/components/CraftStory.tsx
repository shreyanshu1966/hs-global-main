import { useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const stats = [
    { value: "40+", label: "Hours Per Piece" },
    { value: "50", label: "Point Inspection" },
    { value: "100%", label: "Handcrafted" },
];

const CraftStory = () => {
    const sectionRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            // Parallax on image
            gsap.to(imageRef.current, {
                yPercent: 15,
                ease: "none",
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true,
                },
            });

            // Text reveal
            gsap.from(".craft-text", {
                y: 40,
                opacity: 0,
                duration: 0.8,
                stagger: 0.15,
                scrollTrigger: {
                    trigger: ".craft-content",
                    start: "top 75%",
                },
            });

            // Stats reveal
            gsap.from(".craft-stat", {
                y: 30,
                opacity: 0,
                duration: 0.6,
                stagger: 0.1,
                scrollTrigger: {
                    trigger: ".craft-stats",
                    start: "top 80%",
                },
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={sectionRef}
            className="relative bg-stone-900 text-white overflow-hidden"
        >
            <div className="grid lg:grid-cols-2 min-h-[80vh]">
                {/* Image Side */}
                <div className="relative h-[50vh] lg:h-auto overflow-hidden">
                    <div
                        ref={imageRef}
                        className="absolute inset-[-15%] w-[130%] h-[130%]"
                    >
                        <img
                            src="/services-custom-fabrication.png"
                            alt="Master craftsman hand-polishing marble"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    {/* Subtle gradient to text side */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-stone-900/20 hidden lg:block" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-stone-900/40 lg:hidden" />
                </div>

                {/* Content Side */}
                <div className="craft-content flex flex-col justify-center px-8 md:px-12 lg:px-16 xl:px-20 py-16 md:py-20 lg:py-24">
                    <span className="craft-text text-[11px] font-semibold tracking-[0.25em] uppercase text-white/40 mb-6">
                        The Atelier
                    </span>

                    <h2 className="craft-text font-serif text-4xl md:text-5xl lg:text-6xl leading-[1.05] mb-8">
                        From Quarry
                        <span className="block italic text-white/50 mt-1">
                            to Home.
                        </span>
                    </h2>

                    <p className="craft-text text-base md:text-lg text-white/60 font-light leading-relaxed mb-12 max-w-lg">
                        Every piece begins its journey millions of years ago.
                        We honor that history through traditional sculpting
                        techniques combined with modern precision
                        engineering — creating furniture that feels both
                        ancient and contemporary.
                    </p>

                    {/* Stats */}
                    <div className="craft-stats flex gap-10 md:gap-14">
                        {stats.map((stat, i) => (
                            <div key={i} className="craft-stat">
                                <span className="block font-serif text-3xl md:text-4xl text-white mb-1">
                                    {stat.value}
                                </span>
                                <span className="text-[10px] uppercase tracking-[0.15em] text-white/40">
                                    {stat.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CraftStory;
