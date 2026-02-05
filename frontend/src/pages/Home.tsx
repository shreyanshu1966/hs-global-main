import { Helmet } from "react-helmet-async";
import HeroModern from "../components/HeroModern";
import ProductCategoriesGrid from "../components/ProductCategoriesGrid";
import FeaturedProducts from "../components/FeaturedProducts";
import MaterialShowcase from "../components/MaterialShowcase";
import AtelierStory from "../components/AtelierStory";
import Testimonials from "../components/Testimonials";
import TrustBadges from "../components/TrustBadges";
import VelocityScroll from "../components/VelocityScroll";

const Home = () => {
  return (
    <>
      <Helmet>
        {/* ✅ Schema Markup with www */}
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

        {/* ✅ OpenGraph / Canonical URLs all with www */}
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

        {/* ✅ Twitter Card Tags */}
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

      {/* Main content */}
      <main className="bg-white selection:bg-stone-900 selection:text-white">

        {/* 1. Hero: Modern B2C Hero with Clear CTAs */}
        <section>
          <HeroModern />
        </section>

        {/* 2. Marquee Separator */}
        <div id="feature-marquee">
          <VelocityScroll />
        </div>

        {/* 3. Product Categories: Clear Navigation to Products */}
        <section>
          <ProductCategoriesGrid />
        </section>

        {/* 4. Featured Products: Bestsellers & New Arrivals */}
        <section>
          <FeaturedProducts />
        </section>

        {/* 5. Material Library: Interactive Stone Showcase */}
        <section>
          <MaterialShowcase />
        </section>

        {/* 6. Story: The Atelier - Craftsmanship */}
        <section>
          <AtelierStory />
        </section>

        {/* 7. Trust & Social Proof */}
        <section>
          <TrustBadges />
        </section>

        <section>
          <Testimonials />
        </section>

      </main>
    </>
  );
};

export default Home;

