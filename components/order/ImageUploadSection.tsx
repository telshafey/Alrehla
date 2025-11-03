import React from 'react';
import ImageUpload from '../shared/ImageUpload';
import type { ImageSlotConfig } from '../../lib/database.types';

interface ImageUploadSectionProps {
    files: { [key: string]: File | null };
    onFileChange: (id: string, file: File | null) => void;
    errors: { [key: string]: string };
    imageSlots: ImageSlotConfig[] | null;
}

const ImageUploadSection: React.FC<ImageUploadSectionProps> = React.memo(({ files, onFileChange, errors, imageSlots }) => {
    if (!imageSlots || imageSlots.length === 0) {
        return null;
    }

    return (
        <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-6">صور التخصيص (للطفل)</h3>
            {Object.keys(errors).length > 0 && (
                 <div className="text-red-600 text-sm mb-4 bg-red-50 p-3 rounded-lg">
                    {Object.values(errors).map((error, i) => <p key={i}>{error}</p>)}
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {imageSlots.map(slot => (
                    <ImageUpload 
                        key={slot.id}
                        id={slot.id} 
                        label={slot.label} 
                        onFileChange={onFileChange} 
                        file={files[slot.id]} 
                    />
                ))}
            </div>
        </div>
    );
});
ImageUploadSection.displayName = "ImageUploadSection";

export default ImageUploadSection;