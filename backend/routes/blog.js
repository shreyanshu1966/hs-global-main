const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

const publicCache = (req, res, next) => {
    res.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=60');
    next();
};

// Public routes
router.get('/', publicCache, blogController.getAllBlogs);
router.get('/featured', publicCache, blogController.getFeaturedBlogs);
router.get('/categories', publicCache, blogController.getCategories);
router.get('/tags', publicCache, blogController.getTags);
router.get('/:slug', publicCache, blogController.getBlogBySlug);

// Admin routes
router.get('/admin/all', authMiddleware, adminMiddleware, blogController.getAllBlogsAdmin);
router.get('/admin/stats', authMiddleware, adminMiddleware, blogController.getBlogStats);
router.get('/admin/:id', authMiddleware, adminMiddleware, blogController.getBlogById);
router.post('/admin', authMiddleware, adminMiddleware, blogController.createBlog);
router.put('/admin/:id', authMiddleware, adminMiddleware, blogController.updateBlog);
router.delete('/admin/:id', authMiddleware, adminMiddleware, blogController.deleteBlog);

module.exports = router;
