import React from 'react';
import { Heading, Body } from '../ui/Typography';
import { Quote } from 'lucide-react';

interface ProductStoryProps {
    product: any;
}

export function ProductStory({ product }: ProductStoryProps) {
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-6">
                <Heading level={2} serif className="text-[#26221c]">The Story</Heading>
                <div className="h-px w-24 bg-[#837255] mx-auto"></div>
            </div>

            <div className="bg-white p-8 lg:p-10 border border-[#e2e8f0]">
                <div className="flex gap-6 items-start">
                    <Quote className="w-12 h-12 text-[#94a3b8] flex-shrink-0" />
                    <div className="space-y-6 pt-2">
                        <Body size="lg" color="primary" className="italic leading-relaxed text-[#334155]">
                            {product.category === "furniture"
                                ? "Each furniture piece is a unique work of art, combining traditional craftsmanship with modern design sensibilities. Request custom specifications to match your vision."
                                : "Crafted by nature over millennia, this stone delivers timeless elegance to modern spaces. Request a live video of current slabs to choose your exact piece."}
                        </Body>
                        <div className="h-px w-12 bg-[#64748b]"></div>
                        <p className="text-xs font-semibold text-[#111827] uppercase tracking-[0.1em]">HS Global Expert Team</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
