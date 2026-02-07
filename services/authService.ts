
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

        // 2. Fetch Profile Directly
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
            // إذا نجحت المصادقة ولكن لم يتم العثور على الملف الشخصي (حالة نادرة لتكامل البيانات)
            // نمنع الدخول لتجنب الأخطاء في النظام
            throw new Error("عذراً، لم يتم العثور على ملف المستخدم المرتبط بهذا الحساب. يرجى التواصل مع الدعم الفني.");
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
            
            // Explicit cast to 'any' to avoid "Property does not exist on type 'never'" error 
            // since child_profiles might not be fully typed in the Database interface yet.
            const child = data as any; 
            
            if (!child) return null;
            
            let parentName = undefined;
            if (child.user_id) {
                // Fetch parent name for display purposes
                const { data: parentData } = await supabase.from('profiles').select('name').eq('id', child.user_id).maybeSingle();
                const parent = parentData as any;
                if (parent) parentName = parent.name;
            }
            
            return { ...child, parentName } as ChildProfile;
        } catch (e) {
            return null;
        }
    },

    async logout() {
        await supabase.auth.signOut();
        localStorage.removeItem('accessToken');
    },

    async register(email: string, password: string, name: string, role: UserRole) {
        // Strict check: Ensure email is unique across the entire system before creating
        const { data: existingUser } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', email.toLowerCase().trim())
            .maybeSingle();

        if (existingUser) {
            throw new Error("هذا البريد الإلكتروني مستخدم بالفعل. يرجى استخدام بريد آخر أو تسجيل الدخول.");
        }

        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: email.toLowerCase().trim(),
            password,
            options: { data: { name, role } } 
        });
        
        if (authError) {
             let errorMessage = authError.message;
             if (errorMessage.includes("User already registered") || errorMessage.includes("already has been taken")) {
                 errorMessage = "هذا البريد الإلكتروني مسجل بالفعل لمستخدم آخر.";
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
            
            // Auto-create child profile if parent registers, to smooth onboarding
            if (role === 'parent' || role === 'user') {
                 await (supabase.from('child_profiles') as any).insert({
                    user_id: authData.user.id,
                    name: 'طفلي الأول',
                    birth_date: new Date().toISOString().split('T')[0],
                    gender: 'ذكر'
                });
            }
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
    },

    async resetPasswordForEmail(email: string) {
        // نستخدم الأصل فقط (Origin) لضمان عدم حدوث مشاكل في التوجيه مع HashRouter
        // سيقوم التطبيق (في App.tsx) باكتشاف حدث PASSWORD_RECOVERY وتوجيه المستخدم للصفحة الصحيحة
        const redirectTo = window.location.origin; 
        
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: redirectTo,
        });

        if (error) {
            if (error.message.includes("Too many requests")) {
                throw new Error("لقد طلبت إعادة تعيين كلمة المرور عدة مرات. يرجى الانتظار قليلاً.");
            }
            throw new Error(error.message);
        }
        return { success: true };
    },

    async updatePassword(newPassword: string) {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw new Error("فشل تحديث كلمة المرور. حاول مرة أخرى.");
        return { success: true };
    }
};
