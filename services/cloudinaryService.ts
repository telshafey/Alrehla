
// خدمة مخصصة للتعامل مع Cloudinary
// تم التحديث لاستخدام Signed Uploads لضمان الموثوقية وتجنب أخطاء الـ Preset

const CLOUD_NAME = (import.meta as any).env?.VITE_CLOUDINARY_CLOUD_NAME || 'alrehla';
const API_KEY = (import.meta as any).env?.VITE_CLOUDINARY_API_KEY || '386324268169756';
const API_SECRET = (import.meta as any).env?.VITE_CLOUDINARY_API_SECRET || 'HJ1bF9nEJZH2OKPlvqwqU1uVgNY';
const UPLOAD_PRESET = (import.meta as any).env?.VITE_CLOUDINARY_UPLOAD_PRESET || 'alrehla_uploads';

/**
 * توليد توقيع SHA-1 للطلب
 * Cloudinary يتطلب توقيع المعاملات (folder, timestamp, upload_preset) باستخدام الـ API Secret
 */
async function generateSignature(params: Record<string, string>, apiSecret: string) {
    // 1. ترتيب المفاتيح أبجدياً
    const sortedKeys = Object.keys(params).sort();
    
    // 2. إنشاء string للتوقيع (key=value&key=value...)
    const stringToSign = sortedKeys.map(key => `${key}=${params[key]}`).join('&') + apiSecret;
    
    // 3. التشفير باستخدام SHA-1
    const msgBuffer = new TextEncoder().encode(stringToSign);
    const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    
    // 4. التحويل إلى Hex String
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export const cloudinaryService = {
    /**
     * رفع ملف إلى Cloudinary (Signed Upload)
     */
    async uploadImage(file: File, folder: string = 'alrehla_general'): Promise<string> {
        const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
        const timestamp = Math.floor(Date.now() / 1000).toString();

        // المعاملات التي سيتم توقيعها (يجب أن تطابق ما نرسله بالضبط)
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

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Cloudinary Error Details:', errorData);
                throw new Error(errorData.error?.message || 'فشل الرفع إلى Cloudinary');
            }

            const data = await response.json();
            return data.secure_url;
        } catch (error: any) {
            console.error('Cloudinary Upload Error:', error);
            throw new Error(`خطأ في رفع الصورة: ${error.message}`);
        }
    }
};
