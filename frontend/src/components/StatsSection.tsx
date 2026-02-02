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
            label: 'Projects',
        },
        {
            value: 50,
            suffix: '+',
            label: 'Countries',
        },
        {
            value: 15,
            suffix: '+',
            label: 'Years',
        },
        {
            value: 1000,
            suffix: '+',
            label: 'Clients',
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
            <span className="text-6xl md:text-8xl font-serif text-primary leading-none block mb-2">
                {count}
                <span className="text-4xl md:text-6xl text-stone-300 ml-1 font-light">{suffix}</span>
            </span>
        );
    };

    return (
        <section ref={sectionRef} className="py-24 md:py-32 bg-white">
            <div className="container mx-auto px-6 md:px-12 max-w-7xl">

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-16 gap-x-8">
                    {stats.map((stat, index) => (
                        <div key={index} className="flex flex-col items-start border-l border-stone-200 pl-8 group hover:border-accent transition-colors duration-500">
                            <TextReveal delay={index * 0.1}>
                                <AnimatedNumber value={stat.value} suffix={stat.suffix} isVisible={isVisible} />
                                <span className="text-xs font-bold tracking-[0.2em] uppercase text-stone-400 group-hover:text-primary transition-colors">
                                    {stat.label}
                                </span>
                            </TextReveal>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default StatsSection;
