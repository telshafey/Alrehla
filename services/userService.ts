
import { supabase, getTemporaryClient } from '../lib/supabaseClient';
import { reportingService } from './reportingService';
import type { UserProfile, ChildProfile, UserRole } from '../lib/database.types';

export interface CreateUserPayload {
    name: string;
    email: string;
    role: UserRole;
    phone?: string;
    address?: string;
    password?: string;
}

export interface UpdateUserPayload {
    id: string;
    name?: string;
    email?: string;
    role?: UserRole;
    phone?: string;
    address?: string;
    governorate?: string;
    city?: string;
    country?: string;
    timezone?: string;
    currency?: string;
    password?: string;
}

export interface GetUsersOptions {
    page?: number;
    pageSize?: number;
    search?: string;
    roleFilter?: string;
}

const checkEmailExists = async (email: string): Promise<boolean> => {
    try {
        const normalizedEmail = email.toLowerCase().trim();
        const { data } = await supabase
            .from('profiles')
            .select('id')
            .ilike('email', normalizedEmail)
            .maybeSingle();
        return !!data;
    } catch (e) {
        return false;
    }
};

export const userService = {
    // تم تحديث الدالة لدعم Pagination والبحث
    async getAllUsers(options: GetUsersOptions = {}) {
        const { page = 1, pageSize = 50, search = '', roleFilter = 'all' } = options;
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        try {
            let query = supabase
                .from('profiles')
                .select('*', { count: 'exact' });

            // تطبيق البحث
            if (search) {
                query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
            }

            // تطبيق فلتر الرتبة
            if (roleFilter && roleFilter !== 'all') {
                // التعامل مع فئات الرتب
                if (roleFilter === 'staff') {
                    query = query.in('role', ['super_admin', 'general_supervisor', 'instructor', 'content_editor', 'support_agent', 'enha_lak_supervisor', 'creative_writing_supervisor']);
                } else if (roleFilter === 'customers') {
                     query = query.in('role', ['user', 'parent']);
                } else {
                    query = query.eq('role', roleFilter);
                }
            }

            // الترتيب والتقسيم
            query = query
                .order('created_at', { ascending: false })
                .range(from, to);

            const { data, error, count } = await query;

            if (error) {
                console.warn("getAllUsers failed:", error.message);
                return { users: [], count: 0 };
            }

            return { users: (data || []) as UserProfile[], count: count || 0 };
        } catch (e) {
            console.error("Critical error fetching users:", e);
            return { users: [], count: 0 };
        }
    },

    async isEmailTaken(email: string): Promise<boolean> {
        return checkEmailExists(email);
    },

    async createUser(payload: CreateUserPayload) {
        const { name, email, role, phone, address, password } = payload;
        const normalizedEmail = email.toLowerCase().trim();

        const taken = await checkEmailExists(normalizedEmail);
        if (taken) {
            throw new Error(`البريد الإلكتروني ${normalizedEmail} مسجل بالفعل لمستخدم آخر.`);
        }
        
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: normalizedEmail,
            password: password || '123456',
            options: {
                data: { name, role }
            }
        });

        if (authError) throw new Error(authError.message);
        if (!authData.user) throw new Error("فشل إنشاء حساب المستخدم.");

        const userId = authData.user.id;

        const { data: profile, error: pError } = await (supabase.from('profiles') as any)
            .upsert([{
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

        if (pError) {
             console.error("Profile creation error (ignored if auth succeeded):", pError);
        }

        if (role === 'instructor') {
             try {
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
             } catch (e) { console.warn("Failed to create instructor record", e); }
        }

        await reportingService.logAction('CREATE_USER', userId, `مستخدم: ${name}`, `إنشاء حساب جديد برتبة: ${role}`);
        return (profile || { id: userId, name, email, role }) as UserProfile;
    },

    async createAndLinkStudentAccount(payload: { name: string, email: string, password?: string, childProfileId: number }) {
        const normalizedEmail = payload.email.toLowerCase().trim();
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (!currentUser) throw new Error("يجب تسجيل الدخول كولي أمر أولاً.");

        const tempSupabase = getTemporaryClient();

        const { data: authData, error: authError } = await tempSupabase.auth.signUp({
            email: normalizedEmail,
            password: payload.password || '123456',
            options: { data: { name: payload.name, role: 'student' } }
        });

        if (authError) throw new Error(authError.message);
        if (!authData.user) throw new Error("فشل إنشاء حساب الطالب في النظام.");

        const studentUserId = authData.user.id;

        await (tempSupabase.from('profiles') as any).insert([{
            id: studentUserId,
            name: payload.name,
            email: normalizedEmail,
            role: 'student',
            created_at: new Date().toISOString()
        }]);

        const { error: linkError } = await (supabase.from('child_profiles') as any)
            .update({ student_user_id: studentUserId })
            .eq('id', payload.childProfileId);
        
        if (linkError) throw new Error(`فشل ربط الحساب بملف الطفل: ${linkError.message}`);

        const { data: profileData } = await supabase.from('profiles').select('role').eq('id', currentUser.id).single();
        const parentProfile = profileData as { role: string } | null;
        
        if (parentProfile && parentProfile.role === 'user') {
            await (supabase.from('profiles') as any).update({ role: 'parent' }).eq('id', currentUser.id);
        }

        return { success: true, studentId: studentUserId };
    },

    async linkStudentToChildProfile(payload: { studentUserId: string, childProfileId: number }) {
        const { error } = await (supabase.from('child_profiles') as any)
            .update({ student_user_id: payload.studentUserId })
            .eq('id', payload.childProfileId);
        
        if (error) throw new Error(error.message);
        return { success: true };
    },

    async unlinkStudentFromChildProfile(childProfileId: number) {
        const { error } = await (supabase.from('child_profiles') as any).update({ student_user_id: null }).eq('id', childProfileId);
        if (error) throw new Error(error.message);
        return { success: true };
    },

    async createChildProfile(payload: Partial<ChildProfile>) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("جلسة غير صالحة");

        const { data, error } = await (supabase.from('child_profiles') as any)
            .insert([{ ...payload, user_id: user.id }])
            .select()
            .single();

        if (error) throw new Error(error.message);
        
        const { data: profileData } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        const parentProfile = profileData as { role: string } | null;

        if (parentProfile && parentProfile.role === 'user') {
             await (supabase.from('profiles') as any).update({ role: 'parent' }).eq('id', user.id);
        }

        return data as ChildProfile;
    },

    async updateChildProfile(payload: Partial<ChildProfile> & { id: number }) {
        const { id, ...updates } = payload;
        const { data, error } = await (supabase.from('child_profiles') as any).update(updates).eq('id', id).select().single();
        if (error) throw new Error(error.message);
        return data as ChildProfile;
    },

    async deleteChildProfile(childId: number) {
        const { error } = await supabase.from('child_profiles').delete().eq('id', childId);
        if (error) throw new Error(error.message);
        return { success: true };
    },

    async getAllChildProfiles(userIds?: string[]) {
        try {
            let query = supabase.from('child_profiles').select('*');
            if (userIds && userIds.length > 0) {
                query = query.in('user_id', userIds);
            }
            const { data } = await query;
            return (data || []) as ChildProfile[];
        } catch { return []; }
    },

    async updateUser(payload: UpdateUserPayload) {
        const { id, password, ...updates } = payload;
        const { data, error } = await (supabase.from('profiles') as any).update(updates).eq('id', id).select().single();
        if (error) throw new Error(error.message);

        if (password && password.trim() !== '') {
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            if (currentUser && currentUser.id === id) {
                const { error: updateError } = await supabase.auth.updateUser({ password: password });
                if (updateError) throw new Error(`فشل تغيير كلمة المرور: ${updateError.message}`);
            } else {
                 // Fixed: using explicit reference instead of 'this'
                 await userService.resetStudentPassword({ studentUserId: id, newPassword: password });
            }
        }
        return data as UserProfile;
    },

    async updateUserPassword(payload: { userId: string, newPassword: string }) {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (currentUser && currentUser.id === payload.userId) {
             const { error } = await supabase.auth.updateUser({ password: payload.newPassword });
             if (error) throw new Error(error.message);
        } else {
             // Fixed: using explicit reference instead of 'this'
             return userService.resetStudentPassword({ studentUserId: payload.userId, newPassword: payload.newPassword });
        }
        return { success: true };
    },

    async resetStudentPassword(payload: { studentUserId: string; newPassword: string }) {
        const { error } = await (supabase.rpc as any)('reset_student_password', {
            target_student_id: payload.studentUserId,
            new_password: payload.newPassword
        });

        if (error) {
             console.error("Password reset RPC error:", error);
             if (error.message.includes('Not authorized')) {
                 throw new Error("غير مصرح لك بتغيير كلمة مرور هذا المستخدم.");
             }
             throw new Error("فشل تغيير كلمة المرور: " + error.message);
        }
        return { success: true };
    },

    async bulkDeleteUsers(userIds: string[]) {
        const { error } = await supabase.from('profiles').delete().in('id', userIds);
        if (error) throw new Error(error.message);
        return { success: true };
    }
};
