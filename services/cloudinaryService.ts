
// خدمة مخصصة للتعامل مع Cloudinary
// تعتمد على المتغيرات البيئية، وفي حال عدم وجودها تستخدم القيم التي زودتنا بها

// ملاحظة: لا نستخدم API Key أو Secret في الكود من جانب العميل (Frontend) لأسباب أمنية.
// نعتمد فقط على Cloud Name و Upload Preset (Unsigned).

const CLOUD_NAME = (import.meta as any).env?.VITE_CLOUDINARY_CLOUD_NAME || 'alrehla'; 
const UPLOAD_PRESET = (import.meta as any).env?.VITE_CLOUDINARY_UPLOAD_PRESET || 'alrehla_uploads';

export const cloudinaryService = {
    /**
     * رفع ملف إلى Cloudinary
     * @param file الملف المراد رفعه
     * @param folder المجلد (اختياري) لتنظيم الصور داخل Cloudinary
     */
    async uploadImage(file: File, folder: string = 'alrehla_general'): Promise<string> {
        const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', UPLOAD_PRESET);
        formData.append('folder', folder); // تنظيم الصور في مجلدات

        try {
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
            
            // نعيد الرابط الآمن (HTTPS)
            return data.secure_url;
        } catch (error: any) {
            console.error('Cloudinary Upload Error:', error);
            throw new Error(`خطأ في رفع الصورة: ${error.message}`);
        }
    }
};
