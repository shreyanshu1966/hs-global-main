import { Helmet } from "react-helmet-async";
import HeroSlider from "../components/home/HeroSlider";
import ValueMarquee from "../components/home/ValueMarquee";
import CategoryShowcase from "../components/home/CategoryShowcase";

import BestSellersCarousel from "../components/home/BestSellersCarousel";
import NewArrivalsStrip from "../components/home/NewArrivalsStrip";
import CustomerFavoritesCarousel from "../components/home/CustomerFavoritesCarousel";
import TestimonialEditorial from "../components/home/TestimonialEditorial";
import HomeCTA from "../components/home/HomeCTA";
import BlogsCarousel from "../components/home/BlogsCarousel";

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
          Best Marble Furniture, Granite Handcrafted Products Manufacturers and Trusted Global Supplier & Exporter
        </title>

        <meta
          name="description"
          content="HS Global Export : Premium Granite & Marble Solutions - Handcrafted Products Manufacturers with Free Delivery | USA | UK"
        />
        <meta
          name="keywords"
          content="Premium Granite Furniture Exporter, Marble Furniture Manufacturer, Italian Onyx Furniture, Indian Marble Furniture Export, Beige and Grey Marble Furniture, Marble Sinks and Tiles Exporter, Global Granite & Marble Supplier, Luxury Marble Furniture, Custom Marble Furniture, High-Quality Marble Tiles Export, Premium Marble Sink Manufacturers, Marble Home Décor Exporter, Natural Stone Furniture Manufacturer, Marble Bathroom Sinks, Granite & Marble Export Worldwide, Onyx Marble Furniture Exporter, Luxury Stone Furniture for Export, Global Supplier of Marble Tiles, High-End Marble Furniture, Wholesale Marble Furniture Exporter."
        />

        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.hsglobalexport.com/" />
        <meta property="og:site_name" content="HS Global Export" />
        <meta property="og:title" content="Best Marble Furniture, Granite Handcrafted Products Manufacturers and Trusted Global Supplier & Exporter" />
        <meta property="og:description" content="HS Global Export : Premium Granite & Marble Solutions - Handcrafted Products Manufacturers with Free Delivery | USA | UK" />
        <meta property="og:image" content="https://www.hsglobalexport.com/og-image.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="HS Global Export - Premium Granite & Marble" />
        <meta property="og:locale" content="en_US" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://www.hsglobalexport.com/" />
        <meta name="twitter:title" content="Best Marble Furniture, Granite Handcrafted Products Manufacturers and Trusted Global Supplier & Exporter" />
        <meta name="twitter:description" content="HS Global Export : Premium Granite & Marble Solutions - Handcrafted Products Manufacturers with Free Delivery | USA | UK" />
        <meta name="twitter:image" content="https://www.hsglobalexport.com/og-image.jpg" />
        <meta name="twitter:image:alt" content="HS Global Export - Premium Granite & Marble" />

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

        {/* 3. Best Sellers Carousel */}
        <section>
          <BestSellersCarousel />
        </section>

        {/* 4. New Arrivals */}
        <section>
          <NewArrivalsStrip />
        </section>

        {/* 5. Customer Favorites */}
        <section>
          <CustomerFavoritesCarousel />
        </section>

        {/* 6. Blog Carousel */}
        <section>
          <BlogsCarousel />
        </section>

        {/* 7. Editorial Category Showcase */}
        <section>
          <CategoryShowcase />
        </section>

        {/* 6. Craft Story (Dark Section) */}
        {/* <section>
          <CraftSection />
        </section> */}

        {/* 7. Project Gallery / In Situ
        <section>
          <ProjectMasonry />
        </section> */}

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
