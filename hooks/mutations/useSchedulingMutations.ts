import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../contexts/ToastContext';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const useSchedulingMutations = () => {
    const queryClient = useQueryClient();
    const { addToast } = useToast();

    const scheduleSubscriptionSessions = useMutation({
        mutationFn: async (payload: any) => {
            await sleep(1000);
            console.log('Scheduling sessions (mock)', payload);
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminScheduledSessions'] });
            addToast('تمت جدولة الجلسات بنجاح.', 'success');
        },
        onError: (err: Error) => addToast(`فشل الجدولة: ${err.message}`, 'error'),
    });

    return { scheduleSubscriptionSessions };
};
