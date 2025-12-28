import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useCart } from '../contexts/CartContext';
import { useLocalization } from '../contexts/LocalizationContext';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const Checkout: React.FC = () => {
  const { state, removeItem, updateQuantity } = useCart();
  const { formatPrice, getCurrencySymbol, convertPrice, convertINRtoUSD } = useLocalization();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState(state.phoneNumber || '');
  const [address, setAddress] = useState('');
  const { t } = useTranslation();

  const payButtonRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const user = localStorage.getItem('userDetails');
      if (user) {
        const parsed = JSON.parse(user);
        setName(parsed.name || '');
        setEmail(parsed.email || '');
        setPhone(parsed.phone || phone);
      }
    } catch { }
  }, []);

  const extractPriceInINR = (priceString: string): number => {
    const cleaned = priceString.replace(/[₹$€£¥₩د.إ﷼฿₺₱₫RM,]/g, '').trim();
    const price = parseFloat(cleaned);
    return isNaN(price) ? 0 : price;
  };

  const totalAmountINR = useMemo(() => {
    return state.items.reduce((sum, item) => {
      const priceInINR = extractPriceInINR(item.price);
      return sum + priceInINR * item.quantity;
    }, 0);
  }, [state.items]);

  const totalAmountUSD = useMemo(() => {
    return convertINRtoUSD(totalAmountINR);
  }, [totalAmountINR, convertINRtoUSD]);

  const totalAmount = useMemo(() => {
    return convertPrice(totalAmountUSD);
  }, [totalAmountUSD, convertPrice]);

  const handlePay = async () => {
    if (!window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
      await new Promise((res) => (script.onload = res));
    }

    const options = {
      key: 'rzp_test_1234567890abcdef', // Replace with valid key if available
      amount: Math.round(totalAmountINR * 100),
      currency: 'INR',
      name: 'HS-Global',
      description: 'Order payment',
      prefill: { name, email, contact: phone },
      notes: { address },
      theme: { color: '#000000' },
      handler: (response: any) => {
        alert('Payment successful: ' + response.razorpay_payment_id);
      },
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
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


  return (
    <div ref={containerRef} className="max-w-5xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white/70 backdrop-blur-xl border border-black/10 rounded-2xl p-6 shadow">
          <h2 className="text-xl font-semibold text-black mb-4">{t('checkout.title')}</h2>
          <div className="space-y-4">
            {state.items.map((item) => {
              const itemPriceINR = extractPriceInINR(item.price);
              const itemPriceUSD = convertINRtoUSD(itemPriceINR);
              const displayPrice = formatPrice(itemPriceUSD);

              return (
                <div key={item.id} className="flex items-center gap-4 p-4 bg-white/60 rounded-xl border border-black/10">
                  <div className="w-16 h-16 rounded-lg overflow-hidden border border-black/10">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-black truncate">{item.name}</h3>
                      <span className="text-sm text-gray-700">{displayPrice}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <button
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-sm font-medium text-black">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-sm text-red-600 hover:underline"
                      >
                        {t('checkout.remove')}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-6 flex items-center justify-between border-t border-black/10 pt-4">
            <span className="text-lg font-semibold text-black">{t('checkout.total')}</span>
            <span className="text-xl font-bold text-black">
              {getCurrencySymbol()}{totalAmount.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </span>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-xl border border-black/10 rounded-2xl p-6 shadow">
          <h2 className="text-xl font-semibold text-black mb-4">{t('checkout.billing_title')}</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">{t('checkout.name')}</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-black/10 rounded-lg bg-white text-black focus:ring-2 focus:ring-black"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">{t('checkout.email')}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-black/10 rounded-lg bg-white text-black focus:ring-2 focus:ring-black"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">{t('checkout.phone')}</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                maxLength={15}
                className="w-full px-3 py-2 border border-black/10 rounded-lg bg-white text-black focus:ring-2 focus:ring-black"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">{t('checkout.address')}</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-black/10 rounded-lg bg-white text-black focus:ring-2 focus:ring-black"
              />
            </div>
          </div>
          <button
            ref={payButtonRef}
            onClick={handlePay}
            className="mt-6 w-full py-3 bg-black text-white font-semibold rounded-lg hover:bg-black/90 transition-colors"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
          >
            {t('checkout.btn_1')}
          </button>
          <Link to="/products" className="mt-3 block text-center text-sm text-gray-600 hover:underline">
            {t('checkout.btn_2')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Checkout;