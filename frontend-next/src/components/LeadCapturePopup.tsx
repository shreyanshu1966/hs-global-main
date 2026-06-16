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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6">
      <div
        ref={backdropRef}
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={handleClose}
        style={{ opacity: 0 }}
        onWheel={(e) => { e.preventDefault(); e.stopPropagation(); }}
      />

      <div
        ref={modalRef}
        className="relative z-10 w-full max-w-[640px] flex rounded-2xl shadow-[0_32px_80px_rgba(0,0,0,0.32)] overflow-hidden"
        style={{ opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Left branding panel ── */}
        <div
          className="hidden sm:flex flex-col justify-between text-white px-8 py-9 w-[210px] flex-shrink-0 relative overflow-hidden"
          style={{
            background: config.entryPopup.backgroundImage
              ? `linear-gradient(rgba(17,24,39,0.82),rgba(17,24,39,0.82)) center/cover, url(${config.entryPopup.backgroundImage})`
              : '#111827'
          }}
        >
          <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full border border-white/10" />
          <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full border border-white/5" />
          <div className="relative z-10">
            <p className="text-[9px] uppercase tracking-[0.35em] text-gray-500 mb-7">Enquiry Form</p>
            <h2 className="text-[20px] font-light leading-[1.3] tracking-wide">
              {config.entryPopup.heading || 'Premium Stone & Marble'}
            </h2>
            <div className="w-6 h-px bg-white/25 my-5" />
            <p className="text-[11px] text-gray-400 leading-relaxed font-light">
              {config.entryPopup.subheading || 'Custom bulk orders, marble furniture & exclusive stone collections.'}
            </p>
          </div>
          <div className="relative z-10 space-y-3">
            <div>
              <p className="text-[8px] uppercase tracking-[0.3em] text-gray-600 mb-1">Response within</p>
              <p className="text-sm font-light text-white">24 hours</p>
            </div>
          </div>
        </div>

        {/* ── Right panel ── */}
        <div className="flex-1 bg-white flex flex-col max-h-[88vh] sm:max-h-[560px]">
          {/* Discount highlight strip */}
          {!showSuccess && config.entryPopup.discountPercentage > 0 && (
            <div className="flex items-center justify-center gap-2.5 px-5 py-2.5 bg-[#111827] flex-shrink-0">
              <span className="text-[10px] text-gray-500 uppercase tracking-[0.3em]">Exclusive Offer</span>
              <span className="text-white font-bold text-base tracking-wide">
                {config.entryPopup.discountPercentage}% OFF
              </span>
              <span className="text-[10px] text-gray-500 uppercase tracking-[0.3em]">Your Order</span>
            </div>
          )}

          {/* Header */}
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-100 flex-shrink-0">
            <div>
              <h3 className="text-sm font-semibold text-[#111827] uppercase tracking-[0.12em]">
                {showSuccess ? 'Your Exclusive Code' : 'Get Your Discount'}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5 font-light">
                {showSuccess ? 'Copy and apply at checkout' : 'Fill in your details to unlock your code'}
              </p>
            </div>
            <button onClick={handleClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors flex-shrink-0 ml-3">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* ── Success: show coupon ── */}
          {showSuccess && (
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 text-center">
              <div className="w-12 h-12 bg-[#111827] rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-[#111827] uppercase tracking-[0.1em] mb-1">Thank You!</h3>
              <p className="text-sm text-gray-500 font-light mb-6">Here is your exclusive discount code</p>

              <div className="w-full max-w-[280px] bg-gray-50 border border-dashed border-gray-300 rounded-2xl px-5 py-5 mb-4">
                <p className="text-[9px] uppercase tracking-[0.3em] text-gray-400 mb-1">Your Code</p>
                <p className="text-3xl font-bold tracking-[0.4em] text-[#111827] mb-1">{couponCode}</p>
                {expiryLabel && (
                  <p className="text-[11px] text-amber-600 flex items-center justify-center gap-1 mt-1">
                    <Clock className="w-3 h-3" />
                    {expiryLabel}
                  </p>
                )}
              </div>

              <button
                onClick={handleCopy}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all mb-3 ${copied ? 'bg-green-600 text-white' : 'bg-[#111827] text-white hover:bg-[#1f2937]'}`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied to clipboard!' : 'Copy Code'}
              </button>

              <p className="text-[10px] text-gray-400 font-light">
                Apply this code at checkout to claim your discount
              </p>
            </div>
          )}

          {/* ── Form ── */}
          {!showSuccess && (
            <div className="overflow-y-auto flex-1" style={{ overscrollBehavior: 'contain' }}>
              <form onSubmit={handleSubmit} className="px-5 sm:px-6 py-5 space-y-4">

                {/* Name */}
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.18em] font-medium text-gray-500 mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your full name"
                      className={`w-full pl-9 pr-3 py-2.5 border rounded-lg text-sm font-light placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#111827] transition-all ${errors.name ? 'border-red-400' : 'border-gray-200 bg-gray-50/50'}`}
                    />
                  </div>
                  {errors.name && <p className="text-red-400 text-[11px] mt-1">{errors.name}</p>}
                </div>

                {/* Mobile */}
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.18em] font-medium text-gray-500 mb-1.5">Mobile Number</label>
                  <div
                    className="flex"
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
                        className="px-2.5 py-2.5 border border-r-0 border-gray-200 rounded-l-lg bg-gray-50/50 flex items-center gap-1 text-sm flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-[#111827]"
                        style={{ width: '88px' }}
                      >
                        <span>{(countriesList.find(c => c.dialCode === formData.countryCode) || { flag: '🌐' as any }).flag}</span>
                        <span className="text-xs font-medium text-[#111827]">{formData.countryCode}</span>
                        <svg className="w-3 h-3 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path d="M5.23 7.21a.75.75 0 011.06.02L10 11.188l3.71-3.957a.75.75 0 111.08 1.04l-4.24 4.52a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" /></svg>
                      </button>
                      {showCountryDial && (
                        <div className="absolute left-0 top-full mt-1 w-56 max-h-52 overflow-auto bg-white border border-gray-200 rounded-lg shadow-xl z-20">
                          <div className="p-2 border-b border-gray-100 sticky top-0 bg-white">
                            <input
                              type="text"
                              value={dialQuery}
                              onChange={(e) => setDialQuery(e.target.value)}
                              placeholder="Search..."
                              className="w-full px-2 py-1.5 border border-gray-200 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-[#111827]"
                            />
                          </div>
                          {filteredDial.map(c => (
                            <button
                              key={`${c.code}-${c.dialCode}`}
                              type="button"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => { setFormData(p => ({ ...p, countryCode: c.dialCode })); setShowCountryDial(false); setDialQuery(''); }}
                              className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm flex items-center gap-2 transition-colors"
                            >
                              <span>{c.flag}</span>
                              <span className="font-medium text-xs">{c.dialCode}</span>
                              <span className="text-gray-400 text-xs truncate">{c.name}</span>
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
                      className={`flex-1 min-w-0 px-3 py-2.5 border rounded-r-lg text-sm font-light placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#111827] transition-all ${errors.mobile ? 'border-red-400' : 'border-gray-200 bg-gray-50/50'}`}
                    />
                  </div>
                  {errors.mobile && <p className="text-red-400 text-[11px] mt-1">{errors.mobile}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.18em] font-medium text-gray-500 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      className={`w-full pl-9 pr-3 py-2.5 border rounded-lg text-sm font-light placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#111827] transition-all ${errors.email ? 'border-red-400' : 'border-gray-200 bg-gray-50/50'}`}
                    />
                  </div>
                  {errors.email && <p className="text-red-400 text-[11px] mt-1">{errors.email}</p>}
                </div>

                {/* Country + Pincode */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.18em] font-medium text-gray-500 mb-1.5">Country</label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className={`w-full px-3 py-2.5 border rounded-lg text-sm font-light text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827] transition-all bg-gray-50/50 ${errors.country ? 'border-red-400' : 'border-gray-200'}`}
                    >
                      <option value="">Select country</option>
                      {countryNames.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                    {errors.country && <p className="text-red-400 text-[11px] mt-1">{errors.country}</p>}
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.18em] font-medium text-gray-500 mb-1.5">
                      Pincode <span className="normal-case tracking-normal text-gray-300">(optional)</span>
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                      <input
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleChange}
                        placeholder="PIN / ZIP"
                        className="w-full pl-9 pr-3 py-2.5 border border-gray-200 bg-gray-50/50 rounded-lg text-sm font-light placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#111827] transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#111827] text-white py-3 rounded-lg text-[11px] font-semibold uppercase tracking-[0.2em] hover:bg-[#1f2937] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Please wait...' : 'Get My Discount Code'}
                  </button>
                  <p className="text-[10px] text-gray-400 text-center mt-2 font-light">
                    Your information is kept private and never shared.
                  </p>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(LeadCapturePopup);
