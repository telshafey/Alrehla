
import { supabase } from '../lib/supabaseClient';
import type { UserProfile, ChildProfile, UserRole } from '../lib/database.types';

// كلمة مرور الطوارئ للأدمن فقط
const MASTER_ADMIN_EMAIL = 'admin@alrehlah.com';
const MASTER_ADMIN_PASS = '123456'; 

export const authService = {
    async login(email: string, password: string) {
        // 1. المحاولة الأولى: تسجيل دخول حقيقي عبر Supabase Auth
        // هذا هو الوضع الطبيعي والصحيح لقواعد البيانات
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (!authError && authData.user) {
            try {
                // جلب بيانات الملف الشخصي
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', authData.user.id)
                    .single();

                if (profileError) {
                    console.warn("Profile fetch error, using auth fallback:", profileError.message);
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

            } catch (e) {
                console.error("Login Error (Profile Fetch):", e);
            }
        }

        // 2. المحاولة الثانية: وضع الإنقاذ (Rescue Mode) للأدمن فقط
        // إذا فشل الدخول الحقيقي، وكان الإيميل هو إيميل الأدمن وكلمة المرور هي كلمة المرور الخاصة
        if (email.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase() && password === MASTER_ADMIN_PASS) {
            console.warn("Activated Admin Rescue Login Mode");
            
            // نحاول جلب بروفايل الأدمن من جدول profiles إذا كان موجوداً
            const { data: adminProfile } = await supabase
                .from('profiles')
                .select('*')
                .eq('email', email)
                .single();

            // إذا وجدنا البروفايل نستخدمه، وإلا ننشئ جلسة مؤقتة بصلاحيات كاملة
            const user = adminProfile ? { ...adminProfile, email } : {
                id: 'admin_rescue_id',
                email: email,
                name: 'Admin (Rescue)',
                role: 'super_admin' as UserRole,
                created_at: new Date().toISOString()
            };

            return {
                user: user as UserProfile,
                accessToken: 'rescue-token-admin', // توكن وهمي يسمح بالمرور
            };
        }

        // إذا فشل كل شيء
        throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة. (تنويه: كلمات المرور مخزنة في نظام المصادقة المشفر وليس في الجداول العادية)');
    },

    async register(email: string, password: string, name: string, role: UserRole) {
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { name, role } }
        });

        if (authError) throw new Error(authError.message);
        if (!authData.user) throw new Error('فشل إنشاء الحساب');

        // ننتظر قليلاً لضمان عمل Triggers في قاعدة البيانات
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return {
            user: { id: authData.user.id, email, name, role, created_at: new Date().toISOString() } as UserProfile,
            accessToken: authData.session?.access_token || '',
        };
    },

    async logout() {
        await supabase.auth.signOut();
        // Clear any rescue tokens if stored in localStorage manually (though AuthContext handles state)
    },

    async getCurrentUser() {
        // 1. Check Real Session
        const { data: { user: authUser } } = await supabase.auth.getUser();
        
        if (authUser) {
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
        }

        return null;
    },

    async getUserChildren(userId: string) {
        // Safe check for rescue mode ID
        if (userId === 'admin_rescue_id') return [];

        const { data, error } = await supabase
            .from('child_profiles')
            .select('*')
            .eq('user_id', userId);
        
        if (error) return [];
        return data as ChildProfile[];
    },
    
    async getStudentProfile(userId: string) {
        const { data } = await supabase
            .from('child_profiles')
            .select('*')
            .eq('student_user_id', userId)
            .single();
        return data as ChildProfile | null;
    }
};
