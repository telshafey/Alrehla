
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../contexts/ToastContext';
import type { SiteContent } from '../../lib/database.types';
import { mockSiteContent } from '../../data/mockData';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const useContentMutations = () => {
    const queryClient = useQueryClient();
    const { addToast } = useToast();

    const updateSiteContent = useMutation({
        mutationFn: async (newContent: SiteContent) => {
            await sleep(800);
            // Get existing or default to ensure we don't lose structure
            const stored = localStorage.getItem('alrehla_site_content');
            const current = stored ? JSON.parse(stored) : mockSiteContent;
            
            const updated = { ...current, ...newContent };
            localStorage.setItem('alrehla_site_content', JSON.stringify(updated));
            return updated;
        },
        onSuccess: () => {
            // Invalidate queries that depend on site content to refetch new data
            queryClient.invalidateQueries({ queryKey: ['adminSiteContent'] });
            queryClient.invalidateQueries({ queryKey: ['publicData'] });
            addToast('تم تحديث محتوى الموقع بنجاح.', 'success');
        },
        onError: (error: Error) => {
            addToast(`فشل تحديث المحتوى: ${error.message}`, 'error');
        }
    });
    
    const uploadFile = useMutation({
        mutationFn: async (file: File): Promise<{ url: string }> => {
            await sleep(1000);
            // In a real app, upload to server. Here we create a fake local URL for preview
            // Note: This URL is temporary and only works in the current session for the user who uploaded it.
            // For a real persistence in mock mode, we'd need to base64 encode it, which is heavy for localStorage.
            // We will simulate a success but warn the user.
            const objectUrl = URL.createObjectURL(file);
            
            // FOR DEMO PURPOSES: If it's an image, we return the object URL.
            // In production, this URL must come from the server.
            return { url: objectUrl };
        },
        onError: (error: Error) => {
             addToast(`فشل رفع الملف: ${error.message}`, 'error');
        }
    });

    const createBlogPost = useMutation({
        mutationFn: async (payload: any) => {
            await sleep(800);
            console.log("Creating blog post (mock)", payload);
            return { ...payload, id: Math.random() };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminBlogPosts'] });
            addToast('تم إنشاء المقال بنجاح.', 'success');
        },
        onError: (err: Error) => addToast(`فشل إنشاء المقال: ${err.message}`, 'error'),
    });
    
    const updateBlogPost = useMutation({
        mutationFn: async (payload: any) => {
            await sleep(800);
            console.log("Updating blog post (mock)", payload);
            return payload;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminBlogPosts'] });
            addToast('تم تحديث المقال بنجاح.', 'success');
        },
        onError: (err: Error) => addToast(`فشل تحديث المقال: ${err.message}`, 'error'),
    });

    const deleteBlogPost = useMutation({
        mutationFn: async ({ postId }: { postId: number }) => {
            await sleep(500);
            console.log("Deleting blog post (mock)", postId);
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminBlogPosts'] });
            addToast('تم حذف المقال بنجاح.', 'info');
        },
        onError: (err: Error) => addToast(`فشل حذف المقال: ${err.message}`, 'error'),
    });
    
    // --- BULK ACTIONS ---
    const bulkUpdateBlogPostsStatus = useMutation({
        mutationFn: async ({ postIds, status }: { postIds: number[], status: 'published' | 'draft' }) => {
            await sleep(500);
            console.log("Bulk updating post status (mock)", { postIds, status });
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminBlogPosts'] });
            addToast('تم تحديث حالة المقالات المحددة.', 'success');
        },
        onError: (error: Error) => addToast(`فشل تحديث الحالات: ${error.message}`, 'error'),
    });

    const bulkDeleteBlogPosts = useMutation({
        mutationFn: async ({ postIds }: { postIds: number[] }) => {
            await sleep(500);
            console.log("Bulk deleting posts (mock)", { postIds });
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminBlogPosts'] });
            addToast('تم حذف المقالات المحددة.', 'info');
        },
        onError: (error: Error) => addToast(`فشل حذف المقالات: ${error.message}`, 'error'),
    });

    return { 
        updateSiteContent, 
        uploadFile, 
        createBlogPost, 
        updateBlogPost, 
        deleteBlogPost,
        bulkUpdateBlogPostsStatus,
        bulkDeleteBlogPosts
    };
};
