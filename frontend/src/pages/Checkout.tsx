import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useCart } from '../contexts/CartContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Minus, Plus, Trash2, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import paymentRetryService from '../services/paymentRetryService';

declare global {
  interface Window {
    paypal: any;
  }
}

const Checkout: React.FC = () => {
  const { state, removeItem, updateQuantity, clearCart } = useCart();
  const { formatPrice, getCurrencySymbol, convertFromINR } = useCurrency();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState(state.phoneNumber || '');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [city, setCity] = useState('');
  const [region, setRegion] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('India');

  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [retryInfo, setRetryInfo] = useState<any>(null);
  const [paypalLoaded, setPaypalLoaded] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const paypalRef = useRef<HTMLDivElement>(null);

  // Load user details from authenticated user or localStorage
  useEffect(() => {
    if (user) {
      // If user is logged in, use their data
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || state.phoneNumber || '');
      setAddress1(user.address?.street || '');
      setCity(user.address?.city || '');
      setRegion(user.address?.state || '');
      setPostalCode(user.address?.postalCode || '');
      setCountry(user.address?.country || 'India');
    } else {
      // Fallback to localStorage
      try {
        const saved = localStorage.getItem('userDetails');
        if (saved) {
          const parsed = JSON.parse(saved);
          setName(parsed.name || '');
          setEmail(parsed.email || '');
          setPhone(parsed.phone || phone);
        }
      } catch { }
    }
  }, [user, state.phoneNumber, phone]);

  // Sync phone from cart verification
  useEffect(() => {
    if (state.phoneNumber && state.isPhoneVerified && !phone) {
      setPhone(state.phoneNumber);
    }
  }, [state.phoneNumber, state.isPhoneVerified, phone]);

  // Load PayPal SDK
  useEffect(() => {
    if (window.paypal) {
      setPaypalLoaded(true);
      return;
    }

    if (!user) {
      // Wait for user to be loaded
      return;
    }

    const loadPayPal = async () => {
      try {
        // Get PayPal client ID from backend
        const response = await fetch('/api/create-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          },
          body: JSON.stringify({
            amount: 1, // Dummy amount just to get client ID
            items: [{ id: 'dummy', name: 'dummy', quantity: 1, price: 1 }],
            shippingAddress: {},
            customer: {}
          })
        });

        if (response.ok) {
          const data = await response.json();
          const clientId = data.clientId;
          const environment = data.environment || 'sandbox';

          // Check if script already exists
          const existingScript = document.querySelector('script[src*="paypal.com/sdk"]');
          if (existingScript) {
            existingScript.remove();
          }

          const script = document.createElement('script');
          script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&intent=capture`;
          script.onload = () => setPaypalLoaded(true);
          script.onerror = () => {
            console.error('Failed to load PayPal SDK script');
            setPaymentError('Failed to load payment system. Please refresh the page.');
          };
          script.async = true;
          document.body.appendChild(script);
        } else {
          throw new Error('Failed to get PayPal configuration');
        }
      } catch (error) {
        console.error('Failed to load PayPal:', error);
        setPaymentError('Failed to initialize payment system. Please refresh the page.');
      }
    };

    loadPayPal();
  }, [user]);

  // Price Helpers (Simplified)
  const extractPriceInINR = (priceString: string): number => {
    const cleaned = priceString.replace(/[^0-9.]/g, '');
    const price = parseFloat(cleaned);
    return isNaN(price) ? 0 : price;
  };

  // Calculate totals in INR (base currency)
  const subtotalINR = useMemo(() => {
    return state.items.reduce((sum, item) => {
      const priceInINR = extractPriceInINR(item.price);
      return sum + priceInINR * item.quantity;
    }, 0);
  }, [state.items]);

  // Convert to user's currency for display
  const subtotal = useMemo(() => convertFromINR(subtotalINR), [subtotalINR, convertFromINR]);
  const totalAmount = subtotal;

  const isEmailValid = useMemo(() => /^(?=.*@).+\..+$/i.test(email.trim()), [email]);
  const isFormValid = name && isEmailValid && phone && address1 && city && region && postalCode && country;

  // Render PayPal buttons when form is valid and PayPal is loaded
  useEffect(() => {
    if (!paypalLoaded || !isFormValid || !paypalRef.current || !window.paypal) return;

    const renderPayPalButtons = async () => {
      try {
        // Clear any existing PayPal buttons
        if (paypalRef.current) {
          paypalRef.current.innerHTML = '';
        }

        window.paypal.Buttons({
          style: {
            color: 'black',
            shape: 'rect',
            layout: 'vertical',
            height: 45,
            label: 'pay'
          },

          createOrder: async () => {
            try {
              setIsCreatingOrder(true);
              setPaymentError(null);

              const response = await fetch('/api/create-order', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                credentials: 'include',
                body: JSON.stringify({
                  amount: subtotalINR,
                  currency: 'INR',
                  receipt: `rcpt_${Date.now()}`,
                  items: state.items.map(item => ({
                    id: item.id,
                    productId: item.id,
                    name: item.name,
                    quantity: item.quantity,
                    price: extractPriceInINR(item.price),
                    image: item.image,
                    category: item.category || 'Natural Stone'
                  })),
                  shippingAddress: {
                    street: address1,
                    city,
                    state: region,
                    postalCode,
                    country,
                    fullAddress: [address1, address2, city, region, postalCode, country]
                      .filter(Boolean)
                      .join(', ')
                  },
                  customer: {
                    name,
                    email,
                    phone
                  }
                })
              });

              if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to create payment order');
              }

              const orderData = await response.json();

              if (!orderData.ok || !orderData.order) {
                throw new Error('Invalid order response from server');
              }

              setCurrentOrderId(orderData.order.id);
              return orderData.order.id;

            } catch (error: any) {
              setPaymentError(error.message || 'Failed to create order');
              setIsCreatingOrder(false);
              throw error;
            }
          },

          onApprove: async (data: any) => {
            try {
              const response = await fetch('/api/capture-payment', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  orderID: data.orderID
                })
              });

              if (!response.ok) {
                throw new Error('Payment capture failed');
              }

              const captureData = await response.json();

              if (captureData.ok) {
                // Clear retry attempts on success
                if (currentOrderId) {
                  paymentRetryService.clearAttempts(currentOrderId);
                }
                clearCart();
                navigate('/checkout-success');
              } else {
                throw new Error(captureData.error || 'Payment capture failed');
              }

            } catch (error: any) {
              console.error('Payment capture error:', error);
              if (currentOrderId) {
                paymentRetryService.recordAttempt(currentOrderId, error.message);
                setRetryInfo(paymentRetryService.getRetryInfo(currentOrderId));
              }
              setPaymentError(error.message || 'Payment capture failed');
            } finally {
              setIsCreatingOrder(false);
            }
          },

          onError: (err: any) => {
            console.error('PayPal error:', err);
            if (currentOrderId) {
              paymentRetryService.recordAttempt(currentOrderId, 'PayPal payment error');
              setRetryInfo(paymentRetryService.getRetryInfo(currentOrderId));
            }
            setPaymentError('Payment failed. Please try again.');
            setIsCreatingOrder(false);
          },

          onCancel: () => {
            if (currentOrderId) {
              paymentRetryService.recordAttempt(currentOrderId, 'Payment cancelled by user');
              setRetryInfo(paymentRetryService.getRetryInfo(currentOrderId));
            }
            setPaymentError('Payment was cancelled. Please try again.');
            setIsCreatingOrder(false);
          }

        }).render(paypalRef.current);

      } catch (error) {
        console.error('Failed to render PayPal buttons:', error);
        setPaymentError('Failed to load payment system');
      }
    };

    renderPayPalButtons();
  }, [paypalLoaded, isFormValid, subtotalINR, name, email, phone, address1, address2, city, region, postalCode, country]);

  const { contextSafe } = useGSAP({ scope: containerRef });

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex flex-col items-center justify-center bg-gray-50">
        <h2 className="text-2xl font-bold mb-4 text-black">Your cart is empty</h2>
        <Link to="/products" className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen pt-24 pb-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="mb-8">
          <Link to="/products" className="inline-flex items-center text-sm text-gray-600 hover:text-black transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Shopping
          </Link>
          <h1 className="text-3xl font-bold text-black mt-4">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left: Billing Details (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            {/* Login Prompt for Non-Authenticated Users */}
            {!user && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-blue-900 mb-1">Have an account?</h3>
                  <p className="text-sm text-blue-700 mb-2">
                    Login to auto-fill your details and track your orders easily.
                  </p>
                  <Link
                    to="/login"
                    state={{ from: '/checkout' }}
                    className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Login now →
                  </Link>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
              <h2 className="text-xl font-semibold text-black mb-6">Billing & Shipping Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full px-4 py-3 bg-white border ${!isEmailValid && email ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-black'} rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all`}
                    placeholder="Enter your email"
                  />
                </div>

                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-500 cursor-not-allowed"
                    readOnly
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Address Line 1</label>
                  <input
                    value={address1}
                    onChange={(e) => setAddress1(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                    placeholder="Street address, P.O. box, company name"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Address Line 2 (Optional)</label>
                  <input
                    value={address2}
                    onChange={(e) => setAddress2(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                    placeholder="Apartment, suite, unit, building, floor"
                  />
                </div>

                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
                  <input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Region / State</label>
                  <input
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Postal Code</label>
                  <input
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Country</label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all appearance-none"
                  >
                    <option>India</option>
                    <option>United States</option>
                    <option>United Kingdom</option>
                    <option>Canada</option>
                    <option>Australia</option>
                    <option>United Arab Emirates</option>
                    <option>Germany</option>
                    <option>France</option>
                    <option>Singapore</option>
                  </select>
                </div>

              </div>
            </div>
          </div>

          {/* Right: Order Summary (5 cols) */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 sticky top-24">
              <h2 className="text-xl font-semibold text-black mb-6">Order Summary</h2>

              <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar pr-2">
                {state.items.map(item => (
                  <div key={item.id} className="flex gap-4 py-2">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-black truncate">{item.name}</h4>
                        <p className="text-sm text-gray-500">{formatPrice(extractPriceInINR(item.price))}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center border border-gray-300 rounded-md">
                          <button
                            onClick={() => state.items.length === 1 && item.quantity === 1 ? removeItem(item.id) : updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                            className="p-1 hover:bg-gray-100 transition-colors"
                          >
                            {item.quantity === 1 ? <Trash2 className="w-3 h-3 text-red-500" /> : <Minus className="w-3 h-3" />}
                          </button>
                          <span className="px-2 text-xs font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:bg-gray-100 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-black">
                        {formatPrice(extractPriceInINR(item.price) * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>{getCurrencySymbol()}{subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-black pt-3 border-t border-gray-100">
                  <span>Total</span>
                  <span>{getCurrencySymbol()}{totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {paymentError && (
                <div className="mt-4 space-y-3">
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                    {paymentError}
                  </div>

                  {retryInfo && retryInfo.canRetry && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                      <div className="flex items-start gap-2">
                        <RefreshCw className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="font-medium text-blue-900">
                            Retry Available ({retryInfo.remainingRetries} {retryInfo.remainingRetries === 1 ? 'attempt' : 'attempts'} remaining)
                          </p>
                          <p className="text-blue-700 mt-1">
                            {retryInfo.canRetryNow
                              ? 'You can retry your payment now.'
                              : `Please wait ${Math.ceil(retryInfo.timeUntilNextRetry / 1000)} seconds before retrying.`
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {retryInfo && !retryInfo.canRetry && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                      <p className="font-medium">Maximum retry attempts reached</p>
                      <p className="mt-1">Please contact support or try again later.</p>
                    </div>
                  )}
                </div>
              )}

              {!isFormValid && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                  <p className="font-medium">Please fill in all required fields to proceed with payment.</p>
                </div>
              )}

              {isFormValid && !paypalLoaded && (
                <div className="mt-6 py-4 bg-gray-100 text-gray-600 font-bold text-lg rounded-xl flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Loading PayPal...
                </div>
              )}

              {isCreatingOrder && (
                <div className="mt-6 py-4 bg-blue-100 text-blue-600 font-bold text-lg rounded-xl flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Creating Order...
                </div>
              )}

              {isFormValid && paypalLoaded && (
                <div className="mt-6">
                  <div ref={paypalRef} className="w-full"></div>
                </div>
              )}

              <p className="mt-3 text-xs text-center text-gray-500">
                Secure Payment by PayPal. Your data is encrypted and protected.
              </p>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;