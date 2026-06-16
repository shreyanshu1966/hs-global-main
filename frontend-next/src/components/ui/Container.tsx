'use client';
import React from 'react';

type ContainerMaxWidth = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'narrow' | 'wide' | 'full';

interface ContainerProps {
    children: React.ReactNode;
    className?: string;
    maxWidth?: ContainerMaxWidth;
}

export function Container({
    children,
    className = '',
    maxWidth = 'xl'
}: ContainerProps) {
    const maxWClass = {
        sm: 'max-w-screen-sm',
        md: 'max-w-screen-md',
        lg: 'max-w-screen-lg',
        xl: 'max-w-screen-xl',
        '2xl': 'max-w-screen-2xl',
        narrow: 'max-w-4xl',
        wide: 'max-w-6xl',
        full: 'max-w-full',
    }[maxWidth];

    return (
        <div className={`mx-auto px-6 ${maxWClass} ${className}`}>
            {children}
        </div>
    );
}
