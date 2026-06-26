# HS Global Export — Hero Banner Blueprint
### Universal Design System for All Hero Banners

> **This is a living blueprint.** Hand it to any designer, photographer, or AI tool before creating any hero banner. Every banner on the site must follow this document.

---

## Part 1 — Technical Specifications (Non-Negotiable)

### Canvas & Export

| Property | Spec |
|---|---|
| **Master canvas** | `1920 × 1080 px` |
| **Color profile** | sRGB |
| **Format** | `.webp` (primary) · `.jpg` (fallback) |
| **Quality** | 85–90% |
| **Max file size** | ≤ 500 KB per banner |
| **Resolution** | 72 DPI (screen only) |
| **Naming convention** | `hero-[category]-[descriptor]-v[n].webp` |

**Examples:** `hero-marble-bathtub-v1.webp` · `hero-leather-sofa-autumn-v2.webp`

---

### How Banners Are Displayed

The site uses **CSS `object-fit: cover; object-position: center`** — meaning one image serves all screens. The center of the image is always preserved; edges are cropped.

| Device | Rendered ratio | Visible area from 1920×1080 |
|---|---|---|
| Desktop (≥ 641px) | `21:9` | 1920 × 823 px (top/bottom 128px cropped) |
| Mobile (≤ 640px) | `4:3` | ~812 × 1083 px wide strip (left/right 554px cropped) |

---

## Part 2 — Safe Zones (Always Follow This)

### Universal Safe Zone ⭐
This area is **100% visible on EVERY device**:

```
Canvas: 1920 × 1080 px

┌─────────────────────────────────────────────────────────────┐
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  DESKTOP TOP BLEED (128 px)  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓│ y=0
│▓▓▓┌─────────────────────────────────────┐▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│ y=128
│   │                                     │                   │
│MOB│   ⭐ UNIVERSAL SAFE ZONE            │ MOB               │
│ILE│     812 × 823 px                   │ ILE               │
│CRO│     x: 554–1366 / y: 128–951       │ CRO               │
│PPE│     All key content lives HERE      │ PPE               │
│D  │                                     │ D                 │
│▓▓▓└─────────────────────────────────────┘▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│ y=951
│▓▓▓▓▓▓▓▓▓▓▓▓▓  DESKTOP BOTTOM BLEED (129 px)  ▓▓▓▓▓▓▓▓▓▓▓▓▓│ y=1080
└─────────────────────────────────────────────────────────────┘
 x=0     x=554                       x=1366              x=1920
```

### Zone Reference Table

| Zone | Canvas coordinates | Visibility |
|---|---|---|
| ⭐ Universal Safe | x 554–1366, y 128–951 | ✅ All devices |
| Desktop Extended | x 0–1920, y 128–951 | ✅ Desktop only |
| Mobile Extended | x 554–1366, y 0–1080 | ✅ Mobile only |
| Corner bleed zones | x 0–554 or x 1366–1920, y 0–128 or y 951–1080 | ❌ Always cropped |

---

## Part 3 — Composition Rules

### Layout Templates (Pick One Per Banner)

#### Template A — Split Composition (Current Style)
```
┌───────────────────────────────────────┐
│  TEXT PANEL  │   PRODUCT / SCENE      │
│  left 40%    │   right 60%            │
│  (in safe    │   (full bleed ok)      │
│   zone)      │                        │
└───────────────────────────────────────┘
```
- Left panel: brand text, tagline, minimal icons
- Right panel: hero product in lifestyle setting
- **Rule:** Left panel must start at `x ≥ 554` — not at x=0

#### Template B — Full Bleed Scene (Product Center)
```
┌───────────────────────────────────────┐
│                                       │
│       PRODUCT / SCENE fills all       │
│       Text overlay at bottom 25%      │
│       (still inside safe zone)        │
└───────────────────────────────────────┘
```
- No sidebar — entire frame is the environment
- All text in lower portion, `y: 700–900`
- Ideal for room scenes, collections, lifestyle shots

