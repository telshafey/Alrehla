
import { useQuery } from '@tanstack/react-query';
import { userService } from '../../../services/userService';
import type { UserProfile, ChildProfile, UserProfileWithRelations } from '../../../lib/database.types';

export interface UserWithParent extends UserProfileWithRelations {
    parentName?: string;
    parentId?: string;
}

export const transformUsersWithRelations = (users: UserProfile[], children: ChildProfile[]): UserWithParent[] => {
    // 1. خريطة للأطفال لكل أب (لحساب عدد الأطفال)
    const childrenByParentId = new Map<string, ChildProfile[]>();
    // 2. خريطة للطالب لكل أب (لربط الطالب بولي أمره)
    const studentToParentMap = new Map<string, { id: string, name: string }>();

    children.forEach(child => {
        // حساب عدد الأطفال لكل أب
        if (!childrenByParentId.has(child.user_id)) {
            childrenByParentId.set(child.user_id, []);
        }
        childrenByParentId.get(child.user_id)!.push(child);

        // إذا كان هذا الطفل مرتبطاً بحساب طالب، نسجل من هو ولي أمره
        if (child.student_user_id) {
            const parent = users.find(u => u.id === child.user_id);
            if (parent) {
                studentToParentMap.set(child.student_user_id, { id: parent.id, name: parent.name });
            }
        }
    });

    return users.map(user => {
        const userChildren = childrenByParentId.get(user.id) || [];
        const parentInfo = studentToParentMap.get(user.id);

        return {
            ...user,
            children: userChildren,
            childrenCount: userChildren.length,
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
