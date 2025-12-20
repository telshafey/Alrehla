
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../contexts/ToastContext';
import { supabase } from '../../lib/supabaseClient';
import type { WeeklySchedule, AvailableSlots } from '../../lib/database.types';
import { bookingService } from '../../services/bookingService';

export const useInstructorMutations = () => {
    const queryClient = useQueryClient();
    const { addToast } = useToast();

    // دالة مساعدة لإرسال إشعار للمسؤولين
    const notifyAdmins = async (message: string, link: string) => {
        try {
            // جلب قائمة المسؤولين
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
        onError: (err: Error) => {
            if (err.message.includes('instructors_slug_key') || err.message.includes('duplicate key')) {
                addToast('فشل الإضافة: معرّف الرابط (Slug) مستخدم بالفعل.', 'error');
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

    const approveInstructorSchedule = useMutation({
        mutationFn: async ({ instructorId }: { instructorId: number }) => {
            const { data: instructor, error: fetchError } = await supabase
                .from('instructors')
                .select('pending_profile_data')
                .eq('id', instructorId)
                .single();
            
            if (fetchError) throw fetchError;
            const pendingSchedule = instructor.pending_profile_data?.proposed_schedule;
            if (!pendingSchedule) throw new Error("لا يوجد جدول مقترح.");

            const { error: updateError } = await supabase
                .from('instructors')
                .update({
                    weekly_schedule: pendingSchedule,
                    schedule_status: 'approved',
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
            addToast('تم اعتماد الجدول الجديد بنجاح.', 'success');
        }
    });
    
    const rejectInstructorSchedule = useMutation({
        mutationFn: async ({ instructorId }: { instructorId: number }) => {
            const { error } = await supabase.from('instructors').update({ schedule_status: 'rejected' }).eq('id', instructorId);
            if (error) throw error;
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminInstructors'] });
            addToast('تم رفض طلب تحديث الجدول.', 'info');
        }
    });

    const approveInstructorProfileUpdate = useMutation({
        mutationFn: async ({ instructorId, modifiedUpdates }: { instructorId: number, modifiedUpdates?: any }) => {
             const { data: instructor, error: fetchError } = await supabase
                .from('instructors')
                .select('*')
                .eq('id', instructorId)
                .single();
            
            if (fetchError) throw fetchError;
            
            // Use modifiedUpdates if provided by admin, otherwise use original pending updates
            const finalUpdates = modifiedUpdates || instructor.pending_profile_data?.updates;
            
            if (!finalUpdates) throw new Error("لا توجد تحديثات بانتظار الموافقة.");

            const { error: updateError } = await supabase
                .from('instructors')
                .update({
                    ...finalUpdates,
                    profile_update_status: 'approved',
                    pending_profile_data: null
                })
                .eq('id', instructorId);

            if (updateError) throw updateError;
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminInstructors'] });
            queryClient.invalidateQueries({ queryKey: ['publicData'] });
            addToast('تم اعتماد التعديلات بنجاح.', 'success');
        }
    });

    const rejectInstructorProfileUpdate = useMutation({
        mutationFn: async ({ instructorId }: { instructorId: number }) => {
             const { error } = await supabase.from('instructors').update({ profile_update_status: 'rejected' }).eq('id', instructorId);
            if (error) throw error;
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminInstructors'] });
            addToast('تم رفض طلب التحديث.', 'info');
        }
    });
    
    const requestProfileUpdate = useMutation({
        mutationFn: async (payload: { instructorId: number, updates: any, justification: string }) => {
            const { data: instructor } = await supabase.from('instructors').select('name').eq('id', payload.instructorId).single();
            
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
            
            // إرسال إشعار للمسؤولين
            await notifyAdmins(
                `قام المدرب ${instructor?.name || ''} بطلب تحديث بياناته وأسعاره.`,
                `/admin/instructors/${payload.instructorId}`
            );

            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminInstructors'] });
            queryClient.invalidateQueries({ queryKey: ['instructorData'] });
            addToast('تم إرسال طلبك بنجاح.', 'success');
        }
    });

    const requestScheduleChange = useMutation({
        mutationFn: async ({ instructorId, schedule }: { instructorId: number, schedule: WeeklySchedule }) => {
            const { data: instructor } = await supabase.from('instructors').select('name').eq('id', instructorId).single();
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

            // إرسال إشعار للمسؤولين
            await notifyAdmins(
                `قام المدرب ${instructor?.name || ''} بطلب تعديل جدوله الأسبوعي.`,
                `/admin/instructors/${instructorId}`
            );

            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminInstructors'] });
            queryClient.invalidateQueries({ queryKey: ['instructorData'] });
            addToast('تم إرسال طلب تعديل الجدول.', 'success');
        }
    });

    const requestIntroAvailabilityChange = useMutation({
        mutationFn: async ({ instructorId, availability }: { instructorId: number, availability: AvailableSlots }) => {
            const { data: instructor } = await supabase.from('instructors').select('name').eq('id', instructorId).single();
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

            await notifyAdmins(
                `حدث المدرب ${instructor?.name || ''} مواعيد الجلسات التعريفية.`,
                `/admin/introductory-sessions`
            );

            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminInstructors'] });
            queryClient.invalidateQueries({ queryKey: ['instructorData'] });
            addToast('تم تحديث مواعيدك التعريفية.', 'success');
        }
    });

    const updateInstructorAvailability = useMutation({
        mutationFn: async ({ instructorId, availability }: { instructorId: number, availability: AvailableSlots }) => {
            const { error } = await supabase.from('instructors').update({ availability }).eq('id', instructorId);
            if (error) throw error;
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminInstructors'] });
            addToast('تم تحديث المواعيد.', 'success');
        }
    });

    const approveSupportSessionRequest = useMutation({
        mutationFn: async ({ requestId }: { requestId: string }) => {
            const { error } = await supabase.from('support_session_requests').update({ status: 'approved' }).eq('id', requestId);
            if (error) throw error;
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminSupportSessionRequests'] });
            addToast('تمت الموافقة على طلب الجلسة.', 'success');
        }
    });
    
    const rejectSupportSessionRequest = useMutation({
        mutationFn: async ({ requestId }: { requestId: string }) => {
            const { error } = await supabase.from('support_session_requests').update({ status: 'rejected' }).eq('id', requestId);
            if (error) throw error;
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminSupportSessionRequests'] });
            addToast('تم رفض طلب الجلسة.', 'info');
        }
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
            addToast('تم إرسال طلب جلسة الدعم بنجاح.', 'success');
        }
    });

    return { 
        createInstructor, updateInstructor, deleteInstructor,
        approveInstructorSchedule, rejectInstructorSchedule, updateInstructorAvailability, 
        requestScheduleChange, requestProfileUpdate, 
        approveInstructorProfileUpdate, rejectInstructorProfileUpdate,
        requestIntroAvailabilityChange,
        approveSupportSessionRequest, rejectSupportSessionRequest, createSupportSessionRequest
    };
}
