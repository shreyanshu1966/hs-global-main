import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Heart, Menu, Search, X } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { CartIcon } from "../CartIcon";
import { LocationSelector } from "../LocationSelector";
import { productService, Product } from "../../services/productService";
import { useWishlist } from "../../contexts/WishlistContext";

const Header = () => {
  const [isBottomNavVisible, setIsBottomNavVisible] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isDesktopDropdownOpen, setIsDesktopDropdownOpen] = useState(false);
  const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const lastScrollYRef = useRef(0);
  const desktopSearchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const { count: wishlistCount } = useWishlist();

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobileMenuOpen]);

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
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsDesktopDropdownOpen(false);
        setIsMobileDropdownOpen(false);
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (trimmed.length < 2) {
      setSearchResults([]);
      setHasSearched(false);
      setIsSearching(false);
      return;
    }

    const timer = window.setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await productService.searchProducts(trimmed, { limit: 8, page: 1 });
        const items = Array.isArray(response.data) ? response.data : [];
        setSearchResults(items);
      } catch (_error) {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
        setHasSearched(true);
      }
    }, 220);

    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (desktopSearchRef.current && !desktopSearchRef.current.contains(target)) {
        setIsDesktopDropdownOpen(false);
      }

      if (mobileSearchRef.current && !mobileSearchRef.current.contains(target)) {
        setIsMobileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showNoResults = useMemo(
    () => hasSearched && !isSearching && searchQuery.trim().length >= 2 && searchResults.length === 0,
    [hasSearched, isSearching, searchQuery, searchResults.length]
  );

  const handleSelectProduct = (product: Product) => {
    const id = product.productId || product._id;
    if (!id) return;

    setSearchQuery("");
    setSearchResults([]);
    setHasSearched(false);
    setIsDesktopDropdownOpen(false);
    setIsMobileDropdownOpen(false);
    navigate(`/products/${id}`);
  };

  const navItems = [
    { label: 'New Arrivals', mobileLabel: 'New', href: '/products?cat=furniture&sort=newest', active: true },
    { label: 'All Furniture', mobileLabel: 'Furniture', href: '/products?cat=furniture' },
    { label: 'Coffee Tables', mobileLabel: 'Coffee', href: '/products?cat=furniture#coffee-table' },
    { label: 'Console Tables', mobileLabel: 'Console', href: '/products?cat=furniture#console-table' },
    { label: 'Gallery', mobileLabel: 'Gallery', href: '/gallery' },
    { label: 'Services', mobileLabel: 'Services', href: '/services' },
    { label: 'Journal', mobileLabel: 'Journal', href: '/blog' },
    { label: 'About HS Global', mobileLabel: 'About', href: '/about' },
    { label: 'Get Quote', mobileLabel: 'Get Quote', href: '/contact', isSale: true },
  ];

  return (
    <>
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
            <button
              type="button"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              onClick={() => {
                setIsMobileMenuOpen((prev) => !prev);
              }}
              className="itsbits-mobile-menu-trigger md:hidden inline-flex items-center justify-center text-black"
            >
              {isMobileMenuOpen ? <X width="19" height="19" /> : <Menu width="19" height="19" />}
            </button>

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
              <span className="itsbits-logo-mobile-full itsbits-logo-main-text uppercase">
                HS GLOBAL EXPORT
              </span>
            </a>
          </div>

          {/* Search Bar — dropdown autocomplete */}
          <div ref={desktopSearchRef} className="flex-1 relative hidden md:block itsbits-desktop-search">
            <div
              className="flex relative itsbits-search-shell"
            >
              <div className="flex-grow relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => {
                    setSearchQuery(event.target.value);
                    setIsDesktopDropdownOpen(true);
                  }}
                  onFocus={() => setIsDesktopDropdownOpen(true)}
                  placeholder="Search HS Global"
                  className="w-full h-full bg-transparent border-none outline-none text-left text-[#222] font-light itsbits-search-input itsbits-search-input-text"
                  aria-label="Search products"
                />
              </div>
              <div className="flex-none flex items-center justify-center text-black itsbits-search-submit" aria-hidden="true">
                <Search width="22" height="22" />
              </div>
            </div>

            {isDesktopDropdownOpen && searchQuery.trim().length >= 2 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#e5e7eb] rounded-2xl shadow-[0_12px_32px_rgba(0,0,0,0.12)] max-h-[380px] overflow-y-auto z-[80]">
                {isSearching && (
                  <div className="px-4 py-3 text-sm text-[#6b7280]">Searching...</div>
                )}

                {!isSearching && searchResults.map((product) => (
                  <button
                    key={product.productId || product._id}
                    type="button"
                    onClick={() => handleSelectProduct(product)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#f8f8f8] transition-colors"
                  >
                    <div className="w-12 h-12 rounded-md overflow-hidden bg-[#f3f4f6] shrink-0">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#111827] truncate">{product.name}</p>
                      <p className="text-xs text-[#6b7280] capitalize truncate">
                        {product.category}{product.subcategory ? ` • ${product.subcategory}` : ""}
                      </p>
                    </div>
                  </button>
                ))}

                {showNoResults && (
                  <div className="px-4 py-4 text-sm text-[#6b7280]">No products found.</div>
                )}
              </div>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center justify-end itsbits-right-icons">
            {isAuthenticated && user?.role === "admin" && (
              <Link
                to="/admin"
                className="itsbits-top-action itsbits-top-action-text hidden md:inline-flex items-center justify-center text-[11px] uppercase tracking-[0.14em] font-semibold text-black no-underline transition-colors duration-200 hover:text-[#444]"
              >
                Admin
              </Link>
            )}

            {isAuthenticated ? (
              <Link
                to="/profile"
                className="itsbits-top-action hidden md:inline-flex items-center justify-center text-black no-underline transition-colors duration-200 hover:text-[#444]"
                aria-label="Account"
              >
                <svg viewBox="0 0 250 250" fill="currentColor" width="18" height="18" aria-hidden="true">
                  <path d="M125 22c28.1 0 50.9 22.8 50.9 50.9S153.1 123.8 125 123.8 74.1 101 74.1 72.9 96.9 22 125 22Zm0 15.6c-19.5 0-35.3 15.8-35.3 35.3s15.8 35.3 35.3 35.3 35.3-15.8 35.3-35.3-15.8-35.3-35.3-35.3Zm0 94.9c50.2 0 90.9 31.2 90.9 69.8v6.8h-15.6v-6.8c0-28.4-33.8-54.2-75.3-54.2s-75.3 25.8-75.3 54.2v6.8H34.1v-6.8c0-38.6 40.7-69.8 90.9-69.8Z" />
                </svg>
              </Link>
            ) : (
              <Link
                to="/login"
                className="itsbits-top-action itsbits-top-action-text hidden md:inline-flex items-center justify-center text-[11px] uppercase tracking-[0.14em] font-semibold text-black no-underline transition-colors duration-200 hover:text-[#444]"
              >
                Login
              </Link>
            )}

            <Link
              to="/wishlist"
              className="itsbits-top-action itsbits-top-action-wishlist inline-flex items-center justify-center text-black no-underline transition-colors duration-200 hover:text-[#b43f5a] relative"
              aria-label="Wishlist"
            >
              <Heart width="18" height="18" />
              {wishlistCount > 0 && (
                <span className="itsbits-wishlist-count">{wishlistCount > 99 ? '99+' : wishlistCount}</span>
              )}
            </Link>

            <div className="itsbits-top-action itsbits-top-action-cart">
              <CartIcon />
            </div>

            <div className="itsbits-currency-wrap">
              <LocationSelector />
            </div>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed z-[9999]" 
          style={{ top: 0, left: 0, width: '100%', height: '100%', minHeight: '100vh', backgroundColor: '#ffffff' }} 
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className="absolute top-0 left-0 w-full h-full bg-white"
            style={{ backgroundColor: '#ffffff', overflowY: 'auto' }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="h-[84px] border-b border-[#e5e7eb] px-4 flex items-center justify-between bg-white">
              <span className="text-[13px] uppercase tracking-[0.12em] text-[#222]">Menu</span>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setIsMobileMenuOpen(false)}
                className="itsbits-top-action inline-flex items-center justify-center text-black"
              >
                <X width="19" height="19" />
              </button>
            </div>

            <nav className="py-1">
              {navItems.map((item) => (
                <a
                  key={`mobile-menu-${item.label}`}
                  href={item.href}
                  className={`block border-b border-[#ececec] px-5 py-4 text-[17px] leading-[1.25] ${item.isSale ? 'text-[#d26a00] font-semibold' : 'text-[#111] font-light'}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="border-t border-[#ececec] pt-2">
              {isAuthenticated ? (
                <Link
                  to="/profile"
                  className="block px-5 py-4 text-[17px] font-light text-[#111]"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  My Account
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="block px-5 py-4 text-[17px] font-light text-[#111]"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
              )}

              {isAuthenticated && user?.role === "admin" && (
                <Link
                  to="/admin"
                  className="block px-5 py-4 text-[17px] font-light text-[#111]"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Admin
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      <div
        id="itsbits-mobile-search"
        className="itsbits-mobile-search md:hidden is-open"
      >
        <div ref={mobileSearchRef} className="itsbits-mobile-search-inner">
          <div className="itsbits-mobile-search-shell">
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setIsMobileDropdownOpen(true);
              }}
              onFocus={() => setIsMobileDropdownOpen(true)}
              placeholder="Search HS Global"
              className="itsbits-mobile-search-input text-left"
              aria-label="Search products"
            />
            <div className="itsbits-mobile-search-submit" aria-hidden="true">
              <Search width="20" height="20" />
            </div>
          </div>

          {isMobileDropdownOpen && searchQuery.trim().length >= 2 && (
            <div className="mt-2 bg-white border border-[#e5e7eb] rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.12)] max-h-[280px] overflow-y-auto">
              {isSearching && (
                <div className="px-4 py-3 text-sm text-[#6b7280]">Searching...</div>
              )}

              {!isSearching && searchResults.map((product) => (
                <button
                  key={`mobile-${product.productId || product._id}`}
                  type="button"
                  onClick={() => handleSelectProduct(product)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#f8f8f8] transition-colors"
                >
                  <div className="w-10 h-10 rounded-md overflow-hidden bg-[#f3f4f6] shrink-0">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    ) : null}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#111827] truncate">{product.name}</p>
                    <p className="text-xs text-[#6b7280] capitalize truncate">
                      {product.category}{product.subcategory ? ` • ${product.subcategory}` : ""}
                    </p>
                  </div>
                </button>
              ))}

              {showNoResults && (
                <div className="px-4 py-4 text-sm text-[#6b7280]">No products found.</div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* ===== Bottom Nav Bar — height: 50px ===== */}
      <div
        className={`itsbits-bottom-nav bg-white hidden md:flex justify-center relative ${isBottomNavVisible ? 'is-visible' : 'is-hidden'}`}
      >
        <nav
          className="flex items-center itsbits-header-inner itsbits-nav-inner"
        >
          <ul className="flex m-0 p-0 list-none justify-center w-full itsbits-nav-list">
            {navItems.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  className={`itsbits-nav-link inline-block relative no-underline cursor-pointer ${item.active ? 'is-active' : ''} ${item.isSale ? 'itsbits-nav-link-cta' : ''}`}
                  style={{
                    color: item.isSale ? '#fff' : '#000',
                    fontWeight: item.active || item.isSale ? 600 : 300,
                  }}
                >
                  <span className="itsbits-nav-label-desktop">{item.label}</span>
                  <span className="itsbits-nav-label-mobile">{item.mobileLabel || item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      </header>
    </>
  );
};

export default Header;
