const repository = require('../repository/productRepository');
const { buildSubcategoryFilter } = require('../utils/subcategoryFilter');
const { toProductDto } = require('../dto/productDto');
const Category = require('../../../models/Category');

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
    const sortBy = query.sortBy || 'createdAt';
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

    const minPrice = parsePrice(query.minPrice);
    const maxPrice = parsePrice(query.maxPrice);

    if (minPrice !== undefined) {
        filters.priceINR = { ...filters.priceINR, $gte: minPrice };
    }

    if (maxPrice !== undefined) {
        filters.priceINR = { ...filters.priceINR, $lte: maxPrice };
    }

    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    const skip = (page - 1) * limit;

    const products = await repository.findProducts({
        filters,
        sort,
        skip,
        limit,
        searchTerm: query.search ? query.search.trim() : undefined
    });

    const total = await repository.countProducts(filters);
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

    const relatedProducts = await repository.findRelatedProducts({
        product,
        limit: 10
    });

    return {
        item: toProductDto(product),
        relatedItems: relatedProducts.map(toProductDto)
    };
};

const getProductsByCategory = async (category, query) => {
    const page = parsePositiveInt(query.page, 1);
    const limit = parsePositiveInt(query.limit, 20);
    const sortBy = query.sortBy || 'featured';
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

    const sort = {};
    if (sortBy === 'featured') {
        sort.featured = -1;
        sort.createdAt = -1;
    } else {
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    }

    const skip = (page - 1) * limit;
    const products = await repository.findByCategory({ filters, sort, skip, limit });
    const total = await repository.countProducts(filters);
    const subcategories = await repository.distinctSubcategoriesByCategory(category);

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
