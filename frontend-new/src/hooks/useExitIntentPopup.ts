'use client';
import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { popupConfigService } from '../services/popupConfigService';

export const useExitIntentPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const hasShownRef = useRef(false);
  const location = useLocation();

  useEffect(() => {
    if (sessionStorage.getItem('exitIntentShown')) return;
    if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/checkout')) return;

    let cleanup: (() => void) | undefined;

    popupConfigService.getPublicConfig().then(config => {
      if (!config.exitIntent.enabled) return;
      if (sessionStorage.getItem('exitIntentShown')) return;

      const handleMouseLeave = (e: MouseEvent) => {
        // Only trigger if mouse leaves from the top of the viewport
        if (e.clientY <= 20 && !hasShownRef.current) {
          if (document.body.style.overflow === 'hidden') return;
          hasShownRef.current = true;
          sessionStorage.setItem('exitIntentShown', 'true');
          setIsOpen(true);
        }
      };

      // Delay attaching the event listener by 5 seconds
      // to prevent accidental triggers immediately upon page load
      const timerId = setTimeout(() => {
        document.addEventListener('mouseleave', handleMouseLeave);
      }, 5000);

      cleanup = () => {
        clearTimeout(timerId);
        document.removeEventListener('mouseleave', handleMouseLeave);
      };
    });

    return () => cleanup?.();
  }, [location.pathname]);

  return {
    isOpen,
    closeExitIntent: () => setIsOpen(false)
  };
};
