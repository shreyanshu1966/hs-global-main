import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    getAnalytics,
    getAllUsers,
    getAllOrders,
    updateOrderStatus,
    updateUserRole,
    deleteUser
} from '../services/adminService';
import EnhancedProductForm from '../components/EnhancedProductForm';
import {
    TrendingUp,
    Users,
    Package,
    DollarSign,
    Search,
    Edit2,
    Save,
    X,
    Trash2,
    BarChart3,
    ShoppingCart,
    UserCog,
    LogOut,
    ChevronLeft,
    ChevronRight,
    FileText,
    Plus,
    Layout,
    Mail,
    Layers,
    Image,
    Upload,
    Star,
    Tag,
    Percent,
    Play
} from 'lucide-react';
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import blogService, { Blog } from '../services/blogService';
import contactService, { Contact, ContactStats } from '../services/contactService';
import quotationService, { Quotation, QuotationStats } from '../services/quotationService';
import adminProductService, { Product, ProductFormData } from '../services/adminProductService';
import reviewService, { Review } from '../services/reviewService';

interface Analytics {
    users: {
        total: number;
        verified: number;
        admins: number;
        recent: number;
    };
    orders: {
        total: number;
        paid: number;
        failed: number;
        pending: number;
        recent: number;
        deliveryStatus: Array<{ _id: string; count: number }>;
    };
    revenue: {
        total: number;
        monthly: Array<{
            _id: { year: number; month: number };
            revenue: number;
            count: number;
        }>;
    };
}

interface User {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    role: string;
    emailVerified: boolean;
    createdAt: string;
    orders: any[];
}

interface Order {
    _id: string;
    orderId: string;
    userId: any;
    amount: number;
    currency: string;
    status: string;
    deliveryStatus: string;
    items: any[];
    customer: {
        name: string;
        email: string;
        phone: string;
    };
    trackingNumber?: string;
    notes?: string;
    createdAt: string;
}

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'];

