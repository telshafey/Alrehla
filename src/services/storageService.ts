
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

            // الحصول على الرابط الموقع لمدى طويل (10 سنوات)
            const { data: signedData, error: signError } = await supabase.storage
                .from(bucket)
                .createSignedUrl(data.path, 315360000);

            if (signError) {
                console.error("Supabase Storage Sign Error:", signError);
                throw signError;
            }

            return signedData.signedUrl;
        } catch (error: any) {
            console.error("File Upload Exception:", error);
            throw new Error(`فشل رفع الملف إلى الخادم: ${error.message}`);
        }
    }
};
