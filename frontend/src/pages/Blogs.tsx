import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Calendar, Clock, ArrowRight, Search, Tag, Filter } from 'lucide-react';
import blogService, { Blog } from '../services/blogService';

const Blogs = () => {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');
    const [categories, setCategories] = useState<Array<{ _id: string; count: number }>>([]);
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        fetchBlogs();
        fetchCategories();
    }, [currentPage, selectedCategory, searchQuery]);

    const fetchBlogs = async () => {
        try {
            setLoading(true);
            const params: any = { page: currentPage, limit: 9 };
            if (selectedCategory) params.category = selectedCategory;
            if (searchQuery) params.search = searchQuery;

            const data = await blogService.getAllBlogs(params);
            setBlogs(data.blogs);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error('Error fetching blogs:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const data = await blogService.getCategories();
            setCategories(data.categories);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };



    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchBlogs();
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <>
            <Helmet>
                <title>Blog - HS Global Export | Industry Insights & Updates</title>
                <meta
                    name="description"
                    content="Stay updated with the latest industry news, design trends, and product updates from HS Global Export."
                />
            </Helmet>

            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
                {/* Hero Section */}
                <section className="relative pt-32 pb-20 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-black/5 via-transparent to-amber-500/5" />
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                        <div className="text-center max-w-3xl mx-auto">
                            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-black to-amber-600 bg-clip-text text-transparent">
                                Our Blog
                            </h1>
                            <p className="text-xl text-gray-600 mb-8">
                                Insights, trends, and stories from the world of premium surfaces and furniture
                            </p>

                            {/* Search Bar */}
                            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search articles..."
                                        className="w-full pl-12 pr-4 py-4 rounded-full border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                                    />
                                </div>
                            </form>
                        </div>
                    </div>
                </section>

                {/* Filter Section */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
                    <div className="flex items-center justify-between mb-6">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 hover:border-amber-500 transition-colors"
                        >
                            <Filter className="w-4 h-4" />
                            <span>Filters</span>
                        </button>

                        {selectedCategory && (
                            <button
                                onClick={() => {
                                    setSelectedCategory('');
                                    setCurrentPage(1);
                                }}
                                className="text-sm text-gray-600 hover:text-amber-600 transition-colors"
                            >
                                Clear filters
                            </button>
                        )}
                    </div>

                    {showFilters && (
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
                            <h3 className="font-semibold mb-4 flex items-center gap-2">
                                <Tag className="w-4 h-4" />
                                Categories
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {categories.map((cat) => (
                                    <button
                                        key={cat._id}
                                        onClick={() => {
                                            setSelectedCategory(cat._id === selectedCategory ? '' : cat._id);
                                            setCurrentPage(1);
                                        }}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === cat._id
                                            ? 'bg-amber-500 text-white shadow-md'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        {cat._id} ({cat.count})
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </section>

                {/* Blog Grid */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="bg-gray-200 rounded-2xl h-64 mb-4" />
                                    <div className="h-4 bg-gray-200 rounded mb-2" />
                                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                                </div>
                            ))}
                        </div>
                    ) : blogs.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-xl text-gray-600">No blogs found</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {blogs.map((blog, index) => (
                                    <article
                                        key={blog._id}
                                        className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                                        style={{ animationDelay: `${index * 100}ms` }}
                                    >
                                        <Link to={`/blog/${blog.slug}`}>
                                            <div className="relative h-64 overflow-hidden">
                                                <img
                                                    src={blog.featuredImage}
                                                    alt={blog.title}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                                <div className="absolute top-4 left-4">
                                                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-900">
                                                        {blog.category}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="p-6">
                                                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-4 h-4" />
                                                        {formatDate(blog.publishedAt)}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-4 h-4" />
                                                        {blog.readTime} min read
                                                    </span>
                                                </div>

                                                <h2 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-amber-600 transition-colors line-clamp-2">
                                                    {blog.title}
                                                </h2>

                                                <p className="text-gray-600 mb-4 line-clamp-3">{blog.excerpt}</p>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        {blog.author.avatar && (
                                                            <img
                                                                src={blog.author.avatar}
                                                                alt={blog.author.name}
                                                                className="w-8 h-8 rounded-full"
                                                            />
                                                        )}
                                                        <span className="text-sm font-medium text-gray-700">
                                                            {blog.author.name}
                                                        </span>
                                                    </div>

                                                    <span className="flex items-center gap-1 text-amber-600 font-medium group-hover:gap-2 transition-all">
                                                        Read More
                                                        <ArrowRight className="w-4 h-4" />
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    </article>
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex justify-center gap-2 mt-12">
                                    <button
                                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 rounded-lg bg-white border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:border-amber-500 transition-colors"
                                    >
                                        Previous
                                    </button>

                                    {[...Array(totalPages)].map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setCurrentPage(i + 1)}
                                            className={`px-4 py-2 rounded-lg transition-all ${currentPage === i + 1
                                                ? 'bg-amber-500 text-white shadow-md'
                                                : 'bg-white border border-gray-200 hover:border-amber-500'
                                                }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}

                                    <button
                                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="px-4 py-2 rounded-lg bg-white border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:border-amber-500 transition-colors"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </section>
            </div>
        </>
    );
};

export default Blogs;
