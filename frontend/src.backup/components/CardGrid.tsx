import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface Card {
  id: number;
  title: string;
  description: string;
  image: string;
}

interface CardGridProps {
  cards: Card[];
  onCardClick: (id: number) => void;
}

const CardGrid: React.FC<CardGridProps> = ({ cards, onCardClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { contextSafe } = useGSAP({ scope: containerRef });

  useGSAP(() => {
    const cardsElements = gsap.utils.toArray('.card-item'); // Select elements within scope? No, utils.toArray selector string might need tweaking if scoped, but generic class is fine if scope is provided to useGSAP?
    // Actually useGSAP scope makes `gsap.utils.toArray('.card-item')` inside it effectively `containerRef.current.querySelectorAll('.card-item')` if documented correctly, OR we should use scoped selector.
    // Standard GSAP way:

    gsap.fromTo('.card-item',
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.1,
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top bottom-=100',
          toggleActions: 'play none none reverse'
        }
      }
    );
  }, { scope: containerRef });

  const handleMouseEnter = contextSafe((e: React.MouseEvent<HTMLDivElement>) => {
    gsap.to(e.currentTarget, { y: -5, duration: 0.2, ease: "power1.out" });
    const img = e.currentTarget.querySelector('img');
    if (img) gsap.to(img, { scale: 1.1, duration: 0.5, ease: "power1.out" }); // Replicating the css hover scale
  });

  const handleMouseLeave = contextSafe((e: React.MouseEvent<HTMLDivElement>) => {
    gsap.to(e.currentTarget, { y: 0, duration: 0.2, ease: "power1.in" });
    const img = e.currentTarget.querySelector('img');
    if (img) gsap.to(img, { scale: 1, duration: 0.5, ease: "power1.in" });
  });

  return (
    <div ref={containerRef} className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {cards.map((card) => (
        <div
          key={card.id}
          className="card-item bg-white rounded-lg overflow-hidden shadow-lg cursor-pointer"
          onClick={() => onCardClick(card.id)}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="relative overflow-hidden aspect-w-16 aspect-h-9">
            <img
              src={card.image}
              alt={card.title}
              className="w-full h-full object-cover transform transition-transform duration-500" // Kept css transition as fallback or base, but GSAP overwrites inline styles usually
            />
          </div>
          <div className="p-6">
            <h3 className="text-xl font-bold mb-2 text-primary">{card.title}</h3>
            <p className="text-gray-600">{card.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CardGrid;