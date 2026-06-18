'use client';
import React from 'react';

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
    level?: HeadingLevel;
    serif?: boolean;
    className?: string;
    children: React.ReactNode;
}

export function Heading({
    level = 2,
    serif = true,
    className = '',
    children,
    ...props
}: HeadingProps) {
    const Tag = `h${level}` as keyof JSX.IntrinsicElements;
    const fontStyle = serif ? 'font-serif font-bold' : 'font-sans font-bold';

    const sizes = {
        1: 'text-5xl lg:text-6xl text-[#2B2B2B]',
        2: 'text-4xl lg:text-5xl text-[#2B2B2B]',
        3: 'text-3xl lg:text-4xl text-[#2B2B2B]',
        4: 'text-2xl lg:text-3xl text-[#2B2B2B]',
        5: 'text-xl lg:text-2xl text-[#2B2B2B]',
        6: 'text-lg lg:text-xl text-[#2B2B2B]',
    };

    return (
        <Tag className={`${fontStyle} ${sizes[level]} ${className}`} {...props}>
            {children}
        </Tag>
    );
}

interface BodyProps extends React.HTMLAttributes<HTMLParagraphElement> {
    size?: 'sm' | 'base' | 'lg';
    color?: 'primary' | 'secondary' | 'accent' | 'white';
    className?: string;
    children: React.ReactNode;
}

export function Body({
    size = 'base',
    color = 'primary',
    className = '',
    children,
    ...props
}: BodyProps) {
    const sizes = {
        sm: 'text-sm',
        base: 'text-base lg:text-lg',
        lg: 'text-lg',
    };

    const colors = {
        primary: 'text-[#2B2B2B]',
        secondary: 'text-[#6B6B6B]',
        accent: 'text-[#334155]',
        white: 'text-white',
    };

    return (
        <p className={`font-sans ${sizes[size]} ${colors[color]} ${className}`} {...props}>
            {children}
        </p>
    );
}

interface CaptionProps extends React.HTMLAttributes<HTMLSpanElement> {
    className?: string;
    children: React.ReactNode;
}

export function Caption({ className = '', children, ...props }: CaptionProps) {
    return (
        <span className={`font-sans text-sm text-[#6B6B6B] uppercase tracking-wider ${className}`} {...props}>
            {children}
        </span>
    );
}
