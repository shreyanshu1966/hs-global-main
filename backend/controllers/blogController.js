const Blog = require('../models/Blog');

// Get all published blogs with pagination and filters
exports.getAllBlogs = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 9,
            category,
            tag,
            search,
            sort = '-publishedAt'
        } = req.query;

        const query = { status: 'published' };

        // Filter by category
        if (category) {
            query.category = category;
        }

        // Filter by tag
        if (tag) {
            query.tags = tag;
        }

        // Search in title, excerpt, and content
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { excerpt: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;

        const blogs = await Blog.find(query)
            .sort(sort)
            .limit(parseInt(limit))
            .skip(skip)
            .select('-content'); // Exclude full content for list view

        const total = await Blog.countDocuments(query);

        res.json({
            blogs,
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalBlogs: total
        });
    } catch (error) {
        console.error('Error fetching blogs:', error);
        res.status(500).json({ message: 'Error fetching blogs', error: error.message });
    }
};

// Get single blog by slug
exports.getBlogBySlug = async (req, res) => {
    try {
        const { slug } = req.params;

        const blog = await Blog.findOne({ slug, status: 'published' });

        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        // Increment view count
        blog.views += 1;
        await blog.save();

        // Get related blogs (same category, exclude current)
        const relatedBlogs = await Blog.find({
            category: blog.category,
            status: 'published',
            _id: { $ne: blog._id }
        })
            .limit(3)
            .select('-content');

        res.json({ blog, relatedBlogs });
    } catch (error) {
        console.error('Error fetching blog:', error);
        res.status(500).json({ message: 'Error fetching blog', error: error.message });
    }
};

// Get featured/latest blogs
exports.getFeaturedBlogs = async (req, res) => {
    try {
        const { limit = 3 } = req.query;

        const blogs = await Blog.find({ status: 'published' })
            .sort('-publishedAt')
            .limit(parseInt(limit))
            .select('-content');

        res.json({ blogs });
    } catch (error) {
        console.error('Error fetching featured blogs:', error);
        res.status(500).json({ message: 'Error fetching featured blogs', error: error.message });
    }
};

// Get all categories with blog counts
exports.getCategories = async (req, res) => {
    try {
        const categories = await Blog.aggregate([
            { $match: { status: 'published' } },
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        res.json({ categories });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Error fetching categories', error: error.message });
    }
};

// Get all tags with blog counts
exports.getTags = async (req, res) => {
    try {
        const tags = await Blog.aggregate([
            { $match: { status: 'published' } },
            { $unwind: '$tags' },
            { $group: { _id: '$tags', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 20 }
        ]);

        res.json({ tags });
    } catch (error) {
        console.error('Error fetching tags:', error);
        res.status(500).json({ message: 'Error fetching tags', error: error.message });
    }
};

// ============ ADMIN ROUTES ============

// Get all blogs (including drafts) - Admin only
exports.getAllBlogsAdmin = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, category } = req.query;

        const query = {};
        if (status) query.status = status;
        if (category) query.category = category;

        const skip = (page - 1) * limit;

        const blogs = await Blog.find(query)
            .sort('-createdAt')
            .limit(parseInt(limit))
            .skip(skip);

        const total = await Blog.countDocuments(query);

        res.json({
            blogs,
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalBlogs: total
        });
    } catch (error) {
        console.error('Error fetching blogs (admin):', error);
        res.status(500).json({ message: 'Error fetching blogs', error: error.message });
    }
};

// Get single blog by ID - Admin only
exports.getBlogById = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        res.json({ blog });
    } catch (error) {
        console.error('Error fetching blog:', error);
        res.status(500).json({ message: 'Error fetching blog', error: error.message });
    }
};

// Create new blog - Admin only
exports.createBlog = async (req, res) => {
    try {
        const blog = new Blog(req.body);
        await blog.save();

        res.status(201).json({ message: 'Blog created successfully', blog });
    } catch (error) {
        console.error('Error creating blog:', error);
        res.status(500).json({ message: 'Error creating blog', error: error.message });
    }
};

// Update blog - Admin only
exports.updateBlog = async (req, res) => {
    try {
        const blog = await Blog.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        res.json({ message: 'Blog updated successfully', blog });
    } catch (error) {
        console.error('Error updating blog:', error);
        res.status(500).json({ message: 'Error updating blog', error: error.message });
    }
};

// Delete blog - Admin only
exports.deleteBlog = async (req, res) => {
    try {
        const blog = await Blog.findByIdAndDelete(req.params.id);

        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        res.json({ message: 'Blog deleted successfully' });
    } catch (error) {
        console.error('Error deleting blog:', error);
        res.status(500).json({ message: 'Error deleting blog', error: error.message });
    }
};

// Get blog statistics - Admin only
exports.getBlogStats = async (req, res) => {
    try {
        const totalBlogs = await Blog.countDocuments();
        const publishedBlogs = await Blog.countDocuments({ status: 'published' });
        const draftBlogs = await Blog.countDocuments({ status: 'draft' });
        const totalViews = await Blog.aggregate([
            { $group: { _id: null, total: { $sum: '$views' } } }
        ]);

        const categoryStats = await Blog.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        res.json({
            totalBlogs,
            publishedBlogs,
            draftBlogs,
            totalViews: totalViews[0]?.total || 0,
            categoryStats
        });
    } catch (error) {
        console.error('Error fetching blog stats:', error);
        res.status(500).json({ message: 'Error fetching blog stats', error: error.message });
    }
};
