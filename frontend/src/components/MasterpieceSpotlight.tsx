import React, { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useNavigate } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);

const MasterpieceSpotlight = () => {
    const sectionRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(contentRef.current, {
                y: 50,
                opacity: 0,
                duration: 1,
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top 70%",
                }
            });

            gsap.to(".parallax-img", {
                scale: 1.1,
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true
                }
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className="relative min-h-screen bg-stone-900 text-stone-100 flex flex-col lg:flex-row overflow-hidden">

            {/* Visual Side (Left) */}
            <div ref={imageRef} className="relative lg:w-1/2 h-[60vh] lg:h-auto overflow-hidden">
                <div className="parallax-img absolute inset-0 w-full h-full">
                    <img
                        src="/furniture/sculpture-stand.jpg"
                        alt="The Viola Plinth"
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="absolute top-8 left-8 bg-white/10 backdrop-blur-md px-4 py-2 text-[10px] uppercase tracking-widest border border-white/20">
                    Spotlight
                </div>
            </div>

            {/* Content Side (Right) */}
            <div className="lg:w-1/2 flex flex-col justify-center p-8 md:p-20 lg:p-24 relative bg-stone-950">
                <div ref={contentRef} className="max-w-lg">
                    <div className="flex items-center gap-4 mb-8 text-stone-500">
                        <span className="text-xs font-bold tracking-widest uppercase">The Masterpiece</span>
                        <div className="h-[1px] w-12 bg-stone-800"></div>
                        <span className="text-xs font-bold tracking-widest uppercase">Nov 2025</span>
                    </div>

                    <h2 className="font-serif text-5xl md:text-6xl text-white mb-6 leading-[0.9]">
                        The Viola <br />
                        <span className="italic text-stone-400">Plinth.</span>
                    </h2>

                    <p className="text-stone-400 font-light text-lg mb-12 leading-relaxed">
                        A monolithic statement piece carved from a single block of Calacatta Viola.
                        Defying gravity with its tapered base, this table anchors the room
                        while maintaining an air of refined elegance.
                    </p>

                    {/* Specs Grid */}
                    <div className="grid grid-cols-2 gap-y-8 gap-x-4 mb-12 border-t border-white/10 pt-8">
                        <div>
                            <h4 className="text-[10px] uppercase tracking-widest text-stone-500 mb-2">Origin</h4>
                            <p className="font-serif text-xl text-stone-200">Tuscany, Italy</p>
                        </div>
                        <div>
                            <h4 className="text-[10px] uppercase tracking-widest text-stone-500 mb-2">Weight</h4>
                            <p className="font-serif text-xl text-stone-200">1,200 kg</p>
                        </div>
                        <div>
                            <h4 className="text-[10px] uppercase tracking-widest text-stone-500 mb-2">Finish</h4>
                            <p className="font-serif text-xl text-stone-200">Honed / Polished</p>
                        </div>
                        <div>
                            <h4 className="text-[10px] uppercase tracking-widest text-stone-500 mb-2">Dimensions</h4>
                            <p className="font-serif text-xl text-stone-200">120 x 120 x 45 cm</p>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/products?id=viola-plinth')}
                        className="w-full md:w-auto px-8 py-5 bg-white text-black hover:bg-stone-200 transition-colors flex items-center justify-center gap-3 group"
                    >
                        <span className="text-xs font-bold tracking-[0.2em] uppercase">Request Pricing</span>
                        <div className="w-2 h-2 rounded-full bg-black group-hover:scale-125 transition-transform" />
                    </button>
                </div>
            </div>
        </section>
    );
}

export default MasterpieceSpotlight;
