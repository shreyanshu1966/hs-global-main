# Category & Navigation Strategy

## Category Structure

### Current Categories
```
FURNITURE
├── Tables
│   ├── Coffee Tables
│   ├── Dining Tables
│   ├── Side Tables
│   └── Console Tables
├── Wash Basins (Pedestals)
├── Countertops
└── Decorative Pieces

SLABS
├── Marble
├── Granite
├── Sandstone
├── Onyx
├── Travertine
└── Other Natural Stones
```

---

## Navigation Design (Luxury Approach)

### Header Navigation (Artemest/Bernhardt Inspired)

```tsx
/**
 * Clean, minimal header
 * - Sticky on scroll
 * - Elegant typography
 * - Subtle interactions
 * - No megamenus (use dropdowns or dedicated category pages)
 */

// components/navigation/Header.tsx
export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#E8E3DC]">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20 lg:h-24">
          {/* Logo */}
          <Link to="/" className="font-serif text-2xl lg:text-3xl text-[#2B2B2B] tracking-tight">
            HS Global
          </Link>
          
          {/* Main Navigation - Desktop */}
          <nav className="hidden lg:flex items-center gap-8">
            <NavLink to="/furniture">Furniture</NavLink>
            <NavLink to="/slabs">Slabs</NavLink>
            <NavLink to="/collections">Collections</NavLink>
            <NavLink to="/about">About</NavLink>
            <NavLink to="/contact">Contact</NavLink>
          </nav>
          
          {/* Actions */}
          <div className="flex items-center gap-4">
            <button className="p-2 hover:opacity-70 transition-opacity">
              <SearchIcon className="w-5 h-5" />
            </button>
            <button className="p-2 hover:opacity-70 transition-opacity">
              <HeartIcon className="w-5 h-5" />
            </button>
            <CartIcon />
            <button className="lg:hidden p-2">
              <MenuIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

// NavLink component
function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link 
      to={to}
      className="text-[#2B2B2B] font-medium tracking-wide hover:text-[#B8944A] 
                 transition-colors relative after:absolute after:bottom-0 after:left-0 
                 after:w-0 after:h-0.5 after:bg-[#B8944A] after:transition-all 
                 hover:after:w-full"
    >
      {children}
    </Link>
  );
}
```

---

## Category Landing Pages

### 1. Furniture Category Page

```tsx
// pages/FurnitureCategory.tsx

/**
 * Luxury furniture category landing page
 * 
 * Structure:
 * - Hero section with category image
 * - Brief introduction
 * - Subcategory grid (Tables, Basins, etc.)
 * - Featured products
 * - Editorial content
 */

export default function FurnitureCategory() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative h-[60vh] lg:h-[70vh]">
        <img 
          src="/images/furniture-hero.jpg" 
          alt="Handcrafted Marble Furniture"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="font-serif text-5xl lg:text-7xl mb-4 tracking-tight">
              Furniture
            </h1>
            <p className="text-xl lg:text-2xl max-w-2xl mx-auto px-6">
              Handcrafted pieces that blend natural stone elegance with functional design
            </p>
          </div>
        </div>
      </section>
      
      {/* Introduction */}
      <section className="py-16 lg:py-24">
        <Container maxWidth="narrow">
          <Body size="lg" color="secondary" className="text-center leading-relaxed">
            Each furniture piece is meticulously crafted to order, combining traditional 
            craftsmanship with modern design sensibilities. From elegant dining tables to 
            sculptural wash basins, discover pieces that transform spaces into timeless 
            works of art.
          </Body>
        </Container>
      </section>
      
      {/* Subcategories Grid */}
      <section className="py-16 lg:py-24 bg-[#FAF8F5]">
        <Container maxWidth="wide">
          <Heading level={2} className="text-center mb-12">
            Explore Collections
          </Heading>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <SubcategoryCard
              title="Tables"
              image="/images/tables-category.jpg"
              href="/furniture/tables"
              count={45}
            />
            <SubcategoryCard
              title="Wash Basins"
              image="/images/basins-category.jpg"
              href="/furniture/wash-basins"
              count={32}
            />
            <SubcategoryCard
              title="Countertops"
              image="/images/countertops-category.jpg"
              href="/furniture/countertops"
              count={28}
            />
            <SubcategoryCard
              title="Decorative"
              image="/images/decorative-category.jpg"
              href="/furniture/decorative"
              count={19}
            />
          </div>
        </Container>
      </section>
      
      {/* Featured Products */}
      <section className="py-16 lg:py-24">
        <Container maxWidth="wide">
          <Heading level={2} className="text-center mb-12">
            Featured Pieces
          </Heading>
          <FeaturedProductsGrid category="furniture" limit={8} />
        </Container>
      </section>
      
      {/* Editorial Content */}
      <section className="py-16 lg:py-24 bg-[#FAF8F5]">
        <Container maxWidth="default">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Heading level={2} className="mb-6">
                The Art of Stone Furniture
              </Heading>
              <Body size="lg" color="secondary">
                Our furniture pieces are a testament to the timeless beauty of natural stone. 
                Each piece begins with carefully selected marble or granite slabs, chosen for 
                their unique veining and character...
              </Body>
              <Button variant="text" className="mt-6">
                Learn About Our Process →
              </Button>
            </div>
            <div className="aspect-[4/3]">
              <img 
                src="/images/craftsmanship.jpg" 
                alt="Craftsmanship"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
```

