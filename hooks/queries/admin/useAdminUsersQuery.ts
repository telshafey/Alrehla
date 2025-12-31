
import { useQuery } from '@tanstack/react-query';
import { userService } from '../../../services/userService';
import type { UserProfile, ChildProfile, UserProfileWithRelations } from '../../../lib/database.types';

export interface UserWithParent extends UserProfileWithRelations {
    parentName?: string;
    parentId?: string;
    activeStudentsCount: number;
    totalChildrenCount: number;
}

export const transformUsersWithRelations = (users: UserProfile[], children: ChildProfile[]): UserWithParent[] => {
    // خريطة لتجميع الأطفال لكل مستخدم
    const childrenByUserId = new Map<string, ChildProfile[]>();
    // خريطة لربط الطالب (student_user_id) ببيانات ولي أمره
    const studentToParentMap = new Map<string, { id: string, name: string }>();

    children.forEach(child => {
        // تجميع كل الأطفال بناءً على user_id (الأب)
        if (!childrenByUserId.has(child.user_id)) {
            childrenByUserId.set(child.user_id, []);
        }
        childrenByUserId.get(child.user_id)!.push(child);

        // إذا كان الطفل طالباً مفعلاً، نسجل علاقة العودة
        if (child.student_user_id) {
            const parent = users.find(u => u.id === child.user_id);
            if (parent) {
                studentToParentMap.set(child.student_user_id, { id: parent.id, name: parent.name });
            }
        }
    });

    return users.map(user => {
        const userChildren = childrenByUserId.get(user.id) || [];
        const totalChildrenCount = userChildren.length;
        const activeStudentsCount = userChildren.filter(c => !!c.student_user_id).length;
        const parentInfo = studentToParentMap.get(user.id);

        // ترقية الدور تلقائياً: إذا كان لديه أي طفل فهو ولي أمر
        let effectiveRole = user.role;
        if (totalChildrenCount > 0 && effectiveRole === 'user') {
            effectiveRole = 'parent';
        }

        return {
            ...user,
            role: effectiveRole,
            children: userChildren,
            activeStudentsCount,
            totalChildrenCount,
            childrenCount: totalChildrenCount, // للتوافق مع المكونات الأخرى
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
