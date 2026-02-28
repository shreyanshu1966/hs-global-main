import { useState, useEffect, useCallback, useRef } from "react";
import gsap from "gsap";

const testimonials = [
    {
        quote:
            "HS Global Export made the entire process seamless. Great granite quality, perfect color match, and timely delivery. Truly professional service.",
        name: "Ramesh P.",
        title: "Prestige Constructions",
        initials: "RP",
    },
    {
        quote:
            "We sourced marble for a hotel lobby project and the finish was stunning. HS Global's polish and quality control were top-notch.",
        name: "Aisha Khan",
        title: "Interior Designer, Dubai",
        initials: "AK",
    },
    {
        quote:
            "Their granite reception desks and marble coffee tables became instant highlights. The export quality exceeded expectations.",
        name: "David Kim",
        title: "Hospitality Owner, Seoul",
        initials: "DK",
    },
    {
        quote:
            "The marble console table I ordered was absolutely beautiful. You can feel the craftsmanship and attention to detail in every inch.",
        name: "Neha Sharma",
        title: "Mumbai, IN",
        initials: "NS",
    },
    {
        quote:
            "I've worked with several suppliers, but HS Global stands out for reliability and transparency. Shipments are always consistent.",
        name: "Ali Rehman",
        title: "Stone Distributor, Oman",
        initials: "AR",
    },
];

const TestimonialEditorial = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const cardRef = useRef<HTMLDivElement>(null);
    const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const animateIn = useCallback(() => {
        if (!cardRef.current) return;
        gsap.fromTo(
            cardRef.current,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }
        );
    }, []);

    const goTo = useCallback(
        (index: number) => {
            if (!cardRef.current) return;
            gsap.to(cardRef.current, {
                opacity: 0,
                y: -20,
                duration: 0.4,
                ease: "power2.in",
                onComplete: () => {
                    setActiveIndex(index);
                    animateIn();
                },
            });
        },
        [animateIn]
    );

    const next = useCallback(() => {
        goTo((activeIndex + 1) % testimonials.length);
    }, [activeIndex, goTo]);

    // Auto-rotate
    useEffect(() => {
        autoplayRef.current = setInterval(next, 7000);
        return () => {
            if (autoplayRef.current) clearInterval(autoplayRef.current);
        };
    }, [next]);

    const current = testimonials[activeIndex];

    return (
        <section className="py-24 md:py-36 bg-white">
            <div className="max-w-5xl mx-auto px-6 md:px-12">
                {/* Header */}
                <div className="text-center mb-14 md:mb-20">
                    <span className="block text-[11px] font-semibold tracking-[0.3em] uppercase text-[#C4A265] mb-4">
                        Voices
                    </span>
                    <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-[#1a1a1a] leading-tight !font-normal">
                        Trusted by{" "}
                        <span className="italic text-[#8A8682]">Visionaries</span>
                    </h2>
                </div>

                {/* Testimonial Card */}
                <div
                    ref={cardRef}
                    className="relative text-center max-w-3xl mx-auto"
                >
                    {/* Large quote mark */}
                    <div className="font-serif text-[120px] md:text-[160px] leading-none text-[#E8E3DC] select-none absolute -top-10 md:-top-14 left-1/2 -translate-x-1/2">
                        "
                    </div>

                    {/* Quote text */}
                    <blockquote className="relative z-10 font-serif text-xl md:text-2xl lg:text-3xl text-[#1a1a1a] leading-relaxed italic mb-10 md:mb-12 pt-10 !font-normal">
                        {current.quote}
                    </blockquote>

                    {/* Author */}
                    <div className="flex items-center justify-center gap-4">
                        <div className="w-11 h-11 rounded-full bg-[#1a1a1a] flex items-center justify-center text-white text-sm font-semibold tracking-wider">
                            {current.initials}
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-semibold text-[#1a1a1a]">
                                {current.name}
                            </p>
                            <p className="text-xs text-[#8A8682]">{current.title}</p>
                        </div>
                    </div>
                </div>

                {/* Dots Navigation */}
                <div className="flex items-center justify-center gap-3 mt-12">
                    {testimonials.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => goTo(i)}
                            className={`h-[2px] transition-all duration-500 ${i === activeIndex
                                    ? "bg-[#1a1a1a] w-8"
                                    : "bg-[#E8E3DC] w-4 hover:bg-[#8A8682]"
                                }`}
                            aria-label={`Go to testimonial ${i + 1}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TestimonialEditorial;
