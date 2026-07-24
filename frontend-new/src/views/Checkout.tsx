'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useCurrency, DEFAULT_RATES } from '../contexts/CurrencyContext';
import { useRegion } from '../contexts/RegionContext';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Minus, Plus, Trash2, ArrowLeft, Loader2, ChevronDown, Tag } from 'lucide-react';
import { Country, State, City } from 'country-state-city';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

const Checkout: React.FC = () => {
  const { state, removeItem, updateQuantity, getRegionalEffectivePriceINR, applyCoupon, removeCoupon } = useCart();
  const { formatPrice, getCurrencySymbol, convertFromINR, exchangeRates, currency } = useCurrency();
  const { region: pricingRegion } = useRegion();
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

  // Backend-calculated prices
  const [backendPrices, setBackendPrices] = useState<any>(null);
  const [loadingPrices, setLoadingPrices] = useState(false);

  // Coupon state (local to checkout for input; applied coupon lives in CartContext)
  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  const getCheckoutItemId = (item: any): string => String(item?.productId || item?.id || '');

  const backendItemMap = useMemo(() => {
    const map = new Map<string, any>();
    (backendPrices?.items || []).forEach((item: any) => {
      if (item?.productId) {
        map.set(String(item.productId), item);
      }
      if (item?.requestedId) {
        map.set(String(item.requestedId), item);
      }
    });
    return map;
  }, [backendPrices]);

  const hasAuthoritativePricing = useMemo(() => {
    if (!backendPrices?.ok || !Array.isArray(backendPrices?.items)) return false;
    if (backendPrices.items.length !== state.items.length) return false;
    return state.items.every((item) => backendItemMap.has(getCheckoutItemId(item)));
  }, [backendPrices, state.items, backendItemMap]);

  // Fetch backend prices when cart changes
  useEffect(() => {
    const fetchBackendPrices = async () => {
      if (state.items.length === 0) return;

      setLoadingPrices(true);
      try {
        const response = await fetch(`${API_URL}/calculate-cart-total`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            items: state.items.map(item => ({
              id: getCheckoutItemId(item),
              productId: getCheckoutItemId(item),
              quantity: item.quantity
            })),
            currency: currency,
            region: pricingRegion,
            couponCode: state.appliedCoupon?.code || undefined
          })
        });

        if (response.ok) {
          const data = await response.json();
          setBackendPrices(data);

          // Emit telemetry when local cart math diverges from backend authoritative totals.
          const localTotalINR = state.items.reduce((sum, item) => sum + (item.priceINR * item.quantity), 0);
          const backendTotalINR = Number(data?.totals?.INR || 0);
          const deltaINR = Number((backendTotalINR - localTotalINR).toFixed(2));

          const lineMismatches = (data?.items || [])
            .map((backendItem: any) => {
              const localItem = state.items.find((item) => {
                const localId = getCheckoutItemId(item);
                return localId === String(backendItem.productId || '') || localId === String(backendItem.requestedId || '');
              });
              if (!localItem) {
                return {
                  productId: backendItem.productId,
                  reason: 'missing-local-item',
                  backendFinalPriceINR: backendItem.finalPriceINR
                };
              }

              const localUnitPrice = Number(localItem.priceINR || 0);
              const backendUnitPrice = Number(backendItem.finalPriceINR || 0);
              const unitDelta = Number((backendUnitPrice - localUnitPrice).toFixed(2));

              if (Math.abs(unitDelta) <= 0.01) {
                return null;
              }

              return {
                productId: backendItem.productId,
                localUnitPriceINR: localUnitPrice,
                backendUnitPriceINR: backendUnitPrice,
                unitDeltaINR: unitDelta
              };
            })
            .filter(Boolean);

          if (Math.abs(deltaINR) > 0.01 || lineMismatches.length > 0) {
            fetch(`${API_URL}/payment-pricing-telemetry`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                severity: 'warning',
                source: 'checkout-page',
                localTotalINR,
                backendTotalINR,
                deltaINR,
                itemCount: state.items.length,
                lineMismatches
              }),
            }).catch(() => {
              // Non-blocking telemetry
            });
          }
        } else {
          const errorData = await response.json().catch(() => ({}));
          setBackendPrices(null);
          setPaymentError(errorData.error || 'Unable to validate live pricing. Please refresh and try again.');
        }
      } catch (error) {
        console.error('Failed to fetch backend prices:', error);
        setBackendPrices(null);
        setPaymentError('Unable to validate live pricing. Please check your connection and try again.');
      } finally {
        setLoadingPrices(false);
      }
    };

    fetchBackendPrices();
  }, [state.items, currency]);

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

  // Backend returns totals.INR (canonical, pre-coupon) and totals.subtotalUSD (pre-coupon, for the coupon API)
  const subtotalBeforeCouponUSD = useMemo(() => {
    if (hasAuthoritativePricing && backendPrices?.totals?.subtotalUSD !== undefined) {
      return Number(backendPrices.totals.subtotalUSD);
    }
    return 0;
  }, [backendPrices, hasAuthoritativePricing]);

  const subtotalBeforeCouponINR = useMemo(() => {
    if (hasAuthoritativePricing && backendPrices?.totals?.INR !== undefined) {
      return Number(backendPrices.totals.INR);
    }
    return 0;
  }, [backendPrices, hasAuthoritativePricing]);

  const couponDiscountUSD = useMemo(() => {
    return backendPrices?.couponDiscount?.discountAmountUSD ?? 0;
  }, [backendPrices]);

  // Coupons are USD-denominated at the source (Coupon model); converted once for display alongside the canonical INR subtotal.
  const couponDiscountINR = useMemo(() => {
    if (!couponDiscountUSD) return 0;
    const inrRate = exchangeRates.INR || DEFAULT_RATES.INR;
    return Math.round(couponDiscountUSD * inrRate * 100) / 100;
  }, [couponDiscountUSD, exchangeRates]);

  // Convert the canonical INR total (post-coupon) to the region's display currency
  const subtotal = useMemo(
    () => convertFromINR(Math.max(0, subtotalBeforeCouponINR - couponDiscountINR)),
    [subtotalBeforeCouponINR, couponDiscountINR, convertFromINR]
  );
  const totalAmount = subtotal;

  // Get standardized payment currency details from Context
  const { currency: paymentCurrency } = useCurrency().getPaymentCurrency();

  // Use backend-calculated payment amount (the actual PayPal charge — always in USD)
  const paymentAmount = useMemo(() => {
    if (hasAuthoritativePricing && backendPrices?.totals?.USD !== undefined) {
      return Number(backendPrices.totals.USD).toFixed(2);
    }
    return '0.00';
  }, [backendPrices, hasAuthoritativePricing]);

  const isEmailValid = useMemo(() => /^(?=.*@).+\..+$/i.test(email.trim()), [email]);
  const isFormValid = name && isEmailValid && phone && address1 && city && region && postalCode && country;

  // Handle PayPal checkout with redirect
  const handlePayPalCheckout = async () => {
    try {
      setIsCreatingOrder(true);
      setPaymentError(null);

      if (!hasAuthoritativePricing) {
        throw new Error('Live pricing validation is required before payment. Please wait for prices to load.');
      }

      // Prepare items from backend-authoritative line totals only.
      const orderItems = state.items.map((item) => {
        const checkoutItemId = getCheckoutItemId(item);
        const backendItem = backendItemMap.get(checkoutItemId);
        if (!backendItem) {
          throw new Error(`Pricing not available for ${item.name}. Please refresh and try again.`);
        }

        return {
          id: checkoutItemId,
          productId: checkoutItemId,
          name: item.name,
          quantity: item.quantity,
          price: Number(backendItem.finalPriceUSD).toFixed(2),
          priceINR: Number(backendItem.priceINR),
          image: item.image,
          category: item.category || 'Natural Stone',
          discount: backendItem.discount || null
        };
      });

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
          items: orderItems,
          region: pricingRegion,
          couponCode: state.appliedCoupon?.code || undefined,
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

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError(null);
    try {
      const res = await fetch(`${API_URL}/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponInput.trim(), cartTotalUSD: subtotalBeforeCouponUSD, userId: user?._id })
      });
      const data = await res.json();
      if (!data.ok) {
        setCouponError(data.message || 'Invalid coupon');
      } else {
        applyCoupon({ code: data.code, discountType: data.discountType, discountValue: data.discountValue, discountAmountUSD: data.discountAmountUSD });
        setCouponInput('');
      }
    } catch {
      setCouponError('Failed to validate coupon. Please try again.');
    } finally {
      setCouponLoading(false);
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
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                    placeholder="Enter your phone number"
                    required
                  />
                </div>

                <div className="md:col-span-2 pt-2">
                  <h3 className="text-lg font-medium text-black border-b border-gray-100 pb-2 mb-4">Shipping Address</h3>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Country / Region</label>
                  <div className="relative">
                    <select
                      value={country}
                      onChange={(e) => {
                        setCountry(e.target.value);
                        setRegion('');
                        setCity('');
                      }}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all appearance-none"
                    >
                      <option value="">Select Country</option>
                      {Country.getAllCountries().map((c) => (
                        <option key={c.isoCode} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">State / Province</label>
                  {(() => {
                    const countryCode = Country.getAllCountries().find((c) => c.name === country)?.isoCode;
                    const availableStates = countryCode ? State.getStatesOfCountry(countryCode) : [];
                    
                    if (availableStates.length > 0) {
                      return (
                        <div className="relative">
                          <select
                            value={region}
                            onChange={(e) => {
                              setRegion(e.target.value);
                              setCity('');
                            }}
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all appearance-none"
                          >
                            <option value="">Select State/Province</option>
                            {availableStates.map((s) => (
                              <option key={s.isoCode} value={s.name}>{s.name}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        </div>
                      );
                    }
                    return (
                      <input
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                        placeholder="State / Region"
                      />
                    );
                  })()}
                </div>

                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
                  {(() => {
                    const countryCode = Country.getAllCountries().find((c) => c.name === country)?.isoCode;
                    const stateCode = countryCode && region ? State.getStatesOfCountry(countryCode).find((s) => s.name === region)?.isoCode : undefined;
                    const availableCities = countryCode && stateCode ? City.getCitiesOfState(countryCode, stateCode) : [];

                    if (availableCities.length > 0) {
                      return (
                        <div className="relative">
                          <select
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all appearance-none"
                          >
                            <option value="">Select City</option>
                            {availableCities.map((c) => (
                              <option key={c.name} value={c.name}>{c.name}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        </div>
                      );
                    }
                    return (
                      <input
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                        placeholder="City"
                      />
                    );
                  })()}
                </div>

                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Postal Code</label>
                  <input
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                    placeholder="ZIP / Postal Code"
                  />
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
                    <p className="text-sm font-medium text-blue-900">Delivery charges are paid separately</p>
                    <p className="text-xs text-blue-700 mt-1">
                      Shipping charges are calculated based on your delivery location, package dimensions, and preferred shipping method. Your dedicated export executive will provide a detailed quotation within 24 hours for your approval before shipment.
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
                        {backendItemMap.get(getCheckoutItemId(item))?.discountPercentage > 0 ? (
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold text-green-600">{formatPrice(Number(backendItemMap.get(getCheckoutItemId(item))?.finalPriceINR || 0))}</p>
                              <span className="px-1.5 py-0.5 bg-red-500 text-white rounded text-xs font-bold">
                                {backendItemMap.get(getCheckoutItemId(item))?.discountPercentage || 0}% OFF
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 line-through">{formatPrice(Number(backendItemMap.get(getCheckoutItemId(item))?.priceINR || 0))}</p>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">{formatPrice(Number(backendItemMap.get(getCheckoutItemId(item))?.priceINR || 0))}</p>
                        )}
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
                        {formatPrice(Number(backendItemMap.get(getCheckoutItemId(item))?.finalPriceINR || 0) * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {loadingPrices && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Validating live prices from server...
                </div>
              )}

              {!loadingPrices && !hasAuthoritativePricing && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  Live pricing is unavailable right now. Payment is disabled until server pricing is validated.
                </div>
              )}

              {/* Coupon Input */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                {state.appliedCoupon ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                    <div className="flex items-center gap-2 text-green-800 text-sm">
                      <Tag className="w-4 h-4" />
                      <span className="font-semibold">{state.appliedCoupon.code}</span>
                      <span className="text-green-600">
                        {state.appliedCoupon.discountType === 'percentage'
                          ? `${state.appliedCoupon.discountValue}% off`
                          : `$${state.appliedCoupon.discountValue.toFixed(2)} off`}
                      </span>
                    </div>
                    <button onClick={() => removeCoupon()} className="text-sm text-green-700 hover:text-red-600 transition-colors font-medium">Remove</button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Coupon Code</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponError(null); }}
                        onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                        placeholder="Enter coupon code"
                        className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all text-sm"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={couponLoading || !couponInput.trim()}
                        className="px-4 py-3 bg-black text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {couponLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                      </button>
                    </div>
                    {couponError && <p className="text-xs text-red-600">{couponError}</p>}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>{getCurrencySymbol()}{convertFromINR(subtotalBeforeCouponINR).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                {couponDiscountINR > 0 && (
                  <div className="flex justify-between text-sm text-green-700 font-medium">
                    <span className="flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" />{backendPrices?.couponDiscount?.code}</span>
                    <span>−{getCurrencySymbol()}{convertFromINR(couponDiscountINR).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Delivery</span>
                  <span className="text-gray-700 font-medium">Paid Separately</span>
                </div>
                <div className="text-xs text-gray-500 -mt-2 text-right">
                  Delivery charges will be shared with you separately
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
                    disabled={!isFormValid || !hasAuthoritativePricing || loadingPrices}
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