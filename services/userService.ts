
import { supabase, getTemporaryClient } from '../lib/supabaseClient';
import { reportingService } from './reportingService';
import type { UserProfile, ChildProfile, UserRole } from '../lib/database.types';
import { v4 as uuidv4 } from 'uuid';

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
    password?: string; // Add optional password to type
}

const checkEmailExists = async (email: string): Promise<boolean> => {
    try {
        const normalizedEmail = email.toLowerCase().trim();
        const { data } = await supabase
            .from('profiles')
            .select('id')
            .ilike('email', normalizedEmail) // Use ilike for case-insensitive check
            .maybeSingle();
        return !!data;
    } catch (e) {
        return false;
    }
};

export const userService = {
    async getAllUsers() {
        try {
            const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
            if (error) {
                console.warn("getAllUsers failed:", error.message);
                return []; // Return empty instead of throwing to prevent crash
            }
            return (data || []) as UserProfile[];
        } catch (e) {
            console.error("Critical error fetching users:", e);
            return [];
        }
    },

    async isEmailTaken(email: string): Promise<boolean> {
        return checkEmailExists(email);
    },

    async createUser(payload: CreateUserPayload) {
        const { name, email, role, phone, address, password } = payload;
        const normalizedEmail = email.toLowerCase().trim();

        // Warning: This check might fail if DB is broken, allowing duplicates temporarily
        const taken = await checkEmailExists(normalizedEmail);
        if (taken) {
            throw new Error(`البريد الإلكتروني ${normalizedEmail} مسجل بالفعل لمستخدم آخر.`);
        }

        // --- AUTH CREATION LOGIC ---
        
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: normalizedEmail,
            password: password || '123456', // Fallback password if not provided
            options: {
                data: { name, role }
            }
        });

        if (authError) throw new Error(authError.message);
        if (!authData.user) throw new Error("فشل إنشاء حساب المستخدم.");

        const userId = authData.user.id;

        // Ensure profile is created
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

        // Create instructor record if role is instructor
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

    /**
     * إنشاء حساب طالب وربطه بولي الأمر (الحل الجذري للمشاكل الثلاثة)
     */
    async createAndLinkStudentAccount(payload: { name: string, email: string, password?: string, childProfileId: number }) {
        const normalizedEmail = payload.email.toLowerCase().trim();
        
        // 0. التحقق من وجود المستخدم الحالي (ولي الأمر) لضمان الصلاحية
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (!currentUser) throw new Error("يجب تسجيل الدخول كولي أمر أولاً.");

        // 1. استخدام عميل مؤقت لمنع تبديل الجلسة (حل المشكلة 3)
        const tempSupabase = getTemporaryClient();

        const { data: authData, error: authError } = await tempSupabase.auth.signUp({
            email: normalizedEmail,
            password: payload.password || '123456',
            options: { data: { name: payload.name, role: 'student' } }
        });

        if (authError) throw new Error(authError.message);
        if (!authData.user) throw new Error("فشل إنشاء حساب الطالب في النظام.");

        const studentUserId = authData.user.id;

        // 2. إنشاء بروفايل الطالب باستخدام العميل المؤقت (لأنه هو المالك للحساب الجديد)
        // هذا يضمن عدم وجود مشاكل RLS عند إنشاء البروفايل
        const { error: profileError } = await (tempSupabase.from('profiles') as any).insert([{
            id: studentUserId,
            name: payload.name,
            email: normalizedEmail,
            role: 'student',
            created_at: new Date().toISOString()
        }]);

        if (profileError) {
             console.error("Student Profile Creation Error:", profileError);
             // نكمل العملية لأن الحساب أُنشئ، لكن نسجل الخطأ
        }

        // 3. ربط الطالب بملف الطفل باستخدام العميل الرئيسي (ولي الأمر - حل المشكلة 1)
        // نستخدم العميل الرئيسي `supabase` لأنه يملك صلاحية تعديل `child_profiles` التي يملكها الأب
        // إذا تبدلت الجلسة (المشكلة 3)، ستفشل هذه الخطوة لأن الطالب لا يملك هذا الملف. استخدام العميل المؤقت في الخطوة 1 يمنع ذلك.
        const { error: linkError } = await (supabase.from('child_profiles') as any)
            .update({ student_user_id: studentUserId })
            .eq('id', payload.childProfileId);
        
        if (linkError) throw new Error(`فشل ربط الحساب بملف الطفل: ${linkError.message}`);

        // 4. ترقية ولي الأمر إلى رتبة "parent" إذا كان "user" (حل المشكلة 2)
        // نستخدم Casting صريح لتجنب خطأ TypeScript 'property role does not exist on type never'
        const { data: profileData } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', currentUser.id)
            .single();
        
        const parentProfile = profileData as { role: string } | null;
        
        if (parentProfile && parentProfile.role === 'user') {
            const { error: roleError } = await (supabase.from('profiles') as any)
                .update({ role: 'parent' })
                .eq('id', currentUser.id);
            
            if (roleError) console.error("Failed to upgrade parent role:", roleError);
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

        // إضافة الطفل
        const { data, error } = await (supabase.from('child_profiles') as any)
            .insert([{ ...payload, user_id: user.id }])
            .select()
            .single();

        if (error) throw new Error(error.message);
        
        // التحقق وترقية ولي الأمر تلقائياً عند إضافة أول طفل
        const { data: profileData } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
            
        // Explicit casting fix
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
    
    async checkAndDowngradeParentRole(parentId: string) {
       // Optional implementation
    },

    async getAllChildProfiles() {
        try {
            const { data } = await supabase.from('child_profiles').select('*');
            return (data || []) as ChildProfile[];
        } catch { return []; }
    },

    async updateUser(payload: UpdateUserPayload) {
        // 1. Separate password from profile data
        const { id, password, ...updates } = payload;
        
        // 2. Update Profile Data in 'profiles' table
        const { data, error } = await (supabase.from('profiles') as any).update(updates).eq('id', id).select().single();
        
        if (error) throw new Error(error.message);

        // 3. Update Password Logic
        if (password && password.trim() !== '') {
            // Check if we are updating ourselves
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            
            if (currentUser && currentUser.id === id) {
                // A. Updating OWN password (Allowed)
                const { error: updateError } = await supabase.auth.updateUser({ password: password });
                if (updateError) throw new Error(`فشل تغيير كلمة المرور: ${updateError.message}`);
            } else {
                // B. Admin updating ANOTHER user's password
                // This typically fails in client-side Supabase without a Service Role.
                try {
                    const { error: adminError } = await supabase.auth.admin.updateUserById(id, { password: password });
                    if (adminError) throw adminError;
                } catch (err: any) {
                    console.warn("Password update skipped (Client-side Admin restriction):", err.message);
                    // Use RPC as fallback
                     await this.resetStudentPassword({ studentUserId: id, newPassword: password });
                }
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
             // Fallback to RPC if client admin call fails
             try {
                const { error } = await supabase.auth.admin.updateUserById(payload.userId, { password: payload.newPassword });
                if (error) throw error;
             } catch (e) {
                 return this.resetStudentPassword({ studentUserId: payload.userId, newPassword: payload.newPassword });
             }
        }
        return { success: true };
    },

    async resetStudentPassword(payload: { studentUserId: string; newPassword: string }) {
        // نستخدم RPC المخصص "reset_student_password" الذي يسمح لولي الأمر بتغيير كلمة المرور
        // Cast supabase.rpc to any to bypass strict typing if definition is missing in local types
        const { error } = await (supabase.rpc as any)('reset_student_password', {
            target_student_id: payload.studentUserId,
            new_password: payload.newPassword
        });

        if (error) {
             console.error("Password reset RPC error:", error);
             if (error.message.includes('Not authorized')) {
                 throw new Error("غير مصرح لك بتغيير كلمة مرور هذا الطالب. تأكد من أنك ولي الأمر المرتبط به.");
             }
             // محاولة أخيرة كمدير نظام (إذا كان المستخدم الحالي أدمن)
             try {
                 const { error: adminError } = await supabase.auth.admin.updateUserById(payload.studentUserId, { password: payload.newPassword });
                 if (adminError) throw adminError;
             } catch (e) {
                  throw new Error("فشل تغيير كلمة المرور: " + error.message);
             }
        }
        
        return { success: true };
    },

    async bulkDeleteUsers(userIds: string[]) {
        const { error } = await supabase.from('profiles').delete().in('id', userIds);
        if (error) throw new Error(error.message);
        return { success: true };
    }
};