### Subcategory Card Component

```tsx
// components/category/SubcategoryCard.tsx

interface SubcategoryCardProps {
  title: string;
  image: string;
  href: string;
  count: number;
}

export function SubcategoryCard({ title, image, href, count }: SubcategoryCardProps) {
  return (
    <Link to={href} className="group block">
      <div className="aspect-[3/4] bg-[#FAF8F5] overflow-hidden mb-4">
        <img 
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 
                     group-hover:scale-105"
        />
      </div>
      <div className="text-center">
        <h3 className="font-serif text-2xl text-[#2B2B2B] mb-2 
                       group-hover:text-[#B8944A] transition-colors">
          {title}
        </h3>
        <p className="text-sm text-[#6B6B6B] uppercase tracking-wider">
          {count} Products
        </p>
      </div>
    </Link>
  );
}
```

---

### 2. Slabs Category Page

```tsx
// pages/SlabsCategory.tsx

/**
 * Slabs category landing - Different approach
 * More technical, specification-focused
 * Material swatches/samples highlighted
 */

export default function SlabsCategory() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative h-[60vh] lg:h-[70vh]">
        <img 
          src="/images/slabs-hero.jpg" 
          alt="Premium Natural Stone Slabs"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="font-serif text-5xl lg:text-7xl mb-4 tracking-tight">
              Natural Stone Slabs
            </h1>
            <p className="text-xl lg:text-2xl max-w-2xl mx-auto px-6">
              Premium materials for architectural and design excellence
            </p>
          </div>
        </div>
      </section>
      
      {/* Filter Bar Preview */}
      <section className="py-8 border-b border-[#E8E3DC]">
        <Container maxWidth="wide">
          <div className="flex flex-wrap items-center gap-4 justify-center">
            <span className="text-sm text-[#6B6B6B] uppercase tracking-wider">
              Filter by:
            </span>
            <FilterChip href="/slabs?material=marble">Marble</FilterChip>
            <FilterChip href="/slabs?material=granite">Granite</FilterChip>
            <FilterChip href="/slabs?material=sandstone">Sandstone</FilterChip>
            <FilterChip href="/slabs?material=onyx">Onyx</FilterChip>
            <FilterChip href="/slabs?material=travertine">Travertine</FilterChip>
          </div>
        </Container>
      </section>
      
      {/* Material Swatches Grid */}
      <section className="py-16 lg:py-24">
        <Container maxWidth="wide">
          <Heading level={2} className="text-center mb-12">
            Explore Materials
          </Heading>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            <MaterialCard
              material="Marble"
              description="Timeless elegance with natural veining"
              image="/images/marble-swatch.jpg"
              count={150}
              href="/slabs/marble"
            />
            <MaterialCard
              material="Granite"
              description="Durable and versatile natural stone"
              image="/images/granite-swatch.jpg"
              count={120}
              href="/slabs/granite"
            />
            <MaterialCard
              material="Onyx"
              description="Translucent beauty for dramatic spaces"
              image="/images/onyx-swatch.jpg"
              count={45}
              href="/slabs/onyx"
            />
            {/* More materials... */}
          </div>
        </Container>
      </section>
      
      {/* Applications */}
      <section className="py-16 lg:py-24 bg-[#FAF8F5]">
        <Container maxWidth="default">
          <Heading level={2} className="text-center mb-12">
            Applications
          </Heading>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ApplicationCard 
              title="Countertops"
              icon={<CountertopIcon />}
            />
            <ApplicationCard 
              title="Flooring"
              icon={<FlooringIcon />}
            />
            <ApplicationCard 
              title="Wall Cladding"
              icon={<WallIcon />}
            />
            <ApplicationCard 
              title="Facades"
              icon={<FacadeIcon />}
            />
          </div>
        </Container>
      </section>
      
      {/* Technical Resources */}
      <section className="py-16 lg:py-24">
        <Container maxWidth="narrow">
          <div className="text-center">
            <Heading level={2} className="mb-6">
              Need Specifications?
            </Heading>
            <Body size="lg" color="secondary" className="mb-8">
              Download our complete material specification sheets, care guides, 
              and installation instructions.
            </Body>
            <Button variant="primary" size="lg">
              Download Resources
            </Button>
          </div>
        </Container>
      </section>
    </div>
  );
}
```

