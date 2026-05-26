import { useState } from "react";
import { ChevronDown, Truck, CreditCard, Globe, ClipboardCheck, Award, Building2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FAQItem {
  question: string;
  answer: string | string[];
}

interface FAQCategory {
  id: string;
  label: string;
  icon: React.ReactNode;
  items: FAQItem[];
}

const FAQ_CATEGORIES: FAQCategory[] = [
  {
    id: "shipping",
    label: "Shipping & Logistics",
    icon: <Truck className="w-4 h-4" strokeWidth={1.8} />,
    items: [
      {
        question: "What shipping methods do you offer?",
        answer:
          "We offer both FCL (Full Container Load) and LCL (Less than Container Load) international shipping from major Indian ports to destinations worldwide.",
      },
      {
        question: "How are marble slabs and furniture protected during transit?",
        answer:
          "All stone slabs, luxury furniture, and marble products are packed in ISPM-15 certified heat-treated wooden crates with heavy foam padding to prevent movement and breakage during sea transit.",
      },
      {
        question: "Can I track my shipment?",
        answer:
          "Yes. Once your container is shipped, we provide the Bill of Lading (B/L) and shipment tracking credentials so you can monitor your cargo in real time.",
      },
      {
        question: "Is transit insurance included?",
        answer:
          "Yes. Every shipment is covered by comprehensive marine transit insurance to protect your investment against severe transit damage.",
      },
    ],
  },
  {
    id: "payment",
    label: "Payment & Transactions",
    icon: <CreditCard className="w-4 h-4" strokeWidth={1.8} />,
    items: [
      {
        question: "What payment methods do you accept?",
        answer: [
          "Bank Wire Transfers (T/T)",
          "Irrevocable Letters of Credit (L/C) for bulk orders",
        ],
      },
      {
        question: "Are your bank transactions secure?",
        answer:
          "Yes. Payments are made directly to our verified corporate bank account in Ahmedabad, India, and are supported with official Proforma Invoices.",
      },
      {
        question: "Do you accept Letters of Credit (L/C)?",
        answer:
          "Yes. For high-volume and bulk container orders, we accept 100% Irrevocable Letters of Credit at sight issued by prime international banks.",
      },
      {
        question: "What documents are provided with shipments?",
        answer: [
          "Commercial Invoice",
          "Packing List",
          "Certificate of Origin",
          "Shipping Bill",
        ],
      },
    ],
  },
  {
    id: "customs",
    label: "Customs & Duties",
    icon: <Globe className="w-4 h-4" strokeWidth={1.8} />,
    items: [
      {
        question: "Which Incoterms do you support?",
        answer:
          "We primarily operate under FOB (Free on Board) and CIF (Cost, Insurance, and Freight) international trade terms.",
      },
      {
        question: "Who handles customs clearance and import duties?",
        answer:
          "Import duties, taxes, and destination brokerage fees are generally handled by the buyer or their local clearing agent.",
      },
      {
        question: "Do you provide customs documentation?",
        answer:
          "Yes. We provide fully compliant export paperwork tailored to your country's import regulations to help speed up customs clearance.",
      },
      {
        question: "Can you recommend a local customs broker?",
        answer:
          "Yes. If needed, our team can help recommend trusted local customs brokers for smoother clearance.",
      },
    ],
  },
  {
    id: "inspection",
    label: "Inspection & Returns",
    icon: <ClipboardCheck className="w-4 h-4" strokeWidth={1.8} />,
    items: [
      {
        question: "Do you offer a pre-shipment inspection?",
        answer:
          "Yes. Before shipment, we provide high-resolution videos, detailed photos, and exact measurements of your products for final approval.",
      },
      {
        question: "Is there an inspection period after delivery?",
        answer:
          "Yes. We offer a 30-day inspection window starting from the date your shipment clears your local port.",
      },
      {
        question: "What should I do if products arrive damaged or incorrect?",
        answer:
          "Please document the issue with photos or videos within 30 days. We will arrange a priority replacement or provide a proportional refund/credit based on the issue.",
      },
      {
        question: "What types of issues qualify for claims?",
        answer: [
          "Structural defects",
          "Transit damage",
          "Products not matching approved technical specifications",
        ],
      },
    ],
  },
  {
    id: "quality",
    label: "Quality Assurance",
    icon: <Award className="w-4 h-4" strokeWidth={1.8} />,
    items: [
      {
        question: "How do you ensure product quality?",
        answer:
          "We follow strict quality control procedures, from quarry selection to final finishing, to meet international luxury standards.",
      },
      {
        question: "Where are your stones sourced from?",
        answer:
          "Our natural stones are hand-selected from premium quarries to ensure consistent color, veining, and structural integrity.",
      },
      {
        question: "Do you offer custom dimensions and finishes?",
        answer: [
          "High-gloss diamond polish",
          "Matte honed finishes",
        ],
      },
      {
        question: "Are your products durable for long-term use?",
        answer:
          "Yes. Our multi-stage finishing process is designed to maximize durability against weathering, stains, and daily wear.",
      },
    ],
  },
  {
    id: "company",
    label: "Company & Support",
    icon: <Building2 className="w-4 h-4" strokeWidth={1.8} />,
    items: [
      {
        question: "Where is your corporate office located?",
        answer:
          "C-108, Titanium Business Park, Near Railway Under Bridge, Makarba, Ahmedabad, Gujarat, 380051, India.",
      },
      {
        question: "How can I contact your export support team?",
        answer:
          "You can contact us via direct phone, WhatsApp, or official corporate email for wholesale inquiries and RFQs.",
      },
      {
        question: "How quickly do you respond to inquiries?",
        answer:
          "We respond to all wholesale requests, material inquiries, and custom RFQs within 12 business hours.",
      },
    ],
  },
];

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
                  {cat.icon}
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
