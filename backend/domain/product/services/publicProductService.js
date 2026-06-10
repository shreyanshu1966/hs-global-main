const repository = require('../repository/productRepository');
const { buildSubcategoryFilter } = require('../utils/subcategoryFilter');
const { toProductDto } = require('../dto/productDto');
const Category = require('../../../models/Category');
const ProductOrdering = require('../../../models/ProductOrdering');

// Build a case-insensitive, separator-flexible regex query for subcategory.
// Matches "Bathtub"/"bathtub", "Coffee Table"/"coffee-table", etc.
const subcategoryOrderingQuery = (subcategory) => {
    if (subcategory === null) return null;
    const escaped = subcategory.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const flexible = escaped.replace(/[-_\s]+/g, '[-_\\s]*');
    return { $regex: new RegExp(`^${flexible}$`, 'i') };
};

const cleanIds = (doc) =>
    doc ? doc.productIds.filter(id => typeof id === 'string' && id.length > 0) : [];

// Resolve custom ordering for a scope, cascading from most-specific to global.
// Does NOT cascade into the cross-category subcategory scope (category=null, subcategory=X)
// — that scope is handled separately by buildCategoryGroupedIds.
const resolveOrderedIds = async (category, subcategory) => {
    // 1. Exact scope (category + subcategory)
    if (category !== null && subcategory !== null) {
        const o = await ProductOrdering.findOne({
            category,
            subcategory: subcategoryOrderingQuery(subcategory)
        });
        const ids = cleanIds(o);
        if (ids.length > 0) return ids;
    }
    // 2. Category-only scope
    if (category !== null) {
        const o = await ProductOrdering.findOne({ category, subcategory: null });
        const ids = cleanIds(o);
        if (ids.length > 0) return ids;
    }
    // 3. Cross-category subcategory scope (category=null, subcategory=X)
    if (category === null && subcategory !== null) {
        const o = await ProductOrdering.findOne({
            category: null,
            subcategory: subcategoryOrderingQuery(subcategory)
        });
        const ids = cleanIds(o);
        if (ids.length > 0) return ids;
    }
    // 4. Global scope
    return cleanIds(await ProductOrdering.findOne({ category: null, subcategory: null }));
};

/**
 * For cross-category subcategory views: build a flat ordered product-ID list
 * grouped by category, respecting each category's own subcategory ordering.
 *
 * Result layout:
 *   [ cat1_ordered_ids..., cat1_unordered_ids...,
 *     cat2_ordered_ids..., cat2_unordered_ids...,
 *     ...remaining categories by date ]
 */
const buildCategoryGroupedIds = async (subcategory, categoryOrder, subcategoryFilter) => {
    if (!categoryOrder || categoryOrder.length === 0) return null;

    const flat = [];
    const seenIds = new Set();

    for (const cat of categoryOrder) {
        // Per-category product ordering (category-specific, NOT cascading further)
        const orderDoc = await ProductOrdering.findOne({
            category: cat,
            subcategory: subcategoryOrderingQuery(subcategory)
        });
        const catOrderedIds = cleanIds(orderDoc);

        // All product IDs in this category+subcategory scope
        const allCatIds = await repository.findProductIdsByScope({
            category: cat,
            subcategoryFilter
        });

        // Ordered first, then unordered (maintain stable date order for unordered)
        const catOrderedSet = new Set(catOrderedIds);
        const unordered = allCatIds.filter(id => !catOrderedSet.has(id));

        for (const id of [...catOrderedIds, ...unordered]) {
            if (!seenIds.has(id)) {
                flat.push(id);
                seenIds.add(id);
            }
        }
    }

    return flat;
};

const toPagination = ({ page, limit, total, count }) => ({
    current: page,
    total: Math.ceil(total / limit),
    count,
    totalItems: total
});

