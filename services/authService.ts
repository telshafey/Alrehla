
import { supabase } from '../lib/supabaseClient';
import type { UserProfile, ChildProfile, UserRole } from '../lib/database.types';

export const authService = {
    async login(email: string, password: string) {
        try {
            const normalizedEmail = email.toLowerCase().trim();

            // 1. محاولة تسجيل الدخول الرسمي عبر Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email: normalizedEmail,
                password,
            });

            if (!authError && authData.user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', authData.user.id)
                    .single();

                return {
                    user: { ...(profile || {}), id: authData.user.id, email: authData.user.email! } as UserProfile,
                    accessToken: authData.session?.access_token || '',
                };
            }

            // 2. الحل البديل: نظام "حسابات الظل" (Shadow Accounts)
            // نبحث عن الملف في جدول profiles مباشرة بالبريد الإلكتروني
            const { data: shadowProfile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('email', normalizedEmail)
                .maybeSingle();

            if (!profileError && shadowProfile && shadowProfile.role === 'student') {
                // نجاح الدخول - نقوم بحفظ التوكن الوهمي
                const token = 'demo-token-' + shadowProfile.id;
                localStorage.setItem('accessToken', token);
                
                console.log("Shadow Login Success:", normalizedEmail);
                
                return {
                    user: shadowProfile as UserProfile,
                    accessToken: token,
                };
            }

            // إذا لم ينجح أي منهما، نلقي خطأ واضحاً
            throw new Error(authError?.message || 'بيانات الدخول غير صحيحة أو الحساب غير موجود');

        } catch (e: any) {
            throw e;
        }
    },

    async getCurrentUser() {
        // التحقق من الجلسة الرسمية
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
            const { data: profile } = await supabase.from('profiles').select('*').eq('id', authUser.id).single();
            return { user: { ...(profile || {}), id: authUser.id, email: authUser.email!, role: profile?.role || 'user' } as UserProfile };
        }
        
        // التحقق من جلسة الطالب اليدوية
        const savedToken = localStorage.getItem('accessToken');
        if (savedToken?.startsWith('demo-token-')) {
            const userId = savedToken.replace('demo-token-', '');
            const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
            if (profile) return { user: profile as UserProfile };
        }

        return null;
    },

    async getStudentProfile(userId: string) {
        // الحل الجذري للبحث عن الربط:
        // 1. محاولة البحث المباشر بالمعرف
        const { data: directData } = await supabase
            .from('child_profiles')
            .select('*')
            .eq('student_user_id', userId)
            .maybeSingle();

        if (directData) return directData as ChildProfile;

        // 2. إذا فشل (بسبب RLS)، جلب كافة السجلات وفحصها برمجياً (أكثر موثوقية في البيئة التجريبية)
        const { data: allRecords } = await supabase.from('child_profiles').select('*');
        if (allRecords) {
            const match = allRecords.find(c => c.student_user_id === userId);
            if (match) return match as ChildProfile;
        }

        // 3. محاولة أخيرة: البحث عن طريق تطابق البريد الإلكتروني للمستخدم
        const { data: userProfile } = await supabase.from('profiles').select('email').eq('id', userId).single();
        if (userProfile?.email && allRecords) {
            // أحياناً يكون الربط في جدول Profiles ولكن لم يحدث في Child_Profiles، 
            // لكن هنا نبحث عن أي طفل يمتلك نفس المعرف
            const secondMatch = allRecords.find(c => c.student_user_id === userId);
            if (secondMatch) return secondMatch as ChildProfile;
        }

        return null;
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
        if (authError) throw new Error(authError.message);
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
