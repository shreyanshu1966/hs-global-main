import { useRef, useLayoutEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const projects = [
    {
        image: "/gallery/Coffee Table/IMG-20250116-WA0066.webp",
        title: "Marble Coffee Table",
        location: "Private Residence",
        span: "row-span-2", // tall
    },
    {
        image: "/gallery/Wash Basins/IMG-20250116-WA0021.webp",
        title: "Marble Wash Basin",
        location: "Luxury Hotel Suite",
        span: "",
    },
    {
        image: "/gallery/Bowls/IMG-20250116-WA0312.webp",
        title: "Handcrafted Stone Bowl",
        location: "Designer Showcase",
        span: "",
    },
    {
        image: "/furniture/sculpture-stand.jpg",
        title: "Marble Sculpture",
        location: "Art Gallery",
        span: "row-span-2", // tall
    },
    {
        image: "/gallery/Vase/IMG-20250116-WA0331.webp",
        title: "Stone Vase Collection",
        location: "Boutique Hotel",
        span: "",
    },
    {
        image: "/gallery/Coffee Table/IMG-20250525-WA0046.webp",
        title: "Green Marble Table",
        location: "Penthouse Living Room",
        span: "",
    },
];

const ProjectShowcase = () => {
    const sectionRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            gsap.utils.toArray<HTMLElement>(".project-card").forEach((card, i) => {
                gsap.from(card, {
                    y: 50,
                    opacity: 0,
                    duration: 0.7,
                    delay: i * 0.08,
                    scrollTrigger: {
                        trigger: card,
                        start: "top 88%",
                    },
                });
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={sectionRef}
            className="py-20 md:py-32 lg:py-40 bg-white"
        >
            <div className="max-w-7xl mx-auto px-6 md:px-12">
                {/* Header */}
                <div className="flex items-end justify-between mb-12 md:mb-16">
                    <div>
                        <span className="block text-[11px] font-semibold tracking-[0.25em] uppercase text-stone-400 mb-4">
                            Our Work
                        </span>
                        <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-stone-900 leading-tight">
                            In Situ
                        </h2>
                    </div>

                    <Link
                        to="/gallery"
                        className="group inline-flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors duration-300"
                    >
                        <span className="text-xs font-semibold tracking-[0.15em] uppercase">
                            View Gallery
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>

                {/* Masonry Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 auto-rows-[200px] md:auto-rows-[250px] lg:auto-rows-[280px] gap-3 md:gap-4">
                    {projects.map((project, i) => (
                        <div
                            key={i}
                            className={`project-card group relative overflow-hidden bg-stone-100 cursor-pointer ${project.span}`}
                        >
                            <img
                                src={project.image}
                                alt={project.title}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                loading="lazy"
                            />

                            {/* Hover overlay */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-500" />

                            {/* Caption — shows on hover */}
                            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
                                <h4 className="font-serif text-base md:text-lg text-white mb-0.5">
                                    {project.title}
                                </h4>
                                <span className="text-[10px] uppercase tracking-[0.15em] text-white/60">
                                    {project.location}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ProjectShowcase;
