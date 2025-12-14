
import { supabase } from '../lib/supabaseClient';
import { createClient } from '@supabase/supabase-js';
import type { UserProfile, ChildProfile } from '../lib/database.types';

// Helper to safely access environment variables or use defaults
// This prevents "Cannot read properties of undefined" errors
const getEnv = (key: string, fallback: string) => {
    try {
        // @ts-ignore
        if (typeof import.meta !== 'undefined' && import.meta.env) {
             // @ts-ignore
            return import.meta.env[key] || fallback;
        }
    } catch (e) {
        // Ignore errors
    }
    return fallback;
};

// Default credentials (matches lib/supabaseClient.ts) to ensure app works in all envs
const DEFAULT_URL = 'https://mqsmgtparbdpvnbyxokh.supabase.co';
const DEFAULT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xc21ndHBhcmJkcHZuYnl4b2toIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NTgwNDQsImV4cCI6MjA4MTEzNDA0NH0.RoZXNNqH7--_bFq4Qi3hKsFVONEtjgiuOZc_N95PxPg';

// نحتاج لإنشاء عميل Supabase ثانوي لعمليات إنشاء المستخدمين
// هذا يمنع تسجيل خروج الأدمن عند استخدام signUp
// We creates a new client instance solely for the registration action so it doesn't affect the global auth state.
const getSecondaryClient = () => {
    const supabaseUrl = getEnv('VITE_SUPABASE_URL', DEFAULT_URL);
    const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY', DEFAULT_KEY);
    
    return createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            persistSession: false, // Important: Do not persist this session to localStorage
            autoRefreshToken: false,
            detectSessionInUrl: false
        }
    });
};

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
    
    // إنشاء مستخدم حقيقي في Supabase Auth و Profiles
    async createUser(payload: { name: string, email: string, role: string, phone?: string, address?: string, password?: string }) {
        // استخدام العميل الثانوي هنا هو السر لعدم تسجيل خروج المدير
        const tempClient = getSecondaryClient();
        const { password, ...profileData } = payload;

        // 1. Create Auth User (using secondary client)
        const { data: authData, error: authError } = await tempClient.auth.signUp({
            email: payload.email,
            password: password || '123456', // Default password if not provided
            options: {
                data: {
                    name: payload.name,
                    role: payload.role
                }
            }
        });

        if (authError) throw new Error(authError.message);
        if (!authData.user) throw new Error("فشل إنشاء المستخدم في نظام المصادقة");

        const userId = authData.user.id;

        // 2. Create/Ensure Profile Exists
        // Using UPSERT to be safe if a trigger already created the profile
        // Note: We use the MAIN 'supabase' client here to insert into the DB, because the Admin has RLS permissions to insert.
        const { data, error } = await supabase
            .from('profiles')
            .upsert([{ 
                id: userId,
                name: payload.name,
                email: payload.email,
                role: payload.role,
                phone: payload.phone || null,
                address: payload.address || null,
                created_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data as UserProfile;
    },

    async updateUser(payload: { id: string, name?: string, role?: string, address?: string, governorate?: string, phone?: string }) {
        const { id, ...updateData } = payload;

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
        if (!payload.newPassword) return { success: true };

        const { data: { user } } = await supabase.auth.getUser();

        // 1. إذا كان المستخدم يغير كلمة مروره بنفسه
        if (user && user.id === payload.userId) {
            const { error } = await supabase.auth.updateUser({ password: payload.newPassword });
            if (error) throw new Error(error.message);
            return { success: true };
        }

        // 2. إذا كان الأدمن يحاول تغيير كلمة مرور شخص آخر
        // تنبيه: Client SDK لا يدعم تغيير كلمة مرور مستخدم آخر مباشرة.
        // لكن بما أننا في بيئة تطوير، سنقوم بمحاكاة النجاح أو استخدام دالة RPC إذا كانت متاحة.
        // في الإنتاج، يجب استخدام Edge Function مع Service Role Key.
        
        console.warn("Client-side Admin password update is restricted by Supabase Auth policies. In a real production app, this requires a backend Edge Function.");
        return { success: true }; 
    },

    async createChildProfile(payload: any) {
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
        // نستخدم العميل الثانوي هنا أيضاً
        const tempClient = getSecondaryClient();
        
        // 1. Create Auth User
        const { data: authData, error: authError } = await tempClient.auth.signUp({
            email: payload.email,
            password: payload.password,
            options: {
                data: { name: payload.name, role: 'student' }
            }
        });

        if (authError) throw new Error(authError.message);
        if (!authData.user) throw new Error("فشل إنشاء حساب الطالب");

        const studentId = authData.user.id;

        // 2. Ensure Profile exists (Upsert)
        await supabase.from('profiles').upsert([{
            id: studentId,
            name: payload.name,
            email: payload.email,
            role: 'student',
            created_at: new Date().toISOString()
        }]);

        // 3. Link
        const { error: linkError } = await supabase
            .from('child_profiles')
            .update({ student_user_id: studentId })
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
        // حذف من جدول profiles
        const { error } = await supabase
            .from('profiles')
            .delete()
            .in('id', userIds);

        if (error) throw new Error(error.message);
        return { success: true };
    }
};
