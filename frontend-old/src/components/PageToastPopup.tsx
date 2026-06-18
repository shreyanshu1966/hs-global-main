import React, { useState, useEffect, useRef, memo } from 'react';
import { X, Copy, Check, Tag, Clock } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { popupConfigService } from '../services/popupConfigService';
import { usePopupConfig } from '../hooks/usePopupConfig';

interface PageToastPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const PageToastPopup: React.FC<PageToastPopupProps> = ({ isOpen, onClose }) => {
  const cfg = usePopupConfig().pageToast;
  const autoDismissMs = (cfg.autoDismissSeconds || 8) * 1000;

  const [copied, setCopied] = useState(false);
  const [progress, setProgress] = useState(100);
  const [expiryLabel, setExpiryLabel] = useState('');
  const [isRendered, setIsRendered] = useState(false);
  const toastRef = useRef<HTMLDivElement>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoDismissRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { if (isOpen) setIsRendered(true); }, [isOpen]);

  // Live expiry label
  useEffect(() => {
    if (!cfg.expiryDate) return;
    const update = () => setExpiryLabel(popupConfigService.getExpiryLabel(cfg.expiryDate));
    update();
    const id = setInterval(update, 60000);
    return () => clearInterval(id);
  }, [cfg.expiryDate]);

  useGSAP(() => {
    if (isOpen && isRendered && toastRef.current) {
      gsap.fromTo(toastRef.current,
        { opacity: 0, x: 60 },
        { opacity: 1, x: 0, duration: 0.4, ease: 'power3.out' }
      );
    } else if (!isOpen && isRendered && toastRef.current) {
      gsap.to(toastRef.current, {
        opacity: 0, x: 60, duration: 0.3, ease: 'power2.in',
        onComplete: () => { setIsRendered(false); setProgress(100); }
      });
    }
  }, [isOpen, isRendered]);

  // Auto-dismiss with progress bar
  useEffect(() => {
    if (!isOpen) {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (autoDismissRef.current) clearTimeout(autoDismissRef.current);
      return;
    }
    setProgress(100);
    const step = 100 / (autoDismissMs / 100);
    progressIntervalRef.current = setInterval(() => setProgress(prev => Math.max(0, prev - step)), 100);
    autoDismissRef.current = setTimeout(() => onClose(), autoDismissMs);
    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (autoDismissRef.current) clearTimeout(autoDismissRef.current);
    };
  }, [isOpen, onClose, autoDismissMs]);

  const handleCopy = () => {
    navigator.clipboard.writeText(cfg.couponCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const isExpired = cfg.expiryDate ? popupConfigService.isExpired(cfg.expiryDate) : false;

  if (!isRendered) return null;

  return (
    <div
      ref={toastRef}
      className="fixed bottom-6 right-4 sm:right-6 z-[105] w-[300px] sm:w-[320px] bg-[#111827] text-white rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.36)] overflow-hidden"
      style={{ opacity: 0 }}
      role="alert"
      aria-live="polite"
    >
      {/* Progress bar */}
      <div className="h-0.5 bg-white/10">
        <div className="h-full bg-white/50 transition-none" style={{ width: `${progress}%` }} />
      </div>

      <div className="px-4 py-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Tag className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <p className="text-[8px] uppercase tracking-[0.3em] text-gray-500 leading-none mb-0.5">Limited Offer</p>
              <p className="text-xs font-semibold text-white leading-tight">
                {cfg.discountPercentage}% Off Bulk Orders
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-6 h-6 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors flex-shrink-0 ml-2">
            <X className="w-3 h-3 text-gray-400" />
          </button>
        </div>

        <p className="text-[11px] text-gray-400 font-light leading-relaxed mb-3">
          {cfg.message || 'Apply at checkout for marble, granite & stone furniture orders.'}
        </p>

        {/* Coupon row */}
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5">
          <div className="flex-1 min-w-0">
            <p className="text-[8px] uppercase tracking-[0.2em] text-gray-600 mb-0.5">Code</p>
            <p className="text-base font-bold tracking-[0.25em] text-white">{cfg.couponCode || 'HS10'}</p>
            {expiryLabel && !isExpired && (
              <p className="text-[9px] text-amber-400 flex items-center gap-1 mt-0.5">
                <Clock className="w-2.5 h-2.5" />
                {expiryLabel}
              </p>
            )}
            {isExpired && <p className="text-[9px] text-red-400 mt-0.5">Offer expired</p>}
          </div>
          <button
            onClick={handleCopy}
            disabled={isExpired}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all flex-shrink-0 ${
              copied ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : isExpired ? 'bg-white/5 text-gray-500 cursor-not-allowed'
              : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/10'
            }`}
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default memo(PageToastPopup);
