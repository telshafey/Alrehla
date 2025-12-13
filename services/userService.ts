
import { supabase } from '../lib/supabaseClient';
import { createClient } from '@supabase/supabase-js';
import type { UserProfile, ChildProfile } from '../lib/database.types';

// نحتاج لإنشاء عميل Supabase ثانوي لعمليات إنشاء المستخدمين
// هذا يمنع تسجيل خروج الأدمن عند استخدام signUp
const getSecondaryClient = () => {
    const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
    const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;
    if (supabaseUrl && supabaseAnonKey) {
        return createClient(supabaseUrl, supabaseAnonKey);
    }
    return supabase; // Fallback
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
        const tempClient = getSecondaryClient();
        const { password, ...profileData } = payload;

        // 1. Create Auth User (using secondary client to keep admin logged in)
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
        // Note: Ideally a Database Trigger handles this. We do an upsert here to be safe and update fields.
        const { data, error } = await supabase
            .from('profiles')
            .upsert([{ 
                id: userId,
                name: payload.name,
                email: payload.email,
                role: payload.role,
                phone: payload.phone,
                address: payload.address,
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
        // تنبيه: Supabase Client SDK لا يسمح للأدمن بتغيير كلمة مرور مستخدم آخر مباشرة بدون Service Role Key (الذي لا يجب وضعه في الفرونت إند).
        // الحل الصحيح هو إرسال رابط استعادة كلمة المرور.
        
        // لمحاولة دعم الطلب قدر الإمكان، سنحاول تحديثها إذا كانت الجلسة تسمح (نادراً ما تنجح بدون صلاحيات خادم)
        // الأفضل: إرجاع رسالة توضيحية.
        
        throw new Error("لا يمكن تغيير كلمة مرور مستخدم آخر مباشرة من لوحة التحكم لأسباب أمنية. يرجى الطلب من المستخدم استخدام خيار 'نسيت كلمة المرور' أو استخدام واجهة Supabase Dashboard.");
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
        // حذف من جدول profiles (سيؤدي Trigger عادة لحذف Auth user إذا كان مفعلاً، أو العكس)
        // ملاحظة: حذف Auth User يتطلب Service Role Key. من هنا سنحذف الـ Profile فقط
        // وهذا سيمنع الدخول للتطبيق لأننا نتحقق من وجود Profile.
        const { error } = await supabase
            .from('profiles')
            .delete()
            .in('id', userIds);

        if (error) throw new Error(error.message);
        return { success: true };
    }
};
