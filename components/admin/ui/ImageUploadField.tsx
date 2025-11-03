import React, { useState, useEffect } from 'react';
import { Upload } from 'lucide-react';
import { Input } from '../../ui/Input';
import FormField from '../../ui/FormField';
import Image from '../../ui/Image';

interface ImageUploadFieldProps {
    label: string;
    fieldKey: string;
    currentUrl?: string;
    onUrlChange: (fieldKey: string, newUrl: string) => void;
}

const ImageUploadField: React.FC<ImageUploadFieldProps> = ({ label, fieldKey, currentUrl, onUrlChange }) => {
    const [preview, setPreview] = useState(currentUrl);

    useEffect(() => {
        setPreview(currentUrl);
    }, [currentUrl]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                onUrlChange(fieldKey, result);
                setPreview(result);
            };
            reader.readAsDataURL(file);
        } else {
            // If the file is cleared, revert to original URL or nothing
            onUrlChange(fieldKey, '');
            setPreview('');
        }
    };

    return (
        <FormField label={label} htmlFor={fieldKey}>
            <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/50">
                <Image 
                    src={preview || "https://placehold.co/100x100/EEE/31343C?text=No+Image"} 
                    alt={`${label} Preview`} 
                    className="w-24 h-24 object-contain rounded-md bg-background flex-shrink-0" 
                />
                <div className="flex-grow">
                    <label htmlFor={fieldKey} className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2">
                        <Upload size={16} />
                        <span>{preview ? 'تغيير الملف' : 'اختر ملفًا'}</span>
                    </label>
                    <Input id={fieldKey} type="file" accept="image/*" onChange={handleFileChange} className="sr-only" />
                </div>
            </div>
        </FormField>
    );
};

export default ImageUploadField;