
import React, { useState } from 'react';
import { cn } from '../../lib/utils';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    objectFit?: 'cover' | 'contain' | 'fill';
}

const Image = React.forwardRef<HTMLImageElement, ImageProps>(
  ({ src, alt, className, objectFit = 'cover', onLoad, ...props }, ref) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      setIsLoaded(true);
      if (onLoad) {
        onLoad(e);
      }
    };

    const handleError = () => {
        setHasError(true);
        setIsLoaded(true);
    };

    // Fallback image if source fails or is missing
    const displaySrc = hasError || !src ? 'https://placehold.co/600x400/f3f4f6/9ca3af?text=No+Image' : src;

    return (
      <div className={cn("relative bg-muted/20 overflow-hidden w-full h-full", className)}>
        {/* Skeleton Loader */}
        {!isLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse z-10" />
        )}
        
        {/* The Image */}
        <img
          ref={ref}
          src={displaySrc}
          alt={alt || 'Image'}
          loading="lazy"
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            "w-full h-full transition-opacity duration-500 block",
            objectFit === 'cover' ? 'object-cover' : objectFit === 'contain' ? 'object-contain' : 'object-fill',
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
