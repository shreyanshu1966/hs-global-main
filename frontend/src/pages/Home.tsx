import { Helmet } from "react-helmet-async";
import Hero from "../components/Hero";
import Testimonials from "../components/Testimonials";
import CategoriesSlider from "../components/CategoriesSlider";
import AboutCompany from "../components/AboutCompany";
import ChooseStone from "../components/ChooseStone";
import TrustBadges from "../components/TrustBadges";

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
        <meta property="og:title" content="Granite & Marble Collection - Luxury Stone Designs | HS Global Export" />
        <meta property="og:description" content="Transform your interiors with HS Global Export's granite and marble collection. Unique designs and premium materials for luxurious living spaces." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.hsglobalexport.com/products" />
        <meta property="og:image" content="https://www.hsglobalexport.com/public/banner/banner1.jpg" />
        <link rel="canonical" href="https://www.hsglobalexport.com/" />

        {/* ✅ Optional extra SEO meta */}
        <meta name="author" content="HS Global Export" />
        <meta name="robots" content="index, follow" />
      </Helmet>

      {/* Main content */}
      <section style={{ contentVisibility: 'auto', containIntrinsicSize: '1000px' }}>
        <Hero />
      </section>
      <section style={{ contentVisibility: 'auto', containIntrinsicSize: '1200px' }}>
        <AboutCompany />
      </section>
      <section style={{ contentVisibility: 'auto', containIntrinsicSize: '800px' }}>
        <CategoriesSlider />
      </section>
      <section style={{ contentVisibility: 'auto', containIntrinsicSize: '600px' }}>
        <TrustBadges />
      </section>
      <section style={{ contentVisibility: 'auto', containIntrinsicSize: '1000px' }}>
        <ChooseStone />
      </section>
      <section style={{ contentVisibility: 'auto', containIntrinsicSize: '800px' }}>
        <Testimonials />
      </section>
    </>
  );
};

export default Home;
