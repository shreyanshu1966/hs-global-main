/**
 * Performance monitoring utilities for tracking and optimizing page performance
 */

interface PerformanceMetrics {
    fcp?: number; // First Contentful Paint
    lcp?: number; // Largest Contentful Paint
    fid?: number; // First Input Delay
    cls?: number; // Cumulative Layout Shift
    ttfb?: number; // Time to First Byte
}

class PerformanceMonitor {
    private metrics: PerformanceMetrics = {};
    private observers: PerformanceObserver[] = [];

    constructor() {
        if (typeof window === 'undefined') return;
        this.initObservers();
    }

    private initObservers() {
        // Observe Largest Contentful Paint
        try {
            const lcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1] as any;
                this.metrics.lcp = lastEntry.renderTime || lastEntry.loadTime;
            });
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
            this.observers.push(lcpObserver);
        } catch (e) {
            console.warn('LCP observer not supported');
        }

        // Observe First Input Delay
        try {
            const fidObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach((entry: any) => {
                    this.metrics.fid = entry.processingStart - entry.startTime;
                });
            });
            fidObserver.observe({ entryTypes: ['first-input'] });
            this.observers.push(fidObserver);
        } catch (e) {
            console.warn('FID observer not supported');
        }

        // Observe Cumulative Layout Shift
        try {
            let clsValue = 0;
            const clsObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries() as any[]) {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                        this.metrics.cls = clsValue;
                    }
                }
            });
            clsObserver.observe({ entryTypes: ['layout-shift'] });
            this.observers.push(clsObserver);
        } catch (e) {
            console.warn('CLS observer not supported');
        }

        // Get FCP and TTFB from Navigation Timing
        if (window.performance && window.performance.timing) {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    const timing = window.performance.timing;
                    this.metrics.ttfb = timing.responseStart - timing.requestStart;

                    // Get FCP from Paint Timing API
                    const paintEntries = performance.getEntriesByType('paint');
                    const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
                    if (fcpEntry) {
                        this.metrics.fcp = fcpEntry.startTime;
                    }
                }, 0);
            });
        }
    }

    /**
     * Get current performance metrics
     */
    getMetrics(): PerformanceMetrics {
        return { ...this.metrics };
    }

    /**
     * Log metrics to console (development only)
     */
    logMetrics() {
        if (process.env.NODE_ENV !== 'development') return;

        console.group('📊 Performance Metrics');
        console.log('First Contentful Paint (FCP):', this.metrics.fcp?.toFixed(2), 'ms');
        console.log('Largest Contentful Paint (LCP):', this.metrics.lcp?.toFixed(2), 'ms');
        console.log('First Input Delay (FID):', this.metrics.fid?.toFixed(2), 'ms');
        console.log('Cumulative Layout Shift (CLS):', this.metrics.cls?.toFixed(4));
        console.log('Time to First Byte (TTFB):', this.metrics.ttfb?.toFixed(2), 'ms');
        console.groupEnd();

        // Performance recommendations
        this.logRecommendations();
    }

    private logRecommendations() {
        const recommendations: string[] = [];

        if (this.metrics.lcp && this.metrics.lcp > 2500) {
            recommendations.push('⚠️ LCP is high. Consider optimizing images and reducing render-blocking resources.');
        }

        if (this.metrics.fid && this.metrics.fid > 100) {
            recommendations.push('⚠️ FID is high. Consider reducing JavaScript execution time.');
        }

        if (this.metrics.cls && this.metrics.cls > 0.1) {
            recommendations.push('⚠️ CLS is high. Ensure images have width/height attributes and avoid dynamic content insertion.');
        }

        if (this.metrics.ttfb && this.metrics.ttfb > 600) {
            recommendations.push('⚠️ TTFB is high. Consider server-side optimizations or CDN usage.');
        }

        if (recommendations.length > 0) {
            console.group('💡 Performance Recommendations');
            recommendations.forEach(rec => console.log(rec));
            console.groupEnd();
        } else {
            console.log('✅ All Core Web Vitals are within acceptable ranges!');
        }
    }

    /**
     * Mark a custom performance point
     */
    mark(name: string) {
        performance.mark(name);
    }

    /**
     * Measure time between two marks
     */
    measure(name: string, startMark: string, endMark: string) {
        try {
            performance.measure(name, startMark, endMark);
            const measure = performance.getEntriesByName(name)[0];
            console.log(`⏱️ ${name}:`, measure.duration.toFixed(2), 'ms');
            return measure.duration;
        } catch (e) {
            console.warn('Failed to measure:', name);
            return 0;
        }
    }

    /**
     * Cleanup observers
     */
    disconnect() {
        this.observers.forEach(observer => observer.disconnect());
        this.observers = [];
    }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Auto-log metrics after page load (development only)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    window.addEventListener('load', () => {
        setTimeout(() => {
            performanceMonitor.logMetrics();
        }, 3000); // Wait 3s for metrics to stabilize
    });
}

/**
 * React hook for component-level performance tracking
 */
export const usePerformanceTracking = (componentName: string) => {
    React.useEffect(() => {
        const mountMark = `${componentName}-mount`;
        performanceMonitor.mark(mountMark);

        return () => {
            const unmountMark = `${componentName}-unmount`;
            performanceMonitor.mark(unmountMark);
            performanceMonitor.measure(
                `${componentName} lifecycle`,
                mountMark,
                unmountMark
            );
        };
    }, [componentName]);
};

import React from 'react';
