
/**
 * Compresses and resizes an image file to a Data URL string.
 * This ensures images are optimized for storage (localStorage limit) and display performance.
 */
export const compressImage = (file: File, maxWidth: number = 1024, quality: number = 0.7): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Calculate new dimensions while maintaining aspect ratio
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Failed to get canvas context'));
                    return;
                }

                // Draw image on canvas
                ctx.drawImage(img, 0, 0, width, height);

                // Export as compressed JPEG
                // forcing jpeg allows quality control, even if source was png
                const dataUrl = canvas.toDataURL('image/jpeg', quality); 
                resolve(dataUrl);
            };

            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
};
