'use client';
import { useState } from "react";
import { ChevronDown, Truck, CreditCard, Globe, ClipboardCheck, Award, Building2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FAQ_CATEGORIES, type FAQItem } from "../../data/productFaqs";

// Icons live with the component (keep the shared data module JSX-free so the
// product page server component can import it for FAQPage JSON-LD).
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  shipping: <Truck className="w-4 h-4" strokeWidth={1.8} />,
  payment: <CreditCard className="w-4 h-4" strokeWidth={1.8} />,
  customs: <Globe className="w-4 h-4" strokeWidth={1.8} />,
  inspection: <ClipboardCheck className="w-4 h-4" strokeWidth={1.8} />,
  quality: <Award className="w-4 h-4" strokeWidth={1.8} />,
  company: <Building2 className="w-4 h-4" strokeWidth={1.8} />,
};

function FAQAccordionItem({ item, isOpen, onToggle }: { item: FAQItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-[#e8e8e8] last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-start justify-between gap-4 py-4 text-left group"
        aria-expanded={isOpen}
      >
        <span className="text-[13.5px] sm:text-[14px] font-medium text-[#1a1a1a] leading-snug group-hover:text-[#333] transition-colors">
          {item.question}
        </span>
        <span className={`shrink-0 mt-0.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
          <ChevronDown className="w-4 h-4 text-[#888]" strokeWidth={2} />
        </span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-4 pr-6">
              {Array.isArray(item.answer) ? (
                <ul className="space-y-1.5">
                  {item.answer.map((point, i) => (
                    <li key={i} className="flex items-start gap-2 text-[13px] text-[#555] leading-relaxed">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#bbb] shrink-0" />
                      {point}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[13px] text-[#555] leading-relaxed">{item.answer}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ProductFAQ() {
  const [activeCategory, setActiveCategory] = useState("shipping");
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggleItem = (key: string) => {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const currentCategory = FAQ_CATEGORIES.find((c) => c.id === activeCategory)!;

  return (
    <section className="bg-white py-14 lg:py-16 border-b border-[#e2e8f0]">
      <div className="container mx-auto px-6 max-w-5xl">
        {/* Header */}
        <div className="mb-10">
          <p className="text-[11px] font-semibold tracking-[0.18em] text-[#888] uppercase mb-2">Got questions?</p>
          <h2 className="text-[26px] sm:text-[30px] font-bold text-[#111] leading-tight tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Category tabs — sidebar on desktop, scrollable row on mobile */}
          <nav className="flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible shrink-0 lg:w-52 scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {FAQ_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setOpenItems({});
                }}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-left whitespace-nowrap lg:whitespace-normal transition-all text-[13px] font-medium shrink-0 lg:shrink lg:w-full
                  ${activeCategory === cat.id
                    ? "bg-[#111] text-white"
                    : "text-[#555] hover:bg-[#f5f5f5] hover:text-[#111]"
                  }`}
              >
                <span className={activeCategory === cat.id ? "text-white" : "text-[#888]"}>
                  {CATEGORY_ICONS[cat.id]}
                </span>
                {cat.label}
              </button>
            ))}
          </nav>

          {/* FAQ accordion */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18 }}
                className="bg-[#fafafa] rounded-2xl px-5 py-1 border border-[#ececec]"
              >
                {currentCategory.items.map((item, idx) => {
                  const key = `${activeCategory}-${idx}`;
                  return (
                    <FAQAccordionItem
                      key={key}
                      item={item}
                      isOpen={!!openItems[key]}
                      onToggle={() => toggleItem(key)}
                    />
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
