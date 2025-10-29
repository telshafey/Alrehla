import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../contexts/ToastContext';
import type { TicketStatus, RequestStatus } from '../../lib/database.types';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const useCommunicationMutations = () => {
    const queryClient = useQueryClient();
    const { addToast } = useToast();

    const createSupportTicket = useMutation({
        mutationFn: async (data: { name: string, email: string, subject: string, message: string }) => {
            await sleep(500);
            console.log('Creating support ticket (mock)', data);
            return { success: true };
        },
        onSuccess: () => {
            addToast('تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.', 'success');
        },
        onError: (err: Error) => {
            addToast(`فشل إرسال الرسالة: ${err.message}`, 'error');
        }
    });

     const createJoinRequest = useMutation({
        mutationFn: async (data: { name: string, email: string, role: string, message: string }) => {
            await sleep(500);
            console.log('Creating join request (mock)', data);
            return { success: true };
        },
        onSuccess: () => {
            addToast('تم إرسال طلبك بنجاح! سنراجعه ونتواصل معك.', 'success');
        },
        onError: (err: Error) => {
            addToast(`فشل إرسال الطلب: ${err.message}`, 'error');
        }
    });

    const updateSupportTicketStatus = useMutation({
        mutationFn: async ({ ticketId, newStatus }: { ticketId: string, newStatus: TicketStatus }) => {
            await sleep(300);
            console.log("Updating ticket status (mock)", { ticketId, newStatus });
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminSupportTickets'] });
            addToast('تم تحديث حالة الرسالة.', 'success');
        },
        onError: (error: Error) => addToast(`فشل: ${error.message}`, 'error'),
    });

    const updateJoinRequestStatus = useMutation({
        mutationFn: async ({ requestId, newStatus }: { requestId: string, newStatus: RequestStatus }) => {
            await sleep(300);
            console.log("Updating request status (mock)", { requestId, newStatus });
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminJoinRequests'] });
            addToast('تم تحديث حالة الطلب.', 'success');
        },
        onError: (error: Error) => addToast(`فشل: ${error.message}`, 'error'),
    });

    return { createSupportTicket, createJoinRequest, updateSupportTicketStatus, updateJoinRequestStatus };
};
