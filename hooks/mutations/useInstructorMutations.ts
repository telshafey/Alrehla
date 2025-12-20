
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../contexts/ToastContext';
import { supabase } from '../../lib/supabaseClient';
import type { WeeklySchedule, AvailableSlots } from '../../lib/database.types';
import { bookingService } from '../../services/bookingService';

export const useInstructorMutations = () => {
    const queryClient = useQueryClient();
    const { addToast } = useToast();

    const notifyAdmins = async (message: string, link: string) => {
        try {
            const { data: admins } = await supabase
                .from('profiles')
                .select('id')
                .in('role', ['super_admin', 'general_supervisor', 'creative_writing_supervisor']);

            if (admins && admins.length > 0) {
                const notifications = admins.map(admin => ({
                    user_id: admin.id,
                    message,
                    link,
                    type: 'instructor_update',
                    created_at: new Date().toISOString(),
                    read: false
                }));
                await supabase.from('notifications').insert(notifications);
            }
        } catch (e) {
            console.error("Failed to notify admins", e);
        }
    };

    const createInstructor = useMutation({
        mutationFn: bookingService.createInstructor,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminInstructors'] });
            queryClient.invalidateQueries({ queryKey: ['publicData'] });
            addToast('تم إضافة المدرب بنجاح.', 'success');
        },
        onError: (err: Error) => addToast(`فشل إضافة المدرب: ${err.message}`, 'error'),
    });

    const updateInstructor = useMutation({
        mutationFn: bookingService.updateInstructor,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminInstructors'] });
            queryClient.invalidateQueries({ queryKey: ['publicData'] });
            addToast('تم تحديث المدرب بنجاح.', 'success');
        },
        onError: (err: Error) => addToast(`فشل تحديث المدرب: ${err.message}`, 'error'),
    });

    const deleteInstructor = useMutation({
        mutationFn: (payload: { instructorId: number }) => bookingService.deleteInstructor(payload.instructorId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminInstructors'] });
            queryClient.invalidateQueries({ queryKey: ['publicData'] });
            addToast('تم حذف المدرب بنجاح.', 'info');
        },
        onError: (err: Error) => addToast(`فشل حذف المدرب: ${err.message}`, 'error'),
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
        onError: (err: Error) => addToast(`فشل تحديث المواعيد: ${err.message}`, 'error'),
    });

    const approveInstructorSchedule = useMutation({
        mutationFn: async ({ instructorId, modifiedSchedule }: { instructorId: number, modifiedSchedule?: WeeklySchedule }) => {
            const { data: instructor } = await supabase.from('instructors').select('pending_profile_data').eq('id', instructorId).single();
            const finalSchedule = modifiedSchedule || instructor?.pending_profile_data?.proposed_schedule;
            
            if (!finalSchedule) throw new Error("لا يوجد جدول للاعتماد.");

            const { error } = await supabase
                .from('instructors')
                .update({
                    weekly_schedule: finalSchedule,
                    schedule_status: 'approved',
                    pending_profile_data: { ...instructor?.pending_profile_data, proposed_schedule: null }
                })
                .eq('id', instructorId);

            if (error) throw error;
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminInstructors'] });
            addToast('تم اعتماد وتعديل الجدول بنجاح.', 'success');
        }
    });

    const approveIntroAvailability = useMutation({
        mutationFn: async ({ instructorId, modifiedAvailability }: { instructorId: number, modifiedAvailability?: AvailableSlots }) => {
            const { data: instructor } = await supabase.from('instructors').select('pending_profile_data').eq('id', instructorId).single();
            const finalAvail = modifiedAvailability || instructor?.pending_profile_data?.proposed_intro_availability;
            
            if (!finalAvail) throw new Error("لا توجد مواعيد للاعتماد.");

            const { error } = await supabase
                .from('instructors')
                .update({
                    intro_availability: finalAvail,
                    pending_profile_data: { 
                        ...instructor?.pending_profile_data, 
                        proposed_intro_availability: null,
                        intro_availability_requested_at: null 
                    }
                })
                .eq('id', instructorId);

            if (error) throw error;
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminInstructors'] });
            addToast('تم اعتماد مواعيد الجلسات التعريفية.', 'success');
        }
    });

    const approveInstructorProfileUpdate = useMutation({
        mutationFn: async ({ instructorId, modifiedUpdates }: { instructorId: number, modifiedUpdates?: any }) => {
             const { data: instructor } = await supabase.from('instructors').select('pending_profile_data').eq('id', instructorId).single();
             const finalUpdates = modifiedUpdates || instructor?.pending_profile_data?.updates;
            
            if (!finalUpdates) throw new Error("لا توجد تحديثات للاعتماد.");

            const { error } = await supabase
                .from('instructors')
                .update({
                    ...finalUpdates,
                    profile_update_status: 'approved',
                    pending_profile_data: null
                })
                .eq('id', instructorId);

            if (error) throw error;
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminInstructors'] });
            queryClient.invalidateQueries({ queryKey: ['publicData'] });
            addToast('تم اعتماد التعديلات بنجاح.', 'success');
        }
    });

    const rejectInstructorSchedule = useMutation({
        mutationFn: async ({ instructorId }: { instructorId: number }) => {
            const { data: instructor } = await supabase.from('instructors').select('pending_profile_data').eq('id', instructorId).single();
            const { error } = await supabase.from('instructors').update({ 
                schedule_status: 'rejected',
                pending_profile_data: { ...instructor?.pending_profile_data, proposed_schedule: null }
            }).eq('id', instructorId);
            if (error) throw error;
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminInstructors'] });
            addToast('تم رفض طلب تحديث الجدول.', 'info');
        }
    });

    const rejectInstructorProfileUpdate = useMutation({
        mutationFn: async ({ instructorId }: { instructorId: number }) => {
             const { error } = await supabase.from('instructors').update({ profile_update_status: 'rejected', pending_profile_data: null }).eq('id', instructorId);
            if (error) throw error;
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminInstructors'] });
            addToast('تم رفض طلب التحديث.', 'info');
        }
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
            queryClient.invalidateQueries({ queryKey: ['adminScheduledSessions'] });
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

    const createSupportSessionRequest = useMutation({
        mutationFn: async (payload: { instructorId: number, childId: number, reason: string }) => {
            const { error } = await supabase
                .from('support_session_requests')
                .insert([{ 
                    instructor_id: payload.instructorId, 
                    child_id: payload.childId, 
                    reason: payload.reason, 
                    status: 'pending', 
                    requested_at: new Date().toISOString() 
                }]);
            if (error) throw error;
            return { success: true };
        },
        onSuccess: () => {
            addToast('تم إرسال طلب الدعم بنجاح.', 'success');
        },
        onError: (err: Error) => addToast(`فشل إرسال الطلب: ${err.message}`, 'error'),
    });
    
    const requestProfileUpdate = useMutation({
        mutationFn: async (payload: { instructorId: number, updates: any, justification: string }) => {
            const { data: instructor } = await supabase.from('instructors').select('name').eq('id', payload.instructorId).single();
            const { error } = await supabase.from('instructors').update({
                profile_update_status: 'pending',
                pending_profile_data: { updates: payload.updates, justification: payload.justification, requested_at: new Date().toISOString() }
            }).eq('id', payload.instructorId);
            if (error) throw error;
            await notifyAdmins(`قام المدرب ${instructor?.name || ''} بطلب تحديث بياناته وأسعاره.`, `/admin/instructors/${payload.instructorId}`);
            return { success: true };
        },
        onSuccess: () => { addToast('تم إرسال طلبك بنجاح.', 'success'); }
    });

    const requestScheduleChange = useMutation({
        mutationFn: async ({ instructorId, schedule }: { instructorId: number, schedule: WeeklySchedule }) => {
            const { data: instructor } = await supabase.from('instructors').select('name').eq('id', instructorId).single();
            const { data: current } = await supabase.from('instructors').select('pending_profile_data').eq('id', instructorId).single();
            const { error } = await supabase.from('instructors').update({
                schedule_status: 'pending',
                pending_profile_data: { ...(current?.pending_profile_data || {}), proposed_schedule: schedule, schedule_requested_at: new Date().toISOString() }
            }).eq('id', instructorId);
            if (error) throw error;
            await notifyAdmins(`قام المدرب ${instructor?.name || ''} بطلب تعديل جدوله الأسبوعي.`, `/admin/instructors/${instructorId}`);
            return { success: true };
        },
        onSuccess: () => { addToast('تم إرسال طلب تعديل الجدول.', 'success'); }
    });

    const requestIntroAvailabilityChange = useMutation({
        mutationFn: async ({ instructorId, availability }: { instructorId: number, availability: AvailableSlots }) => {
            const { data: instructor } = await supabase.from('instructors').select('name').eq('id', instructorId).single();
            const { data: current } = await supabase.from('instructors').select('pending_profile_data').eq('id', instructorId).single();
            const { error } = await supabase.from('instructors').update({
                pending_profile_data: { ...(current?.pending_profile_data || {}), proposed_intro_availability: availability, intro_availability_requested_at: new Date().toISOString() }
            }).eq('id', instructorId);
            if (error) throw error;
            await notifyAdmins(`حدث المدرب ${instructor?.name || ''} مواعيد الجلسات التعريفية.`, `/admin/introductory-sessions`);
            return { success: true };
        },
        onSuccess: () => { addToast('تم تحديث مواعيدك التعريفية.', 'success'); }
    });

    return { 
        updateInstructor, approveInstructorSchedule, rejectInstructorSchedule, 
        requestScheduleChange, requestProfileUpdate, approveInstructorProfileUpdate, 
        rejectInstructorProfileUpdate, requestIntroAvailabilityChange, approveIntroAvailability,
        createInstructor, deleteInstructor, updateInstructorAvailability,
        approveSupportSessionRequest, rejectSupportSessionRequest, createSupportSessionRequest
    };
}
