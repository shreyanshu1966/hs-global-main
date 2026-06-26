// Shared product FAQ data — consumed by the ProductFAQ UI component (icons added
// there, keyed by category id) and by the product page server component to emit
// FAQPage JSON-LD. Keep this file free of JSX so it can be imported on the server.

export interface FAQItem {
  question: string;
  answer: string | string[];
}

export interface FAQCategoryData {
  id: string;
  label: string;
  items: FAQItem[];
}

export const FAQ_CATEGORIES: FAQCategoryData[] = [
  {
    id: "shipping",
    label: "Shipping & Logistics",
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

// Flattened Q&A list for FAQPage structured data.
export const ALL_FAQ_ITEMS: FAQItem[] = FAQ_CATEGORIES.flatMap((c) => c.items);

// Normalise an answer (string | string[]) into a single plain-text string,
// as required by schema.org FAQPage acceptedAnswer.text.
export function faqAnswerToText(answer: string | string[]): string {
  return Array.isArray(answer) ? answer.join(". ") + "." : answer;
}
