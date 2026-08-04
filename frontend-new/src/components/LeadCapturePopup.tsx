'use client';
import React, { useState, useEffect, useRef, useMemo, memo } from 'react';
import { X, User, Mail, Phone, MapPin, CheckCircle, Copy, Check, Clock } from 'lucide-react';
import { countries as allCountries } from '../data/countries';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { popupConfigService } from '../services/popupConfigService';
import { usePopupConfig } from '../hooks/usePopupConfig';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

interface LeadCapturePopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const LeadCapturePopup: React.FC<LeadCapturePopupProps> = ({ isOpen, onClose }) => {
  const config = usePopupConfig();

  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    countryCode: '+91',
    email: '',
    country: '',
    pincode: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [expiryLabel, setExpiryLabel] = useState('');
  const [copied, setCopied] = useState(false);
  const [showCountryDial, setShowCountryDial] = useState(false);
  const [dialQuery, setDialQuery] = useState('');

  const [isRendered, setIsRendered] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const countryDialRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (isOpen) setIsRendered(true); }, [isOpen]);

  useGSAP(() => {
    if (isOpen && isRendered && modalRef.current && backdropRef.current) {
      gsap.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.25 });
      gsap.fromTo(modalRef.current,
        { opacity: 0, scale: 0.96, y: 16 },
        { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: 'power3.out' }
      );
    } else if (!isOpen && isRendered && modalRef.current && backdropRef.current) {
      gsap.to(backdropRef.current, { opacity: 0, duration: 0.2 });
      gsap.to(modalRef.current, {
        opacity: 0, scale: 0.96, y: 8, duration: 0.2, ease: 'power2.in',
        onComplete: () => setIsRendered(false)
      });
    }
  }, [isOpen, isRendered]);

  useEffect(() => {
    if (isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      return () => {
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
      };
    }
  }, [isOpen]);

  const countriesList = useMemo(() => [...allCountries], []);

  const filteredDial = useMemo(() => {
    if (!dialQuery) return countriesList;
    const q = dialQuery.toLowerCase();
    return countriesList.filter(c => c.dialCode.includes(q) || c.name.toLowerCase().includes(q));
  }, [dialQuery, countriesList]);

  const countryNames = useMemo(() => {
    const seen = new Set<string>();
    return countriesList.reduce<string[]>((acc, c) => {
      if (!seen.has(c.name)) { seen.add(c.name); acc.push(c.name); }
      return acc;
    }, []).sort();
  }, [countriesList]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'mobile') {
      setFormData(prev => ({ ...prev, mobile: value.replace(/\D/g, '').slice(0, 10) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = 'Name is required';
    if (!formData.mobile.trim()) errs.mobile = 'Mobile is required';
    else if (formData.mobile.replace(/\D/g, '').length < 6) errs.mobile = 'Enter a valid mobile number';
    if (!formData.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = 'Enter a valid email';
    if (!formData.country) errs.country = 'Please select your country';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await fetch(`${API_URL}/leads/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          countryCode: formData.countryCode,
          phone: formData.mobile,
          country: formData.country,
          pincode: formData.pincode,
        })
      });
    } catch { /* silent — show coupon regardless */ }

    const cfg = config.entryPopup;
    setCouponCode(cfg.couponCode || 'HS10');
    setExpiryLabel(config.exitIntent.expiryDate ? popupConfigService.getExpiryLabel(config.exitIntent.expiryDate) : '');
    setIsSubmitting(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(couponCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleClose = () => {
    setFormData({ name: '', mobile: '', countryCode: '+91', email: '', country: '', pincode: '' });
    setErrors({});
    setCouponCode('');
    setCopied(false);
    onClose();
  };
  if (!isRendered) return null;

  const showSuccess = !!couponCode;
  const bgUrl = config.entryPopup.backgroundImage || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className="fixed inset-0 bg-black/75 backdrop-blur-md"
        onClick={handleClose}
        style={{ opacity: 0 }}
        onWheel={(e) => { e.preventDefault(); e.stopPropagation(); }}
      />

      {/* Main Joybird-style popup card */}
      <div
        ref={modalRef}
        className="relative z-10 w-full max-w-[480px] sm:max-w-[500px] rounded-2xl shadow-[0_32px_80px_rgba(0,0,0,0.5)] overflow-hidden text-white flex flex-col my-auto border border-white/15"
        style={{
          opacity: 0,
          background: `linear-gradient(180deg, rgba(15, 23, 42, 0.45) 0%, rgba(15, 23, 42, 0.72) 100%), url(${bgUrl}) center/cover no-repeat`
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-md flex items-center justify-center text-white transition-all border border-white/20 shadow-md"
          aria-label="Close popup"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 sm:p-8 flex flex-col items-center text-center max-h-[90vh] overflow-y-auto" style={{ overscrollBehavior: 'contain' }}>
          
          {/* Brand Name / Logo */}
          <div className="mt-2 mb-1">
            <h2 className="text-xl sm:text-2xl font-bold tracking-[0.25em] uppercase text-white font-serif drop-shadow-sm">
              ENQUIRY FORM
            </h2>
          </div>

          {!showSuccess ? (
            <>
              {/* Italic Serif Tagline */}
              <p className="font-serif italic text-sm sm:text-base text-gray-200 tracking-wide mt-1">
                {config.entryPopup.heading || 'Exclusive Member Offer'}
              </p>

              {/* Hero Discount Display with Accent Lines */}
              {(config.entryPopup.discountPercentage ?? 12) > 0 && (
                <div className="w-full my-4 py-2.5 border-y border-white/30 flex flex-col items-center">
                  <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white drop-shadow-md">
                    {config.entryPopup.discountPercentage || 12}% OFF
                  </span>
                  <span className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-gray-200 mt-1 font-medium">
                    Your Order*
                  </span>
                </div>
              )}

              {/* Subheading / CTA encouragement */}
              <p className="text-xs sm:text-sm text-gray-200 mb-5 font-light">
                {config.entryPopup.subheading || 'Unlock your exclusive benefits'}
              </p>

              {/* Lead Form */}
              <form onSubmit={handleSubmit} className="w-full space-y-3">
                {/* Full Name */}
                <div>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      className={`w-full pl-10 pr-4 py-3 rounded-lg text-sm text-gray-900 bg-white/95 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 font-normal transition-all shadow-sm ${errors.name ? 'ring-2 ring-red-400' : ''}`}
                    />
                  </div>
                  {errors.name && <p className="text-red-300 text-[11px] mt-1 text-left">{errors.name}</p>}
                </div>

                {/* Email Address */}
                <div>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email address"
                      className={`w-full pl-10 pr-4 py-3 rounded-lg text-sm text-gray-900 bg-white/95 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 font-normal transition-all shadow-sm ${errors.email ? 'ring-2 ring-red-400' : ''}`}
                    />
                  </div>
                  {errors.email && <p className="text-red-300 text-[11px] mt-1 text-left">{errors.email}</p>}
                </div>

                {/* Mobile Input with Dial Dropdown */}
                <div>
                  <div
                    className="flex text-gray-900"
                    ref={countryDialRef}
                    tabIndex={0}
                    onBlur={() => setTimeout(() => {
                      if (countryDialRef.current && !countryDialRef.current.contains(document.activeElement)) {
                        setShowCountryDial(false);
                      }
                    }, 0)}
                  >
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowCountryDial(v => !v)}
                        className="px-3 py-3 bg-white/95 border-r border-gray-200 rounded-l-lg flex items-center gap-1 text-xs sm:text-sm font-medium flex-shrink-0 focus:outline-none"
                        style={{ width: '85px' }}
                      >
                        <span>{(countriesList.find(c => c.dialCode === formData.countryCode) || { flag: '🌐' as any }).flag}</span>
                        <span className="text-xs font-semibold">{formData.countryCode}</span>
                        <svg className="w-3 h-3 text-gray-500 ml-auto" viewBox="0 0 20 20" fill="currentColor"><path d="M5.23 7.21a.75.75 0 011.06.02L10 11.188l3.71-3.957a.75.75 0 111.08 1.04l-4.24 4.52a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" /></svg>
                      </button>

                      {showCountryDial && (
                        <div className="absolute left-0 top-full mt-1 w-56 max-h-48 overflow-auto bg-white border border-gray-200 rounded-lg shadow-2xl z-30 text-left text-gray-900">
                          <div className="p-2 border-b border-gray-100 sticky top-0 bg-white">
                            <input
                              type="text"
                              value={dialQuery}
                              onChange={(e) => setDialQuery(e.target.value)}
                              placeholder="Search country..."
                              className="w-full px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                            />
                          </div>
                          {filteredDial.map(c => (
                            <button
                              key={`${c.code}-${c.dialCode}`}
                              type="button"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => { setFormData(p => ({ ...p, countryCode: c.dialCode })); setShowCountryDial(false); setDialQuery(''); }}
                              className="w-full text-left px-3 py-1.5 hover:bg-gray-100 text-xs flex items-center gap-2 transition-colors"
                            >
                              <span>{c.flag}</span>
                              <span className="font-semibold text-xs">{c.dialCode}</span>
                              <span className="text-gray-500 text-xs truncate">{c.name}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <input
                      name="mobile"
                      type="tel"
                      inputMode="numeric"
                      value={formData.mobile}
                      onChange={handleChange}
                      placeholder="Mobile number"
                      className={`flex-1 min-w-0 px-3.5 py-3 bg-white/95 rounded-r-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 font-normal transition-all shadow-sm ${errors.mobile ? 'ring-2 ring-red-400' : ''}`}
                    />
                  </div>
                  {errors.mobile && <p className="text-red-300 text-[11px] mt-1 text-left">{errors.mobile}</p>}
                </div>

                {/* Country + Pincode */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className={`w-full px-3 py-3 rounded-lg text-xs sm:text-sm text-gray-900 bg-white/95 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all ${errors.country ? 'ring-2 ring-red-400' : ''}`}
                    >
                      <option value="">Select country</option>
                      {countryNames.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                    {errors.country && <p className="text-red-300 text-[11px] mt-1 text-left">{errors.country}</p>}
                  </div>

                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                    <input
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      placeholder="ZIP / Pincode"
                      className="w-full pl-8 pr-3 py-3 rounded-lg text-xs sm:text-sm text-gray-900 bg-white/95 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 bg-white text-gray-900 py-3.5 rounded-lg text-xs sm:text-sm font-bold uppercase tracking-[0.2em] hover:bg-gray-100 active:scale-[0.99] transition-all shadow-lg text-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Unlocking...' : 'GET MY DISCOUNT'}
                </button>
              </form>

              {/* No, thanks dismiss link */}
              <button
                type="button"
                onClick={handleClose}
                className="mt-4 text-xs text-gray-300 hover:text-white underline decoration-gray-400 underline-offset-4 transition-colors font-light"
              >
                No, thanks.
              </button>

              {/* Footer disclaimer */}
              <p className="text-[10px] text-gray-300/80 mt-4 font-light tracking-wide">
                Hurry, these exclusive deals are time-limited. *Terms & conditions apply.
              </p>
            </>
          ) : (
            /* Success State */
            <div className="py-6 flex flex-col items-center w-full">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-4 border border-white/30">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-white uppercase tracking-wider mb-2">Thank You!</h3>
              <p className="text-xs sm:text-sm text-gray-200 mb-6 font-light">Here is your exclusive discount code:</p>

              <div className="w-full max-w-[300px] bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-6 py-6 mb-6">
                <p className="text-[10px] uppercase tracking-[0.3em] text-gray-300 mb-1">Your Code</p>
                <p className="text-3xl font-extrabold tracking-[0.3em] text-white my-1">{couponCode}</p>
                {expiryLabel && (
                  <p className="text-xs text-amber-300 flex items-center justify-center gap-1.5 mt-2 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    {expiryLabel}
                  </p>
                )}
              </div>

              <button
                onClick={handleCopy}
                className={`flex items-center justify-center gap-2 w-full max-w-[280px] py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg ${copied ? 'bg-green-500 text-white' : 'bg-white text-gray-900 hover:bg-gray-100'}`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied to Clipboard!' : 'Copy Code'}
              </button>

              <p className="text-xs text-gray-300 mt-4 font-light">
                Apply this code at checkout to claim your discount
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(LeadCapturePopup);
