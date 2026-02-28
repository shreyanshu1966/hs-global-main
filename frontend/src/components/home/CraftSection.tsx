import { useRef, useLayoutEffect, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface Stat {
    value: number;
    suffix: string;
    label: string;
}

const stats: Stat[] = [
    { value: 40, suffix: "+", label: "Hours Per Piece" },
    { value: 50, suffix: "", label: "Point Inspection" },
    { value: 100, suffix: "%", label: "Handcrafted" },
    { value: 30, suffix: "+", label: "Countries Served" },
];

const Counter = ({ value, suffix, started }: { value: number; suffix: string; started: boolean }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!started) return;
        let frame: number;
        const duration = 2000;
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * value));
            if (progress < 1) {
                frame = requestAnimationFrame(animate);
            }
        };
        frame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(frame);
    }, [started, value]);

    return (
        <span>
            {count}
            {suffix}
        </span>
    );
};

const CraftSection = () => {
    const sectionRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLDivElement>(null);
    const [countersStarted, setCountersStarted] = useState(false);

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
            gsap.from(".craft-el", {
                y: 50,
                opacity: 0,
                duration: 0.9,
                stagger: 0.15,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: ".craft-body",
                    start: "top 75%",
                },
            });

            // Trigger counters
            ScrollTrigger.create({
                trigger: ".craft-counters",
                start: "top 80%",
                onEnter: () => setCountersStarted(true),
                once: true,
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className="relative bg-[#1a1a1a] text-white overflow-hidden">
            <div className="grid lg:grid-cols-2 min-h-[85vh]">
                {/* Image Side */}
                <div className="relative h-[50vh] lg:h-auto overflow-hidden order-2 lg:order-1">
                    <div
                        ref={imageRef}
                        className="absolute inset-[-15%] w-[130%] h-[130%]"
                    >
                        <img
                            src="/services-custom-fabrication.png"
                            alt="Master craftsman hand-polishing marble surface"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    {/* Gradients */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#1a1a1a]/30 hidden lg:block" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#1a1a1a]/50 lg:hidden" />
                </div>

                {/* Content Side */}
                <div className="craft-body flex flex-col justify-center px-8 md:px-12 lg:px-16 xl:px-24 py-16 md:py-20 lg:py-28 order-1 lg:order-2">
                    <span className="craft-el text-[11px] font-semibold tracking-[0.3em] uppercase text-[#C4A265] mb-6">
                        The Atelier
                    </span>

                    <h2 className="craft-el font-serif text-4xl md:text-5xl lg:text-6xl leading-[1.05] mb-8 !font-normal">
                        From Quarry
                        <span className="block italic text-white/40 mt-1">to Home.</span>
                    </h2>

                    <p className="craft-el text-base md:text-lg text-white/50 font-light leading-relaxed mb-12 max-w-lg">
                        Every piece begins its journey millions of years ago. We honor
                        that heritage through time-honored sculpting techniques combined
                        with modern precision engineering — creating furniture that feels
                        both ancient and contemporary.
                    </p>

                    {/* Counters */}
                    <div className="craft-counters flex flex-wrap gap-8 md:gap-12 mb-12">
                        {stats.map((stat, i) => (
                            <div key={i} className="craft-el">
                                <span className="block font-serif text-3xl md:text-4xl text-white mb-1">
                                    <Counter value={stat.value} suffix={stat.suffix} started={countersStarted} />
                                </span>
                                <span className="text-[10px] uppercase tracking-[0.15em] text-white/35">
                                    {stat.label}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* CTA */}
                    <div className="craft-el">
                        <Link
                            to="/services"
                            className="group inline-flex items-center gap-3 px-8 py-4 border border-white/20 text-white hover:bg-white hover:text-[#1a1a1a] transition-all duration-500"
                        >
                            <span className="text-sm font-semibold tracking-[0.15em] uppercase">
                                Discover Our Process
                            </span>
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CraftSection;
