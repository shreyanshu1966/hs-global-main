import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useCart } from '../contexts/CartContext';
import { useLocalization } from '../contexts/LocalizationContext';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Minus, Plus, Trash2, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import paymentRetryService from '../services/paymentRetryService';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const Checkout: React.FC = () => {
  const { state, removeItem, updateQuantity, clearCart } = useCart();
  const { formatPrice, getCurrencySymbol, convertPrice, convertINRtoUSD } = useLocalization();
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

  const containerRef = useRef<HTMLDivElement>(null);
  const payButtonRef = useRef<HTMLButtonElement>(null);

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
  }, [user, state.phoneNumber]);

  // Sync phone from cart verification
  useEffect(() => {
    if (state.phoneNumber && state.isPhoneVerified && !phone) {
      setPhone(state.phoneNumber);
    }
  }, [state.phoneNumber, state.isPhoneVerified]);

  // Load Razorpay
  useEffect(() => {
    if (window.Razorpay) return;
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  // Price Helpers
  const extractPriceInINR = (priceString: string): number => {
    const cleaned = priceString.replace(/[^0-9.]/g, '');
    const price = parseFloat(cleaned);
    return isNaN(price) ? 0 : price;
  };

  const subtotalINR = useMemo(() => {
    return state.items.reduce((sum, item) => {
      const priceInINR = extractPriceInINR(item.price);
      return sum + priceInINR * item.quantity;
    }, 0);
  }, [state.items]);

  const subtotalUSD = useMemo(() => convertINRtoUSD(subtotalINR), [subtotalINR, convertINRtoUSD]);
  const subtotal = useMemo(() => convertPrice(subtotalUSD), [subtotalUSD, convertPrice]);
  const totalAmount = subtotal;

  const isEmailValid = useMemo(() => /^(?=.*@).+\..+$/i.test(email.trim()), [email]);
  const isFormValid = name && isEmailValid && phone && address1 && city && region && postalCode && country;

  const handlePay = async () => {
    if (!isFormValid) return;

    // Convert total amount to INR for Razorpay (always process in INR)
    const totalInINR = subtotalINR;

    try {
      setIsCreatingOrder(true);
      setPaymentError(null);

      const orderRes = await fetch('/api/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}` // Use authToken
        },
        credentials: 'include', // Include cookies for auth
        body: JSON.stringify({
          amount: totalInINR,
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
        }),
      });

      if (!orderRes.ok) {
        const errorData = await orderRes.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create payment order');
      }

      const orderData = await orderRes.json();

      if (!orderData.ok || !orderData.order) {
        throw new Error('Invalid order response from server');
      }

      const { order, keyId } = orderData;

      // Store order ID for retry tracking
      setCurrentOrderId(order.id);

      if (!window.Razorpay) {
        alert('Payment library failed to load. Please refresh and try again.');
        setIsCreatingOrder(false);
        return;
      }

      const options = {
        key: keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'HS Global Export',
        description: 'Product Order Payment',
        order_id: order.id,
        prefill: {
          name,
          email,
          contact: phone
        },
        notes: {
          address: [address1, address2, city, region, postalCode, country]
            .filter(Boolean)
            .join(', '),
          customer_name: name,
          customer_email: email,
        },
        theme: {
          color: '#000000'
        },
        modal: {
          ondismiss: () => {
            // Record failed attempt
            paymentRetryService.recordAttempt(order.id, 'Payment cancelled by user');
            setRetryInfo(paymentRetryService.getRetryInfo(order.id));
            setPaymentError('Payment was cancelled. Please try again.');
            setIsCreatingOrder(false);
          },
        },
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            if (!verifyRes.ok) throw new Error('Payment verification failed');

            const verifyJson = await verifyRes.json();

            if (verifyJson.ok && verifyJson.valid) {
              // Clear retry attempts on success
              paymentRetryService.clearAttempts(order.id);
              clearCart();
              navigate('/checkout-success');
            } else {
              throw new Error(verifyJson.error || 'Payment verification failed');
            }
          } catch (e: any) {
            console.error('Verify Error', e);
            // Record failed attempt
            paymentRetryService.recordAttempt(order.id, e.message);
            setRetryInfo(paymentRetryService.getRetryInfo(order.id));
            setPaymentError(e.message || 'Payment verification error.');
          } finally {
            setIsCreatingOrder(false);
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (e: any) {
      console.error('Payment Error', e);
      // Record failed attempt if we have an order ID
      if (currentOrderId) {
        paymentRetryService.recordAttempt(currentOrderId, e.message);
        setRetryInfo(paymentRetryService.getRetryInfo(currentOrderId));
      }
      setPaymentError(e.message || 'Payment failed. Please try again.');
      setIsCreatingOrder(false);
    }
  };

  const { contextSafe } = useGSAP({ scope: containerRef });

  const handleMouseEnter = contextSafe(() => {
    gsap.to(payButtonRef.current, { scale: 1.02, duration: 0.2 });
  });

  const handleMouseLeave = contextSafe(() => {
    gsap.to(payButtonRef.current, { scale: 1, duration: 0.2 });
  });

  const handleMouseDown = contextSafe(() => {
    gsap.to(payButtonRef.current, { scale: 0.98, duration: 0.1 });
  });

  const handleMouseUp = contextSafe(() => {
    gsap.to(payButtonRef.current, { scale: 1.02, duration: 0.1 });
  });

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
                        <p className="text-sm text-gray-500">{formatPrice(convertINRtoUSD(extractPriceInINR(item.price)))}</p>
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
                        {formatPrice(convertPrice(convertINRtoUSD(extractPriceInINR(item.price) * item.quantity)))}
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

              <button
                ref={payButtonRef}
                onClick={handlePay}
                disabled={!isFormValid || isCreatingOrder}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                className="w-full mt-6 py-4 bg-black text-white font-bold text-lg rounded-xl hover:bg-gray-900 transition-all shadow-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreatingOrder ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  `Pay ${getCurrencySymbol()}${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                )}
              </button>

              <p className="mt-3 text-xs text-center text-gray-500">
                Secure Payment by Razorpay. Your data is encrypted.
              </p>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;