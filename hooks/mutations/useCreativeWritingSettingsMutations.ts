import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../contexts/ToastContext';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const useCreativeWritingSettingsMutations = () => {
    const queryClient = useQueryClient();
    const { addToast } = useToast();

    // Mutations for Packages
    const createPackage = useMutation({
        mutationFn: async (payload: any) => {
            await sleep(500);
            console.log("Creating package (mock)", payload);
            return { ...payload, id: Math.random() };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminCWSettings'] });
            addToast('تم إنشاء الباقة بنجاح.', 'success');
        },
        onError: (err: Error) => addToast(`فشل إنشاء الباقة: ${err.message}`, 'error'),
    });

    const updatePackage = useMutation({
        mutationFn: async (payload: any) => {
            await sleep(500);
            console.log("Updating package (mock)", payload);
            return payload;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminCWSettings'] });
            addToast('تم تحديث الباقة بنجاح.', 'success');
        },
        onError: (err: Error) => addToast(`فشل تحديث الباقة: ${err.message}`, 'error'),
    });

    const deletePackage = useMutation({
        mutationFn: async ({ packageId }: { packageId: number }) => {
            await sleep(500);
            console.log("Deleting package (mock)", packageId);
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminCWSettings'] });
            addToast('تم حذف الباقة بنجاح.', 'info');
        },
        onError: (err: Error) => addToast(`فشل حذف الباقة: ${err.message}`, 'error'),
    });

    // Mutations for Standalone Services
    const createStandaloneService = useMutation({
        mutationFn: async (payload: any) => {
            await sleep(500);
            console.log("Creating standalone service (mock)", payload);
            return { ...payload, id: Math.random() };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminCWSettings'] });
            addToast('تم إنشاء الخدمة بنجاح.', 'success');
        },
        onError: (err: Error) => addToast(`فشل إنشاء الخدمة: ${err.message}`, 'error'),
    });

    const updateStandaloneService = useMutation({
        mutationFn: async (payload: any) => {
            await sleep(500);
            console.log("Updating standalone service (mock)", payload);
            return payload;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminCWSettings'] });
            addToast('تم تحديث الخدمة بنجاح.', 'success');
        },
        onError: (err: Error) => addToast(`فشل تحديث الخدمة: ${err.message}`, 'error'),
    });

    const deleteStandaloneService = useMutation({
        mutationFn: async ({ serviceId }: { serviceId: number }) => {
            await sleep(500);
            console.log("Deleting standalone service (mock)", serviceId);
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminCWSettings'] });
            addToast('تم حذف الخدمة بنجاح.', 'info');
        },
        onError: (err: Error) => addToast(`فشل حذف الخدمة: ${err.message}`, 'error'),
    });

    return { 
        createPackage, 
        updatePackage, 
        deletePackage,
        createStandaloneService,
        updateStandaloneService,
        deleteStandaloneService,
    };
};
