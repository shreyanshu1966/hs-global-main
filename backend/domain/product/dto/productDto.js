const getDiscountStatus = (product) => {
    const discount = product.discount || {};
    const enabled = Boolean(discount.enabled);
    const percentage = Number(discount.percentage || 0);

    if (!enabled || percentage <= 0) {
        return { state: 'none', isActive: false };
    }

    const now = new Date();
    const startDate = discount.startDate ? new Date(discount.startDate) : null;
    const endDate = discount.endDate ? new Date(discount.endDate) : null;

    if (startDate && now < startDate) {
        return { state: 'scheduled', isActive: false, startDate, endDate };
    }

    if (endDate && now > endDate) {
        return { state: 'expired', isActive: false, startDate, endDate };
    }

    return { state: 'active', isActive: true, startDate, endDate };
};

const getEffectivePriceUSD = (product, discountStatus) => {
    const base = Number(product.priceUSD || 0);
    if (!base) {
        return 0;
    }

    if (!discountStatus.isActive) {
        return base;
    }

    const percentage = Number(product.discount?.percentage || 0);
    const discountAmount = Math.round((base * percentage) / 100 * 100) / 100;
    return Math.max(0, Math.round((base - discountAmount) * 100) / 100);
};

const toProductDto = (product) => {
    const discountStatus = getDiscountStatus(product);
    const basePriceUSD = Number(product.priceUSD || 0);
    const effectivePriceUSD = getEffectivePriceUSD(product, discountStatus);

    const galleryImages = Array.isArray(product.images) ? product.images.filter(Boolean) : [];
    const sortedImages = Array.isArray(product.sortedImages) ? product.sortedImages.filter(Boolean) : [];
    const primaryImage = product.image || sortedImages[0] || galleryImages[0] || null;

    return {
        id: String(product._id),
        productId: product.productId,
        slug: product?.seo?.slug || product.productId,
        name: product.name,
        description: product.description,
        subDescription: product.subDescription || '',
        productCode: product.productCode || '',
        status: product.status,
        featured: Boolean(product.featured),
        availability: {
            available: Boolean(product.available),
            inStock: Boolean(product.available)
        },
        taxonomy: {
            category: product.category,
            subcategory: product.subcategory,
            tags: Array.isArray(product.tags) ? product.tags : []
        },
        pricing: {
            currency: 'USD',
            basePriceUSD,
            effectivePriceUSD,
            pricePerSqFt: product.pricePerSqFt != null ? Number(product.pricePerSqFt) : undefined,
            discountStatus: discountStatus.state,
            discount: {
                enabled: Boolean(product.discount?.enabled),
                percentage: Number(product.discount?.percentage || 0),
                startDate: product.discount?.startDate || null,
                endDate: product.discount?.endDate || null,
                description: product.discount?.description || ''
            }
        },
        media: {
            primaryImage,
            galleryImages,
            sortedImages,
            video: {
                hasVideo: Boolean(product.hasVideo),
                url: product.videoUrl || null,
                filename: product.videoFilename || null,
                size: product.videoSize || null,
                uploadedAt: product.videoUploadedAt || null
            }
        },
        specs: {
            furniture: product.furnitureSpecs || null,
            slab: product.slabSpecs || null,
            stone: product.stoneSpecs || null,
            custom: Array.isArray(product.customSpecs) ? product.customSpecs : []
        },
        seo: {
            seoTitle: product.seoTitle || null,
            seoDescription: product.seoDescription || null,
            seoKeywords: Array.isArray(product.seoKeywords) ? product.seoKeywords : [],
            enhanced: product.seo || {}
        },
        analytics: {
            viewCount: Number(product.viewCount || 0),
            addToCartCount: Number(product.addToCartCount || 0),
            averageRating: Number(product.averageRating || 0),
            totalReviews: Number(product.totalReviews || 0)
        },
        regionalPricing: product.regionalPricing || null,
        productType: product.productType || 'simple',
        variantAttributes: Array.isArray(product.variantAttributes) ? product.variantAttributes : [],
        variants: Array.isArray(product.variants)
            ? product.variants
                .filter(v => v.available !== false)
                .map(v => ({
                    attributes: v.attributes instanceof Map
                        ? Object.fromEntries(v.attributes)
                        : (v.attributes || {}),
                    // null = use product base price; a number = variant-specific price in USD
                    priceUSD: v.priceUSD != null ? Number(v.priceUSD) : null,
                    stockQuantity: Number(v.stockQuantity || 0),
                    sku: v.sku || null,
                    images: Array.isArray(v.images) ? v.images : [],
                    available: v.available !== false,
                }))
            : [],
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
    };
};

module.exports = {
    toProductDto
};
