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
        if (e.clientY <= 8 && !hasShownRef.current) {
          hasShownRef.current = true;
          sessionStorage.setItem('exitIntentShown', 'true');
          setIsOpen(true);
        }
      };

      document.addEventListener('mouseleave', handleMouseLeave);
      cleanup = () => document.removeEventListener('mouseleave', handleMouseLeave);
    });

    return () => cleanup?.();
  }, [location.pathname]);

  return {
    isOpen,
    closeExitIntent: () => setIsOpen(false)
  };
};
