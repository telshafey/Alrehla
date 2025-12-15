
import { supabase } from '../lib/supabaseClient';
import type { UserProfile, ChildProfile, UserRole } from '../lib/database.types';
import { mockChildProfiles } from '../data/mockData';

// كلمة مرور الطوارئ للأدمن فقط
const MASTER_ADMIN_EMAIL = 'admin@alrehlah.com';
const MASTER_ADMIN_PASS = '123456'; 

export const authService = {
    async login(email: string, password: string) {
        // 1. الوضع الإنقاذي (Rescue Mode) - الأولوية القصوى
        if (email.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase() && password === MASTER_ADMIN_PASS) {
            console.warn("Activated Admin Rescue Login Mode");
            return {
                user: {
                    id: 'admin_rescue_id',
                    email: email,
                    name: 'Admin (Rescue)',
                    role: 'super_admin' as UserRole,
                    created_at: new Date().toISOString()
                } as UserProfile,
                accessToken: 'rescue-token-admin',
            };
        }

        // 2. المحاولة العادية عبر Supabase Auth
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
                    
                    let userRole = (authData.user.user_metadata?.role as UserRole) || 'user';
                    
                    // Fallback for demo accounts roles based on email if metadata is missing
                    if (email.includes('student')) userRole = 'student';
                    if (email.includes('admin')) userRole = 'super_admin';

                    return {
                        user: { 
                            id: authData.user.id, 
                            email: authData.user.email!, 
                            role: userRole, 
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
                return {
                    user: { 
                        id: authData.user.id, 
                        email: authData.user.email!, 
                        role: 'user',
                        name: 'User',
                        created_at: new Date().toISOString()
                    } as UserProfile,
                    accessToken: authData.session?.access_token || '',
                };
            }
        }

        throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة.');
    },

    async register(email: string, password: string, name: string, role: UserRole) {
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { name, role } }
        });

        if (authError) throw new Error(authError.message);
        if (!authData.user) throw new Error('فشل إنشاء الحساب');

        await new Promise(resolve => setTimeout(resolve, 1000));
        
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
        
        if (authUser) {
             const { data: profile } = await supabase.from('profiles').select('*').eq('id', authUser.id).single();
             
             if (!profile && authUser.email?.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase()) {
                 return { user: { 
                     id: authUser.id, 
                     email: authUser.email!, 
                     role: 'super_admin', 
                     name: 'Admin', 
                     created_at: authUser.created_at 
                 } as UserProfile };
             }

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
        if (userId === 'admin_rescue_id') return [];

        // 1. Try Real DB
        const { data, error } = await supabase
            .from('child_profiles')
            .select('*')
            .eq('user_id', userId);
        
        if (!error && data && data.length > 0) return data as ChildProfile[];

        // 2. Mock Data Fallback (For Demo Parent)
        // If DB returns nothing, check if we have mock data for this ID
        const mockChildren = mockChildProfiles.filter(c => c.user_id === userId);
        if (mockChildren.length > 0) return mockChildren;
        
        return [];
    },
    
    async getStudentProfile(userId: string) {
        // 1. Try Real DB
        const { data, error } = await supabase
            .from('child_profiles')
            .select('*')
            .eq('student_user_id', userId)
            .single();

        if (!error && data) return data as ChildProfile;
        
        // 2. Mock Data Fallback (For Demo Student)
        // This ensures the demo student account works even without a real DB entry
        const mockProfile = mockChildProfiles.find(c => c.student_user_id === userId);
        return mockProfile || null;
    }
};
