const values = [
    { label: "Handcrafted", detail: "40+ hours per piece" },
    { label: "Ethically Sourced", detail: "Direct from Indian quarries" },
    { label: "Global Delivery", detail: "Shipped to 30+ countries" },
    { label: "Bespoke Design", detail: "Tailored to your vision" },
    { label: "50-Point Inspection", detail: "Quality guaranteed" },
    { label: "Heritage Craft", detail: "Generations of expertise" },
];

const ValueMarquee = () => {
    // Double the items for seamless loop
    const items = [...values, ...values];

    return (
        <section className="bg-[#F7F5F0] border-y border-[#E8E3DC] overflow-hidden select-none">
            <div
                className="flex items-center py-5 md:py-6 whitespace-nowrap"
                style={{
                    animation: "marqueeScroll 40s linear infinite",
                    width: "fit-content",
                }}
            >
                {items.map((v, i) => (
                    <div key={i} className="flex items-center px-6 md:px-10">
                        {/* Diamond separator */}
                        <span className="text-[#C4A265] text-[8px] mr-6 md:mr-10">◆</span>
                        <div className="flex flex-col">
                            <span className="text-[11px] md:text-xs font-semibold tracking-[0.2em] uppercase text-[#1a1a1a]">
                                {v.label}
                            </span>
                            <span className="text-[10px] tracking-wider text-[#8A8682] mt-0.5">
                                {v.detail}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
        @keyframes marqueeScroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
        </section>
    );
};

export default ValueMarquee;
