import { useQuery } from '@tanstack/react-query';
import { mockUsers, mockChildProfiles } from '../../../data/mockData';
import type { UserProfile, ChildProfile, UserProfileWithRelations } from '../../../lib/database.types';

const mockFetch = (data: any, delay = 300) => new Promise(resolve => setTimeout(() => resolve(data), delay));

export const transformUsersWithRelations = (users: UserProfile[], children: ChildProfile[]): UserProfileWithRelations[] => {
    const childrenByParentId = new Map<string, ChildProfile[]>();
    children.forEach(child => {
        if (!childrenByParentId.has(child.user_id)) {
            childrenByParentId.set(child.user_id, []);
        }
        childrenByParentId.get(child.user_id)!.push(child);
    });
    return users.map(user => ({
        ...user,
        children: childrenByParentId.get(user.id) || []
    }));
};

export const useAdminUsers = () => useQuery({
    queryKey: ['adminUsers'],
    queryFn: () => mockFetch(mockUsers) as Promise<UserProfile[]>,
});

export const useAdminAllChildProfiles = () => useQuery({
    queryKey: ['adminAllChildProfiles'],
    queryFn: () => mockFetch(mockChildProfiles) as Promise<ChildProfile[]>,
});
