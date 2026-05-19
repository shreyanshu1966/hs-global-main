import { useState, useEffect, useRef } from 'react';
import { popupConfigService, DEFAULT_POPUP_CONFIG } from '../services/popupConfigService';

export const useLeadCapturePopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const configRef = useRef(DEFAULT_POPUP_CONFIG.entryPopup);

  const schedule = (cfg: typeof DEFAULT_POPUP_CONFIG.entryPopup) => {
    if (!cfg.enabled) return;
    if (sessionStorage.getItem('leadCapturePopupShown')) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (!configRef.current.enabled) return;
      setIsOpen(true);
      setHasShown(true);
      sessionStorage.setItem('leadCapturePopupShown', 'true');
    }, (cfg.timerSeconds || 12) * 1000);
  };

  useEffect(() => {
    popupConfigService.getPublicConfig().then(cfg => {
      configRef.current = cfg.entryPopup;
      schedule(cfg.entryPopup);
    });

    const onConfigChange = () => {
      if (sessionStorage.getItem('leadCapturePopupShown')) return;
      popupConfigService.getPublicConfig().then(cfg => {
        configRef.current = cfg.entryPopup;
        if (timerRef.current) clearTimeout(timerRef.current);
        schedule(cfg.entryPopup);
      });
    };

    window.addEventListener('hs-popup-config-changed', onConfigChange);
    return () => {
      window.removeEventListener('hs-popup-config-changed', onConfigChange);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return {
    isOpen,
    openPopup: () => setIsOpen(true),
    closePopup: () => setIsOpen(false),
    hasShown
  };
};
