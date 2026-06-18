'use client';
import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Loader2, CheckCircle, User, Mail, Phone, MessageSquare, Layers } from 'lucide-react';
import { useStoneQuotation } from '../contexts/StoneQuotationContext';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export const StoneQuotationModal: React.FC = () => {
  const { isModalOpen, pendingProduct, closeModal } = useStoneQuotation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [areaSqFt, setAreaSqFt] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const [isRendered, setIsRendered] = useState(false);
  const [isToastRendered, setIsToastRendered] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const toastRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isModalOpen && pendingProduct) setIsRendered(true);
  }, [isModalOpen, pendingProduct]);

  useEffect(() => {
    if (showToast) setIsToastRendered(true);
  }, [showToast]);

  useGSAP(() => {
    if (isModalOpen && isRendered && modalRef.current && backdropRef.current) {
      gsap.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
      gsap.fromTo(modalRef.current, { opacity: 0, scale: 0.95, y: 20 }, { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: 'power2.out' });
    } else if (!isModalOpen && isRendered && modalRef.current && backdropRef.current) {
      gsap.to(backdropRef.current, { opacity: 0, duration: 0.3 });
      gsap.to(modalRef.current, {
        opacity: 0, scale: 0.95, y: 20, duration: 0.2, ease: 'power2.in',
        onComplete: () => setIsRendered(false),
      });
    }
  }, [isModalOpen, isRendered]);

  useGSAP(() => {
    if (showToast && isToastRendered && toastRef.current) {
      gsap.fromTo(toastRef.current, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.3, ease: 'back.out(1.7)' });
    } else if (!showToast && isToastRendered && toastRef.current) {
      gsap.to(toastRef.current, { opacity: 0, y: 50, duration: 0.3, onComplete: () => setIsToastRendered(false) });
    }
  }, [showToast, isToastRendered]);

  useEffect(() => {
    if (isModalOpen) {
      setName(''); setEmail(''); setMobile(''); setAreaSqFt(''); setNotes(''); setIsSuccess(false);
    }
  }, [isModalOpen]);

  useEffect(() => {
    if (!isModalOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeModal(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isModalOpen, closeModal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) { alert('Please enter your name'); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) { alert('Please enter a valid email address'); return; }
    if (!mobile.trim()) { alert('Please enter your mobile number'); return; }

    setIsSubmitting(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
      const response = await fetch(`${API_URL}/quotations/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          mobile: mobile.trim(),
          productName: pendingProduct?.name || '',
          category: 'semi-precious-stone',
          requirement: areaSqFt ? parseFloat(areaSqFt) : 0,
          notes: notes.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || 'Failed to submit quotation request');

      setIsSuccess(true);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      setTimeout(() => closeModal(), 2500);
    } catch (error) {
      console.error('Quote request error:', error);
      alert(error instanceof Error ? error.message : 'Failed to send quotation request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputCls = 'w-full border border-[#e5e7eb] rounded-lg px-3 py-2.5 text-sm text-[#111827] placeholder:text-[#9ca3af] focus:outline-none focus:border-[#6b4c35] focus:ring-2 focus:ring-[#6b4c35]/10 transition-colors';

  return (
    <>
      {isRendered && pendingProduct && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div
            ref={backdropRef}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeModal}
            style={{ opacity: 0 }}
          />

          <div
            ref={modalRef}
            className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
            style={{ opacity: 0 }}
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-[#f3f4f6] flex items-start justify-between">
              <div>
                <h2 className="text-[17px] font-semibold text-[#111827]">Request Quotation</h2>
                <p className="text-[12px] text-[#6b7280] mt-0.5 truncate max-w-[280px]">{pendingProduct.name}</p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="text-[#9ca3af] hover:text-[#111827] transition-colors mt-0.5"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isSuccess ? (
              <div className="px-6 py-12 flex flex-col items-center text-center gap-3">
                <CheckCircle className="w-12 h-12 text-green-500" />
                <h3 className="text-[16px] font-semibold text-[#111827]">Quotation Requested!</h3>
                <p className="text-sm text-[#6b7280]">We'll contact you shortly with pricing details.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-xs font-medium text-[#374151] mb-1.5">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9ca3af]" />
                    <input
                      type="text" value={name} onChange={e => setName(e.target.value)}
                      placeholder="Your full name" required
                      className={`${inputCls} pl-9`}
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-medium text-[#374151] mb-1.5">
                    Email <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9ca3af]" />
                    <input
                      type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="your@email.com" required
                      className={`${inputCls} pl-9`}
                    />
                  </div>
                </div>

                {/* Mobile */}
                <div>
                  <label className="block text-xs font-medium text-[#374151] mb-1.5">
                    Mobile Number <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9ca3af]" />
                    <input
                      type="tel" value={mobile} onChange={e => setMobile(e.target.value)}
                      placeholder="+91 98765 43210" required
                      className={`${inputCls} pl-9`}
                    />
                  </div>
                </div>

                {/* Area required */}
                <div>
                  <label className="block text-xs font-medium text-[#374151] mb-1.5">
                    Area Required (sq.ft) <span className="text-[#9ca3af] font-normal">— optional</span>
                  </label>
                  <div className="relative">
                    <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9ca3af]" />
                    <input
                      type="number" min="0" step="0.1" value={areaSqFt} onChange={e => setAreaSqFt(e.target.value)}
                      placeholder="e.g. 120"
                      className={`${inputCls} pl-9`}
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-medium text-[#374151] mb-1.5">
                    Additional Notes <span className="text-[#9ca3af] font-normal">— optional</span>
                  </label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 w-3.5 h-3.5 text-[#9ca3af]" />
                    <textarea
                      value={notes} onChange={e => setNotes(e.target.value)}
                      placeholder="Describe your project, finish preference, timeline..."
                      rows={3}
                      className={`${inputCls} pl-9 resize-none`}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-[44px] bg-[#111827] text-white hover:bg-black transition-colors font-semibold text-[12px] uppercase tracking-[0.1em] flex items-center justify-center gap-2 rounded-lg disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                  ) : (
                    <><Send className="w-4 h-4" /> Send Quotation Request</>
                  )}
                </button>

                <p className="text-[10px] text-[#9ca3af] text-center">
                  We'll respond within 24 hours with pricing details.
                </p>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Toast */}
      {isToastRendered && (
        <div
          ref={toastRef}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] flex items-center gap-3 bg-[#111827] text-white px-5 py-3 rounded-xl shadow-xl"
          style={{ opacity: 0 }}
        >
          <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
          <span className="text-sm font-medium">Quotation request sent!</span>
        </div>
      )}
    </>
  );
};
