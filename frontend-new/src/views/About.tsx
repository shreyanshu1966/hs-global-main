'use client';
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Globe, Award, Target, Users } from "lucide-react";
import { getResponsiveImage, getSrcSet } from "../utils/responsive-image-helper";
import VelocityScroll from "../components/VelocityScroll";
import Magnet from "../components/Magnet";
import ShinyText from "../components/ShinyText";
import ScrollReveal from "../components/ScrollReveal";

const About = () => {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="bg-[#FFFFFF] text-gray-900 selection:bg-black selection:text-white overflow-x-hidden">

      <Helmet>
        {/* Basic SEO */}
        <title>Best Marble Sink, Marble Decor, Granite Sink, Tiles - USA, UK and Across Worldwide</title>
        <meta name="description" content="HS Global Export offers premium marble sinks, granite sinks, tiles, and marble décor, supplying high-quality natural stone products across the USA, UK, and worldwide." />
        <meta name="keywords" content="About Us, Best Marble Sink, Marble Decor, Granite Sink, Marble Tiles Exporter, Granite Tiles Supplier, Marble Sink Manufacturer, Luxury Marble Decor, Natural Stone Sinks, Premium Granite Sink, Marble Tiles USA, Marble Tiles UK, Granite & Marble Tiles Worldwide, Marble Products Exporter, Global Marble Supplier, Marble & Granite Export Worldwide, High-Quality Marble Tiles, Custom Marble Sink, Stone Decor Manufacturer, International Marble Exporter" />
        <meta name="author" content="HS Global Export" />
        <meta name="robots" content="index, follow" />

        {/* Canonical URL */}
        <link rel="canonical" href="https://www.hsglobalexport.com/about" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.hsglobalexport.com/about" />
        <meta property="og:site_name" content="HS Global Export" />
        <meta property="og:title" content="Best Marble Sink, Marble Decor, Granite Sink, Tiles - USA, UK and Across Worldwide" />
        <meta property="og:description" content="HS Global Export offers premium marble sinks, granite sinks, tiles, and marble décor, supplying high-quality natural stone products across the USA, UK, and worldwide." />
        <meta property="og:image" content="https://www.hsglobalexport.com/og-image.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="HS Global Export - About Our Company" />
        <meta property="og:locale" content="en_US" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://www.hsglobalexport.com/about" />
        <meta name="twitter:title" content="Best Marble Sink, Marble Decor, Granite Sink, Tiles - USA, UK and Across Worldwide" />
        <meta name="twitter:description" content="HS Global Export offers premium marble sinks, granite sinks, tiles, and marble décor, supplying high-quality natural stone products across the USA, UK, and worldwide." />
        <meta name="twitter:image" content="https://www.hsglobalexport.com/og-image.jpg" />
        <meta name="twitter:image:alt" content="HS Global Export - About Our Company" />

        {/* Schema.org AboutPage */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AboutPage",
            "name": "About HS Global Export",
            "description": "Learn about HS Global Export's heritage in handcrafted premium marble supply",
            "url": "https://hsglobalexport.com/about",
            "mainEntity": {
              "@type": "Organization",
              "name": "HS Global Export",
              "foundingDate": "1985",
              "foundingLocation": {
                "@type": "Place",
                "address": {
                  "@type": "PostalAddress",
                  "addressLocality": "Ahmedabad",
                  "addressRegion": "Gujarat",
                  "addressCountry": "IN"
                }
              },
              "description": "Premium marble furniture and handcrafted natural stone products manufacturer with nearly 50 years of family heritage."
            }
          })}
        </script>
      </Helmet>

      {/* 1. SCROLLYTELLING: Origin Story - Unified Scaled Layout */}
      <StickyStorySection />

      {/* 3. MARQUEE SEPARATOR */}
      <div className="py-[clamp(2rem,4vw,3rem)] border-y border-gray-100 bg-black text-white">
        <VelocityScroll
          items={["Handcrafted", "Heritage", "Natural Stone", "Global Exporter", "Artisanal", "Timeless"]}
          default_velocity={3}
          className="font-serif text-[clamp(2rem,6vw,4rem)] opacity-80"
        />
      </div>

      {/* 4. PHILOSOPHY: Refined Bento Grid - Scaled Grid */}
      <section className="py-[clamp(4rem,10vw,8rem)] px-[clamp(1.5rem,4vw,6rem)] bg-[#F9F9F7]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-[clamp(3rem,8vw,6rem)] grid grid-cols-1 md:grid-cols-2 gap-[clamp(2rem,4vw,3rem)] items-end">
            <div>
              <ShinyText
                text="The Art of Stone"
                className="text-[clamp(0.625rem,1.2vw,0.875rem)] tracking-[0.2em] uppercase mb-[clamp(0.75rem,1.5vw,1rem)] block text-gray-500"
                speed={3}
              />
              <h2 className="text-[clamp(2.5rem,7vw,4.5rem)] font-serif text-black leading-tight">
                Crafting <br /> <i className="text-gray-400 font-light">Elegance</i>
              </h2>
            </div>
            <div className="max-w-md">
              <ScrollReveal
                baseOpacity={0.2}
                enableBlur={true}
                baseRotation={2}
                blurStrength={6}
                containerClassName=""
                textClassName="text-gray-600 leading-relaxed text-[clamp(0.875rem,1.8vw,1.125rem)] font-normal"
              >
                Each sink and piece of furniture we create is more than just a fixture—it's a work of art shaped by generations of craftsmanship in White Marble, Green Marble, Onyx, and beyond.
              </ScrollReveal>
            </div>
          </div>

          <PhilosophyGrid />
        </div>
      </section>

      {/* 5. VISUAL BREAK / BIG IMAGE */}
      <section className="w-full h-[clamp(50vh,80vh,80vh)] relative overflow-hidden group">
        <div className="absolute inset-0 bg-black/20 z-10 group-hover:bg-black/10 transition-colors duration-700" />
        <img
          src={getResponsiveImage("granite-solutions.webp", "large") || "/granite-solutions.webp"}
          srcSet={getSrcSet("granite-solutions.webp")}
          sizes="100vw"
          alt="Artisanal Workshop"
          className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-[2s] ease-out"
          loading="lazy"
        />
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <Magnet padding={100} magnetStrength={5}>
            <a href="/products" className="w-[clamp(8rem,20vw,12rem)] h-[clamp(8rem,20vw,12rem)] rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex flex-col items-center justify-center text-white hover:bg-white hover:text-black transition-all duration-500 group-hover:scale-110 touch-manipulation">
              <span className="text-[clamp(0.625rem,1.2vw,0.875rem)] uppercase tracking-widest mb-[clamp(0.25rem,0.5vw,0.5rem)]">Explore</span>
              <span className="font-serif text-[clamp(1.25rem,3vw,1.875rem)] italic">Collections</span>
            </a>
          </Magnet>
        </div>
      </section>

      {/* 6. FOUNDER / SIGNATURE */}
      <section className="py-[clamp(4rem,10vw,8rem)] px-[clamp(1.5rem,4vw,3rem)] text-center bg-white">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal
            baseOpacity={0.1}
            enableBlur={true}
            baseRotation={3}
            blurStrength={8}
            containerClassName="mb-[clamp(2rem,4vw,3rem)]"
            textClassName="text-[clamp(1.5rem,5vw,3rem)] font-serif leading-tight text-gray-900 font-normal"
          >
            If you’re looking to bring the timeless beauty of real marble into your space, you’re in the right place. Your satisfaction and quality are always our top priorities. I always welcome your visit to my shop.
          </ScrollReveal>
          <div className="flex flex-col items-center">
            <div className="w-[clamp(3rem,8vw,4rem)] h-[2px] bg-black mb-[clamp(1rem,2vw,1.5rem)]"></div>
            <p className="text-[clamp(0.625rem,1.2vw,0.875rem)] tracking-widest uppercase font-semibold">Vaibhav Solanki</p>
            <p className="text-gray-500 text-sm mt-1">Founder, HS Global Export</p>
          </div>
        </div>
      </section>

    </div>
  );
};

