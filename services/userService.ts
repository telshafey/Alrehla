
import { supabase } from '../lib/supabaseClient';
import type { UserProfile, ChildProfile, UserRole } from '../lib/database.types';

export const userService = {
    // --- Admin: User Management ---
    async getAllUsers() {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) {
            console.warn("Error fetching users:", error.message);
            return [];
        }
        return data as UserProfile[];
    },

    async createUser(payload: any) {
        const { data, error } = await supabase.auth.signUp({
            email: payload.email,
            password: payload.password,
            options: {
                data: {
                    name: payload.name,
                    role: payload.role,
                    phone: payload.phone,
                    address: payload.address
                }
            }
        });

        if (error) throw new Error(error.message);
        return data.user;
    },

    async updateUser(payload: { id: string; [key: string]: any }) {
        const { id, ...updates } = payload;
        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data as UserProfile;
    },
    
    async updateUserPassword(payload: { userId: string, newPassword: string }) {
        console.log(`Simulating password reset for user ${payload.userId} to ${payload.newPassword}`);
        return { success: true };
    },

    async bulkDeleteUsers(userIds: string[]) {
        const { error } = await supabase
            .from('profiles')
            .delete()
            .in('id', userIds);
            
        if (error) throw new Error(error.message);
        return { success: true };
    },

    // --- Parent: Child Profiles ---
    async getAllChildProfiles() {
        const { data, error } = await supabase
            .from('child_profiles')
            .select('*');
            
        if (error) return [];
        return data as ChildProfile[];
    },

    async createChildProfile(payload: any) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not logged in");

        const { data, error } = await supabase
            .from('child_profiles')
            .insert([{ ...payload, user_id: user.id }])
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data as ChildProfile;
    },

    async updateChildProfile(payload: { id: number; [key: string]: any }) {
        const { id, ...updates } = payload;
        const { data, error } = await supabase
            .from('child_profiles')
            .update(updates)
            .eq('id', id)
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

    // --- Student Account Linking ---
    async createAndLinkStudentAccount(payload: any) {
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: payload.email,
            password: payload.password,
            options: {
                data: {
                    name: payload.name,
                    role: 'student',
                }
            }
        });

        if (authError || !authData.user) throw new Error(authError?.message || 'Failed to create account');

        const { error: linkError } = await supabase
            .from('child_profiles')
            .update({ student_user_id: authData.user.id })
            .eq('id', payload.childProfileId);

        if (linkError) throw new Error(linkError.message);
        
        return { success: true };
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

    // --- Password Reset for Student ---
    async resetStudentPassword(payload: { studentUserId: string, newPassword: string }) {
        // This is a client-side simulation. In production, use an Edge Function with service_role.
        console.log(`[MOCK] Resetting password for student ${payload.studentUserId}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { success: true };
    }
};
