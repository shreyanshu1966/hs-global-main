import React, { createContext, useContext, useState, ReactNode } from 'react';

interface StoneQuotationContextType {
  isModalOpen: boolean;
  pendingProduct: any | null;
  openModal: (product: any) => void;
  closeModal: () => void;
}

const StoneQuotationContext = createContext<StoneQuotationContextType | undefined>(undefined);

export const StoneQuotationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingProduct, setPendingProduct] = useState<any | null>(null);

  const openModal = (product: any) => {
    setPendingProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setPendingProduct(null);
  };

  return (
    <StoneQuotationContext.Provider value={{ isModalOpen, pendingProduct, openModal, closeModal }}>
      {children}
    </StoneQuotationContext.Provider>
  );
};

export const useStoneQuotation = () => {
  const context = useContext(StoneQuotationContext);
  if (context === undefined) {
    throw new Error('useStoneQuotation must be used within a StoneQuotationProvider');
  }
  return context;
};
