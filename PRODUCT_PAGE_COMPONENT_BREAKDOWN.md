# Product Page Component Breakdown

## Components to DISCARD (Old Design)

### 1. Current Product Pages
```
❌ frontend/src/pages/ProductDetails.tsx (1239 lines)
   - Too cluttered with features
   - Generic e-commerce layout
   - Excessive color usage
   - Cramped spacing
   - Multiple tabs feel disconnected

❌ frontend/src/components/ProductsModernVariant.tsx (796 lines)
   - Complex scroll logic
   - Too many animations
   - Overwhelming user interactions
   - Difficult to maintain
```

### 2. Current Product Card
```
❌ frontend/src/components/ProductCard.tsx (555 lines)
   - Overly complex hover states
   - Video autoplay on cards (too much)
   - Busy with too many elements
   - Slideshow feels gimmicky
   - Performance concerns with observers
```

### 3. Related Components to Review
```
⚠️ frontend/src/components/ProductDetailsSkeleton.tsx
   - May need redesign to match new aesthetic
   
⚠️ frontend/src/components/ProductCategoriesGrid.tsx
   - Review for consistency
   
⚠️ frontend/src/components/ProductSkeleton.tsx
   - Update to match new loading states
```

---

## New Component Architecture

### Core Product Components

#### 1. ProductDetails.tsx (NEW)
```tsx
/**
 * Main product detail page - Clean, focused, elegant
 * 
 * Structure:
 * - Minimal header with breadcrumbs
 * - Large hero section (60/40 split)
 * - Product overview
 * - Specifications (elegant table)
 * - Story/Craftsmanship
 * - Reviews (refined)
 * - Related products (4 max)
 * 
 * Key Changes:
 * - No tabs (single scroll experience)
 * - Generous whitespace
 * - Sticky product info on scroll
 * - Fullscreen gallery modal
 */

import { ProductHero } from '@/components/product/ProductHero';
import { ProductOverview } from '@/components/product/ProductOverview';
import { ProductSpecifications } from '@/components/product/ProductSpecifications';
import { ProductStory } from '@/components/product/ProductStory';
import { ProductReviews } from '@/components/product/ProductReviews';
import { RelatedProducts } from '@/components/product/RelatedProducts';

export default function ProductDetails() {
  return (
    <div className="bg-white">
      <Breadcrumbs />
      <ProductHero />
      <ProductOverview />
      <ProductSpecifications />
      <ProductStory />
      <ProductReviews />
      <RelatedProducts />
    </div>
  );
}
```

#### 2. ProductHero.tsx (NEW)
```tsx
/**
 * Hero section with gallery and essential info
 * 
 * Features:
 * - Large image gallery (60% width)
 * - Vertical thumbnail strip
 * - Fullscreen view option
 * - Essential product info (40% width)
 * - Sticky on scroll (mobile)
 * 
 * Layout:
 * ┌────────────────────────────────────┐
 * │  [Gallery]        [Info Panel]     │
 * │                   - Name           │
 * │  Main Image       - Price          │
 * │  (60%)            - Brief specs    │
 * │                   - CTA            │
 * │  [Thumbnails]     - Share/Save     │
 * └────────────────────────────────────┘
 */

interface ProductHeroProps {
  product: Product;
  onAddToCart: () => void;
}

export function ProductHero({ product, onAddToCart }: ProductHeroProps) {
  return (
    <section className="container mx-auto px-6 py-12 lg:py-20">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
        {/* Gallery - 60% */}
        <div className="lg:col-span-3">
          <ProductGallery images={product.images} />
        </div>
        
        {/* Info - 40% */}
        <div className="lg:col-span-2 lg:sticky lg:top-24 h-fit">
          <ProductInfo product={product} onAddToCart={onAddToCart} />
        </div>
      </div>
    </section>
  );
}
```

#### 3. ProductGallery.tsx (NEW)
```tsx
/**
 * Image gallery with fullscreen option
 * 
 * Features:
 * - Main image display
 * - Vertical thumbnail strip
 * - Click to zoom/fullscreen
 * - Keyboard navigation
 * - Swipe on mobile
 * - Image counter (1/12)
 * 
 * Design:
 * - 4:3 aspect ratio
 * - Clean, minimal chrome
 * - Subtle transitions
 * - High-res zoom
 */

export function ProductGallery({ images }: { images: string[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div 
        className="aspect-[4/3] bg-[#FAF8F5] cursor-zoom-in overflow-hidden"
        onClick={() => setIsFullscreen(true)}
      >
        <img 
          src={images[activeIndex]}
          alt=""
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
        
        {/* Counter */}
        <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
          {activeIndex + 1} / {images.length}
        </div>
      </div>
      
      {/* Thumbnails */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIndex(idx)}
            className={`flex-shrink-0 w-20 h-20 overflow-hidden transition-all duration-200
              ${activeIndex === idx ? 'ring-2 ring-[#B8944A] opacity-100' : 'opacity-60 hover:opacity-100'}`}
          >
            <img src={img} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
      
      {/* Fullscreen Modal */}
      {isFullscreen && (
        <FullscreenGallery 
          images={images} 
          initialIndex={activeIndex}
          onClose={() => setIsFullscreen(false)}
        />
      )}
    </div>
  );
}
```

