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

    // Mutations for Subscription Plans
    const createSubscriptionPlan = useMutation({
        mutationFn: async (payload: any) => {
            await sleep(500);
            console.log("Creating subscription plan (mock)", payload);
            return { ...payload, id: Math.random() };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminSubscriptionPlans'] });
            addToast('تم إنشاء الباقة بنجاح.', 'success');
        },
        onError: (err: Error) => addToast(`فشل إنشاء الباقة: ${err.message}`, 'error'),
    });

    const updateSubscriptionPlan = useMutation({
        mutationFn: async (payload: any) => {
            await sleep(500);
            console.log("Updating subscription plan (mock)", payload);
            return payload;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminSubscriptionPlans'] });
            addToast('تم تحديث الباقة بنجاح.', 'success');
        },
        onError: (err: Error) => addToast(`فشل تحديث الباقة: ${err.message}`, 'error'),
    });

    const deleteSubscriptionPlan = useMutation({
        mutationFn: async ({ planId }: { planId: number }) => {
            await sleep(500);
            console.log("Deleting subscription plan (mock)", planId);
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminSubscriptionPlans'] });
            addToast('تم حذف الباقة بنجاح.', 'info');
        },
        onError: (err: Error) => addToast(`فشل حذف الباقة: ${err.message}`, 'error'),
    });


    return { 
        createSubscription, 
        pauseSubscription, 
        cancelSubscription, 
        reactivateSubscription,
        createSubscriptionPlan,
        updateSubscriptionPlan,
        deleteSubscriptionPlan
    };
};