---

## Category-Specific Product Listings

### Furniture Product Listing

```tsx
// pages/FurnitureProducts.tsx

/**
 * Furniture products listing
 * - Lifestyle images emphasized
 * - Room context important
 * - Custom dimensions highlight
 * - Lead time information
 */

export default function FurnitureProducts() {
  const { subcategory } = useParams(); // e.g., "tables"
  
  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Furniture', href: '/furniture' },
          { label: subcategory, href: `/furniture/${subcategory}` }
        ]}
      />
      
      {/* Header */}
      <section className="py-12 lg:py-16 border-b border-[#E8E3DC]">
        <Container maxWidth="wide">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <h1 className="font-serif text-4xl lg:text-5xl text-[#2B2B2B] mb-3">
                {subcategory}
              </h1>
              <p className="text-lg text-[#6B6B6B]">
                Handcrafted pieces, made to order
              </p>
            </div>
            <div className="flex items-center gap-4">
              <FilterToggle /> {/* Mobile only */}
              <SortDropdown />
              <ViewToggle /> {/* Grid/List view */}
            </div>
          </div>
        </Container>
      </section>
      
      {/* Main Content */}
      <section className="py-12">
        <Container maxWidth="wide" padding={false}>
          <div className="flex gap-8">
            {/* Sidebar Filters - Desktop */}
            <aside className="hidden lg:block w-64 px-6 flex-shrink-0">
              <FurnitureFilters />
            </aside>
            
            {/* Products Grid */}
            <div className="flex-1 px-6">
              <div className="mb-6 text-sm text-[#6B6B6B]">
                Showing {products.length} products
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
                {products.map(product => (
                  <ProductCard 
                    key={product.id} 
                    product={product}
                    variant="furniture" // Different card for furniture
                  />
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}

// Furniture-specific filters
function FurnitureFilters() {
  return (
    <div className="space-y-8">
      <FilterGroup title="Material">
        <FilterCheckbox label="Marble" count={24} />
        <FilterCheckbox label="Granite" count={18} />
        <FilterCheckbox label="Onyx" count={8} />
      </FilterGroup>
      
      <FilterGroup title="Style">
        <FilterCheckbox label="Modern" count={32} />
        <FilterCheckbox label="Classic" count={15} />
        <FilterCheckbox label="Contemporary" count={28} />
      </FilterGroup>
      
      <FilterGroup title="Size">
        <FilterCheckbox label="Small" count={12} />
        <FilterCheckbox label="Medium" count={25} />
        <FilterCheckbox label="Large" count={18} />
      </FilterGroup>
      
      <FilterGroup title="Price Range">
        <PriceRangeSlider min={0} max={100000} />
      </FilterGroup>
      
      <FilterGroup title="Availability">
        <FilterCheckbox label="In Stock" count={45} />
        <FilterCheckbox label="Made to Order" count={20} />
      </FilterGroup>
    </div>
  );
}
```

