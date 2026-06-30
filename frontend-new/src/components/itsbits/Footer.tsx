'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { Mail, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      const response = await fetch(`${API_URL}/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: `${email}, inquiry@hsglobalexport.com`,
          subject: 'Newsletter Subscription - HS Global Export',
          data: {
            message: `New newsletter subscription from: ${email}`,
            email: email,
          }
        }),
      });
      if (response.ok) {
        setStatus('success');
        setEmail('');
        setTimeout(() => setStatus('idle'), 3000);
      } else {
        setStatus('error');
        setTimeout(() => setStatus('idle'), 3000);
      }
    } catch (error) {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  const legalLinks = [
    { label: 'User Agreement', href: '/terms' },
    { label: 'Privacy', href: '/privacy' },
    { label: 'Shipping Policy', href: '/shipping-policy' },
    { label: 'Cookie Preferences', href: '/cookies' },
    { label: 'Site Map', href: '/sitemap.xml' },
  ];

  const regions = ['USA', 'UK', 'UAE', 'Europe'];

  return (
    <footer className="itsbits-footer">

      {/* Top Section */}
      <div className="itsbits-footer-top">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">

          {/* Brand Logo (Moved to Left of Main Content) */}
          <div className="itsbits-footer-brand !mt-0 justify-start lg:w-[250px] shrink-0">
            <a href="/" className="hover:opacity-75 transition-opacity itsbits-footer-brand-link w-full">
              <Image src="/logo.webp" alt="HS Global Export" width={250} height={250} className="itsbits-footer-brand-image !w-full !h-auto object-contain object-left" style={{ height: 'auto' }} />
            </a>
          </div>

          <div className="itsbits-footer-grid flex-1">

            <div className="itsbits-footer-group">
              <h3 className="itsbits-footer-heading">Categories</h3>
              <div className="itsbits-footer-link-list">
                <a href="/products/furniture" className="itsbits-footer-link hover:underline">Marble Furniture</a>
                <a href="/products/furniture/coffee-table" className="itsbits-footer-link hover:underline">Marble Coffee Tables</a>
                <a href="/products/furniture/console-table" className="itsbits-footer-link hover:underline">Marble Console Tables</a>
                <a href="/shipping" className="itsbits-footer-link hover:underline">Custom Shipping</a>
                <a href="/gallery" className="itsbits-footer-link hover:underline">Project Gallery</a>
                <a href="/contact" className="itsbits-footer-link hover:underline">Request Quote</a>
              </div>
            </div>

            <div className="itsbits-footer-subgroup-stack">
              <div className="itsbits-footer-group">
                <h3 className="itsbits-footer-heading">For Trade</h3>
                <div className="itsbits-footer-link-list">
                  <a href="/contact" className="itsbits-footer-link hover:underline">Architect & Designer Program</a>
                </div>
              </div>
              <div className="itsbits-footer-group">
                <h3 className="itsbits-footer-heading">Global Buyers</h3>
                <div className="itsbits-footer-link-list">
                  <a href="/contact" className="itsbits-footer-link hover:underline">Bulk Inquiry</a>
                  <a href="/shipping" className="itsbits-footer-link hover:underline">Export Logistics</a>
                  <a href="/about" className="itsbits-footer-link hover:underline">Our Process</a>
                </div>
              </div>
            </div>

            <div className="itsbits-footer-group">
              <h3 className="itsbits-footer-heading">Our Company</h3>
              <div className="itsbits-footer-link-list">
                <a href="/about" className="itsbits-footer-link hover:underline">About Us</a>
                <a href="/shipping" className="itsbits-footer-link hover:underline">Shipping</a>
                <a href="/gallery" className="itsbits-footer-link hover:underline">Projects</a>
                <a href="/blog" className="itsbits-footer-link hover:underline">Journal</a>
                <a href="/contact" className="itsbits-footer-link hover:underline">Contact</a>
              </div>
            </div>

            <div className="itsbits-footer-group">
              <h3 className="itsbits-footer-heading">Customer Support</h3>
              <div className="itsbits-footer-link-list">
                <a href="/contact" className="itsbits-footer-link hover:underline">Get Help</a>
                <a href="mailto:inquiry@hsglobalexport.com" className="itsbits-footer-link hover:underline">inquiry@hsglobalexport.com</a>
                <a href="/contact" className="itsbits-footer-link hover:underline">HS Global Promise</a>
                <address className="itsbits-footer-link not-italic">
                  C-108, Titanium Business Park, Makarba,<br />
                  Ahmedabad - 380051
                </address>
              </div>
            </div>

            <div className="itsbits-footer-group">
              <h3 className="itsbits-footer-heading">Connect With Us</h3>
              <div className="itsbits-footer-link-list">
                <form onSubmit={handleSubscribe} className="flex flex-col gap-2 w-full max-w-sm mb-4">
                  <div className="relative flex items-center">
                    <Mail className="absolute left-3 w-4 h-4 text-[#94a3b8]" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      className="w-full bg-[#f8fafc] border border-[#e2e8f0] py-2 pl-9 pr-10 text-sm focus:outline-none focus:border-[#111827] transition-colors rounded-none"
                    />
                    <button
                      type="submit"
                      disabled={status === 'loading'}
                      className="absolute right-0 top-0 bottom-0 px-3 bg-[#111827] text-white hover:bg-[#334155] transition-colors flex items-center justify-center"
                    >
                      {status === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                    </button>
                  </div>
                  {status === 'success' && <p className="text-xs text-green-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Subscribed successfully!</p>}
                  {status === 'error' && <p className="text-xs text-red-600">Failed to subscribe. Try again.</p>}
                </form>

                <div className="flex items-center gap-2.5 pt-1 flex-wrap">
                  {/* Instagram */}
                  <a href="https://www.instagram.com/hsglobalexport_com/?hl=en" target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#d9d2c7] text-[#E4405F] transition-all duration-200 hover:border-[#E4405F] hover:bg-[#E4405F]/10 hover:scale-110">
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true">
                      <path d="M7.8 2h8.4A5.8 5.8 0 0 1 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8A5.8 5.8 0 0 1 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2Zm0 1.9A3.9 3.9 0 0 0 3.9 7.8v8.4a3.9 3.9 0 0 0 3.9 3.9h8.4a3.9 3.9 0 0 0 3.9-3.9V7.8a3.9 3.9 0 0 0-3.9-3.9H7.8Zm8.9 1.5a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.9a3.1 3.1 0 1 0 0 6.2 3.1 3.1 0 0 0 0-6.2Z" />
                    </svg>
                  </a>

                  {/* Facebook */}
                  <a href="https://www.facebook.com/profile.php?id=61571531083009" target="_blank" rel="noopener noreferrer" aria-label="Facebook"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#d9d2c7] text-[#1877F2] transition-all duration-200 hover:border-[#1877F2] hover:bg-[#1877F2]/10 hover:scale-110">
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true">
                      <path d="M13.5 22v-8h2.7l.4-3h-3.1V9.1c0-.9.3-1.5 1.6-1.5h1.7V4.9c-.8-.1-1.5-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H8v3h2.6v8h2.9Z" />
                    </svg>
                  </a>

                  {/* LinkedIn */}
                  <a href="https://www.linkedin.com/company/hs-global-export/?viewAsMember=true" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#d9d2c7] text-[#0A66C2] transition-all duration-200 hover:border-[#0A66C2] hover:bg-[#0A66C2]/10 hover:scale-110">
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true">
                      <path d="M6.5 8.8V22H2.7V8.8h3.8ZM4.6 2A2.2 2.2 0 1 1 4.6 6.4 2.2 2.2 0 0 1 4.6 2ZM22 13.9V22h-3.8v-7.5c0-1.8-.7-3-2.3-3-1.3 0-2 .9-2.4 1.7-.1.3-.2.8-.2 1.2V22H9.5s.1-12.1 0-13.2h3.8v1.9c.5-.8 1.5-1.9 3.7-1.9 2.7 0 5 1.8 5 5.8Z" />
                    </svg>
                  </a>

                  {/* Pinterest */}
                  <a href="https://in.pinterest.com/hsglobalexport/_pins/" target="_blank" rel="noopener noreferrer" aria-label="Pinterest"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#d9d2c7] text-[#E60023] transition-all duration-200 hover:border-[#E60023] hover:bg-[#E60023]/10 hover:scale-110">
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true">
                      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.236 2.636 7.855 6.356 9.312-.088-.791-.167-2.005.035-2.868.181-.78 1.172-4.97 1.172-4.97s-.299-.598-.299-1.482c0-1.388.806-2.428 1.808-2.428.853 0 1.267.641 1.267 1.408 0 .858-.546 2.141-.828 3.33-.236.995.498 1.806 1.476 1.806 1.772 0 3.136-1.867 3.136-4.563 0-2.386-1.716-4.052-4.164-4.052-2.838 0-4.503 2.128-4.503 4.329 0 .857.33 1.775.742 2.277a.3.3 0 0 1 .069.283c-.076.313-.244.995-.277 1.134-.044.183-.145.221-.335.134-1.249-.581-2.03-2.407-2.03-3.874 0-3.154 2.292-6.052 6.608-6.052 3.469 0 6.165 2.473 6.165 5.776 0 3.447-2.173 6.22-5.19 6.22-1.013 0-1.966-.527-2.292-1.148l-.623 2.378c-.226.869-.835 1.958-1.244 2.621.937.29 1.931.446 2.962.446 5.523 0 10-4.477 10-10S17.523 2 12 2Z" />
                    </svg>
                  </a>

                  {/* X / Twitter */}
                  <a href="https://x.com/hsglobalex51217" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#d9d2c7] text-[#111] transition-all duration-200 hover:border-[#111] hover:bg-[#111]/10 hover:scale-110">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.259 5.632L18.244 2.25Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="itsbits-footer-bottom">
        <div className="itsbits-footer-meta-row">

          <div className="itsbits-footer-legal">
            <span>© 2026 HS Global Export.</span>
            {legalLinks.map((link, i) => (
              <a key={i} href={link.href} className="itsbits-footer-link hover:underline">{link.label}</a>
            ))}
          </div>

          <div className="itsbits-footer-regions">
            <span className="itsbits-footer-strong">Export Regions:</span>
            {regions.map((country, i) => (
              <a key={i} href="/contact" className="itsbits-footer-link hover:underline">{country}</a>
            ))}
            <a href="/contact" className="itsbits-footer-link itsbits-footer-link-dark itsbits-footer-strong hover:underline">India HQ</a>
          </div>

        </div>

        <div className="itsbits-footer-disclaimer">
          This site is protected by reCAPTCHA and the Google <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="itsbits-footer-disclaimer-link">Privacy Policy</a> and <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="itsbits-footer-disclaimer-link">Terms of Service</a> apply.
        </div>

      </div>
    </footer>
  );
};

export default Footer;
