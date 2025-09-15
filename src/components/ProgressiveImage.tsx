import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ProgressiveImageProps {
  src: string | null;
  alt: string;
  className?: string;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export function ProgressiveImage({ 
  src, 
  alt, 
  className,
  placeholder = '/placeholder.svg',
  onLoad,
  onError 
}: ProgressiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleLoad = () => {
    setIsLoaded(true);
    setTimeout(() => setShowImage(true), 50); // Small delay for smooth transition
    onLoad?.();
  };

  const handleError = () => {
    setIsError(true);
    onError?.();
  };

  return (
    <div className={cn("relative overflow-hidden bg-muted", className)}>
      {/* Blur placeholder - always visible until image loads */}
      <div 
        className={cn(
          "absolute inset-0 bg-muted transition-opacity duration-500",
          showImage ? "opacity-0" : "opacity-100"
        )}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3e%3crect width='400' height='300' fill='%23f1f5f9'/%3e%3cpath d='M150 120h100v60h-100z' fill='%23cbd5e1'/%3e%3ccircle cx='175' cy='140' r='8' fill='%2394a3b8'/%3e%3cpath d='M200 160l20-20 30 30v20h-50z' fill='%2394a3b8'/%3e%3c/svg%3e")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(2px)'
        }}
      />

      {/* Actual image */}
      {src && !isError && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-500",
            showImage ? "opacity-100" : "opacity-0"
          )}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
        />
      )}

      {/* Error fallback */}
      {(isError || !src) && (
        <img 
          src={placeholder} 
          alt="" 
          className="w-full h-full object-cover opacity-60"
        />
      )}

      {/* Loading indicator */}
      {src && !isLoaded && !isError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}