### Slabs Product Listing

```tsx
// pages/SlabsProducts.tsx

/**
 * Slabs products listing
 * - Technical specifications emphasized
 * - Finish/thickness options visible
 * - Material properties highlighted
 * - Bulk pricing information
 */

export default function SlabsProducts() {
  const { material } = useParams(); // e.g., "marble"
  
  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Slabs', href: '/slabs' },
          { label: material, href: `/slabs/${material}` }
        ]}
      />
      
      {/* Header with Material Info */}
      <section className="py-12 lg:py-16 border-b border-[#E8E3DC]">
        <Container maxWidth="wide">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="font-serif text-4xl lg:text-5xl text-[#2B2B2B] mb-4">
                {material} Slabs
              </h1>
              <p className="text-lg text-[#6B6B6B] mb-6">
                Premium {material} slabs for countertops, flooring, and architectural applications
              </p>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-2 text-[#6B6B6B]">
                  <InfoIcon className="w-4 h-4" />
                  MOQ: 20m² per order
                </span>
                <span className="flex items-center gap-2 text-[#6B6B6B]">
                  <TruckIcon className="w-4 h-4" />
                  Ships worldwide
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <FilterToggle />
              <SortDropdown />
              <ViewToggle />
            </div>
          </div>
        </Container>
      </section>
      
      {/* Main Content */}
      <section className="py-12">
        <Container maxWidth="wide" padding={false}>
          <div className="flex gap-8">
            {/* Sidebar Filters */}
            <aside className="hidden lg:block w-64 px-6 flex-shrink-0">
              <SlabsFilters material={material} />
            </aside>
            
            {/* Products Grid */}
            <div className="flex-1 px-6">
              <div className="mb-6 flex items-center justify-between">
                <span className="text-sm text-[#6B6B6B]">
                  Showing {products.length} slabs
                </span>
                <button className="text-sm text-[#2B2B2B] hover:text-[#B8944A] 
                                   flex items-center gap-2">
                  <SampleIcon className="w-4 h-4" />
                  Request Sample Kit
                </button>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
                {products.map(product => (
                  <ProductCard 
                    key={product.id} 
                    product={product}
                    variant="slab" // Different card for slabs
                  />
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}

// Slab-specific filters
function SlabsFilters({ material }: { material: string }) {
  return (
    <div className="space-y-8">
      <FilterGroup title="Finish">
        <FilterCheckbox label="Polished" count={85} />
        <FilterCheckbox label="Honed" count={62} />
        <FilterCheckbox label="Leather" count={34} />
        <FilterCheckbox label="Flamed" count={28} />
      </FilterGroup>
      
      <FilterGroup title="Thickness">
        <FilterCheckbox label="12mm" count={45} />
        <FilterCheckbox label="18mm" count={67} />
        <FilterCheckbox label="20mm" count={89} />
        <FilterCheckbox label="30mm" count={34} />
      </FilterGroup>
      
      <FilterGroup title="Color Family">
        <ColorFilter color="White" count={45} />
        <ColorFilter color="Black" count={32} />
        <ColorFilter color="Gray" count={28} />
        <ColorFilter color="Beige" count={38} />
        <ColorFilter color="Green" count={12} />
      </FilterGroup>
      
      <FilterGroup title="Origin">
        <FilterCheckbox label="India" count={125} />
        <FilterCheckbox label="Italy" count={45} />
        <FilterCheckbox label="Brazil" count={32} />
      </FilterGroup>
      
      <FilterGroup title="Application">
        <FilterCheckbox label="Indoor" count={180} />
        <FilterCheckbox label="Outdoor" count={95} />
        <FilterCheckbox label="Both" count={120} />
      </FilterGroup>
    </div>
  );
}
```

