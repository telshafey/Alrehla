import React, { useState, useEffect } from 'react';
import { Image } from 'lucide-react';

interface ImageUploadProps {
    id: string;
    label: string;
    onFileChange: (id: string, file: File | null) => void;
    file: File | null;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ id, label, onFileChange, file }) => {
    const [preview, setPreview] = useState<string | null>(null);

    useEffect(() => {
        if (!file) {
            setPreview(null);
            return;
        }
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [file]);

    return (
        <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">{label}</label>
            <div className="mt-1 flex items-center gap-4">
                <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                    {preview ? <img src={preview} alt="Preview" className="h-full w-full object-cover rounded-lg" loading="lazy" /> : <Image className="text-gray-400" />}
                </div>
                <label htmlFor={id} className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50">
                    <span>{file ? 'تغيير الصورة' : 'رفع صورة'}</span>
                    <input id={id} name={id} type="file" className="sr-only" onChange={(e) => onFileChange(id, e.target.files ? e.target.files[0] : null)} accept="image/*" />
                </label>
            </div>
        </div>
    );
};

export default ImageUpload;