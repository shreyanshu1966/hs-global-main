'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronUp } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

// Show button once user scrolls past this threshold
const SHOW_AFTER_PX = 200;
// Treat user as "near bottom" when >= 80% scrolled
const BOTTOM_THRESHOLD = 0.8;

const scrollLenis = (target: number | Element, duration = 1.4) => {
    const lenis = (window as Window & { lenis?: { scrollTo: (t: number | Element, opts: object) => void } }).lenis;
    if (lenis) {
        lenis.scrollTo(target, {
            duration,
            easing: (t: number) => 1 - Math.pow(1 - t, 4),
        });
    } else if (typeof target === 'number') {
        window.scrollTo({ top: target, behavior: 'smooth' });
    } else {
        target.scrollIntoView({ behavior: 'smooth' });
    }
};

const FloatingScrollButton: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [goingUp, setGoingUp] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const arrowRef = useRef<HTMLSpanElement>(null);

    const { contextSafe } = useGSAP({ scope: containerRef });

    // ── Scroll state tracking ──────────────────────────────────────────────
    useEffect(() => {
        const onScroll = () => {
            const scrollY = window.scrollY;
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            const progress = maxScroll > 0 ? scrollY / maxScroll : 0;

            setIsVisible(scrollY > SHOW_AFTER_PX);
            setGoingUp(progress >= BOTTOM_THRESHOLD);
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // ── Show / hide animation ──────────────────────────────────────────────
    useGSAP(() => {
        if (!buttonRef.current) return;
        if (isVisible) {
            gsap.to(buttonRef.current, {
                scale: 1,
                opacity: 1,
                duration: 0.35,
                ease: 'back.out(1.7)',
            });
        } else {
            gsap.to(buttonRef.current, {
                scale: 0,
                opacity: 0,
                duration: 0.25,
                ease: 'back.in(1.7)',
            });
        }
    }, [isVisible]);

    // ── Arrow rotation animation ───────────────────────────────────────────
    // ChevronUp rotated 180° = pointing down (go to footer)
    // ChevronUp at 0°        = pointing up   (go to top)
    useGSAP(() => {
        if (!arrowRef.current) return;
        gsap.to(arrowRef.current, {
            rotate: goingUp ? 0 : 180,
            duration: 0.4,
            ease: 'power3.inOut',
        });
    }, [goingUp]);

    // ── Hover / tap feedback ───────────────────────────────────────────────
    const handleMouseEnter = contextSafe(() => {
        gsap.to(buttonRef.current, { scale: 1.12, duration: 0.2, ease: 'power2.out' });
    });

    const handleMouseLeave = contextSafe(() => {
        gsap.to(buttonRef.current, { scale: 1, duration: 0.2, ease: 'power2.out' });
    });

    const handleMouseDown = contextSafe(() => {
        gsap.to(buttonRef.current, { scale: 0.9, duration: 0.1, ease: 'power2.in' });
    });

    const handleMouseUp = contextSafe(() => {
        gsap.to(buttonRef.current, { scale: 1.08, duration: 0.15, ease: 'back.out(2)' });
    });

    // ── Click action ───────────────────────────────────────────────────────
    const handleClick = useCallback(() => {
        if (goingUp) {
            scrollLenis(0);
        } else {
            const footer = document.querySelector('footer');
            if (footer) scrollLenis(footer);
        }
    }, [goingUp]);

    return (
        <div ref={containerRef}>
            <button
                ref={buttonRef}
                onClick={handleClick}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                style={{ transform: 'scale(0)', opacity: 0 }}
                aria-label={goingUp ? 'Scroll to top' : 'Scroll to footer'}
                className={[
                    'fixed right-4 sm:right-6 z-30',
                    'bottom-[5.5rem] sm:bottom-24',
                    'w-10 h-10 rounded-full',
                    'bg-white/90 backdrop-blur-sm',
                    'border border-gray-200/80',
                    'shadow-md',
                    'flex items-center justify-center',
                    'text-gray-600',
                    'cursor-pointer',
                    'transition-colors duration-200',
                    'hover:bg-white hover:border-gray-300 hover:text-gray-900',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2',
                ].join(' ')}
            >
                <span
                    ref={arrowRef}
                    // initial: pointing down (user at top → go to footer)
                    style={{ display: 'flex', transform: 'rotate(180deg)' }}
                >
                    <ChevronUp className="w-4 h-4" strokeWidth={2.5} />
                </span>
            </button>
        </div>
    );
};

export default FloatingScrollButton;
