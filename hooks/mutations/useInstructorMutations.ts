
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../contexts/ToastContext';
import { supabase } from '../../lib/supabaseClient';
import type { WeeklySchedule, AvailableSlots } from '../../lib/database.types';
import { bookingService } from '../../services/bookingService';

export const useInstructorMutations = () => {
    const queryClient = useQueryClient();
    const { addToast } = useToast();

    const createInstructor = useMutation({
        mutationFn: bookingService.createInstructor,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminInstructors'] });
            queryClient.invalidateQueries({ queryKey: ['publicData'] });
            addToast('تم إضافة المدرب بنجاح.', 'success');
        },
        onError: (err: Error) => {
            if (err.message.includes('instructors_slug_key') || err.message.includes('duplicate key')) {
                addToast('فشل الإضافة: معرّف الرابط (Slug) مستخدم بالفعل. يرجى اختيار معرف آخر.', 'error');
            } else {
                addToast(`فشل إضافة المدرب: ${err.message}`, 'error');
            }
        },
    });
    
    const updateInstructor = useMutation({
        mutationFn: bookingService.updateInstructor,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminInstructors'] });
            queryClient.invalidateQueries({ queryKey: ['publicData'] });
            addToast('تم تحديث المدرب بنجاح.', 'success');
        },
        onError: (err: Error) => {
            addToast(`فشل تحديث المدرب: ${err.message}`, 'error');
        },
    });

    const deleteInstructor = useMutation({
        mutationFn: ({ instructorId }: { instructorId: number }) => bookingService.deleteInstructor(instructorId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminInstructors'] });
            queryClient.invalidateQueries({ queryKey: ['publicData'] });
            addToast('تم حذف المدرب بنجاح.', 'info');
        },
        onError: (err: Error) => addToast(`فشل حذف المدرب: ${err.message}`, 'error'),
    });

    // --- Approval Logic ---

    const approveInstructorSchedule = useMutation({
        mutationFn: async ({ instructorId }: { instructorId: number }) => {
            // 1. Get the pending schedule from pending_profile_data
            const { data: instructor, error: fetchError } = await supabase
                .from('instructors')
                .select('pending_profile_data')
                .eq('id', instructorId)
                .single();
            
            if (fetchError) throw fetchError;
            const pendingSchedule = instructor.pending_profile_data?.proposed_schedule;
            if (!pendingSchedule) throw new Error("لم يتم العثور على جدول مقترح للموافقة عليه.");

            // 2. Apply it to the main weekly_schedule and reset status
            const { error: updateError } = await supabase
                .from('instructors')
                .update({
                    weekly_schedule: pendingSchedule,
                    schedule_status: 'approved',
                    // Clean up specific key in JSONB or just reset entire data if it was only schedule
                    pending_profile_data: { 
                        ...instructor.pending_profile_data, 
                        proposed_schedule: null 
                    }
                })
                .eq('id', instructorId);

            if (updateError) throw updateError;
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminInstructors'] });
            addToast('تمت الموافقة على الجدول الجديد وتفعيله بنجاح.', 'success');
        },
        onError: (err: Error) => addToast(`فشل الموافقة: ${err.message}`, 'error'),
    });
    
    const rejectInstructorSchedule = useMutation({
        mutationFn: async ({ instructorId }: { instructorId: number }) => {
            const { error } = await supabase
                .from('instructors')
                .update({ 
                    schedule_status: 'rejected',
                    // We keep the pending data for reference but reset the status
                })
                .eq('id', instructorId);
            if (error) throw error;
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminInstructors'] });
            addToast('تم رفض طلب تحديث الجدول.', 'info');
        },
        onError: (err: Error) => addToast(`فشل الرفض: ${err.message}`, 'error'),
    });

    const approveInstructorProfileUpdate = useMutation({
        mutationFn: async ({ instructorId }: { instructorId: number }) => {
             // 1. Get the pending updates
             const { data: instructor, error: fetchError } = await supabase
                .from('instructors')
                .select('*')
                .eq('id', instructorId)
                .single();
            
            if (fetchError) throw fetchError;
            const updates = instructor.pending_profile_data?.updates;
            if (!updates) throw new Error("لا توجد تحديثات بيانات بانتظار الموافقة.");

            // 2. Apply all updates and reset status
            const { error: updateError } = await supabase
                .from('instructors')
                .update({
                    ...updates,
                    profile_update_status: 'approved',
                    pending_profile_data: null // Clear the bucket
                })
                .eq('id', instructorId);

            if (updateError) throw updateError;
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminInstructors'] });
            queryClient.invalidateQueries({ queryKey: ['publicData'] });
            addToast('تم اعتماد التعديلات الجديدة بنجاح.', 'success');
        },
        onError: (err: Error) => addToast(`فشل الاعتماد: ${err.message}`, 'error'),
    });

    const rejectInstructorProfileUpdate = useMutation({
        mutationFn: async ({ instructorId }: { instructorId: number }) => {
             const { error } = await supabase
                .from('instructors')
                .update({ profile_update_status: 'rejected' })
                .eq('id', instructorId);
            if (error) throw error;
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminInstructors'] });
            addToast('تم رفض طلب تحديث البيانات.', 'info');
        },
        onError: (err: Error) => addToast(`فشل الرفض: ${err.message}`, 'error'),
    });
    
    // --- Instructor Requests Logic ---

    const requestProfileUpdate = useMutation({
        mutationFn: async (payload: { instructorId: number, updates: any, justification: string }) => {
            const { error } = await supabase
                .from('instructors')
                .update({
                    profile_update_status: 'pending',
                    pending_profile_data: {
                        updates: payload.updates,
                        justification: payload.justification,
                        requested_at: new Date().toISOString()
                    }
                })
                .eq('id', payload.instructorId);

            if (error) throw error;
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminInstructors'] });
            queryClient.invalidateQueries({ queryKey: ['instructorData'] });
            addToast('تم إرسال طلب تحديث ملفك بنجاح. سيقوم المسؤول بمراجعته قريباً.', 'success');
        },
        onError: (err: Error) => addToast(`فشل إرسال الطلب: ${err.message}`, 'error'),
    });

    const requestScheduleChange = useMutation({
        mutationFn: async ({ instructorId, schedule }: { instructorId: number, schedule: WeeklySchedule }) => {
            // We get the current pending_profile_data to not overwrite other things like justification
            const { data: current } = await supabase.from('instructors').select('pending_profile_data').eq('id', instructorId).single();
            
            const { error } = await supabase
                .from('instructors')
                .update({
                    schedule_status: 'pending',
                    pending_profile_data: {
                        ...(current?.pending_profile_data || {}),
                        proposed_schedule: schedule,
                        schedule_requested_at: new Date().toISOString()
                    }
                })
                .eq('id', instructorId);

            if (error) throw error;
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminInstructors'] });
            queryClient.invalidateQueries({ queryKey: ['instructorData'] });
            addToast('تم إرسال طلب تعديل الجدول بنجاح للمراجعة.', 'success');
        },
        onError: (err: Error) => addToast(`فشل إرسال طلب الجدول: ${err.message}`, 'error'),
    });

    // Added mutation for introductory availability requests
    const requestIntroAvailabilityChange = useMutation({
        mutationFn: async ({ instructorId, availability }: { instructorId: number, availability: AvailableSlots }) => {
            const { data: current } = await supabase.from('instructors').select('pending_profile_data').eq('id', instructorId).single();
            
            const { error } = await supabase
                .from('instructors')
                .update({
                    pending_profile_data: {
                        ...(current?.pending_profile_data || {}),
                        proposed_intro_availability: availability,
                        intro_availability_requested_at: new Date().toISOString()
                    }
                })
                .eq('id', instructorId);

            if (error) throw error;
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminInstructors'] });
            queryClient.invalidateQueries({ queryKey: ['instructorData'] });
            addToast('تم إرسال طلب تحديث مواعيد الجلسات التعريفية بنجاح.', 'success');
        },
        onError: (err: Error) => addToast(`فشل إرسال طلب الجلسات التعريفية: ${err.message}`, 'error'),
    });

    const updateInstructorAvailability = useMutation({
        mutationFn: async ({ instructorId, availability }: { instructorId: number, availability: AvailableSlots }) => {
            const { error } = await supabase
                .from('instructors')
                .update({ availability })
                .eq('id', instructorId);
            if (error) throw error;
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminInstructors'] });
            addToast('تم تحديث المواعيد المتاحة بنجاح.', 'success');
        },
        onError: (err: Error) => addToast(`فشل التحديث: ${err.message}`, 'error'),
    });

    const createSupportSessionRequest = useMutation({
        mutationFn: async (payload: { instructorId: number, childId: number, reason: string }) => {
            const { data, error } = await supabase
                .from('support_session_requests')
                .insert([{
                    instructor_id: payload.instructorId,
                    child_id: payload.childId,
                    reason: payload.reason,
                    status: 'pending',
                    requested_at: new Date().toISOString()
                }])
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminSupportSessionRequests'] });
            addToast('تم إرسال طلبك للإدارة بنجاح.', 'success');
        },
        onError: (err: Error) => addToast(`فشل إرسال الطلب: ${err.message}`, 'error'),
    });

    const approveSupportSessionRequest = useMutation({
        mutationFn: async ({ requestId }: { requestId: string }) => {
            const { error } = await supabase
                .from('support_session_requests')
                .update({ status: 'approved' })
                .eq('id', requestId);
            if (error) throw error;
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
            const { error } = await supabase
                .from('support_session_requests')
                .update({ status: 'rejected' })
                .eq('id', requestId);
            if (error) throw error;
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminSupportSessionRequests'] });
            addToast('تم رفض طلب الدعم.', 'info');
        },
        onError: (err: Error) => addToast(`فشل: ${err.message}`, 'error'),
    });

    return { 
        createInstructor, 
        updateInstructor, 
        deleteInstructor,
        approveInstructorSchedule, 
        rejectInstructorSchedule, 
        updateInstructorAvailability, 
        requestScheduleChange, 
        requestProfileUpdate, 
        approveSupportSessionRequest, 
        rejectSupportSessionRequest, 
        createSupportSessionRequest, 
        approveInstructorProfileUpdate, 
        rejectInstructorProfileUpdate,
        requestIntroAvailabilityChange
    };
}
