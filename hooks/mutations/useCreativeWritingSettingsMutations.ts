import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../contexts/ToastContext';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const useCreativeWritingSettingsMutations = () => {
    const queryClient = useQueryClient();
    const { addToast } = useToast();

    const createCreativeWritingPackage = useMutation({
        mutationFn: async (payload: any) => {
            await sleep(500);
            return { ...payload, id: Math.random() };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminCWSettings'] });
            addToast('تم إنشاء الباقة بنجاح.', 'success');
        },
        onError: (err: Error) => addToast(`فشل: ${err.message}`, 'error'),
    });

    const updateCreativeWritingPackage = useMutation({
        mutationFn: async (payload: any) => {
            await sleep(500);
            return payload;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminCWSettings'] });
            addToast('تم تحديث الباقة بنجاح.', 'success');
        },
        onError: (err: Error) => addToast(`فشل: ${err.message}`, 'error'),
    });

    const deleteCreativeWritingPackage = useMutation({
        mutationFn: async ({ packageId }: { packageId: number }) => {
            await sleep(500);
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminCWSettings'] });
            addToast('تم حذف الباقة بنجاح.', 'info');
        },
        onError: (err: Error) => addToast(`فشل: ${err.message}`, 'error'),
    });

    const createAdditionalService = useMutation({
        mutationFn: async (payload: any) => {
            await sleep(500);
            return { ...payload, id: Math.random() };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminCWSettings'] });
            addToast('تم إنشاء الخدمة بنجاح.', 'success');
        },
        onError: (err: Error) => addToast(`فشل: ${err.message}`, 'error'),
    });
    
    const updateAdditionalService = useMutation({
        mutationFn: async (payload: any) => {
            await sleep(500);
            return payload;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminCWSettings'] });
            addToast('تم تحديث الخدمة بنجاح.', 'success');
        },
        onError: (err: Error) => addToast(`فشل: ${err.message}`, 'error'),
    });

    const deleteAdditionalService = useMutation({
        mutationFn: async ({ serviceId }: { serviceId: number }) => {
            await sleep(500);
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminCWSettings'] });
            addToast('تم حذف الخدمة بنجاح.', 'info');
        },
        onError: (err: Error) => addToast(`فشل: ${err.message}`, 'error'),
    });

    return {
        createCreativeWritingPackage,
        updateCreativeWritingPackage,
        deleteCreativeWritingPackage,
        createAdditionalService,
        updateAdditionalService,
        deleteAdditionalService
    };
}