#### 4. ProductInfo.tsx (NEW)
```tsx
/**
 * Essential product information
 * 
 * Content:
 * - Product name (serif, large)
 * - Category/Material subtitle
 * - Price (prominent)
 * - Key specifications (3-4 items)
 * - Add to cart / Inquire CTA
 * - Share and save options
 * 
 * Style:
 * - Clean typography
 * - Minimal color
 * - Generous spacing
 * - Subtle dividers
 */

export function ProductInfo({ product, onAddToCart }: ProductInfoProps) {
  return (
    <div className="space-y-8">
      {/* Name */}
      <div>
        <h1 className="font-serif text-4xl lg:text-5xl text-[#2B2B2B] leading-tight mb-3">
          {product.name}
        </h1>
        <p className="text-sm text-[#6B6B6B] uppercase tracking-wider">
          {product.category} · {product.material}
        </p>
      </div>
      
      {/* Price */}
      <div className="border-t border-[#E8E3DC] pt-6">
        <p className="text-3xl font-medium text-[#2B2B2B]">
          {product.price}
        </p>
        {product.moq && (
          <p className="text-sm text-[#6B6B6B] mt-2">{product.moq}</p>
        )}
      </div>
      
      {/* Quick Specs */}
      <div className="space-y-3 text-sm">
        <SpecItem label="Material" value={product.specs.material} />
        <SpecItem label="Finish" value={product.specs.finish} />
        <SpecItem label="Origin" value={product.specs.origin} />
      </div>
      
      {/* CTA */}
      <div className="space-y-3">
        <Button onClick={onAddToCart} variant="primary" fullWidth>
          Add to Cart
        </Button>
        <Button variant="secondary" fullWidth>
          Request Information
        </Button>
      </div>
      
      {/* Actions */}
      <div className="flex items-center gap-6 text-sm border-t border-[#E8E3DC] pt-6">
        <button className="flex items-center gap-2 hover:opacity-70 transition-opacity">
          <ShareIcon /> Share
        </button>
        <button className="flex items-center gap-2 hover:opacity-70 transition-opacity">
          <HeartIcon /> Save
        </button>
      </div>
    </div>
  );
}
```

#### 5. ProductOverview.tsx (NEW)
```tsx
/**
 * Product overview section
 * 
 * Content:
 * - Brief introduction
 * - Key highlights (3-4 points)
 * - Material information
 * - Use cases
 * 
 * Style:
 * - Editorial layout
 * - Large, readable text
 * - Subtle section divider
 */

export function ProductOverview({ product }: { product: Product }) {
  return (
    <section className="bg-[#FAF8F5] py-16 lg:py-24">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="prose prose-lg">
          <p className="text-xl text-[#2B2B2B] leading-relaxed mb-8">
            {product.description}
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            {product.highlights.map((highlight, idx) => (
              <div key={idx}>
                <h3 className="font-serif text-xl text-[#2B2B2B] mb-2">
                  {highlight.title}
                </h3>
                <p className="text-[#6B6B6B]">
                  {highlight.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
```

#### 6. ProductSpecifications.tsx (NEW)
```tsx
/**
 * Detailed specifications
 * 
 * Layout:
 * - Clean table design
 * - Grouped by category
 * - Expandable sections
 * - No form controls (display only)
 * 
 * Style:
 * - Minimal borders
 * - Clear hierarchy
 * - Easy to scan
 */

export function ProductSpecifications({ specs }: { specs: ProductSpecs }) {
  return (
    <section className="container mx-auto px-6 py-16 lg:py-24 max-w-5xl">
      <h2 className="font-serif text-3xl lg:text-4xl text-[#2B2B2B] mb-12 text-center">
        Specifications
      </h2>
      
      <div className="bg-white border border-[#E8E3DC]">
        {/* Material */}
        <SpecGroup title="Material & Construction">
          <SpecRow label="Primary Material" value={specs.material} />
          <SpecRow label="Finish" value={specs.finish} />
          <SpecRow label="Treatment" value={specs.treatment} />
        </SpecGroup>
        
        {/* Dimensions */}
        <SpecGroup title="Dimensions">
          <SpecRow label="Length" value={specs.length} />
          <SpecRow label="Width" value={specs.width} />
          <SpecRow label="Height/Thickness" value={specs.height} />
        </SpecGroup>
        
        {/* Technical */}
        <SpecGroup title="Technical Details">
          <SpecRow label="Weight" value={specs.weight} />
          <SpecRow label="Origin" value={specs.origin} />
          <SpecRow label="Certification" value={specs.certification} />
        </SpecGroup>
      </div>
    </section>
  );
}
```

