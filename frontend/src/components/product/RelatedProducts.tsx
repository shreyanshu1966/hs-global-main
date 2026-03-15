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
        <div className="max-w-6xl mx-auto space-y-16 relative">
            <div className="flex items-end justify-between border-b border-[#E8E3DC] pb-6">
                <Heading level={2} serif>You May Also Like</Heading>

                <div className="hidden md:flex gap-4">
                    <Button variant="secondary" onClick={() => scrollRelated('left')} size="sm" className="p-3">
                        <ChevronLeft className="w-5 h-5 text-[#2B2B2B]" />
                    </Button>
                    <Button variant="secondary" onClick={() => scrollRelated('right')} size="sm" className="p-3">
                        <ChevronRight className="w-5 h-5 text-[#2B2B2B]" />
                    </Button>
                </div>
            </div>

            <div
                ref={relatedRef}
                className="flex gap-8 overflow-x-auto pb-8 snap-x snap-mandatory scroll-smooth custom-scrollbar"
            >
                {relatedProducts.map((p) => (
                    <div key={p.id} className="min-w-[300px] snap-start">
                        <ProductCard product={p} />
                    </div>
                ))}
            </div>
        </div>
    );
}
