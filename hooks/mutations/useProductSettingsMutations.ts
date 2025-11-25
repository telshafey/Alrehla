
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../contexts/ToastContext';
import type { Prices, SiteBranding, ShippingCosts } from '../../lib/database.types';
import { mockSiteBranding } from '../../data/mockData';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const useProductSettingsMutations = () => {
    const queryClient = useQueryClient();
    const { addToast } = useToast();

    const updatePrices = useMutation({
        mutationFn: async (newPrices: Prices) => {
            await sleep(500);
            localStorage.setItem('alrehla_prices', JSON.stringify(newPrices));
            return newPrices;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['prices'] });
            addToast('تم تحديث الأسعار بنجاح.', 'success');
        },
        onError: (error: Error) => {
            addToast(`فشل تحديث الأسعار: ${error.message}`, 'error');
        }
    });
    
    const updateBranding = useMutation({
        mutationFn: async (newBranding: Partial<SiteBranding>) => {
            await sleep(500);
            // Get existing local branding or fallback to mock
            const stored = localStorage.getItem('alrehla_branding');
            const currentBranding = stored ? JSON.parse(stored) : mockSiteBranding;
            
            const updatedBranding = { ...currentBranding, ...newBranding };
            localStorage.setItem('alrehla_branding', JSON.stringify(updatedBranding));
            return updatedBranding;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['siteBranding'] });
            // Also invalidate public data to reflect changes immediately on the frontend
            queryClient.invalidateQueries({ queryKey: ['publicData'] });
            addToast('تم تحديث العلامة التجارية بنجاح.', 'success');
        },
        onError: (error: Error) => {
            addToast(`فشل تحديث العلامة التجارية: ${error.message}`, 'error');
        }
    });

    const updateShippingCosts = useMutation({
        mutationFn: async (newCosts: ShippingCosts) => {
            await sleep(500);
            localStorage.setItem('alrehla_shipping', JSON.stringify(newCosts));
            return newCosts;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['shippingCosts'] });
            addToast('تم تحديث تكاليف الشحن بنجاح.', 'success');
        },
        onError: (error: Error) => {
            addToast(`فشل تحديث تكاليف الشحن: ${error.message}`, 'error');
        }
    });

    return { updatePrices, updateBranding, updateShippingCosts };
};
