
import { useQuery } from '@tanstack/react-query';
import { userService } from '../../../services/userService';
import type { UserProfile, ChildProfile, UserProfileWithRelations } from '../../../lib/database.types';

export const transformUsersWithRelations = (users: UserProfile[], children: ChildProfile[]): UserProfileWithRelations[] => {
    const childrenByParentId = new Map<string, ChildProfile[]>();
    children.forEach(child => {
        if (!childrenByParentId.has(child.user_id)) {
            childrenByParentId.set(child.user_id, []);
        }
        childrenByParentId.get(child.user_id)!.push(child);
    });
    return users.map(user => {
        const userChildren = childrenByParentId.get(user.id) || [];
        return {
            ...user,
            children: userChildren,
            childrenCount: userChildren.length,
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
