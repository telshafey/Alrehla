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
                console.log("Simulating sending gift email...");
                try {
                    await fetch('/api/sendEmail', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            to: formData.recipientEmail,
                            subject: `🎁 لديك هدية من ${payload.userName}!`,
                            html: `
                                <h1>مرحباً ${formData.recipientName},</h1>
                                <p>لديك هدية مميزة من <strong>${payload.userName}</strong> عبر منصة الرحلة!</p>
                                <p>نص الرسالة:</p>
                                <blockquote style="border-right: 4px solid #ccc; padding-right: 1em; margin-right: 0;">
                                    <em>${formData.giftMessage || 'أتمنى أن تنال إعجابك!'}</em>
                                </blockquote>
                                <p>هديتك قيد التجهيز الآن وستصلك قريباً.</p>
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