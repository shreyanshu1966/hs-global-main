import React, { useEffect, useMemo, useState, useRef } from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, MessageCircle } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { Link } from 'react-router-dom';
import { useLocalization } from '../contexts/LocalizationContext';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const CartDrawer: React.FC = () => {
  const { formatPrice, currency, getCurrencySymbol, convertPrice, convertINRtoUSD } = useLocalization();
  const { state, updateQuantity, removeItem, closeCart, getTotalPriceNumeric, clearCart } = useCart();
  const [step, setStep] = useState<'cart' | 'details' | 'confirm' | 'success'>('cart');
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
  const [paymentInfo, setPaymentInfo] = useState<{ paymentId: string; orderId: string; amount: number } | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [razorpayReady, setRazorpayReady] = useState(false);

  const [isRendered, setIsRendered] = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('userDetails');
      if (saved) {
        const parsed = JSON.parse(saved);
        setName(parsed.name || '');
        setEmail(parsed.email || '');
        setPhone(parsed.phone || phone);
      }
    } catch { }
  }, []);

  // Keep local phone in sync with verified number from cart state
  useEffect(() => {
    if (state.phoneNumber && state.isPhoneVerified) {
      setPhone(state.phoneNumber);
    }
  }, [state.phoneNumber, state.isPhoneVerified]);

  // Handle drawer visibility state
  useEffect(() => {
    if (state.isCartOpen) setIsRendered(true);
  }, [state.isCartOpen]);

  useGSAP(() => {
    if (state.isCartOpen && isRendered && backdropRef.current && drawerRef.current) {
      gsap.to(backdropRef.current, { opacity: 1, duration: 0.3 });
      gsap.to(drawerRef.current, { x: 0, duration: 0.4, ease: "power3.out" });
    } else if (!state.isCartOpen && isRendered && backdropRef.current && drawerRef.current) {
      gsap.to(backdropRef.current, { opacity: 0, duration: 0.3 });
      gsap.to(drawerRef.current, { x: '100%', duration: 0.4, ease: "power3.in", onComplete: () => setIsRendered(false) });
    }
  }, [state.isCartOpen, isRendered]);

  // Helper to extract numeric price from price string (always in INR)
  const extractPriceInINR = (priceString: string): number => {
    // Remove all non-numeric characters except decimal point
    const cleaned = priceString.replace(/[^0-9.]/g, '');
    const price = parseFloat(cleaned);
    return isNaN(price) ? 0 : price;
  };

  // 1. Calculate Subtotal in INR (Base)
  const subtotalINR = useMemo(() => {
    return state.items.reduce((sum, item) => {
      const priceInINR = extractPriceInINR(item.price);
      return sum + priceInINR * item.quantity;
    }, 0);
  }, [state.items]);

  // 2. Convert to USD (Intermediate)
  const subtotalUSD = useMemo(() => convertINRtoUSD(subtotalINR), [subtotalINR, convertINRtoUSD]);

  // 3. Convert to User's Currency
  const subtotal = useMemo(() => convertPrice(subtotalUSD), [subtotalUSD, convertPrice]);

  // 4. Calculate Tax (18% of converted subtotal)
  // 4. Calculate Tax (0% - Disabled)
  const tax = 0;

  // 5. Calculate shipping (Disabled)
  const shipping = 0;

  // 6. Calculate Packaging (Disabled)
  const packaging = 0;

  // 7. Total
  const totalAmount = useMemo(() => subtotal + tax + shipping + packaging, [subtotal, tax, shipping, packaging]);

  const handleClose = () => {
    if (step === 'success') {
      try { clearCart(); } catch { }
      setName('');
      setEmail('');
      setAddress1('');
      setAddress2('');
      setCity('');
      setRegion('');
      setPostalCode('');
      setStep('details');
      setPaymentInfo(null);
      setPaymentError(null);
    }
    closeCart();
  };

  const WhatsAppSupportButton = () => {
    const getSupportMessage = () => {
      const itemsList = state.items.map(item => `${item.name} (Qty: ${item.quantity})`).join(', ');
      return `Hi! I'm interested in these products in my cart: ${itemsList}. Can you help me with more details?`;
    };

    return (
      <a
        href={`https://wa.me/918107115116?text=${encodeURIComponent(getSupportMessage())}`}
        target="_blank"
        rel="noreferrer"
        className="flex items-center justify-center gap-2 py-3 px-4 bg-black text-white font-medium rounded-lg hover:bg-white hover:text-black transition-all duration-300 border-2 border-black hover:border-white"
        aria-label="WhatsApp Inquiry"
        title="Inquire about cart items via WhatsApp"
      >
        <MessageCircle className="w-4 h-4" />
        WhatsApp
      </a>
    );
  };

  const isEmailValid = useMemo(() => {
    return /^(?=.*@).+\..+$/i.test(email.trim());
  }, [email]);

  // Group cart items by category
  const groupedItems = useMemo(() => {
    const groups: { [key: string]: typeof state.items } = {};
    state.items.forEach(item => {
      const category = item.category || 'Other';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(item);
    });
    return groups;
  }, [state.items]);

  // Preload Razorpay script when drawer opens
  useEffect(() => {
    if (!state.isCartOpen) return;
    if (window.Razorpay) {
      setRazorpayReady(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setRazorpayReady(true);
    script.onerror = () => setRazorpayReady(false);
    document.body.appendChild(script);
  }, [state.isCartOpen]);

  const handlePay = async () => {
    // Convert total amount to INR for Razorpay (always process in INR)
    const totalInINR = subtotalINR;
    const amountPaise = Math.round(totalInINR * 100);

    try {
      setIsCreatingOrder(true);
      setPaymentError(null);

      console.log('📦 Creating Razorpay order...', { amount: amountPaise });

      const orderRes = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totalInINR,
          currency: 'INR',
          receipt: `rcpt_${Date.now()}`
        }),
      });

      if (!orderRes.ok) {
        const errorData = await orderRes.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create payment order');
      }

      const orderData = await orderRes.json();
      console.log('✅ Order created:', orderData);

      if (!orderData.ok || !orderData.order) {
        throw new Error('Invalid order response from server');
      }

      const { order, keyId } = orderData;

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
            console.log('⚠️ Payment modal dismissed');
            setPaymentError('Payment was cancelled. Please try again.');
            setIsCreatingOrder(false);
          },
        },
        handler: async (response: any) => {
          try {
            console.log('💳 Payment response received:', response);

            const verifyRes = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            if (!verifyRes.ok) {
              throw new Error('Payment verification failed');
            }

            const verifyJson = await verifyRes.json();
            console.log('🔍 Verification response:', verifyJson);

            if (verifyJson.ok && verifyJson.valid) {
              console.log('✅ Payment verified successfully!');
              setPaymentInfo({
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                amount: order.amount
              });
              setStep('success');
              setPaymentError(null);
            } else {
              throw new Error(verifyJson.error || 'Payment verification failed');
            }
          } catch (e: any) {
            console.error('❌ Verification error:', e);
            setPaymentError(e.message || 'Payment verification error. Please contact support.');
          } finally {
            setIsCreatingOrder(false);
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (e: any) {
      console.error('❌ Payment error:', e);
      setPaymentError(e.message || 'Payment failed. Please try again.');
      setIsCreatingOrder(false);
    }
  };

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(id);
    } else {
      updateQuantity(id, newQuantity);
    }
  };

  return (
    <>
      {isRendered && (
        <>
          {/* Backdrop */}
          <div
            ref={backdropRef}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={handleClose}
            style={{ opacity: 0 }}
          />

          {/* Drawer */}
          <div
            ref={drawerRef}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white/70 backdrop-blur-xl text-black shadow-2xl z-50 flex flex-col border-l border-black/10"
            style={{ transform: 'translateX(100%)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-black/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-black rounded-full">
                  <ShoppingBag className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-black">
                    {step === 'success' ? 'Order Successful' : 'Shopping Cart'}
                  </h2>
                  {step !== 'success' && (
                    <p className="text-sm text-gray-700">
                      {state.items.length} {state.items.length === 1 ? 'item' : 'items'}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-black/10 rounded-full transition-colors border border-black/10"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {step !== 'success' && state.isPhoneVerified && state.phoneNumber && (
              <div className="px-6 py-2 text-sm text-gray-700 border-b border-black/10">
                Verified number: <span className="font-semibold">{state.phoneNumber}</span>
              </div>
            )}

            {/* Body */}
            <div className={`flex-1 p-6 custom-scrollbar ${step === 'cart' || step === 'details' || step === 'confirm' ? 'overflow-y-auto' : 'overflow-hidden'}`}>
              {state.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mb-4 border border-black/10">
                    <ShoppingBag className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-medium text-black mb-2">Your cart is empty</h3>
                  <p className="text-gray-700 mb-6">Add some products to get started</p>
                  <button
                    onClick={handleClose}
                    className="px-6 py-3 bg-black text-white font-semibold rounded-lg hover:bg-black/90 transition-all duration-200 border border-black/10"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : step === 'cart' ? (
                <div className="space-y-6">
                  {Object.entries(groupedItems).map(([category, items]) => (
                    <div key={category} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-black capitalize">{category}</h3>
                        <div className="flex-1 h-px bg-black/10"></div>
                        <span className="text-sm text-gray-600">
                          {items.length} item{items.length !== 1 ? 's' : ''}
                        </span>
                      </div>

                      <div className="space-y-3">
                        {items.map((item) => (
                          <div
                            key={item.id}
                            className="flex gap-4 p-4 bg-white/60 backdrop-blur-md rounded-xl border border-black/10"
                          >
                            <div className="w-16 h-16 bg-white rounded-lg overflow-hidden flex-shrink-0 border border-black/10">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>

                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-black truncate">{item.name}</h3>
                              <p className="text-sm text-gray-700">{formatPrice(convertINRtoUSD(extractPriceInINR(item.price)))}</p>

                              <div className="flex items-center gap-2 mt-2">
                                <button
                                  onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                  className="w-6 h-6 bg-black text-white border border-black/10 rounded-full flex items-center justify-center hover:bg-black/90 transition-colors"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-8 text-center text-sm font-medium text-black">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                  className="w-6 h-6 bg-black text-white border border-black/10 rounded-full flex items-center justify-center hover:bg-black/90 transition-colors"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            <button
                              onClick={() => removeItem(item.id)}
                              className="p-2 text-gray-500 hover:text-red-500 transition-colors border border-black/10 rounded-full hover:border-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : step === 'details' ? (
                <div className="space-y-4">
                  <div className="bg-white/60 backdrop-blur-md rounded-xl border border-black/10 p-4">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Name</label>
                        <input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full px-3 py-2 border border-black/10 rounded-lg bg-white text-black focus:ring-2 focus:ring-black"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-3 py-2 border border-black/10 rounded-lg bg-white text-black focus:ring-2 focus:ring-black"
                        />
                        {!isEmailValid && email && (
                          <p className="mt-1 text-xs text-red-600">Please enter a valid email address.</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Phone (verified)</label>
                        <input
                          value={phone}
                          readOnly
                          aria-readonly="true"
                          className="w-full px-3 py-2 border border-black/10 rounded-lg bg-gray-100 text-gray-800"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Address Line 1</label>
                        <input
                          value={address1}
                          onChange={(e) => setAddress1(e.target.value)}
                          className="w-full px-3 py-2 border border-black/10 rounded-lg bg-white text-black focus:ring-2 focus:ring-black"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Address Line 2 (optional)</label>
                        <input
                          value={address2}
                          onChange={(e) => setAddress2(e.target.value)}
                          className="w-full px-3 py-2 border border-black/10 rounded-lg bg-white text-black focus:ring-2 focus:ring-black"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">City</label>
                          <input
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="w-full px-3 py-2 border border-black/10 rounded-lg bg-white text-black focus:ring-2 focus:ring-black"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">State/Province/Region</label>
                          <input
                            value={region}
                            onChange={(e) => setRegion(e.target.value)}
                            className="w-full px-3 py-2 border border-black/10 rounded-lg bg-white text-black focus:ring-2 focus:ring-black"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">Postal Code</label>
                          <input
                            value={postalCode}
                            onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, ''))}
                            className="w-full px-3 py-2 border border-black/10 rounded-lg bg-white text-black focus:ring-2 focus:ring-black"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">Country</label>
                          <select
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            className="w-full px-3 py-2 border border-black/10 rounded-lg bg-white text-black focus:ring-2 focus:ring-black"
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
                </div>
              ) : step === 'success' ? (
                <div className="space-y-4">
                  <div className="bg-white/60 backdrop-blur-md rounded-xl border border-black/10 p-6 text-center">
                    <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-green-500 flex items-center justify-center text-white">
                      ✓
                    </div>
                    <h3 className="text-xl font-semibold text-black mb-1">Payment Successful</h3>
                    <p className="text-gray-700">Thank you for your order.</p>
                  </div>
                  <div className="bg-white/60 backdrop-blur-md rounded-xl border border-black/10 p-4">
                    <h4 className="text-lg font-semibold text-black mb-3">Invoice (Sample)</h4>
                    <div className="text-sm text-gray-800 space-y-1">
                      <div className="flex justify-between">
                        <span>Payment ID</span>
                        <span className="font-medium">{paymentInfo?.paymentId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Order ID</span>
                        <span className="font-medium">{paymentInfo?.orderId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Amount</span>
                        <span className="font-medium">
                          ₹{((paymentInfo?.amount || 0) / 100).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Name</span>
                        <span className="font-medium">{name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Email</span>
                        <span className="font-medium">{email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Phone</span>
                        <span className="font-medium">{phone}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Address</span>
                        <div className="font-medium text-black">
                          {[address1, address2, city, region, postalCode, country].filter(Boolean).join(', ')}
                        </div>
                      </div>
                      <div className="pt-2 border-t border-black/10 text-xs text-gray-600">
                        This is a sample invoice for demo purposes.
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-white/60 backdrop-blur-md rounded-xl border border-black/10 p-4">
                    <div className="grid grid-cols-2 gap-3 text-sm text-gray-800">
                      <div>
                        <p className="text-gray-500">Name</p>
                        <p className="font-medium text-black truncate">{name || '-'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Email</p>
                        <p className="font-medium text-black truncate">{email || '-'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Phone</p>
                        <p className="font-medium text-black truncate">{phone || '-'}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-gray-500">Address</p>
                        <p className="font-medium text-black truncate">
                          {[address1, address2, city, region, postalCode, country].filter(Boolean).join(', ') || '-'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/60 backdrop-blur-md rounded-xl border border-black/10 p-4">
                    {paymentError && (
                      <div className="mb-3 p-3 rounded-lg border border-red-300 bg-red-50 text-sm text-red-700">
                        {paymentError}
                      </div>
                    )}
                    <div className="space-y-2">
                      {state.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between text-sm text-gray-800">
                          <span className="truncate mr-2">{item.name} × {item.quantity}</span>
                          <span>{formatPrice(convertINRtoUSD(extractPriceInINR(item.price)))}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-black/10 space-y-2 text-sm">
                      <div className="flex items-center justify-between text-gray-700">
                        <span>Subtotal</span>
                        <span>
                          {getCurrencySymbol()}{subtotal.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </span>
                      </div>


                      <div className="flex items-center justify-between border-t border-black/10 pt-2">
                        <span className="text-base font-semibold text-black">Total</span>
                        <span className="text-lg font-bold text-black">
                          {getCurrencySymbol()}{totalAmount.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            {state.items.length > 0 && step !== 'success' && (
              <div className="border-t border-black/10 p-6 space-y-3">
                {step === 'cart' ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-black">Total</span>
                      <span className="text-xl font-bold text-black">
                        {getCurrencySymbol()}{totalAmount.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </span>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setStep('details')}
                        className="flex-1 py-3 px-4 bg-black text-white font-semibold rounded-lg hover:bg-white hover:text-black border-2 border-black hover:border-white transition-all duration-300"
                      >
                        Proceed
                      </button>
                      <WhatsAppSupportButton />
                    </div>
                    <button
                      onClick={handleClose}
                      className="w-full py-2 px-4 border-2 border-black text-black font-medium rounded-lg hover:bg-black hover:text-white transition-all duration-300"
                    >
                      Continue Shopping
                    </button>
                  </>
                ) : step === 'details' ? (
                  <>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setStep('cart')}
                        className="flex-1 py-3 px-4 border-2 border-black text-black font-medium rounded-lg hover:bg-black hover:text-white transition-all duration-300"
                      >
                        Back
                      </button>
                      <button
                        onClick={() => setStep('confirm')}
                        disabled={!name || !isEmailValid || !phone || !address1 || !city || !region || !postalCode || !country}
                        className="flex-1 py-3 px-4 bg-black text-white font-semibold rounded-lg hover:bg-white hover:text-black border-2 border-black hover:border-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                      >
                        Review Order
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-black">Total</span>
                      <span className="text-xl font-bold text-black">
                        {getCurrencySymbol()}{totalAmount.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </span>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setStep('details')}
                        disabled={isCreatingOrder}
                        className="flex-1 py-3 px-4 border-2 border-black text-black font-medium rounded-lg hover:bg-black hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Back
                      </button>
                      <button
                        onClick={handlePay}
                        disabled={isCreatingOrder || !name || !isEmailValid || !phone || !address1 || !city || !region || !postalCode || !country}
                        className="flex-1 py-3 px-4 bg-black text-white font-semibold rounded-lg hover:bg-white hover:text-black border-2 border-black hover:border-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        {isCreatingOrder ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/70 border-t-transparent rounded-full animate-spin" />
                            Processing...
                          </>
                        ) : (
                          'Pay Now'
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
};