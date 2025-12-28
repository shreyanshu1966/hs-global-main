import React, { useState, useEffect, useRef, useMemo, memo } from 'react';
import { X, User, Mail, Phone, MessageSquare, Building, Home, CheckCircle } from 'lucide-react';
import { initEmailJs, sendEmail } from '../lib/email';
import { countries as allCountries, Country } from '../data/countries';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

interface LeadCapturePopupProps {
  isOpen: boolean;
  onClose: () => void;
}

// Memoized country button to prevent re-renders
const CountryButton = memo(({ country, onSelect }: { country: Country; onSelect: (code: string) => void }) => (
  <button
    type="button"
    onMouseDown={(e) => e.preventDefault()}
    onClick={() => onSelect(country.dialCode)}
    className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm flex items-center gap-2"
    role="option"
  >
    <span className="text-base">{country.flag}</span>
    <span className="font-medium">{country.dialCode}</span>
    <span className="text-gray-500 text-xs">{country.name}</span>
  </button>
));

CountryButton.displayName = 'CountryButton';

const LeadCapturePopup: React.FC<LeadCapturePopupProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    countryCode: '+91',
    phone: '',
    clientType: '',
    services: [] as string[],
    message: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [countryQuery, setCountryQuery] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const countryWrapRef = useRef<HTMLDivElement | null>(null);
  const { t } = useTranslation();

  // Animation Refs & State
  const [isRendered, setIsRendered] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) setIsRendered(true);
  }, [isOpen]);

  useGSAP(() => {
    if (isOpen && isRendered && modalRef.current && backdropRef.current) {
      gsap.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2 });
      gsap.fromTo(modalRef.current, { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.2, ease: "power2.out" });
    } else if (!isOpen && isRendered && modalRef.current && backdropRef.current) {
      gsap.to(backdropRef.current, { opacity: 0, duration: 0.2 });
      gsap.to(modalRef.current, {
        opacity: 0,
        scale: 0.95,
        duration: 0.2,
        ease: "power2.in",
        onComplete: () => setIsRendered(false)
      });
    }
  }, [isOpen, isRendered]);


  // Memoize countries list to prevent recalculation
  const countriesList = useMemo(() => [...allCountries], []);

  const serviceOptions = useMemo(() => [
    t('lead_popup.marble'),
    t('lead_popup.granite'),
    t('lead_popup.furniture'),
    t('lead_popup.marble_engraving')
  ], [t]);

  // Memoize filtered countries to avoid recalculation on every render
  const filteredCountries = useMemo(() => {
    if (!countryQuery) return countriesList;

    const raw = countryQuery.toLowerCase().trim();
    const aliasMap: Record<string, string> = {
      'usa': 'united states',
      'uk': 'united kingdom',
      'uae': 'united arab emirates'
    };
    const query = aliasMap[raw] || raw;

    return countriesList.filter((c) =>
      c.dialCode.toLowerCase().includes(query) ||
      c.name.toLowerCase().includes(query)
    );
  }, [countryQuery, countriesList]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, phone: digitsOnly }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePickCountry = (code: string) => {
    setFormData(prev => ({ ...prev, countryCode: code }));
    setCountryQuery('');
    setShowCountryDropdown(false);
  };

  const handleServiceChange = (service: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t('lead_popup.name_req');
    }

    if (!formData.email.trim() && !formData.phone.trim()) {
      newErrors.contact = t('lead_popup.email_req');
    }

    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('lead_popup.valid_email');
    }

    if (formData.phone.trim() && formData.phone.replace(/\D/g, '').length !== 10) {
      newErrors.phone = t('lead_popup.valid_phone');
    }

    if (!formData.clientType) {
      newErrors.clientType = t('lead_popup.client_select');
    }

    if (formData.services.length === 0) {
      newErrors.services = t('lead_popup.service_select');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      await sendEmail(
        (import.meta as any).env.VITE_EMAILJS_TEMPLATE_POPUP || 'template_83tzsh9',
        {
          to_email: 'hsglobalexport@gmail.com',
          subject: 'New Lead (Website Popup)',
          name: formData.name,
          email: formData.email,
          phone: `${formData.countryCode} ${formData.phone}`,
          client_type: formData.clientType,
          services: formData.services.join(', '),
          message: formData.message || '-'
        }
      );

      const waText = [
        'New Lead (Website Popup)',
        `Name: ${formData.name}`,
        `Email: ${formData.email || '-'}`,
        `Phone: ${formData.countryCode} ${formData.phone}`,
        `Client Type: ${formData.clientType}`,
        `Services: ${formData.services.join(', ')}`,
        `Message: ${formData.message || '-'}`
      ].join('\n');

      try {
        await fetch('/api/send-whatsapp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ to: '918107115116', text: waText })
        });
      } catch { }

      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
        setFormData({
          name: '',
          email: '',
          countryCode: '+91',
          phone: '',
          clientType: '',
          services: [],
          message: ''
        });
        onClose();
      }, 3000);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('There was an error submitting your information. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      email: '',
      countryCode: '+91',
      phone: '',
      clientType: '',
      services: [],
      message: ''
    });
    setErrors({});
    setShowSuccess(false);
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    initEmailJs();
  }, []);

  if (!isRendered) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4">
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
        style={{ opacity: 0 }}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md sm:max-w-lg max-h-[90vh] overflow-hidden border-2 border-gray-100 relative z-10"
        onClick={(e) => e.stopPropagation()}
        style={{ opacity: 0, transform: 'scale(0.95)' }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-white to-gray-50 border-b-2 border-gray-200 px-4 py-3 rounded-t-3xl z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">{t('lead_popup.title')}</h2>
              <p className="text-gray-600 mt-1 text-xs sm:text-sm">{t('lead_popup.subtitle')}</p>
            </div>
            <button
              onClick={handleClose}
              className="p-1.5 hover:bg-gray-100 rounded-full transition-colors border-2 border-transparent hover:border-gray-200"
              aria-label="Close"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{t('lead_popup.thanks')}</h3>
            <p className="text-gray-600 mb-3 text-sm">{t('lead_popup.success_msg')}</p>
            <p className="text-xs text-gray-500">{t('lead_popup.close_popup')}</p>
          </div>
        )}

        {/* Form */}
        {!showSuccess && (
          <div className="overflow-y-auto max-h-[calc(90vh-100px)] overscroll-contain">
            <form onSubmit={handleSubmit} className="p-4 space-y-3">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <User className="w-3.5 h-3.5 inline mr-1.5" />
                  {t('lead_popup.full_name')}
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2.5 border-2 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all text-sm ${errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Enter your full name"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <Mail className="w-3.5 h-3.5 inline mr-1.5" />
                  {t('lead_popup.email')}
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2.5 border-2 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all text-sm ${errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="your@email.com"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <Phone className="w-3.5 h-3.5 inline mr-1.5" />
                  {t('lead_popup.phone')}
                </label>
                <div className="flex w-full relative">
                  <div
                    className="relative"
                    tabIndex={0}
                    ref={countryWrapRef}
                    onBlur={() => {
                      setTimeout(() => {
                        const wrap = countryWrapRef.current;
                        const active = document.activeElement as HTMLElement | null;
                        if (wrap && active && wrap.contains(active)) return;
                        setShowCountryDropdown(false);
                      }, 0);
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setShowCountryDropdown(v => !v)}
                      className="px-2 py-2.5 border-2 border-gray-300 border-r-0 rounded-l-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all bg-white min-w-0 flex-shrink-0 text-sm w-[110px] flex items-center gap-1 justify-center"
                      aria-haspopup="listbox"
                      aria-expanded={showCountryDropdown}
                    >
                      <span className="text-base">
                        {(countriesList.find(c => c.dialCode === formData.countryCode) || { flag: '🌐' as any }).flag}
                      </span>
                      <span className="font-medium">{formData.countryCode}</span>
                      <svg className="w-3.5 h-3.5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.188l3.71-3.957a.75.75 0 111.08 1.04l-4.24 4.52a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" />
                      </svg>
                    </button>
                    {showCountryDropdown && (
                      <div className="absolute left-0 top-full mt-1 w-56 max-h-64 overflow-auto bg-white border-2 border-gray-200 rounded-lg shadow-lg z-20">
                        <div className="p-2 border-b border-gray-200">
                          <input
                            type="text"
                            value={countryQuery}
                            onChange={(e) => setCountryQuery(e.target.value)}
                            placeholder="Search country/code"
                            className="w-full px-2 py-1.5 border-2 border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                          />
                        </div>
                        {filteredCountries.length === 0 && (
                          <div className="px-3 py-2 text-xs text-gray-500">{t('lead_popup.no_match')}</div>
                        )}
                        {filteredCountries.map((c) => (
                          <CountryButton
                            key={`${c.code}-${c.dialCode}`}
                            country={c}
                            onSelect={handlePickCountry}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    inputMode="numeric"
                    maxLength={10}
                    autoComplete="tel"
                    className={`flex-1 px-3 py-2.5 border-2 rounded-r-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all min-w-0 text-sm ${errors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="Phone number"
                  />
                </div>
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>

              {errors.contact && (
                <p className="text-red-500 text-xs bg-red-50 p-2 rounded-lg">
                  {errors.contact}
                </p>
              )}

              {/* Client Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('lead_popup.client_que')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, clientType: 'personal' }))}
                    className={`p-2.5 border-2 rounded-lg flex items-center justify-center space-x-1.5 transition-all ${formData.clientType === 'personal'
                        ? 'border-black bg-black text-white'
                        : 'border-gray-300 hover:border-gray-400'
                      }`}
                  >
                    <Home className="w-3.5 h-3.5" />
                    <span className="text-xs">{t('lead_popup.for_myself')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, clientType: 'client' }))}
                    className={`p-2.5 border-2 rounded-lg flex items-center justify-center space-x-1.5 transition-all ${formData.clientType === 'client'
                        ? 'border-black bg-black text-white'
                        : 'border-gray-300 hover:border-gray-400'
                      }`}
                  >
                    <Building className="w-3.5 h-3.5" />
                    <span className="text-xs">{t('lead_popup.for_client')}</span>
                  </button>
                </div>
                {errors.clientType && <p className="text-red-500 text-xs mt-1">{errors.clientType}</p>}
              </div>

              {/* Services */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('lead_popup.services_que')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {serviceOptions.map((service) => (
                    <button
                      key={service}
                      type="button"
                      onClick={() => handleServiceChange(service)}
                      className={`p-2.5 border-2 rounded-lg text-xs font-medium transition-all ${formData.services.includes(service)
                          ? 'border-black bg-black text-white'
                          : 'border-gray-300 hover:border-gray-400'
                        }`}
                    >
                      {service}
                    </button>
                  ))}
                </div>
                {errors.services && <p className="text-red-500 text-xs mt-1">{errors.services}</p>}
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <MessageSquare className="w-3.5 h-3.5 inline mr-1.5" />
                  {t('lead_popup.additional')}
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all resize-none text-sm"
                  placeholder="Tell us more about your project requirements..."
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-black text-white py-2.5 px-4 rounded-lg font-semibold text-sm hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-2 border-black hover:border-gray-800"
                >
                  {isSubmitting ? t('lead_popup.submitting') : t('lead_popup.submit_btn')}
                </button>
                <p className="text-xs text-gray-500 text-center mt-2">
                  {t('lead_popup.note')}
                </p>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(LeadCapturePopup);