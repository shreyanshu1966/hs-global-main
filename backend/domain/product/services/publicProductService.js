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

// Normalise a subcategory string to a comparable slug: lowercase, hyphens.
const toSlug = (s) => (s ? String(s).toLowerCase().trim().replace(/[\s_]+/g, '-') : '');

/**
 * Build a flat ordered ID list for a category-all view.
 *
 * Layout:
 *   subcat1_ordered_ids… subcat1_unordered_ids…
 *   subcat2_ordered_ids… subcat2_unordered_ids…
 *   …remaining subcategories alphabetically…
 *
 * Subcategory sequence comes from the category-level ProductOrdering.subcategoryOrder.
 * Product sequence within each subcategory comes from the {category, subcategory} ProductOrdering.productIds.
 */
const buildSubcategoryGroupedIds = async (category) => {
    // Load category-level doc to get the desired subcategory sequence
    const catDoc = await ProductOrdering.findOne({ category, subcategory: null });
    const subcategoryOrder = catDoc ? (catDoc.subcategoryOrder || []) : [];

    // All actual subcategories in this category (from live product data)
    const rawSubcategories = await repository.distinctSubcategoriesByCategory(category);
    const validSubcats = rawSubcategories.filter(s => s && typeof s === 'string' && s.trim().length > 0);

    // Map slug → actual DB string for matching
    const slugToActual = new Map();
    validSubcats.forEach(sub => {
        const key = toSlug(sub);
        if (!slugToActual.has(key)) slugToActual.set(key, sub);
    });

    // Ordered subcategories first (those with a saved position), then the rest alphabetically
    const usedSlugs = new Set();
    const ordered = [];
    for (const slug of subcategoryOrder) {
        const key = toSlug(slug);
        if (slugToActual.has(key) && !usedSlugs.has(key)) {
            ordered.push(slugToActual.get(key));
            usedSlugs.add(key);
        }
    }
    const remaining = validSubcats
        .filter(s => !usedSlugs.has(toSlug(s)))
        .sort((a, b) => a.localeCompare(b));

    const allOrderedSubcats = [...ordered, ...remaining];

    const flat = [];
    const seenIds = new Set();

    for (const sub of allOrderedSubcats) {
        const subcategoryFilter = buildSubcategoryFilter(sub);
        if (!subcategoryFilter) continue;

        // Per-subcategory ordering (exact scope — no cascading)
        const orderDoc = await ProductOrdering.findOne({
            category,
            subcategory: subcategoryOrderingQuery(sub)
        });
        const orderedIds = cleanIds(orderDoc);

        // All product IDs in this category+subcategory
        const allIds = await repository.findProductIdsByScope({ category, subcategoryFilter });

        const orderedSet = new Set(orderedIds);
        const unordered = allIds.filter(id => !orderedSet.has(id));

        for (const id of [...orderedIds, ...unordered]) {
            if (!seenIds.has(id)) { flat.push(id); seenIds.add(id); }
        }
    }

    return flat;
};

/**
 * Build a flat ordered ID list for the global all-products view.
 *
 * Layout:
 *   cat1 → subcategory-grouped (via buildSubcategoryGroupedIds)
 *   cat2 → subcategory-grouped
 *   …
 *
 * Category sequence comes from the global ProductOrdering.categoryOrder.
 */
const buildGlobalGroupedIds = async () => {
    const globalDoc = await ProductOrdering.findOne({ category: null, subcategory: null });
    const categoryOrder = globalDoc ? (globalDoc.categoryOrder || []) : [];

    // All actual categories from live product data
    const categoriesResult = await repository.aggregatePublicCategories();
    const allCategories = categoriesResult.map(c => c.category).filter(Boolean);

    // Ordered categories first, then the rest alphabetically
    const orderedCats = [...new Set(categoryOrder.filter(c => allCategories.includes(c)))];
    const remainingCats = allCategories
        .filter(c => !orderedCats.includes(c))
        .sort((a, b) => a.localeCompare(b));
    const allOrderedCats = [...orderedCats, ...remainingCats];

    const flat = [];
    const seenIds = new Set();

    for (const cat of allOrderedCats) {
        const catIds = await buildSubcategoryGroupedIds(cat);
        for (const id of catIds) {
            if (!seenIds.has(id)) { flat.push(id); seenIds.add(id); }
        }
    }

    return flat;
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

/**
 * Resolve custom ordering for an exact category+subcategory scope only.
 * Does NOT cascade — callers that need grouped views use the build* functions above.
 * Also handles the cross-category subcategory scope (category=null, subcategory=X).
 */
const resolveOrderedIds = async (category, subcategory) => {
    // Exact scope (category + subcategory)
    if (category !== null && subcategory !== null) {
        const o = await ProductOrdering.findOne({
            category,
            subcategory: subcategoryOrderingQuery(subcategory)
        });
        const ids = cleanIds(o);
        if (ids.length > 0) return ids;
    }
    // Cross-category subcategory scope (category=null, subcategory=X)
    if (category === null && subcategory !== null) {
        const o = await ProductOrdering.findOne({
            category: null,
            subcategory: subcategoryOrderingQuery(subcategory)
        });
        const ids = cleanIds(o);
        if (ids.length > 0) return ids;
    }
    return [];
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
        filters.priceINR = { ...filters.priceINR, $gte: minPrice };
    }

    if (maxPrice !== undefined) {
        filters.priceINR = { ...filters.priceINR, $lte: maxPrice };
    }

    const skip = (page - 1) * limit;
    const total = await repository.countProducts(filters);

    let products;
    if (sortBy === 'relevance') {
        const scopeCategory    = query.category    || null;
        const scopeSubcategory = query.subcategory || null;

        let orderedIds;

        if (scopeCategory === null && scopeSubcategory === null) {
            // Global all-products view: category-grouped → subcategory-grouped
            orderedIds = await buildGlobalGroupedIds();
        } else if (scopeCategory === null && scopeSubcategory !== null) {
            // Cross-category subcategory view
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
            if (!orderedIds) {
                orderedIds = await resolveOrderedIds(null, scopeSubcategory);
            }
        }

        if (!orderedIds) orderedIds = [];

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
        filters.priceINR = { ...filters.priceINR, $gte: minPrice };
    }

    if (maxPrice !== undefined) {
        filters.priceINR = { ...filters.priceINR, $lte: maxPrice };
    }

    const skip = (page - 1) * limit;
    const [total, subcategories] = await Promise.all([
        repository.countProducts(filters),
        repository.distinctSubcategoriesByCategory(category)
    ]);

    let products;
    if (sortBy === 'relevance') {
        const scopeSubcategory = query.subcategory || null;

        let orderedIds;
        if (!scopeSubcategory) {
            // Category-all view: subcategory-grouped ordering
            orderedIds = await buildSubcategoryGroupedIds(category);
        } else {
            // Category+subcategory view: exact per-subcategory ordering
            orderedIds = await resolveOrderedIds(category, scopeSubcategory);
        }

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
