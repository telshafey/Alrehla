
import { supabase } from '../lib/supabaseClient';
import { apiClient } from '../lib/api';
import type { UserProfile, ChildProfile, UserRole } from '../lib/database.types';
import { v4 as uuidv4 } from 'uuid';

export const userService = {
    async getAllUsers() {
        const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
        return (data || []) as UserProfile[];
    },

    async createUser(payload: any) {
        return apiClient.post<UserProfile>('/admin/users/create', payload);
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
            // تراجع عن إنشاء البروفايل إذا فشل الربط
            await supabase.from('profiles').delete().eq('id', newStudentId);
            throw new Error(`فشل ربط الحساب: ${linkError.message}`);
        }

        return { success: true, studentId: newStudentId };
    },

    async linkStudentToChildProfile(payload: { studentUserId: string, childProfileId: number }) {
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
            await supabase.from('profiles').update({ role: 'user' }).eq('id', child.student_user_id);
        }
        const { error } = await supabase.from('child_profiles').update({ student_user_id: null }).eq('id', childProfileId);
        if (error) throw error;
        return { success: true };
    },

    async deleteChildProfile(childId: number) {
        const { data: child } = await supabase.from('child_profiles').select('student_user_id').eq('id', childId).single();
        if (child?.student_user_id) {
            await supabase.from('profiles').delete().eq('id', child.student_user_id);
        }
        const { error } = await supabase.from('child_profiles').delete().eq('id', childId);
        if (error) throw error;
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
        return data as UserProfile;
    },

    async updateUserPassword(payload: { userId: string, newPassword: string }) {
        return apiClient.post<{ success: boolean }>('/admin/users/update-password', payload);
    },

    async resetStudentPassword(payload: { studentUserId: string; newPassword: string }) {
        return apiClient.post<{ success: boolean }>('/admin/users/reset-password', payload);
    },

    async bulkDeleteUsers(userIds: string[]) {
        const { error } = await supabase.from('profiles').delete().in('id', userIds);
        if (error) throw error;
        return { success: true };
    }
};
