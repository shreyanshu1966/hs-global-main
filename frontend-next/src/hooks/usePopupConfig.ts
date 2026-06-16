'use client';
import { useState, useEffect } from 'react';
import { popupConfigService, PopupConfig, DEFAULT_POPUP_CONFIG } from '../services/popupConfigService';

export const usePopupConfig = (): PopupConfig => {
  const [config, setConfig] = useState<PopupConfig>(DEFAULT_POPUP_CONFIG);

  useEffect(() => {
    popupConfigService.getPublicConfig().then(setConfig).catch(() => {});

    const update = () => popupConfigService.getPublicConfig().then(setConfig).catch(() => {});
    window.addEventListener('hs-popup-config-changed', update);
    return () => window.removeEventListener('hs-popup-config-changed', update);
  }, []);

  return config;
};
