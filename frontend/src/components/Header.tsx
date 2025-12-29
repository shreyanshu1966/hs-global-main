import { useState, useEffect, memo, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, User } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useTranslation } from "react-i18next";
import LocationSelector from "./LocationSelector";
import { CartIcon } from "./CartIcon";
import { getRootImageUrl } from "../utils/rootCloudinary";
import { useAuth } from "../contexts/AuthContext";

const Header = () => {
  const { t } = useTranslation();
  const { isAuthenticated, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuRendered, setIsMenuRendered] = useState(false);
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const whatsAppRef = useRef<HTMLAnchorElement>(null);

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
  const { contextSafe } = useGSAP({ scope: containerRef });

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

  const handleWhatsAppHover = contextSafe(() => {
    gsap.to(whatsAppRef.current, { scale: 1.05, duration: 0.2 });
  });

  const handleWhatsAppLeave = contextSafe(() => {
    gsap.to(whatsAppRef.current, { scale: 1, duration: 0.2 });
  });

  const handleWhatsAppTap = contextSafe(() => {
    gsap.to(whatsAppRef.current, { scale: 0.95, duration: 0.1 });
  });

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
              {/* Location Selector (Integrated) */}
              <div className="relative z-50">
                <LocationSelector />
              </div>

              <div className="border-l border-gray-200 pl-4 flex items-center gap-3">
                <CartIcon />

                {/* User Profile/Login */}
                {isAuthenticated && user ? (
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all shadow-sm text-sm bg-black text-white hover:bg-gray-800"
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden xl:inline">{user.name.split(' ')[0]}</span>
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    className="flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all shadow-sm text-sm bg-black text-white hover:bg-gray-800"
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden xl:inline">Login</span>
                  </Link>
                )}

                {/* WhatsApp Button */}
                <a
                  ref={whatsAppRef}
                  onMouseEnter={handleWhatsAppHover}
                  onMouseLeave={handleWhatsAppLeave}
                  onMouseDown={handleWhatsAppTap}
                  onMouseUp={handleWhatsAppHover}
                  href="https://wa.me/918107115116?text=Hello%20HS%20Global%20Export"
                  target="_blank"
                  rel="noreferrer"
                  className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all shadow-sm text-sm ${isScrolled
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-black/90 text-white backdrop-blur-sm hover:bg-black"
                    }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="h-4 w-4 fill-current"
                  >
                    <path d="M20.52 3.48A11.94 11.94 0 0 0 12.06 0C5.46.03.1 5.38.12 11.98c0 2.1.55 4.1 1.52 5.86L0 24l6.3-1.6a12.02 12.02 0 0 0 5.76 1.46h.03c6.6 0 11.97-5.36 12-11.96a11.94 11.94 0  0 0-3.57-8.42zM12.09 21.3h-.02a9.9 9.9 0  0 1-5.04-1.38l-.36-.2-3.74.95.99-3.64-.24-.38a9.36 9.36 0  0 1-1.45-4.96c-.02-5.16 4.18-9.38 9.34-9.4 2.5 0 4.86.98 6.64 2.77a9.32 9.32 0  0 1 2.75 6.65c-.02 5.16-4.22 9.39-9.37 9.39zm5.35-7.26c-.29-.15-1.72-.84-1.99-.94-.27-.1-.46-.15-.66.15-.2.29-.76.94-.92 1.12-.17.19-.34.22-.62.08-.29-.15-1.2-.44-2.28-1.41-1.68-1.5-1.92-2.33-2.14-2.62-.23-.29-.02-.45.13-.6.13-.13.3-.33.45-.5.15-.17.2-.29.3-.49.1-.2.05-.37-.02-.52-.07-.15-.66-1.55-.9-2.12-.24-.57-.48-.49-.66-.49-.17 0-.37-.02-.57-.02-.2 0-.52.08-.8.37-.27.29-1.03 1.01-1.03 2.47 0 1.45 1.06 2.86 1.21 3.06.15.2 2.08 3.16 5.04 4.43.71.31 1.26.48 1.69.62.71.22 1.34.2 1.85.12.57-.09 1.73-.7 1.98-1.39.25-.69.25-1.27.17-1.39-.07-.12-.27-.19-.55-.33z" />
                  </svg>
                  <span className="hidden xl:inline">{t("nav.chat_whatsapp") || "WhatsApp"}</span>
                  <span className="xl:hidden">Chat</span>
                </a>
              </div>
            </div>

            {/* Mobile Menu Toggle & Location */}
            <div className="flex items-center gap-2 lg:hidden">
              <div className="relative z-50 scale-90">
                <LocationSelector />
              </div>
              <CartIcon />
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

              <div className="mobile-contact pt-8 border-t border-gray-100" style={{ opacity: 0 }}>
                <p className="text-sm text-gray-500 mb-4 uppercase tracking-wider font-semibold">Contact Us</p>
                <a
                  href="https://wa.me/918107115116"
                  target="_blank"
                  rel="noreferrer"
                  className="flex w-full items-center justify-center gap-2 bg-[#25D366] text-white p-4 rounded-xl font-semibold shadow-lg hover:bg-[#128C7E] transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="h-6 w-6 fill-white"
                  >
                    <path d="M20.52 3.48A11.94 11.94 0 0 0 12.06 0C5.46.03.1 5.38.12 11.98c0 2.1.55 4.1 1.52 5.86L0 24l6.3-1.6a12.02 12.02 0 0 0 5.76 1.46h.03c6.6 0 11.97-5.36 12-11.96a11.94 11.94 0  0 0-3.57-8.42zM12.09 21.3h-.02a9.9 9.9 0  0 1-5.04-1.38l-.36-.2-3.74.95.99-3.64-.24-.38a9.36 9.36 0  0 1-1.45-4.96c-.02-5.16 4.18-9.38 9.34-9.4 2.5 0 4.86.98 6.64 2.77a9.32 9.32 0  0 1 2.75 6.65c-.02 5.16-4.22 9.39-9.37 9.39zm5.35-7.26c-.29-.15-1.72-.84-1.99-.94-.27-.1-.46-.15-.66.15-.2.29-.76.94-.92 1.12-.17.19-.34.22-.62.08-.29-.15-1.2-.44-2.28-1.41-1.68-1.5-1.92-2.33-2.14-2.62-.23-.29-.02-.45.13-.6.13-.13.3-.33.45-.5.15-.17.2-.29.3-.49.1-.2.05-.37-.02-.52-.07-.15-.66-1.55-.9-2.12-.24-.57-.48-.49-.66-.49-.17 0-.37-.02-.57-.02-.2 0-.52.08-.8.37-.27.29-1.03 1.01-1.03 2.47 0 1.45 1.06 2.86 1.21 3.06.15.2 2.08 3.16 5.04 4.43.71.31 1.26.48 1.69.62.71.22 1.34.2 1.85.12.57-.09 1.73-.7 1.98-1.39.25-.69.25-1.27.17-1.39-.07-.12-.27-.19-.55-.33z" />
                  </svg>
                  {t('nav.chat_whatsapp') || "Chat on WhatsApp"}
                </a>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default memo(Header);