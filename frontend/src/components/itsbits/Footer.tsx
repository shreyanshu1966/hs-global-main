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
              <a href="https://www.instagram.com/hsglobalexport116/" className="itsbits-footer-link itsbits-footer-strong hover:underline">Instagram</a>
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
