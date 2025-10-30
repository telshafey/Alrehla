import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../contexts/ToastContext';
import type { OrderStatus } from '../../lib/database.types';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const useOrderMutations = () => {
    const queryClient = useQueryClient();
    const { addToast } = useToast();

    const createOrder = useMutation({
        mutationFn: async (payload: any) => {
            await sleep(1000);
            console.log("Creating order (mock)", payload);
            return { ...payload, id: `ord_${Math.random()}` };
        },
        onError: (error: Error) => {
            addToast(`فشل إنشاء الطلب: ${error.message}`, 'error');
        }
    });

    const updateOrderStatus = useMutation({
        mutationFn: async ({ orderId, newStatus }: { orderId: string, newStatus: OrderStatus }) => {
            await sleep(300);
            console.log("Updating order status (mock)", { orderId, newStatus });
            return { success: true };
        },
        onSuccess: (_, vars) => {
            queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
            addToast(`تم تحديث حالة الطلب ${vars.orderId} بنجاح.`, 'success');
        },
        onError: (error: Error) => {
            addToast(`فشل تحديث الحالة: ${error.message}`, 'error');
        }
    });
    
    const updateOrderComment = useMutation({
        mutationFn: async ({ orderId, comment }: { orderId: string, comment: string }) => {
            await sleep(300);
            console.log("Updating order comment (mock)", { orderId, comment });
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
            addToast('تم حفظ الملاحظة.', 'success');
        },
        onError: (error: Error) => {
            addToast(`فشل حفظ الملاحظة: ${error.message}`, 'error');
        }
    });

    const updateReceipt = useMutation({
        mutationFn: async (payload: { itemId: string; itemType: string; receiptFile: File }) => {
             await sleep(1000);
             console.log("Uploading receipt (mock)", payload);
             return { success: true, url: 'https://example.com/mock-receipt.jpg' };
        },
        onSuccess: () => {
            addToast('تم رفع الإيصال بنجاح. طلبك قيد المراجعة.', 'success');
            queryClient.invalidateQueries({ queryKey: ['userAccountData']});
        },
        onError: (error: Error) => {
            addToast(`فشل رفع الإيصال: ${error.message}`, 'error');
        }
    });
    
    const updateServiceOrderStatus = useMutation({
        mutationFn: async ({ orderId, newStatus }: { orderId: string, newStatus: OrderStatus }) => {
            await sleep(300);
            console.log("Updating service order status (mock)", { orderId, newStatus });
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminServiceOrders'] });
            addToast('تم تحديث حالة الطلب.', 'success');
        },
        onError: (error: Error) => addToast(`فشل: ${error.message}`, 'error'),
    });

    const assignInstructorToServiceOrder = useMutation({
        mutationFn: async ({ orderId, instructorId }: { orderId: string, instructorId: number | null }) => {
            await sleep(300);
            console.log("Assigning instructor to service order (mock)", { orderId, instructorId });
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminServiceOrders'] });
            addToast('تم تعيين المدرب بنجاح.', 'success');
        },
        onError: (error: Error) => addToast(`فشل: ${error.message}`, 'error'),
    });

    return { createOrder, updateOrderStatus, updateOrderComment, updateReceipt, updateServiceOrderStatus, assignInstructorToServiceOrder };
};