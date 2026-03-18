# ITSBITS Home Page Mobile Responsiveness Plan

Date: 2026-03-15
Status: Planning only (no implementation yet)
Requested by: User

## Goal
Make the Isbits-style home page fully mobile-friendly and responsive, aligned with the behavior and layout intent of the downloaded reference site assets.

Reference used for parity guidance:
- `saveweb2zip-com-www-1stdibs-com/index.html`
- `saveweb2zip-com-www-1stdibs-com/css/responsiveHeader-buyer-*.css`
- `saveweb2zip-com-www-1stdibs-com/css/homepage*.css`

## Current Findings (Why mobile breaks)
1. Heavy use of inline fixed sizes (widths, heights, margins, typography) inside React components.
2. Header is fixed and complex, but mobile nav behavior is partial (horizontal scroll only) and no compact menu mode.
3. Multiple sections rely on desktop-first spacing and card widths, causing crowding on small viewports.
4. Footer uses inline desktop paddings and dense multi-column content without explicit mobile-first structure.
5. Responsiveness exists in `frontend/src/styles/itsbits-home.css`, but component inline styles still override many breakpoints.

## Scope
In scope:
- Home page entry layout and fixed header offset behavior.
- Header top row and nav behavior for tablet/mobile.
- All Isbits homepage sections (carousel, spotlight, featured split, journal, collections, promise).
- Footer layout and typography on mobile.
- Responsive consistency across breakpoints.

Out of scope:
- Business logic/API changes.
- Content rewrite.
- Non-home pages.

## Files To Update (Planned)
Primary styling and layout:
- `frontend/src/styles/itsbits-home.css`
- `frontend/src/pages/Home.tsx`
- `frontend/src/components/itsbits/HomePage.tsx`
- `frontend/src/components/itsbits/Header.tsx`
- `frontend/src/components/itsbits/Footer.tsx`

Section components with inline desktop values to normalize:
- `frontend/src/components/itsbits/NewArrivalsCarousel.tsx`
- `frontend/src/components/itsbits/SpotlightSection.tsx`
- `frontend/src/components/itsbits/CollectionJustForYou.tsx`
- `frontend/src/components/itsbits/ProductCarousel.tsx`
- `frontend/src/components/itsbits/FeaturedBanner.tsx`
- `frontend/src/components/itsbits/IntrospectiveMagazine.tsx`
- `frontend/src/components/itsbits/InteriorDesigners.tsx`
- `frontend/src/components/itsbits/PromiseBanner.tsx`
- `frontend/src/components/itsbits/ProductCard.tsx`

Likely unchanged logic helper:
- `frontend/src/components/itsbits/useHorizontalCarousel.ts`

## Breakpoint Strategy
Adopt explicit mobile-first tokens with these tiers:
- Small mobile: <= 480px
- Mobile/tablet: 481px to 768px
- Tablet/small desktop: 769px to 1024px
- Desktop: >= 1025px

## Implementation Plan (Phased)

### Phase 1: Baseline and Guardrails
1. Define spacing and sizing CSS variables for rails, gutters, card widths, and section gaps.
2. Centralize typography scale for mobile/tablet/desktop.
3. Ensure `main` top spacing is derived from header height per breakpoint.

Deliverable:
- Stable global responsive baseline in `itsbits-home.css`.

### Phase 2: Header and Navigation (Highest Priority)
1. Replace remaining fixed desktop assumptions in header container widths.
2. Introduce clear mobile header mode:
- compact logo
- optional hidden/condensed search presentation
- safe tap targets for icons
3. Improve bottom nav behavior on mobile:
- horizontal scroll with snap and stronger touch ergonomics
- prevent overlap and clipping
- preserve active state visibility
4. Align motion behavior with reduced-motion settings.

Deliverable:
- Header that does not overflow, overlap, or consume excessive vertical space on phones.

### Phase 3: Hero and Carousel Sections
1. Remove inline hardcoded widths/heights from carousel title blocks and cards where possible.
2. Standardize card width rules by breakpoint using CSS classes only.
3. Ensure arrows hide on touch devices and swipe cue appears consistently.
4. Ensure no horizontal page overflow while preserving horizontal rail scroll.

Deliverable:
- New Arrivals, Spotlight, Collection, and Product carousels are swipe-friendly and readable on mobile.

### Phase 4: Split Banner, Journal, Collections, Promise
1. Convert split banner to stack mode on mobile with controlled image height and readable type.
2. Journal switches to single-column with proper aspect ratio handling and spacing.
3. Collections rail and Promise grid collapse cleanly to one column where needed.
4. Tighten typography and spacing to avoid cramped blocks.

Deliverable:
- Mid/lower homepage sections visually consistent and touch-friendly.

### Phase 5: Footer Mobile Simplification
1. Convert dense footer columns into mobile-friendly stacked groups.
2. Reduce padding and improve line wrapping for legal/region links.
3. Keep desktop structure intact while optimizing mobile readability.

Deliverable:
- Footer readable and navigable on small screens without overflow.

### Phase 6: QA and Responsive Validation
1. Verify at widths: 360, 390, 414, 768, 820, 1024, 1280.
2. Check for:
- no horizontal viewport overflow
- no clipped text/buttons
- stable fixed header with correct content offset
- smooth horizontal scroll rails
- acceptable tap target sizes
3. Visual compare with downloaded Isbits structure intent for spacing rhythm and header behavior.

Deliverable:
- Final responsive pass complete and regression-free.

## Acceptance Criteria
1. Home page has no horizontal body overflow on mobile sizes.
2. Header is fully usable on mobile and does not overlap content.
3. All carousel sections are swipe-friendly and card content remains legible.
4. Banner/journal/promise/footer adapt cleanly from desktop to mobile.
5. Styles are primarily controlled through CSS classes/media queries, minimizing inline breakpoint conflicts.

## Risks and Mitigations
1. Risk: Inline styles continue to override media-query behavior.
- Mitigation: Move fixed style values to CSS classes and keep inline usage minimal.
2. Risk: Header height changes break top content offset.
- Mitigation: Unify offset with breakpoint-specific variables.
3. Risk: Visual drift from Isbits look.
- Mitigation: Keep typography families and spacing rhythm aligned with reference assets.

## Execution Order (When you approve)
1. Header + top offset
2. Rails/carousels
3. Banner/journal/collections/promise
4. Footer
5. QA and polish

## Note
No implementation has been started yet, per your instruction. I will begin coding only after your approval.
