import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Sparkles } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

interface VelocityScrollProps {
    className?: string;
    items?: string[];
    default_velocity?: number;
}

const VelocityScroll: React.FC<VelocityScrollProps> = ({
    className = "",
    default_velocity = 5,
    items = [
        "Premium Natural Stone",
        "Global Export",
        "Custom Fabrication",
        "Luxury Interiors",
        "Architectural Excellence",
        "Italian Marble",
        "Indian Granite"
    ]
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        // Create a timeline that repeats
        const animation = gsap.to(textRef.current, {
            xPercent: -50, // Move half the width since we duplicate content
            ease: "none",
            duration: 100 / default_velocity, // Higher velocity = faster scroll (lower duration)
            repeat: -1,
        });

        // Clean up animation on unmount
        return () => {
            animation.kill();
        };

        /* 
           Note: A true velocity scroll with inertia requires more complex logic 
           often involving requestAnimationFrame and calculating scroll delta. 
           For simplicity and performance in this specific context, 
           we'll stick to a smooth consistent linear scroll that responds 
           slightly to scroll direction if needed, but the base requested 
           "Awwwards" feel often comes from just smooth continuous motion 
           and nice typography. 
        */

    }, { scope: containerRef });

    // Update scrolling speed based on scroll velocity could be added here
    // using ScrollTrigger's onUpdate, but often just a smooth marquee is enough.
    // Let's make it richer.

    useGSAP(() => {
        // Using GSAP's native marquee helper logic is safer for React
        gsap.to(".scroll-track", {
            xPercent: -50,
            ease: "none",
            duration: 100 / default_velocity,
            repeat: -1,
            modifiers: {
                timeScale: (value) => value // placeholder
            },
            scrollTrigger: {
                trigger: document.documentElement,
                start: 0,
                end: "max",
                onUpdate: () => {
                    // You can access velocity here if needed for more advanced effects
                    // const scrollVelocity = self.getVelocity();
                    // Adjust timeScale based on scroll velocity for that "whoosh" effect
                    // direction = scrollVelocity < 0 ? 1 : -1; 
                    // Not strictly necessary for a footer marquee, typically top-level.
                }
            }
        });

    }, { scope: containerRef });

    return (
        <div ref={containerRef} className={`relative overflow-hidden w-full bg-black text-white py-8 md:py-10 border-y border-white/10 ${className}`}>
            <div className="scroll-track flex whitespace-nowrap will-change-transform">
                {/* Render multiple copies to ensure seamless loop */}
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center gap-8 md:gap-16 mx-4 md:mx-8">
                        {items.map((text, idx) => (
                            <span key={idx} className="text-2xl md:text-6xl font-serif italic font-light tracking-tighter flex items-center gap-6 md:gap-12 opacity-80 hover:opacity-100 transition-opacity">
                                {text}
                                <Sparkles className="w-4 h-4 md:w-8 md:h-8 text-accent/80 animate-pulse" />
                            </span>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default VelocityScroll;
