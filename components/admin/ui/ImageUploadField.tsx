
import React, { useState, useEffect } from 'react';
import { Upload, Loader2, Info, X, AlertCircle } from 'lucide-react';
import { Input } from '../../ui/Input';
import FormField from '../../ui/FormField';
import Image from '../../ui/Image';
import { cloudinaryService } from '../../../services/cloudinaryService';
import { useToast } from '../../../contexts/ToastContext';

interface ImageUploadFieldProps {
    label: string;
    fieldKey: string;
    currentUrl?: string;
    onUrlChange: (fieldKey: string, newUrl: string) => void;
    recommendedSize?: string; 
}

const ImageUploadField: React.FC<ImageUploadFieldProps> = ({ label, fieldKey, currentUrl, onUrlChange, recommendedSize }) => {
    const [preview, setPreview] = useState(currentUrl);
    const [isProcessing, setIsProcessing] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const { addToast } = useToast();

    useEffect(() => {
        setPreview(currentUrl);
    }, [currentUrl]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        if (file) {
            setIsProcessing(true);
            setUploadError(null);
            try {
                // Upload directly to Cloudinary
                const uploadedUrl = await cloudinaryService.uploadImage(file, 'alrehla_admin_uploads');
                onUrlChange(fieldKey, uploadedUrl);
                setPreview(uploadedUrl);
                addToast('تم رفع الصورة بنجاح', 'success');
            } catch (error: any) {
                console.error("Image upload failed", error);
                setUploadError(error.message || "فشل رفع الصورة");
                addToast("فشل رفع الصورة. يرجى مراجعة الخطأ.", "error");
            } finally {
                setIsProcessing(false);
            }
        }
    };

    const handleRemoveImage = () => {
        onUrlChange(fieldKey, '');
        setPreview('');
        setUploadError(null);
    };

    return (
        <FormField 
            label={
                <span className="flex items-center gap-2">
                    {label}
                    {recommendedSize && (
                        <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full dir-ltr">
                            {recommendedSize}
                        </span>
                    )}
                </span>
            } 
            htmlFor={fieldKey}
        >
            <div className={`flex items-center gap-4 p-4 border rounded-lg ${uploadError ? 'bg-red-50 border-red-200' : 'bg-muted/50'}`}>
                <div className="w-24 h-24 rounded-md bg-background flex-shrink-0 overflow-hidden border relative group">
                    {isProcessing ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-20">
                            <Loader2 className="animate-spin text-primary" />
                        </div>
                    ) : (
                        <>
                            <Image 
                                src={preview || ""} 
                                alt={`${label} Preview`} 
                                className="w-full h-full" 
                            />
                            {!preview && (
                                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-xs text-center p-1">
                                    {recommendedSize || "لا توجد صورة"}
                                </div>
                            )}
                        </>
                    )}
                </div>
                <div className="flex-grow space-y-3">
                    <div className="flex gap-2">
                        <label htmlFor={fieldKey} className={`cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2 ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}>
                            <Upload size={16} />
                            <span>{preview ? 'تغيير الصورة' : 'اختر صورة'}</span>
                        </label>
                        {preview && (
                            <button 
                                type="button" 
                                onClick={handleRemoveImage}
                                className="bg-white py-2 px-3 border border-red-200 text-red-600 rounded-md shadow-sm text-sm hover:bg-red-50"
                                title="إزالة الصورة"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                    <Input id={fieldKey} type="file" accept="image/*" onChange={handleFileChange} className="sr-only" disabled={isProcessing} />
                    
                    {uploadError ? (
                        <p className="text-xs text-red-600 flex items-center gap-1 font-semibold">
                            <AlertCircle size={12} /> {uploadError}
                        </p>
                    ) : (
                        <p className="text-[10px] text-muted-foreground">
                            {recommendedSize ? `الأبعاد الموصى بها: ${recommendedSize}.` : ''} سيتم الرفع إلى سحابة {`dvouptrzu`} مباشرة.
                        </p>
                    )}
                </div>
            </div>
        </FormField>
    );
};

export default ImageUploadField;
