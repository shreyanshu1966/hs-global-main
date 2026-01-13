import React, { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

interface MagneticButtonProps {
    children: React.ReactNode;
    className?: string;
    strength?: number; // How far the button moves (default 0.3)
    onClick?: () => void;
}

const MagneticButton: React.FC<MagneticButtonProps> = ({
    children,
    className = "",
    strength = 0.5,
    onClick
}) => {
    const buttonRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const { clientX, clientY } = e;
        const { left, top, width, height } = buttonRef.current!.getBoundingClientRect();
        const x = clientX - (left + width / 2);
        const y = clientY - (top + height / 2);

        gsap.to(buttonRef.current, {
            x: x * strength,
            y: y * strength,
            duration: 0.3,
            ease: "power2.out",
        });
    };

    const handleMouseLeave = () => {
        gsap.to(buttonRef.current, {
            x: 0,
            y: 0,
            duration: 0.5,
            ease: "elastic.out(1, 0.3)",
        });
    };

    return (
        <div
            ref={buttonRef}
            className={`inline-block ${className}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={onClick}
        >
            {children}
        </div>
    );
};

export default MagneticButton;