---

## Category-Specific Product Cards

### Furniture Card Variant

```tsx
// components/cards/ProductCard.tsx (Furniture variant)

export function ProductCard({ product, variant }: ProductCardProps) {
  if (variant === 'furniture') {
    return (
      <Link to={`/products/${product.id}`} className="group block">
        {/* Image - More lifestyle/room context */}
        <div className="aspect-[4/3] bg-[#FAF8F5] overflow-hidden mb-4">
          <img 
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 
                       group-hover:scale-105"
          />
          
          {/* Badge: Made to Order */}
          <div className="absolute top-4 left-4">
            <span className="bg-white/90 backdrop-blur-sm px-3 py-1 text-xs 
                           uppercase tracking-wider text-[#2B2B2B]">
              Made to Order
            </span>
          </div>
          
          {/* Save Button */}
          <button className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full 
                           flex items-center justify-center opacity-0 group-hover:opacity-100 
                           transition-opacity">
            <HeartIcon className="w-5 h-5" />
          </button>
        </div>
        
        {/* Info */}
        <div className="space-y-2">
          <h3 className="font-serif text-xl text-[#2B2B2B] group-hover:text-[#B8944A] 
                         transition-colors">
            {product.name}
          </h3>
          <p className="text-sm text-[#6B6B6B] uppercase tracking-wider">
            {product.subcategory} · {product.material}
          </p>
          <p className="text-lg font-medium text-[#2B2B2B]">
            {product.price}
          </p>
          <p className="text-xs text-[#6B6B6B]">
            Custom dimensions available
          </p>
        </div>
      </Link>
    );
  }
  
  // Slab variant below...
}
```

### Slab Card Variant

```tsx
// components/cards/ProductCard.tsx (Slab variant)

export function ProductCard({ product, variant }: ProductCardProps) {
  if (variant === 'slab') {
    return (
      <Link to={`/products/${product.id}`} className="group block">
        {/* Image - Focus on material texture */}
        <div className="aspect-square bg-[#FAF8F5] overflow-hidden mb-4">
          <img 
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 
                       group-hover:scale-105"
          />
          
          {/* Quick Specs Overlay */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent 
                         py-4 px-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-3 text-white text-xs">
              <span>{product.specs.finish}</span>
              <span>·</span>
              <span>{product.specs.thickness}</span>
              <span>·</span>
              <span>{product.specs.origin}</span>
            </div>
          </div>
          
          {/* Save Button */}
          <button className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full 
                           flex items-center justify-center opacity-0 group-hover:opacity-100 
                           transition-opacity">
            <HeartIcon className="w-5 h-5" />
          </button>
        </div>
        
        {/* Info */}
        <div className="space-y-2">
          <h3 className="font-serif text-xl text-[#2B2B2B] group-hover:text-[#B8944A] 
                         transition-colors">
            {product.name}
          </h3>
          <p className="text-sm text-[#6B6B6B] uppercase tracking-wider">
            {product.category} · {product.material}
          </p>
          <p className="text-lg font-medium text-[#2B2B2B]">
            {product.price}
          </p>
          <p className="text-xs text-[#6B6B6B]">
            MOQ: 20m²
          </p>
        </div>
      </Link>
    );
  }
}
```

---

## Mobile Navigation

### Mobile Menu (Drawer)

