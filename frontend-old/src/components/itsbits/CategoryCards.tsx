interface CategoryCard {
  title: string;
  subtitle: string;
  image: string;
  link: string;
}

interface CategoryCardsProps {
  title?: string;
  cards?: CategoryCard[];
}

const CategoryCards = ({ title = '', cards = [] }: CategoryCardsProps) => {
  if (cards.length === 0) return null;

  return (
    <section className="w-full px-4 py-10 md:px-8 lg:px-12">
      {title && (
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-8">
          {title}
        </h2>
      )}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
        {cards.slice(0, 4).map((card, i) => (
          <a
            key={i}
            href={card.link || '/products'}
            className="group relative overflow-hidden rounded-2xl aspect-[3/4] block"
          >
            {/* Image */}
            {card.image ? (
              <img
                src={card.image}
                alt={card.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 bg-gray-200" />
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            {/* Text */}
            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
              <p className="text-white font-semibold text-base md:text-lg leading-tight drop-shadow">
                {card.title}
              </p>
              {card.subtitle && (
                <p className="text-white/75 text-xs md:text-sm mt-0.5">
                  {card.subtitle}
                </p>
              )}
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};

export default CategoryCards;
