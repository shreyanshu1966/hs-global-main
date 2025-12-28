import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Product } from '../data/products';

interface PhoneVerificationContextType {
  isModalOpen: boolean;
  pendingProduct: Product | null;
  openModal: (product: Product) => void;
  closeModal: () => void;
}

const PhoneVerificationContext = createContext<PhoneVerificationContextType | undefined>(undefined);

export const PhoneVerificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingProduct, setPendingProduct] = useState<Product | null>(null);

  const openModal = (product: Product) => {
    setPendingProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setPendingProduct(null);
  };

  const value: PhoneVerificationContextType = {
    isModalOpen,
    pendingProduct,
    openModal,
    closeModal,
  };

  return (
    <PhoneVerificationContext.Provider value={value}>
      {children}
    </PhoneVerificationContext.Provider>
  );
};

export const usePhoneVerification = () => {
  const context = useContext(PhoneVerificationContext);
  if (context === undefined) {
    throw new Error('usePhoneVerification must be used within a PhoneVerificationProvider');
  }
  return context;
};



