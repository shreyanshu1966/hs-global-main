import React, { useRef, useState } from "react";
import { motion } from "framer-motion";

interface MagnetProps {
    children: React.ReactNode;
    padding?: number;
    disabled?: boolean;
    magnetStrength?: number;
    activeTransition?: string;
    inactiveTransition?: string;
    wrapperClassName?: string;
    innerClassName?: string;
    [key: string]: any;
}

const Magnet: React.FC<MagnetProps> = ({
    children,
    padding = 100,
    disabled = false,
    magnetStrength = 2,
    activeTransition = "transform 0.3s ease-out",
    inactiveTransition = "transform 0.5s ease-in-out",
    wrapperClassName = "",
    innerClassName = "",
    ...props
}) => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current || disabled) return;

        const { left, top, width, height } = ref.current.getBoundingClientRect();
        const centerX = left + width / 2;
        const centerY = top + height / 2;

        const dist = Math.sqrt(
            Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2)
        );

        if (dist < padding) {
            setIsHovered(true);
            const moveX = (e.clientX - centerX) / magnetStrength;
            const moveY = (e.clientY - centerY) / magnetStrength;
            setPosition({ x: moveX, y: moveY });
        } else {
            setIsHovered(false);
            setPosition({ x: 0, y: 0 });
        }
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        setPosition({ x: 0, y: 0 });
    };

    return (
        <div
            ref={ref}
            className={`inline-block ${wrapperClassName}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            {...props}
        >
            <div
                className={innerClassName}
                style={{
                    transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
                    transition: isHovered ? activeTransition : inactiveTransition,
                }}
            >
                {children}
            </div>
        </div>
    );
};

export default Magnet;
