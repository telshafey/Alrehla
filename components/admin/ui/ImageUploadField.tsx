
import React, { useState, useEffect } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { Input } from '../../ui/Input';
import FormField from '../../ui/FormField';
import Image from '../../ui/Image';
import { compressImage } from '../../../utils/imageCompression';
import { useToast } from '../../../contexts/ToastContext';

interface ImageUploadFieldProps {
    label: string;
    fieldKey: string;
    currentUrl?: string;
    onUrlChange: (fieldKey: string, newUrl: string) => void;
}

const ImageUploadField: React.FC<ImageUploadFieldProps> = ({ label, fieldKey, currentUrl, onUrlChange }) => {
    const [preview, setPreview] = useState(currentUrl);
    const [isProcessing, setIsProcessing] = useState(false);
    const { addToast } = useToast();

    useEffect(() => {
        setPreview(currentUrl);
    }, [currentUrl]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        if (file) {
            setIsProcessing(true);
            try {
                // Compress image before setting it
                const compressedDataUrl = await compressImage(file);
                onUrlChange(fieldKey, compressedDataUrl);
                setPreview(compressedDataUrl);
            } catch (error) {
                console.error("Image processing failed", error);
                addToast("فشل معالجة الصورة. يرجى المحاولة مرة أخرى.", "error");
            } finally {
                setIsProcessing(false);
            }
        } else {
            // If the file is cleared, revert to original URL or nothing
            onUrlChange(fieldKey, '');
            setPreview('');
        }
    };

    return (
        <FormField label={label} htmlFor={fieldKey}>
            <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/50">
                <div className="w-24 h-24 rounded-md bg-background flex-shrink-0 overflow-hidden border relative">
                    {isProcessing ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-20">
                            <Loader2 className="animate-spin text-primary" />
                        </div>
                    ) : (
                        <Image 
                            src={preview || ""} 
                            alt={`${label} Preview`} 
                            className="w-full h-full" 
                        />
                    )}
                </div>
                <div className="flex-grow">
                    <label htmlFor={fieldKey} className={`cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2 ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}>
                        <Upload size={16} />
                        <span>{preview ? 'تغيير الصورة' : 'اختر صورة'}</span>
                    </label>
                    <Input id={fieldKey} type="file" accept="image/*" onChange={handleFileChange} className="sr-only" disabled={isProcessing} />
                    <p className="text-[10px] text-muted-foreground mt-2">سيتم ضغط الصورة تلقائياً لضمان سرعة الموقع.</p>
                </div>
            </div>
        </FormField>
    );
};

export default ImageUploadField;
