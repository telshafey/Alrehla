
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

        // محاولة جلب البروفايل
        // نستخدم try-catch لمنع انهيار التطبيق في حالة وجود خطأ في السياسات (Infinite Recursion)
        try {
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', authData.user.id)
                .single();

            // التعامل مع أخطاء قاعدة البيانات الحرجة
            if (profileError) {
                console.warn("Database Error (Profile Fetch):", profileError.message);
                
                // في حالة الخطأ، نعود لبيانات المصادقة الأساسية لنسمح للمستخدم بالدخول
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
            console.error("Critical Auth Service Error:", e);
            // Fallback emergency login
            return {
                user: { 
                    id: authData.user.id, 
                    email: authData.user.email!, 
                    role: 'user', 
                    name: email.split('@')[0],
                    created_at: authData.user.created_at 
                } as UserProfile,
                accessToken: authData.session?.access_token || '',
            };
        }
    },

    async register(email: string, password: string, name: string, role: UserRole) {
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

        // ننتظر قليلاً لضمان عمل التريجر
        await new Promise(resolve => setTimeout(resolve, 500));

        // محاولة جلب البروفايل أو إنشاؤه يدوياً في حالة فشل التريجر
        try {
            const { data: profile, error: fetchError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', authData.user.id)
                .single();

            if (fetchError || !profile) {
                 const newProfileData = {
                    id: authData.user.id,
                    email: email,
                    name: name,
                    role: role
                 };

                 // محاولة الإدراج اليدوي، مع تجاهل الخطأ إذا كان موجوداً مسبقاً
                 await supabase.from('profiles').insert([newProfileData]);
                 
                 return {
                    user: { ...newProfileData, email: authData.user.email!, created_at: new Date().toISOString() } as UserProfile,
                    accessToken: authData.session?.access_token || '',
                };
            }

            return {
                user: { ...profile, email: authData.user.email! } as UserProfile,
                accessToken: authData.session?.access_token || '',
            };
        } catch (e) {
            // Fallback logic
            return {
                user: { id: authData.user.id, email, name, role, created_at: new Date().toISOString() } as UserProfile,
                accessToken: authData.session?.access_token || '',
            };
        }
    },

    async logout() {
        const { error } = await supabase.auth.signOut();
        if (error) throw new Error(error.message);
    },

    async getCurrentUser() {
        const { data: { user: authUser }, error } = await supabase.auth.getUser();
        if (error || !authUser) return null;

        try {
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', authUser.id)
                .single();

            if (profileError || !profile) {
                 return {
                    user: { 
                        id: authUser.id, 
                        email: authUser.email!, 
                        role: (authUser.user_metadata?.role as UserRole) || 'user', 
                        name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
                        created_at: authUser.created_at 
                    } as UserProfile
                };
            }

            return {
                user: { ...profile, email: authUser.email! } as UserProfile
            };
        } catch (e) {
            return {
                user: { 
                    id: authUser.id, 
                    email: authUser.email!, 
                    role: 'user', 
                    name: 'User',
                    created_at: authUser.created_at 
                } as UserProfile
            };
        }
    },

    async getUserChildren(userId: string) {
        try {
            const { data, error } = await supabase
                .from('child_profiles')
                .select('*')
                .eq('user_id', userId);
            
            if (error) {
                console.warn('Failed to fetch children:', error.message);
                return [];
            }
            return data as ChildProfile[];
        } catch (e) {
            return [];
        }
    },
    
    async getStudentProfile(userId: string) {
        try {
            const { data, error } = await supabase
                .from('child_profiles')
                .select('*')
                .eq('student_user_id', userId)
                .single();
                
            if (error) return null;
            return data as ChildProfile | null;
        } catch (e) {
            return null;
        }
    }
};
