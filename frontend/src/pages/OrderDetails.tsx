import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    ArrowLeft, Package, Truck, CheckCircle, XCircle, Clock,
    MapPin, Phone, Mail, User, Loader2
} from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useAuth } from '../contexts/AuthContext';

interface OrderItem {
    productId: string;
    name: string;
    quantity: number;
    price: number;
    image?: string;
    category?: string;
}

interface ShippingAddress {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    fullAddress: string;
}

interface Order {
    _id: string;
    orderId: string;
    paymentId?: string;
    amount: number;
    currency: string;
    status: 'created' | 'paid' | 'failed';
    deliveryStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    items: OrderItem[];
    shippingAddress: ShippingAddress;
    customer: {
        name: string;
        email: string;
        phone: string;
    };
    trackingNumber?: string;
    createdAt: string;
    updatedAt: string;
}

const OrderDetails: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { token } = useAuth();

    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (contentRef.current) {
            gsap.fromTo(
                contentRef.current,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }
            );
        }
    }, { scope: containerRef, dependencies: [order] });

    useEffect(() => {
        if (orderId) {
            fetchOrderDetails();
        }
    }, [orderId]);

    const fetchOrderDetails = async () => {
        try {
            setLoading(true);
            setError('');

            // Get token from AuthContext or localStorage
            const authToken = token || localStorage.getItem('authToken');

            if (!authToken) {
                setError('Please login to view order details');
                setLoading(false);
                return;
            }

            const API_URL = import.meta.env.VITE_API_URL || '/api';
            const response = await fetch(`${API_URL}/orders/${orderId}`, {
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
                if (response.status === 404) {
                    throw new Error('Order not found');
                }
                throw new Error('Failed to fetch order details');
            }

            const data = await response.json();
            if (data.ok) {
                setOrder(data.order);
            } else {
                throw new Error(data.error || 'Order not found');
            }
        } catch (err: any) {
            console.error('Fetch order details error:', err);
            setError(err.message || 'Failed to load order details');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
            created: { color: 'bg-gray-100 text-gray-700 border-gray-300', icon: <Clock className="w-4 h-4" />, label: 'Payment Pending' },
            paid: { color: 'bg-green-100 text-green-700 border-green-300', icon: <CheckCircle className="w-4 h-4" />, label: 'Payment Successful' },
            failed: { color: 'bg-red-100 text-red-700 border-red-300', icon: <XCircle className="w-4 h-4" />, label: 'Payment Failed' }
        };

        const config = statusConfig[status] || statusConfig.created;
        return (
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${config.color} font-medium`}>
                {config.icon}
                {config.label}
            </div>
        );
    };

    const getDeliveryStatusBadge = (status: string) => {
        const statusConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
            pending: { color: 'bg-yellow-100 text-yellow-700 border-yellow-300', icon: <Clock className="w-4 h-4" />, label: 'Pending' },
            processing: { color: 'bg-blue-100 text-blue-700 border-blue-300', icon: <Package className="w-4 h-4" />, label: 'Processing' },
            shipped: { color: 'bg-purple-100 text-purple-700 border-purple-300', icon: <Truck className="w-4 h-4" />, label: 'Shipped' },
            delivered: { color: 'bg-green-100 text-green-700 border-green-300', icon: <CheckCircle className="w-4 h-4" />, label: 'Delivered' },
            cancelled: { color: 'bg-red-100 text-red-700 border-red-300', icon: <XCircle className="w-4 h-4" />, label: 'Cancelled' }
        };

        const config = statusConfig[status] || statusConfig.pending;
        return (
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${config.color} font-medium`}>
                {config.icon}
                {config.label}
            </div>
        );
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatAmount = (amount: number) => {
        const amountInRupees = amount / 100;
        return `₹${amountInRupees.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-24 pb-20 bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin" />
                    <p className="text-gray-500">Loading order details...</p>
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen pt-24 pb-20 bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <XCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
                    <p className="text-gray-600 mb-6">{error || 'The order you are looking for does not exist.'}</p>
                    <Link
                        to="/profile"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Profile
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="min-h-screen pt-24 pb-20 bg-gray-50">
            <div className="max-w-5xl mx-auto px-4">
                <div ref={contentRef}>
                    {/* Header */}
                    <div className="mb-6">
                        <Link
                            to="/profile"
                            className="inline-flex items-center text-sm text-gray-600 hover:text-black transition-colors mb-4"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Profile
                        </Link>
                        <h1 className="text-3xl font-bold text-black">Order Details</h1>
                        <p className="text-gray-600 mt-1">
                            Order ID: <span className="font-mono font-medium">{order.orderId}</span>
                        </p>
                    </div>

                    {/* Status Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="bg-white rounded-xl p-6 border border-gray-200">
                            <p className="text-sm text-gray-600 mb-2">Payment Status</p>
                            {getStatusBadge(order.status)}
                            {order.paymentId && (
                                <p className="text-xs text-gray-500 mt-2">
                                    Payment ID: <span className="font-mono">{order.paymentId}</span>
                                </p>
                            )}
                        </div>
                        {order.status === 'paid' && (
                            <div className="bg-white rounded-xl p-6 border border-gray-200">
                                <p className="text-sm text-gray-600 mb-2">Delivery Status</p>
                                {getDeliveryStatusBadge(order.deliveryStatus)}
                                {order.trackingNumber && (
                                    <p className="text-xs text-gray-500 mt-2">
                                        Tracking: <span className="font-mono">{order.trackingNumber}</span>
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Order Items */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white rounded-xl p-6 border border-gray-200">
                                <h2 className="text-xl font-bold text-black mb-4">Order Items</h2>
                                <div className="space-y-4">
                                    {order.items.map((item, index) => (
                                        <div key={index} className="flex gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                                            <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                                                {item.image ? (
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Package className="w-8 h-8 text-gray-400" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900">{item.name}</h3>
                                                {item.category && (
                                                    <p className="text-sm text-gray-500">{item.category}</p>
                                                )}
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Quantity: {item.quantity}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-gray-900">
                                                    {formatAmount(item.price * item.quantity)}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {formatAmount(item.price)} each
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Order Total */}
                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-bold text-black">Total Amount</span>
                                        <span className="text-2xl font-bold text-black">
                                            {formatAmount(order.amount)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Customer Info */}
                            <div className="bg-white rounded-xl p-6 border border-gray-200">
                                <h2 className="text-lg font-bold text-black mb-4">Customer Information</h2>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <User className="w-5 h-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-gray-600">Name</p>
                                            <p className="font-medium text-gray-900">{order.customer.name}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-gray-600">Email</p>
                                            <p className="font-medium text-gray-900 break-all">{order.customer.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-gray-600">Phone</p>
                                            <p className="font-medium text-gray-900">{order.customer.phone}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Shipping Address */}
                            <div className="bg-white rounded-xl p-6 border border-gray-200">
                                <h2 className="text-lg font-bold text-black mb-4">Shipping Address</h2>
                                <div className="flex items-start gap-3">
                                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-gray-900 leading-relaxed">
                                            {order.shippingAddress.fullAddress ||
                                                `${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}, ${order.shippingAddress.country}`}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Order Timeline */}
                            <div className="bg-white rounded-xl p-6 border border-gray-200">
                                <h2 className="text-lg font-bold text-black mb-4">Order Timeline</h2>
                                <div className="space-y-3 text-sm">
                                    <div>
                                        <p className="text-gray-600">Order Placed</p>
                                        <p className="font-medium text-gray-900">{formatDate(order.createdAt)}</p>
                                    </div>
                                    {order.updatedAt !== order.createdAt && (
                                        <div>
                                            <p className="text-gray-600">Last Updated</p>
                                            <p className="font-medium text-gray-900">{formatDate(order.updatedAt)}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;
