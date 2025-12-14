
import { supabase } from '../lib/supabaseClient';
import { cloudinaryService } from './cloudinaryService';
import type { SiteContent, BlogPost } from '../lib/database.types';
import { mockSiteContent } from '../data/mockData';

export const contentService = {
    // --- Site Content (Stored as JSON in site_settings) ---
    async getSiteContent() {
        const { data, error } = await supabase
            .from('site_settings')
            .select('value')
            .eq('key', 'global_content')
            .single();
        
        if (error || !data) {
            console.warn("Could not fetch site content from DB, falling back to mock:", error?.message);
            return mockSiteContent;
        }
        return data.value as SiteContent;
    },

    async updateSiteContent(newContent: SiteContent) {
        const { data, error } = await supabase
            .from('site_settings')
            .upsert({ 
                key: 'global_content', 
                value: newContent,
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data.value as SiteContent;
    },

    async uploadFile(file: File): Promise<{ url: string }> {
        // Upload to Cloudinary under 'alrehla_content' folder
        const url = await cloudinaryService.uploadImage(file, 'alrehla_content');
        return { url };
    },

    // --- Blog Posts (Stored in blog_posts table) ---
    async getAllBlogPosts() {
        const { data, error } = await supabase
            .from('blog_posts')
            .select('*')
            .is('deleted_at', null)
            .order('created_at', { ascending: false });
            
        if (error) throw new Error(error.message);
        return data as BlogPost[];
    },

    async createBlogPost(payload: any) {
        // Handle image upload if provided as File
        let imageUrl = payload.image_url;
        if (payload.imageFile) {
            const { url } = await this.uploadFile(payload.imageFile);
            imageUrl = url;
        }

        const { imageFile, ...dbPayload } = payload;
        const insertData = { 
            ...dbPayload, 
            image_url: imageUrl,
            created_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('blog_posts')
            .insert([insertData])
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data as BlogPost;
    },

    async updateBlogPost(payload: any) {
        let imageUrl = payload.image_url;
        if (payload.imageFile) {
            const { url } = await this.uploadFile(payload.imageFile);
            imageUrl = url;
        }

        const { id, imageFile, ...updates } = payload;
        const updateData = { ...updates, image_url: imageUrl };

        const { data, error } = await supabase
            .from('blog_posts')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data as BlogPost;
    },

    async deleteBlogPost(postId: number) {
        // Soft delete
        const { error } = await supabase
            .from('blog_posts')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', postId);

        if (error) throw new Error(error.message);
        return { success: true };
    },

    async bulkUpdateBlogPostsStatus(postIds: number[], status: 'published' | 'draft') {
        const { error } = await supabase
            .from('blog_posts')
            .update({ status })
            .in('id', postIds);

        if (error) throw new Error(error.message);
        return { success: true };
    },

    async bulkDeleteBlogPosts(postIds: number[]) {
        const { error } = await supabase
            .from('blog_posts')
            .update({ deleted_at: new Date().toISOString() })
            .in('id', postIds);

        if (error) throw new Error(error.message);
        return { success: true };
    }
};
