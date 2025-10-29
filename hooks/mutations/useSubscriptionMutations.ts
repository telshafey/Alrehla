import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../contexts/ToastContext';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const useSubscriptionMutations = () => {
    const queryClient = useQueryClient();
    const { addToast } = useToast();

    const createSubscription = useMutation({
        mutationFn: async (payload: any) => {
            await sleep(1000);
            console.log("Creating subscription (mock)", payload);
            return { ...payload, id: `sub_${Math.random()}` };
        },
        onError: (error: Error) => {
            addToast(`فشل إنشاء الاشتراك: ${error.message}`, 'error');
        }
    });
    
    const pauseSubscription = useMutation({
        mutationFn: async ({ subscriptionId }: { subscriptionId: string }) => {
            await sleep(500);
            console.log("Pausing subscription (mock)", subscriptionId);
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminSubscriptions'] });
            addToast('تم إيقاف الاشتراك مؤقتاً.', 'success');
        },
        onError: (error: Error) => addToast(`فشل: ${error.message}`, 'error'),
    });

    const cancelSubscription = useMutation({
        mutationFn: async ({ subscriptionId }: { subscriptionId: string }) => {
            await sleep(500);
            console.log("Cancelling subscription (mock)", subscriptionId);
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminSubscriptions'] });
            addToast('تم إلغاء الاشتراك.', 'success');
        },
        onError: (error: Error) => addToast(`فشل: ${error.message}`, 'error'),
    });
    
    const reactivateSubscription = useMutation({
        mutationFn: async ({ subscriptionId }: { subscriptionId: string }) => {
            await sleep(500);
            console.log("Reactivating subscription (mock)", subscriptionId);
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminSubscriptions'] });
            addToast('تم إعادة تفعيل الاشتراك.', 'success');
        },
        onError: (error: Error) => addToast(`فشل: ${error.message}`, 'error'),
    });

    return { createSubscription, pauseSubscription, cancelSubscription, reactivateSubscription };
};
