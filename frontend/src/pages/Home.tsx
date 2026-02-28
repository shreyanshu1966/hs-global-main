import { Helmet } from "react-helmet-async";
import HeroSlider from "../components/home/HeroSlider";
import ValueMarquee from "../components/home/ValueMarquee";
import CategoryShowcase from "../components/home/CategoryShowcase";

import BestSellersCarousel from "../components/home/BestSellersCarousel";
import CraftSection from "../components/home/CraftSection";
import ProjectMasonry from "../components/home/ProjectMasonry";
import TestimonialEditorial from "../components/home/TestimonialEditorial";
import HomeCTA from "../components/home/HomeCTA";

const Home = () => {
  return (
    <>
      <Helmet>
        {/* Schema Markup */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "HS Global Export",
              "url": "https://www.hsglobalexport.com",
              "logo": "https://www.hsglobalexport.com/favicon.ico",
              "sameAs": [
                "https://www.instagram.com/hsglobalexport116",
                "https://www.linkedin.com/company/hsglobalexport",
                "https://www.facebook.com/hsglobalexport"
              ],
              "description":
                "HS Global Export is a leading supplier of premium granite, marble, and natural stones offering custom luxury stone solutions for interiors and architecture.",
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+91-8107115116",
                "contactType": "Customer Support",
                "areaServed": "IN",
                "availableLanguage": "en"
              }
            }),
          }}
        />

        <title>
          Premium Marble Furniture & Natural Stone Slabs | HS Global Export
        </title>

        <meta
          name="description"
          content="Discover handcrafted marble furniture including dining tables, coffee tables, wash basins, and sculptures. Premium natural stone slabs in marble, granite, and more. Custom luxury stone solutions."
        />
        <meta
          name="keywords"
          content="marble furniture, marble dining table, marble coffee table, marble wash basin, marble sculptures, granite slabs, marble slabs, natural stone, luxury furniture, handcrafted furniture, HS Global Export"
        />

        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.hsglobalexport.com/" />
        <meta property="og:site_name" content="HS Global Export" />
        <meta property="og:title" content="Premium Marble Furniture & Natural Stone Slabs | HS Global Export" />
        <meta property="og:description" content="Handcrafted marble furniture and premium natural stone slabs. Transform your space with timeless elegance." />
        <meta property="og:image" content="https://hsglobalexport.com/og-image.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="HS Global Export - Premium Marble Furniture" />
        <meta property="og:locale" content="en_US" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://www.hsglobalexport.com/" />
        <meta name="twitter:title" content="Premium Marble Furniture & Natural Stone Slabs | HS Global Export" />
        <meta name="twitter:description" content="Handcrafted marble furniture and premium natural stone slabs. Transform your space with timeless elegance." />
        <meta name="twitter:image" content="https://hsglobalexport.com/og-image.jpg" />
        <meta name="twitter:image:alt" content="HS Global Export - Premium Marble Furniture" />

        <link rel="canonical" href="https://www.hsglobalexport.com/" />

        <meta name="author" content="HS Global Export" />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <main className="bg-white selection:bg-[#1a1a1a] selection:text-white">
        {/* 1. Immersive Hero Slider */}
        <section>
          <HeroSlider />
        </section>

        {/* 2. Brand Values Marquee */}
        <ValueMarquee />

        {/* 3. Editorial Category Showcase */}
        <section>
          <CategoryShowcase />
        </section>


        {/* 5. Best Sellers Carousel */}
        <section>
          <BestSellersCarousel />
        </section>

        {/* 6. Craft Story (Dark Section) */}
        <section>
          <CraftSection />
        </section>

        {/* 7. Project Gallery / In Situ */}
        <section>
          <ProjectMasonry />
        </section>

        {/* 8. Testimonials */}
        <section>
          <TestimonialEditorial />
        </section>

        {/* 9. CTA Strip */}
        <section>
          <HomeCTA />
        </section>
      </main>
    </>
  );
};

export default Home;