const parsePositiveInt = (value, fallback) => {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const parsePrice = (value) => {
    if (value === undefined || value === null || value === '') {
        return undefined;
    }

    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : undefined;
};

const getAllProducts = async (query) => {
    const page = parsePositiveInt(query.page, 1);
    const limit = parsePositiveInt(query.limit, 20);
    const sortBy = query.sortBy || 'relevance';
    const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';

    const filters = {
        status: 'active',
        available: true
    };

    if (query.category) {
        filters.category = query.category;
    }

    const subcategoryFilter = buildSubcategoryFilter(query.subcategory);
    if (subcategoryFilter) {
        filters.subcategory = subcategoryFilter;
    }

    if (query.featured !== undefined) {
        filters.featured = query.featured === 'true';
    }

    if (query.tag) {
        const tags = String(query.tag)
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean);

        if (tags.length > 0) {
            filters.tags = { $in: tags };
        }
    }

    const minPrice = parsePrice(query.minPrice);
    const maxPrice = parsePrice(query.maxPrice);

    if (minPrice !== undefined) {
        filters.priceUSD = { ...filters.priceUSD, $gte: minPrice };
    }

    if (maxPrice !== undefined) {
        filters.priceUSD = { ...filters.priceUSD, $lte: maxPrice };
    }

    const skip = (page - 1) * limit;
    const total = await repository.countProducts(filters);

    let products;
    if (sortBy === 'relevance') {
        const scopeCategory    = query.category    || null;
        const scopeSubcategory = query.subcategory || null;

        let orderedIds;

        // Cross-category subcategory view: category=null, subcategory set
        if (scopeCategory === null && scopeSubcategory !== null) {
            const crossDoc = await ProductOrdering.findOne({
                category: null,
                subcategory: subcategoryOrderingQuery(scopeSubcategory)
            });
            if (crossDoc && crossDoc.categoryOrder && crossDoc.categoryOrder.length > 0) {
                orderedIds = await buildCategoryGroupedIds(
                    scopeSubcategory,
                    crossDoc.categoryOrder,
                    subcategoryFilter
                );
            }
        }

        if (!orderedIds) {
            orderedIds = await resolveOrderedIds(scopeCategory, scopeSubcategory);
        }

        products = await repository.findProductsOrdered({ filters, orderedIds, skip, limit });
    } else {
        const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
        products = await repository.findProducts({
            filters,
            sort,
            skip,
            limit,
            searchTerm: query.search ? query.search.trim() : undefined
        });
    }

    const items = products.map(toProductDto);

    return {
        items,
        pagination: toPagination({ page, limit, total, count: items.length })
    };
};

const getProductById = async (productId) => {
    const product = await repository.findByProductIdActive(productId);
    if (!product) {
        return null;
    }

    await product.incrementView();

    const [relatedProducts, similarProducts] = await Promise.all([
        repository.findRandomProducts({ product, limit: 10 }),
        repository.findRelatedProducts({ product, limit: 20 })
    ]);

    return {
        item: toProductDto(product),
        relatedItems: relatedProducts.map(toProductDto),
        similarItems: similarProducts.map(toProductDto)
    };
};

const getProductsByCategory = async (category, query) => {
    const page = parsePositiveInt(query.page, 1);
    const limit = parsePositiveInt(query.limit, 20);
    const sortBy = query.sortBy || 'relevance';
    const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';

    const filters = {
        category,
        status: 'active',
        available: true
    };

    const subcategoryFilter = buildSubcategoryFilter(query.subcategory);
    if (subcategoryFilter) {
        filters.subcategory = subcategoryFilter;
    }

    const minPrice = parsePrice(query.minPrice);
    const maxPrice = parsePrice(query.maxPrice);

    if (minPrice !== undefined) {
        filters.priceUSD = { ...filters.priceUSD, $gte: minPrice };
    }

    if (maxPrice !== undefined) {
        filters.priceUSD = { ...filters.priceUSD, $lte: maxPrice };
    }

    const skip = (page - 1) * limit;
    const [total, subcategories] = await Promise.all([
        repository.countProducts(filters),
        repository.distinctSubcategoriesByCategory(category)
    ]);

    let products;
    if (sortBy === 'relevance') {
        const scopeSubcategory = query.subcategory || null;
        const orderedIds = await resolveOrderedIds(category, scopeSubcategory);
        products = await repository.findProductsOrdered({ filters, orderedIds, skip, limit });
    } else {
        const sort = {};
        if (sortBy === 'featured') {
            sort.featured = -1;
            sort.createdAt = -1;
        } else {
            sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
        }
        products = await repository.findByCategory({ filters, sort, skip, limit });
    }

    const items = products.map(toProductDto);

    return {
        category,
        subcategories,
        items,
        pagination: toPagination({ page, limit, total, count: items.length })
    };
};

