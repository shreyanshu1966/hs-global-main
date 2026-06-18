const router = require('express').Router();
const PageSeo  = require('../models/PageSeo');
const Redirect = require('../models/Redirect');

const publicCache = (req, res, next) => {
  res.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=60');
  next();
};

/**
 * GET /api/seo/page/*path
 * Returns the PageSeo document for the given site path, e.g. /about, /products, /.
 * The path is passed as a catch-all segment so slashes are preserved.
 */
router.get('/page/*', publicCache, async (req, res) => {
  try {
    // req.params[0] contains everything after /page/
    const raw = req.params[0] || '';
    const path = '/' + raw.replace(/^\/+/, '').replace(/\/+$/, '');
    const doc = await PageSeo.findOne({ path }).lean();
    res.json({ success: true, data: doc || null });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/seo/redirects
 * Returns all 301 redirects (used by Next.js middleware to build its map).
 */
router.get('/redirects', publicCache, async (req, res) => {
  try {
    const docs = await Redirect.find({}, 'from to code -_id').lean();
    res.json({ success: true, data: docs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
