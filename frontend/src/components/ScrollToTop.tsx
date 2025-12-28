import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Get Lenis instance if it exists (attached to window by SmoothScroll component)
    const lenis = (window as any).lenis;

    if (lenis) {
      // Use Lenis scrollTo for smooth scroll library compatibility
      // immediate: true ensures instant scroll without animation
      lenis.scrollTo(0, { immediate: true });
    } else {
      // Fallback to native scroll if Lenis is not available
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }

    // Small delay to ensure DOM is ready
    setTimeout(() => {
      if (lenis) {
        lenis.scrollTo(0, { immediate: true });
      } else {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      }
    }, 0);
  }, [pathname]); // Only trigger on pathname change, not hash

  return null;
};

export default ScrollToTop;
