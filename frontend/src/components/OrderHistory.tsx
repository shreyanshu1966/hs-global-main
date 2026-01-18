import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Loader2, ChevronRight, Truck, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface OrderItem {
    productId: string;
    name: string;
    quantity: number;
    price: number;
    image?: string;
    category?: string;
}

interface Order {
    _id: string;
    orderId: string;
    amount: number;
    currency: string;
    status: 'created' | 'paid' | 'failed';
    deliveryStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    items: OrderItem[];
    customer: {
        name: string;
        email: string;
        phone: string;
    };
    createdAt: string;
    updatedAt: string;
}

const OrderHistory: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { token } = useAuth();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError('');

            // Get token from AuthContext or localStorage
            const authToken = token || localStorage.getItem('authToken');

            if (!authToken) {
                setError('Please login to view orders');
                setLoading(false);
                return;
            }

            const response = await fetch(`${API_URL}/my-orders`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Session expired. Please login again.');
                }
                throw new Error('Failed to fetch orders');
            }

            const data = await response.json();
            if (data.ok) {
                setOrders(data.orders);
            } else {
                throw new Error(data.error || 'Failed to load orders');
            }
        } catch (err: any) {
            console.error('Fetch orders error:', err);
            setError(err.message || 'Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
            created: { color: 'bg-gray-100 text-gray-700', icon: <Clock className="w-3 h-3" />, label: 'Created' },
            paid: { color: 'bg-green-100 text-green-700', icon: <CheckCircle className="w-3 h-3" />, label: 'Paid' },
            failed: { color: 'bg-red-100 text-red-700', icon: <XCircle className="w-3 h-3" />, label: 'Failed' }
        };

        const config = statusConfig[status] || statusConfig.created;
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                {config.icon}
                {config.label}
            </span>
        );
    };

    const getDeliveryStatusBadge = (status: string) => {
        const statusConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
            pending: { color: 'bg-yellow-100 text-yellow-700', icon: <Clock className="w-3 h-3" />, label: 'Pending' },
            processing: { color: 'bg-blue-100 text-blue-700', icon: <Package className="w-3 h-3" />, label: 'Processing' },
            shipped: { color: 'bg-purple-100 text-purple-700', icon: <Truck className="w-3 h-3" />, label: 'Shipped' },
            delivered: { color: 'bg-green-100 text-green-700', icon: <CheckCircle className="w-3 h-3" />, label: 'Delivered' },
            cancelled: { color: 'bg-red-100 text-red-700', icon: <XCircle className="w-3 h-3" />, label: 'Cancelled' }
        };

        const config = statusConfig[status] || statusConfig.pending;
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                {config.icon}
                {config.label}
            </span>
        );
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatAmount = (amount: number, currency: string = 'INR') => {
        // Amount is in paise, convert to rupees (standard unit)
        const amountInMajorUnit = amount / 100;
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2
        }).format(amountInMajorUnit);
    };

    if (loading) {
        return (
            <div className="text-center py-12">
                <Loader2 className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin" />
                <p className="text-gray-500">Loading orders...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <XCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
                <p className="text-red-600 mb-4">{error}</p>
                <button
                    onClick={fetchOrders}
                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No orders yet</p>
                <button
                    onClick={() => navigate('/products')}
                    className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                    Start Shopping
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {orders.map((order) => (
                <div
                    key={order._id}
                    className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigate(`/orders/${order.orderId}`)}
                >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-3 gap-2 sm:gap-0">
                        <div>
                            <p className="text-sm font-medium text-gray-900 break-all">
                                Order #{order.orderId.slice(-8).toUpperCase()}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                Placed on {formatDate(order.createdAt)}
                            </p>
                        </div>
                        <div className="text-left sm:text-right">
                            <p className="text-sm font-bold text-black">
                                {formatAmount(order.amount, order.currency)}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mb-3">
                        {getStatusBadge(order.status)}
                        {order.status === 'paid' && getDeliveryStatusBadge(order.deliveryStatus)}
                    </div>

                    {/* Order Items Preview */}
                    <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
                        {order.items.slice(0, 3).map((item, idx) => (
                            <div
                                key={idx}
                                className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0"
                            >
                                {item.image ? (
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Package className="w-6 h-6 text-gray-400" />
                                    </div>
                                )}
                            </div>
                        ))}
                        {order.items.length > 3 && (
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                                <span className="text-xs font-medium text-gray-600">
                                    +{order.items.length - 3}
                                </span>
                            </div>
                        )}
                        <div className="flex-1 ml-2">
                            <p className="text-sm text-gray-700">
                                {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                            </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default OrderHistory;
