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
            // This toast is handled in the component
        },
        onError: (error: Error) => {
            addToast(`فشل تحديث الروابط: ${error.message}`, 'error');
        }
    });

    return { updateSocialLinks };
}
