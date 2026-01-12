
import React, { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { ImageIcon, AlertCircle } from 'lucide-react';
import { cloudinaryService } from '../../services/cloudinaryService';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    objectFit?: 'cover' | 'contain' | 'fill' | 'none';
    fallbackText?: string;
}

const Image = React.forwardRef<HTMLImageElement, ImageProps>(
  ({ src, alt, className, objectFit = 'cover', fallbackText, onLoad, ...props }, ref) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [displaySrc, setDisplaySrc] = useState<string>('');

    // صورة بديلة موثوقة (يمكن استبدالها بصورة محلية في مجلد public)
    const DEFAULT_PLACEHOLDER = 'https://placehold.co/600x400?text=No+Image';

    useEffect(() => {
        // إعادة ضبط الحالة عند تغيير المصدر
        setIsLoaded(false);
        setHasError(false);

        if (!src) {
            setHasError(true);
            setDisplaySrc(DEFAULT_PLACEHOLDER);
            return;
        }

        try {
            const optimized = cloudinaryService.optimizeUrl(src);
            setDisplaySrc(optimized);
        } catch (e) {
            // في حال فشل دالة التحسين، نستخدم الرابط الأصلي
            setDisplaySrc(src);
        }
    }, [src]);

    const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      setIsLoaded(true);
      setHasError(false);
      if (onLoad) onLoad(e);
    };

    const handleError = () => {
        // منع الدخول في حلقة لا نهائية إذا فشلت الصورة البديلة أيضاً
        if (!hasError) {
            setHasError(true);
            setIsLoaded(true); // نعتبرها محملة لإزالة الهيكل العظمي
            setDisplaySrc(DEFAULT_PLACEHOLDER);
        }
    };

    return (
      <div className={cn("relative bg-gray-100 overflow-hidden flex items-center justify-center isolate", className)}>
        {/* Skeleton Loader */}
        {!isLoaded && !hasError && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse z-10" />
        )}
        
        {/* Error State with Icon (Only shows if placeholder also fails or before placeholder loads) */}
        {hasError && !displaySrc && (
            <div className="flex flex-col items-center gap-2 text-muted-foreground/40 p-4 text-center z-0">
                <ImageIcon size={32} />
                {fallbackText && <span className="text-[10px] font-bold uppercase tracking-widest">{fallbackText}</span>}
            </div>
        )}

        <img
          ref={ref}
          src={displaySrc}
          alt={alt || 'صورة'}
          loading="lazy"
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            "w-full h-full transition-opacity duration-500 ease-in-out",
            objectFit === 'cover' ? 'object-cover' : objectFit === 'contain' ? 'object-contain' : 'object-fill',
            // إذا كان هناك خطأ، نعرض الصورة (التي أصبحت الآن الصورة البديلة)
            isLoaded ? "opacity-100" : "opacity-0"
          )}
          {...props}
        />
      </div>
    );
  }
);
Image.displayName = 'Image';

export default Image;
