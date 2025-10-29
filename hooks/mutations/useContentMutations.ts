import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../contexts/ToastContext';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const useContentMutations = () => {
    const queryClient = useQueryClient();
    const { addToast } = useToast();

    const updateSiteContent = useMutation({
        mutationFn: async (content: any) => {
            await sleep(800);
            console.log('Updating site content (mock)', content);
            return content;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminSiteContent'] });
            queryClient.invalidateQueries({ queryKey: ['publicData'] });
            addToast('تم حفظ محتوى الموقع بنجاح.', 'success');
        },
        onError: (err: Error) => addToast(`فشل الحفظ: ${err.message}`, 'error'),
    });

    const createBlogPost = useMutation({
        mutationFn: async (payload: any) => {
             await sleep(500);
             console.log("Creating post (mock)", payload);
             return { ...payload, id: Math.random() };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminBlogPosts'] });
            addToast('تم إنشاء المقال بنجاح.', 'success');
        },
        onError: (err: Error) => addToast(`فشل: ${err.message}`, 'error'),
    });
    
    const updateBlogPost = useMutation({
        mutationFn: async (payload: any) => {
             await sleep(500);
             console.log("Updating post (mock)", payload);
             return payload;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminBlogPosts'] });
            addToast('تم تحديث المقال بنجاح.', 'success');
        },
        onError: (err: Error) => addToast(`فشل: ${err.message}`, 'error'),
    });

    const deleteBlogPost = useMutation({
        mutationFn: async ({ postId }: { postId: number }) => {
            await sleep(500);
            console.log("Deleting post (mock)", postId);
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminBlogPosts'] });
            addToast('تم حذف المقال بنجاح.', 'info');
        },
        onError: (err: Error) => addToast(`فشل: ${err.message}`, 'error'),
    });

    return { updateSiteContent, createBlogPost, updateBlogPost, deleteBlogPost };
};
