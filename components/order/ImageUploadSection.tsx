import React from 'react';
import ImageUpload from '../shared/ImageUpload';

interface ImageUploadSectionProps {
    files: { [key: string]: File | null };
    onFileChange: (id: string, file: File | null) => void;
    errors: {
        child_photo_1?: string;
    };
}

const ImageUploadSection: React.FC<ImageUploadSectionProps> = ({ files, onFileChange, errors }) => {
    return (
        <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-6">صور التخصيص (للطفل)</h3>
             {errors.child_photo_1 && (
                <p className="text-red-600 text-sm mb-4 bg-red-50 p-3 rounded-lg">{errors.child_photo_1}</p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ImageUpload id="child_photo_1" label="صورة وجه الطفل (إلزامي)" onFileChange={onFileChange} file={files['child_photo_1']} />
                <ImageUpload id="child_photo_2" label="صورة ثانية للطفل (اختياري)" onFileChange={onFileChange} file={files['child_photo_2']} />
                <ImageUpload id="child_photo_3" label="صورة ثالثة للطفل (اختياري)" onFileChange={onFileChange} file={files['child_photo_3']} />
            </div>
        </div>
    );
};

export default ImageUploadSection;