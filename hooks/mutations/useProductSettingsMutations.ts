import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../contexts/ToastContext';
import type { Prices, SiteBranding, ShippingCosts } from '../../lib/database.types';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const useProductSettingsMutations = () => {
    const queryClient = useQueryClient();
    const { addToast } = useToast();

    const updatePrices = useMutation({
        mutationFn: async (newPrices: Prices) => {
            console.log("Updating prices (mock):", newPrices);
            await sleep(500);
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
            console.log("Updating branding (mock):", newBranding);
            await sleep(500);
            return newBranding;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['siteBranding'] });
            addToast('تم تحديث العلامة التجارية بنجاح.', 'success');
        },
        onError: (error: Error) => {
            addToast(`فشل تحديث العلامة التجارية: ${error.message}`, 'error');
        }
    });

    const updateShippingCosts = useMutation({
        mutationFn: async (newCosts: ShippingCosts) => {
            console.log("Updating shipping costs (mock):", newCosts);
            await sleep(500);
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
