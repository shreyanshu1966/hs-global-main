'use client';
import { ReactNode, Suspense, lazy, startTransition, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HeroSection from './HeroSection';
import CategoryCards from './CategoryCards';
import TrustCTABar from './TrustCTABar';
import { HomePageConfig, homePageConfigService } from '../../services/homePageConfigService';
import { useAuth } from '../../contexts/AuthContext';

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
  // Default to visible so the section content is server-rendered (SEO). The
  // IntersectionObserver path below is now a no-op, kept for structure.
  const [isVisible, setIsVisible] = useState(true);

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
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';

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

      {/* Admin floating toolbar — only visible to admins */}
      {isAdmin && (
        <div className="fixed bottom-6 right-6 z-[200] flex flex-col items-end gap-2">
          <button
            onClick={() => navigate('/admin', { state: { tab: 'categories' } })}
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-white text-xs font-semibold shadow-lg hover:bg-slate-700 transition-all"
            title="Edit navbar category dropdowns"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Edit Nav Categories
          </button>
          <button
            onClick={() => navigate('/admin', { state: { tab: 'homepage' } })}
            className="flex items-center gap-2 rounded-xl bg-slate-700 px-4 py-2.5 text-white text-xs font-semibold shadow-lg hover:bg-slate-600 transition-all"
            title="Edit home page content"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            Edit Home Page
          </button>
        </div>
      )}

      {/* ===== SECTION 1: Hero ===== */}
      <HeroSection
        slides={config.hero.slides}
        autoplayInterval={config.hero.autoplayInterval}
      />

      {/* ===== SECTION 2: Category Cards ===== */}
      <CategoryCards
        title={config.categoryCards.title}
        cards={config.categoryCards.cards}
      />

      {/* ===== SECTION 2b: Trust / CTA Bar ===== */}
      <TrustCTABar />

      {/* ===== SECTION 3: In the Spotlight ===== */}
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

      {/* ===== SECTION 4: Personalized Collection ===== */}
      <DeferredSection minHeight={560}>
        <CollectionJustForYou
          title={config.personalizedCollection.title}
          subtitle={config.personalizedCollection.subtitle}
          viewMoreText={config.personalizedCollection.viewMoreText}
          viewMoreLink={config.personalizedCollection.viewMoreLink}
        />
      </DeferredSection>

      {/* ===== SECTION 5-8: Product Carousels ===== */}
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
