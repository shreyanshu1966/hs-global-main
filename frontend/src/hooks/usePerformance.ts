import { useEffect, useRef } from 'react';

/**
 * Optimized image preloader using link[rel=preload]
 * More efficient than creating Image objects
 */
export const useImagePreload = (urls: string[], enabled: boolean = true) => {
    const preloadedRef = useRef(new Set<string>());

    useEffect(() => {
        if (!enabled || urls.length === 0) return;

        const links: HTMLLinkElement[] = [];

        urls.forEach((url) => {
            // Skip if already preloaded
            if (preloadedRef.current.has(url)) return;

            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = url;

            // Add to DOM
            document.head.appendChild(link);
            links.push(link);

            // Mark as preloaded
            preloadedRef.current.add(url);
        });

        // Cleanup
        return () => {
            links.forEach((link) => {
                try {
                    document.head.removeChild(link);
                } catch {
                    // Link may have been removed already
                }
            });
        };
    }, [urls, enabled]);
};

/**
 * Debounce hook for performance-critical callbacks
 */
export const useDebounce = <T extends (...args: any[]) => any>(
    callback: T,
    delay: number
): ((...args: Parameters<T>) => void) => {
    const timeoutRef = useRef<number>();

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return (...args: Parameters<T>) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = window.setTimeout(() => {
            callback(...args);
        }, delay);
    };
};

/**
 * Throttle hook using requestAnimationFrame for scroll handlers
 */
export const useRAFThrottle = <T extends (...args: any[]) => any>(
    callback: T
): ((...args: Parameters<T>) => void) => {
    const rafRef = useRef<number>();
    const argsRef = useRef<Parameters<T>>();

    useEffect(() => {
        return () => {
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
            }
        };
    }, []);

    return (...args: Parameters<T>) => {
        argsRef.current = args;

        if (rafRef.current) return; // Already scheduled

        rafRef.current = requestAnimationFrame(() => {
            if (argsRef.current) {
                callback(...argsRef.current);
            }
            rafRef.current = undefined;
        });
    };
};
