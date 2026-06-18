import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { popupConfigService } from '../services/popupConfigService';

const EXCLUDED_PATHS = ['/admin', '/checkout', '/login', '/signup', '/verify-email', '/reset-password', '/forgot-password'];

export const usePageToastPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isFirstRender = useRef(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const isExcluded = EXCLUDED_PATHS.some(p => location.pathname.startsWith(p));
    if (isExcluded) return;

    const navCount = parseInt(sessionStorage.getItem('hsNavCount') || '0') + 1;
    sessionStorage.setItem('hsNavCount', navCount.toString());
    const shownAtNav = parseInt(sessionStorage.getItem('hsToastShownAt') || '0');

    popupConfigService.getPublicConfig().then(config => {
      if (!config.pageToast.enabled) return;
      const showEvery = config.pageToast.showEveryNPages || 3;
      if (navCount - shownAtNav >= showEvery) {
        timerRef.current = setTimeout(() => {
          setIsOpen(true);
          sessionStorage.setItem('hsToastShownAt', navCount.toString());
        }, 1800);
      }
    });

    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [location.pathname]);

  return {
    isOpen,
    closeToast: () => setIsOpen(false)
  };
};
