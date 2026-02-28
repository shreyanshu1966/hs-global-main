const values = [
    { label: "Handcrafted", detail: "40+ hours per piece" },
    { label: "Ethically Sourced", detail: "Direct from quarries" },
    { label: "Global Delivery", detail: "Shipped worldwide" },
    { label: "Bespoke Design", detail: "Tailored to your vision" },
];

const BrandValues = () => {
    return (
        <section className="bg-[#FAFAF8] border-y border-stone-200/60">
            <div className="max-w-7xl mx-auto px-6 md:px-12">
                {/* Desktop: horizontal row */}
                <div className="hidden md:flex items-center justify-between py-8">
                    {values.map((v, i) => (
                        <div key={i} className="flex items-center gap-3">
                            {i > 0 && (
                                <div className="w-[1px] h-10 bg-stone-300/50 mr-8 lg:mr-12" />
                            )}
                            <div className="flex flex-col">
                                <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-stone-800">
                                    {v.label}
                                </span>
                                <span className="text-[10px] tracking-wider text-stone-400 mt-0.5">
                                    {v.detail}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Mobile: 2x2 grid */}
                <div className="md:hidden grid grid-cols-2 gap-y-6 gap-x-4 py-7">
                    {values.map((v, i) => (
                        <div
                            key={i}
                            className="flex flex-col items-center text-center"
                        >
                            <span className="text-[11px] font-semibold tracking-[0.15em] uppercase text-stone-800">
                                {v.label}
                            </span>
                            <span className="text-[10px] tracking-wider text-stone-400 mt-0.5">
                                {v.detail}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default BrandValues;
