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

            const { formData } = payload;
            if (formData?.shippingOption === 'gift' && formData?.sendDigitalCard && formData?.recipientEmail) {
                console.log("Simulating sending gift email for subscription...");
                try {
                    await fetch('/api/sendEmail', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            to: formData.recipientEmail,
                            subject: `🎁 لديك هدية اشتراك من ${payload.userName}!`,
                            html: `
                                <h1>مرحباً ${formData.recipientName},</h1>
                                <p>لديك هدية اشتراك مميزة في <strong>صندوق الرحلة الشهري</strong> من <strong>${payload.userName}</strong>!</p>
                                <p>نص الرسالة:</p>
                                <blockquote style="border-right: 4px solid #ccc; padding-right: 1em; margin-right: 0;">
                                    <em>${formData.giftMessage || 'أتمنى أن تنال إعجابك!'}</em>
                                </blockquote>
                                <p>سيصلك صندوقك الأول قريباً. استعد لمغامرة متجددة كل شهر!</p>
                                <p>مع تحيات،<br>فريق منصة الرحلة</p>
                            `
                        })
                    });
                } catch (e) {
                    console.error("Failed to send mock email:", e);
                }
            }

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