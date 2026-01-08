
import { supabase } from '../lib/supabaseClient';
import type { UserProfile, ChildProfile, UserRole } from '../lib/database.types';

export const authService = {
    async login(email: string, password: string) {
        const normalizedEmail = email.toLowerCase().trim();

        // 1. تسجيل الدخول الرسمي
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: normalizedEmail,
            password,
        });

        if (authError) throw authError;

        const userId = authData.user?.id;
        if (userId) {
            // 2. محاولة جلب الملف من القاعدة
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .maybeSingle();

            if (profile) {
                return {
                    user: profile as UserProfile,
                    accessToken: authData.session?.access_token || '',
                };
            }
        }

        // 3. آلية المنقذ: إذا نجح الدخول ولكن لم نتمكن من قراءة جدول profiles (بسبب RLS أو غيره)
        // نسحب البيانات من الـ Metadata الخاصة بالـ Auth
        return {
            user: { 
                id: authData.user!.id, 
                email: normalizedEmail, 
                name: authData.user!.user_metadata?.name || 'مستخدم', 
                role: (authData.user!.user_metadata?.role || 'user') as UserRole,
                created_at: authData.user!.created_at
            } as UserProfile,
            accessToken: authData.session?.access_token || '',
        };
    },

    async getCurrentUser() {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        if (!authUser || authError) return null;

        // محاولة جلب الملف من القاعدة
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .maybeSingle();
        
        if (profile) return { user: profile as UserProfile };
        
        // آلية المنقذ للحساب الحالي
        return { 
            user: { 
                id: authUser.id, 
                email: authUser.email!, 
                name: authUser.user_metadata?.name || 'مستخدم', 
                role: (authUser.user_metadata?.role || 'user') as UserRole,
                created_at: authUser.created_at
            } as UserProfile 
        };
    },

    async getStudentProfile(userId: string) {
        const { data } = await supabase.from('child_profiles').select('*').eq('student_user_id', userId).maybeSingle();
        return data as ChildProfile | null;
    },

    async logout() {
        await supabase.auth.signOut();
        localStorage.removeItem('accessToken');
    },

    async register(email: string, password: string, name: string, role: UserRole) {
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: email.toLowerCase().trim(),
            password,
            options: { data: { name, role } }
        });
        if (authError) throw authError;
        return {
            user: { id: authData.user!.id, email, name, role, created_at: new Date().toISOString() } as UserProfile,
            accessToken: authData.session?.access_token || '',
        };
    },

    async getUserChildren(userId: string) {
        const { data } = await supabase.from('child_profiles').select('*').eq('user_id', userId);
        return (data || []) as ChildProfile[];
    }
};
