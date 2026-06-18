import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, Heart, Mail, Menu, Phone, Search, X } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { CartMenu } from "../CartMenu";
import { LocationSelector } from "../LocationSelector";
import { productService, Product } from "../../services/productService";
import { useWishlist } from "../../contexts/WishlistContext";
import { fetchNavbarConfig, NavCategoryConfig } from "../../services/navbarService";

const Header = () => {
  const [isBottomNavVisible, setIsBottomNavVisible] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isDesktopDropdownOpen, setIsDesktopDropdownOpen] = useState(false);
  const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileFurnitureOpen, setIsMobileFurnitureOpen] = useState(false);
  const [isMobileHandicraftOpen, setIsMobileHandicraftOpen] = useState(false);
  const [isMobileLeatherOpen, setIsMobileLeatherOpen] = useState(false);
  const [isMobileSemiPreciousStoneOpen, setIsMobileSemiPreciousStoneOpen] = useState(false);
  const [isFurnitureMegaOpen, setIsFurnitureMegaOpen] = useState(false);
  const [isHandicraftMegaOpen, setIsHandicraftMegaOpen] = useState(false);
  const [isLeatherMegaOpen, setIsLeatherMegaOpen] = useState(false);
  const [isSemiPreciousStoneMegaOpen, setIsSemiPreciousStoneMegaOpen] = useState(false);
  const isFurnitureMegaHoveredRef = useRef(false);
  const isHandicraftMegaHoveredRef = useRef(false);
  const isLeatherMegaHoveredRef = useRef(false);
  const isSemiPreciousStoneHoveredRef = useRef(false);
  const lastScrollYRef = useRef(0);
  const furnitureMegaOpenTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const furnitureMegaCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handcraftedMegaOpenTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handcraftedMegaCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const leatherMegaOpenTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const leatherMegaCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const semiPreciousStoneMegaOpenTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const semiPreciousStoneMegaCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const desktopSearchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const [navbarConfigs, setNavbarConfigs] = useState<Record<string, NavCategoryConfig>>({});

  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const { count: wishlistCount } = useWishlist();

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsMobileFurnitureOpen(false);
    setIsMobileHandicraftOpen(false);
    setIsMobileLeatherOpen(false);
    setIsMobileSemiPreciousStoneOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const loadNavConfig = async () => {
      try {
        const data = await fetchNavbarConfig();
        setNavbarConfigs(data);
      } catch {}
    };
    loadNavConfig();
    (window as any).refreshNavCategories = loadNavConfig;
    return () => { delete (window as any).refreshNavCategories; };
  }, []);

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
        setIsFurnitureMegaOpen(false);
        setIsHandicraftMegaOpen(false);
        setIsLeatherMegaOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (furnitureMegaOpenTimerRef.current) {
        clearTimeout(furnitureMegaOpenTimerRef.current);
      }
      if (furnitureMegaCloseTimerRef.current) {
        clearTimeout(furnitureMegaCloseTimerRef.current);
      }
      if (handcraftedMegaOpenTimerRef.current) {
        clearTimeout(handcraftedMegaOpenTimerRef.current);
      }
      if (handcraftedMegaCloseTimerRef.current) {
        clearTimeout(handcraftedMegaCloseTimerRef.current);
      }
      if (leatherMegaOpenTimerRef.current) {
        clearTimeout(leatherMegaOpenTimerRef.current);
      }
      if (leatherMegaCloseTimerRef.current) {
        clearTimeout(leatherMegaCloseTimerRef.current);
      }
      if (semiPreciousStoneMegaOpenTimerRef.current) {
        clearTimeout(semiPreciousStoneMegaOpenTimerRef.current);
      }
      if (semiPreciousStoneMegaCloseTimerRef.current) {
        clearTimeout(semiPreciousStoneMegaCloseTimerRef.current);
      }
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
    navigate(`/product/${id}`);
  };

  const navItems = [
    { label: 'Home', mobileLabel: 'Home', href: '/', active: true },
    { label: 'Marble Furniture', mobileLabel: 'Marble Furniture', href: '/products/furniture', megaMenuType: 'furniture' },
    { label: 'Handcrafted Furniture', mobileLabel: 'Handcrafted Furniture', href: '/products/handcrafted', megaMenuType: 'handcrafted' },
    { label: 'Leather Furniture', mobileLabel: 'Leather Furniture', href: '/products/leather', megaMenuType: 'leather' },
    { label: 'Semi Precious Stone', mobileLabel: 'Semi Precious Stone', href: '/products/semi-precious-stone', megaMenuType: 'semi-precious-stone' },
    { label: 'Gallery', mobileLabel: 'Gallery', href: '/gallery' },
    { label: 'Shipping', mobileLabel: 'Shipping', href: '/shipping' },
    { label: 'Journal', mobileLabel: 'Journal', href: '/blog' },
    { label: 'Custom Bulk Order', mobileLabel: 'Custom Bulk Order', href: '/contact', isSale: true },
  ];

  const furnitureMegaItems = [
    { label: 'All in Marble Furniture', href: '/products/furniture' },
    { label: 'bathtub', href: '/products/furniture/bathtub' },
    { label: 'bowl', href: '/products/furniture/bowl' },
    { label: 'center table', href: '/products/furniture/center-table' },
    { label: 'chaise chair', href: '/products/furniture/chaise-chair' },
    { label: 'clock', href: '/products/furniture/clock' },
    { label: 'coffee table', href: '/products/furniture/coffee-table' },
    { label: 'console table', href: '/products/furniture/console-table' },
    { label: 'dining table', href: '/products/furniture/dining-table' },
    { label: 'lamp', href: '/products/furniture/lamp' },
    { label: 'mirror frame', href: '/products/furniture/mirror-frame' },
    { label: 'pedestal sink', href: '/products/furniture/pedestal-sink' },
    { label: 'side table', href: '/products/furniture/side-table' },
    { label: 'sink', href: '/products/furniture/sink' },
    { label: 'tree sculpture', href: '/products/furniture/tree-sculpture' },
    { label: 'vase', href: '/products/furniture/vase' },
  ];

  const furnitureMegaGroups = useMemo(() => {
    const cfg = navbarConfigs['furniture'];
    if (cfg?.sections?.length) {
      return cfg.sections.map((sec) => ({
        title: sec.title,
        items: sec.items.map((it) => ({ label: it.label, href: `/products/furniture/${it.slug}` })),
      }));
    }
    return [
      {
        title: 'Tables & Seating',
        items: furnitureMegaItems.filter((item) => ['center table', 'coffee table', 'console table', 'dining table', 'side table', 'chaise chair'].includes(item.label)),
      },
      {
        title: 'Bath & Basins',
        items: furnitureMegaItems.filter((item) => ['bathtub', 'pedestal sink', 'sink'].includes(item.label)),
      },
      {
        title: 'Decor & Lighting',
        items: furnitureMegaItems.filter((item) => ['bowl', 'clock', 'lamp', 'mirror frame', 'tree sculpture', 'vase'].includes(item.label)),
      },
    ];
  }, [navbarConfigs]);

  const handcraftedMegaItems = [
    { label: 'All Handcrafted', href: '/products/handcrafted' },
    { label: 'coffee table', href: '/products/handcrafted/coffee-table' },
    { label: 'console table', href: '/products/handcrafted/console-table' },
    { label: 'dining table', href: '/products/handcrafted/dining-table' },
    { label: 'side table', href: '/products/handcrafted/side-table' },
    { label: 'sofa', href: '/products/handcrafted/sofa' },
  ];

  const handcraftedMegaGroups = useMemo(() => {
    const cfg = navbarConfigs['handcrafted'];
    if (cfg?.sections?.length) {
      return cfg.sections.map((sec) => ({
        title: sec.title,
        items: sec.items.map((it) => ({ label: it.label, href: `/products/handcrafted/${it.slug}` })),
      }));
    }
    return [
      {
        title: 'Handcrafted Tables',
        items: handcraftedMegaItems.filter((item) => ['coffee table', 'console table', 'dining table', 'side table'].includes(item.label)),
      },
      {
        title: 'Handcrafted Seating',
        items: handcraftedMegaItems.filter((item) => ['sofa'].includes(item.label)),
      },
    ];
  }, [navbarConfigs]);

  const leatherMegaItems = [
    { label: 'All Leather', href: '/products/leather' },
    { label: 'sofa', href: '/products/leather/sofa' },
    { label: 'armchair', href: '/products/leather/armchair' },
    { label: 'ottoman', href: '/products/leather/ottoman' },
    { label: 'bench', href: '/products/leather/bench' },
    { label: 'bed', href: '/products/leather/bed' },
    { label: 'side table', href: '/products/leather/side-table' },
    { label: 'coffee table', href: '/products/leather/coffee-table' },
    { label: 'console table', href: '/products/leather/console-table' },
    { label: 'dresser', href: '/products/leather/dresser' },
    { label: 'mirror', href: '/products/leather/mirror' },
    { label: 'storage', href: '/products/leather/storage' },
  ];

  const leatherMegaGroups = useMemo(() => {
    const cfg = navbarConfigs['leather'];
    if (cfg?.sections?.length) {
      return cfg.sections.map((sec) => ({
        title: sec.title,
        items: sec.items.map((it) => ({ label: it.label, href: `/products/leather/${it.slug}` })),
      }));
    }
    return [
      {
        title: 'Seating',
        items: leatherMegaItems.filter((item) => ['sofa', 'armchair', 'ottoman', 'bench'].includes(item.label)),
      },
      {
        title: 'Beds & Tables',
        items: leatherMegaItems.filter((item) => ['bed', 'side table', 'coffee table', 'console table'].includes(item.label)),
      },
      {
        title: 'Storage & Decor',
        items: leatherMegaItems.filter((item) => ['dresser', 'mirror', 'storage'].includes(item.label)),
      },
    ];
  }, [navbarConfigs]);

  const semiPreciousStoneMegaItems = [
    { label: 'All Semi Precious Stones', href: '/products/semi-precious-stone' },
  ];

  const semiPreciousStoneMegaGroups = useMemo(() => {
    const cfg = navbarConfigs['semi-precious-stone'];
    if (cfg?.sections?.length) {
      return cfg.sections.map((sec) => ({
        title: sec.title,
        items: sec.items.map((it) => ({ label: it.label, href: `/products/semi-precious-stone/${it.slug}` })),
      }));
    }
    const staticItems = semiPreciousStoneMegaItems.filter((item) => item.label !== 'All Semi Precious Stones');
    if (staticItems.length === 0) return [];
    return [{ title: 'Collections', items: staticItems }];
  }, [navbarConfigs]);

  const openFurnitureMega = () => {
    if (furnitureMegaCloseTimerRef.current) {
      clearTimeout(furnitureMegaCloseTimerRef.current);
      furnitureMegaCloseTimerRef.current = null;
    }
    if (furnitureMegaOpenTimerRef.current) {
      clearTimeout(furnitureMegaOpenTimerRef.current);
    }
    furnitureMegaOpenTimerRef.current = setTimeout(() => {
      setIsFurnitureMegaOpen(true);
      setIsHandicraftMegaOpen(false);
      setIsLeatherMegaOpen(false);
      furnitureMegaOpenTimerRef.current = null;
    }, 80);
  };

  const closeFurnitureMega = () => {
    if (furnitureMegaOpenTimerRef.current) {
      clearTimeout(furnitureMegaOpenTimerRef.current);
      furnitureMegaOpenTimerRef.current = null;
    }
    if (furnitureMegaCloseTimerRef.current) {
      clearTimeout(furnitureMegaCloseTimerRef.current);
    }
    furnitureMegaCloseTimerRef.current = setTimeout(() => {
      if (!isFurnitureMegaHoveredRef.current) {
        setIsFurnitureMegaOpen(false);
      }
      furnitureMegaCloseTimerRef.current = null;
    }, 280);
  };

  const openHandcraftedMega = () => {
    if (handcraftedMegaCloseTimerRef.current) {
      clearTimeout(handcraftedMegaCloseTimerRef.current);
      handcraftedMegaCloseTimerRef.current = null;
    }
    if (handcraftedMegaOpenTimerRef.current) {
      clearTimeout(handcraftedMegaOpenTimerRef.current);
    }
    handcraftedMegaOpenTimerRef.current = setTimeout(() => {
      setIsHandicraftMegaOpen(true);
      setIsFurnitureMegaOpen(false);
      setIsLeatherMegaOpen(false);
      handcraftedMegaOpenTimerRef.current = null;
    }, 80);
  };

  const closeHandcraftedMega = () => {
    if (handcraftedMegaOpenTimerRef.current) {
      clearTimeout(handcraftedMegaOpenTimerRef.current);
      handcraftedMegaOpenTimerRef.current = null;
    }
    if (handcraftedMegaCloseTimerRef.current) {
      clearTimeout(handcraftedMegaCloseTimerRef.current);
    }
    handcraftedMegaCloseTimerRef.current = setTimeout(() => {
      if (!isHandicraftMegaHoveredRef.current) {
        setIsHandicraftMegaOpen(false);
      }
      handcraftedMegaCloseTimerRef.current = null;
    }, 280);
  };

  const openLeatherMega = () => {
    if (leatherMegaCloseTimerRef.current) {
      clearTimeout(leatherMegaCloseTimerRef.current);
      leatherMegaCloseTimerRef.current = null;
    }
    if (leatherMegaOpenTimerRef.current) {
      clearTimeout(leatherMegaOpenTimerRef.current);
    }
    leatherMegaOpenTimerRef.current = setTimeout(() => {
      setIsLeatherMegaOpen(true);
      setIsFurnitureMegaOpen(false);
      setIsHandicraftMegaOpen(false);
      leatherMegaOpenTimerRef.current = null;
    }, 80);
  };

  const closeLeatherMega = () => {
    if (leatherMegaOpenTimerRef.current) {
      clearTimeout(leatherMegaOpenTimerRef.current);
      leatherMegaOpenTimerRef.current = null;
    }
    if (leatherMegaCloseTimerRef.current) {
      clearTimeout(leatherMegaCloseTimerRef.current);
    }
    leatherMegaCloseTimerRef.current = setTimeout(() => {
      if (!isLeatherMegaHoveredRef.current) {
        setIsLeatherMegaOpen(false);
      }
      leatherMegaCloseTimerRef.current = null;
    }, 280);
  };

  const openSemiPreciousStoneMega = () => {
    if (semiPreciousStoneMegaCloseTimerRef.current) {
      clearTimeout(semiPreciousStoneMegaCloseTimerRef.current);
      semiPreciousStoneMegaCloseTimerRef.current = null;
    }
    if (semiPreciousStoneMegaOpenTimerRef.current) {
      clearTimeout(semiPreciousStoneMegaOpenTimerRef.current);
    }
    semiPreciousStoneMegaOpenTimerRef.current = setTimeout(() => {
      setIsSemiPreciousStoneMegaOpen(true);
      setIsFurnitureMegaOpen(false);
      setIsHandicraftMegaOpen(false);
      setIsLeatherMegaOpen(false);
      semiPreciousStoneMegaOpenTimerRef.current = null;
    }, 80);
  };

  const closeSemiPreciousStoneMega = () => {
    if (semiPreciousStoneMegaOpenTimerRef.current) {
      clearTimeout(semiPreciousStoneMegaOpenTimerRef.current);
      semiPreciousStoneMegaOpenTimerRef.current = null;
    }
    if (semiPreciousStoneMegaCloseTimerRef.current) {
      clearTimeout(semiPreciousStoneMegaCloseTimerRef.current);
    }
    semiPreciousStoneMegaCloseTimerRef.current = setTimeout(() => {
      if (!isSemiPreciousStoneHoveredRef.current) {
        setIsSemiPreciousStoneMegaOpen(false);
      }
      semiPreciousStoneMegaCloseTimerRef.current = null;
    }, 280);
  };

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
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#e5e7eb] rounded-2xl shadow-[0_14px_36px_rgba(0,0,0,0.14)] max-h-[420px] overflow-y-auto z-[80]">
                <div className="px-4 py-2.5 border-b border-[#eef2f7] text-[11px] uppercase tracking-[0.12em] text-[#64748b]">
                  Search Results
                </div>
                {isSearching && (
                  <div className="px-4 py-3 text-sm text-[#6b7280]">Searching...</div>
                )}

                {!isSearching && searchResults.map((product) => (
                  <button
                    key={product.productId || product._id}
                    type="button"
                    onClick={() => handleSelectProduct(product)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#f8fafc] transition-colors"
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
                className="itsbits-top-action ml-2 hidden md:inline-flex items-center justify-center rounded-md bg-[#111827] px-3 py-2 text-[11px] uppercase tracking-[0.1em] font-semibold text-white no-underline transition-colors duration-200 hover:bg-[#1f2937]"
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
              <CartMenu />
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
              <a
                href="/"
                className="itsbits-logo inline-block text-black no-underline transition-all duration-300 hover:text-black"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="HS Global Logo"
              >
                <span className="block text-[11px] font-semibold uppercase tracking-[0.11em] leading-[1.2] text-[#111]">
                  HS GLOBAL EXPORT
                </span>
              </a>

              <div className="flex items-center gap-2">
                {isAuthenticated ? (
                  <Link
                    to="/profile"
                    className="inline-flex items-center justify-center rounded-md bg-[#111827] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-white no-underline transition-colors duration-200 hover:bg-[#1f2937]"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    My Account
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center rounded-md bg-[#111827] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-white no-underline transition-colors duration-200 hover:bg-[#1f2937]"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                )}

                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="itsbits-top-action inline-flex items-center justify-center text-black"
                >
                  <X width="19" height="19" />
                </button>
              </div>
            </div>

            <nav className="py-1">
              {navItems.map((item) => (
                item.href === '/contact' ? (
                  <Link
                    key="mobile-menu-contact-us"
                    to="/contact"
                    className="mx-5 my-4 block rounded-md bg-[#111827] px-5 py-3 text-center text-[15px] font-semibold uppercase tracking-[0.08em] text-white no-underline transition-colors hover:bg-[#1f2937]"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Contact Us
                  </Link>
                ) : item.megaMenuType ? (
                  <div key={`mobile-menu-${item.megaMenuType}`} className="border-b border-[#ececec]">
                    <button
                      type="button"
                      className="w-full px-5 py-4 text-[17px] leading-[1.25] text-[#111] font-light flex items-center justify-between"
                      aria-expanded={item.megaMenuType === 'furniture' ? isMobileFurnitureOpen : item.megaMenuType === 'handcrafted' ? isMobileHandicraftOpen : item.megaMenuType === 'leather' ? isMobileLeatherOpen : isMobileSemiPreciousStoneOpen}
                      aria-controls={`mobile-${item.megaMenuType}-submenu`}
                      onClick={() => {
                        if (item.megaMenuType === 'furniture') setIsMobileFurnitureOpen(prev => !prev);
                        else if (item.megaMenuType === 'handcrafted') setIsMobileHandicraftOpen(prev => !prev);
                        else if (item.megaMenuType === 'leather') setIsMobileLeatherOpen(prev => !prev);
                        else if (item.megaMenuType === 'semi-precious-stone') setIsMobileSemiPreciousStoneOpen(prev => !prev);
                      }}
                    >
                      <span>{item.label}</span>
                      <ChevronDown
                        width="18"
                        height="18"
                        className={`transition-transform duration-200 ${(item.megaMenuType === 'furniture' ? isMobileFurnitureOpen : item.megaMenuType === 'handcrafted' ? isMobileHandicraftOpen : item.megaMenuType === 'leather' ? isMobileLeatherOpen : isMobileSemiPreciousStoneOpen) ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {(item.megaMenuType === 'furniture' ? isMobileFurnitureOpen : item.megaMenuType === 'handcrafted' ? isMobileHandicraftOpen : item.megaMenuType === 'leather' ? isMobileLeatherOpen : isMobileSemiPreciousStoneOpen) && (
                      <div
                        id={`mobile-${item.megaMenuType}-submenu`}
                        className="px-5 pb-4 space-y-4 bg-[#fafafa] border-t border-[#f1f1f1]"
                      >
                        <a
                          href={item.href}
                          style={{ fontSize: '11px', letterSpacing: '0.1em', fontWeight: 500 }}
                          className="inline-block mt-1 rounded-md border border-[#111827] bg-[#111827] px-3 py-2 uppercase text-white no-underline"
                          onClick={() => {
                            if (item.megaMenuType === 'furniture') setIsMobileFurnitureOpen(false);
                            else if (item.megaMenuType === 'handcrafted') setIsMobileHandicraftOpen(false);
                            else if (item.megaMenuType === 'leather') setIsMobileLeatherOpen(false);
                            else if (item.megaMenuType === 'semi-precious-stone') setIsMobileSemiPreciousStoneOpen(false);
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          View All {item.label}
                        </a>

                        {(item.megaMenuType === 'furniture' ? furnitureMegaGroups : item.megaMenuType === 'handcrafted' ? handcraftedMegaGroups : item.megaMenuType === 'leather' ? leatherMegaGroups : semiPreciousStoneMegaGroups).map((group) => (
                          <div key={`mobile-group-${group.title}`} className="space-y-1.5">
                            <p style={{ fontSize: '9px', letterSpacing: '0.2em', fontWeight: 400 }} className="uppercase text-[#b4c0cc]">{group.title}</p>
                            <div className="space-y-0.5">
                              {group.items.map((megaItem) => (
                                <a
                                  key={`mobile-${megaItem.label}`}
                                  href={megaItem.href}
                                  style={{ fontSize: '14px', fontWeight: 300, letterSpacing: '0.01em' }}
                                  className="block rounded-md px-2 py-2 leading-[1.35] text-[#1f2937] no-underline capitalize"
                                  onClick={() => {
                                    if (item.megaMenuType === 'furniture') setIsMobileFurnitureOpen(false);
                                    else if (item.megaMenuType === 'handcrafted') setIsMobileHandicraftOpen(false);
                                    else if (item.megaMenuType === 'leather') setIsMobileLeatherOpen(false);
                                    else if (item.megaMenuType === 'semi-precious-stone') setIsMobileSemiPreciousStoneOpen(false);
                                    setIsMobileMenuOpen(false);
                                  }}
                                >
                                  {megaItem.label}
                                </a>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <a
                    key={`mobile-menu-${item.label}`}
                    href={item.href}
                    className="block border-b border-[#ececec] px-5 py-4 text-[17px] leading-[1.25] text-[#111] font-light"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </a>
                )
              ))}
            </nav>

            <div className="border-t border-[#ececec] pt-2">
              <div className="px-5 py-4 border-b border-[#ececec] bg-[#fafafa]">
                <p className="text-[10px] uppercase tracking-[0.12em] text-[#64748b] mb-3">Quick Contact</p>
                <div className="space-y-2.5">
                  <a
                    href="tel:+918107115116"
                    className="inline-flex items-center gap-2 text-[14px] text-[#1f2937] no-underline"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Phone width="15" height="15" className="text-[#475569]" />
                    <span>+91 81071 15116</span>
                  </a>
                  <a
                    href="mailto:inquiry@hsglobalexport.com"
                    className="inline-flex items-center gap-2 text-[14px] text-[#1f2937] no-underline"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Mail width="15" height="15" className="text-[#475569]" />
                    <span>inquiry@hsglobalexport.com</span>
                  </a>
                </div>
              </div>

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
        className={`itsbits-bottom-nav bg-white hidden md:flex justify-center relative overflow-visible ${isBottomNavVisible ? 'is-visible' : 'is-hidden'}`}
        style={{ overflow: 'visible' }}
      >
        <nav
          className="flex items-center itsbits-header-inner itsbits-nav-inner relative overflow-visible"
          style={{ overflow: 'visible' }}
          onMouseLeave={closeFurnitureMega}
        >
          <ul className="flex m-0 p-0 list-none justify-center w-full itsbits-nav-list overflow-visible">
            {navItems.map((item) => (
              <li
                key={item.label}
                className="relative"
                onMouseEnter={() => {
                  if (item.megaMenuType === 'furniture') openFurnitureMega();
                  else if (item.megaMenuType === 'handcrafted') openHandcraftedMega();
                  else if (item.megaMenuType === 'leather') openLeatherMega();
                  else if (item.megaMenuType === 'semi-precious-stone') openSemiPreciousStoneMega();
                }}
                onMouseLeave={() => {
                  if (item.megaMenuType === 'furniture') closeFurnitureMega();
                  else if (item.megaMenuType === 'handcrafted') closeHandcraftedMega();
                  else if (item.megaMenuType === 'leather') closeLeatherMega();
                  else if (item.megaMenuType === 'semi-precious-stone') closeSemiPreciousStoneMega();
                }}
              >
                <a
                  href={item.href}
                  className={`itsbits-nav-link inline-block relative no-underline cursor-pointer ${item.active ? 'is-active' : ''} ${item.isSale ? 'itsbits-nav-link-cta' : ''}`}
                  onClick={(event) => {
                    if (!item.megaMenuType) return;
                    event.preventDefault();
                    event.stopPropagation();
                    if (item.megaMenuType === 'furniture') setIsFurnitureMegaOpen((prev) => !prev);
                    else if (item.megaMenuType === 'handcrafted') setIsHandicraftMegaOpen((prev) => !prev);
                    else if (item.megaMenuType === 'leather') setIsLeatherMegaOpen((prev) => !prev);
                    else if (item.megaMenuType === 'semi-precious-stone') setIsSemiPreciousStoneMegaOpen((prev) => !prev);
                  }}
                  onFocus={() => {
                    if (item.megaMenuType === 'furniture') setIsFurnitureMegaOpen(true);
                    else if (item.megaMenuType === 'handcrafted') setIsHandicraftMegaOpen(true);
                    else if (item.megaMenuType === 'leather') setIsLeatherMegaOpen(true);
                    else if (item.megaMenuType === 'semi-precious-stone') setIsSemiPreciousStoneMegaOpen(true);
                  }}
                  style={{
                    color: item.isSale ? '#fff' : '#000',
                    fontWeight: item.active || item.isSale ? 600 : 300,
                  }}
                >
                  <span className="itsbits-nav-label-desktop">{item.label}</span>
                  <span className="itsbits-nav-label-mobile">{item.mobileLabel || item.label}</span>
                  {item.megaMenuType && (
                    <span className={`ml-1 inline-block text-[10px] transition-transform ${(item.megaMenuType === 'furniture' ? isFurnitureMegaOpen : item.megaMenuType === 'handcrafted' ? isHandicraftMegaOpen : item.megaMenuType === 'leather' ? isLeatherMegaOpen : isSemiPreciousStoneMegaOpen) ? 'rotate-180' : ''}`} aria-hidden="true">▼</span>
                  )}
                </a>
              </li>
            ))}
          </ul>

          {isFurnitureMegaOpen && (
            <div
              className="absolute left-1/2 -translate-x-1/2 top-full pt-1 z-[120]"
              onMouseEnter={() => {
                isFurnitureMegaHoveredRef.current = true;
                if (furnitureMegaCloseTimerRef.current) {
                  clearTimeout(furnitureMegaCloseTimerRef.current);
                  furnitureMegaCloseTimerRef.current = null;
                }
              }}
              onMouseLeave={() => {
                isFurnitureMegaHoveredRef.current = false;
                closeFurnitureMega();
              }}
            >
              <div className="w-[760px] bg-white border border-[#e5e7eb] shadow-[0_18px_46px_rgba(0,0,0,0.14)] rounded-2xl p-5">
                <div className="flex items-center justify-between border-b border-[#eef2f7] pb-3 mb-4">
                  <p style={{ fontSize: '10px', letterSpacing: '0.18em', fontWeight: 400 }} className="uppercase text-[#94a3b8]">Marble Furniture Collections</p>
                  <a
                    href="/products/furniture"
                    style={{ fontSize: '11px', letterSpacing: '0.1em', fontWeight: 500 }}
                    className="uppercase text-[#0f172a] hover:text-black no-underline transition-colors"
                    onClick={() => setIsFurnitureMegaOpen(false)}
                  >
                    View All →
                  </a>
                </div>
                <div className="grid grid-cols-3 gap-5">
                  {furnitureMegaGroups.map((group) => (
                    <div key={group.title} className="space-y-0.5">
                      <p style={{ fontSize: '9px', letterSpacing: '0.2em', fontWeight: 400 }} className="uppercase text-[#b4c0cc] px-2 pb-2">{group.title}</p>
                      {group.items.map((megaItem) => (
                        <a
                          key={megaItem.label}
                          href={megaItem.href}
                          style={{ fontSize: '13.5px', fontWeight: 300, letterSpacing: '0.01em' }}
                          className="block text-[#1f2937] hover:text-black hover:bg-[#f8fafc] rounded-md px-2 py-[7px] transition-colors capitalize no-underline leading-snug"
                          onClick={() => setIsFurnitureMegaOpen(false)}
                        >
                          {megaItem.label}
                        </a>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {isHandicraftMegaOpen && (
            <div
              className="absolute left-1/2 -translate-x-1/2 top-full pt-1 z-[120]"
              onMouseEnter={() => {
                isHandicraftMegaHoveredRef.current = true;
                if (handcraftedMegaCloseTimerRef.current) {
                  clearTimeout(handcraftedMegaCloseTimerRef.current);
                  handcraftedMegaCloseTimerRef.current = null;
                }
              }}
              onMouseLeave={() => {
                isHandicraftMegaHoveredRef.current = false;
                closeHandicraftMega();
              }}
            >
              <div className="w-[760px] bg-white border border-[#e5e7eb] shadow-[0_18px_46px_rgba(0,0,0,0.14)] rounded-2xl p-5">
                <div className="flex items-center justify-between border-b border-[#eef2f7] pb-3 mb-4">
                  <p style={{ fontSize: '10px', letterSpacing: '0.18em', fontWeight: 400 }} className="uppercase text-[#94a3b8]">Handcrafted Collections</p>
                  <a
                    href="/products/handcrafted"
                    style={{ fontSize: '11px', letterSpacing: '0.1em', fontWeight: 500 }}
                    className="uppercase text-[#0f172a] hover:text-black no-underline transition-colors"
                    onClick={() => setIsHandicraftMegaOpen(false)}
                  >
                    View All →
                  </a>
                </div>
                <div className="grid grid-cols-3 gap-5">
                  {handcraftedMegaGroups.map((group) => (
                    <div key={group.title} className="space-y-0.5">
                      <p style={{ fontSize: '9px', letterSpacing: '0.2em', fontWeight: 400 }} className="uppercase text-[#b4c0cc] px-2 pb-2">{group.title}</p>
                      {group.items.map((megaItem) => (
                        <a
                          key={megaItem.label}
                          href={megaItem.href}
                          style={{ fontSize: '13.5px', fontWeight: 300, letterSpacing: '0.01em' }}
                          className="block text-[#1f2937] hover:text-black hover:bg-[#f8fafc] rounded-md px-2 py-[7px] transition-colors capitalize no-underline leading-snug"
                          onClick={() => setIsHandicraftMegaOpen(false)}
                        >
                          {megaItem.label}
                        </a>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {isLeatherMegaOpen && (
            <div
              className="absolute left-1/2 -translate-x-1/2 top-full pt-1 z-[120]"
              onMouseEnter={() => {
                isLeatherMegaHoveredRef.current = true;
                if (leatherMegaCloseTimerRef.current) {
                  clearTimeout(leatherMegaCloseTimerRef.current);
                  leatherMegaCloseTimerRef.current = null;
                }
              }}
              onMouseLeave={() => {
                isLeatherMegaHoveredRef.current = false;
                closeLeatherMega();
              }}
            >
              <div className="w-[760px] bg-white border border-[#e5e7eb] shadow-[0_18px_46px_rgba(0,0,0,0.14)] rounded-2xl p-5">
                <div className="flex items-center justify-between border-b border-[#eef2f7] pb-3 mb-4">
                  <p style={{ fontSize: '10px', letterSpacing: '0.18em', fontWeight: 400 }} className="uppercase text-[#94a3b8]">Leather Collections</p>
                  <a
                    href="/products/leather"
                    style={{ fontSize: '11px', letterSpacing: '0.1em', fontWeight: 500 }}
                    className="uppercase text-[#0f172a] hover:text-black no-underline transition-colors"
                    onClick={() => setIsLeatherMegaOpen(false)}
                  >
                    View All →
                  </a>
                </div>
                <div className="grid grid-cols-3 gap-5">
                  {leatherMegaGroups.map((group) => (
                    <div key={group.title} className="space-y-0.5">
                      <p style={{ fontSize: '9px', letterSpacing: '0.2em', fontWeight: 400 }} className="uppercase text-[#b4c0cc] px-2 pb-2">{group.title}</p>
                      {group.items.map((megaItem) => (
                        <a
                          key={megaItem.label}
                          href={megaItem.href}
                          style={{ fontSize: '13.5px', fontWeight: 300, letterSpacing: '0.01em' }}
                          className="block text-[#1f2937] hover:text-black hover:bg-[#f8fafc] rounded-md px-2 py-[7px] transition-colors capitalize no-underline leading-snug"
                          onClick={() => setIsLeatherMegaOpen(false)}
                        >
                          {megaItem.label}
                        </a>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {isSemiPreciousStoneMegaOpen && (
            <div
              className="absolute left-1/2 -translate-x-1/2 top-full pt-1 z-[120]"
              onMouseEnter={() => {
                isSemiPreciousStoneHoveredRef.current = true;
                if (semiPreciousStoneMegaCloseTimerRef.current) {
                  clearTimeout(semiPreciousStoneMegaCloseTimerRef.current);
                  semiPreciousStoneMegaCloseTimerRef.current = null;
                }
              }}
              onMouseLeave={() => {
                isSemiPreciousStoneHoveredRef.current = false;
                closeSemiPreciousStoneMega();
              }}
            >
              <div className="w-[480px] bg-white border border-[#e5e7eb] shadow-[0_18px_46px_rgba(0,0,0,0.14)] rounded-2xl p-5">
                <div className="flex items-center justify-between border-b border-[#eef2f7] pb-3 mb-4">
                  <p style={{ fontSize: '10px', letterSpacing: '0.18em', fontWeight: 400 }} className="uppercase text-[#94a3b8]">Semi Precious Stone Collections</p>
                  <a
                    href="/products/semi-precious-stone"
                    style={{ fontSize: '11px', letterSpacing: '0.1em', fontWeight: 500 }}
                    className="uppercase text-[#0f172a] hover:text-black no-underline transition-colors"
                    onClick={() => setIsSemiPreciousStoneMegaOpen(false)}
                  >
                    View All →
                  </a>
                </div>
                {semiPreciousStoneMegaGroups.some(g => g.items.length > 0) ? (
                  <div className="grid grid-cols-2 gap-5">
                    {semiPreciousStoneMegaGroups.map((group) => (
                      <div key={group.title} className="space-y-0.5">
                        <p style={{ fontSize: '9px', letterSpacing: '0.2em', fontWeight: 400 }} className="uppercase text-[#b4c0cc] px-2 pb-2">{group.title}</p>
                        {group.items.map((megaItem) => (
                          <a
                            key={megaItem.label}
                            href={megaItem.href}
                            style={{ fontSize: '13.5px', fontWeight: 300, letterSpacing: '0.01em' }}
                            className="block text-[#1f2937] hover:text-black hover:bg-[#f8fafc] rounded-md px-2 py-[7px] transition-colors capitalize no-underline leading-snug"
                            onClick={() => setIsSemiPreciousStoneMegaOpen(false)}
                          >
                            {megaItem.label}
                          </a>
                        ))}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: '13px', fontWeight: 300 }} className="text-[#6b7280] px-1">Browse our full collection of semi precious stones.</p>
                )}
              </div>
            </div>
          )}
        </nav>
      </div>
      </header>
    </>
  );
};

export default Header;
