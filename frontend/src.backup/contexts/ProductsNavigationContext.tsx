import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ProductsNavigationContextType {
    activeSection: string;
    setActiveSection: (section: string) => void;
}

const ProductsNavigationContext = createContext<ProductsNavigationContextType | undefined>(undefined);

export const ProductsNavigationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [activeSection, setActiveSection] = useState<string>('alaska');

    return (
        <ProductsNavigationContext.Provider value={{ activeSection, setActiveSection }}>
            {children}
        </ProductsNavigationContext.Provider>
    );
};

export const useProductsNavigation = () => {
    const context = useContext(ProductsNavigationContext);
    if (!context) {
        throw new Error('useProductsNavigation must be used within ProductsNavigationProvider');
    }
    return context;
};
