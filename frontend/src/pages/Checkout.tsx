import React, { useEffect, useMemo, useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Minus, Plus, Trash2, ArrowLeft, Loader2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const Checkout: React.FC = () => {
  const { state, removeItem, updateQuantity } = useCart();
  const { formatPrice, getCurrencySymbol, convertFromINR, currency } = useCurrency();
  const { user } = useAuth();

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
  const [isInitialized, setIsInitialized] = useState(false);
  const [retryOrderId, setRetryOrderId] = useState<string | null>(null);

  // Load user details from authenticated user or localStorage
  useEffect(() => {
    // Check for retry order ID in URL params
    const urlParams = new URLSearchParams(window.location.search);
    const retryId = urlParams.get('retry');
    if (retryId) {
      setRetryOrderId(retryId);
      setPaymentError('Previous payment failed. You can retry using the form below or start a new order.');
    }
  }, []);

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
          setAddress1(parsed.address1 || '');
          setAddress2(parsed.address2 || '');
          setCity(parsed.city || '');
          setRegion(parsed.region || '');
          setPostalCode(parsed.postalCode || '');
          setCountry(parsed.country || 'India');
        }
      } catch { }
    }
    setIsInitialized(true);
  }, [user, state.phoneNumber, phone]);

  // Save form details to localStorage automatically
  useEffect(() => {
    if (!isInitialized) return;

    const userDetails = {
      name,
      email,
      phone,
      address1,
      address2,
      city,
      region,
      postalCode,
      country
    };

    localStorage.setItem('userDetails', JSON.stringify(userDetails));
  }, [name, email, phone, address1, address2, city, region, postalCode, country, isInitialized]);

  // Sync phone from cart verification
  useEffect(() => {
    if (state.phoneNumber && state.isPhoneVerified && !phone) {
      setPhone(state.phoneNumber);
    }
  }, [state.phoneNumber, state.isPhoneVerified, phone]);

  // Calculate totals in INR (base currency)
  const subtotalINR = useMemo(() => {
    return state.items.reduce((sum, item) => {
      return sum + item.priceINR * item.quantity;
    }, 0);
  }, [state.items]);

  // Convert to user's selected currency for display
  const subtotal = useMemo(() => convertFromINR(subtotalINR), [subtotalINR, convertFromINR]);
  const totalAmount = subtotal;

  // Get standardized payment currency details from Context
  const { currency: paymentCurrency, rate: paymentExchangeRate } = useCurrency().getPaymentCurrency();

  // Convert to payment currency
  // Calculate payment items with individual conversion
  const paymentItems = useMemo(() => {
    return state.items.map(item => {
      const priceInPaymentCurrency = (item.priceINR * paymentExchangeRate).toFixed(2);
      return {
        ...item,
        priceInPaymentCurrency
      };
    });
  }, [state.items, paymentExchangeRate]);

  // Calculate total from the summed rounded item prices to match PayPal validation
  const paymentAmount = useMemo(() => {
    const total = paymentItems.reduce((sum, item) => {
      return sum + (parseFloat(item.priceInPaymentCurrency) * item.quantity);
    }, 0);
    return total.toFixed(2);
  }, [paymentItems]);

  const isEmailValid = useMemo(() => /^(?=.*@).+\..+$/i.test(email.trim()), [email]);
  const isFormValid = name && isEmailValid && phone && address1 && city && region && postalCode && country;

  // Handle PayPal checkout with redirect
  const handlePayPalCheckout = async () => {
    try {
      setIsCreatingOrder(true);
      setPaymentError(null);

      const response = await fetch(`${API_URL}/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        credentials: 'include',
        body: JSON.stringify({
          amount: paymentAmount,
          currency: paymentCurrency,
          receipt: `rcpt_${Date.now()}`,
          items: paymentItems.map(item => {
            return {
              id: item.id,
              productId: item.id,
              name: item.name,
              quantity: item.quantity,
              price: item.priceInPaymentCurrency,
              priceINR: item.priceINR,
              image: item.image,
              category: item.category || 'Natural Stone'
            };
          }),
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
        throw new Error(errorData.error || 'Failed to create order');
      }

      const orderData = await response.json();

      if (!orderData.ok || !orderData.approvalUrl) {
        throw new Error('Invalid order response from server');
      }

      // Redirect to PayPal for payment
      window.location.href = orderData.approvalUrl;

    } catch (error: any) {
      console.error('Failed to create order:', error);
      setPaymentError(error.message || 'Failed to create order');
      setIsCreatingOrder(false);
    }
  };

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
    <div className="min-h-screen pt-24 pb-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="mb-8">
          <Link to="/products" className="inline-flex items-center text-sm text-gray-600 hover:text-black transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Shopping
          </Link>
          <h1 className="text-3xl font-bold text-black mt-4">Checkout</h1>

          {/* Retry Notice */}
          {retryOrderId && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-amber-900 mb-1">Payment Retry</h3>
                  <p className="text-sm text-amber-700">
                    Retrying payment for order <strong>{retryOrderId}</strong>. You can use the same details or update them below.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Currency Notice */}
          {currency !== paymentCurrency && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-blue-900 mb-1">Currency Conversion Notice</h3>
                  <p className="text-sm text-blue-700">
                    You're viewing prices in <strong>{currency}</strong>, but payment will be processed in <strong>{paymentCurrency}</strong> (PayPal supported currency).
                    The conversion rate is applied automatically.
                  </p>
                </div>
              </div>
            </div>
          )}
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
              <h2 className="text-xl font-semibold text-black mb-4">Order Summary</h2>

              {/* Shipping Notice */}
              <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900">Shipping charges not included</p>
                    <p className="text-xs text-blue-700 mt-1">
                      Shipping costs will be calculated and sent to you separately after order placement.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar pr-2">
                {state.items.map(item => (
                  <div key={item.id} className="flex gap-4 py-2">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-black truncate">{item.name}</h4>
                        <p className="text-sm text-gray-500">{formatPrice(item.priceINR)}</p>
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
                        {formatPrice(item.priceINR * item.quantity)}
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
                  <span className="text-orange-600 font-medium">Not Included</span>
                </div>
                <div className="text-xs text-gray-500 -mt-2 text-right">
                  Shipping charges will be sent separately
                </div>
                <div className="flex justify-between text-lg font-bold text-black pt-3 border-t border-gray-100">
                  <span>Total</span>
                  <span>{getCurrencySymbol()}{totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {paymentError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  {paymentError}
                </div>
              )}

              {!isFormValid && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                  <p className="font-medium">Please fill in all required fields to proceed with payment.</p>
                </div>
              )}

              {isCreatingOrder && (
                <div className="mt-6 py-4 bg-blue-100 text-blue-600 font-bold text-lg rounded-xl flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Creating Order...
                </div>
              )}

              {isFormValid && !isCreatingOrder && (
                <div className="mt-6">
                  <button
                    onClick={handlePayPalCheckout}
                    disabled={!isFormValid}
                    className="w-full bg-[#0070ba] hover:bg-[#005ea6] text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.067 8.478c.492.88.556 2.014.3 3.327-.74 3.806-3.276 5.12-6.514 5.12h-.5a.805.805 0 00-.794.68l-.04.22-.63 3.993-.028.15a.806.806 0 01-.795.68H7.72a.483.483 0 01-.477-.558L8.926 12.7h.008c.072-.412.412-.712.832-.712h1.7c3.338 0 5.95-1.355 6.714-5.276.068-.348.122-.68.158-.992.18-1.564-.054-2.628-.83-3.242C16.73 1.858 15.372 1.5 13.5 1.5H6.236c-.57 0-1.055.414-1.145.976L2.48 18.473a.956.956 0 00.943 1.105h3.696l.927-5.88.03-.185c.09-.562.575-.976 1.146-.976h2.39c4.688 0 8.36-1.9 9.436-7.4.044-.23.08-.45.11-.66z" />
                    </svg>
                    <span>Pay with PayPal</span>
                  </button>
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