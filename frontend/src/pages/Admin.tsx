import { useState, useEffect } from 'react';
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
    Activity,
    Search,
    Filter,
    Edit2,
    Save,
    X,
    Trash2,
    BarChart3,
    ShoppingCart,
    UserCog
} from 'lucide-react';

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

const Admin = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'analytics' | 'orders' | 'users'>('analytics');
    const [loading, setLoading] = useState(true);

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

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/');
            return;
        }
        loadData();
    }, [user, navigate, activeTab, usersPage, ordersPage, usersSearch, usersRoleFilter, ordersSearch, ordersStatusFilter, ordersDeliveryFilter]);

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

    const formatCurrency = (amount: number, currency: string = 'INR') => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0
        }).format(amount / 100);
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

    if (loading && !analytics && users.length === 0 && orders.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white text-xl font-semibold">Loading admin dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-5xl font-black text-white mb-2 tracking-tight">Admin Dashboard</h1>
                    <p className="text-xl text-white/90 font-medium">Manage your platform</p>
                </div>

                {/* Tabs */}
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-2 mb-8 border border-white/20 shadow-2xl">
                    <div className="grid grid-cols-3 gap-2">
                        <button
                            onClick={() => setActiveTab('analytics')}
                            className={`flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${activeTab === 'analytics'
                                    ? 'bg-white text-indigo-600 shadow-xl scale-105'
                                    : 'text-white/80 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            <BarChart3 className="w-6 h-6" />
                            <span className="hidden sm:inline">Analytics</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('orders')}
                            className={`flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${activeTab === 'orders'
                                    ? 'bg-white text-indigo-600 shadow-xl scale-105'
                                    : 'text-white/80 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            <ShoppingCart className="w-6 h-6" />
                            <span className="hidden sm:inline">Orders</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${activeTab === 'users'
                                    ? 'bg-white text-indigo-600 shadow-xl scale-105'
                                    : 'text-white/80 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            <UserCog className="w-6 h-6" />
                            <span className="hidden sm:inline">Users</span>
                        </button>
                    </div>
                </div>

                {/* Analytics Tab */}
                {activeTab === 'analytics' && analytics && (
                    <div className="space-y-8 animate-fade-in">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Revenue Card */}
                            <div className="bg-white rounded-2xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-2 border-t-4 border-pink-500">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl shadow-lg">
                                        <TrendingUp className="w-8 h-8 text-white" />
                                    </div>
                                </div>
                                <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">Total Revenue</h3>
                                <p className="text-3xl font-black text-gray-900">{formatCurrency(analytics.revenue.total)}</p>
                            </div>

                            {/* Users Card */}
                            <div className="bg-white rounded-2xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-2 border-t-4 border-blue-500">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                                        <Users className="w-8 h-8 text-white" />
                                    </div>
                                </div>
                                <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">Total Users</h3>
                                <p className="text-3xl font-black text-gray-900">{analytics.users.total}</p>
                                <p className="text-sm text-gray-600 mt-2">{analytics.users.verified} verified</p>
                            </div>

                            {/* Orders Card */}
                            <div className="bg-white rounded-2xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-2 border-t-4 border-green-500">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-lg">
                                        <Package className="w-8 h-8 text-white" />
                                    </div>
                                </div>
                                <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">Total Orders</h3>
                                <p className="text-3xl font-black text-gray-900">{analytics.orders.total}</p>
                                <p className="text-sm text-gray-600 mt-2">{analytics.orders.paid} paid</p>
                            </div>

                            {/* Recent Activity Card */}
                            <div className="bg-white rounded-2xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-2 border-t-4 border-orange-500">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl shadow-lg">
                                        <Activity className="w-8 h-8 text-white" />
                                    </div>
                                </div>
                                <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">Recent Activity</h3>
                                <p className="text-3xl font-black text-gray-900">{analytics.orders.recent}</p>
                                <p className="text-sm text-gray-600 mt-2">orders in last 7 days</p>
                            </div>
                        </div>

                        {/* Charts Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Order Status Distribution */}
                            <div className="bg-white rounded-2xl p-8 shadow-2xl">
                                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                    <div className="w-1 h-8 bg-gradient-to-b from-indigo-600 to-purple-600 rounded-full"></div>
                                    Order Status Distribution
                                </h3>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm font-semibold">
                                            <span className="text-gray-700">Paid</span>
                                            <span className="text-gray-900">{analytics.orders.paid}</span>
                                        </div>
                                        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-1000"
                                                style={{ width: `${(analytics.orders.paid / analytics.orders.total) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm font-semibold">
                                            <span className="text-gray-700">Pending</span>
                                            <span className="text-gray-900">{analytics.orders.pending}</span>
                                        </div>
                                        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-1000"
                                                style={{ width: `${(analytics.orders.pending / analytics.orders.total) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm font-semibold">
                                            <span className="text-gray-700">Failed</span>
                                            <span className="text-gray-900">{analytics.orders.failed}</span>
                                        </div>
                                        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full transition-all duration-1000"
                                                style={{ width: `${(analytics.orders.failed / analytics.orders.total) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Monthly Revenue */}
                            <div className="bg-white rounded-2xl p-8 shadow-2xl">
                                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                    <div className="w-1 h-8 bg-gradient-to-b from-indigo-600 to-purple-600 rounded-full"></div>
                                    Monthly Revenue
                                </h3>
                                <div className="flex items-end justify-between h-48 gap-2">
                                    {analytics.revenue.monthly.map((month) => (
                                        <div key={`${month._id.year}-${month._id.month}`} className="flex-1 flex flex-col items-center gap-2">
                                            <div className="w-full bg-gray-200 rounded-t-lg overflow-hidden flex items-end" style={{ height: '160px' }}>
                                                <div
                                                    className="w-full bg-gradient-to-t from-indigo-600 to-purple-600 rounded-t-lg transition-all duration-1000 hover:from-indigo-500 hover:to-purple-500"
                                                    style={{
                                                        height: `${(month.revenue / Math.max(...analytics.revenue.monthly.map(m => m.revenue))) * 100}%`,
                                                        minHeight: '20px'
                                                    }}
                                                ></div>
                                            </div>
                                            <span className="text-xs font-bold text-gray-600">{getMonthName(month._id.month)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Delivery Status */}
                        <div className="bg-white rounded-2xl p-8 shadow-2xl">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                <div className="w-1 h-8 bg-gradient-to-b from-indigo-600 to-purple-600 rounded-full"></div>
                                Delivery Status
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                {analytics.orders.deliveryStatus.map((status) => (
                                    <div key={status._id} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 text-center hover:shadow-lg transition-all duration-300">
                                        <p className="text-3xl font-black text-indigo-600 mb-2">{status.count}</p>
                                        <p className="text-sm font-bold text-gray-700 capitalize">{status._id}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Orders Tab */}
                {activeTab === 'orders' && (
                    <div className="space-y-6 animate-fade-in">
                        {/* Filters */}
                        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search orders..."
                                        value={ordersSearch}
                                        onChange={(e) => {
                                            setOrdersSearch(e.target.value);
                                            setOrdersPage(1);
                                        }}
                                        className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border-2 border-transparent focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all duration-300 font-medium"
                                    />
                                </div>
                                <select
                                    value={ordersStatusFilter}
                                    onChange={(e) => {
                                        setOrdersStatusFilter(e.target.value);
                                        setOrdersPage(1);
                                    }}
                                    className="px-4 py-3 bg-white rounded-xl border-2 border-transparent focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all duration-300 font-medium"
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
                                    className="px-4 py-3 bg-white rounded-xl border-2 border-transparent focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all duration-300 font-medium"
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
                        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Order ID</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Customer</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Amount</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Payment</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Delivery</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {orders.map((order, index) => (
                                            <tr key={order._id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-indigo-50 transition-colors duration-200`}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-3 py-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-mono font-bold rounded-lg">
                                                        {order.orderId}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-bold text-gray-900">{order.customer?.name || 'N/A'}</div>
                                                    <div className="text-sm text-gray-600">{order.customer?.email || 'N/A'}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-lg font-black text-gray-900">{formatCurrency(order.amount, order.currency)}</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.status === 'paid' ? 'bg-green-100 text-green-800' :
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
                                                            className="px-3 py-1 border-2 border-indigo-500 rounded-lg text-sm font-semibold focus:ring-4 focus:ring-indigo-500/20"
                                                        >
                                                            <option value="pending">Pending</option>
                                                            <option value="processing">Processing</option>
                                                            <option value="shipped">Shipped</option>
                                                            <option value="delivered">Delivered</option>
                                                            <option value="cancelled">Cancelled</option>
                                                        </select>
                                                    ) : (
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.deliveryStatus === 'delivered' ? 'bg-green-100 text-green-800' :
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
                                                                className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-200"
                                                            >
                                                                <Save className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setEditingOrder(null);
                                                                    setOrderFormData({});
                                                                }}
                                                                className="p-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
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
                                                            className="p-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors duration-200"
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
                                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                    >
                                        Previous
                                    </button>
                                    <span className="text-sm font-bold text-gray-700">
                                        Page {ordersPage} of {ordersPagination.pages}
                                    </span>
                                    <button
                                        onClick={() => setOrdersPage(ordersPage + 1)}
                                        disabled={ordersPage === ordersPagination.pages}
                                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <div className="space-y-6 animate-fade-in">
                        {/* Filters */}
                        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search users..."
                                        value={usersSearch}
                                        onChange={(e) => {
                                            setUsersSearch(e.target.value);
                                            setUsersPage(1);
                                        }}
                                        className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border-2 border-transparent focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all duration-300 font-medium"
                                    />
                                </div>
                                <select
                                    value={usersRoleFilter}
                                    onChange={(e) => {
                                        setUsersRoleFilter(e.target.value);
                                        setUsersPage(1);
                                    }}
                                    className="px-4 py-3 bg-white rounded-xl border-2 border-transparent focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all duration-300 font-medium"
                                >
                                    <option value="">All Roles</option>
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                        </div>

                        {/* Users Table */}
                        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Name</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Email</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Phone</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Role</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Verified</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Orders</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Joined</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {users.map((userItem, index) => (
                                            <tr key={userItem._id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-indigo-50 transition-colors duration-200`}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-bold text-gray-900">{userItem.name}</div>
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
                                                        className="px-3 py-1 border-2 border-indigo-500 rounded-lg text-sm font-semibold focus:ring-4 focus:ring-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <option value="user">User</option>
                                                        <option value="admin">Admin</option>
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {userItem.emailVerified ? (
                                                        <span className="text-green-600 font-bold text-sm">✓ Verified</span>
                                                    ) : (
                                                        <span className="text-red-600 font-bold text-sm">✗ Not Verified</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm font-bold text-gray-900">{userItem.orders?.length || 0}</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {formatDate(userItem.createdAt)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <button
                                                        onClick={() => handleDeleteUser(userItem._id)}
                                                        disabled={userItem._id === user?.id}
                                                        className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
                                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                    >
                                        Previous
                                    </button>
                                    <span className="text-sm font-bold text-gray-700">
                                        Page {usersPage} of {usersPagination.pages}
                                    </span>
                                    <button
                                        onClick={() => setUsersPage(usersPage + 1)}
                                        disabled={usersPage === usersPagination.pages}
                                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Admin;
