
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabaseClient';
import { userService } from '../../../services/userService';
import type { UserProfile, ChildProfile, UserWithParent } from '../../../lib/database.types';

export type { UserWithParent };

// دالة التحويل لدمج البيانات
export const transformUsersWithRelations = (
    users: UserProfile[], 
    children: ChildProfile[], 
    parentsMap: Map<string, { name: string, email: string }>
): UserWithParent[] => {
    
    // 1. خريطة لربط معرف ولي الأمر بقائمة أطفاله
    const parentIdToChildrenMap = new Map<string, ChildProfile[]>();

    children.forEach(child => {
        const parentId = child.user_id ? String(child.user_id).trim() : null;
        if (parentId) {
            if (!parentIdToChildrenMap.has(parentId)) {
                parentIdToChildrenMap.set(parentId, []);
            }
            parentIdToChildrenMap.get(parentId)!.push(child);
        }
    });

    const processedUsers: UserWithParent[] = users.map(user => {
        const userId = String(user.id).trim();
        
        // أ. إذا كان المستخدم ولي أمر: نربط أطفاله به
        const userChildren = parentIdToChildrenMap.get(userId) || [];
        const isActuallyParent = userChildren.length > 0;

        // ب. إذا كان المستخدم طالب: نبحث عن ملف الطفل المرتبط به لنجد الأب
        let parentName = undefined;
        let parentEmail = undefined;
        let relatedChildName = undefined;

        if (user.role === 'student') {
            // البحث عن السجل في جدول الأطفال الذي يشير لهذا الطالب
            // نقوم بتنظيف المعرفات ومقارنتها بدقة
            const childRecord = children.find(c => c.student_user_id && String(c.student_user_id).trim() === userId);
            
            if (childRecord) {
                relatedChildName = childRecord.name;
                // إذا وجدنا ملف الطفل، نأخذ معرف الأب ونبحث عنه في خريطة الآباء التي جلبناها
                if (childRecord.user_id) {
                    const parentData = parentsMap.get(childRecord.user_id);
                    if (parentData) {
                        parentName = parentData.name;
                        parentEmail = parentData.email;
                    } else {
                        // حالة نادرة: الأب موجود في child_profiles لكن حسابه محذوف أو لم يجلب
                        parentName = 'غير معروف (حساب محذوف؟)';
                    }
                }
            }
        }

        return {
            ...user,
            activeStudentsCount: userChildren.filter(c => !!c.student_user_id).length,
            totalChildrenCount: userChildren.length,
            isActuallyParent,
            children: userChildren,
            parentName, // اسم ولي الأمر (للطلاب)
            parentEmail, // إيميل ولي الأمر (للطلاب)
            relatedChildName // اسم الطفل في الملف العائلي (قد يختلف عن اسم حساب الدخول)
        };
    });

    return processedUsers;
};

interface UseAdminUsersOptions {
    page: number;
    pageSize: number;
    search: string;
    roleFilter: string;
}

export const useAdminUsers = (options: UseAdminUsersOptions) => {
    return useQuery({
        queryKey: ['adminUsers', options],
        queryFn: async () => {
            // 1. جلب المستخدمين للصفحة الحالية
            const { users, count } = await userService.getAllUsers(options);
            const userIds = users.map(u => u.id);

            // 2. جلب جميع ملفات الأطفال المرتبطة بهؤلاء المستخدمين
            
            // أ. البحث عن الأطفال حيث المستخدم هو "الأب"
            const { data: childrenOfParents } = await supabase
                .from('child_profiles')
                .select('*')
                .in('user_id', userIds);

            // ب. البحث عن الأطفال حيث المستخدم هو "الطالب" (لجلب بيانات ولي الأمر)
            // نتأكد من شمول جميع المستخدمين الذين قد يكونون طلاباً (حتى لو كان الدور غير دقيق)
            const potentialStudentIds = users.map(u => u.id);
            let childrenOfStudents: ChildProfile[] = [];
            
            if (potentialStudentIds.length > 0) {
                const { data } = await supabase
                    .from('child_profiles')
                    .select('*')
                    .in('student_user_id', potentialStudentIds);
                childrenOfStudents = data as ChildProfile[] || [];
            }

            // دمج كل ملفات الأطفال المطلوبة
            const allRelatedChildren = [
                ...(childrenOfParents || []),
                ...childrenOfStudents
            ];

            // إزالة التكرار
            const uniqueChildren = Array.from(new Map(allRelatedChildren.map(item => [item.id, item])).values());

            // 3. الخطوة الأهم: جلب أسماء أولياء الأمور للطلاب
            // نجمع IDs الآباء من ملفات الأطفال التي تخص الطلاب
            // نستبعد الآباء الموجودين بالفعل في قائمة المستخدمين الحالية لتجنب التكرار في الطلب
            const parentIdsToFetch = childrenOfStudents
                .map(c => c.user_id)
                .filter(id => id && !userIds.includes(id));
            
            const parentsMap = new Map<string, { name: string, email: string }>();

            // نضيف الآباء الموجودين في الصفحة الحالية للخريطة فوراً
            users.forEach(u => parentsMap.set(u.id, { name: u.name, email: u.email }));

            // نجلب بيانات الآباء الغائبين عن الصفحة
            if (parentIdsToFetch.length > 0) {
                // إزالة التكرار من معرفات الآباء
                const uniqueParentIds = [...new Set(parentIdsToFetch)];
                
                const { data: externalParents } = await supabase
                    .from('profiles')
                    .select('id, name, email')
                    .in('id', uniqueParentIds);
                
                if (externalParents) {
                    externalParents.forEach((p: any) => parentsMap.set(p.id, { name: p.name, email: p.email }));
                }
            }

            return { users, count, relatedChildren: uniqueChildren as ChildProfile[], parentsMap };
        },
        placeholderData: keepPreviousData,
        staleTime: 5000,
    });
};

export const useAdminAllChildProfiles = () => useQuery({
    queryKey: ['adminAllChildProfiles'],
    queryFn: () => userService.getAllChildProfiles(),
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
});

export const useAllPublishers = () => useQuery({
    queryKey: ['allPublishers'],
    queryFn: async () => {
        const { data } = await supabase.from('profiles').select('id, name').eq('role', 'publisher');
        return data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 min cache
});
