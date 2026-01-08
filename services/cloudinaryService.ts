
// بيانات Cloudinary الحقيقية الخاصة بحسابك
const CLOUD_NAME = 'dvouptrzu';
const UPLOAD_PRESET = 'alrehla_uploads';

export const cloudinaryService = {
    /**
     * رفع ملف (صورة أو مستند) إلى Cloudinary
     */
    async uploadImage(file: File, folder: string = 'alrehla_general'): Promise<string> {
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
                const errorMsg = data.error?.message || 'Cloudinary Upload Failed';
                throw new Error(errorMsg);
            }

            return data.secure_url;
        } catch (error: any) {
            console.error('Upload Error:', error);
            throw error;
        }
    }
};
