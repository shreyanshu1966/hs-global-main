const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface Blog {
    _id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    author: {
        name: string;
        avatar: string;
    };
    featuredImage: string;
    category: string;
    tags: string[];
    status: 'draft' | 'published' | 'archived';
    views: number;
    readTime: number;
    seo?: {
        metaTitle?: string;
        metaDescription?: string;
        keywords?: string[];
    };
    publishedAt: string;
    createdAt: string;
    updatedAt: string;
}

export interface BlogsResponse {
    blogs: Blog[];
    currentPage: number;
    totalPages: number;
    totalBlogs: number;
}

export interface BlogDetailResponse {
    blog: Blog;
    relatedBlogs: Blog[];
}

export interface Category {
    _id: string;
    count: number;
}

export interface Tag {
    _id: string;
    count: number;
}

class BlogService {
    // Public methods
    async getAllBlogs(params?: {
        page?: number;
        limit?: number;
        category?: string;
        tag?: string;
        search?: string;
        sort?: string;
    }): Promise<BlogsResponse> {
        const queryParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) {
                    queryParams.append(key, value.toString());
                }
            });
        }

        const response = await fetch(`${API_URL}/blogs?${queryParams}`);
        if (!response.ok) {
            throw new Error('Failed to fetch blogs');
        }
        return response.json();
    }

    async getBlogBySlug(slug: string): Promise<BlogDetailResponse> {
        const response = await fetch(`${API_URL}/blogs/${slug}`);
        if (!response.ok) {
            throw new Error('Failed to fetch blog');
        }
        return response.json();
    }

    async getFeaturedBlogs(limit: number = 3): Promise<{ blogs: Blog[] }> {
        const response = await fetch(`${API_URL}/blogs/featured?limit=${limit}`);
        if (!response.ok) {
            throw new Error('Failed to fetch featured blogs');
        }
        return response.json();
    }

    async getCategories(): Promise<{ categories: Category[] }> {
        const response = await fetch(`${API_URL}/blogs/categories`);
        if (!response.ok) {
            throw new Error('Failed to fetch categories');
        }
        return response.json();
    }

    async getTags(): Promise<{ tags: Tag[] }> {
        const response = await fetch(`${API_URL}/blogs/tags`);
        if (!response.ok) {
            throw new Error('Failed to fetch tags');
        }
        return response.json();
    }

    // Admin methods
    async getAllBlogsAdmin(
        token: string,
        params?: {
            page?: number;
            limit?: number;
            status?: string;
            category?: string;
        }
    ): Promise<BlogsResponse> {
        const queryParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) {
                    queryParams.append(key, value.toString());
                }
            });
        }

        const response = await fetch(`${API_URL}/blogs/admin/all?${queryParams}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch blogs');
        }
        return response.json();
    }

    async getBlogById(token: string, id: string): Promise<{ blog: Blog }> {
        const response = await fetch(`${API_URL}/blogs/admin/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch blog');
        }
        return response.json();
    }

    async createBlog(token: string, blogData: Partial<Blog>): Promise<{ message: string; blog: Blog }> {
        const response = await fetch(`${API_URL}/blogs/admin`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(blogData)
        });

        if (!response.ok) {
            throw new Error('Failed to create blog');
        }
        return response.json();
    }

    async updateBlog(
        token: string,
        id: string,
        blogData: Partial<Blog>
    ): Promise<{ message: string; blog: Blog }> {
        const response = await fetch(`${API_URL}/blogs/admin/${id}`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(blogData)
        });

        if (!response.ok) {
            throw new Error('Failed to update blog');
        }
        return response.json();
    }

    async deleteBlog(token: string, id: string): Promise<{ message: string }> {
        const response = await fetch(`${API_URL}/blogs/admin/${id}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to delete blog');
        }
        return response.json();
    }

    async getBlogStats(token: string): Promise<{
        totalBlogs: number;
        publishedBlogs: number;
        draftBlogs: number;
        totalViews: number;
        categoryStats: Array<{ _id: string; count: number }>;
    }> {
        const response = await fetch(`${API_URL}/blogs/admin/stats`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch blog stats');
        }
        return response.json();
    }
}

export default new BlogService();
