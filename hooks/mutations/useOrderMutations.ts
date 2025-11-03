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

            const { formData } = payload;
            if (formData?.shippingOption === 'gift' && formData?.sendDigitalCard && formData?.recipientEmail) {
                console.log("Simulating sending gift email for order...");
                 try {
                    await fetch('/api/sendEmail', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            to: formData.recipientEmail,
                            subject: `🎁 لديك هدية من ${payload.userName}!`,
                            html: `
                                <h1>مرحباً ${formData.recipientName},</h1>
                                <p>لديك هدية مميزة (${payload.summary}) من <strong>${payload.userName}</strong>!</p>
                                <p>نص الرسالة:</p>
                                <blockquote style="border-right: 4px solid #ccc; padding-right: 1em; margin-right: 0;">
                                    <em>${formData.giftMessage || 'أتمنى أن تنال إعجابك!'}</em>
                                </blockquote>
                                <p>سيصلك طلبك قريباً.</p>
                                <p>مع تحيات،<br>فريق منصة الرحلة</p>
                            `
                        })
                    });
                } catch (e) {
                    console.error("Failed to send mock email:", e);
                }
            }

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
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
            addToast('تم تحديث حالة الطلب.', 'success');
        },
        onError: (error: Error) => addToast(`فشل تحديث الحالة: ${error.message}`, 'error'),
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
        onError: (error: Error) => addToast(`فشل تحديث الحالة: ${error.message}`, 'error'),
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
        onError: (error: Error) => addToast(`فشل تعيين المدرب: ${error.message}`, 'error'),
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
        onError: (error: Error) => addToast(`فشل حفظ الملاحظة: ${error.message}`, 'error'),
    });

    const updateReceipt = useMutation({
        mutationFn: async ({ itemId, itemType, receiptFile }: { itemId: string; itemType: 'order' | 'booking' | 'subscription'; receiptFile: File; }) => {
            await sleep(1000);
            console.log("Uploading receipt (mock)", { itemId, itemType, fileName: receiptFile.name });
            // In a real app, this would upload the file and return a URL.
            return { receiptUrl: 'https://example.com/mock-receipt.jpg' };
        },
        onSuccess: (data, variables) => {
             queryClient.invalidateQueries({ queryKey: ['userAccountData'] });
             addToast('تم رفع الإيصال بنجاح. طلبك قيد المراجعة.', 'success');
        },
        onError: (error: Error) => {
             addToast(`فشل رفع الإيصال: ${error.message}`, 'error');
        }
    });

    // --- BULK ACTIONS ---
    const bulkUpdateOrderStatus = useMutation({
        mutationFn: async ({ orderIds, status }: { orderIds: string[], status: OrderStatus }) => {
            await sleep(500);
            console.log("Bulk updating order status (mock)", { orderIds, status });
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
            addToast('تم تحديث حالة الطلبات المحددة.', 'success');
        },
        onError: (error: Error) => addToast(`فشل تحديث الحالات: ${error.message}`, 'error'),
    });

    const bulkDeleteOrders = useMutation({
        mutationFn: async ({ orderIds }: { orderIds: string[] }) => {
            await sleep(500);
            console.log("Bulk deleting orders (mock)", { orderIds });
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
            addToast('تم حذف الطلبات المحددة.', 'info');
        },
        onError: (error: Error) => addToast(`فشل حذف الطلبات: ${error.message}`, 'error'),
    });

    return { 
        createOrder, 
        updateOrderStatus, 
        updateOrderComment, 
        updateReceipt, 
        updateServiceOrderStatus, 
        assignInstructorToServiceOrder,
        bulkUpdateOrderStatus,
        bulkDeleteOrders
    };
};