
import { supabase } from '../lib/supabaseClient';

export const storageService = {
    async uploadFile(file: File, bucket: string, folderPath: string): Promise<string> {
        try {
            // Sanitize file name: remove non-ASCII chars to prevent storage errors
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
            const filePath = `${folderPath}/${fileName}`;

            const { data, error } = await supabase.storage
                .from(bucket)
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) throw error;

            const { data: publicData } = supabase.storage
                .from(bucket)
                .getPublicUrl(data.path);

            return publicData.publicUrl;
        } catch (error: any) {
            console.error("Storage Upload Error:", error);
            throw new Error(`فشل رفع الملف: ${error.message}`);
        }
    }
};
