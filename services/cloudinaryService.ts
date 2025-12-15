
// بيانات Cloudinary الحقيقية
const CLOUD_NAME = 'dvouptrzu';
const UPLOAD_PRESET = 'alrehla_uploads';
const API_KEY = '386324268169756';

// دالة مساعدة لجلب المتغيرات (للتوافق المستقبلي إذا تم استخدام .env)
const getEnv = (key: string) => (import.meta as any).env?.[key];

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
        console.log(`Cloudinary Upload: Cloud=${CLOUD_NAME}, Preset=${UPLOAD_PRESET}, Folder=${folder}`);

        const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
        const formData = new FormData();
        
        formData.append('file', file);
        formData.append('upload_preset', UPLOAD_PRESET);
        formData.append('folder', folder);
        
        // يمكن إضافة API Key إذا لزم الأمر للعمليات المتقدمة، لكن الرفع غير الموقع (Unsigned) يعتمد أساساً على Preset
        // formData.append('api_key', API_KEY);

        try {
            const response = await fetch(url, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                const errorMsg = data.error?.message || 'Unknown Cloudinary Error';
                console.error('Cloudinary Error Response:', data);
                throw new Error(`فشل الرفع: ${errorMsg}`);
            }

            return data.secure_url;
        } catch (error: any) {
            console.error('Upload Network Error:', error);
            throw error;
        }
    }
};
