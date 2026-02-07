
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../contexts/ToastContext';
import { supabase } from '../../lib/supabaseClient';
import type { WeeklySchedule, AvailableSlots } from '../../lib/database.types';
import { bookingService } from '../../services/bookingService';
import { communicationService } from '../../services/communicationService';

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
            const { data: instructorData, error: fetchError } = await supabase
                .from('instructors')
                .select('pending_profile_data, user_id')
                .eq('id', instructorId)
                .single();
            
            if (fetchError) throw fetchError;
            
            const instructor = instructorData as any;
            const pendingSchedule = instructor.pending_profile_data?.proposed_schedule;
            
            if (!pendingSchedule) throw new Error("لا يوجد جدول مقترح.");

            const { error: updateError } = await (supabase.from('instructors') as any)
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
            
            // Notify Instructor
            if (instructor.user_id) {
                communicationService.sendNotification(instructor.user_id, "تمت الموافقة على جدولك الأسبوعي الجديد.", "/admin/schedule", "schedule_approved");
            }

            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminInstructors'] });
            addToast('تم اعتماد الجدول الجديد بنجاح.', 'success');
        }
    });
    
    const rejectInstructorSchedule = useMutation({
        mutationFn: async ({ instructorId }: { instructorId: number }) => {
            const { data: instructor } = await supabase.from('instructors').select('user_id').eq('id', instructorId).single();
            
            const { error } = await (supabase.from('instructors') as any).update({ schedule_status: 'rejected' }).eq('id', instructorId);
            if (error) throw error;

            if ((instructor as any)?.user_id) {
                communicationService.sendNotification((instructor as any).user_id, "تم رفض طلب تعديل الجدول. يرجى مراجعة الإدارة.", "/admin/schedule", "schedule_rejected");
            }
            
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminInstructors'] });
            addToast('تم رفض طلب تحديث الجدول.', 'info');
        }
    });

    const approveInstructorProfileUpdate = useMutation({
        mutationFn: async ({ instructorId, modifiedUpdates }: { instructorId: number, modifiedUpdates?: any }) => {
             const { data: instructorData, error: fetchError } = await supabase
                .from('instructors')
                .select('*')
                .eq('id', instructorId)
                .single();
            
            if (fetchError) throw fetchError;
            if (!instructorData) throw new Error("Instructor not found");

            const instructor = instructorData as any;

            const updatesSource = modifiedUpdates || instructor.pending_profile_data?.updates;
            
            if (!updatesSource) throw new Error("لا توجد تحديثات بانتظار الموافقة.");

            const { admin_feedback, ...dataToSave } = updatesSource;

            const { error: updateError } = await (supabase.from('instructors') as any)
                .update({
                    ...dataToSave,
                    profile_update_status: 'approved',
                    pending_profile_data: null 
                })
                .eq('id', instructorId);

            if (updateError) throw updateError;

            // Notify Instructor
            if (instructor.user_id) {
                const msg = admin_feedback 
                    ? `تم اعتماد تحديثات ملفك/أسعارك. ملاحظة الإدارة: ${admin_feedback}`
                    : `تم اعتماد تحديثات ملفك الشخصي والأسعار بنجاح.`;
                communicationService.sendNotification(instructor.user_id, msg, "/admin/profile", "profile_approved");
            }

            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminInstructors'] });
            queryClient.invalidateQueries({ queryKey: ['publicData'] });
            addToast('تم اعتماد التعديلات ونشرها بنجاح.', 'success');
        },
        onError: (err: Error) => {
            addToast(`فشل الاعتماد: ${err.message}`, 'error');
        }
    });

    const rejectInstructorProfileUpdate = useMutation({
        mutationFn: async ({ instructorId, feedback }: { instructorId: number, feedback?: string }) => {
            const { data: instructor } = await supabase.from('instructors').select('user_id, pending_profile_data').eq('id', instructorId).single();
            
            const currentPending = (instructor as any)?.pending_profile_data || {};
            const newPendingData = {
                ...currentPending,
                admin_feedback: feedback || 'تم رفض الطلب من قبل الإدارة.'
            };

            const { error } = await (supabase.from('instructors') as any)
                .update({ 
                    profile_update_status: 'rejected',
                    pending_profile_data: newPendingData
                })
                .eq('id', instructorId);
            
            if (error) throw error;

            if ((instructor as any)?.user_id) {
                 const msg = feedback ? `تم رفض طلب التحديث. السبب: ${feedback}` : "تم رفض طلب التحديث الخاص بك.";
                 communicationService.sendNotification((instructor as any).user_id, msg, "/admin/profile", "profile_rejected");
            }

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
            const instructorName = (instructor as any)?.name || '';

            const { error } = await (supabase.from('instructors') as any)
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
            
            communicationService.notifyAdmins(
                `قام المدرب ${instructorName} بطلب تحديث بياناته وأسعاره.`,
                `/admin/instructors/${payload.instructorId}`,
                'instructor_update'
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
            const { data: instructorData } = await supabase.from('instructors').select('name').eq('id', instructorId).single();
            const { data: currentData } = await supabase.from('instructors').select('pending_profile_data').eq('id', instructorId).single();
            
            const instructorName = (instructorData as any)?.name || '';
            const currentPending = (currentData as any)?.pending_profile_data || {};

            const { error } = await (supabase.from('instructors') as any)
                .update({
                    schedule_status: 'pending',
                    pending_profile_data: {
                        ...currentPending,
                        proposed_schedule: schedule,
                        schedule_requested_at: new Date().toISOString()
                    }
                })
                .eq('id', instructorId);

            if (error) throw error;

            communicationService.notifyAdmins(
                `قام المدرب ${instructorName} بطلب تعديل جدوله الأسبوعي.`,
                `/admin/instructors/${instructorId}`,
                'instructor_update'
            );

            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminInstructors'] });
            queryClient.invalidateQueries({ queryKey: ['instructorData'] });
            addToast('تم إرسال طلب تعديل الجدول.', 'success');
        }
    });

    const submitRescheduleRequest = useMutation({
        mutationFn: bookingService.submitRescheduleRequest,
        onSuccess: () => {
            addToast('تم إرسال طلب تغيير الموعد للإدارة بنجاح.', 'success');
        },
        onError: (err: Error) => {
            addToast(`فشل إرسال الطلب: ${err.message}`, 'error');
        }
    });

    const updateInstructorAvailability = useMutation({
        mutationFn: async ({ instructorId, availability }: { instructorId: number, availability: AvailableSlots }) => {
            const { error } = await (supabase.from('instructors') as any).update({ availability }).eq('id', instructorId);
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
            const { error } = await (supabase.from('support_session_requests') as any).update({ status: 'approved' }).eq('id', requestId);
            if (error) throw error;
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminSupportSessionRequests'] });
            addToast('تمت الموافقة على طلب جلسة الدعم.', 'success');
        }
    });

    const rejectSupportSessionRequest = useMutation({
        mutationFn: async ({ requestId }: { requestId: string }) => {
            const { error } = await (supabase.from('support_session_requests') as any).update({ status: 'rejected' }).eq('id', requestId);
            if (error) throw error;
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminSupportSessionRequests'] });
            addToast('تم رفض طلب جلسة الدعم.', 'info');
        }
    });

    const createSupportSessionRequest = useMutation({
        mutationFn: async (payload: { instructorId: number, childId: number, reason: string }) => {
            const { error } = await (supabase.from('support_session_requests') as any).insert([{
                instructor_id: payload.instructorId,
                child_id: payload.childId,
                reason: payload.reason,
                status: 'pending',
                requested_at: new Date().toISOString()
            }]);
            if (error) throw error;
            
            communicationService.notifyAdmins(
                `طلب جلسة دعم/تغيير من مدرب لسبب: ${payload.reason.substring(0, 30)}...`,
                '/admin/scheduled-sessions?tab=support',
                'support_request'
            );

            return { success: true };
        },
        onSuccess: () => {
            addToast('تم إرسال طلب جلسة الدعم بنجاح.', 'success');
        }
    });

    const requestIntroAvailabilityChange = useMutation({
        mutationFn: async ({ instructorId, availability }: { instructorId: number, availability: AvailableSlots }) => {
            const { error } = await (supabase.from('instructors') as any).update({ intro_availability: availability }).eq('id', instructorId);
            if (error) throw error;
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminInstructors'] });
            queryClient.invalidateQueries({ queryKey: ['instructorData'] });
            addToast('تم تحديث مواعيد الجلسات التعريفية.', 'success');
        }
    });

    return { 
        createInstructor, updateInstructor, deleteInstructor,
        approveInstructorSchedule, rejectInstructorSchedule, updateInstructorAvailability, 
        requestScheduleChange, requestProfileUpdate, submitRescheduleRequest,
        approveInstructorProfileUpdate, rejectInstructorProfileUpdate,
        approveSupportSessionRequest, rejectSupportSessionRequest,
        createSupportSessionRequest, requestIntroAvailabilityChange
    };
}