#### Template C — Minimal Typography Hero
```
┌───────────────────────────────────────┐
│                                       │
│   Full atmospheric background         │
│                                       │
│         HEADLINE — CENTER             │
│         Subheadline below             │
│                                       │
└───────────────────────────────────────┘
```
- Background: texture, stone close-up, abstract luxury
- Text perfectly centered at `x=960, y=540`
- Works best for seasonal / campaign banners

---

### Composition Principles

1. **Rule of thirds** — Place the product or focal point at one of the thirds intersections, not dead center
2. **Depth** — Always use foreground, midground, and background layers for a 3D editorial feel
3. **Light source consistency** — Soft natural light from upper-right or upper-left. No harsh studio flashes.
4. **Negative space** — At least 30% of the frame should be open / breathable space
5. **Horizon line** — Keep it above vertical center (`y < 540`) for a grounded, luxurious feel

---

## Part 4 — Brand Aesthetic

### Visual Identity

HS Global Export is a **premium marble, granite, and handcrafted furniture exporter**. Every banner must communicate:

> *Timeless luxury. Artisan quality. Global prestige.*

### Mood Reference
- **Architectural Digest** editorial spreads
- **Robb Report** product photography
- **Loro Piana / Zara Home** catalogue imagery
- Natural, organic materials. Never plastic, never synthetic-looking.

---

### Color Palette

| Palette | Hex values | Use case |
|---|---|---|
| **Warm Stone** | `#C8B89A` · `#E8DDD0` · `#A09080` | Marble / travertine banners |
| **Charcoal Luxury** | `#1A1A1A` · `#2C2C2C` · `#8A8A8A` | Dark granite / black marble |
| **Ivory & Gold** | `#F5F0E8` · `#C9A96E` · `#8B7355` | Premium lifestyle / campaign |
| **Forest & Stone** | `#4A5240` · `#8B8B6B` · `#D4CDB8` | Outdoor / architectural |
| **Deep Navy** | `#1B2A3B` · `#2E4057` · `#C8B89A` | Corporate / export campaign |

**Never use:** flat red, pure white backgrounds, neon, gradient overlays on the banner image.

---

### Lighting Rules

| ✅ Use | ❌ Avoid |
|---|---|
| Soft window / ambient light | Harsh ring lights or studio flats |
| Warm golden hour tones | Cool blue-white temperature |
| Single directional source | Multiple conflicting shadows |
| Subtle lens glow / atmospheric haze | Over-sharpened, HDR-processed looks |
| Natural shadows with soft falloff | Drop shadows or vignettes baked in |

---

### Surface & Material Guidelines

All banners should feature one or more of these materials prominently:

| Material | Visual qualities to capture |
|---|---|
| **White Carrara Marble** | Fine grey veining, polished sheen, cool whites |
| **Travertine** | Warm ivory tones, natural pitting, matte texture |
| **Black Granite** | Mirror polish, deep black, subtle flecks |
| **Green Marble** | Rich emerald, bold veining, dramatic presence |
| **Leather** | Supple folds, warm tones, visible grain |
| **Wood inlay** | Rich walnut / teak tones, fine joinery detail |

---

## Part 5 — Product Category Specific Guides

### Marble Furniture Banners
- Environment: bright, minimal interiors — white walls, natural stone floors
- Lighting: soft side light revealing texture depth
- Camera: slightly elevated 3/4 angle showing form
- Props: single vase, a book, or botanicals only

### Leather Furniture Banners
- Environment: warm residential settings — evening light, wood accents
- Lighting: warm tungsten or golden hour
- Camera: low angle making furniture feel grand
- Props: cashmere throw, small side table, ambient lamp

### Semi-Precious Stone Banners
- Environment: ultra-close macro OR dramatic studio with single specimen
- Lighting: backlit or raking light to reveal translucency / crystalline structure
- Camera: macro or 1:1 detail shot
- Props: none — let the stone speak

### Gallery / Collection Campaign Banners
- Multiple products composed in a curated interior scene
- Use Template B (full bleed scene)
- Aim for a "room reveal" editorial feeling

