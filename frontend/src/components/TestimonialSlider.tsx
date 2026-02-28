import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
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

const TestimonialSlider = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const cardRef = useRef<HTMLDivElement>(null);
    const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const animateIn = useCallback(() => {
        if (!cardRef.current) return;
        gsap.fromTo(
            cardRef.current,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
        );
    }, []);

    const goTo = useCallback(
        (index: number) => {
            if (!cardRef.current) return;
            gsap.to(cardRef.current, {
                opacity: 0,
                y: -15,
                duration: 0.3,
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

    const prev = useCallback(() => {
        goTo(
            (activeIndex - 1 + testimonials.length) % testimonials.length
        );
    }, [activeIndex, goTo]);

    // Auto-rotate
    useEffect(() => {
        autoplayRef.current = setInterval(next, 6000);
        return () => {
            if (autoplayRef.current) clearInterval(autoplayRef.current);
        };
    }, [next]);

    const current = testimonials[activeIndex];

    return (
        <section className="py-20 md:py-32 bg-[#FAFAF8]">
            <div className="max-w-4xl mx-auto px-6 md:px-12">
                {/* Header */}
                <div className="text-center mb-12 md:mb-16">
                    <span className="block text-[11px] font-semibold tracking-[0.25em] uppercase text-stone-400 mb-4">
                        Voices
                    </span>
                    <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-stone-900 leading-tight">
                        Trusted by{" "}
                        <span className="italic text-stone-400">
                            Visionaries
                        </span>
                    </h2>
                </div>

                {/* Testimonial Card */}
                <div
                    ref={cardRef}
                    className="relative bg-white border border-stone-200/60 p-8 md:p-12 lg:p-16 text-center"
                >
                    {/* Quote mark */}
                    <div className="absolute top-6 left-8 md:left-12 text-stone-200 font-serif text-7xl md:text-8xl leading-none select-none">
                        "
                    </div>

                    {/* Quote text */}
                    <blockquote className="relative z-10 font-serif text-xl md:text-2xl lg:text-3xl text-stone-800 leading-relaxed italic mb-8 md:mb-10 pt-6">
                        {current.quote}
                    </blockquote>

                    {/* Author */}
                    <div className="flex items-center justify-center gap-4">
                        <div className="w-11 h-11 rounded-full bg-stone-900 flex items-center justify-center text-white text-sm font-semibold tracking-wide">
                            {current.initials}
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-semibold text-stone-900">
                                {current.name}
                            </p>
                            <p className="text-xs text-stone-400">
                                {current.title}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-center gap-6 mt-8">
                    <button
                        onClick={prev}
                        className="p-2 border border-stone-300 text-stone-600 hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-all duration-300"
                        aria-label="Previous testimonial"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>

                    {/* Dots */}
                    <div className="flex gap-2">
                        {testimonials.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => goTo(i)}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${i === activeIndex
                                    ? "bg-stone-900 w-6"
                                    : "bg-stone-300 hover:bg-stone-400"
                                    }`}
                                aria-label={`Go to testimonial ${i + 1}`}
                            />
                        ))}
                    </div>

                    <button
                        onClick={next}
                        className="p-2 border border-stone-300 text-stone-600 hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-all duration-300"
                        aria-label="Next testimonial"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </section>
    );
};

export default TestimonialSlider;
