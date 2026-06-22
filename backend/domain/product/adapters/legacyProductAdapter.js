const toLegacyProduct = (dto) => ({
    _id: dto.id,
    productId: dto.productId,
    name: dto.name,
    category: dto.taxonomy.category,
    subcategory: dto.taxonomy.subcategory,
    description: dto.description,
    subDescription: dto.subDescription || '',
    productCode: dto.productCode || '',
    image: dto.media.primaryImage || '',
    images: dto.media.galleryImages,
    sortedImages: dto.media.sortedImages,
    priceUSD: dto.pricing.basePriceUSD || undefined,
    pricePerSqFt: dto.pricing.pricePerSqFt || undefined,
    available: dto.availability.available,
    discount: dto.pricing.discount,
    hasVideo: dto.media.video.hasVideo,
    videoUrl: dto.media.video.url,
    videoFilename: dto.media.video.filename,
    videoSize: dto.media.video.size,
    videoUploadedAt: dto.media.video.uploadedAt,
    furnitureSpecs: dto.specs.furniture,
    slabSpecs: dto.specs.slab,
    stoneSpecs: dto.specs.stone,
    customSpecs: dto.specs.custom,
    productSpecifications: dto.specs.productSpecifications,
    status: dto.status,
    featured: dto.featured,
    tags: dto.taxonomy.tags,
    viewCount: dto.analytics.viewCount,
    addToCartCount: dto.analytics.addToCartCount,
    averageRating: dto.analytics.averageRating,
    totalReviews: dto.analytics.totalReviews,
    seoTitle: dto.seo.seoTitle,
    seoDescription: dto.seo.seoDescription,
    seoKeywords: dto.seo.seoKeywords,
    seo: dto.seo.enhanced,
    regionalPricing: dto.regionalPricing || null,
    // ── Variant / configurable product fields ──────────────────────
    productType: dto.productType || 'simple',
    variantAttributes: dto.variantAttributes || [],
    variants: dto.variants || [],
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt
});

const toLegacyListResponse = ({ items, pagination }) => ({
    success: true,
    data: items.map(toLegacyProduct),
    pagination
});

const toLegacySingleResponse = ({ item, relatedItems, similarItems = [] }) => ({
    success: true,
    data: {
        product: toLegacyProduct(item),
        relatedProducts: relatedItems.map(toLegacyProduct),
        similarProducts: similarItems.map(toLegacyProduct)
    }
});

const toLegacyCategoryResponse = ({ items, subcategories, category, pagination }) => ({
    success: true,
    data: {
        products: items.map(toLegacyProduct),
        subcategories,
        category
    },
    pagination
});

const toLegacyFeaturedResponse = ({ items }) => ({
    success: true,
    data: items.map(toLegacyProduct)
});

const toV2ListResponse = ({ items, pagination }) => ({
    success: true,
    data: items,
    pagination,
    schemaVersion: 'v2'
});

const toV2SingleResponse = ({ item, relatedItems, similarItems = [] }) => ({
    success: true,
    data: {
        product: item,
        relatedProducts: relatedItems,
        similarProducts: similarItems
    },
    schemaVersion: 'v2'
});

const toV2CategoryResponse = ({ items, subcategories, category, pagination }) => ({
    success: true,
    data: {
        products: items,
        subcategories,
        category
    },
    pagination,
    schemaVersion: 'v2'
});

const toV2FeaturedResponse = ({ items }) => ({
    success: true,
    data: items,
    schemaVersion: 'v2'
});

module.exports = {
    toLegacyProduct,
    toLegacyListResponse,
    toLegacySingleResponse,
    toLegacyCategoryResponse,
    toLegacyFeaturedResponse,
    toV2ListResponse,
    toV2SingleResponse,
    toV2CategoryResponse,
    toV2FeaturedResponse
};
