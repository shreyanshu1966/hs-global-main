const Footer = () => {
  const legalLinks = [
    'User Agreement',
    'Privacy',
    'Shipping Policy',
    'Cookie Preferences',
    'Site Map'
  ];

  const regions = ['USA', 'UK', 'UAE', 'Europe'];

  return (
    <footer className="itsbits-footer">
      
      {/* Top Section */}
      <div className="itsbits-footer-top">
        <div className="itsbits-footer-grid">
          
          <div className="itsbits-footer-group">
            <h3 className="itsbits-footer-heading">Categories</h3>
            <div className="itsbits-footer-link-list">
              <a href="/products?cat=furniture" className="itsbits-footer-link hover:underline">Marble Furniture</a>
              <a href="/products?cat=furniture#coffee-table" className="itsbits-footer-link hover:underline">Marble Coffee Tables</a>
              <a href="/products?cat=furniture#console-table" className="itsbits-footer-link hover:underline">Marble Console Tables</a>
              <a href="/services" className="itsbits-footer-link hover:underline">Custom Services</a>
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
                <a href="/services" className="itsbits-footer-link hover:underline">Export Logistics</a>
                <a href="/about" className="itsbits-footer-link hover:underline">Our Process</a>
              </div>
            </div>
          </div>

          <div className="itsbits-footer-group">
            <h3 className="itsbits-footer-heading">Our Company</h3>
            <div className="itsbits-footer-link-list">
              <a href="/about" className="itsbits-footer-link hover:underline">About Us</a>
              <a href="/services" className="itsbits-footer-link hover:underline">Services</a>
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
              <a href="/blog" className="itsbits-footer-link hover:underline"><span className="itsbits-footer-strong">HS Global</span> Journal</a>

              <div className="flex items-center gap-3 pt-1">
                <a
                  href="https://www.facebook.com/hsglobalexport"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#d9d2c7] text-[#1f2937] transition-colors duration-200 hover:border-[#111] hover:text-[#111]"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                    <path d="M13.5 22v-8h2.7l.4-3h-3.1V9.1c0-.9.3-1.5 1.6-1.5h1.7V4.9c-.8-.1-1.5-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H8v3h2.6v8h2.9Z" />
                  </svg>
                </a>

                <a
                  href="https://www.instagram.com/hsglobalexport116/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#d9d2c7] text-[#1f2937] transition-colors duration-200 hover:border-[#111] hover:text-[#111]"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                    <path d="M7.8 2h8.4A5.8 5.8 0 0 1 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8A5.8 5.8 0 0 1 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2Zm0 1.9A3.9 3.9 0 0 0 3.9 7.8v8.4a3.9 3.9 0 0 0 3.9 3.9h8.4a3.9 3.9 0 0 0 3.9-3.9V7.8a3.9 3.9 0 0 0-3.9-3.9H7.8Zm8.9 1.5a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.9a3.1 3.1 0 1 0 0 6.2 3.1 3.1 0 0 0 0-6.2Z" />
                  </svg>
                </a>

                <a
                  href="https://www.linkedin.com/company/hsglobalexport"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#d9d2c7] text-[#1f2937] transition-colors duration-200 hover:border-[#111] hover:text-[#111]"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                    <path d="M6.5 8.8V22H2.7V8.8h3.8ZM4.6 2A2.2 2.2 0 1 1 4.6 6.4 2.2 2.2 0 0 1 4.6 2ZM22 13.9V22h-3.8v-7.5c0-1.8-.7-3-2.3-3-1.3 0-2 .9-2.4 1.7-.1.3-.2.8-.2 1.2V22H9.5s.1-12.1 0-13.2h3.8v1.9c.5-.8 1.5-1.9 3.7-1.9 2.7 0 5 1.8 5 5.8Z" />
                  </svg>
                </a>
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
              <a key={i} href="#" className="itsbits-footer-link hover:underline">{link}</a>
            ))}
          </div>

          <div className="itsbits-footer-regions">
            <span className="itsbits-footer-strong">Export Regions:</span>
            {regions.map((country, i) => (
               <a key={i} href="#" className="itsbits-footer-link hover:underline">{country}</a>
            ))}
            <a href="#" className="itsbits-footer-link itsbits-footer-link-dark itsbits-footer-strong hover:underline">India HQ</a>
          </div>

        </div>

        <div className="itsbits-footer-disclaimer">
          This site is protected by reCAPTCHA and the Google <a href="#" className="itsbits-footer-disclaimer-link">Privacy Policy</a> and <a href="#" className="itsbits-footer-disclaimer-link">Terms of Service</a> apply.
        </div>

        {/* Monogram */}
        <div className="itsbits-footer-brand">
           <a href="/" className="hover:opacity-75 transition-opacity itsbits-footer-brand-link">
             <img src="/logo.webp" alt="HS Global Export" className="itsbits-footer-brand-image" />
           </a>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
