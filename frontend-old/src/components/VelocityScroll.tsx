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
    const scrollTrackRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        // Ensure the element exists before animating
        if (!scrollTrackRef.current) return;

        // Create the main scrolling animation
        const animation = gsap.to(scrollTrackRef.current, {
            xPercent: -50, // Move half the width since we duplicate content
            ease: "none",
            duration: 100 / default_velocity, // Higher velocity = faster scroll (lower duration)
            repeat: -1,
        });

        // Clean up animation on unmount
        return () => {
            animation.kill();
        };

    }, { scope: containerRef, dependencies: [default_velocity] });

    // Optional: Add scroll-based velocity adjustment
    useGSAP(() => {
        if (!scrollTrackRef.current) return;

        ScrollTrigger.create({
            trigger: containerRef.current,
            start: "top bottom",
            end: "bottom top",
            onUpdate: () => {
                // You can add scroll velocity effects here if needed
                // For now, we'll keep the basic smooth scroll
            }
        });

    }, { scope: containerRef });

    return (
        <div ref={containerRef} className={`relative overflow-hidden w-full bg-black text-white py-8 md:py-10 border-y border-white/10 ${className}`}>
            <div ref={scrollTrackRef} className="scroll-track flex whitespace-nowrap will-change-transform">
                {/* Render multiple copies to ensure seamless loop */}
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center gap-8 md:gap-16 mx-4 md:mx-8">
                        {items.map((text, idx) => (
                            <span key={`${i}-${idx}`} className="text-2xl md:text-6xl font-serif italic font-light tracking-tighter flex items-center gap-6 md:gap-12 opacity-80 hover:opacity-100 transition-opacity">
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
