import React from 'react';
import { Quote } from 'lucide-react';

const testimonials = [
    {
        id: 1,
        name: 'Ramesh P.',
        position: 'Contractor',
        company: 'Prestige Constructions',
        content:
            'HS Global Export made the entire process seamless. Great granite quality, perfect color match, and timely delivery.',
        image:
            'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
        location: 'Jaipur, India',
    },
    {
        id: 2,
        name: 'Aisha Khan',
        position: 'Interior Designer',
        company: 'Studio A Interiors',
        content:
            'We sourced marble for a hotel lobby project and the finish was simply stunning. HS Global\'s polish and quality control were top-notch.',
        image:
            'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
        location: 'Dubai, UAE',
    },
    {
        id: 3,
        name: 'David Kim',
        position: 'Hospitality Owner',
        company: 'Premium Stay Group',
        content:
            'Their granite reception desks and marble coffee tables became instant highlights. The export quality exceeded expectations.',
        image:
            'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
        location: 'Seoul, South Korea',
    },
    {
        id: 4,
        name: 'Neha Sharma',
        position: 'Homeowner',
        company: 'Private Residence',
        content:
            'The marble console table I ordered was absolutely beautiful. You can feel the craftsmanship and attention to detail in every inch.',
        image:
            'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
        location: 'Mumbai, India',
    },
    {
        id: 5,
        name: 'Ali Rehman',
        position: 'Stone Distributor',
        company: 'Al Noor Trading',
        content:
            'I\'ve worked with several suppliers, but HS Global stands out for reliability and transparency. Shipments are always consistent.',
        image:
            'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
        location: 'Muscat, Oman',
    },
    {
        id: 6,
        name: 'Lina D.',
        position: 'Boutique Owner',
        company: 'Casa di Luxe Interiors',
        content:
            'We customized marble tabletops for our boutique and the result was just perfect. Team matched the color tones with our décor.',
        image:
            'https://images.pexels.com/photos/774548/pexels-photo-774548.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
        location: 'Singapore',
    },
];

const Testimonials = () => {
    return (
        <section className="py-24 bg-white relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-gray-50 rounded-full blur-3xl opacity-50 z-0 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-gray-50 rounded-full blur-3xl opacity-50 z-0 pointer-events-none"></div>

            <div className="container mx-auto px-4 md:px-6 mb-12 text-center relative z-10">
                <h2
                    className="text-3xl md:text-5xl font-light text-gray-900 mb-4 md:mb-6 tracking-tight"
                >
                    client stories
                </h2>
                <p
                    className="text-gray-500 max-w-2xl mx-auto text-sm md:text-lg font-light leading-relaxed"
                >
                    Trusted by homeowners, architects, and contractors globally.
                </p>
            </div>

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                {/* Mobile: 2 cols, Desktop: 3 cols */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-8">
                    {testimonials.map((testimonial, index) => (
                        <div
                            key={testimonial.id}
                            className={`bg-gray-50/50 backdrop-blur-sm p-4 md:p-8 rounded-none border-l-2 border-transparent hover:border-black hover:bg-gray-50 transition-all duration-500 group flex-col h-full ${index >= 4 ? 'hidden md:flex' : 'flex'}`}
                        >
                            <Quote className="w-5 h-5 md:w-8 md:h-8 text-gray-200 group-hover:text-black/10 transition-colors mb-4 md:mb-6 flex-shrink-0" />

                            <p className="text-xs md:text-base text-gray-600 font-light leading-relaxed mb-6 md:mb-8 flex-grow line-clamp-5 md:line-clamp-none">
                                "{testimonial.content}"
                            </p>

                            <div className="flex flex-col md:flex-row md:items-center mt-auto">
                                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden mb-3 md:mb-0 md:mr-4 flex-shrink-0">
                                    <img
                                        src={testimonial.image}
                                        alt={testimonial.name}
                                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-100 group-hover:scale-110"
                                    />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-medium text-gray-900 text-xs md:text-sm tracking-wide truncate">{testimonial.name}</h4>
                                    {/* Location shown on mobile too now since we have more space with 2 cols */}
                                    <p className="text-[10px] md:text-xs text-gray-400 uppercase tracking-widest mt-0.5 truncate">{testimonial.location}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
