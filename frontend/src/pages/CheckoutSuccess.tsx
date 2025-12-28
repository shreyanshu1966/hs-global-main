import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, ArrowLeft, Home } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const CheckoutSuccess = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline();

    if (containerRef.current) {
      tl.fromTo(containerRef.current, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.7)" });
    }
    if (iconRef.current) {
      tl.fromTo(iconRef.current, { scale: 0 }, { scale: 1, duration: 0.4, ease: "elastic.out(1, 0.5)" }, "-=0.2");
    }
    if (textRef.current) {
      tl.fromTo(textRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4 }, "-=0.2");
    }
    if (buttonsRef.current) {
      tl.fromTo(buttonsRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4 }, "-=0.2");
    }
    if (contactRef.current) {
      tl.fromTo(contactRef.current, { opacity: 0 }, { opacity: 1, duration: 0.4 }, "-=0.1");
    }

  }, { scope: containerRef });

  return (
    <div className="pt-20 min-h-screen bg-gray-50 flex items-center justify-center">
      <div
        ref={containerRef}
        className="max-w-md w-full mx-4"
        style={{ opacity: 0 }} // Initial state
      >
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Success Icon */}
          <div
            ref={iconRef}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ transform: 'scale(0)' }}
          >
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>

          {/* Success Message */}
          <div
            ref={textRef}
            style={{ opacity: 0 }}
          >
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Order Placed Successfully!
            </h1>
            <p className="text-gray-600 mb-6">
              Thank you for your order. We'll send you a confirmation email shortly and our team will contact you to discuss delivery details.
            </p>
          </div>

          {/* Action Buttons */}
          <div
            ref={buttonsRef}
            className="space-y-3"
            style={{ opacity: 0 }}
          >
            <Link
              to="/products"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              Continue Shopping
            </Link>
            <Link
              to="/"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Home className="w-4 h-4" />
              Back to Home
            </Link>
          </div>

          {/* Contact Info */}
          <div
            ref={contactRef}
            className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg"
            style={{ opacity: 0 }}
          >
            <p className="text-sm text-amber-800">
              <strong>Need help?</strong> Contact us at{' '}
              <a href="tel:+91-1234567890" className="text-amber-600 hover:underline">
                +91-1234567890
              </a>{' '}
              or{' '}
              <a href="mailto:hsglobalexport@gmail.com" className="text-amber-600 hover:underline">
                hsglobalexport@gmail.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
