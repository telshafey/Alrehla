
import { useQuery } from '@tanstack/react-query';
import { userService } from '../../../services/userService';
import type { UserProfile, ChildProfile, UserProfileWithRelations } from '../../../lib/database.types';

export interface UserWithParent extends UserProfileWithRelations {
    parentName?: string;
    parentId?: string;
}

export const transformUsersWithRelations = (users: UserProfile[], children: ChildProfile[]): UserWithParent[] => {
    // 1. خريطة للطلاب المفعلين فقط لكل أب (الذين لديهم حسابات طالب)
    const activeStudentsByParentId = new Map<string, ChildProfile[]>();
    // 2. خريطة للطالب لكل أب (لربط الطالب بولي أمره في العرض)
    const studentToParentMap = new Map<string, { id: string, name: string }>();

    children.forEach(child => {
        // إذا كان الطفل مرتبطاً بحساب طالب نشط، نقوم بحسابه
        if (child.student_user_id) {
            // حساب الطلاب المفعلين لكل أب
            if (!activeStudentsByParentId.has(child.user_id)) {
                activeStudentsByParentId.set(child.user_id, []);
            }
            activeStudentsByParentId.get(child.user_id)!.push(child);

            // تسجيل علاقة الطالب بولي أمره
            const parent = users.find(u => u.id === child.user_id);
            if (parent) {
                studentToParentMap.set(child.student_user_id, { id: parent.id, name: parent.name });
            }
        }
    });

    return users.map(user => {
        const activatedChildren = activeStudentsByParentId.get(user.id) || [];
        const activatedCount = activatedChildren.length;
        const parentInfo = studentToParentMap.get(user.id);

        // المنطق المطلوب: المستخدم يصبح ولي أمر فقط إذا كان لديه طالب واحد على الأقل مفعل
        let effectiveRole = user.role;
        if (activatedCount > 0 && effectiveRole === 'user') {
            effectiveRole = 'parent';
        }

        return {
            ...user,
            role: effectiveRole,
            children: activatedChildren, // نكتفي بعرض الأطفال المفعلين (الطلاب) في هذه القائمة
            childrenCount: activatedCount, // عدد الطلاب النشطين
            parentName: parentInfo?.name,
            parentId: parentInfo?.id
        };
    });
};

export const useAdminUsers = () => useQuery({
    queryKey: ['adminUsers'],
    queryFn: () => userService.getAllUsers(),
});

export const useAdminAllChildProfiles = () => useQuery({
    queryKey: ['adminAllChildProfiles'],
    queryFn: () => userService.getAllChildProfiles(),
});
