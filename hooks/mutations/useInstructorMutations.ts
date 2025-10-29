import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../contexts/ToastContext';
import type { WeeklySchedule, AvailableSlots } from '../../lib/database.types';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const useInstructorMutations = () => {
    const queryClient = useQueryClient();
    const { addToast } = useToast();

    const createInstructor = useMutation({
        mutationFn: async (payload: any) => {
            await sleep(500);
            console.log("Creating instructor (mock)", payload);
            return { ...payload, id: Math.random() };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminInstructors'] });
            addToast('تم إضافة المدرب بنجاح.', 'success');
        },
        onError: (err: Error) => addToast(`فشل: ${err.message}`, 'error'),
    });
    
    const updateInstructor = useMutation({
        mutationFn: async (payload: any) => {
            await sleep(500);
            console.log("Updating instructor (mock)", payload);
            return payload;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminInstructors'] });
            addToast('تم تحديث المدرب بنجاح.', 'success');
        },
        onError: (err: Error) => addToast(`فشل: ${err.message}`, 'error'),
    });

    const approveInstructorSchedule = useMutation({
        mutationFn: async ({ instructorId }: { instructorId: number }) => {
            await sleep(300);
            console.log("Approving schedule for instructor:", instructorId);
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminInstructors'] });
            addToast('تمت الموافقة على الجدول.', 'success');
        },
        onError: (err: Error) => addToast(`فشل: ${err.message}`, 'error'),
    });
    
    const rejectInstructorSchedule = useMutation({
        mutationFn: async ({ instructorId }: { instructorId: number }) => {
            await sleep(300);
            console.log("Rejecting schedule for instructor:", instructorId);
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminInstructors'] });
            addToast('تم رفض الجدول.', 'info');
        },
        onError: (err: Error) => addToast(`فشل: ${err.message}`, 'error'),
    });

    const approveInstructorProfileUpdate = useMutation({
        mutationFn: async ({ instructorId }: { instructorId: number }) => {
            await sleep(300);
            console.log("Approving profile update for instructor:", instructorId);
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminInstructors'] });
            addToast('تمت الموافقة على تحديث الملف الشخصي.', 'success');
        },
        onError: (err: Error) => addToast(`فشل: ${err.message}`, 'error'),
    });

    const rejectInstructorProfileUpdate = useMutation({
        mutationFn: async ({ instructorId }: { instructorId: number }) => {
            await sleep(300);
            console.log("Rejecting profile update for instructor:", instructorId);
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminInstructors'] });
            addToast('تم رفض تحديث الملف الشخصي.', 'info');
        },
        onError: (err: Error) => addToast(`فشل: ${err.message}`, 'error'),
    });
    
    const updateInstructorAvailability = useMutation({
        mutationFn: async ({ instructorId, availability }: { instructorId: number, availability: AvailableSlots }) => {
            await sleep(500);
            console.log("Updating availability for instructor:", {instructorId, availability});
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminInstructors'] });
            addToast('تم تحديث المواعيد المتاحة.', 'success');
        },
        onError: (err: Error) => addToast(`فشل: ${err.message}`, 'error'),
    });

    const requestScheduleChange = useMutation({
        mutationFn: async ({ instructorId, schedule }: { instructorId: number, schedule: WeeklySchedule }) => {
            await sleep(500);
            console.log("Requesting schedule change for instructor:", {instructorId, schedule});
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminInstructors'] });
            addToast('تم إرسال طلب تعديل الجدول للمراجعة.', 'success');
        },
        onError: (err: Error) => addToast(`فشل: ${err.message}`, 'error'),
    });
    
    const requestProfileUpdate = useMutation({
        mutationFn: async (payload: { instructorId: number, updates: any, justification: string }) => {
            await sleep(500);
            console.log("Requesting profile update (mock)", payload);
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminInstructors'] });
            addToast('تم إرسال طلب تحديث ملفك الشخصي للمراجعة.', 'success');
        },
        onError: (err: Error) => addToast(`فشل إرسال الطلب: ${err.message}`, 'error'),
    });

    const approveSupportSessionRequest = useMutation({
        mutationFn: async ({ requestId }: { requestId: string }) => {
            await sleep(300);
            console.log("Approving support request:", requestId);
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminSupportSessionRequests'] });
            addToast('تمت الموافقة على طلب الدعم.', 'success');
        },
        onError: (err: Error) => addToast(`فشل: ${err.message}`, 'error'),
    });
    
    const rejectSupportSessionRequest = useMutation({
        mutationFn: async ({ requestId }: { requestId: string }) => {
            await sleep(300);
            console.log("Rejecting support request:", requestId);
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminSupportSessionRequests'] });
            addToast('تم رفض طلب الدعم.', 'info');
        },
        onError: (err: Error) => addToast(`فشل: ${err.message}`, 'error'),
    });

    const createSupportSessionRequest = useMutation({
        mutationFn: async (payload: { instructorId: number, childId: number, reason: string }) => {
            await sleep(500);
            console.log("Creating support session request (mock)", payload);
            return { ...payload, id: `sup_req_${Math.random()}` };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminSupportSessionRequests'] });
            addToast('تم إرسال طلبك للإدارة بنجاح.', 'success');
        },
        onError: (err: Error) => addToast(`فشل إرسال الطلب: ${err.message}`, 'error'),
    });

    return { createInstructor, updateInstructor, approveInstructorSchedule, rejectInstructorSchedule, updateInstructorAvailability, requestScheduleChange, requestProfileUpdate, approveSupportSessionRequest, rejectSupportSessionRequest, createSupportSessionRequest, approveInstructorProfileUpdate, rejectInstructorProfileUpdate };
}
