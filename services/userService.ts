import { supabase } from '../lib/supabaseClient';
import { apiClient } from '../lib/api';
import type { UserProfile, ChildProfile, UserRole } from '../lib/database.types';

export const userService = {
    async getAllUsers() {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) return [];
        return data as UserProfile[];
    },

    async createUser(payload: any) {
        return apiClient.post<UserProfile>('/admin/users/create', payload);
    },

    /**
     * ربط حساب طالب وتحديث الأدوار
     */
    async linkStudentToChildProfile(payload: { studentUserId: string, childProfileId: number }) {
        const { data: child, error: linkError } = await supabase
            .from('child_profiles')
            .update({ student_user_id: payload.studentUserId })
            .eq('id', payload.childProfileId)
            .select('user_id')
            .single();
        
        if (linkError) throw new Error(linkError.message);
        
        // تحديث دور الحساب المربوط ليصبح 'student'
        await supabase.from('profiles').update({ role: 'student' }).eq('id', payload.studentUserId);
        
        // تحديث دور ولي الأمر ليصبح 'parent'
        if (child?.user_id) {
            await supabase.from('profiles').update({ role: 'parent' }).eq('id', child.user_id);
        }
        
        return { success: true };
    },

    /**
     * فك الارتباط: يعيد الطالب مستخدم عادي
     */
    async unlinkStudentFromChildProfile(childProfileId: number) {
        const { data: child } = await supabase.from('child_profiles').select('user_id, student_user_id').eq('id', childProfileId).single();
        
        const { error } = await supabase.from('child_profiles').update({ student_user_id: null }).eq('id', childProfileId);
        
        if (child?.student_user_id) {
            await supabase.from('profiles').update({ role: 'user' }).eq('id', child.student_user_id);
            
            // تحقق هل بقي للأب طلاب آخرون؟
            const { count } = await supabase.from('child_profiles').select('*', { count: 'exact', head: true }).eq('user_id', child.user_id).not('student_user_id', 'is', null);
            if (count === 0) {
                await supabase.from('profiles').update({ role: 'user' }).eq('id', child.user_id);
            }
        }

        if (error) throw new Error(error.message);
        return { success: true };
    },

    /**
     * حذف ملف طفل: يحذف معه حساب الطالب المرتبط به نهائياً (حل مشكلة تالا)
     */
    async deleteChildProfile(childId: number) {
        const { data: child } = await supabase.from('child_profiles').select('user_id, student_user_id').eq('id', childId).single();
        
        // 1. إذا كان له حساب طالب، نحذفه من جدول الحسابات أولاً
        if (child?.student_user_id) {
            await supabase.from('profiles').delete().eq('id', child.student_user_id);
        }

        // 2. حذف ملف الطفل
        const { error } = await supabase.from('child_profiles').delete().eq('id', childId);
        if (error) throw new Error(error.message);

        // 3. تحديث دور الأب إذا أصبح بلا طلاب
        if (child?.user_id) {
            const { count } = await supabase.from('child_profiles').select('*', { count: 'exact', head: true }).eq('user_id', child.user_id).not('student_user_id', 'is', null);
            if (count === 0) {
                await supabase.from('profiles').update({ role: 'user' }).eq('id', child.user_id);
            }
        }
        
        return { success: true };
    },

    async createChildProfile(payload: any) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("جلسة غير صالحة");
        const { data: child, error: childError } = await supabase.from('child_profiles').insert([{ ...payload, user_id: user.id }]).select().single();
        if (childError) throw new Error(childError.message);
        return child as ChildProfile;
    },

    async updateChildProfile(payload: any) {
        const { id, ...updates } = payload;
        const { data, error } = await supabase.from('child_profiles').update(updates).eq('id', id).select().single();
        if (error) throw new Error(error.message);
        return data as ChildProfile;
    },

    async getAllChildProfiles() {
        const { data, error } = await supabase.from('child_profiles').select('*');
        return (data || []) as ChildProfile[];
    },

    async updateUser(payload: { id: string; [key: string]: any }) {
        const { id, ...updates } = payload;
        const { data, error } = await supabase.from('profiles').update(updates).eq('id', id).select().single();
        if (error) throw new Error(error.message);
        return data as UserProfile;
    },

    async updateUserPassword(payload: { userId: string, newPassword: string }) {
        return apiClient.post<{ success: boolean }>('/admin/users/update-password', payload);
    },

    async createAndLinkStudentAccount(payload: any) {
        return apiClient.post<any>('/admin/users/create-student', payload);
    },

    async resetStudentPassword(payload: { studentUserId: string; newPassword: string }) {
        return apiClient.post<{ success: boolean }>('/admin/users/reset-password', payload);
    },

    async bulkDeleteUsers(userIds: string[]) {
        // حذف الأطفال المرتبطين بهؤلاء المستخدمين أولاً لضمان تنظيف الطلاب
        for (const uid of userIds) {
            const { data: children } = await supabase.from('child_profiles').select('id').eq('user_id', uid);
            if (children) {
                for (const c of children) await this.deleteChildProfile(c.id);
            }
        }
        const { error } = await supabase.from('profiles').delete().in('id', userIds);
        if (error) throw new Error(error.message);
        return { success: true };
    }
};