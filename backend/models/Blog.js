const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    excerpt: {
        type: String,
        required: true,
        maxlength: 200
    },
    content: {
        type: String,
        required: true
    },
    author: {
        name: {
            type: String,
            required: true,
            default: 'HS Global Team'
        },
        avatar: {
            type: String,
            default: ''
        }
    },
    featuredImage: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Industry News', 'Product Updates', 'Design Trends', 'How-To Guides', 'Company News', 'Case Studies'],
        default: 'Company News'
    },
    tags: [{
        type: String,
        trim: true
    }],
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft'
    },
    views: {
        type: Number,
        default: 0
    },
    readTime: {
        type: Number, // in minutes
        default: 5
    },
    seo: {
        metaTitle: String,
        metaDescription: String,
        keywords: [String]
    },
    publishedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Index for better query performance

blogSchema.index({ status: 1, publishedAt: -1 });
blogSchema.index({ category: 1 });
blogSchema.index({ tags: 1 });

// Auto-generate slug from title if not provided
blogSchema.pre('save', async function () {
    if (!this.slug && this.title) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    // Set publishedAt when status changes to published
    if (this.status === 'published' && !this.publishedAt) {
        this.publishedAt = new Date();
    }
});

// Calculate read time based on content length
blogSchema.pre('save', async function () {
    if (this.content) {
        const wordsPerMinute = 200;
        const wordCount = this.content.split(/\s+/).length;
        this.readTime = Math.ceil(wordCount / wordsPerMinute);
    }
});

module.exports = mongoose.model('Blog', blogSchema);
