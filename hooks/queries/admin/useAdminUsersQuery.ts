import { useQuery } from '@tanstack/react-query';
import { userService } from '../../../services/userService';
import type { UserProfile, ChildProfile, UserProfileWithRelations } from '../../../lib/database.types';

export interface UserWithParent extends UserProfileWithRelations {
    parentName?: string;
    activeStudentsCount: number;
    totalChildrenCount: number;
}

export const transformUsersWithRelations = (users: UserProfile[], children: ChildProfile[]): UserWithParent[] => {
    // خريطة لربط الطالب باسم وليه أمره
    const studentToParentNameMap = new Map<string, string>();
    const parentIdToChildrenMap = new Map<string, ChildProfile[]>();

    children.forEach(child => {
        if (!parentIdToChildrenMap.has(child.user_id)) {
            parentIdToChildrenMap.set(child.user_id, []);
        }
        parentIdToChildrenMap.get(child.user_id)!.push(child);

        if (child.student_user_id) {
            const parent = users.find(u => u.id === child.user_id);
            if (parent) {
                studentToParentNameMap.set(child.student_user_id, parent.name);
            }
        }
    });

    return users.map(user => {
        const userChildren = parentIdToChildrenMap.get(user.id) || [];
        const parentNameOfStudent = studentToParentNameMap.get(user.id);
        
        // الآن نعتمد على الدور المخزن في قاعدة البيانات لأنه تم تنظيفه
        // ونضيف فقط البيانات الإحصائية للعرض
        return {
            ...user,
            parentName: parentNameOfStudent,
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