import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../contexts/ToastContext';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const useSettingsMutations = () => {
    const queryClient = useQueryClient();
    const { addToast } = useToast();

    const updateSocialLinks = useMutation({
        mutationFn: async (links: any) => {
            await sleep(500);
            console.log("Updating social links (mock)", links);
            return links;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminSocialLinks'] });
            queryClient.invalidateQueries({ queryKey: ['publicData'] });
            addToast('تم تحديث الروابط بنجاح.', 'success');
        },
        onError: (error: Error) => {
            addToast(`فشل تحديث الروابط: ${error.message}`, 'error');
        }
    });
    
    const updateCommunicationSettings = useMutation({
        mutationFn: async (settings: any) => {
            await sleep(500);
            console.log("Updating communication settings (mock)", settings);
            return settings;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminCommunicationSettings'] });
            queryClient.invalidateQueries({ queryKey: ['publicData'] });
            addToast('تم تحديث إعدادات التواصل بنجاح.', 'success');
        },
        onError: (error: Error) => {
            addToast(`فشل تحديث الإعدادات: ${error.message}`, 'error');
        }
    });

    const updatePricingSettings = useMutation({
        mutationFn: async (settings: any) => {
            await sleep(500);
            console.log("Updating Pricing settings (mock)", settings);
            return settings;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminPricingSettings'] });
            addToast('تم تحديث إعدادات التسعير بنجاح.', 'success');
        },
        onError: (error: Error) => {
            addToast(`فشل تحديث الإعدادات: ${error.message}`, 'error');
        }
    });

    const updateRolePermissions = useMutation({
        mutationFn: async (permissions: any) => {
            await sleep(800);
            console.log("Updating Role Permissions (mock)", permissions);
            // In a real app, this would update the database.
            // Here, we'll just invalidate to simulate a refetch, though mock data won't change unless we manipulate it.
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminRolePermissions'] });
            addToast('تم تحديث صلاحيات الأدوار بنجاح.', 'success');
        },
        onError: (error: Error) => {
            addToast(`فشل تحديث الصلاحيات: ${error.message}`, 'error');
        }
    });
    
    const updateJitsiSettings = useMutation({
        mutationFn: async (settings: any) => {
            await sleep(500);
            console.log("Updating Jitsi settings (mock)", settings);
            return settings;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminJitsiSettings'] });
            addToast('تم تحديث إعدادات Jitsi بنجاح.', 'success');
        },
        onError: (error: Error) => {
            addToast(`فشل تحديث الإعدادات: ${error.message}`, 'error');
        }
    });


    return { updateSocialLinks, updateCommunicationSettings, updatePricingSettings, updateRolePermissions, updateJitsiSettings };
}
