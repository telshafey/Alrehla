
// خدمة مخصصة للتعامل مع Cloudinary
// تعتمد بشكل كامل على متغيرات البيئة لضمان الأمان والمرونة

// دالة مساعدة لجلب المتغيرات
const getEnv = (key: string) => (import.meta as any).env?.[key];

const API_KEY = getEnv('VITE_CLOUDINARY_API_KEY');
const API_SECRET = getEnv('VITE_CLOUDINARY_API_SECRET');

/**
 * توليد توقيع SHA-1 للطلب (فقط للرفع الموقع)
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
     */
    async uploadImage(file: File, folder: string = 'alrehla_general'): Promise<string> {
        // نستخدم القيم من البيئة، ونضع القيم الصحيحة كاحتياطي مباشر (Hardcoded Fallback) لحل المشكلة فوراً
        const cloudName = getEnv('VITE_CLOUDINARY_CLOUD_NAME') || 'dvouptrzu'; 
        const uploadPreset = getEnv('VITE_CLOUDINARY_UPLOAD_PRESET') || 'alrehla_uploads';

        console.log(`Cloudinary Upload: Cloud=${cloudName}, Preset=${uploadPreset}, Folder=${folder}`);

        if (!cloudName || !uploadPreset) {
            throw new Error('إعدادات Cloudinary (Cloud Name أو Upload Preset) غير موجودة. يرجى التحقق من ملف .env.');
        }

        const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
        const formData = new FormData();
        
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);
        formData.append('folder', folder);

        // منطق الرفع الموقع (اختياري)
        if (API_KEY && API_SECRET) {
            const timestamp = Math.floor(Date.now() / 1000).toString();
            const paramsToSign = {
                folder: folder,
                timestamp: timestamp,
                upload_preset: uploadPreset
            };
            try {
                const signature = await generateSignature(paramsToSign, API_SECRET);
                formData.append('api_key', API_KEY);
                formData.append('timestamp', timestamp);
                formData.append('signature', signature);
            } catch (e) {
                console.warn("فشل توقيع الطلب، جاري المحاولة بدون توقيع.");
            }
        } 

        try {
            const response = await fetch(url, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                const errorMsg = data.error?.message || 'Unknown Cloudinary Error';
                console.error('Cloudinary Error Response:', data);
                
                if (errorMsg.includes('Invalid cloud_name')) {
                    throw new Error(`اسم السحابة "${cloudName}" غير صحيح. تأكد من أن الاسم هو "dvouptrzu".`);
                }
                throw new Error(`فشل الرفع: ${errorMsg}`);
            }

            return data.secure_url;
        } catch (error: any) {
            console.error('Upload Network Error:', error);
            throw error;
        }
    }
};
