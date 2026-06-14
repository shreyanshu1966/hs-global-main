import { Factory, Wand2, Globe, ShieldCheck, Hammer } from 'lucide-react';

const ctas = [
  {
    href: '/contact',
    label: 'Direct Manufacturer',
    sub: 'Zero middlemen, factory pricing',
    svg: <Factory strokeWidth={1.5} />,
  },
  {
    href: '/products',
    label: 'Bespoke Customization',
    sub: 'Every piece shaped to your vision',
    svg: <Wand2 strokeWidth={1.5} />,
  },
  {
    href: '/products',
    label: 'Free Global Delivery',
    sub: 'USA, UK & worldwide doorstep',
    svg: <Globe strokeWidth={1.5} />,
  },
  {
    href: '/about',
    label: 'Certified Premium Stone',
    sub: 'Finest Italian & Indian marble',
    svg: <ShieldCheck strokeWidth={1.5} />,
  },
  {
    href: '/about',
    label: 'Handcrafted Heritage',
    sub: 'Artisans with 25+ years mastery',
    svg: <Hammer strokeWidth={1.5} />,
  },
];

const TrustCTABar = () => (
  <section className="w-full py-8 px-4 md:px-8 lg:px-12 overflow-hidden" style={{ background: '#f4f3ec' }}>
    <div className="max-w-7xl mx-auto">
      {/* Section label */}
      <p className="text-[10px] font-semibold tracking-[0.22em] text-stone-400 uppercase text-center mb-6 select-none">
        Why HS Global Export
      </p>

      {/* CTA grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-px bg-stone-200/60 rounded-2xl overflow-hidden border border-stone-200">
        {ctas.map(({ href, label, sub, svg }) => (
          <a
            key={label}
            href={href}
            className="group flex flex-row sm:flex-col items-center gap-4 sm:gap-3 px-4 py-4 sm:py-7 transition-colors duration-200 text-left sm:text-center hover:bg-stone-100/80"
            style={{ background: '#f4f3ec' }}
          >
            {/* Icon */}
            <span className="text-stone-600 group-hover:text-stone-800 transition-colors duration-200 flex-shrink-0 [&>svg]:w-8 [&>svg]:h-8 sm:[&>svg]:w-10 sm:[&>svg]:h-10">
              {svg}
            </span>

            {/* Thin divider — desktop only */}
            <span className="hidden sm:block w-6 h-px bg-stone-300 group-hover:bg-stone-400 transition-colors duration-200" />

            {/* Text */}
            <span className="flex flex-col gap-0.5">
              <span className="text-stone-800 font-semibold text-sm leading-tight tracking-wide">
                {label}
              </span>
              <span className="text-stone-400 text-[11px] leading-snug">
                {sub}
              </span>
            </span>
          </a>
        ))}
      </div>
    </div>
  </section>
);

export default TrustCTABar;
