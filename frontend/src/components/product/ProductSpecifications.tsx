import React from 'react';
import { Heading, Body } from '../ui/Typography';

interface ProductSpecificationsProps {
    product: any;
    selectedFinish: string;
    selectedThickness: string;
}

export function ProductSpecifications({ product, selectedFinish, selectedThickness }: ProductSpecificationsProps) {
    return (
        <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center space-y-6">
                <Heading level={2} serif>Specifications</Heading>
                <div className="h-px w-24 bg-[#B8944A] mx-auto"></div>
            </div>

            <div className="grid md:grid-cols-2 gap-x-12 gap-y-6">
                {product.category === 'slabs' && (
                    <>
                        <div className="flex justify-between items-center py-4 border-b border-[#E8E3DC]">
                            <span className="font-sans font-bold text-[#2B2B2B] uppercase tracking-wider text-sm">Finish</span>
                            <span className="font-sans text-[#6B6B6B]">{selectedFinish}</span>
                        </div>
                        <div className="flex justify-between items-center py-4 border-b border-[#E8E3DC]">
                            <span className="font-sans font-bold text-[#2B2B2B] uppercase tracking-wider text-sm">Thickness</span>
                            <span className="font-sans text-[#6B6B6B]">{selectedThickness}</span>
                        </div>
                        {Object.entries(product.specs)
                            .filter(([key]) => key !== 'finish' && key !== 'thickness')
                            .map(([key, value]) => (
                                <div key={key} className="flex justify-between items-center py-4 border-b border-[#E8E3DC]">
                                    <span className="font-sans font-bold text-[#2B2B2B] uppercase tracking-wider text-sm">{key}</span>
                                    <span className="font-sans text-[#6B6B6B]">{String(value)}</span>
                                </div>
                            ))}
                    </>
                )}

                {product.category !== 'slabs' && Object.entries(product.specs).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center py-4 border-b border-[#E8E3DC]">
                        <span className="font-sans font-bold text-[#2B2B2B] uppercase tracking-wider text-sm">{key}</span>
                        <span className="font-sans text-[#6B6B6B]">{String(value)}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
