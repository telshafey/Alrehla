
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../contexts/ToastContext';
import { bookingService } from '../../services/bookingService';
import type { BookingStatus } from '../../lib/database.types';

export const useBookingMutations = () => {
    const queryClient = useQueryClient();
    const { addToast } = useToast();

    const createBooking = useMutation({
        mutationFn: bookingService.createBooking,
         onError: (error: Error) => {
            addToast(`فشل إنشاء الحجز: ${error.message}`, 'error');
        }
    });
    
    const updateBookingStatus = useMutation({
        mutationFn: (payload: { bookingId: string, newStatus: BookingStatus }) => bookingService.updateBookingStatus(payload.bookingId, payload.newStatus),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminRawCwBookings'] });
            addToast('تم تحديث حالة الحجز.', 'success');
        },
         onError: (error: Error) => {
            addToast(`فشل تحديث الحالة: ${error.message}`, 'error');
        }
    });

    const updateBookingProgressNotes = useMutation({
        mutationFn: (payload: { bookingId: string, notes: string }) => bookingService.updateBookingProgressNotes(payload.bookingId, payload.notes),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminRawCwBookings'] });
            queryClient.invalidateQueries({ queryKey: ['trainingJourney'] });
            addToast('تم حفظ ملاحظات التقدم بنجاح.', 'success');
        },
         onError: (error: Error) => {
            addToast(`فشل حفظ الملاحظات: ${error.message}`, 'error');
        }
    });
    
    const updateBookingDraft = useMutation({
        mutationFn: (payload: { bookingId: string, draft: string }) => bookingService.saveBookingDraft(payload.bookingId, payload.draft),
        onSuccess: () => {
            addToast('تم حفظ المسودة بنجاح.', 'success');
        },
        onError: (error: Error) => {
            addToast(`فشل حفظ المسودة: ${error.message}`, 'error');
        }
    });

    const sendSessionMessage = useMutation({
        mutationFn: bookingService.sendSessionMessage,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['trainingJourney', variables.bookingId] });
        },
        onError: (error: Error) => {
            addToast(`فشل إرسال الرسالة: ${error.message}`, 'error');
        }
    });

    const uploadSessionAttachment = useMutation({
        mutationFn: bookingService.uploadSessionAttachment,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['trainingJourney', variables.bookingId] });
            addToast('تم رفع الملف بنجاح.', 'success');
        },
        onError: (error: Error) => {
            addToast(`فشل رفع الملف: ${error.message}`, 'error');
        }
    });

    return { 
        createBooking, 
        updateBookingStatus, 
        updateBookingProgressNotes, 
        updateBookingDraft,
        sendSessionMessage,
        uploadSessionAttachment
    };
};