---

## Part 6 — Typography, Logo & UI Elements (Mandatory)

> **Every banner must include** the brand logo, a headline, a subheadline, and supporting UI elements baked directly into the image. The site does not render text on top — what you design is exactly what the visitor sees.

### Required Elements on Every Banner

| # | Element | Placement | Notes |
|---|---|---|---|
| 1 | **HS Global Export logo** (icon + wordmark) | Top-left of text panel | Inside safe zone |
| 2 | **Tagline** beneath logo | Below wordmark, italic | e.g. *Luxury : A Lifetime Investment* |
| 3 | **Headline** | Center-left, large | Primary message |
| 4 | **Subheadline / body line** | Below headline | 1–2 lines max |
| 5 | **Horizontal rule** | Between headline and icons | Thin 1px line, 60–80px wide |
| 6 | **3 feature icons + labels** | Bottom of text panel | e.g. Premium Quality · Timeless Design · Worldwide Export |

### Typography Specs

| Element | Font | Size (at 1920px canvas) | Weight | Color |
|---|---|---|---|---|
| **Logo wordmark** | Cormorant Garamond | 22–26 pt | Regular | `#FFFFFF` |
| **Tagline** | Cormorant Garamond | 13–15 pt | Italic | `#FFFFFF` / 80% opacity |
| **Headline line 1** | Cormorant Garamond | 72–90 pt | Light (300) | `#FFFFFF` |
| **Headline line 2** | Cormorant Garamond | 72–90 pt | Bold (700) | `#FFFFFF` |
| **Subheadline** | Inter | 16–20 pt | Regular (400) | `#FFFFFF` / 85% opacity |
| **Divider rule** | — | 1 px × 60 px | — | `#FFFFFF` / 60% opacity |
| **Icon labels** | Inter | 10–12 pt | Medium (500) | `#FFFFFF` |

**Text colors:** White only (`#FFFFFF`). Use opacity variants (80–90%) for secondary elements. Never use black or dark text — it fights the photography.

### Icon Style
- Thin-stroke outline icons (1.5–2px stroke, no fill)
- Size: 28–36 px circle at 1920px canvas
- Style: circular border with icon inside — matches current site aesthetic
- Labels: ALL CAPS, letter-spacing +0.12em, below icon

### Text Panel Layout (Template A — Split)
```
 ┌──────────────────────────┐
 │  [Logo icon]             │  ← y ~200
 │  HS GLOBAL EXPORT        │
 │  Luxury : A Lifetime...  │  ← tagline italic
 │                          │
 │  Headline Word           │  ← y ~380, large
 │  Bold Second Word        │  ← same size, bold
 │                          │
 │  Subheadline copy that   │  ← y ~560, 2 lines
 │  spans one or two lines  │
 │  ────────────            │  ← thin rule
 │                          │
 │  ◎        ◎        ◎    │  ← y ~720, icons
 │  PREMIUM  TIMELESS WORLD │
 │  QUALITY  DESIGN  EXPORT │
 └──────────────────────────┘
  x ≥ 554            x ≤ 940
```

### Anti-Patterns to Avoid
- ❌ Text bleeding outside `x: 554–1366` — will crop on mobile
- ❌ Text at `y < 160` or `y > 920` — will crop on desktop
- ❌ Semi-transparent text boxes / frosted glass panels as backgrounds
- ❌ More than 3 feature icons — feels crowded
- ❌ Mixing more than 2 fonts

---

## Part 7 — AI Generation Prompts

> **Two-step approach:**
> 1. Generate the **background scene** (no text) using the photo prompt
> 2. Composite the **text, logo, and icons** over it in Photoshop / Figma / Canva following Part 6 specs

### Step 1 — Background Photo Prompt (Universal Base)

