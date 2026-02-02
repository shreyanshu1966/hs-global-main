# Hallmark of Stone: Marble Furniture Homepage Redesign Plan

## 1. Vision & Strategy
We will transform the homepage into a digital "Atelier" — a space that feels less like a catalog and more like an exhibition of fine art. The design will be heavy on **editorial typography**, **cinematic imagery**, and **immersive scrolling**, inspired by Awwwards winners and top styling houses (e.g., Minotti, Poliform, stone specialists).

**Core Design Pillars:**
*   **Materiality First**: The stone textures (veins, polish) are the hero.
*   **Negative Space**: Radical use of whitespace to create a sense of luxury.
*   **Motion**: Subtle parallax, text reveals, and smooth scrolling (using Lenis/GSAP).
*   **Mobile-First Elegance**: Swipeable interactions rather than just stacking everything vertically.

---

## 2. Proposed Structure

### A. The Hero: "The Monolith"
*   **Concept**: A full-screen cinematic section that feels heavy and grounded.
*   **Content**: High-definition video or slow-pan image of a signature marble dining table in a dark, moody room or bright, sunlit architectural space.
*   **Interaction**: Text (`Sculptured Living`) stays sticky while the background creates a parallax depth effect.
*   **Mobile**: Full height, title breaks cleanly, "Scroll" indicator visible.

### B. Act I: The Philosophy (New Section)
*   **Title**: "Timeless Nature"
*   **Layout**: A split-screen editorial.
    *   *Left*: Large serif typography quote about the permanence of stone.
    *   *Right*: A slow-rotating 3D-like sequence or raw stone texture close-up.
*   **Purpose**: Establish authority in the material before selling the product.

### C. Act II: The Collections (Redesigned)
*   **Current Issue**: Standard grids feel too e-commerce.
*   **New Layout**: "The Gallery Walk"
    *   **Desktop**: An offset, asymmetrical list. When you hover over a category name (e.g., "Dining", "Coffee Tables"), a large preview image reveals in the background or follows the cursor.
    *   **Mobile**: A horizontal swipe carousel with "snap" physics, showing large cards with titles overlaid.

### D. Act III: The Craft (Enhanced)
*   **Title**: "From Quarry to Heirloom"
*   **Layout**: A horizontal scrolling section (pin-scrolling) that walks through the 3 steps: Sourcing, Cutting, Polishing.
*   **Visual**: Video loops for each step.

### E. Act IV: The Signature Piece (Spotlight)
*   **Focus**: Single product deep-dive.
*   **Interaction**: "Exploded view" or hotspot markers that detail the edge profile, the stone origin, and the base material.

### F. Footer: The Concierge
*   **Style**: Minimalist. Big typography for links.
*   **CTA**: "Begin Your Bespoke Commission" instead of just "Contact Us".

---

## 3. Technical Implementation

### Technologies
*   **Framework**: React (Vite)
*   **Styling**: Tailwind CSS (for layout) + Custom CSS variables for advanced typography.
*   **Animation**: GSAP (ScrollTrigger) or Framer Motion (for effortless transitions).
*   **Images**: Cloudinary (optimized formats).

### Code Changes Required
1.  **Refactor `HeroFurniture.tsx`**: Update GSAP animations for smoother "reveal".
2.  **Create `Components/Philosophy.tsx`**: New editorial text section.
3.  **Update `FurnitureCategories.tsx`**: Switch to the "Cursor Follow/Reveal" pattern on desktop.
4.  **Update `Craftsmanship.tsx`**: Implement horizontal scroll trigger.
5.  **Global Type Update**: Ensure `font-serif` works globally (using a premium font like Playfair Display or Cinzel).

---

## 4. Mobile Responsiveness Check
*   **Navigation**: Hamburger menu with full-screen overlay.
*   **Touch Targets**: Buttons minimum 48px height.
*   **Gestures**: Swipe enabled for all horizontal galleries.

## 5. Next Steps
**Do I have your approval to begin the implementation of Phase 1 (The Hero & Philosophy sections)?**
