
import { DEFAULT_CONFIG } from '../lib/config';
import { supabase } from '../lib/supabaseClient';

// القيم الافتراضية من ملف التكوين
let CLOUD_NAME = DEFAULT_CONFIG.cloudinary.cloudName;
let UPLOAD_PRESET = DEFAULT_CONFIG.cloudinary.uploadPreset;

// دالة لتحديث الإعدادات من قاعدة البيانات (إذا وجد تعديل)
const refreshConfig = async () => {
    try {
        const { data } = await supabase.from('site_settings').select('value').eq('key', 'system_config').maybeSingle();
        if (data && (data as any).value?.cloudinary) {
            const dynamicConfig = (data as any).value.cloudinary;
            // نستخدم القيم من القاعدة فقط إذا كانت موجودة وغير فارغة
            if (dynamicConfig.cloudName && dynamicConfig.cloudName.trim() !== '') {
                CLOUD_NAME = dynamicConfig.cloudName;
            }
            if (dynamicConfig.uploadPreset && dynamicConfig.uploadPreset.trim() !== '') {
                UPLOAD_PRESET = dynamicConfig.uploadPreset;
            }
        }
    } catch (e) {
        // Fallback to defaults silently
        console.warn("Using default Cloudinary config due to fetch error.");
    }
};

// استدعاء أولي (اختياري)
refreshConfig();

export const cloudinaryService = {
    /**
     * رفع ملف (صورة) إلى Cloudinary
     */
    async uploadImage(file: File, folder: string = 'alrehla_general'): Promise<string> {
        // تأكد من تحديث الإعدادات قبل الرفع
        await refreshConfig();

        if (!file) throw new Error("لا يوجد ملف لرفعه.");
        
        if (file.size > 10 * 1024 * 1024) {
            throw new Error("حجم الملف كبير جداً. الحد الأقصى هو 10 ميجابايت.");
        }

        const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
        const formData = new FormData();
        
        formData.append('file', file);
        formData.append('upload_preset', UPLOAD_PRESET);
        formData.append('folder', folder);

        try {
            const response = await fetch(url, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                console.error('Cloudinary Error Details:', data);
                const errorMsg = data.error?.message || 'فشل رفع الصورة إلى Cloudinary';
                throw new Error(errorMsg);
            }

            return data.secure_url;
        } catch (error: any) {
            console.error('Cloudinary Upload Error:', error);
            throw error;
        }
    },

    /**
     * تحسين رابط الصورة تلقائياً
     */
    optimizeUrl(url: string, width?: number): string {
        if (!url) return '';
        
        // استثناء الروابط المحلية والبيانات المباشرة من المعالجة
        if (url.startsWith('blob:') || url.startsWith('data:') || url.includes('localhost') || url.includes('127.0.0.1')) {
            return url;
        }

        // إذا لم يكن رابط Cloudinary، أعده كما هو (للروابط الخارجية أو Placeholders)
        if (!url.includes('cloudinary.com')) return url;
        
        // إذا كان الرابط محسناً بالفعل، لا تلمسه
        if (url.includes('f_auto,q_auto')) return url;

        // التأكد من استخدام Cloud Name الصحيح في الرابط إذا تغير
        const parts = url.split('/upload/');
        if (parts.length !== 2) return url;

        const transformations = ['f_auto', 'q_auto'];
        if (width) transformations.push(`w_${width}`);

        return `${parts[0]}/upload/${transformations.join(',')}/${parts[1]}`;
    }
};
