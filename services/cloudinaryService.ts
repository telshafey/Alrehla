
// خدمة مخصصة للتعامل مع Cloudinary
// هذا الإصدار مخصص للبيئة الإنتاجية ولا يستخدم روابط وهمية

// القيم الافتراضية (يفضل دائماً استخدام متغيرات البيئة .env)
const CLOUD_NAME = (import.meta as any).env?.VITE_CLOUDINARY_CLOUD_NAME || 'alrehla';
const API_KEY = (import.meta as any).env?.VITE_CLOUDINARY_API_KEY || '386324268169756';
const API_SECRET = (import.meta as any).env?.VITE_CLOUDINARY_API_SECRET || 'HJ1bF9nEJZH2OKPlvqwqU1uVgNY';
const UPLOAD_PRESET = (import.meta as any).env?.VITE_CLOUDINARY_UPLOAD_PRESET || 'alrehla_uploads';

/**
 * توليد توقيع SHA-1 للطلب
 * في التطبيقات الحقيقية عالية الأمان، يجب أن يتم هذا التوقيع في الـ Backend
 * ولكن للتسهيل في هذا المشروع، نقوم به هنا.
 */
async function generateSignature(params: Record<string, string>, apiSecret: string) {
    const sortedKeys = Object.keys(params).sort();
    const stringToSign = sortedKeys.map(key => `${key}=${params[key]}`).join('&') + apiSecret;
    const msgBuffer = new TextEncoder().encode(stringToSign);
    const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export const cloudinaryService = {
    /**
     * رفع ملف إلى Cloudinary
     * يرمي خطأ صريحاً في حالة الفشل ليتم التعامل معه في الواجهة
     */
    async uploadImage(file: File, folder: string = 'alrehla_general'): Promise<string> {
        // التحقق من الإعدادات قبل البدء
        if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
            throw new Error('إعدادات Cloudinary ناقصة. يرجى التحقق من ملف .env');
        }

        const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
        const timestamp = Math.floor(Date.now() / 1000).toString();

        const paramsToSign = {
            folder: folder,
            timestamp: timestamp,
            upload_preset: UPLOAD_PRESET
        };

        try {
            const signature = await generateSignature(paramsToSign, API_SECRET);

            const formData = new FormData();
            formData.append('file', file);
            formData.append('api_key', API_KEY);
            formData.append('timestamp', timestamp);
            formData.append('signature', signature);
            formData.append('folder', folder);
            formData.append('upload_preset', UPLOAD_PRESET);

            const response = await fetch(url, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                // استخراج رسالة الخطأ من Cloudinary
                const cloudError = data.error?.message || 'Unknown Error';
                console.error('Cloudinary API Error:', cloudError);
                
                // رمي الخطأ ليظهر للمستخدم
                throw new Error(`فشل الرفع: ${cloudError}`);
            }

            return data.secure_url;
        } catch (error: any) {
            // التعامل مع أخطاء الشبكة أو التوقيع
            console.error('Upload Service Error:', error);
            if (error.message.includes('falsy')) {
                 throw new Error('خطأ في الاتصال بالخدمة.');
            }
            throw error; // إعادة رمي الخطأ ليتم التقاطه بواسطة addToast في المكون
        }
    }
};
