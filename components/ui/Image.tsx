import React, { useState } from 'react';
import { cn } from '../../lib/utils';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

const Image = React.forwardRef<HTMLImageElement, ImageProps>(
  ({ src, alt, className, onLoad, ...props }, ref) => {
    const [isLoaded, setIsLoaded] = useState(false);

    const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      setIsLoaded(true);
      if (onLoad) {
        onLoad(e);
      }
    };

    // Use a wrapper to handle aspect ratio and background placeholder
    return (
      <div className={cn("relative bg-muted/50 overflow-hidden", className)}>
        {/* Placeholder */}
        {!isLoaded && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}
        {/* The actual image */}
        <img
          ref={ref}
          src={src}
          alt={alt}
          loading="lazy" // Default to lazy loading
          onLoad={handleLoad}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-500",
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
