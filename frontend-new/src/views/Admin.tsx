'use client';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { saveAdminProductsListState, consumeAdminProductsListState } from '../utils/adminProductsNav';
import {
    getAnalytics,
    getAllUsers,
    getAllOrders,
    updateOrderStatus,
    updateUserRole,
    deleteUser
} from '../services/adminService';
import BulkRegionalPricing from '../components/BulkRegionalPricing';
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
    Star,
    Tag,
    Percent,
    Play,
    Bell
} from 'lucide-react';
import {
    BarChart,
    Bar,
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
import { adminProductApi } from '../modules/product/api';
import type { AdminProduct as Product, AdminProductFormData as ProductFormData } from '../modules/product/types';
import { formatAdminINR } from '../utils/pricing';
import reviewService, { Review } from '../services/reviewService';
import {
    fetchCustomCategories,
    addCustomSubcategory,
    updateCustomSubcategory,
    deleteCustomSubcategory,
} from '../services/categoryService';
import { productService } from '../services/productService';
import HomePageManagement from '../components/admin/HomePageManagement';
import NavbarCategoriesEditor from '../components/admin/NavbarCategoriesEditor';
import PopupManagement from '../components/admin/PopupManagement';
import ProductOrderingManager from '../components/ProductOrderingManager';

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
    const location = useLocation();
    // The app's react-router-dom shim (src/shims/react-router-dom.tsx) drops
    // navigate() state entirely — useLocation().state is always null — so the
    // products-list position we return to has to travel through a module-level
    // singleton instead. See ../utils/adminProductsNav.
    const initialListStateRef = useRef(consumeAdminProductsListState());
    const [activeTab, setActiveTab] = useState<'analytics' | 'orders' | 'users' | 'blogs' | 'contacts' | 'quotations' | 'products' | 'categories' | 'reviews' | 'homepage' | 'popups' | 'delivery-checks'>(() => {
      const tab = (location.state as any)?.tab;
      const validTabs = ['analytics', 'orders', 'users', 'blogs', 'contacts', 'quotations', 'products', 'categories', 'reviews', 'homepage', 'popups', 'delivery-checks'];
      if (tab && validTabs.includes(tab)) return tab as any;
      if (initialListStateRef.current) return 'products';
      return 'analytics';
    });
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
    // Restore the products-list position (page/filters/search/scroll) when we're
    // navigated back from the product edit page — see initialListStateRef above.
    const restoredListState = initialListStateRef.current;
    const [products, setProducts] = useState<Product[]>([]);
    const [productsPage, setProductsPage] = useState(restoredListState?.page ?? 1);
    const [productsPagination, setProductsPagination] = useState<any>(null);
    const [productsSearch, setProductsSearch] = useState(restoredListState?.search ?? '');
    const [productsCategoryFilter, setProductsCategoryFilter] = useState(restoredListState?.category ?? '');
    const [productsSubcategoryFilter, setProductsSubcategoryFilter] = useState(restoredListState?.subcategory ?? '');
    const [productsStatusFilter, setProductsStatusFilter] = useState(restoredListState?.status ?? '');
    const pendingScrollRestoreRef = useRef<number | null>(restoredListState?.scrollY ?? null);
    const buildProductsListState = () => ({
        page: productsPage,
        search: productsSearch,
        category: productsCategoryFilter,
        subcategory: productsSubcategoryFilter,
        status: productsStatusFilter,
        scrollY: window.scrollY
    });
    const [showProductModal, setShowProductModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [productFormData, setProductFormData] = useState<Partial<ProductFormData>>({});
    const [productImages, setProductImages] = useState<File[]>([]);
    const [, setProductImagePreviews] = useState<string[]>([]);
    const [existingImages, setExistingImages] = useState<string[]>([]); // For editing existing products
    const [removedImages, setRemovedImages] = useState<string[]>([]); // Track images to remove
    const [mainImageIndex, setMainImageIndex] = useState<number>(0); // Track which image is main (existing)
    const [mainNewImageIndex, setMainNewImageIndex] = useState<number | null>(null); // Track which NEW image is main
    const [productVideo, setProductVideo] = useState<File | null>(null);
    const [, setProductVideoPreview] = useState<string | null>(null);
    const [removeVideo, setRemoveVideo] = useState(false);
    const [productLoading, setProductLoading] = useState(false);
    const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
    const [showCustomSubcategory, setShowCustomSubcategory] = useState(false);
    const [customSubcategory, setCustomSubcategory] = useState('');
    const [, setCustomSubcategories] = useState<{ [categoryId: string]: Array<{ id: string, name: string }> }>({});

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
    const [bulkActionLoading, setBulkActionLoading] = useState<string | null>(null);
    const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
    const [showBulkPriceModal, setShowBulkPriceModal] = useState(false);
    const [bulkPriceData, setBulkPriceData] = useState<{
        direction: 'increase' | 'decrease';
        adjustType: 'percentage' | 'fixed_inr';
        value: string;
    }>({ direction: 'increase', adjustType: 'percentage', value: '' });

    // Product ordering view
    const [showOrdering, setShowOrdering] = useState(false);

    // Bulk Edit (inline spreadsheet mode)
    const [bulkEditMode, setBulkEditMode] = useState(false);
    const [bulkEditChanges, setBulkEditChanges] = useState<Record<string, {
        name?: string;
        priceINR?: string;
        status?: string;
        featured?: boolean;
        category?: string;
        subcategory?: string;
    }>>({});
    const [bulkEditSaving, setBulkEditSaving] = useState(false);

    // Reviews state
    const [reviews, setReviews] = useState<Review[]>([]);
    const [reviewsPage, setReviewsPage] = useState(1);
    const [reviewsStatusFilter, setReviewsStatusFilter] = useState('');
    const [reviewsTotal, setReviewsTotal] = useState(0);
    const [reviewsHasMore, setReviewsHasMore] = useState(false);

    // Category management state
    const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
    const [customCategoryData, setCustomCategoryData] = useState<Record<string, Array<{ id: string; name: string; isCustom: boolean }>>>({});
    const [categoryMetaMap, setCategoryMetaMap] = useState<Record<string, { subcategories: string[]; count: number }>>({});
    const [selectedCategoryId, setSelectedCategoryId] = useState('furniture');
    const [newSubcategoryName, setNewSubcategoryName] = useState('');
    const [selectedProductIdForCategory, setSelectedProductIdForCategory] = useState('');
    const [targetSubcategoryForCategory, setTargetSubcategoryForCategory] = useState('');
    const [allProductsForCategoryManagement, setAllProductsForCategoryManagement] = useState<Product[]>([]);
    const [categoryProducts, setCategoryProducts] = useState<Product[]>([]);
    const [categorySaving, setCategorySaving] = useState(false);
    const [editingCustomSubcategory, setEditingCustomSubcategory] = useState<{
        categoryId: string;
        subcategoryId: string;
        name: string;
    } | null>(null);

    // Search debouncing — use useRef so setting the timer doesn't cause a re-render
    const searchDebounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Debounced search effect
    useEffect(() => {
        if (searchDebounceTimerRef.current) {
            clearTimeout(searchDebounceTimerRef.current);
        }

        searchDebounceTimerRef.current = setTimeout(() => {
            if (activeTab === 'products') {
                loadData();
            }
        }, 300); // 300ms debounce

        return () => {
            if (searchDebounceTimerRef.current) {
                clearTimeout(searchDebounceTimerRef.current);
            }
        };
    }, [productsSearch]); // eslint-disable-line react-hooks/exhaustive-deps

    // Restore scroll position once, after the products list we navigated back to has
    // actually finished (re-)loading. `productsLoading` defaults to false before the
    // load effect below has run, so we wait for a true->false transition rather than
    // acting on that initial false — otherwise this fires on the still-empty page.
    const hasStartedProductsLoadRef = useRef(false);
    useEffect(() => {
        if (activeTab !== 'products') return;
        if (productsLoading) { hasStartedProductsLoadRef.current = true; return; }
        if (!hasStartedProductsLoadRef.current) return;
        if (pendingScrollRestoreRef.current === null) return;
        const y = pendingScrollRestoreRef.current;
        pendingScrollRestoreRef.current = null;
        requestAnimationFrame(() => window.scrollTo(0, y));
    }, [activeTab, productsLoading]);

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/');
            return;
        }
        loadData();
    }, [user, activeTab, usersPage, ordersPage, usersSearch, usersRoleFilter, ordersSearch, ordersStatusFilter, ordersDeliveryFilter, blogsPage, contactsPage, contactsStatusFilter, quotationsPage, quotationsStatusFilter, productsPage, productsCategoryFilter, productsSubcategoryFilter, productsStatusFilter, reviewsPage, reviewsStatusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

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
                const [productsData, categoriesData] = await Promise.all([
                    adminProductApi.getAdminProducts({
                        page: productsPage,
                        limit: 10,
                        search: productsSearch,
                        category: productsCategoryFilter,
                        subcategory: productsSubcategoryFilter,
                        status: productsStatusFilter
                    }),
                    productService.getCategories(),
                ]);
                setProducts(productsData.data);
                setProductsPagination(productsData.pagination);
                setProductsLoading(false);

                // Build category + subcategory maps for BulkRegionalPricing
                if (categoriesData.success && categoriesData.data.length > 0) {
                    const meta: Record<string, { subcategories: string[]; count: number }> = {};
                    categoriesData.data.forEach((item: { category: string; subcategories: string[]; count: number }) => {
                        meta[item.category] = {
                            subcategories: (item.subcategories || []).filter(Boolean).sort((a: string, b: string) => a.localeCompare(b)),
                            count: item.count || 0,
                        };
                    });
                    setCategoryMetaMap(meta);
                    setCategoryOptions(categoriesData.data.map((item: { category: string }) => item.category).sort((a: string, b: string) => a.localeCompare(b)));
                }
            } else if (activeTab === 'categories') {
                const [customData, categoriesData, adminProductsData] = await Promise.all([
                    fetchCustomCategories(),
                    productService.getCategories(),
                    adminProductApi.getAdminProducts({ page: 1, limit: 1000, sortBy: 'name', sortOrder: 'asc' }),
                ]);

                setCustomCategoryData(customData || {});

                const productList = adminProductsData?.data || [];
                setAllProductsForCategoryManagement(productList);

                const metaFromApi: Record<string, { subcategories: string[]; count: number }> = {};
                if (categoriesData.success) {
                    categoriesData.data.forEach((item) => {
                        metaFromApi[item.category] = {
                            subcategories: item.subcategories || [],
                            count: item.count || 0,
                        };
                    });
                }

                // Ensure categories used by products are also represented.
                productList.forEach((product) => {
                    const categoryId = String(product.category || '').trim();
                    const subcategory = String(product.subcategory || '').trim();
                    if (!categoryId) return;

                    if (!metaFromApi[categoryId]) {
                        metaFromApi[categoryId] = { subcategories: [], count: 0 };
                    }

                    if (subcategory && !metaFromApi[categoryId].subcategories.includes(subcategory)) {
                        metaFromApi[categoryId].subcategories.push(subcategory);
                    }
                    metaFromApi[categoryId].count = (metaFromApi[categoryId].count || 0) + 1;
                });

                Object.keys(customData || {}).forEach((categoryId) => {
                    if (!metaFromApi[categoryId]) {
                        metaFromApi[categoryId] = { subcategories: [], count: 0 };
                    }

                    (customData[categoryId] || []).forEach((sub) => {
                        if (!metaFromApi[categoryId].subcategories.includes(sub.name)) {
                            metaFromApi[categoryId].subcategories.push(sub.name);
                        }
                    });
                });

                Object.keys(metaFromApi).forEach((categoryId) => {
                    metaFromApi[categoryId].subcategories = metaFromApi[categoryId].subcategories
                        .filter(Boolean)
                        .sort((a, b) => a.localeCompare(b));
                });

                setCategoryMetaMap(metaFromApi);

                const dynamicCategories = categoriesData.success
                    ? categoriesData.data.map((item) => item.category)
                    : [];
                const productCategories = productList
                    .map((product) => String(product.category || '').trim())
                    .filter(Boolean);
                const combined = Array.from(new Set([
                    ...dynamicCategories,
                    ...Object.keys(customData || {}),
                    ...productCategories,
                ])).sort((a, b) => a.localeCompare(b));
                setCategoryOptions(combined);

                if (combined.length > 0 && !combined.includes(selectedCategoryId)) {
                    setSelectedCategoryId(combined[0]);
                }
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
                    const categoryName = 'Furniture';
                    await addCustomSubcategory(productFormData.category, categoryName, customSubcategory.trim());

                    // Reload custom subcategories to update dropdowns
                    await loadCustomSubcategories();

                    // Refresh navigation categories if available
                    if (typeof (window as any).refreshNavCategories === 'function') {
                        (window as any).refreshNavCategories();
                    }

                    console.log('✅ Custom subcategory saved successfully');
                } catch (error: any) {
                    console.error('❌ Failed to save custom subcategory:', error);
                    setProductLoading(false);
                    alert(`Failed to save custom subcategory "${customSubcategory}". Error: ${error.message || error}. Please try again or use a predefined subcategory.`);
                    return; // Stop the product creation/update process
                }
            }

            if (editingProduct) {
                // Update existing product
                await adminProductApi.updateProduct(
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
                await adminProductApi.createProduct(
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
            await adminProductApi.deleteProduct(productId);
            await loadData();
            alert('✅ Product deleted successfully!');
        } catch (error: any) {
            console.error('Delete product error:', error);
            alert(error.message || 'Failed to delete product');
        } finally {
            setDeletingProductId(null);
        }
    };

    const handleAddCustomSubcategory = async () => {
        const name = newSubcategoryName.trim();
        if (!selectedCategoryId || !name) {
            alert('Please select a category and enter a subcategory name.');
            return;
        }

        try {
            setCategorySaving(true);
            const categoryLabel = selectedCategoryId.charAt(0).toUpperCase() + selectedCategoryId.slice(1);
            await addCustomSubcategory(selectedCategoryId, categoryLabel, name);
            setNewSubcategoryName('');
            await loadData();
        } catch (error: any) {
            console.error('Failed to add custom subcategory:', error);
            alert(error.message || 'Failed to add custom subcategory');
        } finally {
            setCategorySaving(false);
        }
    };

    const handleUpdateCustomSubcategory = async () => {
        if (!editingCustomSubcategory) return;
        const { categoryId, subcategoryId, name } = editingCustomSubcategory;
        const nextName = name.trim();
        if (!nextName) {
            alert('Subcategory name is required.');
            return;
        }

        try {
            setCategorySaving(true);
            await updateCustomSubcategory(categoryId, subcategoryId, nextName);
            setEditingCustomSubcategory(null);
            await loadData();
        } catch (error: any) {
            console.error('Failed to update custom subcategory:', error);
            alert(error.message || 'Failed to update custom subcategory');
        } finally {
            setCategorySaving(false);
        }
    };

    const handleDeleteCustomSubcategory = async (categoryId: string, subcategoryId: string) => {
        if (!confirm('Delete this custom subcategory?')) return;

        try {
            setCategorySaving(true);
            await deleteCustomSubcategory(categoryId, subcategoryId);
            await loadData();
        } catch (error: any) {
            console.error('Failed to delete custom subcategory:', error);
            alert(error.message || 'Failed to delete custom subcategory');
        } finally {
            setCategorySaving(false);
        }
    };

    useEffect(() => {
        const selected = String(selectedCategoryId || '').trim();
        if (!selected) {
            setCategoryProducts([]);
            return;
        }

        setCategoryProducts(
            allProductsForCategoryManagement.filter(
                (product) => String(product.category || '').trim() === selected
            )
        );
    }, [selectedCategoryId, allProductsForCategoryManagement]);

    const getAllSubcategoriesForSelectedCategory = (): string[] => {
        const fromMeta = categoryMetaMap[selectedCategoryId]?.subcategories || [];
        const fromCustom = (customCategoryData[selectedCategoryId] || []).map((sub) => sub.name);
        return Array.from(new Set([...fromMeta, ...fromCustom]))
            .filter(Boolean)
            .sort((a, b) => a.localeCompare(b));
    };

    const getCategoryLabel = (categoryId: string) =>
        categoryId
            .split('-')
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join(' ');

    const handleAssignProductToCategory = async () => {
        const productId = selectedProductIdForCategory;
        const categoryId = selectedCategoryId;
        const subcategory = targetSubcategoryForCategory.trim();

        if (!productId || !categoryId || !subcategory) {
            alert('Please select a product, category, and subcategory.');
            return;
        }

        const product = allProductsForCategoryManagement.find((p) => p.productId === productId);
        if (!product) {
            alert('Selected product not found. Please refresh and try again.');
            return;
        }

        try {
            setCategorySaving(true);
            await adminProductApi.updateProduct(
                product.productId,
                {
                    productId: product.productId,
                    name: product.name,
                    category: categoryId,
                    subcategory,
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
                    preserveExistingImages: true,
                },
                undefined,
                undefined,
                false
            );

            setSelectedProductIdForCategory('');
            setTargetSubcategoryForCategory('');
            await loadData();
            alert('Product category updated successfully.');
        } catch (error: any) {
            console.error('Failed to assign product to category:', error);
            alert(error.message || 'Failed to update product category');
        } finally {
            setCategorySaving(false);
        }
    };

    const handleRemoveProductFromCategory = async (product: Product) => {
        if (!confirm(`Remove "${product.name}" from ${getCategoryLabel(selectedCategoryId)}?`)) {
            return;
        }

        try {
            setCategorySaving(true);
            await adminProductApi.updateProduct(
                product.productId,
                {
                    productId: product.productId,
                    name: product.name,
                    category: 'uncategorized',
                    subcategory: 'general',
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
                    preserveExistingImages: true,
                },
                undefined,
                undefined,
                false
            );

            await loadData();
            alert('Product removed from category.');
        } catch (error: any) {
            console.error('Failed to remove product from category:', error);
            alert(error.message || 'Failed to remove product from category');
        } finally {
            setCategorySaving(false);
        }
    };

    const handleSelectAllProducts = () => {
        if (selectedProductIds.length === products.length && products.length > 0) {
            setSelectedProductIds([]);
        } else {
            setSelectedProductIds(products.map(p => p.productId));
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

                return adminProductApi.updateProduct(
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

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    const authHeaders = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('authToken')}` });

    const handleBulkStatusChange = async (status: 'active' | 'inactive' | 'draft') => {
        if (selectedProductIds.length === 0) return;
        setBulkActionLoading(`status-${status}`);
        try {
            const res = await fetch(`${API_BASE}/admin/products/bulk/status`, {
                method: 'PATCH',
                headers: authHeaders(),
                body: JSON.stringify({ productIds: selectedProductIds, status }),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.message);
            await loadData();
            setSelectedProductIds([]);
        } catch (err: any) {
            alert(err.message || 'Failed to update status');
        } finally {
            setBulkActionLoading(null);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedProductIds.length === 0) return;
        setBulkActionLoading('delete');
        try {
            const res = await fetch(`${API_BASE}/admin/products/bulk`, {
                method: 'DELETE',
                headers: authHeaders(),
                body: JSON.stringify({ productIds: selectedProductIds }),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.message);
            await loadData();
            setSelectedProductIds([]);
            setShowBulkDeleteModal(false);
        } catch (err: any) {
            alert(err.message || 'Failed to delete products');
        } finally {
            setBulkActionLoading(null);
        }
    };

    const handleBulkPriceAdjust = async () => {
        const numVal = parseFloat(bulkPriceData.value);
        if (!bulkPriceData.value || isNaN(numVal) || numVal <= 0) {
            alert('Please enter a valid positive number');
            return;
        }
        setBulkActionLoading('price');
        try {
            const res = await fetch(`${API_BASE}/admin/products/bulk/price`, {
                method: 'PATCH',
                headers: authHeaders(),
                body: JSON.stringify({
                    productIds: selectedProductIds,
                    adjustType: bulkPriceData.adjustType,
                    value: numVal,
                    direction: bulkPriceData.direction,
                }),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.message);
            await loadData();
            setSelectedProductIds([]);
            setShowBulkPriceModal(false);
            setBulkPriceData({ direction: 'increase', adjustType: 'percentage', value: '' });
        } catch (err: any) {
            alert(err.message || 'Failed to adjust prices');
        } finally {
            setBulkActionLoading(null);
        }
    };

    // ─── Bulk Edit (inline spreadsheet) handlers ───────────────────────────────
    const handleBulkEditChange = (productId: string, field: string, value: any) => {
        const original = products.find(p => p.productId === productId);
        if (!original) return;

        // Compute the original value for this field so we can detect no-op edits
        const originalVal = field === 'priceINR'
            ? (original.priceINR ? String(Math.round(original.priceINR)) : '')
            : String((original as any)[field] ?? '');

        setBulkEditChanges(prev => {
            const productChanges = { ...prev[productId] } as any;
            if (String(value) === originalVal) {
                delete productChanges[field];
            } else {
                productChanges[field] = value;
            }
            if (Object.keys(productChanges).length === 0) {
                const { [productId]: _removed, ...rest } = prev;
                return rest;
            }
            return { ...prev, [productId]: productChanges };
        });
    };

    const handleBulkEditSave = async () => {
        const changedIds = Object.keys(bulkEditChanges);
        if (!changedIds.length) return;
        setBulkEditSaving(true);
        try {
            await Promise.all(changedIds.map(productId => {
                const changes = bulkEditChanges[productId];
                const original = products.find(p => p.productId === productId);
                if (!original) return Promise.resolve();

                const newPriceINR = changes.priceINR !== undefined
                    ? Math.max(0.01, parseFloat(changes.priceINR))
                    : original.priceINR;

                return adminProductApi.updateProduct(productId, {
                    productId:      original.productId,
                    name:           changes.name           ?? original.name,
                    category:       changes.category       ?? original.category,
                    subcategory:    changes.subcategory    ?? original.subcategory,
                    description:    original.description,
                    subDescription: original.subDescription || '',
                    priceINR:       newPriceINR,
                    status:         changes.status          ?? original.status,
                    featured:       changes.featured        ?? (original.featured || false),
                    available:      original.available,
                    furnitureSpecs: original.furnitureSpecs,
                    discount:       original.discount,
                    hasVideo:       original.hasVideo,
                    preserveExistingImages: true,
                }, undefined, undefined, false);
            }));
            await loadData();
            setBulkEditChanges({});
        } catch (err: any) {
            alert(err.message || 'Failed to save changes');
        } finally {
            setBulkEditSaving(false);
        }
    };

    const handleBulkEditDiscard = () => {
        setBulkEditChanges({});
        setBulkEditMode(false);
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-sm border border-blue-200 p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-600 rounded-lg">
                                        <Percent className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-900">Discount Management</h3>
                                        <p className="text-xs text-gray-600">Manage product discounts and cleanup expired offers</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate('/admin/discounts')}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
                                >
                                    <Percent className="w-4 h-4" />
                                    Manage
                                </button>
                            </div>
                        </div>
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg shadow-sm border border-green-200 p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-600 rounded-lg">
                                        <Tag className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-900">Coupon Codes</h3>
                                        <p className="text-xs text-gray-600">Create and manage discount coupon codes for checkout</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate('/admin/coupons')}
                                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
                                >
                                    <Tag className="w-4 h-4" />
                                    Manage
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1 mb-6">
                        <div className="grid grid-cols-10 gap-1">
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
                                onClick={() => setActiveTab('categories')}
                                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-md font-medium text-sm transition-all ${activeTab === 'categories'
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <Tag className="w-4 h-4" />
                                <span>Categories</span>
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
                                onClick={() => setActiveTab('homepage')}
                                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-md font-medium text-sm transition-all ${activeTab === 'homepage'
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <Play className="w-4 h-4" />
                                <span>Home Page</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('popups')}
                                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-md font-medium text-sm transition-all ${activeTab === 'popups'
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <Bell className="w-4 h-4" />
                                <span>Popups</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('delivery-checks')}
                                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-md font-medium text-sm transition-all ${activeTab === 'delivery-checks'
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <Package className="w-4 h-4" />
                                <span>Delivery Checks</span>
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
                                        <div className="p-3 bg-blue-100 rounded-lg">
                                            <TrendingUp className="w-6 h-6 text-blue-600" />
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
                                                label={({ name, percent }) => `${name} ${(((percent || 0) * 100).toFixed(0))}%`}
                                                outerRadius={100}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {prepareOrderStatusData().map((entry, index) => (
                                                    <Cell key={`cell-${entry.name}-${index}`} fill={COLORS[index % COLORS.length]} />
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
                                    {analytics.orders.deliveryStatus.map((status) => (
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
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Contact Info</th>
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
                                                        {contact.phone && <div className="text-xs text-gray-500">{contact.phone}</div>}
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
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                            <p className="text-gray-900">
                                                {selectedContact.phone ? (
                                                    <a href={`tel:${selectedContact.phone}`} className="text-blue-600 hover:underline">
                                                        {selectedContact.phone}
                                                    </a>
                                                ) : 'N/A'}
                                            </p>
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
                        <div className="space-y-5">

                            {/* Ordering sub-view */}
                            {showOrdering ? (
                                <ProductOrderingManager onBack={() => setShowOrdering(false)} />
                            ) : (<>

                            {/* ── Top bar: title + Bulk Edit + Add button ── */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <h2 className="text-2xl font-bold text-gray-900">Listings</h2>
                                    {bulkEditMode && (
                                        <span className="px-2.5 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full animate-pulse">
                                            Bulk Edit Mode
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setShowOrdering(true)}
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-colors border bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M3 12h12M3 17h7" /></svg>
                                        Manage Order
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (bulkEditMode && Object.keys(bulkEditChanges).length > 0) {
                                                if (!window.confirm('Discard all unsaved changes?')) return;
                                            }
                                            setBulkEditMode(m => !m);
                                            setBulkEditChanges({});
                                        }}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-colors border ${
                                            bulkEditMode
                                                ? 'bg-gray-800 hover:bg-gray-900 text-white border-gray-800'
                                                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        <Edit2 className="w-4 h-4" />
                                        {bulkEditMode ? 'Exit Bulk Edit' : 'Bulk Edit'}
                                    </button>
                                    {!bulkEditMode && (
                                        <button
                                            onClick={() => { saveAdminProductsListState(buildProductsListState()); navigate('/admin/products/new'); }}
                                            className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold text-sm transition-colors shadow-sm"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Add a listing
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* ── Status tab pills + search + category filters ── */}
                            <div className="flex flex-wrap items-center gap-3">
                                {/* Status pills */}
                                <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                                    {(['', 'active', 'inactive', 'draft'] as const).map(s => (
                                        <button key={s}
                                            onClick={() => { setProductsStatusFilter(s); setProductsPage(1); }}
                                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                                                productsStatusFilter === s
                                                    ? 'bg-white text-gray-900 shadow-sm'
                                                    : 'text-gray-500 hover:text-gray-700'
                                            }`}>
                                            {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                                        </button>
                                    ))}
                                </div>

                                {/* Search */}
                                <div className="relative flex-1 min-w-[200px]">
                                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${productsLoading ? 'text-orange-400 animate-pulse' : 'text-gray-400'}`} />
                                    <input
                                        type="text"
                                        placeholder="Search listings…"
                                        value={productsSearch}
                                        onChange={e => { setProductsSearch(e.target.value); setProductsPage(1); }}
                                        className="w-full pl-9 pr-9 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white"
                                    />
                                    {productsLoading && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            <div className="w-4 h-4 border-2 border-gray-300 border-t-orange-500 rounded-full animate-spin" />
                                        </div>
                                    )}
                                </div>

                                {/* Category */}
                                <select
                                    value={productsCategoryFilter}
                                    onChange={e => { setProductsCategoryFilter(e.target.value); setProductsSubcategoryFilter(''); setProductsPage(1); }}
                                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white"
                                >
                                    <option value="">All Categories</option>
                                    {categoryOptions.map(cat => (
                                        <option key={cat} value={cat} className="capitalize">{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                                    ))}
                                </select>

                                {productsCategoryFilter && (categoryMetaMap[productsCategoryFilter]?.subcategories ?? []).length > 0 && (
                                    <select
                                        value={productsSubcategoryFilter}
                                        onChange={e => { setProductsSubcategoryFilter(e.target.value); setProductsPage(1); }}
                                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white"
                                    >
                                        <option value="">All Subcategories</option>
                                        {(categoryMetaMap[productsCategoryFilter]?.subcategories ?? []).map(sub => (
                                            <option key={sub} value={sub} className="capitalize">{sub.charAt(0).toUpperCase() + sub.slice(1)}</option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            {/* ── Bulk action bar (hidden in bulk edit mode) ── */}
                            {!bulkEditMode && selectedProductIds.length > 0 && (
                                <div className="flex flex-wrap items-center gap-2 bg-white border border-orange-200 rounded-xl px-4 py-3 shadow-sm">
                                    {/* Selection info */}
                                    <div className="flex items-center gap-2 mr-1">
                                        <span className="text-sm font-bold text-gray-900">{selectedProductIds.length} selected</span>
                                        <button onClick={handleSelectAllProducts} className="text-xs text-orange-600 hover:text-orange-800 font-medium underline-offset-2 hover:underline transition-colors">
                                            {selectedProductIds.length === products.length ? 'Deselect all' : 'Select all'}
                                        </button>
                                        <button onClick={() => setSelectedProductIds([])} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">✕ Clear</button>
                                    </div>

                                    <div className="h-5 w-px bg-gray-200 mx-1" />

                                    {/* Status group */}
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Status:</span>
                                        {(['active', 'inactive', 'draft'] as const).map(s => (
                                            <button key={s} onClick={() => handleBulkStatusChange(s)}
                                                disabled={bulkActionLoading !== null}
                                                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors disabled:opacity-50 ${
                                                    s === 'active'   ? 'border-green-200  text-green-700  hover:bg-green-50'  :
                                                    s === 'inactive' ? 'border-gray-200   text-gray-600   hover:bg-gray-50'   :
                                                                       'border-yellow-200 text-yellow-700 hover:bg-yellow-50'
                                                }`}>
                                                {bulkActionLoading === `status-${s}` ? '…' : s.charAt(0).toUpperCase() + s.slice(1)}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="h-5 w-px bg-gray-200 mx-1" />

                                    {/* Price + Discount */}
                                    <div className="flex items-center gap-1.5">
                                        <button onClick={() => setShowBulkPriceModal(true)}
                                            disabled={bulkActionLoading !== null}
                                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50">
                                            <TrendingUp className="w-3.5 h-3.5" /> Edit Price
                                        </button>
                                        <button onClick={() => setShowBulkDiscountModal(true)}
                                            disabled={bulkActionLoading !== null}
                                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors disabled:opacity-50">
                                            <Percent className="w-3.5 h-3.5" /> Discount
                                        </button>
                                    </div>

                                    <div className="h-5 w-px bg-gray-200 mx-1" />

                                    {/* Delete */}
                                    <button onClick={() => setShowBulkDeleteModal(true)}
                                        disabled={bulkActionLoading !== null}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50">
                                        {bulkActionLoading === 'delete'
                                            ? <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                                            : <Trash2 className="w-3.5 h-3.5" />}
                                        Delete
                                    </button>
                                </div>
                            )}

                            {/* ── Bulk Edit inline table ── */}
                            {bulkEditMode && (
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-50 border-b border-gray-100">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-12"></th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-24">Photo</th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-36">Price (₹)</th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-36">Category</th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-40">Subcategory</th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-36">Status</th>
                                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide w-24">Featured</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {products.map(product => {
                                                    const ch = bulkEditChanges[product.productId] || {};
                                                    const isDirty = Object.keys(ch).length > 0;
                                                    const displayName    = ch.name     ?? product.name;
                                                    const displayPriceINR = ch.priceINR ?? (product.priceINR ? String(Math.round(product.priceINR)) : '');
                                                    const displayStatus  = ch.status   ?? product.status;
                                                    const displayFeatured = ch.featured ?? (product.featured || false);
                                                    const displayCategory = ch.category ?? (product.category || '');
                                                    const displaySubcategory = ch.subcategory ?? (product.subcategory || '');

                                                    const cellCls = (field: string) =>
                                                        `w-full px-3 py-2 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent ${
                                                            (ch as any)[field] !== undefined
                                                                ? 'border-orange-300 bg-orange-50'
                                                                : 'border-gray-200 bg-white hover:border-gray-300'
                                                        }`;

                                                    return (
                                                        <tr key={product._id}
                                                            className={`transition-colors ${isDirty ? 'bg-orange-50/40 border-l-2 border-l-orange-400' : 'hover:bg-gray-50/50'}`}>
                                                            {/* Changed indicator */}
                                                            <td className="px-4 py-3 text-center">
                                                                {isDirty
                                                                    ? <span className="inline-block w-2 h-2 rounded-full bg-orange-500" title="Unsaved changes" />
                                                                    : <span className="inline-block w-2 h-2 rounded-full bg-gray-200" />}
                                                            </td>
                                                            {/* Thumbnail */}
                                                            <td className="px-4 py-3">
                                                                <img src={product.image} alt={product.name}
                                                                    className="w-16 h-16 object-cover rounded-lg border border-gray-100" />
                                                            </td>
                                                            {/* Name */}
                                                            <td className="px-4 py-3 min-w-[220px]">
                                                                <input type="text" value={displayName}
                                                                    onChange={e => handleBulkEditChange(product.productId, 'name', e.target.value)}
                                                                    className={cellCls('name')} />
                                                                <p className="text-xs text-gray-400 mt-0.5 pl-1">{product.productId}</p>
                                                            </td>
                                                            {/* Price */}
                                                            <td className="px-4 py-3">
                                                                <div className="relative">
                                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">₹</span>
                                                                    <input type="number" min="0" value={displayPriceINR}
                                                                        onChange={e => handleBulkEditChange(product.productId, 'priceINR', e.target.value)}
                                                                        className={`${cellCls('priceINR')} pl-7`} />
                                                                </div>
                                                            </td>
                                                            {/* Category */}
                                                            <td className="px-4 py-3 min-w-[140px]">
                                                                <select value={displayCategory}
                                                                    onChange={e => {
                                                                        handleBulkEditChange(product.productId, 'category', e.target.value);
                                                                        handleBulkEditChange(product.productId, 'subcategory', '');
                                                                    }}
                                                                    className={cellCls('category')}>
                                                                    {categoryOptions.map(cat => (
                                                                        <option key={cat} value={cat}>{cat}</option>
                                                                    ))}
                                                                </select>
                                                            </td>
                                                            {/* Subcategory */}
                                                            <td className="px-4 py-3 min-w-[160px]">
                                                                <select value={displaySubcategory}
                                                                    onChange={e => handleBulkEditChange(product.productId, 'subcategory', e.target.value)}
                                                                    className={cellCls('subcategory')}>
                                                                    <option value="">— none —</option>
                                                                    {(categoryMetaMap[displayCategory]?.subcategories || []).map(sub => (
                                                                        <option key={sub} value={sub}>{sub}</option>
                                                                    ))}
                                                                </select>
                                                            </td>
                                                            {/* Status */}
                                                            <td className="px-4 py-3">
                                                                <select value={displayStatus}
                                                                    onChange={e => handleBulkEditChange(product.productId, 'status', e.target.value)}
                                                                    className={cellCls('status')}>
                                                                    <option value="active">Active</option>
                                                                    <option value="inactive">Inactive</option>
                                                                    <option value="draft">Draft</option>
                                                                </select>
                                                            </td>
                                                            {/* Featured */}
                                                            <td className="px-4 py-3 text-center">
                                                                <button type="button"
                                                                    onClick={() => handleBulkEditChange(product.productId, 'featured', !displayFeatured)}
                                                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400 ${displayFeatured ? 'bg-orange-500' : 'bg-gray-200'}`}>
                                                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${displayFeatured ? 'translate-x-6' : 'translate-x-1'}`} />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                                {products.length === 0 && (
                                                    <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-400 text-sm">No listings found</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Sticky footer */}
                                    <div className={`sticky bottom-0 border-t px-6 py-4 flex items-center justify-between rounded-b-2xl transition-colors ${
                                        Object.keys(bulkEditChanges).length > 0 ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-100'
                                    }`}>
                                        <p className="text-sm text-gray-600">
                                            {Object.keys(bulkEditChanges).length > 0
                                                ? <span className="font-semibold text-orange-700">{Object.keys(bulkEditChanges).length} listing{Object.keys(bulkEditChanges).length !== 1 ? 's' : ''} modified</span>
                                                : 'Click any cell to edit. Orange cells have unsaved changes.'}
                                        </p>
                                        <div className="flex items-center gap-3">
                                            <button onClick={handleBulkEditDiscard}
                                                className="px-4 py-2 border border-gray-200 bg-white rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                                                Discard
                                            </button>
                                            <button onClick={handleBulkEditSave}
                                                disabled={Object.keys(bulkEditChanges).length === 0 || bulkEditSaving}
                                                className="px-5 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-2">
                                                {bulkEditSaving && (
                                                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                                                    </svg>
                                                )}
                                                {bulkEditSaving
                                                    ? 'Saving…'
                                                    : Object.keys(bulkEditChanges).length > 0
                                                        ? `Save ${Object.keys(bulkEditChanges).length} change${Object.keys(bulkEditChanges).length !== 1 ? 's' : ''}`
                                                        : 'No changes'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ── Product card grid ── */}
                            {!bulkEditMode && <div className="relative">
                                {productsLoading && products.length === 0 && (
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                        {Array.from({ length: 10 }).map((_, i) => (
                                            <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
                                                <div className="aspect-square bg-gray-100" />
                                                <div className="p-3 space-y-2">
                                                    <div className="h-3 bg-gray-100 rounded w-3/4" />
                                                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {!productsLoading && products.length === 0 && (
                                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm py-20 flex flex-col items-center justify-center gap-4">
                                        <Package className="w-14 h-14 text-gray-300" />
                                        <div className="text-center">
                                            <p className="text-lg font-semibold text-gray-700">No listings found</p>
                                            <p className="text-sm text-gray-400 mt-1">
                                                {productsSearch || productsCategoryFilter || productsStatusFilter
                                                    ? 'Try adjusting your filters or search'
                                                    : 'Get started by adding your first listing'}
                                            </p>
                                        </div>
                                        {!productsSearch && !productsCategoryFilter && !productsStatusFilter && (
                                            <button onClick={() => handleOpenProductModal()}
                                                className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold text-sm transition-colors">
                                                Add a listing
                                            </button>
                                        )}
                                    </div>
                                )}

                                {products.length > 0 && (
                                    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 ${productsLoading ? 'opacity-60 pointer-events-none' : ''}`}>
                                        {products.map(product => {
                                            const isSelected = selectedProductIds.includes(product.productId);
                                            const now = new Date();
                                            const discountStart = product.discount?.startDate ? new Date(product.discount.startDate) : null;
                                            const discountEnd = product.discount?.endDate ? new Date(product.discount.endDate) : null;
                                            const discountActive = product.discount?.enabled && product.discount.percentage > 0;
                                            const discountBadge = !discountActive ? null
                                                : discountStart && now < discountStart ? { label: 'Scheduled', cls: 'bg-yellow-100 text-yellow-700' }
                                                : discountEnd && now > discountEnd   ? { label: 'Expired',   cls: 'bg-red-100 text-red-700'    }
                                                : { label: `${product.discount!.percentage}% OFF`, cls: 'bg-green-100 text-green-700' };

                                            return (
                                                <div key={product._id}
                                                    className={`group relative bg-white rounded-xl border shadow-sm hover:shadow-md transition-all overflow-hidden ${isSelected ? 'border-orange-400 ring-2 ring-orange-300' : 'border-gray-100'}`}>

                                                    {/* Checkbox — always visible when selected, else on hover */}
                                                    <div className={`absolute top-2 left-2 z-10 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => handleSelectProduct(product.productId)}
                                                            className="w-4 h-4 text-orange-500 rounded border-gray-300 bg-white shadow cursor-pointer"
                                                            onClick={e => e.stopPropagation()}
                                                        />
                                                    </div>

                                                    {/* Video badge */}
                                                    {product.hasVideo && (
                                                        <div className="absolute top-2 right-2 z-10 bg-purple-600 text-white rounded-full p-1 shadow" title="Has video">
                                                            <Play className="w-2.5 h-2.5" />
                                                        </div>
                                                    )}

                                                    {/* Image */}
                                                    <div className="aspect-square overflow-hidden bg-gray-50">
                                                        <img src={product.image} alt={product.name}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                                    </div>

                                                    {/* Hover action overlay */}
                                                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-none group-hover:pointer-events-auto">
                                                        <button
                                                            onClick={() => {
                                                                saveAdminProductsListState(buildProductsListState());
                                                                navigate(`/admin/products/${product.productId}/edit`, { state: { product } });
                                                            }}
                                                            className="p-2 bg-white rounded-full shadow-lg hover:scale-110 transition-transform"
                                                            title="Edit listing"
                                                        >
                                                            <Edit2 className="w-4 h-4 text-gray-700" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteProduct(product.productId)}
                                                            disabled={deletingProductId === product.productId}
                                                            className="p-2 bg-white rounded-full shadow-lg hover:scale-110 transition-transform disabled:opacity-50"
                                                            title="Delete listing"
                                                        >
                                                            {deletingProductId === product.productId
                                                                ? <svg className="animate-spin h-4 w-4 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                                                                : <Trash2 className="w-4 h-4 text-red-500" />}
                                                        </button>
                                                    </div>

                                                    {/* Info area */}
                                                    <div className="p-3">
                                                        <div className="flex items-start justify-between gap-1 mb-0.5">
                                                            <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug flex-1">{product.name}</p>
                                                            {/* Status dot */}
                                                            <span className={`mt-0.5 shrink-0 w-2 h-2 rounded-full ${product.status === 'active' ? 'bg-green-500' : product.status === 'inactive' ? 'bg-gray-400' : 'bg-yellow-500'}`} title={product.status} />
                                                        </div>
                                                        <p className="text-xs text-gray-400 mb-2 capitalize">{product.subcategory}</p>
                                                        <div className="flex items-end justify-between gap-1">
                                                            <div>
                                                                {product.priceINR ? (
                                                                    discountActive ? (
                                                                        <div>
                                                                            <p className="text-sm font-bold text-gray-900">{formatAdminINR(product.priceINR * (1 - product.discount!.percentage / 100))}</p>
                                                                            <p className="text-xs text-gray-400 line-through leading-none">{formatAdminINR(product.priceINR)}</p>
                                                                        </div>
                                                                    ) : (
                                                                        <p className="text-sm font-bold text-gray-900">{formatAdminINR(product.priceINR)}</p>
                                                                    )
                                                                ) : <p className="text-xs text-gray-400 italic">Price on request</p>}
                                                            </div>
                                                            {discountBadge && (
                                                                <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full shrink-0 ${discountBadge.cls}`}>
                                                                    {discountBadge.label}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>}

                            {/* ── Pagination ── */}
                            {productsPagination && productsPagination.total > 1 && (
                                <div className="flex items-center justify-between pt-2">
                                    <p className="text-sm text-gray-500">
                                        Showing {products.length} of {productsPagination.totalItems} listings
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setProductsPage(Math.max(1, productsPage - 1))}
                                            disabled={productsPage === 1}
                                            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>
                                        <span className="px-4 py-2 text-sm font-medium text-gray-700">
                                            {productsPage} / {productsPagination.total}
                                        </span>
                                        <button
                                            onClick={() => setProductsPage(Math.min(productsPagination.total, productsPage + 1))}
                                            disabled={productsPage === productsPagination.total}
                                            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* ── Bulk Regional Pricing ── */}
                            <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
                                <div className="px-6 py-5 border-b border-gray-100">
                                    <h3 className="font-semibold text-gray-900">Bulk Regional Pricing</h3>
                                    <p className="text-sm text-gray-400 mt-0.5">
                                        Apply region-wise price adjustments to multiple products at once.
                                    </p>
                                </div>
                                <div className="p-6">
                                    <BulkRegionalPricing
                                        categories={categoryOptions.map(cat => ({
                                            category: cat,
                                            subcategories: categoryMetaMap[cat]?.subcategories || []
                                        }))}
                                    />
                                </div>
                            </div>

                        </>)}
                        </div>
                    )}

                    {/* Categories Tab */}
                    {activeTab === 'categories' && (
                        <NavbarCategoriesEditor />
                    )}

                    {/* Home Page Management Tab */}
                    {activeTab === 'homepage' && <HomePageManagement />}

                    {/* Popup Management Tab */}
                    {activeTab === 'popups' && <PopupManagement />}

                    {/* Delivery Check Analytics Tab */}
                    {activeTab === 'delivery-checks' && <DeliveryCheckAnalyticsTab />}


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


                    {/* ── Bulk Delete Confirmation Modal ── */}
                    {showBulkDeleteModal && isMounted && typeof document !== 'undefined' && document.body && createPortal(
                        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                            onClick={() => setShowBulkDeleteModal(false)}>
                            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5"
                                onClick={e => e.stopPropagation()}>
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                                        <Trash2 className="w-5 h-5 text-red-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-gray-900">Delete {selectedProductIds.length} listing{selectedProductIds.length !== 1 ? 's' : ''}?</h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            This will permanently remove the listing{selectedProductIds.length !== 1 ? 's' : ''}, including all images and media.
                                            This action <strong>cannot be undone</strong>.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button onClick={() => setShowBulkDeleteModal(false)}
                                        className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                                        Cancel
                                    </button>
                                    <button onClick={handleBulkDelete} disabled={bulkActionLoading === 'delete'}
                                        className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                                        {bulkActionLoading === 'delete'
                                            ? <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Deleting…</>
                                            : `Delete ${selectedProductIds.length} listing${selectedProductIds.length !== 1 ? 's' : ''}`}
                                    </button>
                                </div>
                            </div>
                        </div>
                        , document.body)}

                    {/* ── Bulk Price Adjust Modal ── */}
                    {showBulkPriceModal && isMounted && typeof document !== 'undefined' && document.body && createPortal(
                        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                            onClick={() => setShowBulkPriceModal(false)}>
                            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5"
                                onClick={e => e.stopPropagation()}>
                                <div className="flex items-center justify-between">
                                    <h3 className="text-base font-bold text-gray-900">Edit Price — {selectedProductIds.length} listing{selectedProductIds.length !== 1 ? 's' : ''}</h3>
                                    <button onClick={() => setShowBulkPriceModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                                        <X className="w-4 h-4 text-gray-500" />
                                    </button>
                                </div>

                                {/* Direction toggle */}
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Direction</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {(['increase', 'decrease'] as const).map(d => (
                                            <button key={d} onClick={() => setBulkPriceData(p => ({ ...p, direction: d }))}
                                                className={`py-2 rounded-xl text-sm font-semibold border transition-colors ${bulkPriceData.direction === d ? (d === 'increase' ? 'bg-green-500 text-white border-green-500' : 'bg-red-500 text-white border-red-500') : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                                                {d === 'increase' ? '↑ Increase' : '↓ Decrease'}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Type toggle */}
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Adjust by</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {([['percentage', 'Percentage (%)'], ['fixed_inr', 'Fixed amount (₹)']] as const).map(([val, label]) => (
                                            <button key={val} onClick={() => setBulkPriceData(p => ({ ...p, adjustType: val, value: '' }))}
                                                className={`py-2 rounded-xl text-sm font-semibold border transition-colors ${bulkPriceData.adjustType === val ? 'bg-blue-500 text-white border-blue-500' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Value input */}
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Value</p>
                                    <div className="relative">
                                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-medium pointer-events-none">
                                            {bulkPriceData.adjustType === 'percentage' ? '%' : '₹'}
                                        </span>
                                        <input type="number" min="0" step={bulkPriceData.adjustType === 'percentage' ? '0.1' : '1'}
                                            value={bulkPriceData.value}
                                            onChange={e => setBulkPriceData(p => ({ ...p, value: e.target.value }))}
                                            placeholder={bulkPriceData.adjustType === 'percentage' ? 'e.g. 10' : 'e.g. 5000'}
                                            className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent" />
                                    </div>
                                    {bulkPriceData.value && parseFloat(bulkPriceData.value) > 0 && (
                                        <p className="text-xs text-gray-400 mt-1.5">
                                            Prices will <strong>{bulkPriceData.direction}</strong> by{' '}
                                            {bulkPriceData.adjustType === 'percentage' ? `${bulkPriceData.value}%` : `₹${parseFloat(bulkPriceData.value).toLocaleString('en-IN')}`} across <strong>{selectedProductIds.length}</strong> listing{selectedProductIds.length !== 1 ? 's' : ''}
                                        </p>
                                    )}
                                </div>

                                <div className="flex gap-3 pt-1">
                                    <button onClick={() => setShowBulkPriceModal(false)}
                                        className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                                        Cancel
                                    </button>
                                    <button onClick={handleBulkPriceAdjust} disabled={bulkActionLoading === 'price' || !bulkPriceData.value || parseFloat(bulkPriceData.value) <= 0}
                                        className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                                        {bulkActionLoading === 'price'
                                            ? <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Applying…</>
                                            : 'Apply'}
                                    </button>
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
                                                                {previewProduct.discount?.enabled && previewProduct.discount?.percentage ? (
                                                                    <>
                                                                        <span className="text-lg font-bold text-gray-900">
                                                                            {formatAdminINR(Math.round(previewProduct.priceINR * (1 - (previewProduct.discount.percentage / 100)) * 100) / 100)}
                                                                        </span>
                                                                        <br />
                                                                        <span className="text-sm text-gray-500 line-through">
                                                                            {formatAdminINR(previewProduct.priceINR)}
                                                                        </span>
                                                                        <span className="ml-2 px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                                                                            {previewProduct.discount.percentage}% OFF
                                                                        </span>
                                                                    </>
                                                                ) : (
                                                                    <span className="text-lg font-bold text-gray-900">
                                                                        {formatAdminINR(previewProduct.priceINR)}
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

// ─── Delivery Check Analytics tab ────────────────────────────────────────────

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

interface DeliveryRecord {
    _id: string;
    countryCode: string;
    countryName: string;
    postalCode: string;
    productId: string;
    result: 'available' | 'unavailable';
    createdAt: string;
}

interface CountryStat {
    countryCode: string;
    countryName: string;
    total: number;
    available: number;
    unavailable: number;
}

function DeliveryCheckAnalyticsTab() {
    const [records, setRecords]         = useState<DeliveryRecord[]>([]);
    const [byCountry, setByCountry]     = useState<CountryStat[]>([]);
    const [byResult, setByResult]       = useState<Record<string, number>>({});
    const [total, setTotal]             = useState(0);
    const [loading, setLoading]         = useState(true);
    const [error, setError]             = useState('');
    const [filterCountry, setFilterCountry] = useState('');
    const [page, setPage]               = useState(1);
    const [totalPages, setTotalPages]   = useState(1);

    const fetchData = async (pg = 1, country = '') => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('authToken');
            const params = new URLSearchParams({ page: String(pg), limit: '50' });
            if (country) params.set('country', country);
            const res = await fetch(`${API_URL}/admin/delivery-analytics?${params}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error('Failed to fetch');
            const json = await res.json();
            setRecords(json.data.records);
            setByCountry(json.data.byCountry);
            setByResult(json.data.byResult || {});
            setTotal(json.data.total);
            setTotalPages(json.pagination.total);
        } catch (e: any) {
            setError(e.message || 'Error loading data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(1, filterCountry); }, []);

    const handleFilter = () => { setPage(1); fetchData(1, filterCountry); };
    const handlePage = (p: number) => { setPage(p); fetchData(p, filterCountry); };

    const available   = byResult['available']   || 0;
    const unavailable = byResult['unavailable'] || 0;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Delivery Check Analytics</h2>
                    <p className="text-sm text-gray-500 mt-0.5">Countries and pincodes users checked on product pages</p>
                </div>
                <button onClick={() => fetchData(page, filterCountry)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">
                    Refresh
                </button>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total Checks</p>
                    <p className="text-2xl font-bold text-gray-900">{total.toLocaleString()}</p>
                </div>
                <div className="bg-white border border-green-200 rounded-xl p-4">
                    <p className="text-xs text-green-600 uppercase tracking-wide mb-1">Available</p>
                    <p className="text-2xl font-bold text-green-700">{available.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">{total ? Math.round(available / total * 100) : 0}% of checks</p>
                </div>
                <div className="bg-white border border-red-200 rounded-xl p-4">
                    <p className="text-xs text-red-500 uppercase tracking-wide mb-1">Unavailable</p>
                    <p className="text-2xl font-bold text-red-600">{unavailable.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">{total ? Math.round(unavailable / total * 100) : 0}% of checks</p>
                </div>
            </div>

            {/* Country breakdown */}
            {byCountry.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="px-5 py-3 border-b border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-800">By Country</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                                <tr>
                                    <th className="px-5 py-3 text-left">Country</th>
                                    <th className="px-5 py-3 text-right">Total</th>
                                    <th className="px-5 py-3 text-right">Available</th>
                                    <th className="px-5 py-3 text-right">Unavailable</th>
                                    <th className="px-5 py-3 text-left">Share</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {byCountry.map(c => (
                                    <tr key={c.countryCode} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-5 py-3 font-medium text-gray-900">{c.countryName} <span className="text-gray-400 text-xs ml-1">{c.countryCode}</span></td>
                                        <td className="px-5 py-3 text-right font-semibold">{c.total}</td>
                                        <td className="px-5 py-3 text-right text-green-600">{c.available}</td>
                                        <td className="px-5 py-3 text-right text-red-500">{c.unavailable}</td>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 bg-gray-100 rounded-full h-1.5 min-w-[60px]">
                                                    <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${total ? Math.round(c.total / total * 100) : 0}%` }} />
                                                </div>
                                                <span className="text-xs text-gray-400 w-8 text-right">{total ? Math.round(c.total / total * 100) : 0}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Filter + recent records */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-3">
                    <h3 className="text-sm font-semibold text-gray-800 mr-auto">Recent Checks</h3>
                    <input
                        type="text"
                        value={filterCountry}
                        onChange={e => setFilterCountry(e.target.value.toUpperCase())}
                        onKeyDown={e => e.key === 'Enter' && handleFilter()}
                        placeholder="Filter by country code (e.g. IN)"
                        className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs w-52 focus:outline-none focus:border-blue-400"
                    />
                    <button onClick={handleFilter} className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700">Apply</button>
                    {filterCountry && <button onClick={() => { setFilterCountry(''); fetchData(1, ''); }} className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-200">Clear</button>}
                </div>

                {loading && <div className="px-5 py-8 text-center text-gray-400 text-sm">Loading...</div>}
                {error  && <div className="px-5 py-8 text-center text-red-500 text-sm">{error}</div>}
                {!loading && !error && records.length === 0 && (
                    <div className="px-5 py-8 text-center text-gray-400 text-sm">No delivery checks recorded yet.</div>
                )}
                {!loading && records.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                                <tr>
                                    <th className="px-5 py-3 text-left">Country</th>
                                    <th className="px-5 py-3 text-left">Pincode</th>
                                    <th className="px-5 py-3 text-left">Product</th>
                                    <th className="px-5 py-3 text-left">Result</th>
                                    <th className="px-5 py-3 text-left">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {records.map(r => (
                                    <tr key={r._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-5 py-3 font-medium text-gray-900">{r.countryName} <span className="text-gray-400 text-xs">{r.countryCode}</span></td>
                                        <td className="px-5 py-3 text-gray-600">{r.postalCode || <span className="text-gray-300">—</span>}</td>
                                        <td className="px-5 py-3 text-gray-600 font-mono text-xs">{r.productId || <span className="text-gray-300">—</span>}</td>
                                        <td className="px-5 py-3">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${r.result === 'available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                                                {r.result}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-gray-400 text-xs whitespace-nowrap">
                                            {new Date(r.createdAt).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                        <span>Page {page} of {totalPages}</span>
                        <div className="flex gap-1.5">
                            <button disabled={page <= 1} onClick={() => handlePage(page - 1)} className="px-3 py-1.5 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors">Prev</button>
                            <button disabled={page >= totalPages} onClick={() => handlePage(page + 1)} className="px-3 py-1.5 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors">Next</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}


