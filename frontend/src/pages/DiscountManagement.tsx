import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import adminDiscountAnalyticsService from '../services/adminDiscountAnalyticsService';
import { Percent, TrendingUp, Calendar, AlertCircle, RefreshCw, Filter, Search, Plus, Trash2, X, Check } from 'lucide-react';

interface DiscountAnalytics {
    total: number;
    active: number;
    scheduled: number;
    expired: number;
    needsCleanup: number;
    avgPercentage: number;
    maxPercentage: number;
    minPercentage: number;
    expiringSoon: Array<{
        productId: string;
        name: string;
        discount: any;
        endDate: string;
        daysRemaining: number;
    }>;
}

interface DiscountedProduct {
    _id: string;
    productId: string;
    name: string;
    category: string;
    subcategory: string;
    priceINR: number;
    discount: {
        enabled: boolean;
        percentage: number;
        startDate?: string;
        endDate?: string;
        description?: string;
    };
    image: string;
    discountStatus: {
        status: 'active' | 'scheduled' | 'expired' | 'none';
        message: string;
        daysRemaining?: number;
        hoursRemaining?: number;
        isExpiringSoon?: boolean;
    };
    finalPrice: number;
}

const DiscountManagement: React.FC = () => {
    const { token } = useAuth();
    const { formatPrice } = useCurrency();

    // State
    const [analytics, setAnalytics] = useState<DiscountAnalytics | null>(null);
    const [products, setProducts] = useState<DiscountedProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [cleanupLoading, setCleanupLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'scheduled' | 'expired'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState<any>(null);
    
    // Bulk selection state
    const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
    const [selectAll, setSelectAll] = useState(false);
    
    // Modal state
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [showAllModal, setShowAllModal] = useState(false);
    const [bulkDiscount, setBulkDiscount] = useState({
        percentage: 10,
        startDate: '',
        endDate: '',
        description: ''
    });

    // Load data
    const loadData = async () => {
        if (!token) return;

        try {
            setLoading(true);

            // Load analytics
            const analyticsData = await adminDiscountAnalyticsService.getDiscountAnalytics(token);
            setAnalytics(analyticsData);

            // Load products
            const productsData = await adminDiscountAnalyticsService.getDiscountedProducts(token, {
                page,
                limit: 20,
                status: statusFilter
            });
            setProducts(productsData.data);
            setPagination(productsData.pagination);

        } catch (error: any) {
            console.error('Load data error:', error);
            alert(error.message || 'Failed to load discount data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        // Clear selections when filter changes
        setSelectedProducts(new Set());
        setSelectAll(false);
    }, [token, page, statusFilter]);

    // Handle cleanup expired discounts
    const handleCleanup = async () => {
        if (!token) return;

        if (!confirm('Disable all expired discounts? This cannot be undone.')) return;

        try {
            setCleanupLoading(true);
            const result = await adminDiscountAnalyticsService.disableExpiredDiscounts(token);
            alert(`✅ Successfully disabled ${result.disabledCount} expired discount(s)`);
            loadData();
        } catch (error: any) {
            console.error('Cleanup error:', error);
            alert(error.message || 'Failed to cleanup expired discounts');
        } finally {
            setCleanupLoading(false);
        }
    };

    // Handle select all
    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedProducts(new Set());
        } else {
            const allIds = new Set(filteredProducts.map(p => p._id));
            setSelectedProducts(allIds);
        }
        setSelectAll(!selectAll);
    };

    // Handle individual selection
    const handleSelectProduct = (productId: string) => {
        const newSelected = new Set(selectedProducts);
        if (newSelected.has(productId)) {
            newSelected.delete(productId);
        } else {
            newSelected.add(productId);
        }
        setSelectedProducts(newSelected);
        setSelectAll(newSelected.size === filteredProducts.length);
    };

    // Apply discount to all products
    const handleApplyToAll = async () => {
        if (!token) return;
        
        if (!bulkDiscount.percentage || bulkDiscount.percentage <= 0) {
            alert('Please enter a valid discount percentage');
            return;
        }

        if (!confirm(`Apply ${bulkDiscount.percentage}% discount to ALL products? This will override existing discounts.`)) return;

        try {
            setLoading(true);
            const result = await adminDiscountAnalyticsService.applyDiscountToAll(bulkDiscount, token);
            alert(`✅ Discount applied to ${result.updatedCount} product(s)`);
            setShowAllModal(false);
            setBulkDiscount({ percentage: 10, startDate: '', endDate: '', description: '' });
            loadData();
        } catch (error: any) {
            console.error('Apply to all error:', error);
            alert(error.message || 'Failed to apply discount to all products');
        } finally {
            setLoading(false);
        }
    };

    // Remove discount from all products
    const handleRemoveFromAll = async () => {
        if (!token) return;

        if (!confirm('Remove discount from ALL products? This cannot be undone.')) return;

        try {
            setLoading(true);
            const result = await adminDiscountAnalyticsService.removeDiscountFromAll(token);
            alert(`✅ Discount removed from ${result.updatedCount} product(s)`);
            loadData();
        } catch (error: any) {
            console.error('Remove from all error:', error);
            alert(error.message || 'Failed to remove discount from all products');
        } finally {
            setLoading(false);
        }
    };

    // Apply discount to selected products
    const handleApplyToSelected = async () => {
        if (!token) return;
        
        if (selectedProducts.size === 0) {
            alert('Please select at least one product');
            return;
        }

        if (!bulkDiscount.percentage || bulkDiscount.percentage <= 0) {
            alert('Please enter a valid discount percentage');
            return;
        }

        if (!confirm(`Apply ${bulkDiscount.percentage}% discount to ${selectedProducts.size} selected product(s)?`)) return;

        try {
            setLoading(true);
            const productIds = Array.from(selectedProducts);
            const result = await adminDiscountAnalyticsService.applyBulkDiscount(productIds, bulkDiscount, token);
            alert(`✅ Discount applied to ${result.updatedCount} product(s)`);
            setShowBulkModal(false);
            setBulkDiscount({ percentage: 10, startDate: '', endDate: '', description: '' });
            setSelectedProducts(new Set());
            setSelectAll(false);
            loadData();
        } catch (error: any) {
            console.error('Apply bulk error:', error);
            alert(error.message || 'Failed to apply bulk discount');
        } finally {
            setLoading(false);
        }
    };

    // Remove discount from selected products
    const handleRemoveFromSelected = async () => {
        if (!token) return;
        
        if (selectedProducts.size === 0) {
            alert('Please select at least one product');
            return;
        }

        if (!confirm(`Remove discount from ${selectedProducts.size} selected product(s)?`)) return;

        try {
            setLoading(true);
            const productIds = Array.from(selectedProducts);
            const result = await adminDiscountAnalyticsService.removeBulkDiscount(productIds, token);
            alert(`✅ Discount removed from ${result.updatedCount} product(s)`);
            setSelectedProducts(new Set());
            setSelectAll(false);
            loadData();
        } catch (error: any) {
            console.error('Remove bulk error:', error);
            alert(error.message || 'Failed to remove bulk discount');
        } finally {
            setLoading(false);
        }
    };

    // Remove discount from single product
    const handleRemoveSingle = async (productId: string, productName: string) => {
        if (!token) return;

        if (!confirm(`Remove discount from "${productName}"?`)) return;

        try {
            await adminDiscountAnalyticsService.removeProductDiscount(productId, token);
            alert('✅ Discount removed successfully');
            loadData();
        } catch (error: any) {
            console.error('Remove single error:', error);
            alert(error.message || 'Failed to remove discount');
        }
    };

    // Filter products by search
    const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.productId.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Format date
    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Percent className="w-8 h-8 text-blue-600" />
                        Discount Management
                    </h1>
                    <p className="mt-2 text-gray-600">Manage and monitor product discounts across your catalog</p>
                </div>

                {/* Analytics Cards */}
                {analytics && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {/* Active Discounts */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Active Discounts</p>
                                    <p className="text-3xl font-bold text-green-600 mt-2">{analytics.active}</p>
                                </div>
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                    <TrendingUp className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-3">Currently running</p>
                        </div>

                        {/* Scheduled Discounts */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Scheduled</p>
                                    <p className="text-3xl font-bold text-yellow-600 mt-2">{analytics.scheduled}</p>
                                </div>
                                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                                    <Calendar className="w-6 h-6 text-yellow-600" />
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-3">Starting soon</p>
                        </div>

                        {/* Expired Discounts */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Expired</p>
                                    <p className="text-3xl font-bold text-red-600 mt-2">{analytics.expired}</p>
                                </div>
                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                    <AlertCircle className="w-6 h-6 text-red-600" />
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-3">Needs cleanup</p>
                        </div>

                        {/* Average Discount */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Avg Discount</p>
                                    <p className="text-3xl font-bold text-blue-600 mt-2">
                                        {analytics.avgPercentage.toFixed(1)}%
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                    <Percent className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-3">
                                Range: {analytics.minPercentage}% - {analytics.maxPercentage}%
                            </p>
                        </div>
                    </div>
                )}

                {/* Expiring Soon Alert */}
                {analytics && analytics.expiringSoon && analytics.expiringSoon.length > 0 && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-8">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                            <div className="flex-1">
                                <h3 className="text-sm font-semibold text-orange-900 mb-2">
                                    ⚠️ {analytics.expiringSoon.length} Discount(s) Expiring Soon
                                </h3>
                                <div className="space-y-1">
                                    {analytics.expiringSoon.slice(0, 5).map((item) => (
                                        <p key={item.productId} className="text-sm text-orange-800">
                                            • {item.name} ({item.discount.percentage}% off) - 
                                            <span className="font-medium"> {item.daysRemaining} day(s) left</span>
                                        </p>
                                    ))}
                                </div>
                                {analytics.expiringSoon.length > 5 && (
                                    <p className="text-xs text-orange-700 mt-2">
                                        ...and {analytics.expiringSoon.length - 5} more
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Global Actions */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Percent className="w-5 h-5 text-blue-600" />
                        Global Discount Operations
                    </h3>
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() => setShowAllModal(true)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Apply Discount to All Products
                        </button>
                        <button
                            onClick={handleRemoveFromAll}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" />
                            Remove All Discounts
                        </button>
                    </div>
                </div>

                {/* Bulk Actions Bar */}
                {selectedProducts.size > 0 && (
                    <div className="bg-blue-600 text-white rounded-lg p-4 mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Check className="w-5 h-5" />
                            <span className="font-medium">{selectedProducts.size} product(s) selected</span>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowBulkModal(true)}
                                className="px-4 py-2 bg-white text-blue-600 hover:bg-gray-100 rounded-lg font-medium transition-colors flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Apply Discount to Selected
                            </button>
                            <button
                                onClick={handleRemoveFromSelected}
                                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                Remove from Selected
                            </button>
                            <button
                                onClick={() => {
                                    setSelectedProducts(new Set());
                                    setSelectAll(false);
                                }}
                                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                            >
                                Clear Selection
                            </button>
                        </div>
                    </div>
                )}

                {/* Actions Bar */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                    <div className="flex flex-wrap items-center gap-4">
                        {/* Search */}
                        <div className="flex-1 min-w-[200px]">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-gray-500" />
                            <select
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value as any);
                                    setPage(1);
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Discounts</option>
                                <option value="active">Active Only</option>
                                <option value="scheduled">Scheduled Only</option>
                                <option value="expired">Expired Only</option>
                            </select>
                        </div>

                        {/* Cleanup Button */}
                        {analytics && analytics.expired > 0 && (
                            <button
                                onClick={handleCleanup}
                                disabled={cleanupLoading}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <RefreshCw className={`w-4 h-4 ${cleanupLoading ? 'animate-spin' : ''}`} />
                                {cleanupLoading ? 'Cleaning...' : `Cleanup ${analytics.expired} Expired`}
                            </button>
                        )}

                        {/* Refresh Button */}
                        <button
                            onClick={loadData}
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Products Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center">
                            <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
                            <p className="text-gray-600">Loading products...</p>
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="p-12 text-center">
                            <Percent className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-600">No products found</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left">
                                                <input
                                                    type="checkbox"
                                                    checked={selectAll}
                                                    onChange={handleSelectAll}
                                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                                />
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Product
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Category
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Discount
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Price
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Period
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredProducts.map((product) => (
                                            <tr key={product._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedProducts.has(product._id)}
                                                        onChange={() => handleSelectProduct(product._id)}
                                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                                    />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <img
                                                            src={product.image}
                                                            alt={product.name}
                                                            className="w-12 h-12 object-cover rounded-lg"
                                                        />
                                                        <div>
                                                            <p className="font-medium text-gray-900">{product.name}</p>
                                                            <p className="text-sm text-gray-500">{product.productId}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full capitalize">
                                                        {product.category}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {product.discount.enabled ? (
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-lg font-bold text-red-600">
                                                                {product.discount.percentage}%
                                                            </span>
                                                            {product.discount.description && (
                                                                <span className="text-xs text-gray-500">
                                                                    ({product.discount.description})
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-gray-400">No discount</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {product.discount.enabled ? (
                                                        <div>
                                                            <p className="font-semibold text-green-600">
                                                                {formatPrice(product.finalPrice)}
                                                            </p>
                                                            <p className="text-sm text-gray-500 line-through">
                                                                {formatPrice(product.priceINR)}
                                                            </p>
                                                            <p className="text-xs text-green-600 font-medium">
                                                                Save {formatPrice(product.priceINR - product.finalPrice)}
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <p className="font-semibold text-gray-900">
                                                            {formatPrice(product.priceINR)}
                                                        </p>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {product.discount.enabled ? (
                                                        <div>
                                                            <p>Start: {formatDate(product.discount.startDate)}</p>
                                                            <p>End: {formatDate(product.discount.endDate)}</p>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400">-</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {product.discount.enabled ? (
                                                        <div>
                                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                                product.discountStatus.status === 'active' && product.discountStatus.isExpiringSoon
                                                                    ? 'bg-orange-100 text-orange-800'
                                                                    : product.discountStatus.status === 'active'
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : product.discountStatus.status === 'scheduled'
                                                                    ? 'bg-yellow-100 text-yellow-800'
                                                                    : 'bg-red-100 text-red-800'
                                                            }`}>
                                                                {product.discountStatus.status.toUpperCase()}
                                                            </span>
                                                            <p className="text-xs text-gray-600 mt-1">
                                                                {product.discountStatus.message}
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                                                            NONE
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {product.discount.enabled && (
                                                        <button
                                                            onClick={() => handleRemoveSingle(product._id, product.name)}
                                                            className="px-3 py-1 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors flex items-center gap-1"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                            Remove
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {pagination && pagination.total > 1 && (
                                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                                    <div className="text-sm text-gray-700">
                                        Showing {filteredProducts.length} of {pagination.totalItems} products
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setPage(Math.max(1, page - 1))}
                                            disabled={page === 1}
                                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Previous
                                        </button>
                                        <span className="px-4 py-2 text-sm font-medium text-gray-700">
                                            Page {page} of {pagination.total}
                                        </span>
                                        <button
                                            onClick={() => setPage(Math.min(pagination.total, page + 1))}
                                            disabled={page === pagination.total}
                                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Bulk Discount Modal */}
            {showBulkModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-900">Apply Bulk Discount</h3>
                            <button
                                onClick={() => setShowBulkModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-4">
                            Apply discount to {selectedProducts.size} selected product(s)
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Discount Percentage (%) *
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={bulkDiscount.percentage}
                                    onChange={(e) => setBulkDiscount({ ...bulkDiscount, percentage: Number(e.target.value) })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Start Date (Optional)
                                </label>
                                <input
                                    type="date"
                                    value={bulkDiscount.startDate}
                                    onChange={(e) => setBulkDiscount({ ...bulkDiscount, startDate: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    End Date (Optional)
                                </label>
                                <input
                                    type="date"
                                    value={bulkDiscount.endDate}
                                    onChange={(e) => setBulkDiscount({ ...bulkDiscount, endDate: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={bulkDiscount.description}
                                    onChange={(e) => setBulkDiscount({ ...bulkDiscount, description: e.target.value })}
                                    placeholder="e.g., Summer Sale"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={handleApplyToSelected}
                                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                            >
                                Apply Discount
                            </button>
                            <button
                                onClick={() => setShowBulkModal(false)}
                                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Apply to All Modal */}
            {showAllModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-900">Apply Discount to All</h3>
                            <button
                                onClick={() => setShowAllModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                            <p className="text-sm text-yellow-800">
                                ⚠️ This will apply the discount to ALL products in your catalog.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Discount Percentage (%) *
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={bulkDiscount.percentage}
                                    onChange={(e) => setBulkDiscount({ ...bulkDiscount, percentage: Number(e.target.value) })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Start Date (Optional)
                                </label>
                                <input
                                    type="date"
                                    value={bulkDiscount.startDate}
                                    onChange={(e) => setBulkDiscount({ ...bulkDiscount, startDate: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    End Date (Optional)
                                </label>
                                <input
                                    type="date"
                                    value={bulkDiscount.endDate}
                                    onChange={(e) => setBulkDiscount({ ...bulkDiscount, endDate: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={bulkDiscount.description}
                                    onChange={(e) => setBulkDiscount({ ...bulkDiscount, description: e.target.value })}
                                    placeholder="e.g., Summer Sale"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={handleApplyToAll}
                                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                            >
                                Apply to All
                            </button>
                            <button
                                onClick={() => setShowAllModal(false)}
                                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DiscountManagement;