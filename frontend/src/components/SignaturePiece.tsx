import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ArrowUpRight, Plus } from "lucide-react";

// Placeholder image
const FEATURED_IMAGE = "/furniture/sculpture-stand.jpg";

interface Annotation {
    id: number;
    x: number;
    y: number;
    label: string;
    text: string;
}

const annotations: Annotation[] = [
    { id: 1, x: 30, y: 20, label: "Solid Block", text: "Carved from a single cubic meter of Calacatta Viola." },
    { id: 2, x: 70, y: 50, label: "Honed Finish", text: "Matte surface treatment that is soft to the touch." },
    { id: 3, x: 40, y: 80, label: "Fluted Base", text: "Hand-routed channeling for vertical rhythm." },
];

const SignaturePiece: React.FC = () => {
    const navigate = useNavigate();
    const container = useRef<HTMLElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);

    // State for active annotation
    const [activeAnnotation, setActiveAnnotation] = useState<number | null>(null);

    useGSAP(() => {
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: container.current,
                start: "top 70%",
                toggleActions: "play none none reverse",
            }
        });

        tl.from(".reveal-text", {
            y: 50,
            opacity: 0,
            duration: 1,
            stagger: 0.1,
            ease: "power3.out"
        })
            .from(".reveal-image", {
                clipPath: "inset(100% 0 0 0)",
                duration: 1.5,
                ease: "power4.out"
            }, "-=0.8")
            .from(".annotation-dot", {
                scale: 0,
                opacity: 0,
                duration: 0.5,
                stagger: 0.2,
                ease: "back.out(1.7)"
            }, "-=0.5");

    }, { scope: container });

    return (
        <section ref={container} className="py-24 md:py-40 bg-[#0A0A0A] text-white overflow-hidden">
            <div className="container mx-auto px-6 md:px-12">

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">

                    {/* Text Side - More whitespace */}
                    <div className="order-2 lg:order-1 lg:col-span-5">
                        <div className="mb-12">
                            <span className="reveal-text text-accent text-xs font-bold tracking-[0.2em] uppercase mb-4 block">
                                Limited Edition — 001
                            </span>

                            <h2 className="reveal-text font-serif text-6xl md:text-8xl lg:text-9xl leading-[0.85] tracking-tighter mb-8 text-white">
                                The <br />
                                <span className="text-stone-600 italic">Monolith.</span>
                            </h2>

                            <p className="reveal-text text-stone-400 font-light text-lg md:text-xl leading-relaxed max-w-sm">
                                A contradiction in form. Massive weight appears to float. Ancient stone takes on modern geometry.
                            </p>
                        </div>

                        <div className="reveal-text space-y-px bg-white/10 mb-12">
                            {/* Stylish Data Table */}
                            {[
                                { label: "Material", value: "Calacatta Viola" },
                                { label: "Weight", value: "850 kg" },
                                { label: "Origin", value: "Tuscany, Italy" }
                            ].map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center py-6 bg-[#0A0A0A] border-b border-white/10 group hover:pl-4 transition-all duration-300">
                                    <span className="uppercase text-xs tracking-widest text-stone-500">{item.label}</span>
                                    <span className="font-serif text-xl">{item.value}</span>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => navigate('/products/signature')}
                            className="reveal-text w-full md:w-auto text-center md:text-left group relative inline-flex items-center justify-center gap-4 px-10 py-5 bg-white text-black overflow-hidden hover:bg-stone-200 transition-colors"
                        >
                            <span className="uppercase tracking-widest text-xs font-bold z-10">Acquire Piece</span>
                            <ArrowUpRight className="w-4 h-4 z-10 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    {/* Image Side with Annotations */}
                    <div className="reveal-image order-1 lg:order-2 lg:col-span-7 relative h-[60vh] md:h-[80vh] w-full">
                        <div className="relative w-full h-full overflow-hidden bg-stone-900">
                            <img
                                ref={imgRef}
                                src={FEATURED_IMAGE}
                                alt="Signature Piece"
                                className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-[2s] ease-out"
                            />
                            {/* Cinematic Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent opacity-60"></div>
                        </div>

                        {/* Annotations */}
                        {annotations.map((ann) => (
                            <div
                                key={ann.id}
                                className="annotation-dot absolute z-20"
                                style={{ top: `${ann.y}%`, left: `${ann.x}%` }}
                            >
                                <button
                                    onClick={() => setActiveAnnotation(activeAnnotation === ann.id ? null : ann.id)}
                                    className={`
                                        relative group/btn flex items-center justify-center w-6 h-6 rounded-full
                                        transition-all duration-300
                                    `}
                                >
                                    <span className={`absolute inset-0 rounded-full bg-white/30 animate-ping group-hover/btn:animate-none ${activeAnnotation === ann.id ? 'animate-none opacity-0' : ''}`} />
                                    <span className={`relative w-3 h-3 bg-white rounded-full transition-all duration-300 ${activeAnnotation === ann.id ? 'w-8 h-8 flex items-center justify-center bg-white text-black' : ''}`}>
                                        {activeAnnotation === ann.id && <Plus className="w-4 h-4 rotate-45" />}
                                    </span>
                                </button>

                                {/* Tooltip / Reveal Card */}
                                <div className={`
                                    absolute top-8 left-1/2 -translate-x-1/2 w-64 bg-black/80 backdrop-blur-xl border border-white/10 p-6
                                    transform transition-all duration-500 origin-top z-30
                                    ${activeAnnotation === ann.id ? 'scale-100 opacity-100 translate-y-4' : 'scale-90 opacity-0 translate-y-0 pointer-events-none'}
                                `}>
                                    <div className="mb-2 text-xs font-bold tracking-widest uppercase text-accent border-b border-white/10 pb-2">{ann.label}</div>
                                    <p className="text-sm font-light text-stone-300 leading-relaxed">
                                        {ann.text}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </section>
    );
};

export default SignaturePiece;
