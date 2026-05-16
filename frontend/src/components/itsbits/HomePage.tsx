import { ReactNode, Suspense, lazy, startTransition, useEffect, useRef, useState } from 'react';
import NewArrivalsCarousel from './NewArrivalsCarousel';
import { HomePageConfig, homePageConfigService } from '../../services/homePageConfigService';

const SpotlightSection = lazy(() => import('./SpotlightSection'));
const CollectionJustForYou = lazy(() => import('./CollectionJustForYou'));
const FeaturedBanner = lazy(() => import('./FeaturedBanner'));
const IntrospectiveMagazine = lazy(() => import('./IntrospectiveMagazine'));
const InteriorDesigners = lazy(() => import('./InteriorDesigners'));
const PromiseBanner = lazy(() => import('./PromiseBanner'));
const ProductCarousel = lazy(() => import('./ProductCarousel'));
const VideoProductCarousel = lazy(() => import('./VideoProductCarousel'));
const GalleryImageCarousel = lazy(() => import('./GalleryImageCarousel'));

interface DeferredSectionProps {
  children: ReactNode;
  minHeight?: number;
  rootMargin?: string;
}

const SectionPlaceholder = ({ minHeight }: { minHeight: number }) => (
  <div className="w-full px-4 py-6 md:px-8" style={{ minHeight }} aria-hidden="true">
    <div className="h-8 w-56 max-w-[70%] rounded-md bg-slate-200/70 animate-pulse mb-6" />
    <div className="h-64 w-full rounded-2xl bg-slate-200/70 animate-pulse" />
  </div>
);

const DeferredSection = ({ children, minHeight = 520, rootMargin = '600px 0px' }: DeferredSectionProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isVisible) {
      return;
    }

    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    const current = containerRef.current;
    if (current) {
      observer.observe(current);
    }

    return () => {
      observer.disconnect();
    };
  }, [isVisible, rootMargin]);

  return (
    <div ref={containerRef}>
      {isVisible ? <Suspense fallback={<SectionPlaceholder minHeight={minHeight} />}>{children}</Suspense> : <SectionPlaceholder minHeight={minHeight} />}
    </div>
  );
};

const HomePage = () => {
  const [config, setConfig] = useState<HomePageConfig>(homePageConfigService.getDefaultConfig());

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const next = await homePageConfigService.getPublicConfig();
        if (mounted) {
          startTransition(() => {
            setConfig(next);
          });
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
      <DeferredSection minHeight={620}>
        <SpotlightSection
          sectionTitle={config.spotlight.title}
          cards={config.spotlight.cards.map((card) => ({
            title: card.title,
            subtitle: card.subtitle,
            image: card.image,
            link: card.link,
          }))}
        />
      </DeferredSection>

      {/* ===== SECTION 3: Personalized Collection ===== */}
      <DeferredSection minHeight={560}>
        <CollectionJustForYou
          title={config.personalizedCollection.title}
          subtitle={config.personalizedCollection.subtitle}
          viewMoreText={config.personalizedCollection.viewMoreText}
          viewMoreLink={config.personalizedCollection.viewMoreLink}
        />
      </DeferredSection>

      {/* ===== SECTION 4-7: Product Carousels ===== */}
      {config.productCarousels
        .filter((item) => item.enabled)
        .map((item, index) => (
          <DeferredSection key={`${item.title}-${index}`} minHeight={520}>
            <ProductCarousel
              title={item.title}
              viewAllLink={item.viewAllLink}
              sourceType={item.sourceType}
              manualProductIds={item.manualProductIds}
              sourceCategory={item.sourceCategory}
              sourceSubcategory={item.sourceSubcategory}
              sourceTag={item.sourceTag}
              limit={item.limit}
              sortBy={item.sortBy}
              sortOrder={item.sortOrder}
            />
          </DeferredSection>
        ))}

      {/* ===== SECTION 8: Product Videos Carousel ===== */}
      {config.videoCarousel.enabled && (
        <DeferredSection minHeight={500}>
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
        </DeferredSection>
      )}

      {/* ===== SECTION 9: Featured Banner — Red Carpet Style (50/50 split) ===== */}
      <DeferredSection minHeight={580}>
        <FeaturedBanner
          title={config.featuredBanner.title}
          body={config.featuredBanner.body}
          ctaText={config.featuredBanner.ctaText}
          link={config.featuredBanner.link}
          image={config.featuredBanner.image}
          fallbackImage={config.featuredBanner.fallbackImage}
          imageAlt={config.featuredBanner.imageAlt}
        />
      </DeferredSection>

      {/* ===== SECTION 10: Gallery Image Carousel ===== */}
      <DeferredSection minHeight={540}>
        <GalleryImageCarousel />
      </DeferredSection>

      {/* ===== SECTION 11: Journal ===== */}
      <DeferredSection minHeight={600}>
        <IntrospectiveMagazine
          titlePrefix={config.journal.titlePrefix}
          titleSuffix={config.journal.titleSuffix}
          articles={config.journal.articles}
        />
      </DeferredSection>

      {/* ===== SECTION 13: HS Global Promise ===== */}
      <DeferredSection minHeight={520}>
        <PromiseBanner
          titlePrefix={config.promise.titlePrefix}
          titleHighlight={config.promise.titleHighlight}
          body={config.promise.body}
          ctaText={config.promise.ctaText}
          ctaLink={config.promise.ctaLink}
          items={config.promise.items}
        />
      </DeferredSection>

    </main>
  );
};

export default HomePage;
