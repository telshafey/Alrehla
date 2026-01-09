
import { supabase } from '../lib/supabaseClient';
import type { UserProfile, ChildProfile, UserRole } from '../lib/database.types';

export const authService = {
    async login(email: string, password: string) {
        const normalizedEmail = email.toLowerCase().trim();

        // 1. Authenticate with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: normalizedEmail,
            password,
        });

        if (authError) {
            console.error("Login Error:", authError);
            let errorMessage = "فشل تسجيل الدخول.";
            
            // ترجمة أخطاء Supabase الشائعة
            if (authError.message.includes("Invalid login credentials")) {
                errorMessage = "البريد الإلكتروني أو كلمة المرور غير صحيحة.";
            } else if (authError.message.includes("Email not confirmed")) {
                errorMessage = "البريد الإلكتروني غير مفعل. يرجى التحقق من صندوق الوارد.";
            } else if (authError.message.includes("Too many requests")) {
                errorMessage = "تم تجاوز حد المحاولات المسموح به. يرجى الانتظار قليلاً.";
            }

            throw new Error(errorMessage);
        }

        const authUser = authData.user;
        if (!authUser) throw new Error("فشل التعرف على المستخدم.");

        // 2. Fetch Profile Directly (No Memory Fallback)
        // بعد إيقاف RLS في قاعدة البيانات، هذا الطلب سيعمل بنجاح
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .maybeSingle();

        if (error) {
            console.error("Database Error:", error);
            throw new Error("حدث خطأ في الاتصال بقاعدة البيانات.");
        }

        if (!profile) {
            // في حالة عدم وجود ملف، نقوم بإنشائه تلقائياً (Auto-fix for missing rows)
            const newProfile = {
                id: authUser.id,
                email: normalizedEmail,
                name: authUser.user_metadata?.name || normalizedEmail.split('@')[0],
                role: (normalizedEmail.includes('admin') ? 'super_admin' : 'user') as UserRole,
                created_at: new Date().toISOString()
            };
            
            const { data: createdProfile, error: createError } = await (supabase.from('profiles') as any)
                .insert([newProfile])
                .select()
                .single();
            
            if (createError) throw new Error("فشل إنشاء ملف المستخدم: " + createError.message);
            
            return {
                user: createdProfile as UserProfile,
                accessToken: authData.session?.access_token || '',
            };
        }

        return {
            user: profile as UserProfile,
            accessToken: authData.session?.access_token || '',
        };
    },

    async getCurrentUser() {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        if (!authUser || authError) return null;

        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .maybeSingle();

        if (!profile) return null;

        return { user: profile as UserProfile };
    },

    async getStudentProfile(userId: string) {
        try {
            const { data } = await supabase.from('child_profiles').select('*').eq('student_user_id', userId).maybeSingle();
            return data as ChildProfile | null;
        } catch (e) {
            return null;
        }
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
        
        if (authError) {
             let errorMessage = authError.message;
             if (errorMessage.includes("User already registered")) {
                 errorMessage = "هذا البريد الإلكتروني مسجل بالفعل.";
             } else if (errorMessage.includes("Password should be at least")) {
                 errorMessage = "كلمة المرور يجب أن تكون 6 أحرف على الأقل.";
             }
             throw new Error(errorMessage);
        }
        
        if (authData.user) {
             const { error } = await (supabase.from('profiles') as any).insert({
                id: authData.user.id,
                email: email.toLowerCase().trim(),
                name,
                role,
                created_at: new Date().toISOString()
            });
            if (error) console.error("Registration DB Error:", error);
        }
        
        return {
            user: { id: authData.user!.id, email, name, role, created_at: new Date().toISOString() } as UserProfile,
            accessToken: authData.session?.access_token || '',
        };
    },

    async getUserChildren(userId: string) {
        try {
            const { data } = await supabase.from('child_profiles').select('*').eq('user_id', userId);
            return (data || []) as ChildProfile[];
        } catch (e) {
            return [];
        }
    }
};
