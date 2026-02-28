import React from 'react';
import { Heading, Body } from '../ui/Typography';
import { Quote } from 'lucide-react';

interface ProductStoryProps {
    product: any;
}

export function ProductStory({ product }: ProductStoryProps) {
    return (
        <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center space-y-6">
                <Heading level={2} serif>The Story</Heading>
                <div className="h-px w-24 bg-[#B8944A] mx-auto"></div>
            </div>

            <div className="bg-white p-12 lg:p-16 border border-[#E8E3DC] shadow-sm transform -rotate-1 hover:rotate-0 transition-transform duration-500">
                <div className="flex gap-6 items-start">
                    <Quote className="w-12 h-12 text-[#E8E3DC] flex-shrink-0" />
                    <div className="space-y-6 pt-2">
                        <Body size="lg" color="primary" className="italic leading-relaxed">
                            {product.category === "furniture"
                                ? "Each furniture piece is a unique work of art, combining traditional craftsmanship with modern design sensibilities. Request custom specifications to match your vision."
                                : "Crafted by nature over millennia, this stone delivers timeless elegance to modern spaces. Request a live video of current slabs to choose your exact piece."}
                        </Body>
                        <div className="h-px w-12 bg-[#B8944A]"></div>
                        <p className="text-sm font-bold text-[#2B2B2B] uppercase tracking-wider">HS Global Expert Team</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
