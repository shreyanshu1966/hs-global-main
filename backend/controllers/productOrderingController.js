const ProductOrdering = require('../models/ProductOrdering');
const Product = require('../models/Product');

/**
 * Normalise scope params — treat empty string the same as null
 */
const parseScope = (query) => ({
  category:    query.category    || null,
  subcategory: query.subcategory || null,
});

// Build a case-insensitive, separator-flexible regex for subcategory ordering lookups.
const subcategoryOrderingQuery = (subcategory) => {
  if (subcategory === null) return null;
  const escaped = subcategory.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const flexible = escaped.replace(/[-_\s]+/g, '[-_\\s]*');
  return { $regex: new RegExp(`^${flexible}$`, 'i') };
};

/**
 * GET /api/admin/product-ordering
 * Returns the saved ordering for a scope plus ALL products in that scope
 * so the UI can build the ordered + unordered lists.
 */
const getOrdering = async (req, res) => {
  try {
    const { category, subcategory } = parseScope(req.query);

    // Build product filter matching the scope
    const productFilter = { status: { $ne: 'deleted' } };
    if (category)    productFilter.category    = category;
    if (subcategory) productFilter.subcategory = subcategory;

    const orderingQuery = { category, subcategory: subcategoryOrderingQuery(subcategory) };
    const [ordering, products] = await Promise.all([
      ProductOrdering.findOne(orderingQuery),
      Product.find(productFilter)
        .select('productId name images category subcategory status available')
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    res.json({
      success: true,
      data: {
        category,
        subcategory,
        productIds: ordering ? ordering.productIds : [],
        categoryOrder: ordering ? (ordering.categoryOrder || []) : [],
        products,
      },
    });
  } catch (err) {
    console.error('getOrdering error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch ordering' });
  }
};

/**
 * PUT /api/admin/product-ordering
 * Body: { category, subcategory, productIds }
 * Creates or replaces the ordering for the given scope.
 */
const saveOrdering = async (req, res) => {
  try {
    // Strip out any nulls / empty strings that can creep in when a product has no productId
    const rawIds = Array.isArray(req.body.productIds) ? req.body.productIds : [];
    const productIds = rawIds.filter(id => typeof id === 'string' && id.trim().length > 0);

    const rawCategoryOrder = Array.isArray(req.body.categoryOrder) ? req.body.categoryOrder : [];
    const categoryOrder = rawCategoryOrder.filter(c => typeof c === 'string' && c.trim().length > 0);

    const { category, subcategory } = parseScope(req.body);

    const ordering = await ProductOrdering.findOneAndUpdate(
      { category, subcategory },
      { category, subcategory, productIds, categoryOrder },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ success: true, data: ordering });
  } catch (err) {
    console.error('saveOrdering error:', err);
    res.status(500).json({ success: false, message: 'Failed to save ordering' });
  }
};

/**
 * DELETE /api/admin/product-ordering
 * Query: ?category=&subcategory=
 * Clears (removes) the custom ordering for the given scope.
 */
const resetOrdering = async (req, res) => {
  try {
    const { category, subcategory } = parseScope(req.query);
    await ProductOrdering.deleteOne({ category, subcategory: subcategoryOrderingQuery(subcategory) });
    res.json({ success: true, message: 'Ordering reset' });
  } catch (err) {
    console.error('resetOrdering error:', err);
    res.status(500).json({ success: false, message: 'Failed to reset ordering' });
  }
};

module.exports = { getOrdering, saveOrdering, resetOrdering };