const Admin = () => {
    const { user, token, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'analytics' | 'orders' | 'users' | 'blogs' | 'contacts' | 'quotations' | 'products' | 'reviews'>('analytics');
    const [loading, setLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);

    // Check if DOM is ready for portals
    useEffect(() => {
        setIsMounted(true);
        return () => setIsMounted(false);
    }, []);

    // Analytics state
    const [analytics, setAnalytics] = useState<Analytics | null>(null);

    // Users state
    const [users, setUsers] = useState<User[]>([]);
    const [usersPage, setUsersPage] = useState(1);
    const [usersPagination, setUsersPagination] = useState<any>(null);
    const [usersSearch, setUsersSearch] = useState('');
    const [usersRoleFilter, setUsersRoleFilter] = useState('');

    // Orders state
    const [orders, setOrders] = useState<Order[]>([]);
    const [ordersPage, setOrdersPage] = useState(1);
    const [ordersPagination, setOrdersPagination] = useState<any>(null);
    const [ordersSearch, setOrdersSearch] = useState('');
    const [ordersStatusFilter, setOrdersStatusFilter] = useState('');
    const [ordersDeliveryFilter, setOrdersDeliveryFilter] = useState('');
    const [editingOrder, setEditingOrder] = useState<string | null>(null);
    const [orderFormData, setOrderFormData] = useState<any>({});

    // Blogs state
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [blogsPage, setBlogsPage] = useState(1);
    const [blogsPagination, setBlogsPagination] = useState<any>(null);
    const [blogStats, setBlogStats] = useState<any>(null);
    const [isEditingBlog, setIsEditingBlog] = useState(false);
    const [currentBlog, setCurrentBlog] = useState<Partial<Blog>>({});
    const [showBlogModal, setShowBlogModal] = useState(false);

    // Contacts state
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [contactsPage, setContactsPage] = useState(1);
    const [contactsPagination, setContactsPagination] = useState<any>(null);
    const [contactsStatusFilter, setContactsStatusFilter] = useState('');
    const [contactStats, setContactStats] = useState<ContactStats | null>(null);
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [showContactModal, setShowContactModal] = useState(false);

    // Quotations state
    const [quotations, setQuotations] = useState<Quotation[]>([]);
    const [quotationsPage, setQuotationsPage] = useState(1);
    const [quotationsPagination, setQuotationsPagination] = useState<any>(null);
    const [quotationsStatusFilter, setQuotationsStatusFilter] = useState('');
    const [quotationStats, setQuotationStats] = useState<QuotationStats | null>(null);
    const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
    const [showQuotationModal, setShowQuotationModal] = useState(false);

    // Products state
    const [products, setProducts] = useState<Product[]>([]);
    const [productsPage, setProductsPage] = useState(1);
    const [productsPagination, setProductsPagination] = useState<any>(null);
    const [productsSearch, setProductsSearch] = useState('');
    const [productsCategoryFilter, setProductsCategoryFilter] = useState('');
    const [productsStatusFilter, setProductsStatusFilter] = useState('');
    const [showProductModal, setShowProductModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [productFormData, setProductFormData] = useState<Partial<ProductFormData>>({});
    const [productImages, setProductImages] = useState<File[]>([]);
    const [productImagePreviews, setProductImagePreviews] = useState<string[]>([]);
    const [existingImages, setExistingImages] = useState<string[]>([]); // For editing existing products
    const [removedImages, setRemovedImages] = useState<string[]>([]); // Track images to remove
    const [mainImageIndex, setMainImageIndex] = useState<number>(0); // Track which image is main (existing)
    const [mainNewImageIndex, setMainNewImageIndex] = useState<number | null>(null); // Track which NEW image is main
    const [productVideo, setProductVideo] = useState<File | null>(null);
    const [productVideoPreview, setProductVideoPreview] = useState<string | null>(null);
    const [removeVideo, setRemoveVideo] = useState(false);
    const [productLoading, setProductLoading] = useState(false);
    const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
    const [showCustomSubcategory, setShowCustomSubcategory] = useState(false);
    const [customSubcategory, setCustomSubcategory] = useState('');
    const [customSubcategories, setCustomSubcategories] = useState<{ [categoryId: string]: Array<{ id: string, name: string }> }>({});
    
    // Additional loading states for better UX
    const [productsLoading, setProductsLoading] = useState(false);
    const [bulkDiscountLoading, setBulkDiscountLoading] = useState(false);
    const [editingProductId, setEditingProductId] = useState<string | null>(null);

    // Product Preview state
    const [showProductPreview, setShowProductPreview] = useState(false);
    const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
    const [previewLoading, setPreviewLoading] = useState(false);

    // Bulk Actions state
    const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
    const [showBulkDiscountModal, setShowBulkDiscountModal] = useState(false);
    const [bulkDiscountData, setBulkDiscountData] = useState<{
        enabled: boolean;
        percentage: number;
        startDate?: string;
        endDate?: string;
        description?: string;
    }>({
        enabled: true,
        percentage: 0,
        startDate: '',
        endDate: '',
        description: ''
    });

    // Reviews state
    const [reviews, setReviews] = useState<Review[]>([]);
    const [reviewsPage, setReviewsPage] = useState(1);
    const [reviewsStatusFilter, setReviewsStatusFilter] = useState('');
    const [reviewsTotal, setReviewsTotal] = useState(0);
    const [reviewsHasMore, setReviewsHasMore] = useState(false);

    // Search debouncing
    const [searchDebounceTimer, setSearchDebounceTimer] = useState<NodeJS.Timeout | null>(null);

    // Debounced search effect
    useEffect(() => {
        if (searchDebounceTimer) {
            clearTimeout(searchDebounceTimer);
        }
        
        const timer = setTimeout(() => {
            if (activeTab === 'products') {
                loadData();
            }
        }, 300); // 300ms debounce
        
        setSearchDebounceTimer(timer);
        
        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [productsSearch]);

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/');
            return;
        }
        loadData();
    }, [user, navigate, activeTab, usersPage, ordersPage, usersSearch, usersRoleFilter, ordersSearch, ordersStatusFilter, ordersDeliveryFilter, blogsPage, contactsPage, contactsStatusFilter, quotationsPage, quotationsStatusFilter, productsPage, productsCategoryFilter, productsStatusFilter, reviewsPage, reviewsStatusFilter]);

    // Lock body scroll when any modal is open
    // Lock body scroll when any modal is open
    useEffect(() => {
        if (typeof document === 'undefined') return;

        const isModalOpen = showProductModal || showBlogModal || showQuotationModal || showContactModal || showBulkDiscountModal || showProductPreview;

        const preventScroll = (e: Event) => {
            e.preventDefault();
            e.stopPropagation();
        };

        if (isModalOpen) {
            document.body?.style.setProperty('overflow', 'hidden', 'important');
            document.documentElement?.style.setProperty('overflow', 'hidden', 'important');

            // Add event listeners to prevent background scrolling
            document.addEventListener('wheel', preventScroll, { passive: false });
            document.addEventListener('touchmove', preventScroll, { passive: false });
            document.addEventListener('scroll', preventScroll, { passive: false });
        } else {
            document.body?.style.removeProperty('overflow');
            document.documentElement?.style.removeProperty('overflow');

            // Remove event listeners
            document.removeEventListener('wheel', preventScroll);
            document.removeEventListener('touchmove', preventScroll);
            document.removeEventListener('scroll', preventScroll);
        }

        return () => {
            document.body?.style.removeProperty('overflow');
            document.documentElement?.style.removeProperty('overflow');
            document.removeEventListener('wheel', preventScroll);
            document.removeEventListener('touchmove', preventScroll);
            document.removeEventListener('scroll', preventScroll);
        };
    }, [showProductModal, showBlogModal, showQuotationModal, showContactModal, showBulkDiscountModal, showProductPreview]);

    const loadData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'analytics') {
                const data = await getAnalytics();
                setAnalytics(data.analytics);
            } else if (activeTab === 'users') {
                const data = await getAllUsers(usersPage, 10, usersSearch, usersRoleFilter);
                setUsers(data.users);
                setUsersPagination(data.pagination);
            } else if (activeTab === 'orders') {
                const data = await getAllOrders(ordersPage, 10, ordersStatusFilter, ordersDeliveryFilter, ordersSearch);
                setOrders(data.orders);
                setOrdersPagination(data.pagination);
            } else if (activeTab === 'blogs' && token) {
                const [blogsData, statsData] = await Promise.all([
                    blogService.getAllBlogsAdmin(token, { page: blogsPage, limit: 10 }),
                    blogService.getBlogStats(token)
                ]);
                setBlogs(blogsData.blogs);
                setBlogsPagination({
                    currentPage: blogsData.currentPage,
                    totalPages: blogsData.totalPages,
                    totalBlogs: blogsData.totalBlogs
                });
                setBlogStats(statsData);
            } else if (activeTab === 'contacts') {
                const [contactsData, statsData] = await Promise.all([
                    contactService.getAllContacts(contactsPage, 10, contactsStatusFilter),
                    contactService.getContactStats()
                ]);
                setContacts(contactsData.contacts);
                setContactsPagination(contactsData.pagination);
                setContactStats(statsData);
            } else if (activeTab === 'quotations') {
                const [quotationsData, statsData] = await Promise.all([
                    quotationService.getAllQuotations(quotationsPage, 10, quotationsStatusFilter),
                    quotationService.getQuotationStats()
                ]);
                setQuotations(quotationsData.quotations);
                setQuotationsPagination(quotationsData.pagination);
                setQuotationStats(statsData);
            } else if (activeTab === 'products') {
                setProductsLoading(true);
                const productsData = await adminProductService.getAdminProducts({
                    page: productsPage,
                    limit: 10,
                    search: productsSearch,
                    category: productsCategoryFilter,
                    status: productsStatusFilter
                });
                setProducts(productsData.data);
                setProductsPagination(productsData.pagination);
                setProductsLoading(false);
            } else if (activeTab === 'reviews' && token) {
                const reviewsData = await reviewService.getAllReviews(
                    token,
                    reviewsStatusFilter || undefined,
                    10,
                    (reviewsPage - 1) * 10
                );
                setReviews(reviewsData.reviews);
                setReviewsTotal(reviewsData.total);
                setReviewsHasMore(reviewsData.hasMore);
            }
        } catch (error: any) {
            console.error('Failed to load data:', error);
            alert(error.message);
        } finally {
            setLoading(false);
            setProductsLoading(false);
        }
    };

    const handleUpdateOrderStatus = async (orderId: string) => {
        try {
            await updateOrderStatus(orderId, orderFormData[orderId]);
            setEditingOrder(null);
            setOrderFormData({});
            loadData();
            alert('Order updated successfully');
        } catch (error: any) {
            alert(error.message);
        }
    };

    const handleUpdateUserRole = async (userId: string, newRole: string) => {
        if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
            return;
        }
        try {
            await updateUserRole(userId, newRole);
            loadData();
            alert('User role updated successfully');
        } catch (error: any) {
            alert(error.message);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return;
        }
        try {
            await deleteUser(userId);
            loadData();
            alert('User deleted successfully');
        } catch (error: any) {
            alert(error.message);
        }
    };

    const handleSaveBlog = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;

        try {
            if (isEditingBlog && currentBlog._id) {
                await blogService.updateBlog(token, currentBlog._id, currentBlog);
                alert('Blog updated successfully');
            } else {
                await blogService.createBlog(token, currentBlog);
                alert('Blog created successfully');
            }
            setShowBlogModal(false);
            setCurrentBlog({});
            setIsEditingBlog(false);
            loadData();
        } catch (error: any) {
            alert(error.message);
        }
    };

    const handleDeleteBlog = async (blogId: string) => {
        if (!token || !confirm('Are you sure you want to delete this blog?')) return;

        try {
            await blogService.deleteBlog(token, blogId);
            loadData();
            alert('Blog deleted successfully');
        } catch (error: any) {
            alert(error.message);
        }
    };

    const handleUpdateContactStatus = async (contactId: string, status: string, adminNotes?: string) => {
        try {
            await contactService.updateContactStatus(contactId, status, adminNotes);
            loadData();
            setShowContactModal(false);
            setSelectedContact(null);
            alert('Contact status updated successfully');
        } catch (error: any) {
            alert(error.message);
        }
    };

    const handleDeleteContact = async (contactId: string) => {
        if (!confirm('Are you sure you want to delete this contact inquiry?')) return;

        try {
            await contactService.deleteContact(contactId);
            loadData();
            alert('Contact inquiry deleted successfully');
        } catch (error: any) {
            alert(error.message);
        }
    };

    const handleViewContact = async (contactId: string) => {
        try {
            const contact = await contactService.getContactById(contactId);
            setSelectedContact(contact);
            setShowContactModal(true);
        } catch (error: any) {
            alert(error.message);
        }
    };

    const handleUpdateQuotationStatus = async (quotationId: string, status: string, adminNotes?: string, quotedPrice?: number) => {
        try {
            await quotationService.updateQuotationStatus(quotationId, status, adminNotes, quotedPrice);
            loadData();
            setShowQuotationModal(false);
            setSelectedQuotation(null);
            alert('Quotation status updated successfully');
        } catch (error: any) {
            alert(error.message);
        }
    };

    const handleDeleteQuotation = async (quotationId: string) => {
        if (!confirm('Are you sure you want to delete this quotation request?')) return;

        try {
            await quotationService.deleteQuotation(quotationId);
            loadData();
            alert('Quotation request deleted successfully');
        } catch (error: any) {
            alert(error.message);
        }
    };

    const handleViewQuotation = async (quotationId: string) => {
        try {
            const quotation = await quotationService.getQuotationById(quotationId);
            setSelectedQuotation(quotation);
            setShowQuotationModal(true);
        } catch (error: any) {
            alert(error.message);
        }
    };

    // Product handlers
    const handleOpenProductModal = async (product?: Product) => {
        if (product) {
            setEditingProductId(product.productId);
            
            // Small delay to show loading state
            await new Promise(resolve => setTimeout(resolve, 100));
            
            setEditingProduct(product);
            setProductFormData({
                productId: product.productId,
                name: product.name,
                category: product.category,
                subcategory: product.subcategory,
                description: product.description,
                priceINR: product.priceINR,
                available: product.available,
                featured: product.featured || false,
                hasVideo: product.hasVideo,
                status: product.status,
                furnitureSpecs: product.furnitureSpecs,
                slabSpecs: product.slabSpecs,
                seoTitle: product.seoTitle,
                seoDescription: product.seoDescription,
                seoKeywords: product.seoKeywords
            });
            setExistingImages(product.images || []);
            setProductImagePreviews([]);
            setRemovedImages([]);
            setMainImageIndex(0);
            setMainNewImageIndex(null);

            // Check if subcategory is custom
            const predefinedSubcategories = getPredefinedSubcategories(product.category);
            if (!predefinedSubcategories.includes(product.subcategory)) {
                setShowCustomSubcategory(true);
                setCustomSubcategory(product.subcategory);
            } else {
                setShowCustomSubcategory(false);
                setCustomSubcategory('');
            }
        } else {
            setEditingProduct(null);
            setProductFormData({
                category: 'furniture',
                status: 'active',
                available: true,
                featured: false,
                hasVideo: false
            });
            setExistingImages([]);
            setProductImagePreviews([]);
            setRemovedImages([]);
            setMainImageIndex(0);
            setMainNewImageIndex(0); // If creating new, first new image is main by default
            setShowCustomSubcategory(false);
            setCustomSubcategory('');
        }
        setProductImages([]);
        setShowProductModal(true);
        setEditingProductId(null);
    };

    const getPredefinedSubcategories = (category: string): string[] => {
        if (category === 'furniture') {
            return ['tables', 'coffee-table', 'console-table', 'dining-table', 'side-table',
                'wash-basins', 'pedestal', 'countertop', 'sculptures', 'benches',
                'planters', 'fountains', 'fireplace', 'columns', 'urns'];
        } else {
            return ['granite', 'marble', 'quartzite', 'onyx', 'limestone',
                'travertine', 'sandstone', 'slate'];
        }
    };

    // Load custom subcategories
    const loadCustomSubcategories = async () => {
        try {
            const { fetchCustomCategories } = await import('../services/categoryService');
            const customData = await fetchCustomCategories();
            setCustomSubcategories(customData);
        } catch (error) {
            console.error('Failed to load custom subcategories:', error);
        }
    };

    // Load custom subcategories on mount
    useEffect(() => {
        loadCustomSubcategories();
    }, []);

    const handleCloseProductModal = () => {
        setShowProductModal(false);
        setEditingProduct(null);
        setProductFormData({});
        setProductImages([]);
        setProductImagePreviews([]);
        setProductVideo(null);
        setProductVideoPreview(null);
        setRemoveVideo(false);
        setShowCustomSubcategory(false);
        setCustomSubcategory('');
    };

    const handleProductImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setProductImages(prev => [...prev, ...files]);

        // Create previews
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setProductImagePreviews(prev => [...prev, ...newPreviews]);
    };

    const handleProductVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file size (10MB)
            if (file.size > 10 * 1024 * 1024) {
                alert('Video file size must be less than 10MB');
                return;
            }
            // Validate file type
            const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
            if (!allowedTypes.includes(file.type)) {
                alert('Only MP4, WebM, MOV, and AVI video formats are allowed');
                return;
            }
            setProductVideo(file);
            setProductVideoPreview(URL.createObjectURL(file));
            setRemoveVideo(false);
        }
    };

    const handleSaveProduct = async () => {
        if (productLoading) return; // Prevent double submission

        try {
            // Use custom subcategory if provided, otherwise use form data
            const finalSubcategory = showCustomSubcategory ? customSubcategory : productFormData.subcategory;

            if (!productFormData.productId || !productFormData.name || !productFormData.category || !finalSubcategory || !productFormData.description) {
                alert('Please fill in all required fields');
                return;
            }

            // Prepare product images and check for newImagesFirst flag
            let finalProductFiles = [...productImages];
            let newImagesFirst = false;

            // Handle New Image as Main
            if (mainNewImageIndex !== null && mainNewImageIndex >= 0 && mainNewImageIndex < finalProductFiles.length) {
                // User explicitly selected a NEW image as main
                const mainFile = finalProductFiles[mainNewImageIndex];
                finalProductFiles = finalProductFiles.filter((_, i) => i !== mainNewImageIndex); // Remove from current position
                finalProductFiles.unshift(mainFile); // Add to front
                newImagesFirst = true;
            }

            // Prepare existing images list (handling removals and reordering for main image)
            let finalExistingImages = existingImages.filter(img => !removedImages.includes(img));

            // Only reorder existing images if a new image wasn't selected as main
            if (!newImagesFirst) {
                // If a specific existing image is set as main, move it to the front
                if (mainImageIndex > 0 && mainImageIndex < existingImages.length) {
                    const mainImg = existingImages[mainImageIndex];
                    if (finalExistingImages.includes(mainImg)) {
                        finalExistingImages = finalExistingImages.filter(img => img !== mainImg);
                        finalExistingImages.unshift(mainImg);
                    }
                } else if (mainImageIndex === 0 && finalExistingImages.length > 0) {
                    const mainImg = existingImages[0];
                    if (finalExistingImages.includes(mainImg) && finalExistingImages[0] !== mainImg) {
                        finalExistingImages = finalExistingImages.filter(img => img !== mainImg);
                        finalExistingImages.unshift(mainImg);
                    }
                }
            }

            const finalFormData = {
                ...productFormData,
                subcategory: finalSubcategory,
                existingImages: finalExistingImages,
                newImagesFirst
            };

            setProductLoading(true);

            // Save custom subcategory if it's a new one
            if (showCustomSubcategory && customSubcategory.trim()) {
                try {
                    const { addCustomSubcategory } = await import('../services/categoryService');
                    const categoryName = productFormData.category === 'furniture' ? 'Furniture' : 'Slabs';
                    await addCustomSubcategory(productFormData.category, categoryName, customSubcategory.trim());

                    // Reload custom subcategories to update dropdowns
                    await loadCustomSubcategories();

                    // Refresh navigation categories if available
                    if (typeof (window as any).refreshNavCategories === 'function') {
                        (window as any).refreshNavCategories();
                    }

                    console.log('✅ Custom subcategory saved successfully');
                } catch (error) {
                    console.error('❌ Failed to save custom subcategory:', error);
                    setProductLoading(false);
                    alert(`Failed to save custom subcategory "${customSubcategory}". Error: ${error.message || error}. Please try again or use a predefined subcategory.`);
                    return; // Stop the product creation/update process
                }
            }

            if (editingProduct) {
                // Update existing product
                await adminProductService.updateProduct(
                    editingProduct.productId,
                    finalFormData,
                    finalProductFiles,
                    productVideo,
                    removeVideo
                );
                alert('✅ Product updated successfully!');
            } else {
                // Create new product
                if (finalProductFiles.length === 0 && finalExistingImages.length === 0) {
                    setProductLoading(false);
                    alert('Please select at least one image');
                    return;
                }
                await adminProductService.createProduct(
                    finalFormData as ProductFormData,
                    finalProductFiles,
                    productVideo
                );
                alert('Product created successfully');
            }

            handleCloseProductModal();
            await loadData();
        } catch (error: any) {
            console.error('Save product error:', error);
            alert(error.message || 'Failed to save product');
        } finally {
            setProductLoading(false);
        }
    };

    const handlePreviewProduct = async () => {
        if (previewLoading) return; // Prevent double submission

        try {
            // Use custom subcategory if provided, otherwise use form data
            const finalSubcategory = showCustomSubcategory ? customSubcategory : productFormData.subcategory;

            if (!productFormData.productId || !productFormData.name || !productFormData.category || !finalSubcategory || !productFormData.description) {
                alert('Please fill in all required fields before previewing');
                return;
            }

            // Prepare preview data
            const previewFormData = {
                ...productFormData,
                subcategory: finalSubcategory
            };

            setPreviewLoading(true);

            // Create preview using existing images and new images
            const finalExistingImages = existingImages.filter(img => !removedImages.includes(img));

            const response = await adminProductService.previewProduct(
                previewFormData as ProductFormData,
                productImages,
                productVideo || undefined,
                finalExistingImages
            );

            if (response.success) {
                setPreviewProduct(response.data);
                setShowProductPreview(true);
            }
        } catch (error: any) {
            console.error('Preview product error:', error);
            alert(error.message || 'Failed to generate preview');
        } finally {
            setPreviewLoading(false);
        }
    };

    const handleClosePreview = () => {
        setShowProductPreview(false);
        setPreviewProduct(null);
    };

    const handleDeleteProduct = async (productId: string) => {
        if (deletingProductId) return; // Prevent multiple deletes

        if (!confirm('Are you sure you want to delete this product? This will also delete all its images and video.')) {
            return;
        }

        try {
            setDeletingProductId(productId);
            await adminProductService.deleteProduct(productId);
            await loadData();
            alert('✅ Product deleted successfully!');
        } catch (error: any) {
            console.error('Delete product error:', error);
            alert(error.message || 'Failed to delete product');
        } finally {
            setDeletingProductId(null);
        }
    };

    const handleSelectAllProducts = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            const allIds = products.map(p => p.productId);
            setSelectedProductIds(allIds);
        } else {
            setSelectedProductIds([]);
        }
    };

    const handleSelectProduct = (productId: string) => {
        if (selectedProductIds.includes(productId)) {
            setSelectedProductIds(selectedProductIds.filter(id => id !== productId));
        } else {
            setSelectedProductIds([...selectedProductIds, productId]);
        }
    };

    const handleBulkApplyDiscount = async () => {
        if (selectedProductIds.length === 0) return;

        if (!confirm(`Apply discount to ${selectedProductIds.length} products?`)) return;

        setBulkDiscountLoading(true);
        try {
            const promises = selectedProductIds.map(productId => {
                const product = products.find(p => p.productId === productId);
                if (!product) return Promise.resolve();

                const updatedData: Partial<ProductFormData> = {
                    productId: product.productId,
                    name: product.name,
                    category: product.category,
                    subcategory: product.subcategory,
                    description: product.description,
                    priceINR: product.priceINR,
                    available: product.available,
                    status: product.status,
                    featured: product.featured,
                    hasVideo: product.hasVideo,
                    furnitureSpecs: product.furnitureSpecs,
                    slabSpecs: product.slabSpecs,
                    seoTitle: product.seoTitle,
                    seoDescription: product.seoDescription,
                    seoKeywords: product.seoKeywords,
                    discount: {
                        enabled: bulkDiscountData.enabled,
                        percentage: bulkDiscountData.percentage,
                        startDate: bulkDiscountData.startDate || null,
                        endDate: bulkDiscountData.endDate || null,
                        description: bulkDiscountData.description
                    }
                };

                return adminProductService.updateProduct(
                    productId,
                    { ...updatedData, preserveExistingImages: true },
                    undefined,
                    undefined,
                    false
                );
            });

            await Promise.all(promises);
            await loadData();
            setShowBulkDiscountModal(false);
            setSelectedProductIds([]);
            setBulkDiscountData({
                enabled: true,
                percentage: 0,
                startDate: '',
                endDate: '',
                description: ''
            });
            alert('✅ Bulk discount applied successfully!');
        } catch (error: any) {
            console.error('Bulk discount error:', error);
            alert(error.message || 'Failed to apply bulk discount');
        } finally {
            setBulkDiscountLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const formatCurrency = (amount: number, currency: string = 'INR') => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2
        }).format(amount);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getMonthName = (month: number) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months[month - 1];
    };

    // Prepare chart data
    const prepareRevenueChartData = () => {
        if (!analytics) return [];
        return analytics.revenue.monthly.map(month => ({
            name: `${getMonthName(month._id.month)} ${month._id.year}`,
            revenue: month.revenue,
            orders: month.count
        }));
    };

    const prepareOrderStatusData = () => {
        if (!analytics) return [];
        return [
            { name: 'Paid', value: analytics.orders.paid },
            { name: 'Pending', value: analytics.orders.pending },
            { name: 'Failed', value: analytics.orders.failed }
        ];
    };

    const prepareDeliveryStatusData = () => {
        if (!analytics) return [];
        return analytics.orders.deliveryStatus.map(status => ({
            name: status._id.charAt(0).toUpperCase() + status._id.slice(1),
            value: status.count
        }));
    };

    if (loading && !analytics && users.length === 0 && orders.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg font-medium">Loading admin dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="min-h-screen bg-gray-50">
                {/* Top Navigation Bar */}
                <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                    <BarChart3 className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                                    <p className="text-xs text-gray-500">Manage your platform</p>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="text-sm font-medium">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Quick Actions */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-sm border border-blue-200 p-4 mb-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-600 rounded-lg">
                                    <Percent className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900">Discount Management</h3>
                                    <p className="text-xs text-gray-600">View analytics, manage product discounts, and cleanup expired offers</p>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate('/admin/discounts')}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
                            >
                                <Percent className="w-4 h-4" />
                                Manage Discounts
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1 mb-6">
                        <div className="grid grid-cols-9 gap-1">
                            <button
                                onClick={() => setActiveTab('analytics')}
                                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-md font-medium text-sm transition-all ${activeTab === 'analytics'
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <BarChart3 className="w-4 h-4" />
                                <span>Analytics</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('orders')}
                                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-md font-medium text-sm transition-all ${activeTab === 'orders'
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <ShoppingCart className="w-4 h-4" />
                                <span>Orders</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('users')}
                                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-md font-medium text-sm transition-all ${activeTab === 'users'
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <UserCog className="w-4 h-4" />
                                <span>Users</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('products')}
                                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-md font-medium text-sm transition-all ${activeTab === 'products'
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <Package className="w-4 h-4" />
                                <span>Products</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('blogs')}
                                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-md font-medium text-sm transition-all ${activeTab === 'blogs'
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <Layout className="w-4 h-4" />
                                <span>Blogs</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('contacts')}
                                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-md font-medium text-sm transition-all ${activeTab === 'contacts'
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <Mail className="w-4 h-4" />
                                <span>Contacts</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('quotations')}
                                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-md font-medium text-sm transition-all ${activeTab === 'quotations'
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <Layers className="w-4 h-4" />
                                <span>Quotations</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('reviews')}
                                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-md font-medium text-sm transition-all ${activeTab === 'reviews'
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <Star className="w-4 h-4" />
                                <span>Reviews</span>
                            </button>
                        </div>
                    </div>

                    {/* Analytics Tab */}
                    {activeTab === 'analytics' && analytics && (
                        <div className="space-y-6">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {/* Revenue Card */}
                                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-3 bg-green-100 rounded-lg">
                                            <DollarSign className="w-6 h-6 text-green-600" />
                                        </div>
                                    </div>
                                    <h3 className="text-sm font-medium text-gray-600 mb-1">Total Revenue</h3>
                                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.revenue.total)}</p>
                                </div>

                                {/* Users Card */}
                                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-3 bg-blue-100 rounded-lg">
                                            <Users className="w-6 h-6 text-blue-600" />
                                        </div>
                                    </div>
                                    <h3 className="text-sm font-medium text-gray-600 mb-1">Total Users</h3>
                                    <p className="text-2xl font-bold text-gray-900">{analytics.users.total}</p>
                                    <p className="text-xs text-gray-500 mt-1">{analytics.users.verified} verified</p>
                                </div>

                                {/* Orders Card */}
                                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-3 bg-purple-100 rounded-lg">
                                            <Package className="w-6 h-6 text-purple-600" />
                                        </div>
                                    </div>
                                    <h3 className="text-sm font-medium text-gray-600 mb-1">Total Orders</h3>
                                    <p className="text-2xl font-bold text-gray-900">{analytics.orders.total}</p>
                                    <p className="text-xs text-gray-500 mt-1">{analytics.orders.paid} paid</p>
                                </div>

                                {/* Recent Activity Card */}
                                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-3 bg-orange-100 rounded-lg">
                                            <TrendingUp className="w-6 h-6 text-orange-600" />
                                        </div>
                                    </div>
                                    <h3 className="text-sm font-medium text-gray-600 mb-1">Recent Orders</h3>
                                    <p className="text-2xl font-bold text-gray-900">{analytics.orders.recent}</p>
                                    <p className="text-xs text-gray-500 mt-1">Last 7 days</p>
                                </div>
                            </div>

                            {/* Charts Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Revenue Chart */}
                                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue</h3>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={prepareRevenueChartData()}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                            <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#6b7280" />
                                            <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: 'white',
                                                    border: '1px solid #e5e7eb',
                                                    borderRadius: '8px',
                                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                                }}
                                            />
                                            <Legend />
                                            <Bar dataKey="revenue" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Revenue (₹)" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Order Status Distribution */}
                                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status Distribution</h3>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={prepareOrderStatusData()}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                outerRadius={100}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {prepareOrderStatusData().map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: 'white',
                                                    border: '1px solid #e5e7eb',
                                                    borderRadius: '8px',
                                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                                }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Delivery Status */}
                            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Status</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                    {analytics.orders.deliveryStatus.map((status, index) => (
                                        <div key={status._id} className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
                                            <p className="text-2xl font-bold text-gray-900 mb-1">{status.count}</p>
                                            <p className="text-sm font-medium text-gray-600 capitalize">{status._id}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Orders Tab */}
                    {activeTab === 'orders' && (
                        <div className="space-y-6">
                            {/* Filters */}
                            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search orders..."
                                            value={ordersSearch}
                                            onChange={(e) => {
                                                setOrdersSearch(e.target.value);
                                                setOrdersPage(1);
                                            }}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <select
                                        value={ordersStatusFilter}
                                        onChange={(e) => {
                                            setOrdersStatusFilter(e.target.value);
                                            setOrdersPage(1);
                                        }}
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">All Payment Status</option>
                                        <option value="created">Created</option>
                                        <option value="paid">Paid</option>
                                        <option value="failed">Failed</option>
                                    </select>
                                    <select
                                        value={ordersDeliveryFilter}
                                        onChange={(e) => {
                                            setOrdersDeliveryFilter(e.target.value);
                                            setOrdersPage(1);
                                        }}
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">All Delivery Status</option>
                                        <option value="pending">Pending</option>
                                        <option value="processing">Processing</option>
                                        <option value="shipped">Shipped</option>
                                        <option value="delivered">Delivered</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                            </div>

                            {/* Orders Table */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Order ID</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Customer</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Amount</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Payment</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Delivery</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {orders.map((order) => (
                                                <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-mono font-semibold rounded">
                                                            {order.orderId}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm font-medium text-gray-900">{order.customer?.name || 'N/A'}</div>
                                                        <div className="text-xs text-gray-500">{order.customer?.email || 'N/A'}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="text-sm font-semibold text-gray-900">{formatCurrency(order.amount, order.currency)}</span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${order.status === 'paid' ? 'bg-green-100 text-green-800' :
                                                            order.status === 'failed' ? 'bg-red-100 text-red-800' :
                                                                'bg-yellow-100 text-yellow-800'
                                                            }`}>
                                                            {order.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {editingOrder === order._id ? (
                                                            <select
                                                                value={orderFormData[order._id]?.deliveryStatus || order.deliveryStatus}
                                                                onChange={(e) =>
                                                                    setOrderFormData({
                                                                        ...orderFormData,
                                                                        [order._id]: {
                                                                            ...orderFormData[order._id],
                                                                            deliveryStatus: e.target.value
                                                                        }
                                                                    })
                                                                }
                                                                className="px-2 py-1 border border-blue-500 rounded text-sm focus:ring-2 focus:ring-blue-500"
                                                            >
                                                                <option value="pending">Pending</option>
                                                                <option value="processing">Processing</option>
                                                                <option value="shipped">Shipped</option>
                                                                <option value="delivered">Delivered</option>
                                                                <option value="cancelled">Cancelled</option>
                                                            </select>
                                                        ) : (
                                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${order.deliveryStatus === 'delivered' ? 'bg-green-100 text-green-800' :
                                                                order.deliveryStatus === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                                                    order.deliveryStatus === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                                                                        order.deliveryStatus === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                                            'bg-gray-100 text-gray-800'
                                                                }`}>
                                                                {order.deliveryStatus}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                        {formatDate(order.createdAt)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {editingOrder === order._id ? (
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => handleUpdateOrderStatus(order._id)}
                                                                    className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                                                                >
                                                                    <Save className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        setEditingOrder(null);
                                                                        setOrderFormData({});
                                                                    }}
                                                                    className="p-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => {
                                                                    setEditingOrder(order._id);
                                                                    setOrderFormData({
                                                                        [order._id]: {
                                                                            deliveryStatus: order.deliveryStatus,
                                                                            trackingNumber: order.trackingNumber || '',
                                                                            notes: order.notes || ''
                                                                        }
                                                                    });
                                                                }}
                                                                className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                                            >
                                                                <Edit2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {ordersPagination && (
                                    <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
                                        <button
                                            onClick={() => setOrdersPage(ordersPage - 1)}
                                            disabled={ordersPage === 1}
                                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                            Previous
                                        </button>
                                        <span className="text-sm font-medium text-gray-700">
                                            Page {ordersPage} of {ordersPagination.pages}
                                        </span>
                                        <button
                                            onClick={() => setOrdersPage(ordersPage + 1)}
                                            disabled={ordersPage === ordersPagination.pages}
                                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Next
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Users Tab */}
                    {activeTab === 'users' && (
                        <div className="space-y-6">
                            {/* Filters */}
                            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search users..."
                                            value={usersSearch}
                                            onChange={(e) => {
                                                setUsersSearch(e.target.value);
                                                setUsersPage(1);
                                            }}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <select
                                        value={usersRoleFilter}
                                        onChange={(e) => {
                                            setUsersRoleFilter(e.target.value);
                                            setUsersPage(1);
                                        }}
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">All Roles</option>
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                            </div>

                            {/* Users Table */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Name</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Email</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Phone</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Role</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Verified</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Orders</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Joined</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {users.map((userItem) => (
                                                <tr key={userItem._id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">{userItem.name}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-600">{userItem.email}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-600">{userItem.phone || '-'}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <select
                                                            value={userItem.role}
                                                            onChange={(e) => handleUpdateUserRole(userItem._id, e.target.value)}
                                                            disabled={userItem._id === user?.id}
                                                            className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            <option value="user">User</option>
                                                            <option value="admin">Admin</option>
                                                        </select>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {userItem.emailVerified ? (
                                                            <span className="text-green-600 font-semibold text-sm">✓ Verified</span>
                                                        ) : (
                                                            <span className="text-red-600 font-semibold text-sm">✗ Not Verified</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="text-sm font-medium text-gray-900">{userItem.orders?.length || 0}</span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                        {formatDate(userItem.createdAt)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <button
                                                            onClick={() => handleDeleteUser(userItem._id)}
                                                            disabled={userItem._id === user?.id}
                                                            className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {usersPagination && (
                                    <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
                                        <button
                                            onClick={() => setUsersPage(usersPage - 1)}
                                            disabled={usersPage === 1}
                                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                            Previous
                                        </button>
                                        <span className="text-sm font-medium text-gray-700">
                                            Page {usersPage} of {usersPagination.pages}
                                        </span>
                                        <button
                                            onClick={() => setUsersPage(usersPage + 1)}
                                            disabled={usersPage === usersPagination.pages}
                                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Next
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Blogs Tab */}
                    {activeTab === 'blogs' && (
                        <div className="space-y-6">
                            {/* Blog Stats */}
                            {blogStats && (
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                                        <h3 className="text-sm font-medium text-gray-600 mb-1">Total Blogs</h3>
                                        <p className="text-2xl font-bold text-gray-900">{blogStats.totalBlogs}</p>
                                    </div>
                                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                                        <h3 className="text-sm font-medium text-gray-600 mb-1">Published</h3>
                                        <p className="text-2xl font-bold text-green-600">{blogStats.publishedBlogs}</p>
                                    </div>
                                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                                        <h3 className="text-sm font-medium text-gray-600 mb-1">Drafts</h3>
                                        <p className="text-2xl font-bold text-yellow-600">{blogStats.draftBlogs}</p>
                                    </div>
                                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                                        <h3 className="text-sm font-medium text-gray-600 mb-1">Total Views</h3>
                                        <p className="text-2xl font-bold text-blue-600">{blogStats.totalViews}</p>
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex justify-end">
                                <button
                                    onClick={() => {
                                        setCurrentBlog({
                                            status: 'draft',
                                            category: 'Company News',
                                            author: { name: 'HS Global Team', avatar: '' },
                                            tags: []
                                        });
                                        setIsEditingBlog(false);
                                        setShowBlogModal(true);
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add New Blog
                                </button>
                            </div>

                            {/* Blogs Table */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Title</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Category</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Views</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {blogs.map((blog) => (
                                                <tr key={blog._id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm font-medium text-gray-900 line-clamp-1">{blog.title}</div>
                                                        <div className="text-xs text-gray-500 line-clamp-1">/{blog.slug}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                                                            {blog.category}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${blog.status === 'published' ? 'bg-green-100 text-green-800' :
                                                            blog.status === 'archived' ? 'bg-red-100 text-red-800' :
                                                                'bg-yellow-100 text-yellow-800'
                                                            }`}>
                                                            {blog.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                        {blog.views.toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                        {formatDate(blog.publishedAt || blog.createdAt)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    setCurrentBlog(blog);
                                                                    setIsEditingBlog(true);
                                                                    setShowBlogModal(true);
                                                                }}
                                                                className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                                            >
                                                                <Edit2 className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteBlog(blog._id)}
                                                                className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {blogsPagination && (
                                    <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
                                        <button
                                            onClick={() => setBlogsPage(blogsPage - 1)}
                                            disabled={blogsPage === 1}
                                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                            Previous
                                        </button>
                                        <span className="text-sm font-medium text-gray-700">
                                            Page {blogsPage} of {blogsPagination.totalPages}
                                        </span>
                                        <button
                                            onClick={() => setBlogsPage(blogsPage + 1)}
                                            disabled={blogsPage === blogsPagination.totalPages}
                                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Next
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Contacts Tab */}
                    {activeTab === 'contacts' && (
                        <div className="space-y-6">
                            {/* Stats Cards */}
                            {contactStats && (
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                                        <h3 className="text-sm font-medium text-gray-600 mb-1">Total Inquiries</h3>
                                        <p className="text-2xl font-bold text-gray-900">{contactStats.total}</p>
                                    </div>
                                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                                        <h3 className="text-sm font-medium text-gray-600 mb-1">Today</h3>
                                        <p className="text-2xl font-bold text-blue-600">{contactStats.today}</p>
                                    </div>
                                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                                        <h3 className="text-sm font-medium text-gray-600 mb-1">New</h3>
                                        <p className="text-2xl font-bold text-green-600">{contactStats.byStatus.new || 0}</p>
                                    </div>
                                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                                        <h3 className="text-sm font-medium text-gray-600 mb-1">Replied</h3>
                                        <p className="text-2xl font-bold text-purple-600">{contactStats.byStatus.replied || 0}</p>
                                    </div>
                                </div>
                            )}

                            {/* Filter */}
                            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                                <select
                                    value={contactsStatusFilter}
                                    onChange={(e) => {
                                        setContactsStatusFilter(e.target.value);
                                        setContactsPage(1);
                                    }}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">All Status</option>
                                    <option value="new">New</option>
                                    <option value="read">Read</option>
                                    <option value="replied">Replied</option>
                                    <option value="archived">Archived</option>
                                </select>
                            </div>

                            {/* Contacts Table */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Name</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Email</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Subject</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {contacts.map((contact) => (
                                                <tr key={contact._id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">{contact.name}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-600">{contact.email}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm text-gray-900 max-w-xs truncate">{contact.subject}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${contact.status === 'new' ? 'bg-green-100 text-green-800' :
                                                            contact.status === 'read' ? 'bg-blue-100 text-blue-800' :
                                                                contact.status === 'replied' ? 'bg-purple-100 text-purple-800' :
                                                                    'bg-gray-100 text-gray-800'
                                                            }`}>
                                                            {contact.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                        {formatDate(contact.createdAt)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleViewContact(contact._id)}
                                                                className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                                                title="View Details"
                                                            >
                                                                <Mail className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteContact(contact._id)}
                                                                className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                                                                title="Delete"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {contactsPagination && (
                                    <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
                                        <button
                                            onClick={() => setContactsPage(contactsPage - 1)}
                                            disabled={contactsPage === 1}
                                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                            Previous
                                        </button>
                                        <span className="text-sm font-medium text-gray-700">
                                            Page {contactsPage} of {contactsPagination.pages}
                                        </span>
                                        <button
                                            onClick={() => setContactsPage(contactsPage + 1)}
                                            disabled={contactsPage === contactsPagination.pages}
                                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Next
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Contact Detail Modal */}
                    {showContactModal && selectedContact && isMounted && typeof document !== 'undefined' && document.body && createPortal(
                        <div
                            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                            onClick={() => {
                                setShowContactModal(false);
                                setSelectedContact(null);
                            }}
                            onWheel={(e) => e.preventDefault()}
                            onTouchMove={(e) => e.preventDefault()}
                        >
                            <div
                                className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                                onClick={(e) => e.stopPropagation()}
                                onWheel={(e) => e.stopPropagation()}
                                onTouchMove={(e) => e.stopPropagation()}
                            >
                                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                                    <h2 className="text-xl font-semibold text-gray-900">Contact Inquiry Details</h2>
                                    <button
                                        onClick={() => {
                                            setShowContactModal(false);
                                            setSelectedContact(null);
                                        }}
                                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                    >
                                        <X className="w-5 h-5 text-gray-500" />
                                    </button>
                                </div>

                                <div className="p-6 space-y-6">
                                    {/* Contact Info */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                            <p className="text-gray-900">{selectedContact.name}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                            <a href={`mailto:${selectedContact.email}`} className="text-blue-600 hover:underline">
                                                {selectedContact.email}
                                            </a>
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                                            <p className="text-gray-900">{selectedContact.subject}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                <p className="text-gray-900 whitespace-pre-wrap">{selectedContact.message}</p>
                                            </div>
                                        </div>
                                        {selectedContact.referenceImage && (
                                            <div className="col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Reference Image</label>
                                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                    <img
                                                        src={selectedContact.referenceImage}
                                                        alt="Reference"
                                                        className="max-w-full h-auto rounded-lg border border-gray-300"
                                                        style={{ maxHeight: '400px' }}
                                                    />
                                                    <a
                                                        href={selectedContact.referenceImage}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-block mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
                                                    >
                                                        View Full Size →
                                                    </a>
                                                </div>
                                            </div>
                                        )}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                            <select
                                                value={selectedContact.status}
                                                onChange={(e) => setSelectedContact({ ...selectedContact, status: e.target.value as any })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            >
                                                <option value="new">New</option>
                                                <option value="read">Read</option>
                                                <option value="replied">Replied</option>
                                                <option value="archived">Archived</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Submitted</label>
                                            <p className="text-gray-900">{formatDate(selectedContact.createdAt)}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Admin Notes</label>
                                            <textarea
                                                value={selectedContact.adminNotes || ''}
                                                onChange={(e) => setSelectedContact({ ...selectedContact, adminNotes: e.target.value })}
                                                rows={3}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                placeholder="Add internal notes..."
                                            />
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                                        <button
                                            onClick={() => {
                                                setShowContactModal(false);
                                                setSelectedContact(null);
                                            }}
                                            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => handleUpdateContactStatus(selectedContact._id, selectedContact.status, selectedContact.adminNotes)}
                                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            Update Status
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        , document.body)}

                    {/* Quotations Tab */}
                    {activeTab === 'quotations' && (
                        <div className="space-y-6">
                            {/* Stats Cards */}
                            {quotationStats && (
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                                        <h3 className="text-sm font-medium text-gray-600 mb-1">Total Requests</h3>
                                        <p className="text-2xl font-bold text-gray-900">{quotationStats.total}</p>
                                    </div>
                                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                                        <h3 className="text-sm font-medium text-gray-600 mb-1">Today</h3>
                                        <p className="text-2xl font-bold text-blue-600">{quotationStats.today}</p>
                                    </div>
                                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                                        <h3 className="text-sm font-medium text-gray-600 mb-1">New</h3>
                                        <p className="text-2xl font-bold text-green-600">{quotationStats.byStatus.new || 0}</p>
                                    </div>
                                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                                        <h3 className="text-sm font-medium text-gray-600 mb-1">Quoted</h3>
                                        <p className="text-2xl font-bold text-purple-600">{quotationStats.byStatus.quoted || 0}</p>
                                    </div>
                                </div>
                            )}

                            {/* Filter */}
                            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                                <select
                                    value={quotationsStatusFilter}
                                    onChange={(e) => {
                                        setQuotationsStatusFilter(e.target.value);
                                        setQuotationsPage(1);
                                    }}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">All Status</option>
                                    <option value="new">New</option>
                                    <option value="quoted">Quoted</option>
                                    <option value="contacted">Contacted</option>
                                    <option value="archived">Archived</option>
                                </select>
                            </div>

                            {/* Quotations Table */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Customer</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Contact</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Product</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Specs</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {quotations.map((quotation) => (
                                                <tr key={quotation._id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">{quotation.name}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm text-gray-600">{quotation.email}</div>
                                                        <div className="text-xs text-gray-500">{quotation.mobile}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm text-gray-900 max-w-xs truncate">{quotation.productName}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-xs text-gray-600">
                                                            <div>Finish: {quotation.finish}</div>
                                                            <div>Thickness: {quotation.thickness}</div>
                                                            <div>Qty: {quotation.requirement} sq ft</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${quotation.status === 'new' ? 'bg-green-100 text-green-800' :
                                                            quotation.status === 'quoted' ? 'bg-purple-100 text-purple-800' :
                                                                quotation.status === 'contacted' ? 'bg-blue-100 text-blue-800' :
                                                                    'bg-gray-100 text-gray-800'
                                                            }`}>
                                                            {quotation.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                        {formatDate(quotation.createdAt)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleViewQuotation(quotation._id)}
                                                                className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                                                title="View Details"
                                                            >
                                                                <FileText className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteQuotation(quotation._id)}
                                                                className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                                                                title="Delete"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {quotationsPagination && (
                                    <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
                                        <button
                                            onClick={() => setQuotationsPage(quotationsPage - 1)}
                                            disabled={quotationsPage === 1}
                                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                            Previous
                                        </button>
                                        <span className="text-sm font-medium text-gray-700">
                                            Page {quotationsPage} of {quotationsPagination.pages}
                                        </span>
                                        <button
                                            onClick={() => setQuotationsPage(quotationsPage + 1)}
                                            disabled={quotationsPage === quotationsPagination.pages}
                                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Next
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Quotation Detail Modal */}
                    {showQuotationModal && selectedQuotation && isMounted && typeof document !== 'undefined' && document.body && createPortal(
                        <div
                            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                            onClick={() => {
                                setShowQuotationModal(false);
                                setSelectedQuotation(null);
                            }}
                            onWheel={(e) => e.preventDefault()}
                            onTouchMove={(e) => e.preventDefault()}
                        >
                            <div
                                className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                                onClick={(e) => e.stopPropagation()}
                                onWheel={(e) => e.stopPropagation()}
                                onTouchMove={(e) => e.stopPropagation()}
                            >
                                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                                    <h2 className="text-xl font-semibold text-gray-900">Quotation Request Details</h2>
                                    <button
                                        onClick={() => {
                                            setShowQuotationModal(false);
                                            setSelectedQuotation(null);
                                        }}
                                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                    >
                                        <X className="w-5 h-5 text-gray-500" />
                                    </button>
                                </div>

                                <div className="p-6 space-y-6">
                                    {/* Customer Info */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                            <p className="text-gray-900">{selectedQuotation.name}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                            <p className="text-gray-900">{selectedQuotation.email}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
                                            <p className="text-gray-900">{selectedQuotation.mobile}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                            <select
                                                value={selectedQuotation.status}
                                                onChange={(e) => setSelectedQuotation({ ...selectedQuotation, status: e.target.value as any })}
                                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="new">New</option>
                                                <option value="quoted">Quoted</option>
                                                <option value="contacted">Contacted</option>
                                                <option value="archived">Archived</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Product Specifications */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Product Specifications</h3>
                                        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Product:</span>
                                                <span className="font-medium">{selectedQuotation.productName}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Finish:</span>
                                                <span className="font-medium">{selectedQuotation.finish}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Thickness:</span>
                                                <span className="font-medium">{selectedQuotation.thickness}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Requirement:</span>
                                                <span className="font-medium">{selectedQuotation.requirement} sq ft</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Admin Notes */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Admin Notes</label>
                                        <textarea
                                            value={selectedQuotation.adminNotes || ''}
                                            onChange={(e) => setSelectedQuotation({ ...selectedQuotation, adminNotes: e.target.value })}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            placeholder="Add internal notes..."
                                        />
                                    </div>

                                    {/* Quoted Price */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Quoted Price (₹)</label>
                                        <input
                                            type="number"
                                            value={selectedQuotation.quotedPrice || ''}
                                            onChange={(e) => setSelectedQuotation({ ...selectedQuotation, quotedPrice: parseFloat(e.target.value) })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            placeholder="Enter quoted price"
                                        />
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-3 pt-4 border-t">
                                        <button
                                            onClick={() => handleUpdateQuotationStatus(
                                                selectedQuotation._id,
                                                selectedQuotation.status,
                                                selectedQuotation.adminNotes,
                                                selectedQuotation.quotedPrice
                                            )}
                                            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                                        >
                                            Update Quotation
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowQuotationModal(false);
                                                setSelectedQuotation(null);
                                            }}
                                            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        , document.body)}


                    {/* Reviews Tab */}
                    {activeTab === 'reviews' && (
                        <div className="space-y-6">
                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                                    <h3 className="text-sm font-medium text-gray-600 mb-1">Total Reviews</h3>
                                    <p className="text-2xl font-bold text-gray-900">{reviewsTotal}</p>
                                </div>
                                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                                    <h3 className="text-sm font-medium text-gray-600 mb-1">Pending</h3>
                                    <p className="text-2xl font-bold text-yellow-600">
                                        {reviews.filter(r => r.status === 'pending').length}
                                    </p>
                                </div>
                                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                                    <h3 className="text-sm font-medium text-gray-600 mb-1">Approved</h3>
                                    <p className="text-2xl font-bold text-green-600">
                                        {reviews.filter(r => r.status === 'approved').length}
                                    </p>
                                </div>
                                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                                    <h3 className="text-sm font-medium text-gray-600 mb-1">Rejected</h3>
                                    <p className="text-2xl font-bold text-red-600">
                                        {reviews.filter(r => r.status === 'rejected').length}
                                    </p>
                                </div>
                            </div>

                            {/* Filter */}
                            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                                <select
                                    value={reviewsStatusFilter}
                                    onChange={(e) => {
                                        setReviewsStatusFilter(e.target.value);
                                        setReviewsPage(1);
                                    }}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </div>

                            {/* Reviews Table */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Product</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Customer</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Rating</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Review</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {reviews.map((review) => (
                                                <tr key={review._id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">{review.productId}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm text-gray-900">{review.userName}</div>
                                                        <div className="text-xs text-gray-500">{review.userEmail}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                <Star
                                                                    key={star}
                                                                    className={`w-4 h-4 ${star <= review.rating
                                                                        ? 'fill-yellow-400 text-yellow-400'
                                                                        : 'text-gray-300'
                                                                        }`}
                                                                />
                                                            ))}
                                                            <span className="ml-2 text-sm text-gray-600">{review.rating}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm font-medium text-gray-900 mb-1">{review.title}</div>
                                                        <div className="text-sm text-gray-600 max-w-xs truncate">{review.comment}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${review.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                            review.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                                'bg-red-100 text-red-800'
                                                            }`}>
                                                            {review.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                        {formatDate(review.createdAt)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex gap-2">
                                                            {review.status === 'pending' && (
                                                                <>
                                                                    <button
                                                                        onClick={async () => {
                                                                            try {
                                                                                await reviewService.approveReview(review._id, token!);
                                                                                loadData();
                                                                            } catch (error: any) {
                                                                                alert(error.message);
                                                                            }
                                                                        }}
                                                                        className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                                                                        title="Approve"
                                                                    >
                                                                        <Save className="w-4 h-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={async () => {
                                                                            try {
                                                                                await reviewService.rejectReview(review._id, token!);
                                                                                loadData();
                                                                            } catch (error: any) {
                                                                                alert(error.message);
                                                                            }
                                                                        }}
                                                                        className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                                                                        title="Reject"
                                                                    >
                                                                        <X className="w-4 h-4" />
                                                                    </button>
                                                                </>
                                                            )}
                                                            <button
                                                                onClick={async () => {
                                                                    if (!confirm('Are you sure you want to delete this review?')) return;
                                                                    try {
                                                                        await reviewService.deleteReview(review._id, token!);
                                                                        loadData();
                                                                    } catch (error: any) {
                                                                        alert(error.message);
                                                                    }
                                                                }}
                                                                className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                                                                title="Delete"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
                                    <button
                                        onClick={() => setReviewsPage(reviewsPage - 1)}
                                        disabled={reviewsPage === 1}
                                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                        Previous
                                    </button>
                                    <span className="text-sm font-medium text-gray-700">
                                        Page {reviewsPage}
                                    </span>
                                    <button
                                        onClick={() => setReviewsPage(reviewsPage + 1)}
                                        disabled={!reviewsHasMore}
                                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Next
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Products Tab */}
                    {activeTab === 'products' && (
                        <div className="space-y-6">
                            {/* Header with Add Button */}
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold text-gray-900">Product Management</h2>
                                <div className="flex gap-2">
                                    {selectedProductIds.length > 0 && (
                                        <button
                                            onClick={() => setShowBulkDiscountModal(true)}
                                            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                                        >
                                            <DollarSign className="w-5 h-5" />
                                            Apply Discount ({selectedProductIds.length})
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleOpenProductModal()}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                                    >
                                        <Plus className="w-5 h-5" />
                                        Add Product
                                    </button>
                                </div>
                            </div>

                            {/* Filters */}
                            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="relative">
                                        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${productsLoading ? 'text-blue-500' : 'text-gray-400'} ${productsLoading ? 'animate-pulse' : ''}`} />
                                        <input
                                            type="text"
                                            placeholder="Search products..."
                                            value={productsSearch}
                                            onChange={(e) => {
                                                setProductsSearch(e.target.value);
                                                setProductsPage(1);
                                            }}
                                            className={`w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 ${productsLoading ? 'bg-gray-50' : ''}`}
                                        />
                                        {productsLoading && (
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                                            </div>
                                        )}
                                    </div>
                                    <select
                                        value={productsCategoryFilter}
                                        onChange={(e) => {
                                            setProductsCategoryFilter(e.target.value);
                                            setProductsPage(1);
                                        }}
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">All Categories</option>
                                        <option value="furniture">Furniture</option>
                                        <option value="slabs">Slabs</option>
                                    </select>
                                    <select
                                        value={productsStatusFilter}
                                        onChange={(e) => {
                                            setProductsStatusFilter(e.target.value);
                                            setProductsPage(1);
                                        }}
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">All Statuses</option>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="draft">Draft</option>
                                    </select>
                                </div>
                            </div>

                            {/* Products Table */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden relative">
                                {/* Loading overlay */}
                                {productsLoading && (
                                    <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                                            <span className="text-gray-600">Loading products...</span>
                                        </div>
                                    </div>
                                )}
                                
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    <input
                                                        type="checkbox"
                                                        onChange={handleSelectAllProducts}
                                                        checked={products.length > 0 && selectedProductIds.length === products.length}
                                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                                    />
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {products.map((product) => (
                                                <tr key={product._id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedProductIds.includes(product.productId)}
                                                            onChange={() => handleSelectProduct(product.productId)}
                                                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="relative">
                                                            <img
                                                                src={product.image}
                                                                alt={product.name}
                                                                className="w-16 h-16 object-cover rounded-lg"
                                                            />
                                                            {product.hasVideo && (
                                                                <div className="absolute -top-1 -right-1 bg-purple-600 text-white rounded-full p-1" title="Has video">
                                                                    <Play className="w-3 h-3" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div>
                                                            <p className="font-medium text-gray-900">{product.name}</p>
                                                            <p className="text-sm text-gray-500">{product.productId}</p>
                                                            <p className="text-sm text-gray-500">{product.subcategory}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full capitalize">
                                                            {product.category}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div>
                                                            {product.priceINR ? (
                                                                <>
                                                                    {product.discount?.enabled && product.discount.percentage > 0 ? (
                                                                        <div>
                                                                            <div className="text-sm font-medium text-green-600">
                                                                                {formatCurrency(Math.round(product.priceINR * (1 - product.discount.percentage / 100)))}
                                                                            </div>
                                                                            <div className="text-xs text-gray-500 line-through">
                                                                                {formatCurrency(product.priceINR)}
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="text-sm font-medium text-gray-900">
                                                                            {formatCurrency(product.priceINR)}
                                                                        </div>
                                                                    )}
                                                                </>
                                                            ) : 'N/A'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {(() => {
                                                            if (!product.discount?.enabled || !product.discount.percentage) {
                                                                return <span className="text-xs text-gray-400">—</span>;
                                                            }

                                                            const now = new Date();
                                                            const startDate = product.discount.startDate ? new Date(product.discount.startDate) : null;
                                                            const endDate = product.discount.endDate ? new Date(product.discount.endDate) : null;

                                                            if (startDate && now < startDate) {
                                                                const daysUntil = Math.ceil((startDate - now) / (1000 * 60 * 60 * 24));
                                                                return (
                                                                    <div>
                                                                        <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                                                                            Scheduled
                                                                        </span>
                                                                        <div className="text-xs text-gray-500 mt-1">
                                                                            {product.discount.percentage}% in {daysUntil}d
                                                                        </div>
                                                                    </div>
                                                                );
                                                            } else if (endDate && now > endDate) {
                                                                return (
                                                                    <div>
                                                                        <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                                                                            Expired
                                                                        </span>
                                                                        <div className="text-xs text-gray-500 mt-1">
                                                                            {product.discount.percentage}%
                                                                        </div>
                                                                    </div>
                                                                );
                                                            } else {
                                                                const daysRemaining = endDate ? Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)) : null;
                                                                return (
                                                                    <div>
                                                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${daysRemaining && daysRemaining <= 3
                                                                                ? 'bg-orange-100 text-orange-800'
                                                                                : 'bg-green-100 text-green-800'
                                                                            }`}>
                                                                            {product.discount.percentage}% OFF
                                                                        </span>
                                                                        {daysRemaining && (
                                                                            <div className={`text-xs mt-1 ${daysRemaining <= 3 ? 'text-orange-600 font-medium' : 'text-gray-500'
                                                                                }`}>
                                                                                {daysRemaining}d left
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                );
                                                            }
                                                        })()}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${product.status === 'active' ? 'bg-green-100 text-green-800' :
                                                            product.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                                                                'bg-yellow-100 text-yellow-800'
                                                            }`}>
                                                            {product.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => handleOpenProductModal(product)}
                                                                disabled={editingProductId === product.productId}
                                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                                title="Edit product"
                                                            >
                                                                {editingProductId === product.productId ? (
                                                                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                    </svg>
                                                                ) : (
                                                                    <Edit2 className="w-4 h-4" />
                                                                )}
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteProduct(product.productId)}
                                                                disabled={deletingProductId === product.productId}
                                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative"
                                                                title="Delete product"
                                                            >
                                                                {deletingProductId === product.productId ? (
                                                                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                    </svg>
                                                                ) : (
                                                                    <Trash2 className="w-4 h-4" />
                                                                )}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            
                                            {/* Empty state */}
                                            {!productsLoading && products.length === 0 && (
                                                <tr>
                                                    <td colSpan={8} className="px-6 py-12 text-center">
                                                        <div className="flex flex-col items-center justify-center space-y-3">
                                                            <Package className="w-12 h-12 text-gray-400" />
                                                            <div className="text-gray-500">
                                                                <p className="text-lg font-medium">No products found</p>
                                                                <p className="text-sm">
                                                                    {productsSearch || productsCategoryFilter || productsStatusFilter
                                                                        ? 'Try adjusting your filters or search terms'
                                                                        : 'Get started by adding your first product'
                                                                    }
                                                                </p>
                                                            </div>
                                                            {!productsSearch && !productsCategoryFilter && !productsStatusFilter && (
                                                                <button
                                                                    onClick={() => handleOpenProductModal()}
                                                                    className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                                                                >
                                                                    Add Product
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {productsPagination && productsPagination.total > 1 && (
                                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                                        <div className="text-sm text-gray-700">
                                            Showing {products.length} of {productsPagination.totalItems} products
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setProductsPage(Math.max(1, productsPage - 1))}
                                                disabled={productsPage === 1}
                                                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <ChevronLeft className="w-5 h-5" />
                                            </button>
                                            <span className="px-4 py-2 text-sm font-medium text-gray-700">
                                                Page {productsPage} of {productsPagination.total}
                                            </span>
                                            <button
                                                onClick={() => setProductsPage(Math.min(productsPagination.total, productsPage + 1))}
                                                disabled={productsPage === productsPagination.total}
                                                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <ChevronRight className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Product Modal */}
                    {showProductModal && isMounted && typeof document !== 'undefined' && document.body && createPortal(
                        <div
                            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                            aria-modal="true"
                            role="dialog"
                            onClick={handleCloseProductModal}
                            onWheel={(e) => e.preventDefault()}
                            onTouchMove={(e) => e.preventDefault()}
                        >
                            {/* Modal Container - Fixed height constraint */}
                            <div
                                className="bg-white rounded-xl shadow-2xl w-full max-w-6xl flex flex-col relative animate-in fade-in zoom-in-95 duration-200"
                                style={{ height: '90vh', maxHeight: '1000px' }}
                                onClick={(e) => e.stopPropagation()}
                                onWheel={(e) => e.stopPropagation()}
                                onTouchMove={(e) => e.stopPropagation()}
                            >
                                <div className="flex-none p-6 border-b border-gray-200 flex justify-between items-center bg-white z-10 rounded-t-xl">
                                    <h2 className="text-xl font-bold text-gray-900">
                                        {editingProduct ? 'Edit Product' : 'Create New Product'}
                                    </h2>
                                    <button
                                        onClick={handleCloseProductModal}
                                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                    >
                                        <X className="w-5 h-5 text-gray-500" />
                                    </button>
                                </div>

                                <div className="flex-1 min-h-0 overflow-hidden">
                                    <EnhancedProductForm
                                        editingProduct={editingProduct}
                                        loading={productLoading}
                                        previewLoading={previewLoading}
                                        onSave={async (productData, images, customSpecs, video) => {
                                            try {
                                                setProductLoading(true);
                                                // Extract File objects from ProductImage array (new images only)
                                                const newImageFiles = images
                                                    .filter(img => img.file && !img.isExisting)
                                                    .map(img => img.file!);

                                                // Extract existing image URLs
                                                const existingImageUrls = images
                                                    .filter(img => img.isExisting && img.url)
                                                    .map(img => img.url);

                                                // Add existing images to productData
                                                const finalProductData = {
                                                    ...productData,
                                                    existingImages: existingImageUrls
                                                };

                                                if (editingProduct) {
                                                    await adminProductService.updateProduct(
                                                        editingProduct.productId,
                                                        finalProductData,
                                                        newImageFiles,
                                                        video || null, // video file
                                                        !video // removeVideo flag
                                                    );
                                                } else {
                                                    await adminProductService.createProduct(
                                                        finalProductData,
                                                        newImageFiles,
                                                        video || null // video file
                                                    );
                                                }
                                                await loadData();
                                                setShowProductModal(false);
                                                setEditingProduct(null);
                                            } catch (error) {
                                                console.error('Error saving product:', error);
                                                throw error;
                                            } finally {
                                                setProductLoading(false);
                                            }
                                        }}
                                        onCancel={handleCloseProductModal}
                                        onPreview={async (productData, images, video) => {
                                            try {
                                                setPreviewLoading(true);

                                                // Extract File objects from ProductImage array (new images only)
                                                const newImageFiles = images
                                                    .filter(img => img.file && !img.isExisting)
                                                    .map(img => img.file!);

                                                // Extract existing image URLs
                                                const existingImageUrls = images
                                                    .filter(img => img.isExisting && img.url)
                                                    .map(img => img.url);

                                                const response = await adminProductService.previewProduct(
                                                    productData,
                                                    newImageFiles,
                                                    undefined, // video
                                                    existingImageUrls
                                                );
                                                if (response.success) {
                                                    setPreviewProduct(response.data);
                                                    setShowProductPreview(true);
                                                }
                                            } catch (error) {
                                                console.error('Error previewing product:', error);
                                                alert('Failed to generate preview');
                                                throw error;
                                            } finally {
                                                setPreviewLoading(false);
                                            }
                                        }}
                                        loading={productLoading}
                                        previewLoading={previewLoading}
                                    />
                                </div>
                            </div>
                        </div>
                        , document.body)}

                    {/* Bulk Discount Modal */}
                    {showBulkDiscountModal && isMounted && typeof document !== 'undefined' && document.body && createPortal(
                        <div
                            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                            onClick={() => setShowBulkDiscountModal(false)}
                            onWheel={(e) => e.preventDefault()}
                            onTouchMove={(e) => e.preventDefault()}
                        >
                            <div
                                className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col relative animate-in fade-in zoom-in-95 duration-200"
                                style={{ height: '85vh', maxHeight: '900px' }}
                                onClick={(e) => e.stopPropagation()}
                                onWheel={(e) => e.stopPropagation()}
                                onTouchMove={(e) => e.stopPropagation()}
                            >
                                <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10 rounded-t-xl">
                                    <h2 className="text-xl font-bold text-gray-900">
                                        Apply Bulk Discount
                                    </h2>
                                    <button
                                        onClick={() => setShowBulkDiscountModal(false)}
                                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                    >
                                        <X className="w-5 h-5 text-gray-500" />
                                    </button>
                                </div>

                                <div className="p-6 space-y-6 overflow-y-auto overscroll-contain custom-scrollbar">
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <p className="text-sm text-blue-800">
                                            Applying discount to <strong>{selectedProductIds.length}</strong> selected products.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2">
                                            <label className="flex items-center gap-2 cursor-pointer mb-4">
                                                <input
                                                    type="checkbox"
                                                    checked={bulkDiscountData.enabled}
                                                    onChange={(e) => setBulkDiscountData({ ...bulkDiscountData, enabled: e.target.checked })}
                                                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                                />
                                                <span className="font-medium text-gray-900">Enable Discount</span>
                                            </label>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Percentage (%)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={bulkDiscountData.percentage}
                                                onChange={(e) => setBulkDiscountData({ ...bulkDiscountData, percentage: parseFloat(e.target.value) })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Summer Sale"
                                                value={bulkDiscountData.description || ''}
                                                onChange={(e) => setBulkDiscountData({ ...bulkDiscountData, description: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                            <input
                                                type="datetime-local"
                                                value={bulkDiscountData.startDate || ''}
                                                onChange={(e) => setBulkDiscountData({ ...bulkDiscountData, startDate: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                            <input
                                                type="datetime-local"
                                                value={bulkDiscountData.endDate || ''}
                                                onChange={(e) => setBulkDiscountData({ ...bulkDiscountData, endDate: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-6 border-t border-gray-200">
                                        <button
                                            onClick={handleBulkApplyDiscount}
                                            disabled={bulkDiscountLoading}
                                            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                        >
                                            {bulkDiscountLoading && (
                                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                            )}
                                            {bulkDiscountLoading ? 'Applying discount...' : 'Apply Discount'}
                                        </button>
                                        <button
                                            onClick={() => setShowBulkDiscountModal(false)}
                                            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        , document.body)}


                    {/* Blog Editor Modal */}
                    {showBlogModal && isMounted && typeof document !== 'undefined' && document.body && createPortal(
                        <div
                            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                            onClick={() => setShowBlogModal(false)}
                            onWheel={(e) => e.preventDefault()}
                            onTouchMove={(e) => e.preventDefault()}
                        >
                            <div
                                className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col relative animate-in fade-in zoom-in-95 duration-200"
                                style={{ height: '85vh', maxHeight: '900px' }}
                                onClick={(e) => e.stopPropagation()}
                                onWheel={(e) => e.stopPropagation()}
                                onTouchMove={(e) => e.stopPropagation()}
                            >
                                <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10 rounded-t-xl">
                                    <h2 className="text-xl font-bold text-gray-900">
                                        {isEditingBlog ? 'Edit Blog' : 'Create New Blog'}
                                    </h2>
                                    <button
                                        onClick={() => setShowBlogModal(false)}
                                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                    >
                                        <X className="w-5 h-5 text-gray-500" />
                                    </button>
                                </div>

                                <form onSubmit={handleSaveBlog} className="flex-1 min-h-0 p-6 space-y-6 overflow-y-auto overscroll-contain custom-scrollbar">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                            <input
                                                type="text"
                                                required
                                                value={currentBlog.title || ''}
                                                onChange={(e) => setCurrentBlog({ ...currentBlog, title: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                            <select
                                                required
                                                value={currentBlog.category || 'Company News'}
                                                onChange={(e) => setCurrentBlog({ ...currentBlog, category: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            >
                                                <option value="Industry News">Industry News</option>
                                                <option value="Product Updates">Product Updates</option>
                                                <option value="Design Trends">Design Trends</option>
                                                <option value="How-To Guides">How-To Guides</option>
                                                <option value="Company News">Company News</option>
                                                <option value="Case Studies">Case Studies</option>
                                            </select>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Featured Image URL</label>
                                            <input
                                                type="url"
                                                required
                                                value={currentBlog.featuredImage || ''}
                                                onChange={(e) => setCurrentBlog({ ...currentBlog, featuredImage: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
                                            <textarea
                                                required
                                                rows={3}
                                                value={currentBlog.excerpt || ''}
                                                onChange={(e) => setCurrentBlog({ ...currentBlog, excerpt: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Content (HTML supported)</label>
                                            <textarea
                                                required
                                                rows={12}
                                                value={currentBlog.content || ''}
                                                onChange={(e) => setCurrentBlog({ ...currentBlog, content: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                            <select
                                                value={currentBlog.status || 'draft'}
                                                onChange={(e) => setCurrentBlog({ ...currentBlog, status: e.target.value as any })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            >
                                                <option value="draft">Draft</option>
                                                <option value="published">Published</option>
                                                <option value="archived">Archived</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                                        <button
                                            type="button"
                                            onClick={() => setShowBlogModal(false)}
                                            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            {isEditingBlog ? 'Update Blog' : 'Create Blog'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                        , document.body)}

                    {/* Product Preview Modal */}
                    {showProductPreview && previewProduct && isMounted && typeof document !== 'undefined' && document.body && createPortal(
                        <div
                            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                            aria-modal="true"
                            role="dialog"
                            onClick={handleClosePreview}
                        >
                            <div
                                className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col relative animate-in fade-in zoom-in-95 duration-200"
                                style={{ height: '85vh', maxHeight: '900px' }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex-none p-6 border-b border-gray-200 flex justify-between items-center bg-white z-10 rounded-t-xl">
                                    <div className="flex items-center gap-3">
                                        <Layout className="w-6 h-6 text-blue-600" />
                                        <h2 className="text-xl font-bold text-gray-900">Product Preview</h2>
                                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full font-medium">
                                            Preview Mode
                                        </span>
                                    </div>
                                    <button
                                        onClick={handleClosePreview}
                                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                    >
                                        <X className="w-5 h-5 text-gray-500" />
                                    </button>
                                </div>

                                <div className="flex-1 min-h-0 p-6 space-y-6 overflow-y-auto overscroll-contain custom-scrollbar">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        {/* Product Images and Video */}
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-semibold text-gray-900">Images & Media</h3>

                                            {/* Main Image */}
                                            {previewProduct.image && (
                                                <div className="relative">
                                                    <img
                                                        src={previewProduct.image}
                                                        alt={previewProduct.name}
                                                        className="w-full h-80 object-cover rounded-lg border border-gray-200"
                                                    />
                                                    <div className="absolute top-2 left-2 px-2 py-1 bg-blue-600 text-white text-xs rounded font-semibold">
                                                        Main Image
                                                    </div>
                                                </div>
                                            )}

                                            {/* Image Gallery */}
                                            {previewProduct.images && previewProduct.images.length > 1 && (
                                                <div>
                                                    <h4 className="text-sm font-medium text-gray-700 mb-2">All Images</h4>
                                                    <div className="grid grid-cols-3 gap-2">
                                                        {previewProduct.images.slice(1).map((image, index) => (
                                                            <img
                                                                key={index}
                                                                src={image}
                                                                alt={`${previewProduct.name} ${index + 2}`}
                                                                className="w-full h-20 object-cover rounded border border-gray-200"
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Video */}
                                            {previewProduct.hasVideo && previewProduct.videoUrl && (
                                                <div>
                                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Product Video</h4>
                                                    <video
                                                        src={previewProduct.videoUrl}
                                                        controls
                                                        className="w-full max-h-60 rounded-lg border border-gray-200"
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        {/* Product Details */}
                                        <div className="space-y-6">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Details</h3>

                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-medium text-gray-500">Product ID:</span>
                                                        <span className="text-sm text-gray-900">{previewProduct.productId}</span>
                                                    </div>

                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-medium text-gray-500">Name:</span>
                                                        <span className="text-sm text-gray-900 font-medium">{previewProduct.name}</span>
                                                    </div>

                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-medium text-gray-500">Category:</span>
                                                        <span className="text-sm text-gray-900 capitalize">{previewProduct.category}</span>
                                                    </div>

                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-medium text-gray-500">Subcategory:</span>
                                                        <span className="text-sm text-gray-900 capitalize">{previewProduct.subcategory}</span>
                                                    </div>

                                                    {previewProduct.priceINR && (
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm font-medium text-gray-500">Price:</span>
                                                            <div className="text-right">
                                                                {previewProduct.discount?.enabled && previewProduct.discountedPrice ? (
                                                                    <>
                                                                        <span className="text-lg font-bold text-gray-900">
                                                                            ₹{previewProduct.discountedPrice.toLocaleString('en-IN')}
                                                                        </span>
                                                                        <br />
                                                                        <span className="text-sm text-gray-500 line-through">
                                                                            ₹{previewProduct.priceINR.toLocaleString('en-IN')}
                                                                        </span>
                                                                        <span className="ml-2 px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                                                                            {previewProduct.discount.percentage}% OFF
                                                                        </span>
                                                                    </>
                                                                ) : (
                                                                    <span className="text-lg font-bold text-gray-900">
                                                                        ₹{previewProduct.priceINR.toLocaleString('en-IN')}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-medium text-gray-500">Status:</span>
                                                        <span className={`text-sm px-2 py-1 rounded-full font-medium ${previewProduct.status === 'active'
                                                            ? 'bg-green-100 text-green-700'
                                                            : previewProduct.status === 'inactive'
                                                                ? 'bg-red-100 text-red-700'
                                                                : 'bg-yellow-100 text-yellow-700'
                                                            }`}>
                                                            {previewProduct.status?.charAt(0).toUpperCase() + previewProduct.status?.slice(1)}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-medium text-gray-500">Available:</span>
                                                        <span className={`text-sm px-2 py-1 rounded-full font-medium ${previewProduct.available
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-red-100 text-red-700'
                                                            }`}>
                                                            {previewProduct.available ? 'Yes' : 'No'}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-medium text-gray-500">Featured:</span>
                                                        <span className={`text-sm px-2 py-1 rounded-full font-medium ${previewProduct.featured
                                                            ? 'bg-amber-100 text-amber-700'
                                                            : 'bg-gray-100 text-gray-700'
                                                            }`}>
                                                            {previewProduct.featured ? 'Yes' : 'No'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Description */}
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-900 mb-2">Description</h4>
                                                <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-lg">
                                                    {previewProduct.description}
                                                </p>
                                            </div>

                                            {/* Discount Info */}
                                            {previewProduct.discount?.enabled && (
                                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                                    <h4 className="text-sm font-medium text-red-900 mb-2 flex items-center gap-2">
                                                        <Tag className="w-4 h-4" />
                                                        Active Discount
                                                    </h4>
                                                    <div className="space-y-1 text-sm text-red-800">
                                                        <p>Percentage: {previewProduct.discount.percentage}%</p>
                                                        {previewProduct.discount.description && (
                                                            <p>Description: {previewProduct.discount.description}</p>
                                                        )}
                                                        {previewProduct.discount.startDate && (
                                                            <p>Starts: {new Date(previewProduct.discount.startDate).toLocaleDateString()}</p>
                                                        )}
                                                        {previewProduct.discount.endDate && (
                                                            <p>Ends: {new Date(previewProduct.discount.endDate).toLocaleDateString()}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Preview Actions */}
                                    <div className="flex gap-3 pt-6 border-t border-gray-200">
                                        <button
                                            onClick={handleClosePreview}
                                            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                        >
                                            <X className="w-4 h-4" />
                                            Close Preview
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (confirm('This will close the preview and save the product. Continue?')) {
                                                    handleClosePreview();
                                                    handleSaveProduct();
                                                }
                                            }}
                                            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Save className="w-4 h-4" />
                                            Save Product
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        , document.body)}
                </div>
            </div>
        </>
    );
};

export default Admin;


