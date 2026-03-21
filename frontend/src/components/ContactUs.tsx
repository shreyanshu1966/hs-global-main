import React, { useState, useRef } from "react";
import { Mail, Phone, MapPin, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const ContactUs = () => {
  const { t } = useTranslation();

  // Refs for animations
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const submitBtnRef = useRef<HTMLButtonElement>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sendError, setSendError] = useState("");

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Name is required";
    if (!email.trim()) {
      e.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      e.email = "Enter a valid email";
    }
    if (!phone.trim()) {
      e.phone = "Phone is required";
    } else if (!/^\+?[\d\s-]{10,}$/.test(phone)) {
      e.phone = "Enter a valid phone number";
    }
    if (!subject.trim()) e.subject = "Subject is required";
    if (!message.trim()) e.message = "Message is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const [submitted, setSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [referenceImage, setReferenceImage] = useState<string>("");
  const fieldBase = "w-full px-4 py-3 text-[15px] bg-white border transition-all duration-300 text-[#111827] focus:outline-none placeholder-[#94a3b8]";

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;

    try {
      setSendError("");
      setSubmitted(false);
      setIsSending(true);

      // Submit to backend API
      const response = await fetch(`${API_URL}/contact/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          subject,
          message,
          referenceImage: referenceImage || undefined
        })
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      // Success
      setSubmitted(true);
      setName("");
      setEmail("");
      setPhone("");
      setSubject("");
      setMessage("");
      setReferenceImage("");
      setErrors({});

    } catch (e: any) {
      setSendError(e.message || 'Failed to send message. Please try again later.');
    } finally {
      setIsSending(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }

      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        setReferenceImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  useGSAP(() => {
    // Hero animation is now handled by Framer Motion
    if (headerRef.current) {
      gsap.fromTo(headerRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, scrollTrigger: { trigger: headerRef.current, start: "top bottom-=50" } });
    }
    if (formRef.current) {
      gsap.fromTo(formRef.current, { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.8, delay: 0.2, scrollTrigger: { trigger: formRef.current, start: "top bottom-=50" } });
    }
    if (infoRef.current) {
      gsap.fromTo(infoRef.current, { opacity: 0, x: 30 }, { opacity: 1, x: 0, duration: 0.8, delay: 0.4, scrollTrigger: { trigger: infoRef.current, start: "top bottom-=50" } });
    }
    if (ctaRef.current) {
      gsap.fromTo(ctaRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.6, scrollTrigger: { trigger: ctaRef.current, start: "top bottom-=50" } });
    }
  }, { scope: containerRef });

  const { contextSafe } = useGSAP({ scope: containerRef });

  const handleBtnHover = contextSafe(() => {
    gsap.to(submitBtnRef.current, { scale: 1.02, duration: 0.2 });
  });
  const handleBtnLeave = contextSafe(() => {
    gsap.to(submitBtnRef.current, { scale: 1, duration: 0.2 });
  });
  const handleBtnTap = contextSafe(() => {
    gsap.to(submitBtnRef.current, { scale: 0.98, duration: 0.1, yoyo: true, repeat: 1 });
  });


  return (
    <div ref={containerRef} className="bg-[#f8fafc]">

      {/* Minimalist Contact Section */}
      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-6xl mx-auto">

            {/* Header */}
            <div ref={headerRef} className="text-center mb-20" style={{ opacity: 0 }}>
              <h2 className="text-4xl md:text-6xl font-['Playfair_Display'] font-semibold text-[#111827] mb-4">
                {t('contact.title')}
              </h2>
              <div className="w-24 h-px bg-[#64748b] mx-auto"></div>
            </div>

            {/* Grid Layout */}
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-12">

              {/* Contact Form */}
              <div ref={formRef} style={{ opacity: 0 }} className="bg-white border border-[#e2e8f0] p-6 md:p-8">
                <h3 className="text-2xl font-['Playfair_Display'] font-semibold text-[#111827] mb-8">{t('contact.form_title')}</h3>

                <form className="space-y-8" onSubmit={onSubmit} noValidate>
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-[#475569] mb-2">Name</label>
                      <input
                        type="text"
                        placeholder="Your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={`${fieldBase} ${errors.name ? 'border-red-500 focus:border-red-500' : 'border-[#cbd5e1] focus:border-[#111827]'}`}
                      />
                      {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-[#475569] mb-2">Email</label>
                      <input
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`${fieldBase} ${errors.email ? 'border-red-500 focus:border-red-500' : 'border-[#cbd5e1] focus:border-[#111827]'}`}
                      />
                      {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-[#475569] mb-2">Phone Number</label>
                      <input
                        type="tel"
                        placeholder="+91 00000 00000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className={`${fieldBase} ${errors.phone ? 'border-red-500 focus:border-red-500' : 'border-[#cbd5e1] focus:border-[#111827]'}`}
                      />
                      {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-[#475569] mb-2">Subject</label>
                      <input
                        type="text"
                        placeholder="How can we help?"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className={`${fieldBase} ${errors.subject ? 'border-red-500 focus:border-red-500' : 'border-[#cbd5e1] focus:border-[#111827]'}`}
                      />
                      {errors.subject && <p className="text-red-600 text-sm mt-1">{errors.subject}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-[#475569] mb-2">Message</label>
                    <textarea
                      rows={5}
                      placeholder="Tell us what you are looking for"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className={`${fieldBase} resize-none ${errors.message ? 'border-red-500 focus:border-red-500' : 'border-[#cbd5e1] focus:border-[#111827]'}`}
                    />
                    {errors.message && <p className="text-red-600 text-sm mt-1">{errors.message}</p>}
                  </div>

                  {/* Reference Image Upload (Optional) */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-[#475569] mb-2">
                      Reference Image <span className="text-[#94a3b8] font-normal">(Optional)</span>
                    </label>
                    <div className="flex items-center gap-4">
                      <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-[#cbd5e1] bg-[#f8fafc] hover:bg-[#eef2f7] transition-colors text-[#334155] text-sm">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <span>Choose Image</span>
                      </label>
                      {referenceImage && (
                        <button
                          type="button"
                          onClick={() => setReferenceImage("")}
                          className="text-red-700 hover:text-red-900 text-sm underline"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    {referenceImage && (
                      <div className="mt-4 relative inline-block">
                        <img
                          src={referenceImage}
                          alt="Reference"
                          className="max-w-xs max-h-48 border border-[#cbd5e1]"
                        />
                      </div>
                    )}
                    <p className="text-xs text-[#64748b] mt-2">Upload a reference image if needed (Max 5MB)</p>
                  </div>

                  {!!sendError && (
                    <div className="border border-[#d8b0ae] bg-[#f8ebea] text-red-800 p-3 text-sm">{sendError}</div>
                  )}
                  <button
                    ref={submitBtnRef}
                    type="submit"
                    disabled={isSending}
                    className={`group relative inline-flex items-center justify-center px-8 py-3.5 text-sm font-semibold uppercase tracking-[0.1em] text-[#f8f2e7] bg-[#1f1c18] hover:bg-[#353029] border border-[#1f1c18] transition-colors duration-300 overflow-hidden ${isSending ? 'opacity-70 cursor-not-allowed' : ''}`}
                    onMouseEnter={handleBtnHover}
                    onMouseLeave={handleBtnLeave}
                    onMouseDown={handleBtnTap}
                  >
                    <span className="relative z-10 flex items-center space-x-3">
                      {isSending && <span className="w-5 h-5 border-2 border-white/70 border-t-transparent rounded-full animate-spin" />}
                      <span>{isSending ? t('contact.sending_status') : t('contact.send_btn')}</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </span>
                  </button>
                </form>
              </div>

              {/* Contact Information */}
              <div ref={infoRef} style={{ opacity: 0 }} className="bg-white border border-[#e2e8f0] p-6 md:p-8">
                <h3 className="text-2xl font-['Playfair_Display'] font-semibold text-[#111827] mb-8">{t('contact.info_title')}</h3>

                <div className="space-y-8">
                  <div className="flex items-start space-x-6">
                    <div className="w-12 h-12 flex items-center justify-center bg-[#f8fafc] border border-[#e2e8f0]">
                      <Mail className="w-5 h-5 text-[#111827]" />
                    </div>
                    <div>
                      <h4 className="text-base font-semibold uppercase tracking-[0.08em] text-[#475569] mb-2">{t('contact.email')}</h4>
                      <a href="mailto:inquiry@hsglobalexport.com" className="text-[#334155] hover:text-[#111827]">inquiry@hsglobalexport.com</a>
                    </div>
                  </div>

                  <div className="flex items-start space-x-6">
                    <div className="w-12 h-12 flex items-center justify-center bg-[#f8fafc] border border-[#e2e8f0]">
                      <Phone className="w-5 h-5 text-[#111827]" />
                    </div>
                    <div>
                      <h4 className="text-base font-semibold uppercase tracking-[0.08em] text-[#475569] mb-2">{t('contact.phone')}</h4>
                      <a href="tel:+918107115116" className="text-[#334155] hover:text-[#111827]">+91 81071 15116</a>
                    </div>
                  </div>

                  <div className="flex items-start space-x-6">
                    <div className="w-12 h-12 flex items-center justify-center bg-[#f8fafc] border border-[#e2e8f0]">
                      <MapPin className="w-5 h-5 text-[#111827]" />
                    </div>
                    <div>
                      <h4 className="text-base font-semibold uppercase tracking-[0.08em] text-[#475569] mb-2">{t('contact.location')}</h4>
                      <div className="space-y-3 text-[#475569]">
                        <a href="https://maps.app.goo.gl/SLV59xn17PS7k2z76" target="_blank" rel="noreferrer" className="block hover:underline">
                          <span className="font-semibold text-[#334155]">{t('contact.corporate_title')}</span><br />
                          {t('contact.corporate_address_1')}<br />
                          {t('contact.corporate_address_2')}
                        </a>
                        <p>
                          <span className="font-semibold text-[#334155]">{t('contact.factory')}</span><br />
                          {t('contact.factory_address_1')}<br />
                          {t('contact.factory_address_2')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
      {/* Success Modal */}
      {submitted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white border border-[#e2e8f0] shadow-2xl max-w-md w-full mx-4 p-6 text-center">
            <h3 className="text-2xl font-['Playfair_Display'] font-semibold text-[#111827] mb-2">{t('contact.cta_thanks')}</h3>
            <p className="text-[#475569] mb-6">{t('contact.cta_success')}</p>
            <button
              onClick={() => setSubmitted(false)}
              className="inline-flex items-center justify-center px-6 py-3 text-[#f8f2e7] bg-[#1f1c18] hover:bg-[#353029] border border-[#1f1c18] transition-colors uppercase tracking-[0.08em] text-xs font-semibold"
            >
              {t('contact.cta_close')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactUs;
