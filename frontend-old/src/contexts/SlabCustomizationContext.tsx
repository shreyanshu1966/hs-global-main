import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface SlabCustomization {
  finish: string;
  thickness: string;
  requirement: number;
}

interface SlabCustomizationContextType {
  isModalOpen: boolean;
  pendingProduct: any | null;
  customization: SlabCustomization;
  phoneNumber: string;
  openModal: (product: any, phone: string) => void;
  closeModal: () => void;
  setCustomization: React.Dispatch<React.SetStateAction<SlabCustomization>>;
}

const SlabCustomizationContext = createContext<SlabCustomizationContextType | undefined>(undefined);

export const SlabCustomizationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingProduct, setPendingProduct] = useState<any | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [customization, setCustomization] = useState<SlabCustomization>({
    finish: 'Polish',
    thickness: '20mm',
    requirement: 1
  });

  const openModal = (product: any, phone: string) => {
    setPendingProduct(product);
    setPhoneNumber(phone);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setPendingProduct(null);
  };

  const value: SlabCustomizationContextType = {
    isModalOpen,
    pendingProduct,
    customization,
    phoneNumber,
    openModal,
    closeModal,
    setCustomization,
  };

  return (
    <SlabCustomizationContext.Provider value={value}>
      {children}
    </SlabCustomizationContext.Provider>
  );
};

export const useSlabCustomization = () => {
  const context = useContext(SlabCustomizationContext);
  if (context === undefined) {
    throw new Error('useSlabCustomization must be used within a SlabCustomizationProvider');
  }
  return context;
};