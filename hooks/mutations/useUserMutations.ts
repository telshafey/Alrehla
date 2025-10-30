import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../contexts/ToastContext';
import type { UserProfile } from '../../lib/database.types';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const useUserMutations = () => {
    const queryClient = useQueryClient();
    const { addToast } = useToast();

    const updateUser = useMutation({
        mutationFn: async (payload: Partial<UserProfile> & { id: string }) => {
            await sleep(500);
            console.log("Updating user (mock)", payload);
            return payload;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
            queryClient.invalidateQueries({ queryKey: ['userAccountData'] }); // To update name in UI
            addToast('تم تحديث المستخدم بنجاح.', 'success');
        },
        onError: (error: Error) => {
            addToast(`فشل تحديث المستخدم: ${error.message}`, 'error');
        }
    });
    
    const updateUserPassword = useMutation({
        mutationFn: async (payload: any) => {
            await sleep(500);
            console.log("Updating user password (mock)", payload.userId);
            addToast('تم تحديث كلمة المرور بنجاح (محاكاة).', 'success');
            return { success: true };
        },
        onError: (error: Error) => {
            addToast(`فشل تحديث كلمة المرور: ${error.message}`, 'error');
        }
    });

    const createUser = useMutation({
        mutationFn: async (payload: { name: string, email: string, password: string }) => {
            await sleep(500);
            console.log("Creating user (mock)", payload);
            return { ...payload, id: `usr_${Math.random()}` };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
            addToast('تم إنشاء المستخدم بنجاح.', 'success');
        },
        onError: (error: Error) => {
            addToast(`فشل إنشاء المستخدم: ${error.message}`, 'error');
        }
    });
    
    const deleteUser = useMutation({
        mutationFn: async ({ userId }: { userId: string }) => {
            await sleep(500);
            console.log("Deleting user (mock)", userId);
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
            addToast('تم حذف المستخدم بنجاح.', 'success');
        },
        onError: (error: Error) => {
            addToast(`فشل حذف المستخدم: ${error.message}`, 'error');
        }
    });

    const createAndLinkStudentAccount = useMutation({
        mutationFn: async (payload: { name: string, email: string, password: string, childProfileId: number }) => {
            await sleep(800);
            console.log("Creating and linking student account (mock)", payload);
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminAllChildProfiles'] });
             queryClient.invalidateQueries({ queryKey: ['userAccountData'] });
            addToast('تم إنشاء وربط حساب الطالب بنجاح.', 'success');
        },
        onError: (error: Error) => {
            addToast(`فشل إنشاء الحساب: ${error.message}`, 'error');
        }
    });

    const linkStudentToChildProfile = useMutation({
        mutationFn: async (payload: { studentUserId: string, childProfileId: number }) => {
            await sleep(500);
            console.log("Linking student (mock)", payload);
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
            queryClient.invalidateQueries({ queryKey: ['adminAllChildProfiles'] });
            addToast('تم ربط الحساب بنجاح.', 'success');
        },
        onError: (error: Error) => {
            addToast(`فشل ربط الحساب: ${error.message}`, 'error');
        }
    });
    
    const unlinkStudentFromChildProfile = useMutation({
        mutationFn: async (payload: { childProfileId: number }) => {
            await sleep(500);
            console.log("Unlinking student (mock)", payload);
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
            queryClient.invalidateQueries({ queryKey: ['adminAllChildProfiles'] });
            addToast('تم إلغاء ربط الحساب بنجاح.', 'success');
        },
        onError: (error: Error) => {
            addToast(`فشل إلغاء الربط: ${error.message}`, 'error');
        }
    });

     const deleteChildProfile = useMutation({
        mutationFn: async ({ childId }: { childId: number }) => {
            await sleep(500);
            console.log("Deleting child profile (mock)", childId);
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userAccountData'] });
            addToast('تم حذف ملف الطفل بنجاح.', 'success');
        },
        onError: (error: Error) => {
            addToast(`فشل حذف الملف: ${error.message}`, 'error');
        }
    });

    return { updateUser, updateUserPassword, createUser, deleteUser, createAndLinkStudentAccount, linkStudentToChildProfile, unlinkStudentFromChildProfile, deleteChildProfile };
};