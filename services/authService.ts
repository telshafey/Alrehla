
import { supabase } from '../lib/supabaseClient';
import type { UserProfile, ChildProfile, UserRole } from '../lib/database.types';

export const authService = {
    async login(email: string, password: string) {
        // الاعتماد الكلي على Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError) throw new Error(authError.message);
        if (!authData.user) throw new Error('فشل تسجيل الدخول');

        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .single();

        if (profileError) {
            // في حال عدم وجود بروفايل، ننشئ كائن أساسي من بيانات الـ Auth
            return {
                user: { 
                    id: authData.user.id, 
                    email: authData.user.email!, 
                    role: (authData.user.user_metadata?.role as UserRole) || 'user', 
                    name: authData.user.user_metadata?.name || email.split('@')[0],
                    created_at: authData.user.created_at 
                } as UserProfile,
                accessToken: authData.session?.access_token || '',
            };
        }

        return {
            user: { ...profile, email: authData.user.email! } as UserProfile,
            accessToken: authData.session?.access_token || '',
        };
    },

    async register(email: string, password: string, name: string, role: UserRole) {
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { name, role } }
        });

        if (authError) throw new Error(authError.message);
        if (!authData.user) throw new Error('فشل إنشاء الحساب');

        return {
            user: { id: authData.user.id, email, name, role, created_at: new Date().toISOString() } as UserProfile,
            accessToken: authData.session?.access_token || '',
        };
    },

    async logout() {
        await supabase.auth.signOut();
    },

    async getCurrentUser() {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) return null;

        const { data: profile } = await supabase.from('profiles').select('*').eq('id', authUser.id).single();
        if (profile) {
            return { user: { ...profile, email: authUser.email! } as UserProfile };
        }
        
        return { user: { 
            id: authUser.id, 
            email: authUser.email!, 
            role: (authUser.user_metadata?.role as UserRole) || 'user', 
            name: authUser.user_metadata?.name || 'User', 
            created_at: authUser.created_at 
        } as UserProfile };
    },

    async getUserChildren(userId: string) {
        const { data, error } = await supabase
            .from('child_profiles')
            .select('*')
            .eq('user_id', userId);
        
        if (error) return [];
        return data as ChildProfile[];
    },
    
    async getStudentProfile(userId: string) {
        const { data, error } = await supabase
            .from('child_profiles')
            .select('*')
            .eq('student_user_id', userId)
            .single();

        if (error) return null;
        return data as ChildProfile;
    }
};