const getFeaturedProducts = async (limitParam) => {
    const limit = parsePositiveInt(limitParam, 10);
    const products = await repository.findFeatured(limit);

    return {
        items: products.map(toProductDto)
    };
};

const searchProducts = async (queryParams) => {
    const q = typeof queryParams.q === 'string' ? queryParams.q.trim() : '';
    if (!q) {
        const error = new Error('Search query is required');
        error.code = 'VALIDATION_ERROR';
        throw error;
    }

    const page = parsePositiveInt(queryParams.page, 1);
    const limit = parsePositiveInt(queryParams.limit, 20);
    const filters = {};

    if (queryParams.category) {
        filters.category = queryParams.category;
    }

    const skip = (page - 1) * limit;

    const products = await repository.searchProducts({
        query: q,
        filters,
        skip,
        limit
    });

    const total = await repository.countSearchProducts({
        query: q,
        filters
    });

    const items = products.map(toProductDto);

    return {
        searchTerm: q,
        items,
        pagination: toPagination({ page, limit, total, count: items.length })
    };
};

const getPublicCategories = async () => {
    const baseCategories = await repository.aggregatePublicCategories();
    const customCategories = await Category.getAllCategoriesWithCustom();

    const categoryMap = new Map();

    baseCategories.forEach((category) => {
        const categoryId = String(category.category || '').trim();
        if (!categoryId) {
            return;
        }

        const subcategorySet = new Set(
            (category.subcategories || [])
                .map((sub) => String(sub || '').trim())
                .filter(Boolean)
        );

        categoryMap.set(categoryId, {
            category: categoryId,
            subcategories: Array.from(subcategorySet),
            count: Number(category.count) || 0
        });
    });

    Object.entries(customCategories || {}).forEach(([categoryIdRaw, customSubcategories]) => {
        const categoryId = String(categoryIdRaw || '').trim();
        if (!categoryId) {
            return;
        }

        const existing = categoryMap.get(categoryId) || {
            category: categoryId,
            subcategories: [],
            count: 0
        };

        const subcategorySet = new Set(
            (existing.subcategories || [])
                .map((sub) => String(sub || '').trim())
                .filter(Boolean)
        );

        (customSubcategories || []).forEach((customSub) => {
            const name = String(customSub?.name || '').trim();
            if (name) {
                subcategorySet.add(name);
            }
        });

        existing.subcategories = Array.from(subcategorySet).sort((a, b) => a.localeCompare(b));
        categoryMap.set(categoryId, existing);
    });

    const categories = Array.from(categoryMap.values())
        .map((category) => ({
            ...category,
            subcategories: (category.subcategories || []).sort((a, b) => a.localeCompare(b))
        }))
        .sort((a, b) => a.category.localeCompare(b.category));

    const tags = await repository.distinctTags();
    const normalizedTags = tags
        .map((tag) => String(tag || '').trim())
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b));

    return {
        categories,
        facets: {
            categories,
            tags: normalizedTags
        }
    };
};

module.exports = {
    getAllProducts,
    getProductById,
    getProductsByCategory,
    getFeaturedProducts,
    searchProducts,
    getPublicCategories
};
