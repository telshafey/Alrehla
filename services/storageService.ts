
import { supabase } from '../lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

export const storageService = {
    async uploadFile(file: File, bucket: string, folderPath: string): Promise<string> {
        try {
            // تنظيف اسم الملف واستبداله بمعرف فريد لتجنب مشاكل الأسماء العربية
            const fileExt = file.name.split('.').pop();
            const fileName = `${uuidv4()}.${fileExt}`;
            const filePath = `${folderPath}/${fileName}`;

            // الرفع إلى سلة التخزين المحددة (مثلاً 'receipts')
            const { data, error } = await supabase.storage
                .from(bucket)
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) {
                console.error("Supabase Storage Error:", error);
                throw error;
            }

            // الحصول على الرابط العام
            const { data: publicData } = supabase.storage
                .from(bucket)
                .getPublicUrl(data.path);

            return publicData.publicUrl;
        } catch (error: any) {
            console.error("File Upload Exception:", error);
            throw new Error(`فشل رفع الملف إلى الخادم: ${error.message}`);
        }
    }
};
