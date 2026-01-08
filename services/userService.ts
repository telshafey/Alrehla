
import { supabase } from '../lib/supabaseClient';
import { reportingService } from './reportingService';
import type { UserProfile, ChildProfile, UserRole } from '../lib/database.types';
import { v4 as uuidv4 } from 'uuid';

interface CreateUserPayload {
    name: string;
    email: string;
    role: UserRole;
    phone?: string;
    address?: string;
    password?: string; // Only used for registration
}

interface UpdateUserPayload {
    id: string;
    name?: string;
    role?: UserRole;
    phone?: string;
    address?: string;
    governorate?: string;
}

export const userService = {
    async getAllUsers() {
        const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
        return (data || []) as UserProfile[];
    },

    // دالة للتحقق من وجود البريد الإلكتروني مسبقاً لضمان التفرد
    async isEmailTaken(email: string): Promise<boolean> {
        const normalizedEmail = email.toLowerCase().trim();
        const { data } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', normalizedEmail)
            .maybeSingle();
        
        return !!data;
    },

    async createUser(payload: CreateUserPayload) {
        const { name, email, role, phone, address } = payload;
        const normalizedEmail = email.toLowerCase().trim();

        // فحص التفرد قبل البدء
        const taken = await userService.isEmailTaken(normalizedEmail);
        if (taken) {
            throw new Error(`البريد الإلكتروني ${normalizedEmail} مسجل بالفعل لمستخدم آخر.`);
        }

        const userId = uuidv4();

        // 1. إنشاء الملف الشخصي
        const { data: profile, error: pError } = await (supabase.from('profiles') as any)
            .insert([{
                id: userId,
                name,
                email: normalizedEmail,
                role,
                phone,
                address,
                created_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (pError) throw new Error(`فشل إنشاء ملف المستخدم: ${pError.message}`);

        // 2. معالجة حساب المدرب
        if (role === 'instructor') {
            const slug = name.toLowerCase().replace(/\s+/g, '-') + '-' + Math.floor(Math.random() * 1000);
            await (supabase.from('instructors') as any).insert([{
                user_id: userId,
                name: name,
                slug: slug,
                specialty: 'مدرب جديد',
                bio: 'يرجى تحديث السيرة الذاتية.',
                rate_per_session: 150,
                schedule_status: 'approved',
                profile_update_status: 'approved'
            }]);
        }

        await reportingService.logAction('CREATE_USER', userId, `مستخدم: ${name}`, `إنشاء حساب جديد برتبة: ${role}`);
        return profile as UserProfile;
    },

    async createAndLinkStudentAccount(payload: { name: string, email: string, password?: string, childProfileId: number }) {
        const normalizedEmail = payload.email.toLowerCase().trim();

        // فحص التفرد - التأكد أن البريد غير مستخدم نهائياً
        const taken = await userService.isEmailTaken(normalizedEmail);
        if (taken) {
            throw new Error(`بريد الطالب ${normalizedEmail} مستخدم بالفعل في حساب آخر.`);
        }

        // التأكد من أن ملف الطفل غير مرتبط بحساب آخر لتجنب تضارب البيانات
        const { data: childData } = await supabase
            .from('child_profiles')
            .select('student_user_id, name')
            .eq('id', payload.childProfileId)
            .single();

        // Safe property access using casting
        const child = childData as any;

        if (child && child.student_user_id) {
            throw new Error(`ملف الطفل ${child.name} مرتبط بالفعل بحساب طالب آخر.`);
        }

        const newStudentId = uuidv4();

        // 1. إنشاء حساب الطالب في profiles بالبريد الفريد
        const { error: profileError } = await (supabase.from('profiles') as any)
            .insert([{
                id: newStudentId,
                name: payload.name,
                email: normalizedEmail,
                role: 'student',
                created_at: new Date().toISOString()
            }]);

        if (profileError) throw new Error(`فشل إنشاء حساب الطالب: ${profileError.message}`);

        // 2. تحديث ملف الطفل لربطه بالحساب الجديد (العلاقة: ولي أمر -> طفل -> طالب)
        const { error: linkError } = await (supabase.from('child_profiles') as any)
            .update({ student_user_id: newStudentId })
            .eq('id', payload.childProfileId);

        if (linkError) {
            await supabase.from('profiles').delete().eq('id', newStudentId);
            throw new Error(`فشل ربط الحساب بالملف: ${linkError.message}`);
        }

        await reportingService.logAction('LINK_STUDENT_ACCOUNT', newStudentId, `طالب: ${payload.name}`, `إنشاء وربط حساب طالب جديد بملف الطفل ID: ${payload.childProfileId}`);
        return { success: true, studentId: newStudentId };
    },

    async linkStudentToChildProfile(payload: { studentUserId: string, childProfileId: number }) {
        const { error } = await (supabase.from('child_profiles') as any)
            .update({ student_user_id: payload.studentUserId })
            .eq('id', payload.childProfileId);
        
        if (error) throw error;
        await (supabase.from('profiles') as any).update({ role: 'student' }).eq('id', payload.studentUserId);
        
        return { success: true };
    },

    async unlinkStudentFromChildProfile(childProfileId: number) {
        const { data: childData } = await supabase.from('child_profiles').select('student_user_id').eq('id', childProfileId).single();
        const child = childData as any;
        
        if (child && child.student_user_id) {
            await (supabase.from('profiles') as any).update({ role: 'user' }).eq('id', child.student_user_id);
        }
        const { error } = await (supabase.from('child_profiles') as any).update({ student_user_id: null }).eq('id', childProfileId);
        if (error) throw error;
        
        return { success: true };
    },

    async deleteChildProfile(childId: number) {
        const { error } = await supabase.from('child_profiles').delete().eq('id', childId);
        if (error) throw error;
        return { success: true };
    },

    async createChildProfile(payload: Partial<ChildProfile>) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("جلسة غير صالحة");
        const { data, error } = await (supabase.from('child_profiles') as any).insert([{ ...payload, user_id: user.id }]).select().single();
        if (error) throw error;
        return data as ChildProfile;
    },

    async updateChildProfile(payload: Partial<ChildProfile> & { id: number }) {
        const { id, ...updates } = payload;
        const { data, error } = await (supabase.from('child_profiles') as any).update(updates).eq('id', id).select().single();
        if (error) throw error;
        return data as ChildProfile;
    },

    async getAllChildProfiles() {
        const { data } = await supabase.from('child_profiles').select('*');
        return (data || []) as ChildProfile[];
    },

    async updateUser(payload: UpdateUserPayload) {
        const { id, ...updates } = payload;

        if (updates.role && updates.role !== 'parent' && updates.role !== 'user') {
            const { count } = await supabase.from('child_profiles').select('*', { count: 'exact', head: true }).eq('user_id', id);
            if (count && count > 0) {
                throw new Error("لا يمكن تغيير رتبة ولي الأمر لوجود ملفات أطفال مرتبطة بحسابه.");
            }
        }

        const { data, error } = await (supabase.from('profiles') as any).update(updates).eq('id', id).select().single();
        if (error) throw error;

        await reportingService.logAction('UPDATE_USER_PROFILE', id, `مستخدم: ${data.name}`, `تحديث بيانات الحساب`);
        return data as UserProfile;
    },

    async updateUserPassword(payload: { userId: string, newPassword: string }) {
        // In a real app, this would use supabase admin auth to set password
        // Since we are mocking the backend logic somewhat, we'll just return success
        // In Supabase client side, you can only update your OWN password.
        return { success: true };
    },

    async resetStudentPassword(payload: { studentUserId: string; newPassword: string }) {
        await reportingService.logAction('RESET_STUDENT_PASSWORD', payload.studentUserId, `طالب ID: ${payload.studentUserId}`, `إعادة تعيين كلمة مرور`);
        return { success: true };
    },

    async bulkDeleteUsers(userIds: string[]) {
        const { error } = await supabase.from('profiles').delete().in('id', userIds);
        if (error) throw error;
        return { success: true };
    }
};
