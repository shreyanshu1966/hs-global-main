import React, { useState, useRef } from 'react';
import { X } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const FloatingWhatsApp: React.FC = () => {
    const [isVisible, setIsVisible] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLAnchorElement>(null);
    const closeRef = useRef<HTMLButtonElement>(null);

    const { contextSafe } = useGSAP({ scope: containerRef });

    const handleClose = contextSafe(() => {
        if (!containerRef.current) return;

        gsap.to(containerRef.current, {
            opacity: 0,
            y: 20,
            duration: 0.3,
            ease: "back.in(1.7)",
            onComplete: () => setIsVisible(false)
        });
    });

    useGSAP(() => {
        if (isVisible && containerRef.current) {
            gsap.fromTo(containerRef.current,
                { opacity: 0, y: 20, scale: 0.8 },
                { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "back.out(1.7)", delay: 1 }
            );
        }
    }, [isVisible]);

    const handleHover = contextSafe(() => {
        if (buttonRef.current) {
            gsap.to(buttonRef.current, { scale: 1.05, duration: 0.2 });
        }
    });

    const handleHoverEnd = contextSafe(() => {
        if (buttonRef.current) {
            gsap.to(buttonRef.current, { scale: 1, duration: 0.2 });
        }
    });

    if (!isVisible) return null;

    return (
        <div
            ref={containerRef}
            className="fixed bottom-6 right-6 z-40 flex items-end gap-2"
        >
            <div className="relative group">
                <button
                    ref={closeRef}
                    onClick={handleClose}
                    className="absolute -top-3 -right-3 z-50 bg-white text-gray-500 hover:text-red-500 rounded-full p-1 shadow-md border border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    aria-label="Close WhatsApp"
                >
                    <X className="w-3 h-3" />
                </button>

                <a
                    ref={buttonRef}
                    href="https://wa.me/918107115116?text=Hello%20HS%20Global%20Export"
                    target="_blank"
                    rel="noreferrer"
                    onMouseEnter={handleHover}
                    onMouseLeave={handleHoverEnd}
                    className="flex items-center gap-2 bg-[#25D366] text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl hover:bg-[#20bd5a] transition-all duration-300"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        className="h-6 w-6 fill-current"
                    >
                        <path d="M20.52 3.48A11.94 11.94 0 0 0 12.06 0C5.46.03.1 5.38.12 11.98c0 2.1.55 4.1 1.52 5.86L0 24l6.3-1.6a12.02 12.02 0 0 0 5.76 1.46h.03c6.6 0 11.97-5.36 12-11.96a11.94 11.94 0  0 0-3.57-8.42zM12.09 21.3h-.02a9.9 9.9 0  0 1-5.04-1.38l-.36-.2-3.74.95.99-3.64-.24-.38a9.36 9.36 0  0 1-1.45-4.96c-.02-5.16 4.18-9.38 9.34-9.4 2.5 0 4.86.98 6.64 2.77a9.32 9.32 0  0 1 2.75 6.65c-.02 5.16-4.22 9.39-9.37 9.39zm5.35-7.26c-.29-.15-1.72-.84-1.99-.94-.27-.1-.46-.15-.66.15-.2.29-.76.94-.92 1.12-.17.19-.34.22-.62.08-.29-.15-1.2-.44-2.28-1.41-1.68-1.5-1.92-2.33-2.14-2.62-.23-.29-.02-.45.13-.6.13-.13.3-.33.45-.5.15-.17.2-.29.3-.49.1-.2.05-.37-.02-.52-.07-.15-.66-1.55-.9-2.12-.24-.57-.48-.49-.66-.49-.17 0-.37-.02-.57-.02-.2 0-.52.08-.8.37-.27.29-1.03 1.01-1.03 2.47 0 1.45 1.06 2.86 1.21 3.06.15.2 2.08 3.16 5.04 4.43.71.31 1.26.48 1.69.62.71.22 1.34.2 1.85.12.57-.09 1.73-.7 1.98-1.39.25-.69.25-1.27.17-1.39-.07-.12-.27-.19-.55-.33z" />
                    </svg>
                    <span className="font-semibold hidden sm:inline">WhatsApp</span>
                </a>
            </div>
        </div>
    );
};

export default FloatingWhatsApp;