```tsx
// components/navigation/MobileMenu.tsx

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  return (
    <Drawer isOpen={isOpen} onClose={onClose} side="right">
      <div className="h-full flex flex-col bg-white">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#E8E3DC]">
          <span className="font-serif text-2xl text-[#2B2B2B]">Menu</span>
          <button onClick={onClose}>
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Furniture Section */}
            <div>
              <Link 
                to="/furniture"
                className="block font-serif text-2xl text-[#2B2B2B] mb-3"
                onClick={onClose}
              >
                Furniture
              </Link>
              <div className="space-y-2 pl-4">
                <MobileNavLink to="/furniture/tables" onClick={onClose}>
                  Tables
                </MobileNavLink>
                <MobileNavLink to="/furniture/wash-basins" onClick={onClose}>
                  Wash Basins
                </MobileNavLink>
                <MobileNavLink to="/furniture/countertops" onClick={onClose}>
                  Countertops
                </MobileNavLink>
              </div>
            </div>
            
            {/* Slabs Section */}
            <div>
              <Link 
                to="/slabs"
                className="block font-serif text-2xl text-[#2B2B2B] mb-3"
                onClick={onClose}
              >
                Slabs
              </Link>
              <div className="space-y-2 pl-4">
                <MobileNavLink to="/slabs/marble" onClick={onClose}>
                  Marble
                </MobileNavLink>
                <MobileNavLink to="/slabs/granite" onClick={onClose}>
                  Granite
                </MobileNavLink>
                <MobileNavLink to="/slabs/onyx" onClick={onClose}>
                  Onyx
                </MobileNavLink>
              </div>
            </div>
            
            {/* Other Links */}
            <div className="space-y-3 pt-6 border-t border-[#E8E3DC]">
              <MobileNavLink to="/collections" onClick={onClose}>
                Collections
              </MobileNavLink>
              <MobileNavLink to="/about" onClick={onClose}>
                About
              </MobileNavLink>
              <MobileNavLink to="/contact" onClick={onClose}>
                Contact
              </MobileNavLink>
            </div>
          </div>
        </nav>
        
        {/* Footer Actions */}
        <div className="p-6 border-t border-[#E8E3DC]">
          <Button variant="primary" fullWidth className="mb-3">
            Request Catalog
          </Button>
          <div className="flex items-center justify-center gap-6 text-sm text-[#6B6B6B]">
            <Link to="/account">Account</Link>
            <span>·</span>
            <Link to="/help">Help</Link>
          </div>
        </div>
      </div>
    </Drawer>
  );
}

function MobileNavLink({ to, onClick, children }: MobileNavLinkProps) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="block text-[#6B6B6B] hover:text-[#2B2B2B] transition-colors"
    >
      {children}
    </Link>
  );
}
```

---

## Breadcrumb Navigation

```tsx
// components/navigation/Breadcrumb.tsx

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="py-6 border-b border-[#E8E3DC]">
      <Container maxWidth="wide">
        <ol className="flex items-center gap-2 text-sm overflow-x-auto pb-2">
          {items.map((item, index) => (
            <li key={item.href} className="flex items-center gap-2 whitespace-nowrap">
              {index > 0 && (
                <ChevronRightIcon className="w-4 h-4 text-[#6B6B6B]" />
              )}
              {index === items.length - 1 ? (
                <span className="text-[#2B2B2B] font-medium capitalize">
                  {item.label}
                </span>
              ) : (
                <Link 
                  to={item.href}
                  className="text-[#6B6B6B] hover:text-[#2B2B2B] transition-colors capitalize"
                >
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </Container>
    </nav>
  );
}
```

---

## Search Functionality

