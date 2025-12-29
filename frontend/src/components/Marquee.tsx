import React from 'react';
import { Sparkles } from 'lucide-react'; // Using an icon separator

const Marquee = () => {
  const items = [
    "Premium Natural Stone",
    "Global Export",
    "Custom Fabrication",
    "Luxury Interiors",
    "Architectural Excellence",
    "Italian Marble",
    "Indian Granite"
  ];

  return (
    <div className="relative flex overflow-x-hidden bg-primary text-white py-8 border-y border-white/5 select-none">
      <div className="animate-marquee whitespace-nowrap flex items-center">
        {[...items, ...items, ...items, ...items].map((text, i) => (
          <span key={i} className="mx-12 lg:mx-16 text-xl lg:text-3xl font-serif font-light tracking-wide italic flex items-center gap-8 text-white/90">
            {text}
            <Sparkles className="w-4 h-4 text-accent animate-pulse" />
          </span>
        ))}
      </div>
      <div className="absolute top-0 py-8 animate-marquee2 whitespace-nowrap flex items-center">
        {[...items, ...items, ...items, ...items].map((text, i) => (
          <span key={i} className="mx-12 lg:mx-16 text-xl lg:text-3xl font-serif font-light tracking-wide italic flex items-center gap-8 text-white/90">
            {text}
            <Sparkles className="w-4 h-4 text-accent animate-pulse" />
          </span>
        ))}
      </div>
      <style>{`
        .animate-marquee {
          animation: marquee 60s linear infinite;
        }
        .animate-marquee2 {
          animation: marquee2 60s linear infinite;
        }
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-100%); }
        }
        @keyframes marquee2 {
          0% { transform: translateX(100%); }
          100% { transform: translateX(0%); }
        }
      `}</style>
    </div>
  );
};

export default Marquee;
