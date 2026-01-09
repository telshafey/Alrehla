
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
    const studentIdToParentInfoMap = new Map<string, { name: string, email: string }>();
    const parentIdToChildrenMap = new Map<string, ChildProfile[]>();

    // 1. بناء خريطة العلاقات من جدول الأطفال الحقيقي
    children.forEach(child => {
        // ربط الأبناء بالآباء
        if (child.user_id) {
            if (!parentIdToChildrenMap.has(child.user_id)) {
                parentIdToChildrenMap.set(child.user_id, []);
            }
            parentIdToChildrenMap.get(child.user_id)!.push(child);
        }

        // ربط حسابات الطلاب ببيانات أولياء الأمور
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

    // 2. دمج البيانات
    return users.map(user => {
        const userChildren = parentIdToChildrenMap.get(user.id) || [];
        const parentInfo = studentIdToParentInfoMap.get(user.id);
        
        // الحقيقة: هو ولي أمر فقط إذا كان لديه أطفال لديهم حسابات طلاب مفعلة
        const isActuallyParent = userChildren.some(c => c.student_user_id !== null);
        
        return {
            ...user,
            role: user.role, 
            parentName: parentInfo?.name,
            parentEmail: parentInfo?.email,
            activeStudentsCount: userChildren.filter(c => !!c.student_user_id).length,
            totalChildrenCount: userChildren.length,
            isActuallyParent: isActuallyParent,
            children: userChildren
        };
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
