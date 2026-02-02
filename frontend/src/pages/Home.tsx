import { Helmet } from "react-helmet-async";
import HeroMonolith from "../components/HeroMonolith";
import CollectionLookbook from "../components/CollectionLookbook";
import MasterpieceSpotlight from "../components/MasterpieceSpotlight";
import MaterialShowcase from "../components/MaterialShowcase";
import AtelierStory from "../components/AtelierStory";
import Testimonials from "../components/Testimonials"; // Keeping existing
import TrustBadges from "../components/TrustBadges"; // Keeping existing
import VelocityScroll from "../components/VelocityScroll"; // Keeping existing

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
          Granite & Marble Collection - Luxury Stone Designs | HS Global Export
        </title>

        <meta
          name="description"
          content="Explore HS Global Export's exquisite granite and marble collection. Discover custom luxury stone designs to elevate your interiors with timeless elegance and quality."
        />
        <meta
          name="keywords"
          content="granite collection, marble collection, luxury stone, custom stone designs, interior stone solutions, HS-Globals, premium granite, premium marble"
        />

        {/* ✅ OpenGraph / Canonical URLs all with www */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.hsglobalexport.com/" />
        <meta property="og:site_name" content="HS Global Export" />
        <meta property="og:title" content="Granite & Marble Collection - Luxury Stone Designs | HS Global Export" />
        <meta property="og:description" content="Transform your interiors with HS Global Export's granite and marble collection. Unique designs and premium materials for luxurious living spaces." />
        <meta property="og:image" content="https://hsglobalexport.com/og-image.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="HS Global Export - Premium Granite & Marble Collection" />
        <meta property="og:locale" content="en_US" />

        {/* ✅ Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://www.hsglobalexport.com/" />
        <meta name="twitter:title" content="Granite & Marble Collection - Luxury Stone Designs | HS Global Export" />
        <meta name="twitter:description" content="Transform your interiors with HS Global Export's granite and marble collection. Unique designs and premium materials for luxurious living spaces." />
        <meta name="twitter:image" content="https://hsglobalexport.com/og-image.jpg" />
        <meta name="twitter:image:alt" content="HS Global Export - Premium Granite & Marble Collection" />

        <link rel="canonical" href="https://www.hsglobalexport.com/" />

        <meta name="author" content="HS Global Export" />
        <meta name="robots" content="index, follow" />
      </Helmet>

      {/* Main content */}
      <main className="bg-stone-50 selection:bg-stone-900 selection:text-white">

        {/* 1. Hero: The Monolith */}
        <section>
          <HeroMonolith />
        </section>

        {/* 2. Marquee Separator */}
        <div id="feature-marquee">
          <VelocityScroll />
        </div>

        {/* 3. The Collections: Lookbook */}
        <section>
          <CollectionLookbook />
        </section>

        {/* 4. Spotlight: The Masterpiece */}
        <section>
          <MasterpieceSpotlight />
        </section>

        {/* 5. Material Library: Interaction */}
        <section>
          {/* Slightly reworked context for MaterialShowcase */}
          <MaterialShowcase />
        </section>

        {/* 6. Story: The Atelier */}
        <section>
          <AtelierStory />
        </section>

        {/* Legacy / Trust Sections */}
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
