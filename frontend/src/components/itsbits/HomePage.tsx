import NewArrivalsCarousel from './NewArrivalsCarousel';
import SpotlightSection from './SpotlightSection';
import CollectionJustForYou from './CollectionJustForYou';
import FeaturedBanner from './FeaturedBanner';
import IntrospectiveMagazine from './IntrospectiveMagazine';
import InteriorDesigners from './InteriorDesigners';
import PromiseBanner from './PromiseBanner';
import ProductCarousel from './ProductCarousel';

const HomePage = () => {
  return (
    <main className="w-full mx-auto overflow-hidden" id="mainContent">

      {/* ===== SECTION 1: See What's New (New Arrivals Carousel) ===== */}
      <NewArrivalsCarousel />

      {/* ===== SECTION 2: In the Spotlight ===== */}
      <SpotlightSection />

      {/* ===== SECTION 3: Personalized Collection ===== */}
      <CollectionJustForYou />

      {/* ===== SECTION 4-7: Product Carousels ===== */}
      <ProductCarousel title="Signature Marble Furniture" viewAllLink="/products?cat=furniture" />
      <ProductCarousel title="Luxury Marble Furniture Series" viewAllLink="/products?cat=furniture" />
      <ProductCarousel title="Marble Furniture Favorites" viewAllLink="/products?cat=furniture" />
      <ProductCarousel title="Export-Ready Marble Furniture" viewAllLink="/products?cat=furniture" />

      {/* ===== SECTION 7: Featured Banner — Red Carpet Style (50/50 split) ===== */}
      <FeaturedBanner />

      {/* ===== SECTION 8: Journal ===== */}
      <IntrospectiveMagazine />

      {/* ===== SECTION 9: Collections ===== */}
      <InteriorDesigners />

      {/* ===== SECTION 10: HS Global Promise ===== */}
      <PromiseBanner />

    </main>
  );
};

export default HomePage;
