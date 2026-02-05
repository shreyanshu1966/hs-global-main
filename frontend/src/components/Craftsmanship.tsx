import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const Craftsmanship = () => {
    const container = useRef<HTMLElement>(null);
    const imageRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: container.current,
                start: "top 60%",
                toggleActions: "play none none reverse"
            }
        });

        tl.from(imageRef.current, {
            clipPath: "inset(0 100% 0 0)",
            duration: 1.5,
            ease: "power4.out"
        })
            .from(contentRef.current, {
                y: 50,
                opacity: 0,
                duration: 1,
                ease: "power3.out"
            }, "-=1");

    }, { scope: container });

    return (
        <section ref={container} className="py-24 md:py-40 bg-[#F5F5F0] text-primary overflow-hidden">
            <div className="container mx-auto px-6 md:px-12">

                {/* Header */}
                <div className="mb-16 md:mb-24 flex flex-col md:flex-row justify-between items-end border-b border-black/5 pb-6">
                    <span className="text-xs font-bold tracking-[0.2em] uppercase text-stone-500">
                        03 — Process & Material
                    </span>
                    <span className="hidden md:block text-xs font-serif italic text-stone-400">
                        From Earth to Art
                    </span>
                </div>

                {/* Split Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start">

                    {/* Visual Side */}
                    <div ref={imageRef} className="relative aspect-[4/5] md:aspect-square lg:aspect-[3/4] overflow-hidden bg-stone-300">
                        <img
                            src="/furniture/craftsmanship.jpg"
                            alt="Raw Marble Block being sculpted"
                            className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000 ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                        <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur px-6 py-4 border border-white/20">
                            <div className="text-[10px] uppercase tracking-widest text-stone-500 mb-1">Source</div>
                            <span className="font-serif text-lg text-primary">Carrara, Italy</span>
                        </div>
                    </div>

                    {/* Content Side */}
                    <div ref={contentRef} className="flex flex-col pt-12 lg:pt-0">
                        <h2 className="font-serif text-5xl md:text-6xl lg:text-7xl leading-[0.95] mb-8 lg:mb-12">
                            We don't build. <br />
                            <span className="italic text-stone-500">We reveal.</span>
                        </h2>

                        <div className="space-y-6 text-stone-600 font-light text-lg leading-relaxed mb-12 max-w-lg">
                            <p>
                                Every piece begins as a massive, rough-hewn block in the quarries of Italy, Turkey, or India.
                            </p>
                            <p>
                                Our masters do not add material; they subtract it. Using a combination of 7-axis CNC milling and hand-finishing, we grind away the excess until only the essential form remains.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-8 mb-12 border-t border-black/5 pt-8">
                            <div>
                                <span className="block text-4xl font-serif text-primary mb-1">300+</span>
                                <span className="text-xs uppercase tracking-widest text-stone-500">Hours of Polishing</span>
                            </div>
                            <div>
                                <span className="block text-4xl font-serif text-primary mb-1">100%</span>
                                <span className="text-xs uppercase tracking-widest text-stone-500">Solid Stone</span>
                            </div>
                        </div>

                        <button className="group flex items-center gap-3 text-primary font-medium tracking-widest uppercase text-sm w-fit border-b border-black pb-1 hover:text-stone-500 hover:border-stone-500 transition-colors">
                            Read The Story <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                        </button>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default Craftsmanship;
