
import React, { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { ImageIcon } from 'lucide-react';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    objectFit?: 'cover' | 'contain' | 'fill' | 'none';
}

const Image = React.forwardRef<HTMLImageElement, ImageProps>(
  ({ src, alt, className, objectFit = 'cover', onLoad, ...props }, ref) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    // إعادة ضبط الحالة عند تغيير المصدر
    useEffect(() => {
        setIsLoaded(false);
        setHasError(false);
    }, [src]);

    const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      setIsLoaded(true);
      if (onLoad) onLoad(e);
    };

    const handleError = () => {
        setHasError(true);
        setIsLoaded(true);
    };

    // صورة بديلة في حال عدم وجود مصدر أو حدوث خطأ
    const placeholder = 'https://i.ibb.co/C0bSJJT/favicon.png';
    const displaySrc = (hasError || !src) ? placeholder : src;

    return (
      <div className={cn("relative bg-muted/10 overflow-hidden flex items-center justify-center", className)}>
        {/* شاشة تحميل (Skeleton) */}
        {!isLoaded && !hasError && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse z-10" />
        )}
        
        {/* أيقونة خطأ في حال فشل التحميل كلياً */}
        {hasError && (
            <div className="flex flex-col items-center gap-2 text-muted-foreground/30">
                <ImageIcon size={32} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Error Loading</span>
            </div>
        )}

        <img
          ref={ref}
          src={displaySrc}
          alt={alt || 'صورة من منصة الرحلة'}
          loading="lazy"
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            "w-full h-full transition-all duration-700 ease-in-out block",
            objectFit === 'cover' ? 'object-cover' : objectFit === 'contain' ? 'object-contain' : 'object-fill',
            isLoaded && !hasError ? "opacity-100 scale-100 blur-0" : "opacity-0 scale-105 blur-lg"
          )}
          {...props}
        />
      </div>
    );
  }
);
Image.displayName = 'Image';

export default Image;
