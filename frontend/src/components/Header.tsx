import { useState, useEffect, memo, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, User, Search } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useTranslation } from "react-i18next";
import { LocationSelector } from "./LocationSelector";
import { CartIcon } from "./CartIcon";
import { getResponsiveImage, getSrcSet } from "../utils/responsive-image-helper";
import { useAuth } from "../contexts/AuthContext";
import { SearchModal } from "./SearchModal";

const Header = () => {
  const { t } = useTranslation();
  const { isAuthenticated, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuRendered, setIsMenuRendered] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);


  const links = [
    { path: "/", label: t("nav.home") || "Home" },
    { path: "/about", label: t("nav.about") || "Atelier" }, // Renamed for luxury feel
    { path: "/products", label: t("nav.products") || "Collection" },
    { path: "/gallery", label: t("nav.gallery") || "Projects" },
    { path: "/blog", label: t("nav.blog") || "Blog" },
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
          const currentScrollY = window.scrollY;
          
          // Update scroll state for styling
          setIsScrolled(currentScrollY > 50);
          
          // Hide/show navbar based on scroll direction
          if (currentScrollY < 10) {
            // Always show at top
            setIsVisible(true);
          } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
            // Scrolling down - hide navbar
            setIsVisible(false);
          } else if (currentScrollY < lastScrollY) {
            // Scrolling up - show navbar
            setIsVisible(true);
          }
          
          setLastScrollY(currentScrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

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
        { height: "100vh", opacity: 1, duration: 0.6, ease: "power3.out" }
      );

      tl.fromTo(".mobile-nav-link",
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.1, duration: 0.5, ease: "power2.out" },
        "-=0.3"
      );

    } else if (!isOpen && isMenuRendered && menuRef.current) {
      // Exit animation
      const tl = gsap.timeline({
        onComplete: () => setIsMenuRendered(false)
      });

      tl.to(".mobile-nav-link", { opacity: 0, y: -20, duration: 0.2 });

      tl.to(menuRef.current,
        { height: 0, opacity: 0, duration: 0.4, ease: "power3.in" }
      );
    }
  }, [isOpen, isMenuRendered]);



  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    if (path === "/products" && location.pathname.includes("product")) return true;
    if (path === "/gallery" && location.pathname.includes("gallery")) return true;
    return location.pathname === path;
  };

  const isHome = location.pathname === "/";
  // Transparent only on home when not scrolled
  const isTransparent = isHome && !isScrolled;

  return (
    <>
      <header
        ref={containerRef}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${
          isScrolled
            ? "bg-white/80 backdrop-blur-xl border-b border-stone-100 py-3"
            : "bg-transparent border-transparent py-6"
        } ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="container mx-auto px-6 md:px-12">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0 group relative z-50">
              <img
                src={getResponsiveImage("logo.webp", "mobile") || "/logo.png"}
                srcSet={getSrcSet("logo.webp")}
                alt="HS Global Export"
                className={`transition-all duration-300 object-contain ${isScrolled ? "h-10 w-auto opacity-100" : "h-12 w-auto opacity-90 hover:opacity-100"
                  } ${isTransparent ? "brightness-0 invert" : ""}`}
                loading="eager"
              />
            </Link>

            {/* Desktop Navigation - Minimalist */}
            <nav
              className={`hidden lg:flex items-center gap-8 xl:gap-12 transition-all duration-500`}
            >
              {links.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm tracking-widest uppercase font-medium relative group ${isActive(link.path)
                    ? isTransparent
                      ? "text-white"
                      : "text-black"
                    : isTransparent
                      ? "text-white/70 hover:text-white"
                      : "text-stone-500 hover:text-black"
                    }`}
                >
                  {link.label}
                  <span className={`absolute -bottom-2 left-0 w-0 h-[1px] transition-all duration-300 group-hover:w-full ${isTransparent ? "bg-white" : "bg-black"}`} />
                </Link>
              ))}
            </nav>

            {/* Right Actions - Icons */}
            <div className={`hidden lg:flex items-center gap-6 transition-colors duration-300 ${isTransparent ? "text-white" : "text-black"}`}>
              <Link
                to="/admin"
                className="text-xs uppercase tracking-widest font-bold hover:opacity-70 transition-opacity"
              >
                Admin
              </Link>

              <button
                onClick={() => setIsSearchOpen(true)}
                className="hover:opacity-70 transition-opacity"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              <div className="w-[1px] h-4 bg-current opacity-20" />

              {/* Auth/User */}
              {isAuthenticated && user ? (
                <Link to="/profile" className="hover:opacity-70 transition-opacity">
                  <User className="w-5 h-5" />
                </Link>
              ) : (
                <Link to="/login" className="text-xs uppercase tracking-widest font-bold hover:opacity-70 transition-opacity">
                  Login
                </Link>
              )}

              <div className="relative">
                <CartIcon />
              </div>

              <div className="hidden xl:block">
                <LocationSelector />
              </div>
            </div>

            {/* Mobile Menu Toggle */}
            <div className="flex items-center gap-4 lg:hidden">
              <CartIcon />
              <button
                onClick={() => {
                  setIsOpen(!isOpen);
                  // Ensure navbar is visible when opening mobile menu
                  if (!isOpen) {
                    setIsVisible(true);
                  }
                }}
                className={`p-1 z-50 transition-colors ${isTransparent ? "text-white" : "text-black"}`}
                aria-label="Toggle menu"
              >
                {isOpen ? (
                  <span className="text-xs font-bold uppercase tracking-widest">Close</span>
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Full Screen Mobile Menu - Editorial Style */}
        {isMenuRendered && (
          <div
            ref={menuRef}
            className="lg:hidden fixed inset-0 top-0 bg-[#0A0A0A] text-white z-40 flex flex-col justify-center px-8"
            style={{ height: 0, opacity: 0 }}
          >
            {/* Background branding or texture could go here */}
            <div className="flex flex-col space-y-6">
              {links.map((link) => (
                <div key={link.path} className="mobile-nav-link" style={{ opacity: 0 }}>
                  <Link
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`block font-serif text-4xl md:text-5xl font-light hover:italic transition-all ${location.pathname === link.path ? "text-white italic" : "text-stone-400"}`}
                  >
                    {link.label}
                  </Link>
                </div>
              ))}

              <div className="w-12 h-[1px] bg-white/20 my-8 mobile-nav-link" />

              <div className="mobile-nav-link space-y-4" style={{ opacity: 0 }}>
                <Link to="/login" onClick={() => setIsOpen(false)} className="block text-sm uppercase tracking-widest text-stone-400 hover:text-white">Account</Link>
                <Link to="/contact" onClick={() => setIsOpen(false)} className="block text-sm uppercase tracking-widest text-stone-400 hover:text-white">Contact</Link>
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
