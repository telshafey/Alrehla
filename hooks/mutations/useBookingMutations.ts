import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../contexts/ToastContext';
import type { BookingStatus } from '../../lib/database.types';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const useBookingMutations = () => {
    const queryClient = useQueryClient();
    const { addToast } = useToast();

    const createBooking = useMutation({
        mutationFn: async (payload: any) => {
            await sleep(1000);
            console.log("Creating booking (mock)", payload);
            return { ...payload, id: `bk_${Math.random()}` };
        },
         onError: (error: Error) => {
            addToast(`فشل إنشاء الحجز: ${error.message}`, 'error');
        }
    });
    
    const updateBookingStatus = useMutation({
        mutationFn: async ({ bookingId, newStatus }: { bookingId: string, newStatus: BookingStatus }) => {
            await sleep(300);
            console.log("Updating booking status (mock)", { bookingId, newStatus });
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminRawCwBookings'] });
            addToast('تم تحديث حالة الحجز.', 'success');
        },
         onError: (error: Error) => {
            addToast(`فشل تحديث الحالة: ${error.message}`, 'error');
        }
    });

    const updateBookingProgressNotes = useMutation({
        mutationFn: async ({ bookingId, notes }: { bookingId: string, notes: string }) => {
            await sleep(500);
            console.log("Updating progress notes (mock)", { bookingId, notes });
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminRawCwBookings'] });
            queryClient.invalidateQueries({ queryKey: ['trainingJourney'] });
        },
         onError: (error: Error) => {
            addToast(`فشل حفظ الملاحظات: ${error.message}`, 'error');
        }
    });
    
    const updateBookingDraft = useMutation({
        mutationFn: async ({ bookingId, draft }: { bookingId: string, draft: string }) => {
            await sleep(500);
            console.log("Saving draft (mock)", { bookingId, draft });
            return { success: true };
        },
        onSuccess: () => {
            addToast('تم حفظ المسودة بنجاح.', 'success');
            // We don't need to invalidate queries here as the state is local to the component
        },
        onError: (error: Error) => {
            addToast(`فشل حفظ المسودة: ${error.message}`, 'error');
        }
    });

    return { createBooking, updateBookingStatus, updateBookingProgressNotes, updateBookingDraft };
};