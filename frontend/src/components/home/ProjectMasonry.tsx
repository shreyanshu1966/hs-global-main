import { useRef, useLayoutEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, X } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const projects = [
    {
        image: "/gallery/Coffee Table/IMG-20250116-WA0066.webp",
        title: "Marble Coffee Table",
        stone: "Calacatta Gold",
        location: "Private Residence",
        span: "row-span-2",
    },
    {
        image: "/gallery/Wash Basins/IMG-20250116-WA0021.webp",
        title: "Sculpted Wash Basin",
        stone: "Statuario White",
        location: "Luxury Hotel Suite",
        span: "",
    },
    {
        image: "/gallery/Bowls/IMG-20250116-WA0312.webp",
        title: "Handcrafted Stone Bowl",
        stone: "Nero Marquina",
        location: "Designer Showcase",
        span: "",
    },
    {
        image: "/furniture/sculpture-stand.jpg",
        title: "Marble Sculpture Stand",
        stone: "Pink Onyx",
        location: "Art Gallery",
        span: "row-span-2",
    },
    {
        image: "/gallery/Vase/IMG-20250116-WA0331.webp",
        title: "Stone Vase Collection",
        stone: "Green Guatemala",
        location: "Boutique Hotel",
        span: "",
    },
    {
        image: "/gallery/Coffee Table/IMG-20250525-WA0046.webp",
        title: "Green Marble Table",
        stone: "Verde Alpi",
        location: "Penthouse Living Room",
        span: "",
    },
];

const ProjectMasonry = () => {
    const sectionRef = useRef<HTMLDivElement>(null);
    const [lightbox, setLightbox] = useState<number | null>(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            gsap.utils.toArray<HTMLElement>(".masonry-card").forEach((card, i) => {
                gsap.from(card, {
                    y: 60,
                    opacity: 0,
                    duration: 0.8,
                    delay: i * 0.07,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: card,
                        start: "top 90%",
                    },
                });
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <>
            <section ref={sectionRef} className="py-12 md:py-24 lg:py-34 bg-[#F7F5F0]">
                {/* Header */}
                <div className="max-w-7xl mx-auto px-4 md:px-6 mb-12 md:mb-16">
                    <div className="flex items-end justify-between">
                        <div>
                            <span className="block text-[11px] font-semibold tracking-[0.3em] uppercase text-[#C4A265] mb-4">
                                Our Work
                            </span>
                            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-[#1a1a1a] leading-tight !font-normal">
                                In Situ
                            </h2>
                        </div>

                        <Link
                            to="/gallery"
                            className="group inline-flex items-center gap-3 px-5 py-2.5 rounded-full font-semibold tracking-[0.15em] uppercase text-white bg-[#1a1a1a] shadow-lg hover:bg-[#333] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#8A8682] focus:ring-offset-2"
                            style={{ fontSize: "0.95rem", letterSpacing: "0.15em" }}
                        >
                            <span>View Gallery</span>
                            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5" />
                        </Link>
                    </div>
                </div>

                {/* Masonry Grid */}
                <div className="px-2 md:px-3 lg:px-4">

                    {/* Masonry Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 auto-rows-[180px] md:auto-rows-[220px] lg:auto-rows-[260px] gap-3 md:gap-4">
                        {projects.map((project, i) => (
                            <div
                                key={i}
                                className={`masonry-card group relative overflow-hidden cursor-pointer ${project.span}`}
                                onClick={() => setLightbox(i)}
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
                                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out bg-gradient-to-t from-black/80 to-transparent pt-12">
                                    <h4 className="font-serif text-base md:text-lg text-white mb-0.5 !font-normal">
                                        {project.title}
                                    </h4>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] uppercase tracking-[0.15em] text-[#C4A265]">
                                            {project.stone}
                                        </span>
                                        <span className="text-white/30">·</span>
                                        <span className="text-[10px] uppercase tracking-[0.15em] text-white/50">
                                            {project.location}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Lightbox */}
            {lightbox !== null && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 md:p-8"
                    onClick={() => setLightbox(null)}
                >
                    <button
                        className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors z-10"
                        onClick={() => setLightbox(null)}
                        aria-label="Close lightbox"
                    >
                        <X className="w-8 h-8" />
                    </button>

                    <div className="max-w-5xl max-h-[85vh] relative" onClick={(e) => e.stopPropagation()}>
                        <img
                            src={projects[lightbox].image}
                            alt={projects[lightbox].title}
                            className="max-w-full max-h-[85vh] object-contain"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                            <h3 className="font-serif text-xl md:text-2xl text-white mb-1  !font-normal">
                                {projects[lightbox].title}
                            </h3>
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-[#C4A265] tracking-[0.1em] uppercase">
                                    {projects[lightbox].stone}
                                </span>
                                <span className="text-white/30">·</span>
                                <span className="text-xs text-white/50 tracking-[0.1em] uppercase">
                                    {projects[lightbox].location}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ProjectMasonry;
