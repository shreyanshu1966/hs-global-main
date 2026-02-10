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
    Tag
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
import { getAllDiscounts, createDiscount, updateDiscount, deleteDiscount, toggleDiscountStatus, getDiscountAnalytics, Discount, DiscountFormData, DiscountAnalytics } from '../services/adminDiscountService';

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
    const [activeTab, setActiveTab] = useState<'analytics' | 'orders' | 'users' | 'blogs' | 'contacts' | 'quotations' | 'products' | 'reviews' | 'discounts'>('analytics');
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
    const [customSubcategories, setCustomSubcategories] = useState<{[categoryId: string]: Array<{id: string, name: string}>}>({});

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

    // Discounts state
    const [discounts, setDiscounts] = useState<Discount[]>([]);
    const [discountsPage, setDiscountsPage] = useState(1);
    const [discountsPagination, setDiscountsPagination] = useState<any>(null);
    const [discountsSearch, setDiscountsSearch] = useState('');
    const [discountsStatusFilter, setDiscountsStatusFilter] = useState('');
    const [discountsTypeFilter, setDiscountsTypeFilter] = useState('');
    const [discountAnalytics, setDiscountAnalytics] = useState<DiscountAnalytics | null>(null);
    const [showDiscountModal, setShowDiscountModal] = useState(false);
    const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
    const [discountFormData, setDiscountFormData] = useState<Partial<DiscountFormData>>({});
    const [applyToAllProducts, setApplyToAllProducts] = useState(false);

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/');
            return;
        }
        loadData();
    }, [user, navigate, activeTab, usersPage, ordersPage, usersSearch, usersRoleFilter, ordersSearch, ordersStatusFilter, ordersDeliveryFilter, blogsPage, contactsPage, contactsStatusFilter, quotationsPage, quotationsStatusFilter, productsPage, productsSearch, productsCategoryFilter, productsStatusFilter, reviewsPage, reviewsStatusFilter, discountsPage, discountsSearch, discountsStatusFilter, discountsTypeFilter]);

    // Lock body scroll when any modal is open
    // Lock body scroll when any modal is open
    useEffect(() => {
        if (typeof document === 'undefined') return;
        
        const isModalOpen = showProductModal || showBlogModal || showDiscountModal || showQuotationModal || showContactModal || showBulkDiscountModal || showProductPreview;
        
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
    }, [showProductModal, showBlogModal, showDiscountModal, showQuotationModal, showContactModal, showBulkDiscountModal, showProductPreview]);

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
                const productsData = await adminProductService.getAdminProducts({
                    page: productsPage,
                    limit: 10,
                    search: productsSearch,
                    category: productsCategoryFilter,
                    status: productsStatusFilter
                });
                setProducts(productsData.data);
                setProductsPagination(productsData.pagination);
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
            } else if (activeTab === 'discounts') {
                const [discountsData, analyticsData] = await Promise.all([
                    getAllDiscounts(discountsPage, 10, discountsSearch, discountsStatusFilter, discountsTypeFilter),
                    getDiscountAnalytics()
                ]);
                setDiscounts(discountsData.discounts);
                setDiscountsPagination(discountsData.pagination);
                setDiscountAnalytics(analyticsData);
            }
        } catch (error: any) {
            console.error('Failed to load data:', error);
            alert(error.message);
        } finally {
            setLoading(false);
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
    const handleOpenProductModal = (product?: Product) => {
        if (product) {
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
                } catch (error) {
                    console.warn('Failed to save custom subcategory:', error);
                    // Continue with product creation even if custom subcategory saving fails
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

        setProductLoading(true);
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
            setProductLoading(false);
        }
    };

    // Discount handlers
    const handleOpenDiscountModal = (discount?: Discount) => {
        if (discount) {
            setEditingDiscount(discount);
            setDiscountFormData({
                code: discount.code,
                description: discount.description,
                type: discount.type,
                value: discount.value,
                maxDiscount: discount.maxDiscount,
                minOrderAmount: discount.minOrderAmount,
                usageLimit: discount.usageLimit,
                usagePerUser: discount.usagePerUser,
                applicableCategories: discount.applicableCategories,
                applicableProducts: discount.applicableProducts.map((p: any) => p._id || p),
                startDate: discount.startDate.split('T')[0],
                endDate: discount.endDate.split('T')[0]
            });
            setApplyToAllProducts(false);
        } else {
            setEditingDiscount(null);
            const today = new Date().toISOString().split('T')[0];
            const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            setDiscountFormData({
                type: 'percentage',
                usagePerUser: 1,
                startDate: today,
                endDate: nextMonth,
                applicableCategories: [],
                applicableProducts: []
            });
            setApplyToAllProducts(false);
        }
        setShowDiscountModal(true);
    };

    const handleCloseDiscountModal = () => {
        setShowDiscountModal(false);
        setEditingDiscount(null);
        setDiscountFormData({});
        setApplyToAllProducts(false);
    };

    const handleSaveDiscount = async () => {
        try {
            if (!discountFormData.code || !discountFormData.description || !discountFormData.type ||
                !discountFormData.value || !discountFormData.startDate || !discountFormData.endDate) {
                alert('Please fill in all required fields');
                return;
            }

            const finalFormData: DiscountFormData = {
                code: discountFormData.code,
                description: discountFormData.description,
                type: discountFormData.type as 'percentage' | 'fixed',
                value: Number(discountFormData.value),
                maxDiscount: discountFormData.maxDiscount ? Number(discountFormData.maxDiscount) : undefined,
                minOrderAmount: discountFormData.minOrderAmount ? Number(discountFormData.minOrderAmount) : undefined,
                usageLimit: discountFormData.usageLimit ? Number(discountFormData.usageLimit) : undefined,
                usagePerUser: discountFormData.usagePerUser ? Number(discountFormData.usagePerUser) : undefined,
                applicableCategories: applyToAllProducts ? [] : (discountFormData.applicableCategories || []),
                applicableProducts: applyToAllProducts ? [] : (discountFormData.applicableProducts || []),
                startDate: discountFormData.startDate,
                endDate: discountFormData.endDate
            };

            if (editingDiscount) {
                await updateDiscount(editingDiscount._id, finalFormData);
                alert('Discount updated successfully');
            } else {
                await createDiscount(finalFormData);
                alert('Discount created successfully');
            }

            // If "Apply to All Products" is checked, apply this discount to all products
            if (applyToAllProducts && !editingDiscount) {
                await handleApplyDiscountToAllProducts(finalFormData);
            }

            handleCloseDiscountModal();
            await loadData();
        } catch (error: any) {
            console.error('Save discount error:', error);
            alert(error.message || 'Failed to save discount');
        }
    };

    const handleApplyDiscountToAllProducts = async (discountData: DiscountFormData) => {
        try {
            // Fetch all products
            const allProductsData = await adminProductService.getAdminProducts({
                page: 1,
                limit: 1000, // Get a large number to cover all products
                search: '',
                category: '',
                status: ''
            });

            const allProducts = allProductsData.data;

            if (allProducts.length === 0) {
                alert('No products found to apply discount');
                return;
            }

            if (!confirm(`This will apply the discount to ALL ${allProducts.length} products. Continue?`)) {
                return;
            }

            setProductLoading(true);

            // Calculate discount percentage from the discount code
            const discountPercentage = discountData.type === 'percentage' ? discountData.value : 0;

            const promises = allProducts.map(product => {
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
                        enabled: true,
                        percentage: discountPercentage,
                        startDate: discountData.startDate || null,
                        endDate: discountData.endDate || null,
                        description: discountData.description
                    }
                };

                return adminProductService.updateProduct(
                    product.productId,
                    { ...updatedData, preserveExistingImages: true },
                    undefined,
                    undefined,
                    false
                );
            });

            await Promise.all(promises);
            alert(`✅ Discount applied to all ${allProducts.length} products successfully!`);
        } catch (error: any) {
            console.error('Apply to all products error:', error);
            alert(error.message || 'Failed to apply discount to all products');
        } finally {
            setProductLoading(false);
        }
    };

    const handleDeleteDiscount = async (discountId: string) => {
        if (!confirm('Are you sure you want to delete this discount?')) return;

        try {
            await deleteDiscount(discountId);
            await loadData();
            alert('Discount deleted successfully');
        } catch (error: any) {
            console.error('Delete discount error:', error);
            alert(error.message || 'Failed to delete discount');
        }
    };

    const handleToggleDiscountStatus = async (discountId: string) => {
        try {
            await toggleDiscountStatus(discountId);
            await loadData();
        } catch (error: any) {
            console.error('Toggle discount status error:', error);
            alert(error.message || 'Failed to toggle discount status');
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
                            <button
                                onClick={() => setActiveTab('discounts')}
                                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-md font-medium text-sm transition-all ${activeTab === 'discounts'
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <Tag className="w-4 h-4" />
                                <span>Discounts</span>
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


                    {/* Discounts Tab */}
                    {activeTab === 'discounts' && (
                        <div className="space-y-6">
                            {/* Header with Add Button */}
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold text-gray-900">Discount Management</h2>
                                <button
                                    onClick={() => handleOpenDiscountModal()}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                                >
                                    <Plus className="w-5 h-5" />
                                    Create Discount
                                </button>
                            </div>

                            {/* Analytics Cards */}
                            {discountAnalytics && (
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                                        <h3 className="text-sm font-medium text-gray-600 mb-1">Total Discounts</h3>
                                        <p className="text-2xl font-bold text-gray-900">{discountAnalytics.overview.total}</p>
                                    </div>
                                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                                        <h3 className="text-sm font-medium text-gray-600 mb-1">Active Discounts</h3>
                                        <p className="text-2xl font-bold text-green-600">{discountAnalytics.overview.active}</p>
                                    </div>
                                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                                        <h3 className="text-sm font-medium text-gray-600 mb-1">Total Usage</h3>
                                        <p className="text-2xl font-bold text-blue-600">{discountAnalytics.usage.total}</p>
                                    </div>
                                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                                        <h3 className="text-sm font-medium text-gray-600 mb-1">Average Usage</h3>
                                        <p className="text-2xl font-bold text-purple-600">{discountAnalytics.usage.average.toFixed(1)}</p>
                                    </div>
                                </div>
                            )}

                            {/* Filters */}
                            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search discounts..."
                                            value={discountsSearch}
                                            onChange={(e) => {
                                                setDiscountsSearch(e.target.value);
                                                setDiscountsPage(1);
                                            }}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <select
                                        value={discountsStatusFilter}
                                        onChange={(e) => {
                                            setDiscountsStatusFilter(e.target.value);
                                            setDiscountsPage(1);
                                        }}
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">All Status</option>
                                        <option value="active">Active</option>
                                        <option value="expired">Expired</option>
                                        <option value="scheduled">Scheduled</option>
                                    </select>
                                    <select
                                        value={discountsTypeFilter}
                                        onChange={(e) => {
                                            setDiscountsTypeFilter(e.target.value);
                                            setDiscountsPage(1);
                                        }}
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">All Types</option>
                                        <option value="percentage">Percentage</option>
                                        <option value="fixed">Fixed Amount</option>
                                    </select>
                                </div>
                            </div>

                            {/* Discounts Table */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usage</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valid Period</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {discounts.length === 0 ? (
                                                <tr>
                                                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                                                        No discounts found
                                                    </td>
                                                </tr>
                                            ) : (
                                                discounts.map((discount) => {
                                                    const now = new Date();
                                                    const startDate = new Date(discount.startDate);
                                                    const endDate = new Date(discount.endDate);
                                                    const isActive = discount.isActive && now >= startDate && now <= endDate;
                                                    const isExpired = now > endDate || !discount.isActive;
                                                    const isScheduled = discount.isActive && now < startDate;

                                                    return (
                                                        <tr key={discount._id} className="hover:bg-gray-50">
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <span className="font-mono font-semibold text-blue-600">{discount.code}</span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <p className="text-sm text-gray-900 max-w-xs truncate">{discount.description}</p>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${discount.type === 'percentage'
                                                                    ? 'bg-purple-100 text-purple-800'
                                                                    : 'bg-green-100 text-green-800'
                                                                    }`}>
                                                                    {discount.type === 'percentage' ? 'Percentage' : 'Fixed'}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <span className="font-semibold">
                                                                    {discount.type === 'percentage' ? `${discount.value}%` : `₹${discount.value}`}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <span className="text-sm text-gray-900">
                                                                    {discount.usedCount} / {discount.usageLimit || '∞'}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                <div>
                                                                    <div>{new Date(discount.startDate).toLocaleDateString()}</div>
                                                                    <div>{new Date(discount.endDate).toLocaleDateString()}</div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${isActive ? 'bg-green-100 text-green-800' :
                                                                    isExpired ? 'bg-red-100 text-red-800' :
                                                                        'bg-yellow-100 text-yellow-800'
                                                                    }`}>
                                                                    {isActive ? 'Active' : isExpired ? 'Expired' : 'Scheduled'}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="flex items-center gap-2">
                                                                    <button
                                                                        onClick={() => handleToggleDiscountStatus(discount._id)}
                                                                        className={`p-2 rounded-lg transition-colors ${discount.isActive
                                                                            ? 'bg-green-100 text-green-600 hover:bg-green-200'
                                                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                                            }`}
                                                                        title={discount.isActive ? 'Deactivate' : 'Activate'}
                                                                    >
                                                                        <DollarSign className="w-4 h-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleOpenDiscountModal(discount)}
                                                                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                                                                        title="Edit"
                                                                    >
                                                                        <Edit2 className="w-4 h-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteDiscount(discount._id)}
                                                                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                                                        title="Delete"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {discountsPagination && discountsPagination.totalPages > 1 && (
                                    <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                                        <p className="text-sm text-gray-700">
                                            Showing page {discountsPagination.currentPage} of {discountsPagination.totalPages}
                                            {' '}({discountsPagination.totalItems} total)
                                        </p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setDiscountsPage(discountsPage - 1)}
                                                disabled={!discountsPagination.hasPrevPage}
                                                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                <ChevronLeft className="w-4 h-4" />
                                                Previous
                                            </button>
                                            <button
                                                onClick={() => setDiscountsPage(discountsPage + 1)}
                                                disabled={!discountsPagination.hasNextPage}
                                                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                Next
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}
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
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search products..."
                                            value={productsSearch}
                                            onChange={(e) => {
                                                setProductsSearch(e.target.value);
                                                setProductsPage(1);
                                            }}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        />
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
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
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
                                                        <img
                                                            src={product.image}
                                                            alt={product.name}
                                                            className="w-16 h-16 object-cover rounded-lg"
                                                        />
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
                                                        {product.priceINR ? formatCurrency(product.priceINR) : 'N/A'}
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
                                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                                title="Edit product"
                                                            >
                                                                <Edit2 className="w-4 h-4" />
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
                                className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col relative animate-in fade-in zoom-in-95 duration-200"
                                style={{ height: '85vh', maxHeight: '900px' }}
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

                                <div className="flex-1 min-h-0 p-6 space-y-6 overflow-y-auto overscroll-contain custom-scrollbar">
                                    {/* Basic Information */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Product ID *</label>
                                            <input
                                                type="text"
                                                required
                                                disabled={!!editingProduct}
                                                value={productFormData.productId || ''}
                                                onChange={(e) => setProductFormData({ ...productFormData, productId: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                                            <input
                                                type="text"
                                                required
                                                value={productFormData.name || ''}
                                                onChange={(e) => setProductFormData({ ...productFormData, name: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                                            <select
                                                required
                                                value={productFormData.category || 'furniture'}
                                                onChange={(e) => setProductFormData({ ...productFormData, category: e.target.value, subcategory: '' })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="furniture">Furniture</option>
                                                <option value="slabs">Slabs</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory *</label>
                                            <select
                                                required={!showCustomSubcategory}
                                                value={showCustomSubcategory ? 'custom' : (productFormData.subcategory || '')}
                                                onChange={(e) => {
                                                    if (e.target.value === 'custom') {
                                                        setShowCustomSubcategory(true);
                                                        setCustomSubcategory('');
                                                    } else {
                                                        setShowCustomSubcategory(false);
                                                        setProductFormData({ ...productFormData, subcategory: e.target.value });
                                                    }
                                                }}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="">Select Subcategory</option>
                                                {productFormData.category === 'furniture' ? (
                                                    <>
                                                        <option value="tables">Tables</option>
                                                        <option value="coffee-table">Coffee Table</option>
                                                        <option value="console-table">Console Table</option>
                                                        <option value="dining-table">Dining Table</option>
                                                        <option value="side-table">Side Table</option>
                                                        <option value="wash-basins">Wash Basins</option>
                                                        <option value="pedestal">Pedestal</option>
                                                        <option value="countertop">Countertop</option>
                                                        <option value="sculptures">Sculptures</option>
                                                        <option value="benches">Benches</option>
                                                        <option value="planters">Planters</option>
                                                        <option value="fountains">Fountains</option>
                                                        <option value="fireplace">Fireplace</option>
                                                        <option value="columns">Columns</option>
                                                        <option value="urns">Urns</option>
                                                        {/* Custom furniture subcategories */}
                                                        {customSubcategories.furniture?.map(custom => (
                                                            <option key={custom.id} value={custom.id}>
                                                                {custom.name} (Custom)
                                                            </option>
                                                        ))}
                                                    </>
                                                ) : (
                                                    <>
                                                        <option value="granite">Granite</option>
                                                        <option value="marble">Marble</option>
                                                        <option value="quartzite">Quartzite</option>
                                                        <option value="onyx">Onyx</option>
                                                        <option value="limestone">Limestone</option>
                                                        <option value="travertine">Travertine</option>
                                                        <option value="sandstone">Sandstone</option>
                                                        <option value="slate">Slate</option>
                                                        {/* Custom slabs subcategories */}
                                                        {customSubcategories.slabs?.map(custom => (
                                                            <option key={custom.id} value={custom.id}>
                                                                {custom.name} (Custom)
                                                            </option>
                                                        ))}
                                                    </>
                                                )}
                                                <option value="custom">➕ Add Custom Subcategory</option>
                                            </select>

                                            {/* Custom Subcategory Input */}
                                            {showCustomSubcategory && (
                                                <div className="mt-2">
                                                    <input
                                                        type="text"
                                                        required
                                                        value={customSubcategory}
                                                        onChange={(e) => setCustomSubcategory(e.target.value)}
                                                        placeholder="Enter custom subcategory (e.g., outdoor-tables)"
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setShowCustomSubcategory(false);
                                                            setCustomSubcategory('');
                                                        }}
                                                        className="mt-1 text-sm text-blue-600 hover:text-blue-700"
                                                    >
                                                        ← Back to predefined options
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Price (INR)</label>
                                            <input
                                                type="number"
                                                value={productFormData.priceINR || ''}
                                                onChange={(e) => setProductFormData({ ...productFormData, priceINR: parseFloat(e.target.value) })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                            <select
                                                value={productFormData.status || 'active'}
                                                onChange={(e) => setProductFormData({ ...productFormData, status: e.target.value as any })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="active">Active</option>
                                                <option value="inactive">Inactive</option>
                                                <option value="draft">Draft</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Discount Section */}
                                    <div className="border-t border-gray-200 pt-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="text-lg font-semibold text-gray-900">Discount Settings</h4>
                                            <label className="flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={productFormData.discount?.enabled || false}
                                                    onChange={(e) => setProductFormData({
                                                        ...productFormData,
                                                        discount: {
                                                            ...productFormData.discount,
                                                            enabled: e.target.checked,
                                                            percentage: productFormData.discount?.percentage || 0
                                                        }
                                                    })}
                                                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                                />
                                                <span className="ml-2 text-sm font-medium text-gray-700">Enable Discount</span>
                                            </label>
                                        </div>

                                        {productFormData.discount?.enabled && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Discount Percentage *</label>
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            required={productFormData.discount?.enabled}
                                                            value={productFormData.discount?.percentage || 0}
                                                            onChange={(e) => setProductFormData({
                                                                ...productFormData,
                                                                discount: {
                                                                    ...productFormData.discount,
                                                                    enabled: true,
                                                                    percentage: parseFloat(e.target.value) || 0
                                                                }
                                                            })}
                                                            className="w-full px-4 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                        />
                                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                                                    </div>
                                                    {productFormData.priceINR && productFormData.discount?.percentage > 0 && (
                                                        <p className="mt-1 text-sm text-green-600">
                                                            Final Price: ₹{Math.round(productFormData.priceINR * (1 - productFormData.discount.percentage / 100)).toLocaleString('en-IN')}
                                                            <span className="text-gray-500 ml-2">
                                                                (Save ₹{Math.round(productFormData.priceINR * productFormData.discount.percentage / 100).toLocaleString('en-IN')})
                                                            </span>
                                                        </p>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                                    <input
                                                        type="datetime-local"
                                                        value={productFormData.discount?.startDate ? new Date(productFormData.discount.startDate).toISOString().slice(0, 16) : ''}
                                                        onChange={(e) => setProductFormData({
                                                            ...productFormData,
                                                            discount: {
                                                                ...productFormData.discount,
                                                                enabled: true,
                                                                percentage: productFormData.discount?.percentage || 0,
                                                                startDate: e.target.value || null
                                                            }
                                                        })}
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                    />
                                                    <p className="mt-1 text-xs text-gray-500">Leave empty to start immediately</p>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                                    <input
                                                        type="datetime-local"
                                                        value={productFormData.discount?.endDate ? new Date(productFormData.discount.endDate).toISOString().slice(0, 16) : ''}
                                                        onChange={(e) => setProductFormData({
                                                            ...productFormData,
                                                            discount: {
                                                                ...productFormData.discount,
                                                                enabled: true,
                                                                percentage: productFormData.discount?.percentage || 0,
                                                                endDate: e.target.value || null
                                                            }
                                                        })}
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                    />
                                                    <p className="mt-1 text-xs text-gray-500">Leave empty for no expiration</p>
                                                </div>
                                                <div className="md:col-span-2">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Discount Description</label>
                                                    <input
                                                        type="text"
                                                        placeholder="e.g., Summer Sale, Clearance, Limited Time Offer"
                                                        value={productFormData.discount?.description || ''}
                                                        onChange={(e) => setProductFormData({
                                                            ...productFormData,
                                                            discount: {
                                                                ...productFormData.discount,
                                                                enabled: true,
                                                                percentage: productFormData.discount?.percentage || 0,
                                                                description: e.target.value
                                                            }
                                                        })}
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                                        <textarea
                                            required
                                            rows={4}
                                            value={productFormData.description || ''}
                                            onChange={(e) => setProductFormData({ ...productFormData, description: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    {/* Images Upload */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Product Images {!editingProduct && '*'}
                                        </label>
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                            <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                                            <p className="text-sm text-gray-600 mb-2">
                                                Click to upload or drag and drop
                                            </p>
                                            <p className="text-xs text-gray-500 mb-4">
                                                Images will be converted to WebP and compressed automatically
                                            </p>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                onChange={handleProductImageChange}
                                                className="hidden"
                                                id="product-images"
                                            />
                                            <label
                                                htmlFor="product-images"
                                                className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors"
                                            >
                                                Select Images
                                            </label>
                                        </div>


                                        {/* Existing Images (when editing) */}
                                        {existingImages.length > 0 && (
                                            <div className="mt-4">
                                                <h4 className="text-sm font-medium text-gray-700 mb-2">Existing Images</h4>
                                                <div className="grid grid-cols-4 gap-3">
                                                    {existingImages.map((imageUrl, index) => {
                                                        if (removedImages.includes(imageUrl)) return null;
                                                        const isMain = index === mainImageIndex && mainNewImageIndex === null; // Only main if no new image is selected as main
                                                        return (
                                                            <div key={imageUrl} className="relative group">
                                                                <img
                                                                    src={imageUrl}
                                                                    alt={`Existing ${index + 1}`}
                                                                    className={`w-full h-24 object-cover rounded-lg border-2 transition-all ${isMain ? 'border-blue-600 ring-2 ring-blue-200' : 'border-gray-200'
                                                                        }`}
                                                                />
                                                                {isMain && (
                                                                    <span className="absolute top-1 left-1 px-2 py-1 bg-blue-600 text-white text-xs rounded font-semibold shadow-sm">
                                                                        Main
                                                                    </span>
                                                                )}
                                                                {/* Action Buttons */}
                                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-1">
                                                                    {!isMain && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                setMainImageIndex(index);
                                                                                setMainNewImageIndex(null);
                                                                            }}
                                                                            className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                                                                            title="Set as main image"
                                                                        >
                                                                            <Star className="w-4 h-4" />
                                                                        </button>
                                                                    )}
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setRemovedImages([...removedImages, imageUrl])}
                                                                        className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                                                                        title="Remove image"
                                                                    >
                                                                        <X className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {/* New Image Previews */}
                                        {productImagePreviews.length > 0 && (
                                            <div className="mt-4">
                                                <h4 className="text-sm font-medium text-gray-700 mb-2">New Images to Upload</h4>
                                                <div className="grid grid-cols-4 gap-3">
                                                    {productImagePreviews.map((preview, index) => {
                                                        const isMain = index === mainNewImageIndex;
                                                        return (
                                                            <div key={index} className="relative group">
                                                                <img
                                                                    src={preview}
                                                                    alt={`New ${index + 1}`}
                                                                    className={`w-full h-24 object-cover rounded-lg border-2 transition-all ${isMain ? 'border-green-600 ring-2 ring-green-200' : 'border-gray-200'
                                                                        }`}
                                                                />
                                                                {isMain ? (
                                                                    <span className="absolute top-1 left-1 px-2 py-1 bg-green-600 text-white text-xs rounded font-semibold shadow-sm">
                                                                        Main
                                                                    </span>
                                                                ) : (
                                                                    <span className="absolute top-1 right-1 px-2 py-1 bg-green-600 text-white text-xs rounded shadow-sm">
                                                                        New
                                                                    </span>
                                                                )}
                                                                {/* Action Buttons */}
                                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-1">
                                                                    {!isMain && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                setMainNewImageIndex(index);
                                                                                // We don't need to unset mainImageIndex for existing, as new index != null logic takes precedence in rendering and save logic
                                                                            }}
                                                                            className="p-1.5 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                                                                            title="Set as main image"
                                                                        >
                                                                            <Star className="w-4 h-4" />
                                                                        </button>
                                                                    )}
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            const newPreviews = productImagePreviews.filter((_, i) => i !== index);
                                                                            const newImages = Array.from(productImages).filter((_, i) => i !== index);
                                                                            setProductImagePreviews(newPreviews);
                                                                            setProductImages(newImages);
                                                                            if (mainNewImageIndex === index) setMainNewImageIndex(null);
                                                                            else if (mainNewImageIndex !== null && mainNewImageIndex > index) setMainNewImageIndex(mainNewImageIndex - 1);
                                                                        }}
                                                                        className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                                                                        title="Remove image"
                                                                    >
                                                                        <X className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Video Upload */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Product Video (Optional)
                                        </label>
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                            <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                                            <p className="text-sm text-gray-600 mb-2">
                                                Upload product demonstration video
                                            </p>
                                            <p className="text-xs text-gray-500 mb-4">
                                                Max size: 10MB | Formats: MP4, WebM, MOV, AVI
                                            </p>
                                            <input
                                                type="file"
                                                accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
                                                onChange={handleProductVideoChange}
                                                className="hidden"
                                                id="product-video"
                                            />
                                            <label
                                                htmlFor="product-video"
                                                className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors"
                                            >
                                                Select Video
                                            </label>
                                        </div>

                                        {/* Video Preview */}
                                        {productVideoPreview && (
                                            <div className="mt-4">
                                                <video
                                                    src={productVideoPreview}
                                                    controls
                                                    className="w-full max-w-md mx-auto rounded-lg border border-gray-200"
                                                    style={{ maxHeight: '300px' }}
                                                />
                                                <p className="text-xs text-gray-500 mt-2 text-center">
                                                    New video selected: {productVideo?.name}
                                                </p>
                                            </div>
                                        )}

                                        {/* Existing Video Display */}
                                        {editingProduct && editingProduct.videoUrl && !productVideoPreview && !removeVideo && (
                                            <div className="mt-4">
                                                <p className="text-sm font-medium text-gray-700 mb-2">Current Video:</p>
                                                <video
                                                    src={editingProduct.videoUrl}
                                                    controls
                                                    className="w-full max-w-md mx-auto rounded-lg border border-gray-200"
                                                    style={{ maxHeight: '300px' }}
                                                />
                                                <div className="mt-2 flex items-center justify-center gap-2">
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={removeVideo}
                                                            onChange={(e) => setRemoveVideo(e.target.checked)}
                                                            className="w-4 h-4 text-red-600"
                                                        />
                                                        <span className="text-sm text-red-600">Remove video</span>
                                                    </label>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Checkboxes */}
                                    <div className="flex gap-6">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={productFormData.available !== false}
                                                onChange={(e) => setProductFormData({ ...productFormData, available: e.target.checked })}
                                                className="w-4 h-4 text-blue-600"
                                            />
                                            <span className="text-sm text-gray-700">Available</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={productFormData.featured === true}
                                                onChange={(e) => setProductFormData({ ...productFormData, featured: e.target.checked })}
                                                className="w-4 h-4 text-amber-600"
                                            />
                                            <span className="text-sm text-gray-700">Featured (Show on Homepage)</span>
                                        </label>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-3 pt-6 border-t border-gray-200">
                                        <button
                                            onClick={handlePreviewProduct}
                                            disabled={productLoading || previewLoading}
                                            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Layout className="w-4 h-4" />
                                            {previewLoading ? 'Generating...' : 'Preview'}
                                        </button>
                                        <button
                                            onClick={handleSaveProduct}
                                            disabled={productLoading}
                                            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                        >
                                            {productLoading && (
                                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                            )}
                                            {productLoading
                                                ? (editingProduct ? 'Updating...' : 'Creating...')
                                                : (editingProduct ? 'Update Product' : 'Create Product')
                                            }
                                        </button>
                                        <button
                                            onClick={handleCloseProductModal}
                                            disabled={productLoading}
                                            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-700 rounded-lg font-medium transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
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
                                            disabled={productLoading}
                                            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                                        >
                                            {productLoading ? 'Applying...' : 'Apply Discount'}
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

                    {/* Discount Modal */}
                    {showDiscountModal && isMounted && typeof document !== 'undefined' && document.body && createPortal(
                        <div 
                            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                            onClick={handleCloseDiscountModal}
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
                                        {editingDiscount ? 'Edit Discount' : 'Create New Discount'}
                                    </h2>
                                    <button
                                        onClick={handleCloseDiscountModal}
                                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                    >
                                        <X className="w-5 h-5 text-gray-500" />
                                    </button>
                                </div>

                                <div className="p-6 space-y-6">
                                    {/* Basic Information */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Discount Code *</label>
                                            <input
                                                type="text"
                                                required
                                                value={discountFormData.code || ''}
                                                onChange={(e) => setDiscountFormData({ ...discountFormData, code: e.target.value.toUpperCase() })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 uppercase"
                                                placeholder="e.g., SUMMER2024"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                                            <select
                                                required
                                                value={discountFormData.type || 'percentage'}
                                                onChange={(e) => setDiscountFormData({ ...discountFormData, type: e.target.value as 'percentage' | 'fixed' })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="percentage">Percentage</option>
                                                <option value="fixed">Fixed Amount</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                                        <textarea
                                            required
                                            value={discountFormData.description || ''}
                                            onChange={(e) => setDiscountFormData({ ...discountFormData, description: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            rows={3}
                                            placeholder="Describe the discount offer..."
                                        />
                                    </div>

                                    {/* Discount Value */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                {discountFormData.type === 'percentage' ? 'Percentage (%)' : 'Amount (₹)'} *
                                            </label>
                                            <input
                                                type="number"
                                                required
                                                min="0"
                                                max={discountFormData.type === 'percentage' ? 100 : undefined}
                                                value={discountFormData.value || ''}
                                                onChange={(e) => setDiscountFormData({ ...discountFormData, value: Number(e.target.value) })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        {discountFormData.type === 'percentage' && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Max Discount (₹)</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={discountFormData.maxDiscount || ''}
                                                    onChange={(e) => setDiscountFormData({ ...discountFormData, maxDiscount: Number(e.target.value) })}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Optional"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Usage Limits */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Min Order Amount (₹)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={discountFormData.minOrderAmount || ''}
                                                onChange={(e) => setDiscountFormData({ ...discountFormData, minOrderAmount: Number(e.target.value) })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                placeholder="0"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Total Usage Limit</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={discountFormData.usageLimit || ''}
                                                onChange={(e) => setDiscountFormData({ ...discountFormData, usageLimit: Number(e.target.value) })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                placeholder="Unlimited"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Per User Limit</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={discountFormData.usagePerUser || 1}
                                                onChange={(e) => setDiscountFormData({ ...discountFormData, usagePerUser: Number(e.target.value) })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>

                                    {/* Valid Period */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                                            <input
                                                type="date"
                                                required
                                                value={discountFormData.startDate || ''}
                                                onChange={(e) => setDiscountFormData({ ...discountFormData, startDate: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
                                            <input
                                                type="date"
                                                required
                                                value={discountFormData.endDate || ''}
                                                onChange={(e) => setDiscountFormData({ ...discountFormData, endDate: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>

                                    {/* Apply to All Products Checkbox */}
                                    {!editingDiscount && (
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                            <label className="flex items-start gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={applyToAllProducts}
                                                    onChange={(e) => setApplyToAllProducts(e.target.checked)}
                                                    className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                />
                                                <div>
                                                    <div className="font-semibold text-blue-900">Apply to All Products</div>
                                                    <div className="text-sm text-blue-700 mt-1">
                                                        When checked, this discount will be automatically applied to all products in your catalog.
                                                        This will update the product-level discount for every product.
                                                    </div>
                                                </div>
                                            </label>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                                        <button
                                            onClick={handleCloseDiscountModal}
                                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSaveDiscount}
                                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            {editingDiscount ? 'Update Discount' : 'Create Discount'}
                                        </button>
                                    </div>
                                </div>
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
                                                        <span className={`text-sm px-2 py-1 rounded-full font-medium ${
                                                            previewProduct.status === 'active' 
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
                                                        <span className={`text-sm px-2 py-1 rounded-full font-medium ${
                                                            previewProduct.available 
                                                                ? 'bg-green-100 text-green-700'
                                                                : 'bg-red-100 text-red-700'
                                                        }`}>
                                                            {previewProduct.available ? 'Yes' : 'No'}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-medium text-gray-500">Featured:</span>
                                                        <span className={`text-sm px-2 py-1 rounded-full font-medium ${
                                                            previewProduct.featured 
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
