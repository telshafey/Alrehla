import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../contexts/ToastContext';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const useNotificationMutations = () => {
    const queryClient = useQueryClient();
    const { addToast } = useToast();

    const markNotificationAsRead = useMutation({
        mutationFn: async ({ notificationId }: { notificationId: number }) => {
            await sleep(200);
            console.log('Marking as read:', notificationId);
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userNotifications'] });
        },
    });

    const markAllNotificationsAsRead = useMutation({
        mutationFn: async () => {
            await sleep(500);
            console.log('Marking all as read');
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userNotifications'] });
            addToast('تم تحديد الكل كمقروء', 'success');
        },
    });
    
     const deleteNotification = useMutation({
        mutationFn: async ({ notificationId }: { notificationId: number }) => {
            await sleep(200);
            console.log('Deleting notification:', notificationId);
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userNotifications'] });
            addToast('تم حذف الإشعار', 'info');
        },
    });

    return { markNotificationAsRead, markAllNotificationsAsRead, deleteNotification };
};
