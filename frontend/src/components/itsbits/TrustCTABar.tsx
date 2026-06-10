const ctas = [
  {
    href: '/products',
    label: 'Bespoke Customization',
    sub: 'Every piece shaped to your vision',
    svg: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 flex-shrink-0">
        <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.25" />
        <path d="M24 8L28.5 16H19.5L24 8Z" fill="currentColor" opacity="0.15" />
        <path d="M24 40L19.5 32H28.5L24 40Z" fill="currentColor" opacity="0.15" />
        <path d="M8 24L16 19.5V28.5L8 24Z" fill="currentColor" opacity="0.15" />
        <path d="M40 24L32 28.5V19.5L40 24Z" fill="currentColor" opacity="0.15" />
        <rect x="17" y="17" width="14" height="14" rx="3" stroke="currentColor" strokeWidth="1.6" />
        <path d="M21 24h6M24 21v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="24" cy="24" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    href: '/products',
    label: 'Free Global Delivery',
    sub: 'USA, UK & worldwide doorstep',
    svg: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 flex-shrink-0">
        <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="1.5" opacity="0.2" />
        <ellipse cx="24" cy="24" rx="10" ry="14" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 24h28" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" />
        <path d="M13 16c3.7 2.2 7 3.2 11 3.2s7.3-1 11-3.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M13 32c3.7-2.2 7-3.2 11-3.2s7.3 1 11 3.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M30 38l4 4M30 38l-4-4M30 38h-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
      </svg>
    ),
  },
  {
    href: '/about',
    label: 'Certified Premium Stone',
    sub: 'Finest Italian & Indian marble',
    svg: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 flex-shrink-0">
        <path d="M24 4l4.5 8.5L38 14l-7 7 1.5 10L24 26.5 15.5 31l1.5-10L10 14l9.5-1.5L24 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="currentColor" fillOpacity="0.08" />
        <path d="M19 44v-6a5 5 0 0 1 10 0v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M16 44h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M21 21l2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: '/about',
    label: 'Handcrafted Heritage',
    sub: 'Artisans with 25+ years mastery',
    svg: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 flex-shrink-0">
        <path d="M14 28c0-3.3 2-5 4-5s3 1.5 3 1.5S22 23 24 23s3.4 1.5 3.4 1.5S28.5 23 30 23s4 1.7 4 5v2c0 5-4 9-10 9s-10-4-10-9v-2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="currentColor" fillOpacity="0.08" />
        <path d="M21 24.5V20a3 3 0 0 1 6 0v4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M17 25V18a3 3 0 0 1 4-2.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M31 25V18a3 3 0 0 0-4-2.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M18 34c1.5 1.5 3.5 2 6 2s4.5-.5 6-2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.5" />
      </svg>
    ),
  },
  {
    href: '/contact',
    label: 'Direct Manufacturer',
    sub: 'Zero middlemen, factory pricing',
    svg: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 flex-shrink-0">
        <rect x="6" y="26" width="36" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.06" />
        <path d="M6 26l8-14h24l8 14" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <rect x="18" y="32" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
        <path d="M10 26v16M20 26v6M28 26v6M38 26v16" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.35" />
        <path d="M14 19h4M30 19h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.5" />
      </svg>
    ),
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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-px bg-stone-200/60 rounded-2xl overflow-hidden border border-stone-200">
        {ctas.map(({ href, label, sub, svg }) => (
          <a
            key={label}
            href={href}
            className="group flex flex-col items-center gap-3 px-4 py-7 transition-colors duration-200 text-center hover:bg-stone-100/80"
            style={{ background: '#f4f3ec' }}
          >
            {/* Icon */}
            <span className="text-stone-600 group-hover:text-stone-800 transition-colors duration-200">
              {svg}
            </span>

            {/* Thin divider */}
            <span className="block w-6 h-px bg-stone-300 group-hover:bg-stone-400 transition-colors duration-200" />

            {/* Text */}
            <span className="text-stone-800 font-semibold text-sm leading-tight tracking-wide">
              {label}
            </span>
            <span className="text-stone-400 text-[11px] leading-snug -mt-1">
              {sub}
            </span>
          </a>
        ))}
      </div>
    </div>
  </section>
);

export default TrustCTABar;