```tsx
// components/navigation/SearchModal.tsx

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="large">
      <div className="p-6">
        {/* Search Input */}
        <div className="relative mb-8">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B6B6B]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, materials, collections..."
            className="w-full pl-12 pr-4 py-4 text-lg border-b-2 border-[#E8E3DC] 
                     focus:border-[#B8944A] focus:outline-none transition-colors"
            autoFocus
          />
        </div>
        
        {/* Results */}
        {results.length > 0 ? (
          <div className="space-y-8">
            {/* Products */}
            <div>
              <h3 className="font-serif text-xl text-[#2B2B2B] mb-4">Products</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.filter(r => r.type === 'product').map(result => (
                  <SearchResultCard key={result.id} result={result} onClick={onClose} />
                ))}
              </div>
            </div>
            
            {/* Categories */}
            <div>
              <h3 className="font-serif text-xl text-[#2B2B2B] mb-4">Categories</h3>
              <div className="flex flex-wrap gap-3">
                {results.filter(r => r.type === 'category').map(result => (
                  <Link
                    key={result.id}
                    to={result.href}
                    onClick={onClose}
                    className="px-4 py-2 border border-[#E8E3DC] hover:border-[#B8944A] 
                             hover:text-[#B8944A] transition-colors"
                  >
                    {result.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ) : query ? (
          <div className="text-center py-12 text-[#6B6B6B]">
            No results found for "{query}"
          </div>
        ) : (
          <div className="space-y-6">
            <h3 className="font-serif text-xl text-[#2B2B2B]">Popular Searches</h3>
            <div className="flex flex-wrap gap-3">
              <PopularSearchTag query="Marble tables" />
              <PopularSearchTag query="White granite" />
              <PopularSearchTag query="Onyx slabs" />
              <PopularSearchTag query="Wash basins" />
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
```

---

## Routing Structure

```tsx
// App.tsx or routes configuration

const routes = [
  // Home
  { path: '/', element: <Home /> },
  
  // Category Landing Pages
  { path: '/furniture', element: <FurnitureCategory /> },
  { path: '/slabs', element: <SlabsCategory /> },
  
  // Subcategory Listings
  { path: '/furniture/:subcategory', element: <FurnitureProducts /> },
  { path: '/slabs/:material', element: <SlabsProducts /> },
  
  // Product Details (unified)
  { path: '/products/:id', element: <ProductDetails /> },
  
  // Collections
  { path: '/collections', element: <Collections /> },
  { path: '/collections/:slug', element: <CollectionDetail /> },
  
  // Other
  { path: '/about', element: <About /> },
  { path: '/contact', element: <Contact /> },
  { path: '/cart', element: <Cart /> },
  { path: '/quotation', element: <Quotation /> },
];
```

---

## Category Context Detection

```tsx
// hooks/useCategoryContext.ts

/**
 * Hook to determine current category context
 * Useful for conditional rendering based on category
 */

export function useCategoryContext() {
  const location = useLocation();
  
  const isFurniture = location.pathname.includes('/furniture');
  const isSlabs = location.pathname.includes('/slabs');
  const isProduct = location.pathname.includes('/products');
  
  return {
    category: isFurniture ? 'furniture' : isSlabs ? 'slabs' : null,
    isFurniture,
    isSlabs,
    isProduct,
    subcategory: extractSubcategory(location.pathname),
  };
}

// Usage in components
function MyComponent() {
  const { category, isFurniture } = useCategoryContext();
  
  return (
    <div>
      {isFurniture ? (
        <FurnitureSpecificContent />
      ) : (
        <SlabsSpecificContent />
      )}
    </div>
  );
}
```

---

## Summary of Category Handling

### Key Differences

| Aspect | Furniture | Slabs |
|--------|-----------|-------|
| **Focus** | Lifestyle, Design | Technical, Material |
| **Images** | Room context | Texture close-ups |
| **Info Priority** | Style, Custom sizes | Finish, Thickness, MOQ |
| **Filters** | Material, Style, Size | Finish, Color, Origin |
| **Card Badge** | "Made to Order" | Specs overlay |
| **CTA** | "Inquire" / "Custom Quote" | "Add to Cart" / "Get Quote" |
| **Pricing** | Often custom quotes | Fixed pricing + MOQ |

### Navigation Hierarchy

```
Home
├── Furniture (Category Landing)
│   ├── Tables (Subcategory Listing)
│   │   ├── Coffee Tables (Filter)
│   │   ├── Dining Tables (Filter)
│   │   └── Console Tables (Filter)
│   ├── Wash Basins (Subcategory Listing)
│   └── Countertops (Subcategory Listing)
│
└── Slabs (Category Landing)
    ├── Marble (Material Listing)
    ├── Granite (Material Listing)
    ├── Onyx (Material Listing)
    └── Travertine (Material Listing)
```

Each level maintains the clean, sophisticated design while adapting content to category needs.
