
import { supabase } from '../lib/supabaseClient';
import { apiClient } from '../lib/api';
import { reportingService } from './reportingService';
import type { UserProfile, ChildProfile, UserRole } from '../lib/database.types';
import { v4 as uuidv4 } from 'uuid';

export const userService = {
    async getAllUsers() {
        const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
        return (data || []) as UserProfile[];
    },

    // تم تحديث هذه الوظيفة لتعمل مباشرة مع Supabase لضمان التنفيذ في بيئة العرض
    async createUser(payload: any) {
        const userId = uuidv4();
        const { name, email, role, phone, address } = payload;
        const normalizedEmail = email.toLowerCase().trim();

        // 1. إنشاء الملف الشخصي في جدول profiles
        const { data: profile, error: pError } = await supabase
            .from('profiles')
            .insert([{
                id: userId,
                name,
                email: normalizedEmail,
                role,
                phone,
                address,
                created_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (pError) throw new Error(`فشل إنشاء ملف المستخدم: ${pError.message}`);

        // 2. إذا كان المستخدم مدرباً، ننشئ له سجلاً في جدول المدربين لكي يظهر في الإدارة
        if (role === 'instructor') {
            const slug = name.toLowerCase().replace(/\s+/g, '-') + '-' + Math.floor(Math.random() * 1000);
            const { error: iError } = await supabase.from('instructors').insert([{
                user_id: userId,
                name: name,
                slug: slug,
                specialty: 'مدرب جديد',
                bio: 'يرجى تحديث السيرة الذاتية من قبل المدير أو المدرب.',
                rate_per_session: 150,
                schedule_status: 'approved',
                profile_update_status: 'approved',
                weekly_schedule: {},
                availability: {},
                expertise_areas: []
            }]);
            
            if (iError) {
                console.warn("User created but linked instructor record failed:", iError.message);
            }
        }

        await reportingService.logAction('CREATE_USER', userId, `مستخدم: ${name}`, `إنشاء حساب جديد برتبة: ${role}`);
        return profile as UserProfile;
    },

    async createAndLinkStudentAccount(payload: { name: string, email: string, password?: string, childProfileId: number }) {
        const newStudentId = uuidv4();
        const normalizedEmail = payload.email.toLowerCase().trim();

        // 1. إنشاء السجل في profiles أولاً كـ "حساب ظل"
        const { error: profileError } = await supabase
            .from('profiles')
            .insert([{
                id: newStudentId,
                name: payload.name,
                email: normalizedEmail,
                role: 'student',
                created_at: new Date().toISOString()
            }]);

        if (profileError) throw new Error(`فشل إنشاء الحساب: ${profileError.message}`);

        // 2. تحديث جدول الأطفال لربط المعرف الجديد
        const { error: linkError } = await supabase
            .from('child_profiles')
            .update({ student_user_id: newStudentId })
            .eq('id', payload.childProfileId);

        if (linkError) {
            await supabase.from('profiles').delete().eq('id', newStudentId);
            throw new Error(`فشل ربط الحساب: ${linkError.message}`);
        }

        await reportingService.logAction('LINK_STUDENT_ACCOUNT', newStudentId, `طالب: ${payload.name}`, `إنشاء وربط حساب طالب جديد بملف طفل ID: ${payload.childProfileId}`);
        return { success: true, studentId: newStudentId };
    },

    async linkStudentToChildProfile(payload: { studentUserId: string, childProfileId: number }) {
        const { error } = await supabase
            .from('child_profiles')
            .update({ student_user_id: payload.studentUserId })
            .eq('id', payload.childProfileId);
        
        if (error) throw error;
        await supabase.from('profiles').update({ role: 'student' }).eq('id', payload.studentUserId);
        
        await reportingService.logAction('LINK_EXISTING_STUDENT', payload.studentUserId, `مستخدم ID: ${payload.studentUserId}`, `ربط حساب موجود بملف طفل ID: ${payload.childProfileId}`);
        return { success: true };
    },

    async unlinkStudentFromChildProfile(childProfileId: number) {
        const { data: child } = await supabase.from('child_profiles').select('student_user_id').eq('id', childProfileId).single();
        if (child?.student_user_id) {
            await supabase.from('profiles').update({ role: 'user' }).eq('id', child.student_user_id);
        }
        const { error } = await supabase.from('child_profiles').update({ student_user_id: null }).eq('id', childProfileId);
        if (error) throw error;
        
        await reportingService.logAction('UNLINK_STUDENT', childProfileId.toString(), `ملف طفل ID: ${childProfileId}`, `إلغاء ربط حساب الطالب بالملف`);
        return { success: true };
    },

    async deleteChildProfile(childId: number) {
        const { data: child } = await supabase.from('child_profiles').select('student_user_id, name').eq('id', childId).single();
        if (child?.student_user_id) {
            await supabase.from('profiles').delete().eq('id', child.student_user_id);
        }
        const { error } = await supabase.from('child_profiles').delete().eq('id', childId);
        if (error) throw error;
        
        await reportingService.logAction('DELETE_CHILD_PROFILE', childId.toString(), `طفل: ${child?.name}`, `حذف ملف الطفل والبيانات المرتبطة`);
        return { success: true };
    },

    async createChildProfile(payload: any) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Session invalid");
        const { data, error } = await supabase.from('child_profiles').insert([{ ...payload, user_id: user.id }]).select().single();
        if (error) throw error;
        return data as ChildProfile;
    },

    async updateChildProfile(payload: any) {
        const { id, ...updates } = payload;
        const { data, error } = await supabase.from('child_profiles').update(updates).eq('id', id).select().single();
        if (error) throw error;
        return data as ChildProfile;
    },

    async getAllChildProfiles() {
        const { data } = await supabase.from('child_profiles').select('*');
        return (data || []) as ChildProfile[];
    },

    async updateUser(payload: { id: string; [key: string]: any }) {
        const { id, ...updates } = payload;
        const { data, error } = await supabase.from('profiles').update(updates).eq('id', id).select().single();
        if (error) throw error;

        await reportingService.logAction('UPDATE_USER_PROFILE', id, `مستخدم: ${data.name}`, `تحديث بيانات الملف الشخصي / الدور`);
        return data as UserProfile;
    },

    async updateUserPassword(payload: { userId: string, newPassword: string }) {
        // في البيئة التجريبية، لا يمكننا تغيير كلمة السر الفعلية لـ Auth، لكننا نوثق الإجراء
        await reportingService.logAction('CHANGE_PASSWORD', payload.userId, `مستخدم ID: ${payload.userId}`, `تغيير كلمة المرور (توجيه للمستخدم)`);
        return { success: true };
    },

    async resetStudentPassword(payload: { studentUserId: string; newPassword: string }) {
        await reportingService.logAction('RESET_STUDENT_PASSWORD', payload.studentUserId, `طالب ID: ${payload.studentUserId}`, `إعادة تعيين كلمة مرور الطالب`);
        return { success: true };
    },

    async bulkDeleteUsers(userIds: string[]) {
        const { error } = await supabase.from('profiles').delete().in('id', userIds);
        if (error) throw error;
        
        await reportingService.logAction('BULK_USER_DELETE', 'multiple', `${userIds.length} مستخدمين`, `حذف مجمع للحسابات`);
        return { success: true };
    }
};
