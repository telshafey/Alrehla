
import { supabase } from '../lib/supabaseClient';
import type { UserProfile, ChildProfile } from '../lib/database.types';

export const userService = {
    // --- Queries ---
    async getAllUsers() {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw new Error(error.message);
        return data as UserProfile[];
    },

    async getAllChildProfiles() {
        const { data, error } = await supabase
            .from('child_profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);
        return data as ChildProfile[];
    },

    async getUserById(id: string) {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw new Error(error.message);
        return data as UserProfile;
    },

    // --- Mutations ---
    async updateUser(payload: { id: string, name?: string, role?: string, address?: string, governorate?: string, phone?: string }) {
        const { data, error } = await supabase
            .from('profiles')
            .update(payload)
            .eq('id', payload.id)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data as UserProfile;
    },

    async updateUserPassword(payload: { userId: string, newPassword?: string }) {
        // Note: Updating another user's password requires Service Role key (Server-side).
        // Client-side can only update OWN password.
        const { error } = await supabase.auth.updateUser({ password: payload.newPassword });
        if (error) throw new Error(error.message);
        return { success: true };
    },

    async createChildProfile(payload: any) {
        // Ensure user_id is set (usually from auth context, but explicitly handled here)
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not logged in');

        const { data, error } = await supabase
            .from('child_profiles')
            .insert([{ ...payload, user_id: user.id }])
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data as ChildProfile;
    },

    async updateChildProfile(payload: any) {
        const { data, error } = await supabase
            .from('child_profiles')
            .update(payload)
            .eq('id', payload.id)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data as ChildProfile;
    },

    async deleteChildProfile(childId: number) {
        const { error } = await supabase
            .from('child_profiles')
            .delete()
            .eq('id', childId);

        if (error) throw new Error(error.message);
        return { success: true };
    },

    async createAndLinkStudentAccount(payload: { name: string, email: string, password: string, childProfileId: number }) {
        // This operation requires creating a new User in Supabase Auth.
        // Important: Client-side SDK cannot create a user without logging the current user out,
        // unless you use a secondary client or Edge Function.
        // For now, we will simulate linking if the user is already created manually, or throw error.
        
        // Real implementation should call a Supabase Edge Function:
        // const { data, error } = await supabase.functions.invoke('create-student-user', { body: payload });
        
        console.warn("Creating a new user requires an Edge Function or Admin API. Logic skipped for client-side safety.");
        throw new Error("هذه الميزة تتطلب إعداد وظائف السيرفر (Edge Functions).");
    },

    async linkStudentToChildProfile(payload: { studentUserId: string, childProfileId: number }) {
        const { error } = await supabase
            .from('child_profiles')
            .update({ student_user_id: payload.studentUserId })
            .eq('id', payload.childProfileId);

        if (error) throw new Error(error.message);
        return { success: true };
    },

    async unlinkStudentFromChildProfile(childProfileId: number) {
        const { error } = await supabase
            .from('child_profiles')
            .update({ student_user_id: null })
            .eq('id', childProfileId);

        if (error) throw new Error(error.message);
        return { success: true };
    },

    async bulkDeleteUsers(userIds: string[]) {
        // Requires Admin privileges (Service Role) usually.
        // We will try deleting from profiles, but Auth users might remain unless using Edge Function.
        const { error } = await supabase
            .from('profiles')
            .delete()
            .in('id', userIds);

        if (error) throw new Error(error.message);
        return { success: true };
    }
};
