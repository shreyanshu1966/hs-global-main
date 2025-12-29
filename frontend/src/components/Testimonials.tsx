import { useTranslation } from 'react-i18next';
import { InfiniteMovingCards } from './InfiniteMovingCards';
import TextReveal from "./TextReveal";

const testimonials = [
    {
        quote: "HS Global Export made the entire process seamless. Great granite quality, perfect color match, and timely delivery. Truly professional service.",
        name: "Ramesh P.",
        title: "Contractor, Prestige Constructions"
    },
    {
        quote: "We sourced marble for a hotel lobby project and the finish was simply stunning. HS Global's polish and quality control were top-notch.",
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
        title: "Homeowner, Mumbai"
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
        <section className="py-24 bg-white relative overflow-hidden flex flex-col items-center justify-center antialiased">
            <div className="container mx-auto px-4 mb-12 text-center">
                <TextReveal>
                    <span className="text-accent text-xs font-bold tracking-[0.2em] uppercase mb-4 block">Testimonials</span>
                    <h2 className="text-4xl md:text-5xl font-serif text-primary mb-6">{t('home.testimonials_title') || "Trusted by the World's Best"}</h2>
                </TextReveal>
                <TextReveal delay={0.2}>
                    <p className="text-gray-500 max-w-2xl mx-auto text-lg font-light">
                        {t('home.testimonials_subtitle') || "Hear directly from architects, designers, and homeowners who have transformed their spaces with us."}
                    </p>
                </TextReveal>
            </div>

            <div className="h-[20rem] rounded-md flex flex-col antialiased bg-white items-center justify-center relative overflow-hidden w-full">
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
