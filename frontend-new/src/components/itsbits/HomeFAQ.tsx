'use client';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { HOME_FAQ_ITEMS } from '../../data/homeFaq';

// Home-page FAQ accordion. Questions and answers come from the shared homeFaq
// data (grounded in the site's policy pages) so the visible copy and the
// FAQPage JSON-LD in app/page.tsx never drift apart.
const HomeFAQ = () => {
  const [open, setOpen] = useState<number | null>(0);

  if (HOME_FAQ_ITEMS.length === 0) return null;

  return (
    <section className="w-full px-4 py-14 md:px-8 lg:px-12 bg-white">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-[10px] font-semibold tracking-[0.22em] text-stone-400 uppercase mb-3 select-none">
            Frequently Asked
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Questions, answered
          </h2>
        </div>

        <div className="divide-y divide-stone-200 border-y border-stone-200">
          {HOME_FAQ_ITEMS.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.question}>
                <h3>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="w-full flex items-center justify-between gap-4 py-5 text-left"
                  >
                    <span className="text-sm md:text-base font-semibold text-gray-900">
                      {item.question}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 flex-shrink-0 text-stone-400 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                      strokeWidth={2}
                    />
                  </button>
                </h3>
                {isOpen && (
                  <div className="pb-5 -mt-1 text-sm md:text-[15px] leading-relaxed text-stone-600">
                    <p>{item.answer}</p>
                    <a
                      href={item.href}
                      className="inline-block mt-2 text-xs font-semibold text-stone-800 underline underline-offset-2 hover:text-stone-950"
                    >
                      {item.hrefLabel} →
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HomeFAQ;
