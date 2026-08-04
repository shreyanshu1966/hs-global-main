'use client';
import { Star, Quote } from 'lucide-react';
import { TESTIMONIALS } from '../../data/testimonials';

const Stars = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
    {Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-amber-500 fill-amber-500' : 'text-stone-300'}`}
        strokeWidth={1.5}
      />
    ))}
  </div>
);

const Testimonials = () => (
  <section className="w-full px-4 py-14 md:px-8 lg:px-12" style={{ background: '#f4f3ec' }}>
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-10">
        <p className="text-[10px] font-semibold tracking-[0.22em] text-stone-400 uppercase mb-3 select-none">
          Client Voices
        </p>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
          Trusted by designers &amp; buyers worldwide
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
        {TESTIMONIALS.map((t) => (
          <figure
            key={t.name}
            className="relative flex flex-col bg-white rounded-2xl border border-stone-200 p-6 md:p-7 shadow-sm"
          >
            <Quote className="absolute top-5 right-5 w-8 h-8 text-stone-200" strokeWidth={1.5} aria-hidden="true" />
            <Stars rating={t.rating} />
            <blockquote className="mt-4 text-sm md:text-[15px] leading-relaxed text-stone-700 flex-1">
              &ldquo;{t.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-5 pt-4 border-t border-stone-100">
              <span className="block text-sm font-semibold text-gray-900">{t.name}</span>
              <span className="block text-xs text-stone-500">
                {t.role} · {t.location}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  </section>
);

export default Testimonials;
