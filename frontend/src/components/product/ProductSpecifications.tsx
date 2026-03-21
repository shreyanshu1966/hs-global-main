import React from 'react';
import { Heading, Body } from '../ui/Typography';

interface ProductSpecificationsProps {
    product: any;
    selectedFinish: string;
    selectedThickness: string;
}

export function ProductSpecifications({ product, selectedFinish, selectedThickness }: ProductSpecificationsProps) {
    const [activeTab, setActiveTab] = React.useState<'details' | 'designer' | 'custom' | 'seller' | 'shipping'>('details');

    const specEntries = Object.entries(product.specs || {});

    const detailsRows = [
        ...specEntries.map(([key, value]) => [key, String(value)] as const),
        ['Reference Number', product.productId || product.id || 'HSG-PDP-REF'],
        ['Condition', product.available ? 'Available' : 'Out of Stock'],
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-6 bg-white border border-[#e2e8f0] p-5 lg:p-6">
            <div className="space-y-3">
                <Heading level={2} serif className="text-[#26221c]">Item Details</Heading>
                <div className="h-px w-20 bg-[#94a3b8]"></div>
            </div>

            <div className="flex flex-wrap gap-2 border-b border-[#e2e8f0] pb-3">
                <button
                    onClick={() => setActiveTab('details')}
                    className={`px-3 py-2 text-[11px] uppercase tracking-[0.1em] border transition-colors ${activeTab === 'details' ? 'bg-[#111827] text-white border-[#111827]' : 'bg-white text-[#334155] border-[#cbd5e1] hover:border-[#94a3b8]'}`}
                >
                    Item Details
                </button>
                <button
                    onClick={() => setActiveTab('designer')}
                    className={`px-3 py-2 text-[11px] uppercase tracking-[0.1em] border transition-colors ${activeTab === 'designer' ? 'bg-[#111827] text-white border-[#111827]' : 'bg-white text-[#334155] border-[#cbd5e1] hover:border-[#94a3b8]'}`}
                >
                    Designer / Maker
                </button>
                <button
                    onClick={() => setActiveTab('custom')}
                    className={`px-3 py-2 text-[11px] uppercase tracking-[0.1em] border transition-colors ${activeTab === 'custom' ? 'bg-[#111827] text-white border-[#111827]' : 'bg-white text-[#334155] border-[#cbd5e1] hover:border-[#94a3b8]'}`}
                >
                    Customization
                </button>
                <button
                    onClick={() => setActiveTab('seller')}
                    className={`px-3 py-2 text-[11px] uppercase tracking-[0.1em] border transition-colors ${activeTab === 'seller' ? 'bg-[#111827] text-white border-[#111827]' : 'bg-white text-[#334155] border-[#cbd5e1] hover:border-[#94a3b8]'}`}
                >
                    Seller Information
                </button>
                <button
                    onClick={() => setActiveTab('shipping')}
                    className={`px-3 py-2 text-[11px] uppercase tracking-[0.1em] border transition-colors ${activeTab === 'shipping' ? 'bg-[#111827] text-white border-[#111827]' : 'bg-white text-[#334155] border-[#cbd5e1] hover:border-[#94a3b8]'}`}
                >
                    Shipping & Returns
                </button>
            </div>

            {activeTab === 'details' && (
                <div className="space-y-4">
                    <Body color="secondary" className="text-[#334155] leading-relaxed">
                        {product.description}
                    </Body>
                    <div className="grid md:grid-cols-2 gap-x-8">
                        {detailsRows.map(([key, value], index) => (
                            <div key={`${key}-${index}`} className="flex justify-between items-center py-3 border-b border-[#e2e8f0] gap-6">
                                <span className="font-sans font-semibold text-[#1f2937] uppercase tracking-[0.1em] text-[11px]">{key}</span>
                                <span className="font-sans text-[#475569] text-sm text-right">{value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'designer' && (
                <div className="grid md:grid-cols-2 gap-x-8">
                    <div className="flex justify-between items-center py-3 border-b border-[#e2e8f0] gap-6">
                        <span className="font-sans font-semibold text-[#1f2937] uppercase tracking-[0.1em] text-[11px]">Designer</span>
                        <span className="font-sans text-[#475569] text-sm text-right">HS Global Curated</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-[#e2e8f0] gap-6">
                        <span className="font-sans font-semibold text-[#1f2937] uppercase tracking-[0.1em] text-[11px]">Style</span>
                        <span className="font-sans text-[#475569] text-sm text-right capitalize">{product.subcategory || product.category}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-[#e2e8f0] gap-6">
                        <span className="font-sans font-semibold text-[#1f2937] uppercase tracking-[0.1em] text-[11px]">Period</span>
                        <span className="font-sans text-[#475569] text-sm text-right">Contemporary</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-[#e2e8f0] gap-6">
                        <span className="font-sans font-semibold text-[#1f2937] uppercase tracking-[0.1em] text-[11px]">Production Type</span>
                        <span className="font-sans text-[#475569] text-sm text-right">New & Custom</span>
                    </div>
                </div>
            )}

            {activeTab === 'custom' && (
                <div className="space-y-4">
                    <Body color="secondary" className="text-[#334155] leading-relaxed">
                        We support product customization for dimension, finish, and edge profile requirements.
                    </Body>
                    <div className="grid md:grid-cols-2 gap-x-8">
                        <div className="flex justify-between items-center py-3 border-b border-[#e2e8f0] gap-6">
                            <span className="font-sans font-semibold text-[#1f2937] uppercase tracking-[0.1em] text-[11px]">Finish</span>
                            <span className="font-sans text-[#475569] text-sm text-right">{selectedFinish}</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-[#e2e8f0] gap-6">
                            <span className="font-sans font-semibold text-[#1f2937] uppercase tracking-[0.1em] text-[11px]">Thickness</span>
                            <span className="font-sans text-[#475569] text-sm text-right">{selectedThickness}</span>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'seller' && (
                <div className="grid md:grid-cols-2 gap-x-8">
                    <div className="flex justify-between items-center py-3 border-b border-[#e2e8f0] gap-6">
                        <span className="font-sans font-semibold text-[#1f2937] uppercase tracking-[0.1em] text-[11px]">Seller</span>
                        <span className="font-sans text-[#475569] text-sm text-right">HS Global Export</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-[#e2e8f0] gap-6">
                        <span className="font-sans font-semibold text-[#1f2937] uppercase tracking-[0.1em] text-[11px]">Seller Location</span>
                        <span className="font-sans text-[#475569] text-sm text-right">India</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-[#e2e8f0] gap-6">
                        <span className="font-sans font-semibold text-[#1f2937] uppercase tracking-[0.1em] text-[11px]">Seller Type</span>
                        <span className="font-sans text-[#475569] text-sm text-right">Vetted Professional Seller</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-[#e2e8f0] gap-6">
                        <span className="font-sans font-semibold text-[#1f2937] uppercase tracking-[0.1em] text-[11px]">Response</span>
                        <span className="font-sans text-[#475569] text-sm text-right">Typically within 24 hours</span>
                    </div>
                </div>
            )}

            {activeTab === 'shipping' && (
                <div className="grid md:grid-cols-2 gap-x-8">
                    <div className="flex justify-between items-center py-3 border-b border-[#e2e8f0] gap-6">
                        <span className="font-sans font-semibold text-[#1f2937] uppercase tracking-[0.1em] text-[11px]">Shipping</span>
                        <span className="font-sans text-[#475569] text-sm text-right">Ships from India</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-[#e2e8f0] gap-6">
                        <span className="font-sans font-semibold text-[#1f2937] uppercase tracking-[0.1em] text-[11px]">Rates</span>
                        <span className="font-sans text-[#475569] text-sm text-right">Calculated at checkout</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-[#e2e8f0] gap-6">
                        <span className="font-sans font-semibold text-[#1f2937] uppercase tracking-[0.1em] text-[11px]">Returns</span>
                        <span className="font-sans text-[#475569] text-sm text-right">Money-Back Guarantee</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-[#e2e8f0] gap-6">
                        <span className="font-sans font-semibold text-[#1f2937] uppercase tracking-[0.1em] text-[11px]">Cancellation</span>
                        <span className="font-sans text-[#475569] text-sm text-right">24-Hour Cancellation</span>
                    </div>
                </div>
            )}
            <p className="text-[11px] uppercase tracking-[0.1em] text-[#64748b] border-t border-[#e2e8f0] pt-3">
                Matches 1stDibs-style item taxonomy and transactional detail presentation.
            </p>
        </div>
    );
}
