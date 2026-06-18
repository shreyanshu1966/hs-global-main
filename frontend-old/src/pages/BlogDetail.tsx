import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Calendar, Clock, ArrowLeft, Share2, Tag, Eye } from 'lucide-react';
import blogService, { Blog } from '../services/blogService';

const BlogDetail = () => {
    const { slug } = useParams<{ slug: string }>();
    const [blog, setBlog] = useState<Blog | null>(null);
    const [relatedBlogs, setRelatedBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (slug) {
            fetchBlog();
        }
    }, [slug]);

    const fetchBlog = async () => {
        try {
            setLoading(true);
            const data = await blogService.getBlogBySlug(slug!);
            setBlog(data.blog);
            setRelatedBlogs(data.relatedBlogs);
        } catch (error) {
            console.error('Error fetching blog:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleShare = async () => {
        if (navigator.share && blog) {
            try {
                await navigator.share({
                    title: blog.title,
                    text: blog.excerpt,
                    url: window.location.href
                });
            } catch (error) {
                console.log('Error sharing:', error);
            }
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(window.location.href);
            alert('Link copied to clipboard!');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 pt-32 pb-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-3/4 mb-4" />
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-8" />
                        <div className="h-96 bg-gray-200 rounded-2xl mb-8" />
                        <div className="space-y-4">
                            <div className="h-4 bg-gray-200 rounded" />
                            <div className="h-4 bg-gray-200 rounded" />
                            <div className="h-4 bg-gray-200 rounded w-5/6" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!blog) {
        return (
            <div className="min-h-screen bg-gray-50 pt-32 pb-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl font-bold mb-4">Blog not found</h1>
                    <Link to="/blog" className="text-amber-600 hover:text-amber-700 font-medium">
                        ← Back to blogs
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>{blog.seo?.metaTitle || blog.title} - HS Global Export</title>
                <meta
                    name="description"
                    content={blog.seo?.metaDescription || blog.excerpt}
                />
                {blog.seo?.keywords && (
                    <meta name="keywords" content={blog.seo.keywords.join(', ')} />
                )}
            </Helmet>

            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
                {/* Back Button */}
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32">
                    <Link
                        to="/blog"
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-amber-600 transition-colors mb-8 group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to blogs
                    </Link>
                </div>

                {/* Article Header */}
                <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
                    <header className="mb-12">
                        {/* Category Badge */}
                        <div className="mb-6">
                            <span className="inline-block px-4 py-2 bg-amber-100 text-amber-800 rounded-full text-sm font-semibold">
                                {blog.category}
                            </span>
                        </div>

                        {/* Title */}
                        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 leading-tight">
                            {blog.title}
                        </h1>

                        {/* Meta Information */}
                        <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-8">
                            <div className="flex items-center gap-2">
                                {blog.author.avatar && (
                                    <img
                                        src={blog.author.avatar}
                                        alt={blog.author.name}
                                        className="w-10 h-10 rounded-full"
                                    />
                                )}
                                <span className="font-medium text-gray-900">{blog.author.name}</span>
                            </div>

                            <span className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                {formatDate(blog.publishedAt)}
                            </span>

                            <span className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                {blog.readTime} min read
                            </span>

                            <span className="flex items-center gap-2">
                                <Eye className="w-4 h-4" />
                                {blog.views.toLocaleString()} views
                            </span>

                            <button
                                onClick={handleShare}
                                className="flex items-center gap-2 ml-auto px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                            >
                                <Share2 className="w-4 h-4" />
                                Share
                            </button>
                        </div>

                        {/* Featured Image */}
                        <div className="relative h-96 md:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
                            <img
                                src={blog.featuredImage}
                                alt={blog.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </header>

                    {/* Article Content */}
                    <div className="prose prose-lg max-w-none">
                        <div
                            className="text-gray-700 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: blog.content }}
                        />
                    </div>

                    {/* Tags */}
                    {blog.tags && blog.tags.length > 0 && (
                        <div className="mt-12 pt-8 border-t border-gray-200">
                            <div className="flex items-center gap-3 flex-wrap">
                                <Tag className="w-5 h-5 text-gray-400" />
                                {blog.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors cursor-pointer"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </article>

                {/* Related Blogs */}
                {relatedBlogs.length > 0 && (
                    <section className="bg-gray-50 py-20">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <h2 className="text-3xl font-bold mb-12 text-center">Related Articles</h2>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {relatedBlogs.map((relatedBlog) => (
                                    <Link
                                        key={relatedBlog._id}
                                        to={`/blog/${relatedBlog.slug}`}
                                        className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                                    >
                                        <div className="relative h-48 overflow-hidden">
                                            <img
                                                src={relatedBlog.featuredImage}
                                                alt={relatedBlog.title}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                        </div>

                                        <div className="p-6">
                                            <span className="text-xs font-semibold text-amber-600 mb-2 block">
                                                {relatedBlog.category}
                                            </span>

                                            <h3 className="text-lg font-bold mb-2 text-gray-900 group-hover:text-amber-600 transition-colors line-clamp-2">
                                                {relatedBlog.title}
                                            </h3>

                                            <p className="text-gray-600 text-sm line-clamp-2">
                                                {relatedBlog.excerpt}
                                            </p>

                                            <div className="flex items-center gap-3 text-xs text-gray-500 mt-4">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {relatedBlog.readTime} min
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </section>
                )}
            </div>
        </>
    );
};

export default BlogDetail;
