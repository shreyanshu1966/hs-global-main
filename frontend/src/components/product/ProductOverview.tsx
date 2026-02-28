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
        <div className="space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-6">
                <Heading level={2} serif>
                    About {product.name}
                </Heading>
                <div className="h-px w-24 bg-[#B8944A] mx-auto"></div>
                <Body size="lg" color="secondary" className="leading-relaxed">
                    {product.description}
                </Body>
            </div>

            <div className="grid md:grid-cols-2 gap-8 lg:gap-12 mt-16 pt-12 border-t border-[#E8E3DC]">
                {features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-4">
                        <CheckCircle className="w-6 h-6 text-[#B8944A] flex-shrink-0 mt-1" />
                        <div className="space-y-2">
                            <Heading level={4} serif>
                                {feature.title}
                            </Heading>
                            <Body size="base" color="secondary">
                                {feature.desc}
                            </Body>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
