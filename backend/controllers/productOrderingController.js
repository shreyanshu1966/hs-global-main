const ProductOrdering = require('../models/ProductOrdering');
const Product = require('../models/Product');

/**
 * Normalise scope params — treat empty string the same as null
 */
const parseScope = (query) => ({
  category:    query.category    || null,
  subcategory: query.subcategory || null,
});

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

    const [ordering, products] = await Promise.all([
      ProductOrdering.findOne({ category, subcategory }),
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
    const { productIds = [] } = req.body;
    const { category, subcategory } = parseScope(req.body);

    const ordering = await ProductOrdering.findOneAndUpdate(
      { category, subcategory },
      { category, subcategory, productIds },
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
    await ProductOrdering.deleteOne({ category, subcategory });
    res.json({ success: true, message: 'Ordering reset' });
  } catch (err) {
    console.error('resetOrdering error:', err);
    res.status(500).json({ success: false, message: 'Failed to reset ordering' });
  }
};

module.exports = { getOrdering, saveOrdering, resetOrdering };
