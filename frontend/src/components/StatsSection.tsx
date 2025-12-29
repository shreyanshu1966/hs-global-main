import React, { useEffect, useRef, useState } from 'react';
import TextReveal from './TextReveal';

interface StatItem {
    value: number;
    suffix: string;
    label: string;
}

const StatsSection: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef<HTMLDivElement>(null);

    const stats: StatItem[] = [
        {
            value: 500,
            suffix: '+',
            label: 'Projects Completed',
        },
        {
            value: 50,
            suffix: '+',
            label: 'Countries Served',
        },
        {
            value: 15,
            suffix: '+',
            label: 'Years of Excellence',
        },
        {
            value: 1000,
            suffix: '+',
            label: 'Happy Clients',
        },
    ];

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.3 }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => {
            if (sectionRef.current) {
                observer.unobserve(sectionRef.current);
            }
        };
    }, []);

    const AnimatedNumber: React.FC<{ value: number; suffix: string; isVisible: boolean }> = ({
        value,
        suffix,
        isVisible,
    }) => {
        const [count, setCount] = useState(0);

        useEffect(() => {
            if (!isVisible) return;

            const duration = 2000;
            const steps = 60;
            const increment = value / steps;
            let current = 0;

            const timer = setInterval(() => {
                current += increment;
                if (current >= value) {
                    setCount(value);
                    clearInterval(timer);
                } else {
                    setCount(Math.floor(current));
                }
            }, duration / steps);

            return () => clearInterval(timer);
        }, [isVisible, value]);

        return (
            <span className="text-5xl md:text-6xl lg:text-7xl font-serif font-light text-primary">
                {count}
                {suffix}
            </span>
        );
    };

    return (
        <section ref={sectionRef} className="py-20 md:py-32 bg-white border-y border-stone-200">
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="text-center mb-16 md:mb-20">
                    <div className="inline-flex items-center gap-3 mb-6">
                        <span className="h-[1px] w-12 bg-stone-300"></span>
                        <span className="text-xs tracking-[0.3em] uppercase text-stone-500 font-medium">
                            Our Impact
                        </span>
                        <span className="h-[1px] w-12 bg-stone-300"></span>
                    </div>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-light text-primary tracking-tight">
                        Numbers That Speak
                    </h2>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
                    {stats.map((stat, index) => (
                        <div key={index} className="flex flex-col items-center text-center group">
                            <TextReveal delay={index * 0.1}>
                                <div className="mb-4">
                                    <AnimatedNumber value={stat.value} suffix={stat.suffix} isVisible={isVisible} />
                                </div>
                                <p className="text-sm md:text-base text-gray-600 uppercase tracking-wider font-medium">
                                    {stat.label}
                                </p>
                                <div className="mt-4 h-[2px] w-16 bg-accent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            </TextReveal>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default StatsSection;
