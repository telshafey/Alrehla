import React, { createContext, useContext, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from './ToastContext.tsx';
import { supabase } from '../lib/supabaseClient.ts';
import { Json } from '../lib/database.types.ts';
import { EGYPTIAN_GOVERNORATES } from '../utils/governorates.ts';
import { mockPrices, mockShippingCosts, mockSiteBranding } from '../data/mockData.ts';

export interface Prices {
    story: {
        printed: number;
        electronic: number;
    };
    coloringBook: number;
    duaBooklet: number;
    valuesStory: number;
    skillsStory: number;
    giftBox: number;
    subscriptionBox: number;
}

export interface SiteBranding {
    logoUrl: string | null;
    creativeWritingLogoUrl: string | null;
    heroImageUrl: string | null;
    aboutImageUrl: string | null;
    creativeWritingPortalImageUrl: string | null;
}

export interface ShippingCosts {
    [governorate: string]: number;
}

interface ProductContextType {
    prices: Prices | null;
    setPrices: (newPrices: Prices) => Promise<void>;
    shippingCosts: ShippingCosts | null;
    setShippingCosts: (newCosts: ShippingCosts) => Promise<void>;
    siteBranding: SiteBranding | null;
    setSiteBranding: (brandingChanges: Partial<SiteBranding>) => Promise<void>;
    loading: boolean;
    error: string | null;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

const fetchSiteSettings = async () => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    // Return mock data instead of calling Supabase
    return Promise.resolve({
        prices: mockPrices,
        siteBranding: mockSiteBranding,
        shippingCosts: mockShippingCosts,
    });
};

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const queryClient = useQueryClient();
    const { addToast } = useToast();

    const { data, isLoading, isError, error: queryError } = useQuery({
        queryKey: ['siteSettings'],
        queryFn: fetchSiteSettings,
        staleTime: Infinity, // This data changes rarely, so keep it fresh until manually invalidated.
    });

    // --- Mutations ---
    const useGenericMutation = <TVariables,>(
        mutationFn: (vars: TVariables) => Promise<any>, 
        { successMessage }: { successMessage: string }
    ) => {
        return useMutation({
            mutationFn,
            onSuccess: () => {
                addToast(successMessage, 'success');
                queryClient.invalidateQueries({ queryKey: ['siteSettings'] });
            },
            onError: (err: any) => {
                addToast(err.message, 'error');
                throw err;
            }
        });
    };
    
    const { mutateAsync: setPrices } = useGenericMutation<Prices>(
        async (newPrices) => {
            console.log("Mock saving prices:", newPrices);
            // const { error } = await supabase.from('site_settings').update({ prices: newPrices as unknown as Json }).eq('id', 1);
            // if (error) throw error;
        },
        { successMessage: 'تم تحديث الأسعار بنجاح.' }
    );
    
    const { mutateAsync: setShippingCosts } = useGenericMutation<ShippingCosts>(
        async (newCosts) => {
            console.log("Mock saving shipping costs:", newCosts);
            // const { error } = await supabase.from('site_settings').update({ shipping_costs: newCosts as Json }).eq('id', 1);
            // if (error) throw error;
        },
        { successMessage: 'تم تحديث تكاليف الشحن بنجاح.' }
    );
    
    const { mutateAsync: setSiteBranding } = useGenericMutation<Partial<SiteBranding>>(
        async (brandingChanges) => {
            console.log("Mock saving site branding:", brandingChanges);
            // const currentBranding = data?.siteBranding || {};
            // const newBranding = { ...currentBranding, ...brandingChanges };
            // const { error } = await supabase.from('site_settings').update({ site_branding: newBranding as Json }).eq('id', 1);
            // if (error) throw error;
        },
        { successMessage: 'تم تحديث العلامة التجارية للموقع.' }
    );
    
    if (isLoading || !data) {
        return (
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                height: '100vh', fontFamily: 'sans-serif', fontSize: '1.25rem', color: '#4b5563'
            }}>
                <p>...جاري تهيئة المنصة</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                height: '100vh', backgroundColor: '#fef2f2', color: '#b91c1c',
                fontFamily: 'sans-serif', padding: '2rem', textAlign: 'center'
            }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>خطأ في تحميل البيانات الأساسية</h1>
                <p>{queryError.message}</p>
                <p style={{ marginTop: '1rem', fontSize: '0.875rem' }}>يرجى التحقق من إعدادات الاتصال بـ Supabase وتحديث الصفحة.</p>
            </div>
        );
    }
    

    const value = {
        prices: data.prices,
        setPrices,
        shippingCosts: data.shippingCosts,
        setShippingCosts,
        siteBranding: data.siteBranding,
        setSiteBranding,
        loading: isLoading,
        error: isError ? queryError.message : null,
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