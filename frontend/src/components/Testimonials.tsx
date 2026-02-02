import { useTranslation } from 'react-i18next';
import { InfiniteMovingCards } from './InfiniteMovingCards';
import TextReveal from "./TextReveal";

const testimonials = [
    {
        quote: "HS Global Export made the entire process seamless. Great granite quality, perfect color match, and timely delivery. Truly professional service.",
        name: "Ramesh P.",
        title: "Prestige Constructions"
    },
    {
        quote: "We sourced marble for a hotel lobby project and the finish was stunning. HS Global's polish and quality control were top-notch.",
        name: "Aisha Khan",
        title: "Interior Designer, Dubai"
    },
    {
        quote: "Their granite reception desks and marble coffee tables became instant highlights. The export quality exceeded expectations.",
        name: "David Kim",
        title: "Hospitality Owner, Seoul"
    },
    {
        quote: "The marble console table I ordered was absolutely beautiful. You can feel the craftsmanship and attention to detail in every inch.",
        name: "Neha Sharma",
        title: "Mumbai, IN"
    },
    {
        quote: "I've worked with several suppliers, but HS Global stands out for reliability and transparency. Shipments are always consistent.",
        name: "Ali Rehman",
        title: "Stone Distributor, Oman"
    },
];

const Testimonials = () => {
    const { t } = useTranslation();

    return (
        <section className="py-24 md:py-32 bg-white relative overflow-hidden">
            <div className="container mx-auto px-6 md:px-12 mb-16 md:mb-24">
                <div className="flex flex-col md:flex-row justify-between items-end gap-8">
                    <TextReveal>
                        <span className="text-xs font-bold tracking-[0.2em] uppercase text-stone-500 mb-6 block">Voices</span>
                        <h2 className="font-serif text-5xl md:text-6xl text-primary leading-tight">
                            Trusted by <br />
                            <span className="italic text-stone-400">Visionaries.</span>
                        </h2>
                    </TextReveal>

                    <TextReveal delay={0.2}>
                        <div className="max-w-xs text-stone-500 text-sm leading-relaxed text-right md:text-left">
                            {t('home.testimonials_subtitle') || "From private residences to commercial landmarks, our stone defines spaces across the globe."}
                        </div>
                    </TextReveal>
                </div>
            </div>

            <div className="w-full relative overflow-hidden pb-12">
                <InfiniteMovingCards
                    items={testimonials}
                    direction="right"
                    speed="slow"
                />
            </div>
        </section>
    );
};

export default Testimonials;
