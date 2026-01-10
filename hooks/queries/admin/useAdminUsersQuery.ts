
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabaseClient';
import type { UserProfile, ChildProfile, UserProfileWithRelations } from '../../../lib/database.types';

export interface UserWithParent extends UserProfileWithRelations {
    parentName?: string;
    parentEmail?: string;
    activeStudentsCount: number;
    totalChildrenCount: number;
    // حقل جديد لتحديد ما إذا كان "فعلياً" ولي أمر بناءً على البيانات
    isActuallyParent: boolean;
}

export const transformUsersWithRelations = (users: UserProfile[], children: ChildProfile[]): UserWithParent[] => {
    // 1. خريطة لربط معرف الطالب ببيانات ولي الأمر
    const studentIdToParentInfoMap = new Map<string, { name: string, email: string }>();
    
    // 2. خريطة لربط معرف ولي الأمر بقائمة أطفاله
    const parentIdToChildrenMap = new Map<string, ChildProfile[]>();

    // معالجة الأطفال وبناء الخرائط
    children.forEach(child => {
        // تنظيف المعرفات لضمان التطابق
        const parentId = child.user_id ? String(child.user_id).trim() : null;
        const studentId = child.student_user_id ? String(child.student_user_id).trim() : null;

        // ربط الأبناء بالآباء
        if (parentId) {
            if (!parentIdToChildrenMap.has(parentId)) {
                parentIdToChildrenMap.set(parentId, []);
            }
            parentIdToChildrenMap.get(parentId)!.push(child);
        }

        // ربط حسابات الطلاب ببيانات أولياء الأمور للعرض العكسي
        if (studentId && parentId) {
            // نبحث عن الأب في قائمة المستخدمين الأصلية
            // نستخدم find مؤقتاً هنا، لكن الخريطة أدناه ستكون أسرع
             // (سيتم تحسين هذا الجزء بالاعتماد على خريطة المستخدمين الموحدة لاحقاً)
        }
    });

    // 3. معالجة المستخدمين وإزالة التكرار (Deduplication based on Email)
    const uniqueUsersMap = new Map<string, UserWithParent>();

    users.forEach(user => {
        if (!user.email) return;

        const normalizedEmail = user.email.toLowerCase().trim();
        const userId = String(user.id).trim();

        // جلب الأطفال المرتبطين بهذا المستخدم (سواء كان هو السجل الأصلي أو المكرر)
        const userChildren = parentIdToChildrenMap.get(userId) || [];
        
        // إذا كان المستخدم موجوداً بالفعل في الخريطة (مكرر)، نقوم بدمج البيانات
        if (uniqueUsersMap.has(normalizedEmail)) {
            const existingUser = uniqueUsersMap.get(normalizedEmail)!;
            
            // دمج الأطفال
            const combinedChildren = [...existingUser.children!, ...userChildren];
            // إزالة تكرار الأطفال إن وجد
            const uniqueChildren = Array.from(new Map(combinedChildren.map(c => [c.id, c])).values());
            
            existingUser.children = uniqueChildren;
            existingUser.totalChildrenCount = uniqueChildren.length;
            existingUser.activeStudentsCount = uniqueChildren.filter(c => !!c.student_user_id).length;
            existingUser.isActuallyParent = uniqueChildren.some(c => c.student_user_id !== null);
            
            // تحديث الدور إذا كان السجل الجديد لديه صلاحية أعلى (مثلاً Admin يغلب User)
            if (user.role === 'super_admin' || user.role === 'instructor') {
                existingUser.role = user.role;
                existingUser.id = user.id; // نعتمد ID الحساب ذو الصلاحية الأعلى
            }

            return; // تخطي إنشاء سجل جديد
        }

        // إنشاء سجل جديد
        const isActuallyParent = userChildren.some(c => c.student_user_id !== null);

        const newUser: UserWithParent = {
            ...user,
            role: user.role,
            activeStudentsCount: userChildren.filter(c => !!c.student_user_id).length,
            totalChildrenCount: userChildren.length,
            isActuallyParent: isActuallyParent,
            children: userChildren
        };

        uniqueUsersMap.set(normalizedEmail, newUser);
    });

    // 4. تحديث بيانات الآباء لحسابات الطلاب (بعد توحيد المستخدمين)
    // نحتاج المرور مرة أخرى لربط الطلاب بآبائهم الموحدين
    const finalUsers = Array.from(uniqueUsersMap.values());
    
    // بناء خريطة سريعة للبحث عن الآباء بالـ ID
    const userIdToUserMap = new Map<string, UserWithParent>();
    finalUsers.forEach(u => userIdToUserMap.set(u.id, u));

    return finalUsers.map(user => {
        // إذا كان هذا المستخدم طالباً، نحاول العثور على وليه
        if (user.role === 'student') {
            // نبحث في كل الأطفال لمعرفة من يملك هذا الـ student_user_id
            const childRecord = children.find(c => c.student_user_id && String(c.student_user_id).trim() === String(user.id).trim());
            if (childRecord && childRecord.user_id) {
                const parentId = String(childRecord.user_id).trim();
                // نبحث عن الأب في القائمة الموحدة.
                // ملاحظة: قد يكون الأب تم دمجه تحت ID آخر، لذا البحث قد يكون معقداً قليلاً
                // لكننا سنبحث في القائمة الأصلية أولاً للعثور على الاسم
                const originalParent = users.find(u => String(u.id).trim() === parentId);
                if (originalParent) {
                    return {
                        ...user,
                        parentName: originalParent.name,
                        parentEmail: originalParent.email
                    };
                }
            }
        }
        return user;
    });
};

export const useAdminUsers = () => useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
        const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return (data || []) as UserProfile[];
    },
});

export const useAdminAllChildProfiles = () => useQuery({
    queryKey: ['adminAllChildProfiles'],
    queryFn: async () => {
        const { data, error } = await supabase.from('child_profiles').select('*');
        if (error) throw error;
        return (data || []) as ChildProfile[];
    },
});
