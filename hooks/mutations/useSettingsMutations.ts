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
            addToast('تم تحديث الروابط بنجاح.', 'success');
        },
        onError: (error: Error) => {
            addToast(`فشل تحديث الروابط: ${error.message}`, 'error');
        }
    });

    // FIX: Add missing updateAiSettings mutation.
    const updateAiSettings = useMutation({
        mutationFn: async (settings: any) => {
            await sleep(500);
            console.log("Updating AI settings (mock)", settings);
            return settings;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminAiSettings'] });
            addToast('تم تحديث إعدادات الذكاء الاصطناعي بنجاح.', 'success');
        },
        onError: (error: Error) => {
            addToast(`فشل تحديث الإعدادات: ${error.message}`, 'error');
        }
    });


    return { updateSocialLinks, updateAiSettings };
}