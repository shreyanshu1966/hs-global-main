# HS Global Export — Hero Banner Blueprint
### Universal Design System for All Hero Banners

> **This is a living blueprint.** Hand it to any designer, photographer, or AI tool before creating any hero banner. Every banner on the site must follow this document.

---

## Part 1 — Technical Specifications (Non-Negotiable)

## Part 1 — Technical Specifications (Non-Negotiable)

We use a **Dual-Banner System**. You must design and export **two separate files** for every hero section to ensure zero cropping and perfect layout across all devices.

### 1. Desktop Canvas (Ultra-wide)
| Property | Spec |
|---|---|
| **Master canvas** | `1920 × 640 px` |
| **Aspect Ratio** | `3:1` (Ultra-wide / Thin) |
| **Visibility** | Renders perfectly on Laptops & Desktops |
| **Naming convention** | `hero-[product]-desktop-v[n].webp` |

### 2. Mobile Canvas (Portrait)
| Property | Spec |
|---|---|
| **Master canvas** | `1080 × 1350 px` |
| **Aspect Ratio** | `4:5` (Vertical / Portrait) |
| **Visibility** | Renders perfectly on Phones & Tablets |
| **Naming convention** | `hero-[product]-mobile-v[n].webp` |

### General Export Rules
| Property | Spec |
|---|---|
| **Color profile** | sRGB |
| **Format** | `.webp` (primary) · `.jpg` (fallback) |
| **Quality** | 85–90% |
| **Max file size** | ≤ 400 KB per desktop banner, ≤ 250 KB per mobile banner |

---

## Part 2 — Layout Strategy (No Cropping)

Because we use two separate files, **there is ZERO cropping**. 
- Desktop users see the full `1920x640` design scaled down to fit their laptop width.
- Mobile users see the full `1080x1350` design scaled down to fit their phone width.

You do not need to worry about safe zones or cropping! Just design the graphic to look perfect within its respective canvas size.

---

## Part 3 — Typography, Logo & UI Elements (Mandatory)

> **Every banner must include** the brand logo, a headline, a subheadline, and supporting UI elements baked directly into the image. 

### Required Elements on Every Banner

| # | Element | Placement | Notes |
|---|---|---|---|
| 1 | **HS Global Export logo** (icon + wordmark) | Top-left of text panel | Use the white version |
| 2 | **Tagline** beneath logo | Below wordmark, italic | e.g. *Luxury : A Lifetime Investment* |
| 3 | **Headline** | Center-left, large | Primary message |
| 4 | **Subheadline / body line** | Below headline | 1–2 lines max |
| 5 | **Horizontal rule** | Between headline and icons | Thin 1px line, 60–80px wide |
| 6 | **3 feature icons + labels** | Bottom of text panel | e.g. Premium Quality · Timeless Design · Worldwide Export |

### Text Panel Layout (Template A — Split)
```
 ┌──────────────────────────────────────────────┐
 │  [Logo] HS GLOBAL EXPORT       [ Product ]   │
 │  Luxury : A Lifetime...                      │
 │                                [  Image  ]   │
 │  Headline Word                               │
 │  Bold Second Word              [  Goes   ]   │
 │                                              │
 │  Subheadline copy that         [  Here   ]   │
 │  spans one or two lines                      │
 │  ────────────                                │
 │  ◎ PREMIUM  ◎ TIMELESS  ◎ WORLD              │
 └──────────────────────────────────────────────┘
```

**Text colors:** White only (`#FFFFFF`). Use opacity variants (80–90%) for secondary elements. Never use black or dark text — it fights the photography.

---

## Part 4 — AI Generation Prompts

> **Two-step approach:**
> 1. Generate the **background scene** (no text) using the photo prompt
> 2. Composite the **text, logo, and icons** over it in Photoshop / Figma / Canva

### Step 1 — Background Photo Prompt (Universal Base)

```
Ultra-wide architectural lifestyle photograph for a luxury stone and marble 
export brand, 3:1 aspect ratio, cinematic and thin. [INSERT PRODUCT AND SCENE BELOW].

Leave the LEFT 40% of the frame as open, breathable negative space 
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

### Category-Specific Scene Inserts

**Marble Bathtub:**
```
A sculptural freestanding Carrara marble bathtub as the hero, 
center-right of frame, soft steam rising, a single ceramic vessel beside it.
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

---

## Part 5 — Quality Checklist (Before Uploading)

### Technical
- [ ] Canvas is exactly **1920 × 640 px**
- [ ] File is **≤ 400 KB** (run through Squoosh or similar)
- [ ] Format is **WebP** (or JPG as fallback)
- [ ] Color profile is **sRGB**

### Text & Logo (Required)
- [ ] Left 40% of frame has open space for the text panel
- [ ] HS Global Export **logo icon + wordmark** present
- [ ] **Headline** in Cormorant Garamond
- [ ] **Subheadline** body copy in Inter
- [ ] **3 feature icons** (circle outline) + ALL CAPS labels
- [ ] **Mobile test:** Zoom out to ~400px width and ensure text is still readable.

### Brand
- [ ] Mood matches **Architectural Digest / Robb Report** quality
- [ ] No unwanted gradients or vignettes on the photo background
- [ ] No dark overlays — image is bright and clear

---
*Blueprint version: 2.0 (Thin 3:1 Scaling Banner) · HS Global Export Design System*
