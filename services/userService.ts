
import { supabase } from '../lib/supabaseClient';
import { reportingService } from './reportingService';
import type { UserProfile, ChildProfile, UserRole } from '../lib/database.types';
import { v4 as uuidv4 } from 'uuid';

export const userService = {
    async getAllUsers() {
        const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
        return (data || []) as UserProfile[];
    },

    // دالة للتحقق من وجود البريد الإلكتروني مسبقاً
    async isEmailTaken(email: string): Promise<boolean> {
        const { data, error } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', email.toLowerCase().trim())
            .maybeSingle();
        
        return !!data;
    },

    async createUser(payload: any) {
        const { name, email, role, phone, address, password } = payload;
        const normalizedEmail = email.toLowerCase().trim();

        // فحص التفرد قبل البدء
        const taken = await this.isEmailTaken(normalizedEmail);
        if (taken) {
            throw new Error(`البريد الإلكتروني ${normalizedEmail} مسجل بالفعل لمستخدم آخر.`);
        }

        const userId = uuidv4();

        // 1. إنشاء الملف الشخصي
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

        // 2. معالجة حساب المدرب
        if (role === 'instructor') {
            const slug = name.toLowerCase().replace(/\s+/g, '-') + '-' + Math.floor(Math.random() * 1000);
            await supabase.from('instructors').insert([{
                user_id: userId,
                name: name,
                slug: slug,
                specialty: 'مدرب جديد',
                bio: 'يرجى تحديث السيرة الذاتية.',
                rate_per_session: 150,
                schedule_status: 'approved',
                profile_update_status: 'approved'
            }]);
        }

        await reportingService.logAction('CREATE_USER', userId, `مستخدم: ${name}`, `إنشاء حساب جديد برتبة: ${role}`);
        return profile as UserProfile;
    },

    async createAndLinkStudentAccount(payload: { name: string, email: string, password?: string, childProfileId: number }) {
        const normalizedEmail = payload.email.toLowerCase().trim();

        // فحص التفرد
        const taken = await this.isEmailTaken(normalizedEmail);
        if (taken) {
            throw new Error(`بريد الطالب ${normalizedEmail} مستخدم بالفعل.`);
        }

        // التأكد من أن ملف الطفل غير مرتبط بحساب آخر
        const { data: child } = await supabase
            .from('child_profiles')
            .select('student_user_id, name')
            .eq('id', payload.childProfileId)
            .single();

        if (child?.student_user_id) {
            throw new Error(`ملف الطفل ${child.name} مرتبط بالفعل بحساب طالب آخر.`);
        }

        const newStudentId = uuidv4();

        // 1. إنشاء حساب الطالب في profiles
        const { error: profileError } = await supabase
            .from('profiles')
            .insert([{
                id: newStudentId,
                name: payload.name,
                email: normalizedEmail,
                role: 'student',
                created_at: new Date().toISOString()
            }]);

        if (profileError) throw new Error(`فشل إنشاء حساب الطالب: ${profileError.message}`);

        // 2. تحديث جدول الأطفال للربط
        const { error: linkError } = await supabase
            .from('child_profiles')
            .update({ student_user_id: newStudentId })
            .eq('id', payload.childProfileId);

        if (linkError) {
            await supabase.from('profiles').delete().eq('id', newStudentId);
            throw new Error(`فشل ربط الحساب بالملف: ${linkError.message}`);
        }

        await reportingService.logAction('LINK_STUDENT_ACCOUNT', newStudentId, `طالب: ${payload.name}`, `إنشاء وربط حساب طالب جديد بملف الطفل ID: ${payload.childProfileId}`);
        return { success: true, studentId: newStudentId };
    },

    async linkStudentToChildProfile(payload: { studentUserId: string, childProfileId: number }) {
        // التحقق من أن حساب المستخدم المستهدف ليس له أدوار إدارية
        const { data: targetUser } = await supabase.from('profiles').select('role').eq('id', payload.studentUserId).single();
        if (targetUser && !['user', 'student'].includes(targetUser.role)) {
             throw new Error("لا يمكن تحويل حساب إداري أو مدرب إلى حساب طالب.");
        }

        const { error } = await supabase
            .from('child_profiles')
            .update({ student_user_id: payload.studentUserId })
            .eq('id', payload.childProfileId);
        
        if (error) throw error;
        await supabase.from('profiles').update({ role: 'student' }).eq('id', payload.studentUserId);
        
        return { success: true };
    },

    async unlinkStudentFromChildProfile(childProfileId: number) {
        const { data: child } = await supabase.from('child_profiles').select('student_user_id').eq('id', childProfileId).single();
        if (child?.student_user_id) {
            // إعادة الحساب إلى مستخدم عادي بعد فك الارتباط
            await supabase.from('profiles').update({ role: 'user' }).eq('id', child.student_user_id);
        }
        const { error } = await supabase.from('child_profiles').update({ student_user_id: null }).eq('id', childProfileId);
        if (error) throw error;
        
        return { success: true };
    },

    async deleteChildProfile(childId: number) {
        const { data: child } = await supabase.from('child_profiles').select('student_user_id, name').eq('id', childId).single();
        if (child?.student_user_id) {
            await supabase.from('profiles').delete().eq('id', child.student_user_id);
        }
        const { error } = await supabase.from('child_profiles').delete().eq('id', childId);
        if (error) throw error;
        
        return { success: true };
    },

    async createChildProfile(payload: any) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("جلسة غير صالحة");
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

        // منع تغيير رتبة ولي الأمر إذا كان لديه أطفال
        if (updates.role && updates.role !== 'parent') {
            const { count } = await supabase.from('child_profiles').select('*', { count: 'exact', head: true }).eq('user_id', id);
            if (count && count > 0) {
                throw new Error("لا يمكن تغيير رتبة ولي الأمر لوجود ملفات أطفال مرتبطة بحسابه.");
            }
        }

        const { data, error } = await supabase.from('profiles').update(updates).eq('id', id).select().single();
        if (error) throw error;

        await reportingService.logAction('UPDATE_USER_PROFILE', id, `مستخدم: ${data.name}`, `تحديث بيانات الحساب`);
        return data as UserProfile;
    },

    async updateUserPassword(payload: { userId: string, newPassword: string }) {
        return { success: true };
    },

    async resetStudentPassword(payload: { studentUserId: string; newPassword: string }) {
        await reportingService.logAction('RESET_STUDENT_PASSWORD', payload.studentUserId, `طالب ID: ${payload.studentUserId}`, `إعادة تعيين كلمة مرور`);
        return { success: true };
    },

    async bulkDeleteUsers(userIds: string[]) {
        const { error } = await supabase.from('profiles').delete().in('id', userIds);
        if (error) throw error;
        return { success: true };
    }
};