#### 7. ProductStory.tsx (NEW)
```tsx
/**
 * Product story and craftsmanship
 * 
 * Content:
 * - Story/heritage
 * - Craftsmanship details
 * - Process images
 * - Material sourcing
 * 
 * Style:
 * - Editorial format
 * - Side-by-side image/text
 * - Elegant typography
 */

export function ProductStory({ story }: { story: ProductStory }) {
  return (
    <section className="bg-[#FAF8F5] py-16 lg:py-24">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 max-w-6xl mx-auto items-center">
          <div>
            <h2 className="font-serif text-3xl lg:text-4xl text-[#2B2B2B] mb-6">
              Craftsmanship & Heritage
            </h2>
            <div className="prose prose-lg text-[#6B6B6B]">
              <p>{story.introduction}</p>
              <p>{story.craftProcess}</p>
              <p>{story.materialSource}</p>
            </div>
          </div>
          
          <div className="aspect-[4/3] bg-white overflow-hidden">
            <img 
              src={story.image} 
              alt="Craftsmanship" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
```

#### 8. ProductCard.tsx (NEW - Minimal Version)
```tsx
/**
 * Simple, elegant product card
 * 
 * Features:
 * - Single image (no slideshow on cards)
 * - Hover: secondary image fade
 * - Minimal information
 * - Clean typography
 * 
 * Design:
 * - 4:3 aspect ratio
 * - White background
 * - Subtle hover scale
 * - No borders/shadows (clean)
 */

export function ProductCard({ product }: { product: Product }) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <Link 
      to={`/products/${product.id}`}
      className="group block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image */}
      <div className="aspect-[4/3] bg-[#FAF8F5] overflow-hidden mb-4 relative">
        <img 
          src={isHovered && product.images[1] ? product.images[1] : product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
        />
        
        {/* Quick Actions */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={(e) => { e.preventDefault(); /* handle save */ }}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#FAF8F5]"
          >
            <HeartIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* Info */}
      <div className="space-y-2">
        <h3 className="font-serif text-xl text-[#2B2B2B] group-hover:text-[#B8944A] transition-colors">
          {product.name}
        </h3>
        <p className="text-sm text-[#6B6B6B] uppercase tracking-wider">
          {product.category} · {product.material}
        </p>
        <p className="text-lg font-medium text-[#2B2B2B]">
          {product.price}
        </p>
      </div>
    </Link>
  );
}
```

---

## Supporting Components

### UI Components (New Design System)

#### Button.tsx
```tsx
/**
 * Unified button component
 * 
 * Variants:
 * - primary: Gold background
 * - secondary: Outlined
 * - text: Text link style
 * 
 * Sizes:
 * - sm, md, lg, xl
 */

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'text';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  fullWidth,
  children, 
  onClick 
}: ButtonProps) {
  const baseStyles = "font-medium tracking-wide transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variantStyles = {
    primary: "bg-[#B8944A] text-white hover:bg-[#A07D3C] focus:ring-[#B8944A]",
    secondary: "border-2 border-[#2B2B2B] text-[#2B2B2B] hover:bg-[#2B2B2B] hover:text-white",
    text: "text-[#2B2B2B] underline-offset-4 hover:underline hover:opacity-70"
  };
  
  const sizeStyles = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
    xl: "px-10 py-5 text-xl"
  };
  
  return (
    <button
      onClick={onClick}
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
      `}
    >
      {children}
    </button>
  );
}
```

#### Typography.tsx
```tsx
/**
 * Typography components
 * 
 * Components:
 * - Heading (h1-h6)
 * - Body
 * - Caption
 * - Label
 */

export function Heading({ 
  level = 1, 
  serif = true,
  children 
}: { 
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  serif?: boolean;
  children: React.ReactNode;
}) {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  
  const sizes = {
    1: "text-5xl lg:text-6xl",
    2: "text-4xl lg:text-5xl",
    3: "text-3xl lg:text-4xl",
    4: "text-2xl lg:text-3xl",
    5: "text-xl lg:text-2xl",
    6: "text-lg lg:text-xl"
  };
  
  return (
    <Tag className={`
      ${serif ? 'font-serif' : 'font-sans'}
      ${sizes[level]}
      text-[#2B2B2B]
      leading-tight
      tracking-tight
    `}>
      {children}
    </Tag>
  );
}

export function Body({ 
  size = 'md',
  color = 'primary',
  children 
}: {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary';
  children: React.ReactNode;
}) {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };
  
  const colorClasses = {
    primary: 'text-[#2B2B2B]',
    secondary: 'text-[#6B6B6B]'
  };
  
  return (
    <p className={`${sizeClasses[size]} ${colorClasses[color]} leading-relaxed`}>
      {children}
    </p>
  );
}
```

#### Container.tsx
```tsx
/**
 * Consistent container component
 */

