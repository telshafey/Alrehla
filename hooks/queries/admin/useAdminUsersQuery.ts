
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabaseClient';
import type { UserProfile, ChildProfile, UserWithParent } from '../../../lib/database.types';

export type { UserWithParent };

export const transformUsersWithRelations = (users: UserProfile[], children: ChildProfile[]): UserWithParent[] => {
    // 1. خريطة لربط معرف ولي الأمر بقائمة أطفاله
    const parentIdToChildrenMap = new Map<string, ChildProfile[]>();

    // معالجة الأطفال وبناء الخرائط
    children.forEach(child => {
        // تنظيف المعرفات لضمان التطابق
        const parentId = child.user_id ? String(child.user_id).trim() : null;

        // ربط الأبناء بالآباء
        if (parentId) {
            if (!parentIdToChildrenMap.has(parentId)) {
                parentIdToChildrenMap.set(parentId, []);
            }
            parentIdToChildrenMap.get(parentId)!.push(child);
        }
    });

    // 2. معالجة المستخدمين وإزالة التكرار (Deduplication based on Email)
    const uniqueUsersMap = new Map<string, UserWithParent>();

    users.forEach(user => {
        if (!user.email) return;

        const normalizedEmail = user.email.toLowerCase().trim();
        const userId = String(user.id).trim();

        // جلب الأطفال المرتبطين بهذا المستخدم
        const userChildren = parentIdToChildrenMap.get(userId) || [];
        
        // إذا كان المستخدم موجوداً بالفعل في الخريطة (مكرر)، نقوم بدمج البيانات
        if (uniqueUsersMap.has(normalizedEmail)) {
            const existingUser = uniqueUsersMap.get(normalizedEmail)!;
            
            // دمج الأطفال
            const combinedChildren = [...(existingUser.children || []), ...userChildren];
            // إزالة تكرار الأطفال إن وجد
            const uniqueChildren = Array.from(new Map(combinedChildren.map(c => [c.id, c])).values());
            
            existingUser.children = uniqueChildren;
            existingUser.totalChildrenCount = uniqueChildren.length;
            existingUser.activeStudentsCount = uniqueChildren.filter(c => !!c.student_user_id).length;
            existingUser.isActuallyParent = uniqueChildren.some(c => c.student_user_id !== null);
            
            // تحديث الدور إذا كان السجل الجديد لديه صلاحية أعلى
            if (user.role === 'super_admin' || user.role === 'instructor') {
                existingUser.role = user.role;
                existingUser.id = user.id; 
            }

            return;
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

    // 3. تحديث بيانات الآباء لحسابات الطلاب (بعد توحيد المستخدمين)
    const finalUsers = Array.from(uniqueUsersMap.values());
    
    return finalUsers.map(user => {
        // إذا كان هذا المستخدم طالباً، نحاول العثور على وليه
        if (user.role === 'student') {
            const childRecord = children.find(c => c.student_user_id && String(c.student_user_id).trim() === String(user.id).trim());
            if (childRecord && childRecord.user_id) {
                const parentId = String(childRecord.user_id).trim();
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
