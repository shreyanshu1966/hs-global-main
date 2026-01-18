import React, { useEffect, useState, useRef } from "react";
import { Mail, Phone, MapPin, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const Contact = () => {
  const { t } = useTranslation();

  // Refs for animations
  const containerRef = useRef<HTMLDivElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const submitBtnRef = useRef<HTMLButtonElement>(null);

  // Preload hero image and add CSS for smooth fixed backgrounds
  useEffect(() => {
    // Preload hero image
    const heroImg = new Image();
    heroImg.src = 'https://images.pexels.com/photos/3184398/pexels-photo-3184398.jpeg';

    // Add CSS to ensure fixed backgrounds work immediately
    const style = document.createElement('style');
    style.textContent = `
      .fixed-bg {
        background-attachment: fixed !important;
        background-size: cover !important;
        background-position: center !important;
        background-repeat: no-repeat !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
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
    if (!subject.trim()) e.subject = "Subject is required";
    if (!message.trim()) e.message = "Message is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const [submitted, setSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [referenceImage, setReferenceImage] = useState<string>("");

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
    if (heroTextRef.current) {
      gsap.fromTo(heroTextRef.current, { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.8 });
    }
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
    <div ref={containerRef} className="min-h-screen bg-white">

      <Helmet>
        {/* Basic SEO */}
        <title>Contact Us - Get in Touch | HS Global Export</title>
        <meta name="description" content="Contact HS Global Export for premium granite and marble solutions. Reach us at +91 81071 15116 or inquiry@hsglobalexport.com. Corporate office in Ahmedabad, factory in Rajasthan." />
        <meta name="keywords" content="contact HS Global Export, granite supplier contact, marble exporter India, stone inquiry, get quote granite, Ahmedabad office, Rajasthan factory" />
        <meta name="author" content="HS Global Export" />
        <meta name="robots" content="index, follow" />

        {/* Canonical URL */}
        <link rel="canonical" href="https://hsglobalexport.com/contact" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://hsglobalexport.com/contact" />
        <meta property="og:site_name" content="HS Global Export" />
        <meta property="og:title" content="Contact Us - Get in Touch | HS Global Export" />
        <meta property="og:description" content="Contact HS Global Export for premium granite and marble solutions. Corporate office in Ahmedabad, factory in Rajasthan." />
        <meta property="og:image" content="https://hsglobalexport.com/og-image.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="HS Global Export - Contact Us" />
        <meta property="og:locale" content="en_US" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://hsglobalexport.com/contact" />
        <meta name="twitter:title" content="Contact Us - Get in Touch | HS Global Export" />
        <meta name="twitter:description" content="Contact HS Global Export for premium granite and marble solutions." />
        <meta name="twitter:image" content="https://hsglobalexport.com/og-image.jpg" />
        <meta name="twitter:image:alt" content="HS Global Export - Contact Us" />

        {/* Schema.org LocalBusiness */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "HS Global Export",
            "image": "https://hsglobalexport.com/logo.webp",
            "url": "https://hsglobalexport.com",
            "telephone": "+91-8107115116",
            "email": "inquiry@hsglobalexport.com",
            "address": [
              {
                "@type": "PostalAddress",
                "streetAddress": "C-108, Titanium Business Park, Makarba",
                "addressLocality": "Ahmedabad",
                "postalCode": "380051",
                "addressRegion": "Gujarat",
                "addressCountry": "IN"
              }
            ],
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": "23.0225",
              "longitude": "72.5714"
            },
            "openingHoursSpecification": {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
              "opens": "09:00",
              "closes": "18:00"
            },
            "sameAs": [
              "https://www.instagram.com/hsglobalexport116",
              "https://www.linkedin.com/company/hsglobalexport",
              "https://www.facebook.com/hsglobalexport"
            ]
          })}
        </script>
      </Helmet>

      {/* Hero Banner */}
      <section className="relative h-[80vh] overflow-hidden">
        <div
          className="fixed-bg absolute inset-0"
          style={{
            backgroundImage: "url('https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')"
          }}
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4 md:px-6">
            <div ref={heroTextRef} className="max-w-2xl" style={{ opacity: 0 }}>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-light text-white mb-3 md:mb-4">
                {t('contact.hero_title')}<br />
                <span className="font-bold">{t('contact.hero_subtitle')}</span>
              </h1>
              <p className="text-white/90 text-lg md:text-xl">
                {t('contact.hero_subtitle_2')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Minimalist Contact Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-6xl mx-auto">

            {/* Header */}
            <div ref={headerRef} className="text-center mb-20" style={{ opacity: 0 }}>
              <h2 className="text-4xl md:text-6xl font-light text-gray-900 mb-6">
                {t('contact.title')}
              </h2>
              <div className="w-24 h-px bg-gray-900 mx-auto"></div>
            </div>

            {/* Grid Layout */}
            <div className="grid lg:grid-cols-2 gap-20">

              {/* Contact Form */}
              <div ref={formRef} style={{ opacity: 0 }}>
                <h3 className="text-2xl font-light text-gray-900 mb-10">{t('contact.form_title')}</h3>

                <form className="space-y-8" onSubmit={onSubmit} noValidate>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={`w-full px-0 py-4 text-lg bg-transparent border-0 border-b-2 focus:ring-0 placeholder-gray-400 transition-all duration-300 text-gray-900 focus:outline-none ${errors.name ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-gray-300'}`}
                      />
                      <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gray-900 transition-all duration-300 focus-within:w-full"></div>
                      {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                    </div>
                    <div className="relative">
                      <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`w-full px-0 py-4 text-lg bg-transparent border-0 border-b-2 focus:ring-0 placeholder-gray-400 transition-all duration-300 text-gray-900 focus:outline-none ${errors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-gray-300'}`}
                      />
                      <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gray-900 transition-all duration-300 focus-within:w-full"></div>
                      {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
                    </div>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className={`w-full px-0 py-4 text-lg bg-transparent border-0 border-b-2 focus:ring-0 placeholder-gray-400 transition-all duration-300 text-gray-900 focus:outline-none ${errors.subject ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-gray-300'}`}
                    />
                    <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gray-900 transition-all duration-300 focus-within:w-full"></div>
                    {errors.subject && <p className="text-red-600 text-sm mt-1">{errors.subject}</p>}
                  </div>

                  <div className="relative">
                    <textarea
                      rows={5}
                      placeholder="Message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className={`w-full px-0 py-4 text-lg bg-transparent border-0 border-b-2 focus:ring-0 placeholder-gray-400 resize-none transition-all duration-300 text-gray-900 focus:outline-none ${errors.message ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-gray-300'}`}
                    />
                    <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gray-900 transition-all duration-300 focus-within:w-full"></div>
                    {errors.message && <p className="text-red-600 text-sm mt-1">{errors.message}</p>}
                  </div>

                  {/* Reference Image Upload (Optional) */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reference Image <span className="text-gray-400 font-normal">(Optional)</span>
                    </label>
                    <div className="flex items-center gap-4">
                      <label className="cursor-pointer inline-flex items-center px-4 py-2 border-2 border-gray-300 rounded-lg hover:border-gray-900 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <span className="text-gray-700">Choose Image</span>
                      </label>
                      {referenceImage && (
                        <button
                          type="button"
                          onClick={() => setReferenceImage("")}
                          className="text-red-600 hover:text-red-800 text-sm underline"
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
                          className="max-w-xs max-h-48 rounded-lg border-2 border-gray-200"
                        />
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-2">Upload a reference image if needed (Max 5MB)</p>
                  </div>

                  {!!sendError && (
                    <div className="rounded-lg border border-red-300 bg-red-50 text-red-800 p-3 text-sm">{sendError}</div>
                  )}
                  <button
                    ref={submitBtnRef}
                    type="submit"
                    disabled={isSending}
                    className={`group relative inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-gray-900 hover:text-gray-900 hover:bg-white border-2 border-gray-900 transition-colors duration-300 overflow-hidden ${isSending ? 'opacity-70 cursor-not-allowed' : ''}`}
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
              <div ref={infoRef} style={{ opacity: 0 }}>
                <h3 className="text-2xl font-light text-gray-900 mb-10">{t('contact.info_title')}</h3>

                <div className="space-y-12">
                  <div className="flex items-start space-x-6">
                    <div className="w-12 h-12 flex items-center justify-center">
                      <Mail className="w-6 h-6 text-gray-900" />
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">{t('contact.email')}</h4>
                      <a href="mailto:inquiry@hsglobalexport.com" className="text-gray-600 hover:text-gray-900">inquiry@hsglobalexport.com</a>
                    </div>
                  </div>

                  <div className="flex items-start space-x-6">
                    <div className="w-12 h-12 flex items-center justify-center">
                      <Phone className="w-6 h-6 text-gray-900" />
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">{t('contact.phone')}</h4>
                      <a href="tel:+918107115116" className="text-gray-600 hover:text-gray-900">+91 81071 15116</a>
                    </div>
                  </div>

                  <div className="flex items-start space-x-6">
                    <div className="w-12 h-12 flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-gray-900" />
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">{t('contact.location')}</h4>
                      <div className="space-y-3 text-gray-600">
                        <a href="https://maps.app.goo.gl/SLV59xn17PS7k2z76" target="_blank" rel="noreferrer" className="block hover:underline">
                          <span className="font-medium">{t('contact.corporate_title')}</span><br />
                          {t('contact.corporate_address_1')}<br />
                          {t('contact.corporate_address_2')}
                        </a>
                        <p>
                          <span className="font-medium">{t('contact.factory')}</span><br />
                          {t('contact.factory_address_1')}<br />
                          {t('contact.factory_address_2')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom CTA */}
            <div ref={ctaRef} className="text-center mt-24 py-16 border-t border-gray-200" style={{ opacity: 0 }}>
              <p className="text-xl text-gray-600 mb-6">
                {t('contact.cta_title')}
              </p>
              <p className="text-4xl font-light text-gray-900">
                {t('contact.cta_text')}
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Success Modal */}
      {submitted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 text-center">
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">{t('contact.cta_thanks')}</h3>
            <p className="text-gray-600 mb-6">{t('contact.cta_success')}</p>
            <button
              onClick={() => setSubmitted(false)}
              className="inline-flex items-center justify-center px-6 py-3 text-white bg-gray-900 hover:text-gray-900 hover:bg-white border-2 border-gray-900 rounded-lg transition-colors"
            >
              {t('contact.cta_close')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contact;
