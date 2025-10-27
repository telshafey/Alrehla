import React from 'react';
import Accordion from '../ui/Accordion';
import ImageUpload from './ImageUpload';

interface ImageUploadSectionProps {
    files: { [key: string]: File | null };
    onFileChange: (id: string, file: File | null) => void;
}

const ImageUploadSection: React.FC<ImageUploadSectionProps> = ({ files, onFileChange }) => {
    return (
        <Accordion title="صور التخصيص (للطفل)">
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <ImageUpload id="child_photo_1" label="صورة وجه الطفل (إلزامي)" onFileChange={onFileChange} file={files['child_photo_1']} />
                <ImageUpload id="child_photo_2" label="صورة ثانية للطفل (اختياري)" onFileChange={onFileChange} file={files['child_photo_2']} />
                <ImageUpload id="child_photo_3" label="صورة ثالثة للطفل (اختياري)" onFileChange={onFileChange} file={files['child_photo_3']} />
            </div>
        </Accordion>
    );
};

export default ImageUploadSection;