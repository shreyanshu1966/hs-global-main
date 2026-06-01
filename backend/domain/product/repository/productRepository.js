const Product = require('../../../models/Product');

/**
 * Find products using a custom ordering array.
 * Products whose productId appears in orderedIds are returned first (in that order).
 * Remaining products fall to the end sorted by createdAt desc.
 */
const findProductsOrdered = ({ filters, orderedIds, skip, limit }) => {
    return Product.aggregate([
        { $match: filters },
        {
            $addFields: {
                __ord: {
                    $let: {
                        vars: { idx: { $indexOfArray: [orderedIds, '$productId'] } },
                        in: { $cond: [{ $eq: ['$$idx', -1] }, 999999, '$$idx'] }
                    }
                }
            }
        },
        { $sort: { __ord: 1, createdAt: -1 } },
        { $skip: skip },
        { $limit: limit }
    ]);
};

const findProducts = ({ filters, sort, skip, limit, searchTerm }) => {
    if (searchTerm) {
        return Product.search(searchTerm, filters).sort(sort).skip(skip).limit(limit).exec();
    }

    return Product.find(filters).sort(sort).skip(skip).limit(limit).exec();
};

const countProducts = (filters) => Product.countDocuments(filters);

const findByProductIdActive = (productId) => Product.findOne({
    productId,
    status: 'active'
});

const findSimilarProductsByProductIds = (productIds) => Product.find({
    productId: { $in: productIds },
    status: 'active',
    available: true
});

const findRelatedProducts = ({ product, limit = 10 }) => Product.find({
    _id: { $ne: product._id },
    category: product.category,
    subcategory: product.subcategory,
    status: 'active',
    available: true
}).limit(limit);

const findRandomProducts = ({ product, limit = 10 }) => Product.aggregate([
    { $match: { _id: { $ne: product._id }, status: 'active', available: true } },
    { $sample: { size: limit } }
]);

const findByCategory = ({ filters, sort, skip, limit }) => Product.find(filters)
    .sort(sort)
    .skip(skip)
    .limit(limit);

const findFeatured = (limit = 10) => Product.getFeatured(limit);

const searchProducts = ({ query, filters, skip, limit }) => Product.search(query, filters)
    .skip(skip)
    .limit(limit);

const countSearchProducts = ({ query, filters }) => Product.countDocuments({
    status: 'active',
    available: true,
    ...filters,
    $text: { $search: query }
});

const aggregatePublicCategories = () => Product.aggregate([
    {
        $match: { status: 'active', available: true }
    },
    {
        $group: {
            _id: '$category',
            subcategories: { $addToSet: '$subcategory' },
            count: { $sum: 1 }
        }
    },
    {
        $project: {
            _id: 0,
            category: '$_id',
            subcategories: 1,
            count: 1
        }
    },
    {
        $sort: { category: 1 }
    }
]);

const distinctSubcategoriesByCategory = (category) => Product.distinct('subcategory', {
    category,
    status: 'active',
    available: true
});

const distinctTags = () => Product.distinct('tags', {
    status: 'active',
    available: true
});

const createProduct = (productData) => Product.create(productData);

const findByProductId = (productId) => Product.findOne({ productId });

const updateByProductId = (productId, updates) => Product.findOneAndUpdate(
    { productId },
    { ...updates, updatedAt: new Date() },
    { new: true, runValidators: true }
);

const softDeleteByProductId = (productId) => Product.findOneAndUpdate(
    { productId },
    { status: 'inactive' },
    { new: true }
);

module.exports = {
    findProductsOrdered,
    findProducts,
    countProducts,
    findByProductIdActive,
    findSimilarProductsByProductIds,
    findRelatedProducts,
    findRandomProducts,
    findByCategory,
    findFeatured,
    searchProducts,
    countSearchProducts,
    aggregatePublicCategories,
    distinctSubcategoriesByCategory,
    distinctTags,
    createProduct,
    findByProductId,
    updateByProductId,
    softDeleteByProductId
};
