

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import type { Prices, SiteBranding, ShippingCosts } from '../lib/database.types';
import { mockPrices, mockSiteBranding, mockShippingCosts } from '../data/mockData';
import { useToast } from './ToastContext';

export type { Prices, SiteBranding, ShippingCosts };

interface ProductContextType {
    prices: Prices | null;
    siteBranding: SiteBranding | null;
    shippingCosts: ShippingCosts | null;
    setPrices: (newPrices: Prices) => Promise<void>;
    setSiteBranding: (newBranding: Partial<SiteBranding>) => Promise<void>;
    setShippingCosts: (newCosts: ShippingCosts) => Promise<void>;
    loading: boolean;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { addToast } = useToast();
    const [prices, _setPrices] = useState<Prices | null>(null);
    const [siteBranding, _setSiteBranding] = useState<SiteBranding | null>(null);
    const [shippingCosts, _setShippingCosts] = useState<ShippingCosts | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        _setPrices(mockPrices as Prices);
        _setSiteBranding(mockSiteBranding as SiteBranding);
        _setShippingCosts(mockShippingCosts as ShippingCosts);
        setLoading(false);
    }, []);

    const setPrices = async (newPrices: Prices) => {
        _setPrices(newPrices);
        addToast('تم تحديث الأسعار بنجاح (محاكاة).', 'success');
        return Promise.resolve();
    };

    const setSiteBranding = async (newBranding: Partial<SiteBranding>) => {
        _setSiteBranding(prev => ({ ...(prev as SiteBranding), ...newBranding }));
        addToast('تم تحديث العلامة التجارية بنجاح (محاكاة).', 'success');
        return Promise.resolve();
    };
    
    const setShippingCosts = async (newCosts: ShippingCosts) => {
        _setShippingCosts(newCosts);
        addToast('تم تحديث تكاليف الشحن بنجاح (محاكاة).', 'success');
        return Promise.resolve();
    };

    const value = {
        prices,
        siteBranding,
        shippingCosts,
        setPrices,
        setSiteBranding,
        setShippingCosts,
        loading,
    };

    return (
        <ProductContext.Provider value={value}>
            {children}
        </ProductContext.Provider>
    );
};

export const useProduct = (): ProductContextType => {
    const context = useContext(ProductContext);
    if (context === undefined) {
        throw new Error('useProduct must be used within a ProductProvider');
    }
    return context;
};