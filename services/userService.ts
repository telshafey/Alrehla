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
     * ربط حساب طالب بملف طفل وتغيير دوره في الـ DB فوراً
     */
    async linkStudentToChildProfile(payload: { studentUserId: string, childProfileId: number }) {
        // 1. تحديث سجل الطفل بالمعرف الجديد
        const { error: linkError } = await supabase
            .from('child_profiles')
            .update({ student_user_id: payload.studentUserId })
            .eq('id', payload.childProfileId);
        
        if (linkError) throw new Error(linkError.message);
        
        // 2. تغيير دور الحساب المرتبط إلى 'student' في قاعدة البيانات
        const { error: roleError } = await supabase
            .from('profiles')
            .update({ role: 'student' })
            .eq('id', payload.studentUserId);

        if (roleError) throw new Error("تم ربط الطفل ولكن فشل تحديث دور الحساب.");
        
        return { success: true };
    },

    async unlinkStudentFromChildProfile(childProfileId: number) {
        const { data: child } = await supabase.from('child_profiles').select('student_user_id').eq('id', childProfileId).single();
        
        // فك الارتباط
        const { error } = await supabase.from('child_profiles').update({ student_user_id: null }).eq('id', childProfileId);
        
        // إعادة المستخدم لدور user عادي إذا فك الارتباط
        if (child?.student_user_id) {
            await supabase.from('profiles').update({ role: 'user' }).eq('id', child.student_user_id);
        }

        if (error) throw new Error(error.message);
        return { success: true };
    },

    /**
     * إنشاء ملف طفل وتحويل صاحب الحساب لولي أمر تلقائياً
     */
    async createChildProfile(payload: any) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("جلسة غير صالحة");

        // 1. إضافة الطفل
        const { data: child, error: childError } = await supabase
            .from('child_profiles')
            .insert([{ ...payload, user_id: user.id }])
            .select()
            .single();

        if (childError) throw new Error(childError.message);

        // 2. تحويل صاحب الحساب إلى parent إذا كان user
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        if (profile?.role === 'user') {
            await supabase.from('profiles').update({ role: 'parent' }).eq('id', user.id);
        }

        return child as ChildProfile;
    },

    async updateChildProfile(payload: any) {
        const { id, ...updates } = payload;
        const { data, error } = await supabase.from('child_profiles').update(updates).eq('id', id).select().single();
        if (error) throw new Error(error.message);
        return data as ChildProfile;
    },

    async deleteChildProfile(childId: number) {
        // قبل الحذف، قد نحتاج للتحقق إذا كان هذا هو الطفل الأخير لتحويل الأب لـ user (اختياري)
        const { error } = await supabase.from('child_profiles').delete().eq('id', childId);
        if (error) throw new Error(error.message);
        return { success: true };
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
        const { error } = await supabase.from('profiles').delete().in('id', userIds);
        if (error) throw new Error(error.message);
        return { success: true };
    }
};