export function Container({ 
  maxWidth = 'default',
  padding = true,
  children 
}: {
  maxWidth?: 'narrow' | 'default' | 'wide' | 'full';
  padding?: boolean;
  children: React.ReactNode;
}) {
  const maxWidthClasses = {
    narrow: 'max-w-4xl',
    default: 'max-w-6xl',
    wide: 'max-w-7xl',
    full: 'max-w-full'
  };
  
  return (
    <div className={`
      ${maxWidthClasses[maxWidth]}
      ${padding ? 'px-6' : ''}
      mx-auto
    `}>
      {children}
    </div>
  );
}
```

---

## Layout & Filters

### Products Grid Layout
```tsx
/**
 * Product listing with filters
 * 
 * Layout:
 * - Sidebar filters (desktop)
 * - Drawer filters (mobile)
 * - 3-column grid
 * - Sort options
 */

export function ProductsGrid() {
  return (
    <div className="bg-white min-h-screen">
      <Container maxWidth="wide" padding={false}>
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <FilterSidebar />
          </aside>
          
          {/* Products */}
          <div className="flex-1 px-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <h1 className="font-serif text-3xl text-[#2B2B2B]">
                Products
              </h1>
              <div className="flex items-center gap-4">
                <SortDropdown />
                <button className="lg:hidden">
                  <FilterIcon />
                </button>
              </div>
            </div>
            
            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
```

---

## Migration Plan

### Phase 1: Create New Components
1. Build new design system components (Button, Typography, Container)
2. Create new ProductCard (simple version)
3. Build ProductGallery
4. Create ProductInfo panel

### Phase 2: New Product Detail Page
1. Create new ProductDetails.tsx structure
2. Build all sub-components (Hero, Overview, Specs, Story)
3. Integrate with existing data layer
4. Test thoroughly

### Phase 3: Product Listing
1. Create new ProductsGrid layout
2. Build FilterSidebar and FilterDrawer
3. Implement sort functionality
4. Test responsive behavior

### Phase 4: Deprecate Old Components
1. Move old components to `/legacy` folder
2. Update routing to new pages
3. A/B test if desired
4. Remove legacy code after validation

---

## File Structure (New)

```
frontend/src/
├── pages/
│   ├── ProductDetails.tsx (NEW - ~300 lines, much simpler)
│   └── Products.tsx (NEW - ~200 lines)
│
├── components/
│   ├── product/ (NEW)
│   │   ├── ProductHero.tsx
│   │   ├── ProductGallery.tsx
│   │   ├── ProductInfo.tsx
│   │   ├── ProductOverview.tsx
│   │   ├── ProductSpecifications.tsx
│   │   ├── ProductStory.tsx
│   │   ├── ProductReviews.tsx (refactor existing)
│   │   └── RelatedProducts.tsx
│   │
│   ├── cards/ (NEW)
│   │   ├── ProductCard.tsx (~150 lines)
│   │   └── ProductCardSkeleton.tsx
│   │
│   ├── filters/ (NEW)
│   │   ├── FilterSidebar.tsx
│   │   ├── FilterDrawer.tsx
│   │   ├── FilterGroup.tsx
│   │   └── SortDropdown.tsx
│   │
│   ├── ui/ (NEW - Design System)
│   │   ├── Button.tsx
│   │   ├── Typography.tsx
│   │   ├── Container.tsx
│   │   ├── Spacer.tsx
│   │   ├── Divider.tsx
│   │   └── Modal.tsx
│   │
│   └── legacy/ (Move old components here)
│       ├── ProductDetails.old.tsx
│       ├── ProductCard.old.tsx
│       └── ProductsModernVariant.old.tsx
```

---

## Key Simplifications

### Code Reduction
- **Old ProductDetails**: 1239 lines → **New**: ~300 lines (75% reduction)
- **Old ProductCard**: 555 lines → **New**: ~150 lines (73% reduction)
- **Old ProductsModernVariant**: 796 lines → **New**: ~200 lines (75% reduction)

### Complexity Reduction
1. **No more tabs** - Single scroll experience
2. **No auto-play/slideshow on cards** - Static with hover
3. **No complex scroll observers** - Simple intersection observers
4. **No programmatic scroll** - User-controlled only
5. **Simplified animations** - Subtle, performant transitions

### Visual Simplification
1. **Single color palette** - No rainbow of accent colors
2. **Consistent spacing** - Clear spacing scale
3. **Better typography** - Serif/sans-serif hierarchy
4. **More whitespace** - Breathing room
5. **Focus on product** - Remove distractions

---

**Ready to begin implementation when approved!**
