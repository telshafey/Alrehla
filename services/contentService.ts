
import { mockSiteContent, mockBlogPosts } from '../data/mockData';
import type { SiteContent, BlogPost } from '../lib/database.types';
import { mockFetch } from './mockAdapter';
import { apiClient } from '../lib/api';

const USE_MOCK = true;

export const contentService = {
    async updateSiteContent(newContent: SiteContent) {
        if (USE_MOCK) {
            await mockFetch(null, 800);
            localStorage.setItem('alrehla_site_content', JSON.stringify(newContent));
            return newContent;
        }
        return apiClient.put<SiteContent>('/admin/content', newContent);
    },

    async uploadFile(file: File): Promise<{ url: string }> {
        if (USE_MOCK) {
            await mockFetch(null, 1000);
            // In a real app, this URL comes from the server (S3/Cloudinary)
            return { url: URL.createObjectURL(file) };
        }
        const formData = new FormData();
        formData.append('file', file);
        return apiClient.post<{ url: string }>('/upload', formData);
    },

    // --- Blog Posts ---
    async createBlogPost(payload: any) {
        if (USE_MOCK) {
            console.log("Service: Creating blog post (mock)", payload);
            return mockFetch({ ...payload, id: Math.floor(Math.random() * 10000) }, 800);
        }
        return apiClient.post<BlogPost>('/admin/blog-posts', payload);
    },

    async updateBlogPost(payload: any) {
        if (USE_MOCK) {
            console.log("Service: Updating blog post (mock)", payload);
            return mockFetch(payload, 800);
        }
        return apiClient.put<BlogPost>(`/admin/blog-posts/${payload.id}`, payload);
    },

    async deleteBlogPost(postId: number) {
        if (USE_MOCK) {
            console.log("Service: Deleting blog post (mock)", postId);
            return mockFetch({ success: true }, 500);
        }
        return apiClient.delete<{ success: boolean }>(`/admin/blog-posts/${postId}`);
    },

    async bulkUpdateBlogPostsStatus(postIds: number[], status: 'published' | 'draft') {
        if (USE_MOCK) {
            console.log("Service: Bulk updating post status (mock)", { postIds, status });
            return mockFetch({ success: true }, 500);
        }
        return apiClient.post<{ success: boolean }>('/admin/blog-posts/bulk-status', { postIds, status });
    },

    async bulkDeleteBlogPosts(postIds: number[]) {
        if (USE_MOCK) {
            console.log("Service: Bulk deleting posts (mock)", { postIds });
            return mockFetch({ success: true }, 500);
        }
        return apiClient.post<{ success: boolean }>('/admin/blog-posts/bulk-delete', { postIds });
    }
};
