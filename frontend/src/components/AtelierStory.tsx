import { useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Award, Hammer, Gem } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const features = [
    {
        icon: <Gem className="w-6 h-6" />,
        title: "Ethically Sourced",
        text: "Direct partnerships with quarries in Carrara and Alentejo ensure sustainability and fair trade."
    },
    {
        icon: <Hammer className="w-6 h-6" />,
        title: "Hand-Finished",
        text: "While machines cut the block, only the human hand can perfect the edge. 40+ hours of hand polishing."
    },
    {
        icon: <Award className="w-6 h-6" />,
        title: "Gallery Grade",
        text: "Each piece is quality checked against our 50-point inspection list before crating."
    }
];

const AtelierStory = () => {
    const sectionRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(".feature-item", {
                y: 30,
                opacity: 0,
                duration: 0.8,
                stagger: 0.2,
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top 70%",
                }
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className="py-24 md:py-32 bg-stone-50 text-stone-900 border-t border-stone-200">
            <div className="container mx-auto px-6 md:px-12 grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">

                {/* Visual Story */}
                <div className="relative aspect-[4/5] lg:aspect-square overflow-hidden bg-stone-200">
                    <img
                        src="/services-custom-fabrication.png"
                        alt="Artisan polishing marble"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur p-6 border border-stone-100">
                        <p className="font-serif italic text-xl text-stone-800">
                            "The stone dictates the form. We simply listen."
                        </p>
                        <span className="block mt-4 text-[10px] font-bold tracking-widest uppercase text-stone-500">
                            — Giovanni R., Master Craftsman
                        </span>
                    </div>
                </div>

                {/* Text Content */}
                <div ref={textRef} className="flex flex-col justify-center h-full">
                    <span className="text-xs font-bold tracking-[0.2em] uppercase text-stone-400 mb-6">
                        The Atelier
                    </span>
                    <h2 className="font-serif text-5xl md:text-6xl mb-8 leading-[0.9]">
                        From Quarry <br /> <span className="text-stone-400 italic">to Home.</span>
                    </h2>
                    <p className="text-lg text-stone-600 font-light mb-12 leading-relaxed">
                        Every piece begins its journey millions of years ago. We honor that history by employing
                        traditional reductive sculpting techniques combined with modern precision engineering.
                        The result is furniture that feels both ancient and contemporary.
                    </p>

                    <div className="flex flex-col gap-10">
                        {features.map((f, i) => (
                            <div key={i} className="feature-item flex gap-6 items-start">
                                <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center text-stone-900 shrink-0 border border-stone-200">
                                    {f.icon}
                                </div>
                                <div>
                                    <h4 className="font-serif text-xl mb-2">{f.title}</h4>
                                    <p className="text-sm text-stone-500 font-light leading-relaxed max-w-sm">
                                        {f.text}
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

export default AtelierStory;
