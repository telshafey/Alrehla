
// الوصول لمتغيرات البيئة من Vercel (Vite)
const env = (import.meta as any).env || {};

// استخدام المتغيرات من Vercel، مع قيم افتراضية كاحتياط
const CLOUD_NAME = env.VITE_CLOUDINARY_CLOUD_NAME || 'dvouptrzu';
const UPLOAD_PRESET = env.VITE_CLOUDINARY_UPLOAD_PRESET || 'alrehla_uploads';

export const cloudinaryService = {
    /**
     * رفع ملف (صورة أو مستند) إلى Cloudinary
     */
    async uploadImage(file: File, folder: string = 'alrehla_general'): Promise<string> {
        if (!file) throw new Error("لا يوجد ملف لرفعه.");
        
        if (!CLOUD_NAME || !UPLOAD_PRESET) {
            console.error("Cloudinary Configuration Missing", { CLOUD_NAME, UPLOAD_PRESET });
            throw new Error("إعدادات السحابة غير مكتملة. يرجى مراجعة متغيرات البيئة في Vercel.");
        }

        // التحقق من الحجم (مثلاً 10 ميجابايت كحد أقصى للرفع المباشر)
        if (file.size > 10 * 1024 * 1024) {
            throw new Error("حجم الملف كبير جداً. الحد الأقصى هو 10 ميجابايت.");
        }

        const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`;
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
                const errorMsg = data.error?.message || 'فشل رفع الملف إلى Cloudinary';
                
                if (errorMsg.includes('Invalid upload_preset')) {
                    throw new Error('إعدادات الرفع (Preset) غير صحيحة. يرجى التأكد من لوحة تحكم Cloudinary.');
                }
                
                throw new Error(errorMsg);
            }

            return data.secure_url;
        } catch (error: any) {
            console.error('Upload Error:', error);
            throw error;
        }
    },

    /**
     * تحسين رابط الصورة تلقائياً (Format Auto, Quality Auto)
     */
    optimizeUrl(url: string, width?: number): string {
        if (!url || !url.includes('cloudinary.com')) return url;

        // تجنب التكرار إذا كان الرابط محسناً بالفعل
        if (url.includes('f_auto,q_auto')) return url;

        const parts = url.split('/upload/');
        if (parts.length !== 2) return url;

        const transformations = ['f_auto', 'q_auto'];
        if (width) transformations.push(`w_${width}`);

        return `${parts[0]}/upload/${transformations.join(',')}/${parts[1]}`;
    }
};