```
Ultra-wide editorial lifestyle photograph for a luxury stone and marble 
export brand, 21:9 aspect ratio. [INSERT PRODUCT AND SCENE BELOW].

Leave the LEFT 35% of the frame as open, breathable negative space 
(wall, ambient shadow, or soft background) — this area will hold 
brand text and logo in post-production.

Lighting: soft natural window light from upper right, warm ambient tone.
Environment: minimal luxury interior — travertine floors, white or warm grey walls.
Mood: Architectural Digest editorial, timeless, serene, high-end.
Camera: slightly elevated 3/4 angle, shallow depth of field.
No text, no UI, no watermarks, no overlays, no vignette.
Color temperature: warm (4500–5500K).
Quality: photorealistic, 8K texture detail, magazine cover quality.
```

### Step 2 — Text & Logo Composite Checklist
After generating the background, overlay in your design tool:
- [ ] HS Global Export logo (icon + wordmark) at top-left of text area
- [ ] Italic tagline beneath logo
- [ ] Large headline (2 lines, light + bold weight)
- [ ] Subheadline body copy (1–2 lines)
- [ ] 1px horizontal rule
- [ ] 3 outline icons with ALL CAPS labels
- [ ] All elements within `x: 554–1366, y: 160–920` safe zone

### Category-Specific Scene Inserts

**Marble Bathtub:**
```
A sculptural freestanding Carrara marble bathtub as the hero, 
center-right of frame, soft steam rising, a single ceramic vessel beside it.
```

**Marble Dining Table:**
```
A large circular white marble dining table set for two, 
fine linen, ambient candlelight, botanicals in the center.
```

**Leather Sofa:**
```
A deep cognac leather three-seater sofa in a warm reading nook, 
walnut side table, amber floor lamp, a cashmere throw draped at one end.
```

**Green Marble Statement Piece:**
```
A dramatic emerald green marble console table against a white wall, 
raking light revealing the bold veining, a single sculptural vase.
```

**Semi-Precious Stone:**
```
A close-up macro of a polished lapis lazuli or amethyst slab surface, 
backlit to reveal crystalline depth, deep jewel tones, no props.
```

**Collection / Campaign:**
```
A curated luxury interior room reveal featuring multiple marble and leather 
furniture pieces — a dining table, console, and accent chair — in a bright 
open-plan space with floor-to-ceiling windows and golden afternoon light.
```

---

## Part 8 — Quality Checklist (Before Uploading)

### Technical
- [ ] Canvas is exactly **1920 × 1080 px**
- [ ] File is **≤ 500 KB** (run through Squoosh or similar)
- [ ] Format is **WebP** (or JPG as fallback)
- [ ] Color profile is **sRGB**

### Composition
- [ ] All critical content is within **x: 554–1366, y: 160–920**
- [ ] Focal product has clear visual weight — not lost in the scene
- [ ] Left 35% of frame has open space for text panel
- [ ] Light source is consistent and warm

### Text & Logo (Required)
- [ ] HS Global Export **logo icon + wordmark** present, top of text panel
- [ ] Italic **tagline** beneath logo
- [ ] **Headline** in Cormorant Garamond, 2 lines, light + bold treatment
- [ ] **Subheadline** body copy in Inter, 1–2 lines
- [ ] Thin **horizontal rule** between body and icons
- [ ] **3 feature icons** (circle outline) + ALL CAPS labels
- [ ] All text is **white** — no dark or colored text

### Brand
- [ ] Mood matches **Architectural Digest / Robb Report** quality
- [ ] No unwanted gradients or vignettes on the photo background
- [ ] Colors align with the **Warm Stone** or **Charcoal Luxury** palette

### Preview Test
- [ ] Viewed at **1920px wide** — desktop crop looks correct
- [ ] Viewed at **390px wide** — center content still visible, nothing key cut off
- [ ] Looks good at both sizes without retouch

---

## Part 9 — File Naming Convention

```
hero-[category]-[descriptor]-v[version].[format]

Examples:
  hero-marble-bathtub-v1.webp
  hero-marble-dining-table-autumn-v1.webp
  hero-leather-sofa-campaign-v2.webp
  hero-granite-black-statement-v1.webp
  hero-collection-livingroom-v3.webp
```

---

*Blueprint version: 1.0 · HS Global Export Design System · June 2026*
