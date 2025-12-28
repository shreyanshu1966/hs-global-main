import React, { useState, useEffect, useRef } from 'react';
import { X, Shield, CheckCircle } from 'lucide-react';
import { OTPInput } from './OTPInput';
import { usePhoneVerification } from '../contexts/PhoneVerificationContext';
import { useCart } from '../contexts/CartContext';
import { useSlabCustomization } from '../contexts/SlabCustomizationContext';
import { Mail } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export const PhoneVerifyModal: React.FC = () => {
  const { isModalOpen, pendingProduct, closeModal } = usePhoneVerification();
  const { setPhoneVerified } = useCart();
  const { openModal: openSlabModal } = useSlabCustomization();

  const [step, setStep] = useState<'email' | 'otp' | 'success'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastTriedOtp, setLastTriedOtp] = useState('');
  const [autoSubmitEnabled, setAutoSubmitEnabled] = useState(true);

  // Animation state
  const [isRendered, setIsRendered] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isModalOpen) setIsRendered(true);
  }, [isModalOpen]);

  useGSAP(() => {
    if (isModalOpen && isRendered && modalRef.current && backdropRef.current) {
      gsap.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
      gsap.fromTo(modalRef.current, { opacity: 0, scale: 0.95, y: 20 }, { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: "power2.out" });
    } else if (!isModalOpen && isRendered && modalRef.current && backdropRef.current) {
      gsap.to(backdropRef.current, { opacity: 0, duration: 0.3 });
      gsap.to(modalRef.current, {
        opacity: 0,
        scale: 0.95,
        y: 20,
        duration: 0.2,
        ease: "power2.in",
        onComplete: () => setIsRendered(false)
      });
    }
  }, [isModalOpen, isRendered]);

  // Auto-submit OTP when all 6 digits are entered
  useEffect(() => {
    if (step === 'otp' && otp.length === 6 && !isLoading && autoSubmitEnabled && otp !== lastTriedOtp) {
      const timer = setTimeout(() => {
        setLastTriedOtp(otp);
        setAutoSubmitEnabled(false);
        handleOtpSubmit(new Event('submit') as any);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [otp, step, isLoading, autoSubmitEnabled, lastTriedOtp]);

  // Re-enable auto-submit when user changes OTP to a new value
  useEffect(() => {
    if (step === 'otp' && otp.length <= 6 && otp !== lastTriedOtp) {
      setAutoSubmitEnabled(true);
    }
  }, [otp, step, lastTriedOtp]);

  // Reset form when modal opens
  useEffect(() => {
    if (isModalOpen) {
      setStep('email');
      setEmail('');
      setOtp('');
      setError('');
      setLastTriedOtp('');
      setAutoSubmitEnabled(true);
    }
  }, [isModalOpen]);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const resp = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email })
      });

      let data: any = null;
      try {
        const ct = resp.headers.get('content-type') || '';
        data = ct.includes('application/json') ? await resp.json() : null;
      } catch {
        data = null;
      }

      if (!resp.ok || !data || data.ok !== true) {
        const serverMsg = (data && (data.error || data.message)) || undefined;
        throw new Error(serverMsg || 'Failed to send OTP');
      }

      setStep('otp');
    } catch (err: any) {
      setError(err?.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const resp = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email, code: otp })
      });

      let data: any = null;
      try {
        const ct = resp.headers.get('content-type') || '';
        data = ct.includes('application/json') ? await resp.json() : null;
      } catch {
        data = null;
      }

      if (!resp.ok || !data || data.ok !== true) {
        const serverMsg = (data && (data.error || data.message)) || undefined;
        throw new Error(serverMsg || 'Invalid code');
      }

      // Set verified (storing email as the identifier)
      setPhoneVerified(email);

      // Save to localStorage
      try {
        localStorage.setItem('userDetails', JSON.stringify({
          name: '',
          email: email,
          phone: '', // Clear phone or keep it empty
        }));
      } catch (e) {
        console.warn('Failed to save details to localStorage');
      }

      setStep('success');

      setTimeout(() => {
        // Check product category and open appropriate modal/drawer
        if (pendingProduct?.category === 'slabs') {
          // For slabs: Open customization modal
          closeModal();
          openSlabModal(pendingProduct, email);
        } else if (pendingProduct?.category === 'furniture') {
          // For furniture: Dispatch event
          closeModal();
          window.dispatchEvent(new CustomEvent('phone-verified', {
            detail: {
              phoneNumber: email, // Passing email as phoneNumber
              productId: pendingProduct?.id
            }
          }));
        } else {
          closeModal();
        }

        // Reset form
        setStep('email');
        setEmail('');
        setOtp('');
        setError('');
        setLastTriedOtp('');
        setAutoSubmitEnabled(true);
      }, 1200);
    } catch (err: any) {
      setError(err?.message || 'OTP verification failed');
      setAutoSubmitEnabled(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    closeModal();
    setStep('email');
    setEmail('');
    setOtp('');
    setError('');
  };

  if (!isRendered) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
        style={{ opacity: 0 }}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative w-full max-w-md bg-white/70 backdrop-blur-xl text-black rounded-2xl shadow-2xl border border-black/10"
        style={{ opacity: 0, transform: 'scale(0.95) translateY(20px)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-black/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-black rounded-full">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-black">
                {step === 'email' && 'Verify Email Address'}
                {step === 'otp' && 'Enter Verification Code'}
                {step === 'success' && 'Verification Complete'}
              </h2>
              <p className="text-sm text-gray-700">
                {step === 'email' && (pendingProduct?.category === 'slabs' ? 'Required for quotation request' : 'Required to add items to cart')}
                {step === 'otp' && `Code sent to ${email}`}
                {step === 'success' && 'Your email has been verified'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-black/10 rounded-full transition-colors border border-black/10"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-gray-500" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-4 py-3 border border-black/10 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent bg-white text-black placeholder-gray-500"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 border border-red-200 bg-gradient-to-br from-red-50 to-white rounded-xl shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center">
                      <Shield className="w-4 h-4 text-red-600" />
                    </div>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !email}
                className="w-full py-3 px-4 bg-black text-white font-semibold rounded-lg hover:bg-black/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 border border-black/10"
              >
                {isLoading ? 'Sending Code...' : 'Send Verification Code'}
              </button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-4 text-center">
                  Enter the 6-digit code sent to<br />
                  <span className="font-semibold">{email}</span>
                </label>
                <OTPInput
                  value={otp}
                  onChange={setOtp}
                  length={6}
                  disabled={isLoading}
                />
              </div>

              {error && (
                <div className="p-3 border border-red-200 bg-gradient-to-br from-red-50 to-white rounded-xl shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center">
                      <Shield className="w-4 h-4 text-red-600" />
                    </div>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="flex-1 py-3 px-4 border border-black/10 text-black font-semibold rounded-lg hover:bg-black/5 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading || otp.length !== 6}
                  className="flex-1 py-3 px-4 bg-black text-white font-semibold rounded-lg hover:bg-black/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 border border-black/10"
                >
                  {isLoading ? 'Verifying...' : 'Verify'}
                </button>
              </div>
            </form>
          )}

          {step === 'success' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4 border border-black/10">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-black mb-2">
                Email Verified Successfully!
              </h3>
              <p className="text-gray-700">
                {pendingProduct?.category === 'slabs'
                  ? 'Opening quotation request form...'
                  : 'Adding item to cart...'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};