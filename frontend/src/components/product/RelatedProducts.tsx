import React from 'react';
import { Heading } from '../ui/Typography';
import { ProductCard } from '../cards/ProductCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/Button';

interface RelatedProductsProps {
    relatedProducts: any[];
    scrollRelated: (dir: 'left' | 'right') => void;
    relatedRef: React.RefObject<HTMLDivElement>;
}

export function RelatedProducts({ relatedProducts, scrollRelated, relatedRef }: RelatedProductsProps) {
    if (!relatedProducts || relatedProducts.length === 0) return null;

    return (
        <div className="max-w-6xl mx-auto space-y-10 relative">
            <div className="flex items-end justify-between border-b border-[#e2e8f0] pb-5">
                <Heading level={2} serif className="text-[#26221c]">You May Also Like</Heading>

                <div className="hidden md:flex gap-4">
                    <Button variant="secondary" onClick={() => scrollRelated('left')} size="sm" className="p-3 border-[#cbd5e1] bg-white hover:bg-[#f1f5f9]">
                        <ChevronLeft className="w-5 h-5 text-[#2b2822]" />
                    </Button>
                    <Button variant="secondary" onClick={() => scrollRelated('right')} size="sm" className="p-3 border-[#cbd5e1] bg-white hover:bg-[#f1f5f9]">
                        <ChevronRight className="w-5 h-5 text-[#2b2822]" />
                    </Button>
                </div>
            </div>

            <div
                ref={relatedRef}
                className="flex gap-6 overflow-x-auto pb-6 snap-x snap-mandatory scroll-smooth custom-scrollbar"
            >
                {relatedProducts.map((p, index) => (
                    <div key={p.productId || p._id || p.id || `related-${index}`} className="min-w-[300px] snap-start bg-white border border-[#e2e8f0] p-3">
                        <ProductCard product={p} />
                    </div>
                ))}
            </div>
        </div>
    );
}
