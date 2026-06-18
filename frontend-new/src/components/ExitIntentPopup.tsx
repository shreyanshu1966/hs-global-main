'use client';
import React, { useState, useEffect, useRef, memo } from 'react';
import { X, ArrowRight, Copy, Check, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { popupConfigService } from '../services/popupConfigService';
import { usePopupConfig } from '../hooks/usePopupConfig';

interface ExitIntentPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const ExitIntentPopup: React.FC<ExitIntentPopupProps> = ({ isOpen, onClose }) => {
  const cfg = usePopupConfig().exitIntent;
  const [copied, setCopied] = useState(false);
  const [expiryLabel, setExpiryLabel] = useState('');
  const [isRendered, setIsRendered] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => { if (isOpen) setIsRendered(true); }, [isOpen]);

  // Update expiry label every minute
  useEffect(() => {
    if (!cfg.expiryDate) return;
    const update = () => setExpiryLabel(popupConfigService.getExpiryLabel(cfg.expiryDate));
    update();
    const id = setInterval(update, 60000);
    return () => clearInterval(id);
  }, [cfg.expiryDate]);

  useGSAP(() => {
    if (isOpen && isRendered && modalRef.current && backdropRef.current) {
      gsap.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.25 });
      gsap.fromTo(modalRef.current,
        { opacity: 0, scale: 0.9, y: 24 },
        { opacity: 1, scale: 1, y: 0, duration: 0.35, ease: 'back.out(1.4)' }
      );
    } else if (!isOpen && isRendered && modalRef.current && backdropRef.current) {
      gsap.to(backdropRef.current, { opacity: 0, duration: 0.2 });
      gsap.to(modalRef.current, {
        opacity: 0, scale: 0.95, y: 8, duration: 0.2, ease: 'power2.in',
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

  const handleCopy = () => {
    navigator.clipboard.writeText(cfg.couponCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleShopNow = () => {
    onClose();
    navigate('/products');
  };

  const isExpired = cfg.expiryDate ? popupConfigService.isExpired(cfg.expiryDate) : false;

  if (!isRendered) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div ref={backdropRef} className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} style={{ opacity: 0 }} />

      <div
        ref={modalRef}
        className="relative z-10 w-full max-w-[400px] bg-white rounded-2xl shadow-[0_32px_80px_rgba(0,0,0,0.28)] overflow-hidden"
        style={{ opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top dark strip */}
        <div className="bg-[#111827] px-7 pt-8 pb-7 text-white relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full border border-white/10" />
          <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full border border-white/5" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-3.5 h-3.5 text-white" />
          </button>
          <p className="text-[9px] uppercase tracking-[0.35em] text-gray-500 mb-3 relative z-10">Before you go</p>
          <h2 className="text-2xl font-light leading-snug tracking-wide relative z-10">
            {cfg.heading || 'Exclusive Offer For You'}
          </h2>
          <div className="w-6 h-px bg-white/25 mt-4 relative z-10" />
        </div>

        {/* Bottom section */}
        <div className="px-7 py-6">
          <p className="text-sm text-gray-500 font-light leading-relaxed mb-5">
            {cfg.bodyText || <>Get <strong className="font-semibold text-[#111827]">{cfg.discountPercentage}% off</strong> on your first bulk order of marble, granite & custom stone furniture.</>}
          </p>

          {/* Coupon card */}
          <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl px-4 py-4 flex items-center justify-between mb-4">
            <div>
              <p className="text-[9px] uppercase tracking-[0.25em] text-gray-400 mb-1">Your discount code</p>
              <p className="text-2xl font-bold tracking-[0.3em] text-[#111827]">{cfg.couponCode || 'HS10'}</p>
              {expiryLabel && !isExpired && (
                <p className="text-[11px] text-amber-600 flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3" />
                  {expiryLabel}
                </p>
              )}
              {isExpired && (
                <p className="text-[11px] text-red-500 mt-1">This offer has expired</p>
              )}
            </div>
            <button
              onClick={handleCopy}
              disabled={isExpired}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                copied ? 'bg-green-50 text-green-600 border border-green-200'
                : isExpired ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-[#111827] text-white hover:bg-[#1f2937]'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          <button
            onClick={handleShopNow}
            className="w-full flex items-center justify-center gap-2 bg-[#111827] text-white py-3 rounded-xl text-[11px] font-semibold uppercase tracking-[0.2em] hover:bg-[#1f2937] transition-colors mb-3"
          >
            Shop Collection
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button onClick={onClose} className="w-full text-center text-[11px] text-gray-400 hover:text-gray-600 transition-colors py-1">
            No thanks, I'll pay full price
          </button>
        </div>
      </div>
    </div>
  );
};

export default memo(ExitIntentPopup);