// --- Sub-Components ---

const StickyStorySection = () => {
  const containerRef = useRef(null);

  const stories = [
    {
      title: "Family Roots",
      year: "1985",
      desc: "Our journey began in the culturally rich city of Ahmedabad, India. What started as a small family workshop has grown into a trusted name. Our family has devoted nearly 50 years to perfecting the art of marble work.",
      img: "export.webp"
    },
    {
      title: "Global Vision",
      year: "2000s",
      desc: "Vaibhav Solanki established HS Global Export as the most recognized marble brand. His directional orientation expanded our reach, importing quality marble from around the world to become a true global trendsetter.",
      img: "marble-solutions.webp"
    },
    {
      title: "Artisanal Craft",
      year: "Today",
      desc: "Every piece is entirely handmade by experienced artisans. We cut, sand, and polish it ourselves. No mass production, no copy-paste designs. We respect the soul of natural stone and blend it with clean, modern lines.",
      img: "granite-solutions.webp"
    }
  ];

  return (
    <section ref={containerRef} className="relative bg-black text-white">
      {stories.map((story, i) => (
        <StoryPanel key={i} data={story} index={i} />
      ))}
    </section>
  );
};

const StoryPanel = ({ data, index }: { data: any, index: number }) => {
  return (
    <div className="min-h-[100svh] flex items-center justify-center sticky top-0 bg-black overflow-hidden border-b border-white/10 last:border-0">
      <div className="w-full max-w-[1800px] grid grid-cols-1 md:grid-cols-2 gap-[clamp(2rem,8vw,6rem)] px-[clamp(1.5rem,4vw,3rem)] items-center py-[clamp(2rem,4vw,3rem)]">
        <div className="space-y-[clamp(1rem,3vw,2rem)] order-2 md:order-1">
          <span className="text-[clamp(4rem,12vw,12rem)] leading-none font-serif font-bold text-white/5 absolute top-[clamp(1rem,4vw,3rem)] left-[clamp(1rem,4vw,3rem)] select-none -z-10">
            {data.year}
          </span>
          <div className="relative z-10">
            <h3 className="text-[clamp(0.625rem,1.2vw,0.875rem)] text-accent tracking-[0.4em] uppercase mb-[clamp(0.75rem,1.5vw,1rem)]">Chapter 0{index + 1}</h3>
            <h2 className="text-[clamp(2rem,6vw,3.75rem)] font-serif mb-[clamp(1rem,3vw,2rem)]">{data.title}</h2>
            <ScrollReveal
              baseOpacity={0.2}
              enableBlur={true}
              baseRotation={2}
              blurStrength={6}
              containerClassName=""
              textClassName="text-[clamp(0.875rem,2vw,1.25rem)] text-gray-400 leading-relaxed max-w-lg font-normal"
            >
              {data.desc}
            </ScrollReveal>
          </div>
        </div>
        <div className="relative h-[clamp(300px,60vh,600px)] w-full overflow-hidden rounded-lg grayscale hover:grayscale-0 transition-all duration-700 order-1 md:order-2 touch-manipulation">
          <img
            src={getResponsiveImage(data.img, "desktop") || `/${data.img}`}
            srcSet={getSrcSet(data.img)}
            sizes="(max-width: 768px) 100vw, 50vw"
            className="absolute inset-0 w-full h-full object-cover"
            alt={data.title}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        </div>
      </div>
    </div>
  )
}

