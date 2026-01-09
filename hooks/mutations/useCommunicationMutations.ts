
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../contexts/ToastContext';
import { communicationService } from '../../services/communicationService';
import type { TicketStatus, RequestStatus } from '../../lib/database.types';

export const useCommunicationMutations = () => {
    const queryClient = useQueryClient();
    const { addToast } = useToast();

    const createSupportTicket = useMutation({
        mutationFn: communicationService.createSupportTicket,
        onSuccess: () => {
            addToast('تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.', 'success');
        },
        onError: (err: Error) => {
            addToast(`فشل إرسال الرسالة: ${err.message}`, 'error');
        }
    });

     const createJoinRequest = useMutation({
        mutationFn: communicationService.createJoinRequest,
        onSuccess: () => {
            addToast('تم إرسال طلبك بنجاح! سنراجعه ونتواصل معك.', 'success');
            // Optional: Invalidate queries if the user happens to be an admin testing the form
            queryClient.invalidateQueries({ queryKey: ['adminJoinRequests'] });
        },
        onError: (err: Error) => {
            addToast(`فشل إرسال الطلب: ${err.message}`, 'error');
        }
    });

    const updateSupportTicketStatus = useMutation({
        mutationFn: async ({ ticketId, newStatus }: { ticketId: string, newStatus: TicketStatus }) => {
            const { error } = await import('../../lib/supabaseClient').then(m => (m.supabase.from('support_tickets') as any).update({ status: newStatus }).eq('id', ticketId));
            if (error) throw error;
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
             const { error } = await import('../../lib/supabaseClient').then(m => (m.supabase.from('join_requests') as any).update({ status: newStatus }).eq('id', requestId));
            if (error) throw error;
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
