import { useState, useEffect } from 'react';

export const useLeadCapturePopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    // Check if popup has been shown before in this session
    const hasShownPopup = sessionStorage.getItem('leadCapturePopupShown');
    
    if (!hasShownPopup) {
      // Show popup after 18 seconds
      const timer = setTimeout(() => {
        setIsOpen(true);
        setHasShown(true);
        sessionStorage.setItem('leadCapturePopupShown', 'true');
      }, 18000);

      return () => clearTimeout(timer);
    }
  }, []);

  const openPopup = () => {
    setIsOpen(true);
  };

  const closePopup = () => {
    setIsOpen(false);
  };

  return {
    isOpen,
    openPopup,
    closePopup,
    hasShown
  };
};
