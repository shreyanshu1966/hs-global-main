import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { motion, useScroll, useTransform } from "framer-motion";
import { Globe, Award, Target, Users } from "lucide-react";
import { getRootImageUrl } from "../utils/rootCloudinary";
import VelocityScroll from "../components/VelocityScroll";
import Magnet from "../components/Magnet";
import ShinyText from "../components/ShinyText";
import ScrollReveal from "../components/ScrollReveal";

const About = () => {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);

  // Parallax for Hero
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const opacityHero = useTransform(scrollY, [0, 400], [1, 0]);

  return (
    <div ref={containerRef} className="bg-[#FFFFFF] text-gray-900 selection:bg-black selection:text-white overflow-x-hidden">

      {/* 1. HERO SECTION: Typography Centric - Scaled Version */}
      <section className="relative min-h-[100svh] flex flex-col justify-end pb-[clamp(4rem,8vw,8rem)] px-[clamp(1.5rem,4vw,6rem)] pt-[clamp(4rem,8vw,8rem)] overflow-hidden">
        <motion.div
          style={{ y: y1, opacity: opacityHero }}
          className="absolute top-0 right-0 w-[60vw] h-[80vh] opacity-10 pointer-events-none"
        >
          <img
            src={getRootImageUrl("about-hero.webp") || "/about-hero.webp"}
            className="w-full h-full object-cover filter grayscale contrast-125"
            alt="HS Global Texture"
          />
        </motion.div>

        <div className="relative z-10 max-w-[90vw]">
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="block text-[clamp(0.625rem,1.2vw,0.875rem)] tracking-[0.3em] uppercase mb-[clamp(1rem,2vw,1.5rem)] text-gray-400">
              {t("about.hero_subtitle") || "Est. 1995 • Rajasthan, India"}
            </span>
            <h1 className="text-[clamp(3rem,12vw,12vw)] leading-[0.8] font-serif tracking-tighter text-black mix-blend-multiply">
              Heritage <br />
              <span className="ml-[10vw] italic font-light text-gray-400">Etched</span> <br />
              In <span className="text-secondary-foreground">Stone</span>.
            </h1>
          </motion.div>
        </div>

        <motion.div
          className="absolute bottom-[clamp(2rem,4vw,3rem)] left-[clamp(1.5rem,4vw,6rem)] flex items-center gap-[clamp(0.75rem,2vw,1rem)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
        >
          <div className="h-[1px] w-[clamp(3rem,8vw,6rem)] bg-gray-300"></div>
          <p className="text-[clamp(0.625rem,1vw,0.75rem)] uppercase tracking-widest text-gray-400">Scroll to Explore</p>
        </motion.div>
      </section>

      {/* 2. SCROLLYTELLING: Origin Story - Unified Scaled Layout */}
      <StickyStorySection />

      {/* 3. MARQUEE SEPARATOR */}
      <div className="py-[clamp(2rem,4vw,3rem)] border-y border-gray-100 bg-black text-white">
        <VelocityScroll
          items={["Excellence", "Precision", "Heritage", "Global", "Luxury", "Timeless"]}
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
                text="Our Philosophy"
                className="text-[clamp(0.625rem,1.2vw,0.875rem)] tracking-[0.2em] uppercase mb-[clamp(0.75rem,1.5vw,1rem)] block text-gray-500"
                speed={3}
              />
              <h2 className="text-[clamp(2.5rem,7vw,4.5rem)] font-serif text-black leading-tight">
                Crafting <br /> <i className="text-gray-400 font-light">Perfection</i>
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
                We believe every slab tells a story. Our mission is to preserve that narrative while elevating it to meet the standards of modern luxury architecture.
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
          src={getRootImageUrl("granite-solutions.webp") || "/granite-solutions.webp"}
          alt="Quarry"
          className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-[2s] ease-out"
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
            We don't just export stone; we export a piece of India's geological soul to the world.
          </ScrollReveal>
          <div className="flex flex-col items-center">
            <div className="w-[clamp(3rem,8vw,4rem)] h-[2px] bg-black mb-[clamp(1rem,2vw,1.5rem)]"></div>
            <p className="text-[clamp(0.625rem,1.2vw,0.875rem)] tracking-widest uppercase font-semibold">The HS Global Team</p>
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
      title: "The Beginning",
      year: "1995",
      desc: "Started as a humble quarry operation in the heart of Rajasthan, we identified independent deposits of high-quality granite that sparked a vision.",
      img: "export.webp"
    },
    {
      title: "Global Expansion",
      year: "2010",
      desc: "Crossed borders to supply major architectural projects in the Middle East and Europe, establishing our reputation for reliability and scale.",
      img: "marble-solutions.webp"
    },
    {
      title: "Sustainable Future",
      year: "2024",
      desc: "Investing in eco-friendly mining tech and water recycling, pushing the industry towards a greener, more responsible future.",
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
            src={getRootImageUrl(data.img) || `/${data.img}`}
            className="absolute inset-0 w-full h-full object-cover"
            alt={data.title}
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
      title: "Premium Quality",
      desc: "Sourced from the finest mines.",
      icon: <Award className="w-[clamp(1.5rem,3vw,2rem)] h-[clamp(1.5rem,3vw,2rem)]" />,
      col: "md:col-span-2",
      bg: "bg-white",
      dark: false
    },
    {
      title: "Global Reach",
      desc: "50+ Countries served.",
      icon: <Globe className="w-[clamp(1.5rem,3vw,2rem)] h-[clamp(1.5rem,3vw,2rem)] text-white" />,
      col: "md:col-span-1",
      bg: "bg-[#1a1a1a]",
      dark: true
    },
    {
      title: "Precision",
      desc: "Italian Tech Processing.",
      icon: <Target className="w-[clamp(1.5rem,3vw,2rem)] h-[clamp(1.5rem,3vw,2rem)]" />,
      col: "md:col-span-1",
      bg: "bg-[#EAEAE5]",
      dark: false
    },
    {
      title: "Client Focus",
      desc: "End-to-end support.",
      icon: <Users className="w-[clamp(1.5rem,3vw,2rem)] h-[clamp(1.5rem,3vw,2rem)]" />,
      col: "md:col-span-2",
      bg: "bg-white",
      dark: false
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-[clamp(0.75rem,2vw,1.5rem)]">
      {items.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, duration: 0.5 }}
          viewport={{ once: true }}
          className={`${item.col} ${item.bg} nav-item p-[clamp(1.5rem,4vw,2.5rem)] rounded-[clamp(1rem,3vw,1.5rem)] min-h-[clamp(200px,30vw,300px)] flex flex-col justify-between group hover:shadow-2xl transition-all duration-500 border border-transparent hover:border-black/5 touch-manipulation`}
        >
          <div className={`w-[clamp(3rem,8vw,4rem)] h-[clamp(3rem,8vw,4rem)] rounded-full flex items-center justify-center ${item.dark ? 'bg-white/10' : 'bg-black/5'} group-hover:scale-110 transition-transform duration-500`}>
            {item.icon}
          </div>
          <div>
            <h3 className={`text-[clamp(1.25rem,3vw,1.875rem)] font-serif mb-[clamp(0.25rem,1vw,0.5rem)] ${item.dark ? 'text-white' : 'text-gray-900'}`}>{item.title}</h3>
            <p className={`text-[clamp(0.75rem,1.5vw,1rem)] ${item.dark ? 'text-white/60' : 'text-gray-500'}`}>{item.desc}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export default About;
