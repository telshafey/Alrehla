
import { useQuery } from '@tanstack/react-query';
import { userService } from '../../../services/userService';
import type { UserProfile, ChildProfile, UserProfileWithRelations, UserRole } from '../../../lib/database.types';

export interface UserWithParent extends UserProfileWithRelations {
    parentName?: string;
    parentEmail?: string;
    activeStudentsCount: number;
    totalChildrenCount: number;
}

export const transformUsersWithRelations = (users: UserProfile[], children: ChildProfile[]): UserWithParent[] => {
    // خريطة لتحديد هوية ولي الأمر لكل حساب طالب
    const studentIdToParentInfoMap = new Map<string, { name: string, email: string }>();
    const parentIdToChildrenMap = new Map<string, ChildProfile[]>();

    // 1. بناء هيكل العلاقات
    children.forEach(child => {
        // تجميع الأطفال تحت مظلة ولي الأمر
        if (!parentIdToChildrenMap.has(child.user_id)) {
            parentIdToChildrenMap.set(child.user_id, []);
        }
        parentIdToChildrenMap.get(child.user_id)!.push(child);

        // إذا كان هذا الطفل يملك حساب دخول (Student Login)، نربط حساب الدخول ببيانات ولي الأمر
        if (child.student_user_id) {
            const parent = users.find(u => u.id === child.user_id);
            if (parent) {
                studentIdToParentInfoMap.set(child.student_user_id, { 
                    name: parent.name, 
                    email: parent.email 
                });
            }
        }
    });

    // 2. معالجة كل مستخدم وإضافة بيانات الربط
    return users.map(user => {
        const userChildren = parentIdToChildrenMap.get(user.id) || [];
        const parentInfo = studentIdToParentInfoMap.get(user.id);
        
        let displayRole: UserRole = user.role;
        
        // تصحيح الرتبة تلقائياً في العرض بناءً على الواقع العملي
        if (['user', 'parent'].includes(user.role)) {
            displayRole = userChildren.length > 0 ? 'parent' : 'user';
        }

        return {
            ...user,
            role: displayRole,
            parentName: parentInfo?.name,
            parentEmail: parentInfo?.email,
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
