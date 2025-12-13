
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
    async createUser(payload: { name: string, email: string, role: string, phone?: string, address?: string }) {
        // Generate a UUID for the new profile
        const id = crypto.randomUUID();
        
        // Sanitize payload: remove password if accidentally passed
        // We MUST NOT send 'password' to 'profiles' table
        const { password, ...safePayload } = payload as any;

        const { data, error } = await supabase
            .from('profiles')
            .insert([{ 
                id,
                ...safePayload,
                created_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data as UserProfile;
    },

    async updateUser(payload: { id: string, name?: string, role?: string, address?: string, governorate?: string, phone?: string }) {
        // Explicitly extract only allowed fields to prevent "password column not found" error
        const { id, name, role, address, governorate, phone } = payload;
        
        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (role !== undefined) updateData.role = role;
        if (address !== undefined) updateData.address = address;
        if (governorate !== undefined) updateData.governorate = governorate;
        if (phone !== undefined) updateData.phone = phone;

        const { data, error } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data as UserProfile;
    },

    async updateUserPassword(payload: { userId: string, newPassword?: string }) {
        // Note: Updating another user's password requires Service Role key (Server-side).
        // Client-side can only update OWN password unless using a specific admin API wrapper.
        // In this client-side demo, we use auth.updateUser which affects the CURRENTLY LOGGED IN user.
        // To update ANOTHER user, you MUST use Supabase Admin API (server-side).
        
        // For demonstration purposes/current user context:
        const { error } = await supabase.auth.updateUser({ password: payload.newPassword });
        
        if (error) {
            // Treat "same password" error as success to improve UX
            if (error.message.includes("different from the old password")) {
                return { success: true };
            }
            throw new Error(error.message);
        }
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
        // Mock implementation for demo or requires Edge Function
        const id = crypto.randomUUID();
        const { error } = await supabase.from('profiles').insert([{
            id,
            name: payload.name,
            email: payload.email,
            role: 'student',
            created_at: new Date().toISOString()
        }]);

        if (error) throw new Error(error.message);

        // Link
        const { error: linkError } = await supabase
            .from('child_profiles')
            .update({ student_user_id: id })
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

    async bulkDeleteUsers(userIds: string[]) {
        const { error } = await supabase
            .from('profiles')
            .delete()
            .in('id', userIds);

        if (error) throw new Error(error.message);
        return { success: true };
    }
};
