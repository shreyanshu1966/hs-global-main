import { useEffect, useRef, useState } from "react";

const Header = () => {
  const [isBottomNavVisible, setIsBottomNavVisible] = useState(true);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;

      ticking = true;
      window.requestAnimationFrame(() => {
        const currentScrollY = window.scrollY || 0;
        const delta = currentScrollY - lastScrollYRef.current;

        if (currentScrollY < 90) {
          setIsBottomNavVisible(true);
        } else if (delta > 8) {
          setIsBottomNavVisible(false);
        } else if (delta < -6) {
          setIsBottomNavVisible(true);
        }

        lastScrollYRef.current = currentScrollY;
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileSearchOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileSearchOpen(false);
      }
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const navItems = [
    { label: 'New Arrivals', href: '/products?cat=furniture&sort=newest', active: true },
    { label: 'All Furniture', href: '/products?cat=furniture' },
    { label: 'Coffee Tables', href: '/products?cat=furniture#coffee-table' },
    { label: 'Console Tables', href: '/products?cat=furniture#console-table' },
    { label: 'Gallery', href: '/gallery' },
    { label: 'Services', href: '/services' },
    { label: 'Journal', href: '/blog' },
    { label: 'About HS Global', href: '/about' },
    { label: 'Get Quote', href: '/contact', isSale: true },
  ];

  return (
    <header className="fixed top-0 left-0 w-full z-50 font-sans itsbits-header itsbits-header-root">
      {/* ===== Top Bar (Logo + Search + Icons) — height: 84px ===== */}
      <div
        className="bg-white flex justify-center relative itsbits-top-bar"
      >
        <div
          className="flex items-center w-full static itsbits-header-inner itsbits-top-inner"
        >
          {/* Logo */}
          <div className="flex-shrink-0 itsbits-logo-wrap">
            <a
              href="/"
              aria-label="HS Global Logo"
              className="itsbits-logo inline-block text-black no-underline transition-all duration-300 hover:text-black"
            >
              <span
                className="itsbits-logo-main itsbits-logo-main-text block uppercase"
              >
                HS GLOBAL
              </span>
              <span
                className="itsbits-logo-sub itsbits-logo-sub-text block uppercase"
              >
                EXPORT
              </span>
            </a>
          </div>

          {/* Search Bar — pill-shaped with 1.5px border */}
          <div className="flex-1 relative hidden md:block itsbits-desktop-search">
            <div
              className="flex relative itsbits-search-shell"
            >
              <div className="flex-grow relative">
                <input
                  type="text"
                  placeholder="Search HS Global"
                  className="w-full h-full bg-transparent border-none outline-none text-[#222] font-light itsbits-search-input itsbits-search-input-text"
                />
              </div>
              {/* Search Icon Button */}
              <button
                aria-label="Search"
                className="flex-none flex items-center justify-center text-black itsbits-search-submit"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="m19.6 21-6.3-6.3A6.096 6.096 0 0 1 9.5 16c-1.817 0-3.354-.63-4.612-1.887C3.629 12.854 3 11.317 3 9.5c0-1.817.63-3.354 1.888-4.612C6.146 3.629 7.683 3 9.5 3c1.817 0 3.354.63 4.613 1.888C15.37 6.146 16 7.683 16 9.5a6.096 6.096 0 0 1-1.3 3.8l6.3 6.3-1.4 1.4ZM9.5 14c1.25 0 2.313-.438 3.188-1.313C13.562 11.813 14 10.75 14 9.5c0-1.25-.438-2.313-1.313-3.188C11.813 5.438 10.75 5 9.5 5c-1.25 0-2.313.438-3.188 1.313S5 8.25 5 9.5c0 1.25.438 2.313 1.313 3.188C7.188 13.562 8.25 14 9.5 14Z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Right Icons (Favorites + Cart) */}
          <div className="flex items-center justify-end itsbits-right-icons">
            <button
              type="button"
              aria-label={isMobileSearchOpen ? "Close search" : "Open search"}
              aria-expanded={isMobileSearchOpen}
              aria-controls="itsbits-mobile-search"
              onClick={() => setIsMobileSearchOpen((prev) => !prev)}
              className="itsbits-mobile-search-toggle md:hidden"
            >
              {isMobileSearchOpen ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M6.4 19 5 17.6 10.6 12 5 6.4 6.4 5 12 10.6 17.6 5 19 6.4 13.4 12 19 17.6 17.6 19 12 13.4 6.4 19Z" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="m19.6 21-6.3-6.3A6.096 6.096 0 0 1 9.5 16c-1.817 0-3.354-.63-4.612-1.887C3.629 12.854 3 11.317 3 9.5c0-1.817.63-3.354 1.888-4.612C6.146 3.629 7.683 3 9.5 3c1.817 0 3.354.63 4.613 1.888C15.37 6.146 16 7.683 16 9.5a6.096 6.096 0 0 1-1.3 3.8l6.3 6.3-1.4 1.4ZM9.5 14c1.25 0 2.313-.438 3.188-1.313C13.562 11.813 14 10.75 14 9.5c0-1.25-.438-2.313-1.313-3.188C11.813 5.438 10.75 5 9.5 5c-1.25 0-2.313.438-3.188 1.313S5 8.25 5 9.5c0 1.25.438 2.313 1.313 3.188C7.188 13.562 8.25 14 9.5 14Z" />
                </svg>
              )}
            </button>
            {/* Favorites / Heart */}
            <a
              href="/profile"
              className="inline-block relative cursor-pointer text-black no-underline transition-colors duration-200 hover:text-[#444] itsbits-icon-link"
            >
              <svg viewBox="0 0 250 250" fill="currentColor" width="18" height="18">
                <path d="M29.2 129.3C22.7 120.8 1.5 91.6.3 71.9-.9 51.8 4 35.7 15 24.1 30 8.1 51.4 6.3 59.8 6.3c1.3 0 2.2 0 2.8.1 16.2.4 39.5 7.6 58.9 39.4l3.4 5.6 3.6-5.5c16.8-25.7 37.1-39 60.3-39.5 3 0 28.9-.9 48 20.6 7.2 8.1 15.3 21.4 12.5 45.6-1.9 16.9-12.5 34.8-22.5 48.4-11.8 16.1-90.2 110.3-101.9 124L29.2 129.3zM59.8 16c-7.2 0-25.6 1.2-37.8 14.7C12.6 41.2 8.5 54 10 71.3c.7 8.9 5 18.7 13.6 32.7 6.4 10.4 12.6 18.7 13.3 19.6l88 106.4 83.8-101s11.1-13.7 18.1-25.5c6.2-10.5 12-22.5 13-31.3 1.7-15.7-1.6-29.1-10.2-38.6-17.9-19.8-40-17.3-41-17.3-25.6.3-47.2 19.7-64.2 57.5-2.3-6.2-5.9-14.6-11-22.9-13.6-22.4-31.3-34.5-51.3-34.8-.7-.1-1.5-.1-2.3-.1z" />
              </svg>
            </a>
            {/* Cart / Bag */}
            <a
              href="/products"
              className="inline-block relative cursor-pointer text-black no-underline transition-colors duration-200 hover:text-[#444] itsbits-icon-link"
            >
              <svg viewBox="0 0 225 208.5" fill="currentColor" width="18" height="18">
                <path d="M199.29 208.5H18.92L0 51.25h225zm-173.9-8h167.72l23.1-141.25H8.39z" />
                <path d="M162 59H62.32l1.3-5.06a120 120 0 0110.95-26.52C84.77 9.5 97.77 0 112.16 0s27.39 9.48 37.6 27.42a120.3 120.3 0 0110.94 26.52zm-89.6-8h79.52c-4.16-12.35-16.82-43-39.76-43S76.57 38.65 72.4 51z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <div
        id="itsbits-mobile-search"
        className={`itsbits-mobile-search md:hidden ${isMobileSearchOpen ? 'is-open' : ''}`}
      >
        <div className="itsbits-mobile-search-inner">
          <div className="itsbits-mobile-search-shell">
            <input
              type="text"
              placeholder="Search HS Global"
              className="itsbits-mobile-search-input"
              aria-label="Search HS Global"
            />
            <button type="button" className="itsbits-mobile-search-submit" aria-label="Submit search">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="m19.6 21-6.3-6.3A6.096 6.096 0 0 1 9.5 16c-1.817 0-3.354-.63-4.612-1.887C3.629 12.854 3 11.317 3 9.5c0-1.817.63-3.354 1.888-4.612C6.146 3.629 7.683 3 9.5 3c1.817 0 3.354.63 4.613 1.888C15.37 6.146 16 7.683 16 9.5a6.096 6.096 0 0 1-1.3 3.8l6.3 6.3-1.4 1.4ZM9.5 14c1.25 0 2.313-.438 3.188-1.313C13.562 11.813 14 10.75 14 9.5c0-1.25-.438-2.313-1.313-3.188C11.813 5.438 10.75 5 9.5 5c-1.25 0-2.313.438-3.188 1.313S5 8.25 5 9.5c0 1.25.438 2.313 1.313 3.188C7.188 13.562 8.25 14 9.5 14Z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ===== Bottom Nav Bar — height: 50px ===== */}
      <div
        className={`itsbits-bottom-nav bg-white flex justify-center relative ${isBottomNavVisible ? 'is-visible' : 'is-hidden'}`}
      >
        <nav
          className="flex items-center itsbits-header-inner itsbits-nav-inner"
        >
          <ul className="flex m-0 p-0 list-none justify-center w-full itsbits-nav-list">
            {navItems.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  className={`itsbits-nav-link inline-block relative no-underline cursor-pointer ${item.active ? 'is-active' : ''}`}
                  style={{
                    color: item.isSale ? '#d26a00' : '#000',
                    fontWeight: item.active || item.isSale ? 600 : 300,
                  }}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
