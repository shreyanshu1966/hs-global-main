import { useState, useEffect, memo, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, User, Search } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useTranslation } from "react-i18next";
import LocationSelector from "./LocationSelector";
import { CartIcon } from "./CartIcon";
import { getRootImageUrl } from "../utils/rootCloudinary";
import { useAuth } from "../contexts/AuthContext";
import { SearchModal } from "./SearchModal";

const Header = () => {
  const { t } = useTranslation();
  const { isAuthenticated, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuRendered, setIsMenuRendered] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);


  const links = [
    { path: "/", label: t("nav.home") || "Home" },
    { path: "/about", label: t("nav.about") || "About Us" },
    { path: "/products", label: t("nav.products") || "Products" },
    { path: "/gallery", label: t("nav.gallery") || "Gallery" },
    { path: "/services", label: t("nav.services") || "Services" },
    { path: "/contact", label: t("nav.contact") || "Contact" },
  ];

  /* 
     GSAP Context handling for safe cleanup and scoped selection
  */
  // const { contextSafe } = useGSAP({ scope: containerRef }); // contextSafe not used anymore

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  // Handle menu rendering state to allow exit animations
  useEffect(() => {
    if (isOpen) {
      setIsMenuRendered(true);
    }
  }, [isOpen]);

  useGSAP(() => {
    if (isOpen && isMenuRendered && menuRef.current) {
      // Enter animation
      const tl = gsap.timeline();
      tl.fromTo(menuRef.current,
        { height: 0, opacity: 0 },
        { height: "100vh", opacity: 1, duration: 0.3, ease: "power2.out" }
      );

      tl.fromTo(".mobile-nav-link",
        { x: -20, opacity: 0 },
        { x: 0, opacity: 1, stagger: 0.05, duration: 0.3 },
        "-=0.1"
      );

      tl.fromTo(".mobile-contact",
        { x: -20, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.3 },
        "-=0.1"
      );

    } else if (!isOpen && isMenuRendered && menuRef.current) {
      // Exit animation
      const tl = gsap.timeline({
        onComplete: () => setIsMenuRendered(false)
      });

      // Animate content out first
      tl.to(".mobile-contact, .mobile-nav-link", { opacity: 0, duration: 0.1 });

      // Then collapse menu
      tl.to(menuRef.current,
        { height: 0, opacity: 0, duration: 0.3, ease: "power2.in" }
      );
    }
  }, [isOpen, isMenuRendered]);



  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    if (path === "/products" && location.pathname.includes("product")) return true;
    if (path === "/gallery" && location.pathname.includes("gallery")) return true;
    return location.pathname === path;
  };

  return (
    <>
      <header
        ref={containerRef}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
          ? "bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 py-3"
          : "bg-transparent py-4 sm:py-6"
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0 group relative z-50">
              <img
                src={getRootImageUrl("logo.webp") || "https://res.cloudinary.com/dpztytsoz/image/upload/v1766858534/hs-global/root/logo.png"}
                alt="HS Global Export"
                className={`transition-all duration-300 object-contain ${isScrolled ? "h-10 sm:h-12 w-auto" : "h-12 sm:h-16 w-auto"
                  }`}
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1 bg-white/50 backdrop-blur-sm px-2 py-1.5 rounded-full border border-white/20 shadow-sm ml-8">
              {links.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-4 py-2 text-sm font-medium transition-all duration-300 rounded-full ${isActive(link.path)
                    ? "bg-black text-white shadow-md"
                    : "text-gray-600 hover:text-black hover:bg-white/60"
                    }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="hidden lg:flex items-center space-x-4">
              {/* Search Button */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Search products"
              >
                <Search className="w-5 h-5 text-gray-600" />
              </button>

              {/* Location Selector (Integrated) */}
              <div className="relative z-50">
                <LocationSelector />
              </div>

              <div className="border-l border-gray-200 pl-4 flex items-center gap-3">
                <CartIcon />

                {/* User Profile/Login */}
                {isAuthenticated && user ? (
                  <>
                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all shadow-sm text-sm bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700"
                      >
                        <span className="hidden xl:inline">Admin</span>
                        <span className="xl:hidden">⚙️</span>
                      </Link>
                    )}
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all shadow-sm text-sm bg-black text-white hover:bg-gray-800"
                    >
                      <User className="w-4 h-4" />
                      <span className="hidden xl:inline">{user.name.split(' ')[0]}</span>
                    </Link>
                  </>
                ) : (
                  <Link
                    to="/login"
                    className="flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all shadow-sm text-sm bg-black text-white hover:bg-gray-800"
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden xl:inline">Login</span>
                  </Link>
                )}


              </div>
            </div>

            {/* Mobile Menu Toggle & Location */}
            <div className="flex items-center gap-2 lg:hidden">
              <div className="relative z-50 scale-90">
                <LocationSelector />
              </div>
              <CartIcon />
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors z-50"
                aria-label="Search products"
              >
                <Search className="w-5 h-5 text-black" />
              </button>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors z-50"
                aria-label="Toggle menu"
              >
                {isOpen ? (
                  <X className="w-6 h-6 text-black" />
                ) : (
                  <Menu className="w-6 h-6 text-black" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMenuRendered && (
          <div
            ref={menuRef}
            className="lg:hidden fixed inset-0 top-0 bg-white/95 backdrop-blur-xl z-40 flex flex-col pt-24 px-6 overflow-y-auto"
            style={{ height: 0, opacity: 0 }} // Initial state for GSAP to animate from/to
          >
            <div className="flex flex-col space-y-4">
              {links.map((link) => (
                <div key={link.path} className="mobile-nav-link" style={{ opacity: 0 }}>
                  <Link
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`block text-2xl font-medium transition-colors ${location.pathname === link.path ? "text-amber-600" : "text-black hover:text-gray-600"}`}
                  >
                    {link.label}
                  </Link>
                </div>
              ))}

              {/* Mobile User Links */}
              <div className="mobile-contact pt-6 border-t border-gray-200 space-y-3" style={{ opacity: 0 }}>
                {isAuthenticated && user ? (
                  <>
                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setIsOpen(false)}
                        className="block text-xl font-medium text-purple-600 hover:text-purple-700"
                      >
                        ⚙️ Admin Dashboard
                      </Link>
                    )}
                    <Link
                      to="/profile"
                      onClick={() => setIsOpen(false)}
                      className="block text-xl font-medium text-black hover:text-gray-600"
                    >
                      👤 Profile
                    </Link>
                  </>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="block text-xl font-medium text-black hover:text-gray-600"
                  >
                    👤 Login
                  </Link>
                )}
              </div>

            </div>
          </div>
        )}
      </header>

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};

export default memo(Header);