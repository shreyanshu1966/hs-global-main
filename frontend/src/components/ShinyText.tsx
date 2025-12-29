import React, { CSSProperties } from "react";

interface ShinyTextProps {
    text: string;
    disabled?: boolean;
    speed?: number;
    className?: string;
}

const ShinyText: React.FC<ShinyTextProps> = ({
    text,
    disabled = false,
    speed = 5,
    className = "",
}) => {
    const animationDuration = `${speed}s`;

    const shinyStyle: CSSProperties = {
        backgroundImage: disabled
            ? "none"
            : "linear-gradient(110deg, currentColor 45%, #fff 50%, currentColor 55%)",
        backgroundSize: "200% 100%",
        backgroundClip: "text",
        WebkitBackgroundClip: "text",
        color: disabled ? "currentColor" : "transparent",
        animation: disabled ? "none" : `shine ${animationDuration} linear infinite`,
    };

    return (
        <>
            <style>
                {`
          @keyframes shine {
            0% {
              background-position: 200% center;
            }
            100% {
              background-position: -200% center;
            }
          }
        `}
            </style>
            <span className={className} style={shinyStyle}>
                {text}
            </span>
        </>
    );
};

export default ShinyText;
