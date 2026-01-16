import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight,
  Factory,
  Hammer,
  Truck,
  Shield,
  Globe2,
  Sparkles,
  CheckCircle,
  Award,
  Target,
  Gem
} from 'lucide-react';
import { getRootImageUrl } from '../utils/rootCloudinary';
import VelocityScroll from '../components/VelocityScroll';
import Magnet from '../components/Magnet';
import ShinyText from '../components/ShinyText';
import ScrollReveal from '../components/ScrollReveal';

const Services: React.FC = () => {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);

  // Parallax for Hero
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 150]);
  const opacityHero = useTransform(scrollY, [0, 400], [1, 0]);

  return (
    <div ref={containerRef} className="bg-white text-gray-900 selection:bg-black selection:text-white overflow-x-hidden">

      <Helmet>
        {/* Basic SEO */}
        <title>Our Services - Premium Stone Solutions | HS Global Export</title>
        <meta name="description" content="From quarry to installation, HS Global Export offers comprehensive stone services: manufacturing, fabrication, global export, and quality assurance for granite and marble." />
        <meta name="keywords" content="granite manufacturing, marble fabrication, stone export services, global stone logistics, quality stone processing, custom stone cutting, stone installation services" />
        <meta name="author" content="HS Global Export" />
        <meta name="robots" content="index, follow" />

        {/* Canonical URL */}
        <link rel="canonical" href="https://hsglobalexport.com/services" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://hsglobalexport.com/services" />
        <meta property="og:site_name" content="HS Global Export" />
        <meta property="og:title" content="Our Services - Premium Stone Solutions | HS Global Export" />
        <meta property="og:description" content="From quarry to installation, we deliver excellence at every stage of your stone journey. Manufacturing, fabrication, export & quality assurance." />
        <meta property="og:image" content="https://hsglobalexport.com/og-image.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="HS Global Export - Stone Services" />
        <meta property="og:locale" content="en_US" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://hsglobalexport.com/services" />
        <meta name="twitter:title" content="Our Services - Premium Stone Solutions | HS Global Export" />
        <meta name="twitter:description" content="From quarry to installation, we deliver excellence at every stage of your stone journey." />
        <meta name="twitter:image" content="https://hsglobalexport.com/og-image.jpg" />
        <meta name="twitter:image:alt" content="HS Global Export - Stone Services" />

        {/* Schema.org Service */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            "serviceType": "Stone Manufacturing and Export Services",
            "provider": {
              "@type": "Organization",
              "name": "HS Global Export",
              "url": "https://hsglobalexport.com"
            },
            "areaServed": {
              "@type": "Place",
              "name": "Worldwide"
            },
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": "Stone Services",
              "itemListElement": [
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Manufacturing",
                    "description": "State-of-the-art stone manufacturing facilities"
                  }
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Fabrication",
                    "description": "Expert stone fabrication and custom cutting"
                  }
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Global Export",
                    "description": "Worldwide shipping and logistics for stone products"
                  }
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Quality Assurance",
                    "description": "Rigorous testing and ISO certification"
                  }
                }
              ]
            }
          })}
        </script>
      </Helmet>


      {/* 1. HERO SECTION - Minimal & Typography Focused */}
      <section className="relative min-h-[100svh] flex flex-col justify-center px-[clamp(1.5rem,4vw,6rem)] overflow-hidden bg-gradient-to-br from-gray-50 to-white">
        <motion.div
          style={{ y: y1, opacity: opacityHero }}
          className="absolute top-0 right-0 w-[70vw] h-full opacity-5 pointer-events-none"
        >
          <img
            src={getRootImageUrl('services-hero.webp') || '/services-hero.webp'}
            className="w-full h-full object-cover filter grayscale"
            alt="Services Background"
          />
        </motion.div>

        <div className="relative z-10 max-w-[90vw]">
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="block text-[clamp(0.625rem,1.2vw,0.875rem)] tracking-[0.3em] uppercase mb-[clamp(1rem,2vw,1.5rem)] text-gray-400">
              {t('services.hero_subtitle') || 'Comprehensive Solutions'}
            </span>
            <h1 className="text-[clamp(3.5rem,13vw,14vw)] leading-[0.85] font-serif tracking-tighter text-black">
              Stone <br />
              <span className="ml-[8vw] italic font-light text-gray-400">Services</span> <br />
              <span className="text-accent">Redefined</span>.
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="mt-[clamp(2rem,4vw,3rem)] text-[clamp(1rem,2vw,1.25rem)] text-gray-600 max-w-2xl leading-relaxed"
          >
            From quarry to installation, we deliver excellence at every stage of your stone journey.
          </motion.p>
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

      {/* 2. MARQUEE SEPARATOR */}
      <div className="py-[clamp(2rem,4vw,3rem)] border-y border-gray-100 bg-black text-white">
        <VelocityScroll
          items={['Manufacturing', 'Export', 'Quality', 'Precision', 'Global', 'Excellence']}
          default_velocity={3}
          className="font-serif text-[clamp(2rem,6vw,4rem)] opacity-80"
        />
      </div>

      {/* 3. SERVICES GRID - Bento Style */}
      <section className="py-[clamp(4rem,10vw,8rem)] px-[clamp(1.5rem,4vw,6rem)] bg-[#F9F9F7]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-[clamp(3rem,8vw,6rem)] text-center">
            <ShinyText
              text="What We Offer"
              className="text-[clamp(0.625rem,1.2vw,0.875rem)] tracking-[0.2em] uppercase mb-[clamp(0.75rem,1.5vw,1rem)] block text-gray-500"
              speed={3}
            />
            <h2 className="text-[clamp(2.5rem,7vw,4.5rem)] font-serif text-black leading-tight">
              Our <i className="text-gray-400 font-light">Expertise</i>
            </h2>
          </div>

          <ServicesBentoGrid />
        </div>
      </section>

      {/* 4. MANUFACTURING SECTION - Split Layout */}
      <section className="py-[clamp(4rem,10vw,8rem)] px-[clamp(1.5rem,4vw,6rem)] bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-[clamp(3rem,8vw,6rem)] items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <span className="inline-block py-2 px-4 bg-accent/10 text-accent text-xs font-bold tracking-widest uppercase rounded-full mb-4">
                {t('services.manufacturing_header') || 'Manufacturing'}
              </span>
              <h2 className="text-[clamp(2rem,6vw,3.5rem)] font-serif font-bold text-primary mb-6 leading-tight">
                {t('services.manufacturing_title') || 'Precision Fabrication'}
              </h2>
              <ScrollReveal
                baseOpacity={0.3}
                enableBlur={true}
                baseRotation={2}
                blurStrength={6}
                containerClassName="mb-6"
                textClassName="text-gray-600 text-[clamp(1rem,2vw,1.125rem)] leading-relaxed"
              >
                {t('services.manufacturing_para_1') || 'Our state-of-the-art manufacturing facilities combine traditional craftsmanship with cutting-edge technology to deliver unparalleled precision and quality.'}
              </ScrollReveal>

              <div className="grid sm:grid-cols-2 gap-4 mt-8">
                {[
                  { icon: Factory, label: t('services.manufacturing_grid_1') || 'Advanced Machinery' },
                  { icon: Hammer, label: t('services.manufacturing_grid_2') || 'Expert Craftsmen' },
                  { icon: Target, label: t('services.manufacturing_grid_3') || 'Quality Control' },
                  { icon: Award, label: t('services.manufacturing_grid_4') || 'ISO Certified' }
                ].map(({ icon: Icon, label }) => (
                  <motion.div
                    key={label}
                    whileHover={{ y: -5 }}
                    className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 hover:border-accent/30 transition-all duration-300"
                  >
                    <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                      <Icon className="w-5 h-5 text-accent" />
                    </div>
                    <span className="text-sm font-medium text-gray-800">{label}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative h-[clamp(400px,60vh,600px)] rounded-2xl overflow-hidden group"
            >
              <img
                src={getRootImageUrl('granite-solutions.webp') || '/granite-solutions.webp'}
                alt="Manufacturing"
                className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 5. EXPORT & LOGISTICS - Reversed Split */}
      <section className="py-[clamp(4rem,10vw,8rem)] px-[clamp(1.5rem,4vw,6rem)] bg-[#F9F9F7]">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-[clamp(3rem,8vw,6rem)] items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative h-[clamp(400px,60vh,600px)] rounded-2xl overflow-hidden group order-2 lg:order-1"
            >
              <img
                src={getRootImageUrl('export.webp') || '/export.webp'}
                alt="Export"
                className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2"
            >
              <span className="inline-block py-2 px-4 bg-green-500/10 text-green-600 text-xs font-bold tracking-widest uppercase rounded-full mb-4">
                {t('services.export_header') || 'Global Export'}
              </span>
              <h2 className="text-[clamp(2rem,6vw,3.5rem)] font-serif font-bold text-primary mb-6 leading-tight">
                {t('services.export_title') || 'Worldwide Logistics'}
              </h2>
              <ScrollReveal
                baseOpacity={0.3}
                enableBlur={true}
                baseRotation={2}
                blurStrength={6}
                containerClassName="mb-6"
                textClassName="text-gray-600 text-[clamp(1rem,2vw,1.125rem)] leading-relaxed"
              >
                {t('services.export_para_1') || 'We handle the complexities of international shipping, ensuring your stone arrives safely and on time, anywhere in the world.'}
              </ScrollReveal>

              <div className="space-y-3 mt-8">
                {[
                  { icon: Globe2, label: t('services.export_grid_3') || '50+ Countries Served' },
                  { icon: Truck, label: t('services.export_grid_1') || 'Secure Packaging' },
                  { icon: Shield, label: t('services.export_grid_4') || 'Insurance Coverage' }
                ].map(({ icon: Icon, label }) => (
                  <motion.div
                    key={label}
                    whileHover={{ x: 10 }}
                    className="flex items-center gap-4 group"
                  >
                    <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center group-hover:bg-green-500 transition-colors duration-300">
                      <Icon className="w-6 h-6 text-green-600 group-hover:text-white transition-colors duration-300" />
                    </div>
                    <span className="text-base font-medium text-gray-800">{label}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 6. MATERIALS SHOWCASE */}
      <section className="py-[clamp(4rem,10vw,8rem)] px-[clamp(1.5rem,4vw,6rem)] bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-[clamp(3rem,8vw,6rem)]">
            <ShinyText
              text="Premium Materials"
              className="text-[clamp(0.625rem,1.2vw,0.875rem)] tracking-[0.2em] uppercase mb-[clamp(0.75rem,1.5vw,1rem)] block text-gray-500"
              speed={3}
            />
            <h2 className="text-[clamp(2.5rem,7vw,4.5rem)] font-serif text-black leading-tight mb-6">
              Granite & <i className="text-gray-400 font-light">Marble</i>
            </h2>
            <p className="text-gray-600 text-[clamp(1rem,2vw,1.25rem)] max-w-3xl mx-auto leading-relaxed">
              {t('services.material_para') || 'We specialize in sourcing and processing the finest natural stones from around the world.'}
            </p>
          </div>

          <MaterialsGrid />
        </div>
      </section>

      {/* 7. VISUAL BREAK - Full Width Image with CTA */}
      <section className="w-full h-[clamp(60vh,80vh,80vh)] relative overflow-hidden group">
        <div className="absolute inset-0 bg-black/30 z-10 group-hover:bg-black/20 transition-colors duration-700" />
        <img
          src={getRootImageUrl('marble-solutions.webp') || '/marble-solutions.webp'}
          alt="Stone Collection"
          className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-[2s] ease-out"
        />
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <Magnet padding={100} magnetStrength={5}>
            <a
              href="https://wa.me/918107115116?text=I%20want%20to%20discuss%20stone%20services"
              target="_blank"
              rel="noreferrer"
              className="w-[clamp(10rem,22vw,14rem)] h-[clamp(10rem,22vw,14rem)] rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex flex-col items-center justify-center text-white hover:bg-white hover:text-black transition-all duration-500 group-hover:scale-110 touch-manipulation"
            >
              <span className="text-[clamp(0.625rem,1.2vw,0.875rem)] uppercase tracking-widest mb-[clamp(0.25rem,0.5vw,0.5rem)]">Get Started</span>
              <span className="font-serif text-[clamp(1.5rem,3.5vw,2rem)] italic">Today</span>
              <ArrowRight className="w-6 h-6 mt-2" />
            </a>
          </Magnet>
        </div>
      </section>

      {/* 8. FINAL CTA SECTION */}
      <section className="py-[clamp(4rem,10vw,8rem)] px-[clamp(1.5rem,4vw,3rem)] text-center bg-black text-white">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal
            baseOpacity={0.1}
            enableBlur={true}
            baseRotation={3}
            blurStrength={8}
            containerClassName="mb-[clamp(2rem,4vw,3rem)]"
            textClassName="text-[clamp(1.5rem,5vw,3rem)] font-serif leading-tight text-white font-normal"
          >
            {t('services.cta_title') || "Let's bring your vision to life with the finest stone solutions."}
          </ScrollReveal>
          <div className="flex flex-col items-center">
            <div className="w-[clamp(3rem,8vw,4rem)] h-[2px] bg-white mb-[clamp(1rem,2vw,1.5rem)]"></div>
            <Magnet padding={50} magnetStrength={3}>
              <a
                href="https://wa.me/918107115116?text=I%20want%20to%20discuss%20stone%20services"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-3 bg-white text-black hover:bg-accent hover:text-white px-8 py-4 rounded-full text-base font-semibold transition-all duration-300 transform hover:scale-105 group"
              >
                {t('services.cta_btn') || 'Contact Us'}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </Magnet>
          </div>
        </div>
      </section>
    </div>
  );
};

// --- Sub-Components ---

const ServicesBentoGrid = () => {

  const services = [
    {
      title: 'In-house Manufacturing',
      desc: 'State-of-the-art facilities with precision machinery',
      icon: <Factory className="w-[clamp(1.5rem,3vw,2rem)] h-[clamp(1.5rem,3vw,2rem)] text-white" />,
      col: 'md:col-span-2',
      img: 'services-in-house-manufacturing.png'
    },
    {
      title: 'Custom Fabrication',
      desc: 'Expert craftsmanship meets technology',
      icon: <Hammer className="w-[clamp(1.5rem,3vw,2rem)] h-[clamp(1.5rem,3vw,2rem)] text-white" />,
      col: 'md:col-span-1',
      img: 'services-custom-fabrication.png'
    },
    {
      title: 'Global Logistics',
      desc: 'Worldwide shipping & logistics',
      icon: <Truck className="w-[clamp(1.5rem,3vw,2rem)] h-[clamp(1.5rem,3vw,2rem)] text-white" />,
      col: 'md:col-span-1',
      img: 'services-global-logistics.png'
    },
    {
      title: 'Strict QA',
      desc: 'Rigorous testing and certification',
      icon: <Shield className="w-[clamp(1.5rem,3vw,2rem)] h-[clamp(1.5rem,3vw,2rem)] text-white" />,
      col: 'md:col-span-2',
      img: 'services-strict-qa.png'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[clamp(0.75rem,2vw,1.5rem)]">
      {services.map((service, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, duration: 0.5 }}
          viewport={{ once: true }}
          className={`${service.col} relative nav-item p-[clamp(1.5rem,4vw,2.5rem)] rounded-[clamp(1rem,3vw,1.5rem)] min-h-[clamp(250px,35vw,350px)] flex flex-col justify-between group overflow-hidden touch-manipulation`}
        >
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <img
              src={getRootImageUrl(service.img) || `/${service.img}`}
              alt={service.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-500" />
          </div>

          <div className="relative z-10 w-[clamp(3rem,8vw,4rem)] h-[clamp(3rem,8vw,4rem)] rounded-full flex items-center justify-center bg-white/20 backdrop-blur-md border border-white/10 group-hover:scale-110 transition-transform duration-500">
            {service.icon}
          </div>

          <div className="relative z-10">
            <h3 className="text-[clamp(1.25rem,3vw,1.875rem)] font-serif mb-[clamp(0.25rem,1vw,0.5rem)] text-white">
              {service.title}
            </h3>
            <p className="text-[clamp(0.75rem,1.5vw,1rem)] text-white/80">
              {service.desc}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

const MaterialsGrid = () => {
  const { t } = useTranslation();

  const materials = [
    {
      title: t('services.material_box_1_title') || 'Premium Granite',
      icon: Gem,
      color: 'from-pink-500 to-rose-600',
      features: [
        t('services.material_box_1_point_1') || 'Exceptional durability',
        t('services.material_box_1_point_2') || 'Unique patterns',
        t('services.material_box_1_point_3') || 'Heat resistant',
        t('services.material_box_1_point_4') || 'Low maintenance'
      ]
    },
    {
      title: t('services.material_box_2_title') || 'Luxury Marble',
      icon: Sparkles,
      color: 'from-slate-600 to-slate-700',
      features: [
        t('services.material_box_2_point_1') || 'Timeless elegance',
        t('services.material_box_2_point_2') || 'Natural veining',
        t('services.material_box_2_point_3') || 'Premium finish',
        t('services.material_box_2_point_4') || 'Versatile applications'
      ]
    }
  ];

  return (
    <div className="grid md:grid-cols-2 gap-[clamp(1.5rem,4vw,3rem)]">
      {materials.map((material, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.2, duration: 0.6 }}
          viewport={{ once: true }}
          whileHover={{ y: -10 }}
          className="bg-white border border-gray-100 rounded-2xl p-[clamp(2rem,5vw,3rem)] hover:shadow-2xl transition-all duration-500 group"
        >
          <div className={`w-[clamp(3.5rem,10vw,5rem)] h-[clamp(3.5rem,10vw,5rem)] rounded-full flex items-center justify-center bg-gradient-to-br ${material.color} mb-6 group-hover:scale-110 transition-transform duration-500`}>
            <material.icon className="w-[clamp(1.75rem,4vw,2.5rem)] h-[clamp(1.75rem,4vw,2.5rem)] text-white" />
          </div>
          <h3 className="text-[clamp(1.5rem,4vw,2rem)] font-serif font-bold text-gray-900 mb-6">
            {material.title}
          </h3>
          <ul className="space-y-4">
            {material.features.map((feature, idx) => (
              <motion.li
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.2 + idx * 0.1, duration: 0.4 }}
                viewport={{ once: true }}
                className="flex items-center gap-3 group/item"
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center bg-gradient-to-br ${material.color} opacity-20 group-hover/item:opacity-100 transition-opacity duration-300`}>
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <span className="text-gray-700 text-[clamp(0.875rem,1.8vw,1rem)]">{feature}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      ))}
    </div>
  );
};

export default Services;