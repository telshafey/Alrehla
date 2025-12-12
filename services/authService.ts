
import { supabase } from '../lib/supabaseClient';
import type { UserProfile, ChildProfile, UserRole } from '../lib/database.types';

export const authService = {
    async login(email: string, password: string) {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError) throw new Error(authError.message);
        if (!authData.user) throw new Error('فشل تسجيل الدخول');

        // جلب بيانات البروفايل الإضافية (مثل الدور والاسم)
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .single();

        if (profileError) {
            // في حالة عدم وجود بروفايل (نادر الحدوث بسبب التريجر)، نعيد البيانات الأساسية
            console.warn('Profile not found, using basic auth data');
            return {
                user: { id: authData.user.id, email: authData.user.email, role: 'user', created_at: authData.user.created_at } as UserProfile,
                accessToken: authData.session?.access_token || '',
            };
        }

        return {
            user: { ...profile, email: authData.user.email } as UserProfile,
            accessToken: authData.session?.access_token || '',
        };
    },

    async register(email: string, password: string, name: string, role: UserRole) {
        // نمرر البيانات الإضافية في metadata ليقوم التريجر (Trigger) بإنشاء البروفايل تلقائياً
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name,
                    role,
                }
            }
        });

        if (authError) throw new Error(authError.message);
        if (!authData.user) throw new Error('فشل إنشاء الحساب');

        // ننتظر قليلاً لضمان عمل التريجر (اختياري، لكن آمن)
        await new Promise(resolve => setTimeout(resolve, 500));

        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .single();

        return {
            user: (profile ? { ...profile, email: authData.user.email } : { id: authData.user.id, email, name, role }) as UserProfile,
            accessToken: authData.session?.access_token || '',
        };
    },

    async logout() {
        const { error } = await supabase.auth.signOut();
        if (error) throw new Error(error.message);
    },

    async getCurrentUser() {
        const { data: { user: authUser }, error } = await supabase.auth.getUser();
        if (error || !authUser) return null;

        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .single();

        if (!profile) return null;

        return {
            user: { ...profile, email: authUser.email } as UserProfile
        };
    },

    async getUserChildren(userId: string) {
        const { data, error } = await supabase
            .from('child_profiles')
            .select('*')
            .eq('user_id', userId);
        
        if (error) throw new Error(error.message);
        return data as ChildProfile[];
    },
    
    async getStudentProfile(userId: string) {
        const { data, error } = await supabase
            .from('child_profiles')
            .select('*')
            .eq('student_user_id', userId)
            .single();
            
        if (error && error.code !== 'PGRST116') throw new Error(error.message);
        return data as ChildProfile | null;
    }
};
