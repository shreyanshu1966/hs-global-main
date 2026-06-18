'use client';
import React from 'react';
import { CheckCircle } from 'lucide-react';
import { Heading, Body } from '../ui/Typography';
import { Container } from '../ui/Container';

interface ProductOverviewProps {
    product: {
        name: string;
        description: string;
    };
}

export function ProductOverview({ product }: ProductOverviewProps) {
    const features = [
        {
            title: 'Premium Quality',
            desc: 'Handpicked materials ensuring exceptional quality',
        },
        {
            title: 'Customizable',
            desc: 'Available in multiple finishes and sizes to match your vision',
        },
        {
            title: 'Durable',
            desc: 'Tested and proven resistance to wear and tear',
        },
        {
            title: 'Expert Craftsmanship',
            desc: 'Carefully crafted by highly skilled artisans',
        },
    ];

    return (
        <div className="space-y-10 max-w-6xl mx-auto">
            <div className="text-center max-w-3xl mx-auto space-y-6">
                <Heading level={2} serif className="text-[#26221c]">
                    About {product.name}
                </Heading>
                <div className="h-px w-28 bg-[#837255] mx-auto"></div>
                <Body size="lg" color="secondary" className="leading-relaxed text-[#4f483c]">
                    {product.description}
                </Body>
            </div>

            <div className="grid md:grid-cols-2 gap-0 mt-14 pt-8 bg-white border border-[#e2e8f0]">
                {features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-4 p-5 lg:p-6 border-b border-[#e2e8f0] md:[&:nth-last-child(-n+2)]:border-b-0 md:odd:border-r md:odd:border-r-[#e2e8f0]">
                        <CheckCircle className="w-6 h-6 text-[#7e6d4f] flex-shrink-0 mt-1" />
                        <div className="space-y-2">
                            <Heading level={4} serif className="text-[#27231d]">
                                {feature.title}
                            </Heading>
                            <Body size="base" color="secondary" className="text-[#575042]">
                                {feature.desc}
                            </Body>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
