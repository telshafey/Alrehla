import { useQuery } from '@tanstack/react-query';
import { userService } from '../../../services/userService';
import type { UserProfile, ChildProfile, UserProfileWithRelations, UserRole } from '../../../lib/database.types';

export interface UserWithParent extends UserProfileWithRelations {
    parentName?: string;
    activeStudentsCount: number;
    totalChildrenCount: number;
}

export const transformUsersWithRelations = (users: UserProfile[], children: ChildProfile[]): UserWithParent[] => {
    const studentIdToParentNameMap = new Map<string, string>();
    const parentIdToChildrenMap = new Map<string, ChildProfile[]>();

    // بناء الخريطة: لكل طالب، من هو وليه أمره؟
    children.forEach(child => {
        // إضافة الطفل لقائمة أبيه
        if (!parentIdToChildrenMap.has(child.user_id)) {
            parentIdToChildrenMap.set(child.user_id, []);
        }
        parentIdToChildrenMap.get(child.user_id)!.push(child);

        // إذا كان الطفل له حساب طالب، نربطه باسم الأب
        if (child.student_user_id) {
            const parent = users.find(u => u.id === child.user_id);
            if (parent) {
                studentIdToParentNameMap.set(child.student_user_id, parent.name);
            }
        }
    });

    return users.map(user => {
        const userChildren = parentIdToChildrenMap.get(user.id) || [];
        const hasActiveStudents = userChildren.some(c => !!c.student_user_id);
        
        let displayRole: UserRole = user.role;
        
        // تصحيح الرتبة في العرض بناءً على العلاقات
        if (['user', 'parent'].includes(user.role)) {
            displayRole = hasActiveStudents ? 'parent' : 'user';
        }

        return {
            ...user,
            role: displayRole,
            parentName: studentIdToParentNameMap.get(user.id), // سيظهر اسم "مها" بجانب "هناء"
            activeStudentsCount: userChildren.filter(c => !!c.student_user_id).length,
            totalChildrenCount: userChildren.length,
            children: userChildren
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