import React, { createContext, useContext, ReactNode } from 'react';
import type { Prices, SiteBranding, ShippingCosts } from '../lib/database.types';
import { useToast } from './ToastContext';
import { usePrices, useSiteBranding, useShippingCosts } from '../hooks/queries/public/useProductDataQuery';
import { useProductSettingsMutations } from '../hooks/mutations/useProductSettingsMutations';


export type { Prices, SiteBranding, ShippingCosts };

interface ProductContextType {
    prices: Prices | null | undefined;
    siteBranding: SiteBranding | null | undefined;
    shippingCosts: ShippingCosts | null | undefined;
    setPrices: (newPrices: Prices) => Promise<any>;
    setSiteBranding: (newBranding: Partial<SiteBranding>) => Promise<any>;
    setShippingCosts: (newCosts: ShippingCosts) => Promise<any>;
    loading: boolean;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { addToast } = useToast();
    const { data: prices, isLoading: pricesLoading } = usePrices();
    const { data: siteBranding, isLoading: brandingLoading } = useSiteBranding();
    const { data: shippingCosts, isLoading: shippingLoading } = useShippingCosts();

    const { updatePrices, updateBranding, updateShippingCosts } = useProductSettingsMutations();

    const setPrices = async (newPrices: Prices) => {
        return updatePrices.mutateAsync(newPrices);
    };

    const setSiteBranding = async (newBranding: Partial<SiteBranding>) => {
        return updateBranding.mutateAsync(newBranding);
    };
    
    const setShippingCosts = async (newCosts: ShippingCosts) => {
        return updateShippingCosts.mutateAsync(newCosts);
    };

    const value = {
        prices,
        siteBranding,
        shippingCosts,
        setPrices,
        setSiteBranding,
        setShippingCosts,
        loading: pricesLoading || brandingLoading || shippingLoading,
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