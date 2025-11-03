import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../contexts/ToastContext';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const useUserMutations = () => {
    const queryClient = useQueryClient();
    const { addToast } = useToast();

    // Admin mutation to update any user
    const updateUser = useMutation({
        mutationFn: async (payload: { id: string, name?: string, role?: string, address?: string, governorate?: string, phone?: string }) => {
            await sleep(500);
            console.log("Updating user (mock)", payload);
            return { ...payload };
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
            queryClient.invalidateQueries({ queryKey: ['userAccountData', data.id] }); // Invalidate specific user data if needed
            addToast('تم تحديث بيانات المستخدم بنجاح.', 'success');
        },
        onError: (error: Error) => addToast(`فشل تحديث المستخدم: ${error.message}`, 'error')
    });

    const updateUserPassword = useMutation({
         mutationFn: async (payload: { userId: string, currentPassword?: string, newPassword?: string }) => {
            await sleep(500);
            console.log("Updating password for user (mock)", payload.userId);
            // In a real app, this would require currentPassword for non-admins
            return { success: true };
        },
        onSuccess: () => {
            addToast('تم تحديث كلمة المرور بنجاح.', 'success');
        },
        onError: (error: Error) => addToast(`فشل تحديث كلمة المرور: ${error.message}`, 'error')
    });
    
    // Child Profile Mutations (for parents)
    const createChildProfile = useMutation({
        mutationFn: async (payload: any) => {
            await sleep(500);
            console.log("Creating child profile (mock)", payload);
            return { ...payload, id: Math.random() };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userAccountData'] });
             queryClient.invalidateQueries({ queryKey: ['adminAllChildProfiles'] });
            addToast('تمت إضافة الطفل بنجاح.', 'success');
        },
        onError: (error: Error) => addToast(`فشل إضافة الطفل: ${error.message}`, 'error')
    });

    const updateChildProfile = useMutation({
        mutationFn: async (payload: any) => {
            await sleep(500);
            console.log("Updating child profile (mock)", payload);
            return payload;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userAccountData'] });
            queryClient.invalidateQueries({ queryKey: ['adminAllChildProfiles'] });
            addToast('تم تحديث ملف الطفل بنجاح.', 'success');
        },
        onError: (error: Error) => addToast(`فشل تحديث الملف: ${error.message}`, 'error')
    });

    const deleteChildProfile = useMutation({
        mutationFn: async ({ childId }: { childId: number }) => {
            await sleep(500);
            console.log("Deleting child profile (mock)", childId);
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userAccountData'] });
            queryClient.invalidateQueries({ queryKey: ['adminAllChildProfiles'] });
            addToast('تم حذف ملف الطفل بنجاح.', 'info');
        },
        onError: (error: Error) => addToast(`فشل حذف الملف: ${error.message}`, 'error')
    });

    // Student account linking (admin & parent)
    const createAndLinkStudentAccount = useMutation({
        mutationFn: async (payload: { name: string, email: string, password: string, childProfileId: number }) => {
            await sleep(800);
            console.log("Creating and linking student account (mock)", payload);
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
            queryClient.invalidateQueries({ queryKey: ['adminAllChildProfiles'] });
            queryClient.invalidateQueries({ queryKey: ['userAccountData'] });
            addToast('تم إنشاء وربط حساب الطالب بنجاح.', 'success');
        },
        onError: (error: Error) => addToast(`فشل إنشاء الحساب: ${error.message}`, 'error')
    });
    
    const linkStudentToChildProfile = useMutation({
        mutationFn: async ({ studentUserId, childProfileId }: { studentUserId: string, childProfileId: number }) => {
            await sleep(500);
            console.log("Linking student to child (mock)", { studentUserId, childProfileId });
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
            queryClient.invalidateQueries({ queryKey: ['adminAllChildProfiles'] });
            addToast('تم ربط الحساب بنجاح.', 'success');
        },
        onError: (error: Error) => addToast(`فشل الربط: ${error.message}`, 'error'),
    });
    
    const unlinkStudentFromChildProfile = useMutation({
        mutationFn: async ({ childProfileId }: { childProfileId: number }) => {
            await sleep(500);
            console.log("Unlinking student from child (mock)", { childProfileId });
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
            queryClient.invalidateQueries({ queryKey: ['adminAllChildProfiles'] });
            addToast('تم إلغاء ربط الحساب بنجاح.', 'info');
        },
        onError: (error: Error) => addToast(`فشل إلغاء الربط: ${error.message}`, 'error'),
    });

    // --- BULK ACTIONS ---
    const bulkDeleteUsers = useMutation({
        mutationFn: async ({ userIds }: { userIds: string[] }) => {
            await sleep(500);
            console.log("Bulk deleting users (mock)", { userIds });
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
            queryClient.invalidateQueries({ queryKey: ['adminAllChildProfiles'] }); // In case a linked student was deleted
            addToast('تم حذف المستخدمين المحددين.', 'info');
        },
        onError: (error: Error) => addToast(`فشل حذف المستخدمين: ${error.message}`, 'error'),
    });

    return { 
        updateUser, 
        updateUserPassword, 
        createChildProfile, 
        updateChildProfile, 
        deleteChildProfile, 
        createAndLinkStudentAccount, 
        linkStudentToChildProfile, 
        unlinkStudentFromChildProfile,
        bulkDeleteUsers 
    };
};