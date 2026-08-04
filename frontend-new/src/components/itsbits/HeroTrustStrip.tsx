'use client';
import { Award, Globe2, Factory, ShieldCheck } from 'lucide-react';

const items = [
  { icon: Award, label: '25+ Years', sub: 'Master craftsmanship' },
  { icon: Globe2, label: '40+ Countries', sub: 'Worldwide exports' },
  { icon: Factory, label: 'Direct Factory', sub: 'Zero middlemen' },
  { icon: ShieldCheck, label: 'Insured Delivery', sub: 'Door-to-door cover' },
];

// Compact horizontal trust strip shown directly beneath the hero carousel.
// Distinct from the larger "Why HS Global" TrustCTABar grid further down the page.
const HeroTrustStrip = () => (
  <section
    aria-label="Why choose HS Global Export"
    className="w-full bg-[#111827] text-white border-b border-white/10"
  >
    <ul className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
      {items.map(({ icon: Icon, label, sub }) => (
        <li
          key={label}
          className="flex items-center justify-center gap-3 px-3 py-4 md:py-5 text-center"
        >
          <Icon strokeWidth={1.5} className="w-6 h-6 md:w-7 md:h-7 text-white/70 flex-shrink-0" />
          <span className="flex flex-col leading-tight text-left">
            <span className="text-sm md:text-base font-semibold tracking-wide">{label}</span>
            <span className="text-[11px] md:text-xs text-white/50">{sub}</span>
          </span>
        </li>
      ))}
    </ul>
  </section>
);

export default HeroTrustStrip;
