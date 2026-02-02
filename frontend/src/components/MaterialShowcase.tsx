import { useState, useRef, useEffect } from "react";
import { ArrowUpRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Material {
    id: string;
    name: string;
    origin: string;
    description: string;
    rawImage: string; // The "rough" or background texture
    polishedImage: string; // The "revealed" texture
}

// Sample Data - In a real app, these would be your specific stone textures
const materials: Material[] = [
    {
        id: "viola",
        name: "Calacatta Viola",
        origin: "Italy",
        description: "Known as the Queen of Marbles. Dramatic burgundy veining against a creamy white background.",
        rawImage: "/materials/viola_raw.jpg", // Needs placeholder if not exists, falling back to a color/texture
        polishedImage: "/furniture/sculpture-stand.jpg",
    },
    {
        id: "nero",
        name: "Nero Marquina",
        origin: "Spain",
        description: "Deep, velvety black stone with contrasting white lightning veins. A study in monochrome.",
        rawImage: "/materials/nero_raw.jpg",
        polishedImage: "/furniture/dining-table.jpg",
    },
    {
        id: "travertine",
        name: "Roman Travertine",
        origin: "Italy",
        description: "Earthy, beige tones with natural pitting. The stone of the Colosseum.",
        rawImage: "/materials/trav_raw.jpg",
        polishedImage: "/furniture/console.jpg",
    },
    {
        id: "verde",
        name: "Verde Guatemala",
        origin: "India",
        description: "An intense emerald green that captures the essence of a rainforest.",
        rawImage: "/materials/verde_raw.jpg",
        polishedImage: "/furniture/coffee-table.jpg",
    },
];

const MaterialShowcase = () => {
    const [activeMaterial, setActiveMaterial] = useState(materials[0]);
    const containerRef = useRef<HTMLDivElement>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    // Handle Mouse Move for the "Lens" effect
    const handleMouseMove = (e: React.MouseEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        setMousePos({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    };

    return (
        <section className="py-24 bg-stone-900 text-white overflow-hidden relative" id="material-library">
            <div className="container mx-auto px-6 md:px-12 grid lg:grid-cols-12 gap-12 items-center">

                {/* Left: Content & List */}
                <div className="lg:col-span-5 flex flex-col justify-center z-10">
                    <span className="text-xs font-bold tracking-[0.2em] uppercase text-stone-500 mb-6 block">
                        The Stone Library
                    </span>
                    <h2 className="font-serif text-5xl md:text-6xl mb-8 leading-[0.9]">
                        Raw <br /> <span className="italic text-stone-400">Materiality.</span>
                    </h2>

                    <p className="text-stone-400 font-light mb-12 text-lg leading-relaxed">
                        We don't just pick colors; we select blocks. Explore our curated library of primary stones, sourced directly from the finest quarries in Italy, Spain, and India.
                    </p>

                    <div className="flex flex-col gap-2">
                        {materials.map((mat) => (
                            <div
                                key={mat.id}
                                onMouseEnter={() => setActiveMaterial(mat)}
                                className={`
                                    group flex items-center justify-between p-6 cursor-pointer border-b border-white/10 transition-all duration-300
                                    ${activeMaterial.id === mat.id ? 'bg-white/5 border-white/30' : 'hover:bg-white/5'}
                                `}
                            >
                                <div>
                                    <span className="text-[10px] uppercase tracking-widest text-stone-500 block mb-1">
                                        {mat.origin}
                                    </span>
                                    <h3 className={`font-serif text-2xl transition-colors ${activeMaterial.id === mat.id ? 'text-white' : 'text-stone-400 group-hover:text-white'}`}>
                                        {mat.name}
                                    </h3>
                                </div>
                                <ArrowUpRight className={`w-5 h-5 transition-all duration-300 ${activeMaterial.id === mat.id ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-45'}`} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: The Interactive Lens Feature */}
                <div
                    ref={containerRef}
                    onMouseMove={handleMouseMove}
                    className="lg:col-span-7 h-[500px] md:h-[700px] w-full relative rounded-sm overflow-hidden bg-stone-800 cursor-crosshair"
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeMaterial.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transport={{ duration: 0.5 }}
                            className="absolute inset-0 w-full h-full"
                        >
                            {/* 1. Base Layer (Grayscale / Darkened) */}
                            <img
                                src={activeMaterial.polishedImage}
                                alt={activeMaterial.name}
                                className="w-full h-full object-cover filter grayscale brightness-50 contrast-125"
                            />

                            {/* 2. Revealed Layer (Color - Masked by Mouse) */}
                            {/* We use CSS mask-image to create the 'flashlight' effect */}
                            <div
                                className="absolute inset-0 w-full h-full"
                                style={{
                                    backgroundImage: `url(${activeMaterial.polishedImage})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    // The magical mask effect
                                    maskImage: `radial-gradient(circle 150px at ${mousePos.x}px ${mousePos.y}px, black 100%, transparent 100%)`,
                                    WebkitMaskImage: `radial-gradient(circle 150px at ${mousePos.x}px ${mousePos.y}px, black 100%, transparent 100%)`,
                                }}
                            />

                            {/* Floating Label following mouse (optional nice touch) */}
                            <div
                                className="pointer-events-none absolute hidden md:block z-20 mix-blend-difference text-white text-xs uppercase tracking-widest font-bold"
                                style={{
                                    left: mousePos.x + 20,
                                    top: mousePos.y + 20,
                                }}
                            >
                                {activeMaterial.name}
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Mobile Hint (Since no hover on mobile) */}
                    <div className="absolute bottom-6 left-6 md:hidden bg-black/50 backdrop-blur-md px-4 py-2 rounded-full text-xs text-white/80 border border-white/10">
                        Tap list to view details
                    </div>
                </div>

            </div>
        </section>
    );
};

export default MaterialShowcase;
