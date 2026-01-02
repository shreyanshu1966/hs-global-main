const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// Public routes
router.get('/', blogController.getAllBlogs);
router.get('/featured', blogController.getFeaturedBlogs);
router.get('/categories', blogController.getCategories);
router.get('/tags', blogController.getTags);
router.get('/:slug', blogController.getBlogBySlug);

// Admin routes
router.get('/admin/all', authMiddleware, adminMiddleware, blogController.getAllBlogsAdmin);
router.get('/admin/stats', authMiddleware, adminMiddleware, blogController.getBlogStats);
router.get('/admin/:id', authMiddleware, adminMiddleware, blogController.getBlogById);
router.post('/admin', authMiddleware, adminMiddleware, blogController.createBlog);
router.put('/admin/:id', authMiddleware, adminMiddleware, blogController.updateBlog);
router.delete('/admin/:id', authMiddleware, adminMiddleware, blogController.deleteBlog);

module.exports = router;
