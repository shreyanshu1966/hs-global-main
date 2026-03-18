import { useEffect, useState } from 'react';
import NewArrivalsCarousel from './NewArrivalsCarousel';
import SpotlightSection from './SpotlightSection';
import CollectionJustForYou from './CollectionJustForYou';
import FeaturedBanner from './FeaturedBanner';
import IntrospectiveMagazine from './IntrospectiveMagazine';
import InteriorDesigners from './InteriorDesigners';
import PromiseBanner from './PromiseBanner';
import ProductCarousel from './ProductCarousel';
import VideoProductCarousel from './VideoProductCarousel';
import GalleryImageCarousel from './GalleryImageCarousel';
import { HomePageConfig, homePageConfigService } from '../../services/homePageConfigService';

const HomePage = () => {
  const [config, setConfig] = useState<HomePageConfig>(homePageConfigService.getDefaultConfig());

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const next = await homePageConfigService.getPublicConfig();
        if (mounted) {
          setConfig(next);
        }
      } catch (_error) {
        // Keep defaults if config cannot be fetched.
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main className="w-full mx-auto overflow-hidden" id="mainContent">

      {/* ===== SECTION 1: See What's New (New Arrivals Carousel) ===== */}
      <NewArrivalsCarousel
        headingTitle={config.newArrivals.title}
        ctaText={config.newArrivals.ctaText}
        ctaLink={config.newArrivals.ctaLink}
        sourceType={config.newArrivals.sourceType}
        manualProductIds={config.newArrivals.manualProductIds}
        tag={config.newArrivals.tag}
        limit={config.newArrivals.limit}
        category={config.newArrivals.category}
        featured={config.newArrivals.featured}
        sortBy={config.newArrivals.sortBy}
        sortOrder={config.newArrivals.sortOrder}
        marbleFurnitureOnly={config.newArrivals.marbleFurnitureOnly}
      />

      {/* ===== SECTION 2: In the Spotlight ===== */}
      <SpotlightSection
        sectionTitle={config.spotlight.title}
        cards={config.spotlight.cards.map((card) => ({
          title: card.title,
          subtitle: card.subtitle,
          image: card.image,
          link: card.link,
        }))}
      />

      {/* ===== SECTION 3: Personalized Collection ===== */}
      <CollectionJustForYou
        title={config.personalizedCollection.title}
        subtitle={config.personalizedCollection.subtitle}
        viewMoreText={config.personalizedCollection.viewMoreText}
        viewMoreLink={config.personalizedCollection.viewMoreLink}
      />

      {/* ===== SECTION 4-7: Product Carousels ===== */}
      {config.productCarousels
        .filter((item) => item.enabled)
        .map((item, index) => (
          <ProductCarousel
            key={`${item.title}-${index}`}
            title={item.title}
            viewAllLink={item.viewAllLink}
            sourceType={item.sourceType}
            manualProductIds={item.manualProductIds}
            sourceCategory={item.sourceCategory}
            sourceTag={item.sourceTag}
            limit={item.limit}
            sortBy={item.sortBy}
            sortOrder={item.sortOrder}
          />
        ))}

      {/* ===== SECTION 8: Product Videos Carousel ===== */}
      {config.videoCarousel.enabled && (
        <VideoProductCarousel
          title={config.videoCarousel.title}
          ctaText={config.videoCarousel.ctaText}
          ctaLink={config.videoCarousel.ctaLink}
          sourceType={config.videoCarousel.sourceType}
          manualProductIds={config.videoCarousel.manualProductIds}
          sourceCategory={config.videoCarousel.sourceCategory}
          sourceTag={config.videoCarousel.sourceTag}
          limit={config.videoCarousel.limit}
          sortBy={config.videoCarousel.sortBy}
          sortOrder={config.videoCarousel.sortOrder}
        />
      )}

      {/* ===== SECTION 9: Featured Banner — Red Carpet Style (50/50 split) ===== */}
      <FeaturedBanner
        title={config.featuredBanner.title}
        body={config.featuredBanner.body}
        ctaText={config.featuredBanner.ctaText}
        link={config.featuredBanner.link}
        image={config.featuredBanner.image}
        fallbackImage={config.featuredBanner.fallbackImage}
        imageAlt={config.featuredBanner.imageAlt}
      />

      {/* ===== SECTION 10: Gallery Image Carousel ===== */}
      <GalleryImageCarousel />

      {/* ===== SECTION 11: Journal ===== */}
      <IntrospectiveMagazine
        titlePrefix={config.journal.titlePrefix}
        titleSuffix={config.journal.titleSuffix}
        articles={config.journal.articles}
      />

      {/* ===== SECTION 12: Collections ===== */}
      <InteriorDesigners
        sectionTitle={config.collections.title}
        cards={config.collections.cards.map((card) => ({
          title: card.title,
          image: card.image,
          link: card.link,
        }))}
      />

      {/* ===== SECTION 13: HS Global Promise ===== */}
      <PromiseBanner
        titlePrefix={config.promise.titlePrefix}
        titleHighlight={config.promise.titleHighlight}
        body={config.promise.body}
        ctaText={config.promise.ctaText}
        ctaLink={config.promise.ctaLink}
        items={config.promise.items}
      />

    </main>
  );
};

export default HomePage;
