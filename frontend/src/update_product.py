import sys

with open('d:/hs-global-main/frontend/src/pages/ProductDetails.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

start_idx = -1
end_idx = -1

for i, line in enumerate(lines):
    if '{/* Main Content */}' in line:
        start_idx = i
        break

for i in range(len(lines)-1, -1, -1):
    if 'export default ProductDetails;' in lines[i]:
        end_idx = i - 1
        break

if start_idx == -1 or end_idx == -1:
    print("Could not find boundaries")
    sys.exit(1)

new_content = """      {/* Main Content using new modular approach */}
      <main className="min-h-screen bg-white pb-20">
        {/* Breadcrumbs - Minimal */}
        <div className="container mx-auto px-6 py-4 md:py-6 mt-20 md:mt-24 border-b border-[#E8E3DC]">
          <nav className="flex items-center gap-2 text-sm text-[#6B6B6B]">
            <Link to="/" className="hover:text-[#2B2B2B] transition-colors">Home</Link>
            <span className="text-[#E8E3DC]">/</span>
            <Link to="/products" className="hover:text-[#2B2B2B] transition-colors capitalize">{product.category}</Link>
            <span className="text-[#E8E3DC]">/</span>
            <span className="text-[#2B2B2B] font-medium truncate max-w-[200px] md:max-w-none">{product.name}</span>
          </nav>
        </div>

        {/* Hero: 60/40 split */}
        <section className="container mx-auto px-6 py-12 lg:py-20 mb-10">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-20">
            <div className="lg:col-span-7">
              <ProductGallery product={product} />
            </div>
            <div className="lg:col-span-5 lg:sticky lg:top-32 h-fit">
              <ProductInfo
                product={product}
                reviewStats={reviewStats}
                isInCart={isInCart}
                selectedFinish={selectedFinish}
                setSelectedFinish={setSelectedFinish}
                selectedThickness={selectedThickness}
                setSelectedThickness={setSelectedThickness}
                handleShare={handleShare}
                reviewsRef={reviewsRef}
              />
            </div>
          </div>
        </section>

        {/* Overview Container */}
        <section className="bg-[#FAF8F5] py-20 lg:py-32">
          <div className="container mx-auto px-6">
            <ProductOverview product={product} />
          </div>
        </section>

        {/* Specs & Story Split */}
        <section className="py-20 lg:py-32">
          <div className="container mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
              <ProductSpecifications
                product={product}
                selectedFinish={selectedFinish}
                selectedThickness={selectedThickness}
              />
              <ProductStory product={product} />
            </div>
          </div>
        </section>

        {/* Reviews */}
        <section className="bg-[#FAF8F5] py-20 lg:py-32">
          <div className="container mx-auto px-6">
            <ProductReviews
              product={product}
              reviewStats={reviewStats}
              reviews={reviews}
              reviewsLoading={reviewsLoading}
              onReviewSubmitted={handleReviewSubmitted}
              reviewsRef={reviewsRef}
            />
          </div>
        </section>

        {/* Related Products */}
        {product.relatedProducts && product.relatedProducts.length > 0 && (
          <section className="py-20 lg:py-32">
            <div className="container mx-auto px-6">
              <RelatedProducts
                relatedProducts={product.relatedProducts}
                scrollRelated={scrollRelated}
                relatedRef={relatedRef}
              />
            </div>
          </section>
        )}

        {/* Contact Strip */}
        <section className="border-t border-[#E8E3DC]">
          <ContactUs />
        </section>
      </main>
    </div>
"""

new_lines = lines[:start_idx] + [new_content + '\n'] + lines[end_idx:]

with open('d:/hs-global-main/frontend/src/pages/ProductDetails.tsx', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print(f"Successfully updated ProductDetails from {start_idx} to {end_idx}")
