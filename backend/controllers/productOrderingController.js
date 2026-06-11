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
        productIds:      ordering ? (ordering.productIds      || []) : [],
        categoryOrder:   ordering ? (ordering.categoryOrder   || []) : [],
        subcategoryOrder: ordering ? (ordering.subcategoryOrder || []) : [],
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
 *
 * Scope rules:
 *   Global       (category=null, subcategory=null)  → save categoryOrder; productIds cleared
 *   Category-All (category=X,    subcategory=null)  → save subcategoryOrder; productIds cleared
 *   Cat+Subcat   (category=X,    subcategory=X)     → save productIds (unchanged)
 *   Cross-Cat    (category=null, subcategory=X)     → save productIds + categoryOrder (unchanged)
 */
const saveOrdering = async (req, res) => {
  try {
    const { category, subcategory } = parseScope(req.body);

    const clean = (arr) =>
      (Array.isArray(arr) ? arr : []).filter(v => typeof v === 'string' && v.trim().length > 0);

    const isGlobalScope      = category === null && subcategory === null;
    const isCategoryOnly     = category !== null && subcategory === null;
    const isCrossCategory    = category === null && subcategory !== null;
    // category+subcategory is the remaining case

    let productIds;
    let categoryOrder;
    let subcategoryOrder;

    if (isGlobalScope) {
      productIds      = [];
      categoryOrder   = clean(req.body.categoryOrder);
      subcategoryOrder = [];
    } else if (isCategoryOnly) {
      productIds      = [];
      categoryOrder   = [];
      subcategoryOrder = clean(req.body.subcategoryOrder);
    } else if (isCrossCategory) {
      productIds      = clean(req.body.productIds);
      categoryOrder   = clean(req.body.categoryOrder);
      subcategoryOrder = [];
    } else {
      // category + subcategory exact scope
      productIds      = clean(req.body.productIds);
      categoryOrder   = [];
      subcategoryOrder = [];
    }

    const ordering = await ProductOrdering.findOneAndUpdate(
      { category, subcategory },
      { category, subcategory, productIds, categoryOrder, subcategoryOrder },
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