const PhilosophyGrid = () => {
  const items = [
    {
      title: "Handmade Artisanship",
      desc: "Each piece is carefully handcrafted, celebrating the natural beauty of stone.",
      icon: <Award className="w-[clamp(1.5rem,3vw,2rem)] h-[clamp(1.5rem,3vw,2rem)] text-white" />,
      col: "md:col-span-2",
      img: "about-premium-quality.png"
    },
    {
      title: "Custom Tailoring",
      desc: "Unique dimensions and personalized designs to fit your exact needs.",
      icon: <Target className="w-[clamp(1.5rem,3vw,2rem)] h-[clamp(1.5rem,3vw,2rem)] text-white" />,
      col: "md:col-span-1",
      img: "about-precision.png"
    },
    {
      title: "Global Reach",
      desc: "Extensive experience with safe, global shipping straight to your home.",
      icon: <Globe className="w-[clamp(1.5rem,3vw,2rem)] h-[clamp(1.5rem,3vw,2rem)] text-white" />,
      col: "md:col-span-1",
      img: "about-global-reach.png"
    },
    {
      title: "Personalized Care",
      desc: "Stay informed with photos and updates as we craft your masterpiece.",
      icon: <Users className="w-[clamp(1.5rem,3vw,2rem)] h-[clamp(1.5rem,3vw,2rem)] text-white" />,
      col: "md:col-span-2",
      img: "about-client-focus.png"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[clamp(0.75rem,2vw,1.5rem)]">
      {items.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, duration: 0.5 }}
          viewport={{ once: true }}
          className={`${item.col} relative nav-item p-[clamp(1.5rem,4vw,2.5rem)] rounded-[clamp(1rem,3vw,1.5rem)] min-h-[clamp(250px,35vw,350px)] flex flex-col justify-between group overflow-hidden touch-manipulation`}
        >
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <img
              src={getResponsiveImage(item.img, "desktop") || `/${item.img}`}
              srcSet={getSrcSet(item.img)}
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              alt={item.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-500" />
          </div>

          <div className="relative z-10 w-[clamp(3rem,8vw,4rem)] h-[clamp(3rem,8vw,4rem)] rounded-full flex items-center justify-center bg-white/20 backdrop-blur-md border border-white/10 group-hover:scale-110 transition-transform duration-500">
            {item.icon}
          </div>

          <div className="relative z-10">
            <h3 className="text-[clamp(1.25rem,3vw,1.875rem)] font-serif mb-[clamp(0.25rem,1vw,0.5rem)] text-white">{item.title}</h3>
            <p className="text-[clamp(0.75rem,1.5vw,1rem)] text-white/80">{item.desc}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export default About;
