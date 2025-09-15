import { useState, useRef, useEffect } from 'react';
import { useImageCache } from '@/hooks/useImageCache';
import { cn } from '@/lib/utils';

interface CachedImageProps {
  src: string | null;
  alt: string;
  className?: string;
  lazy?: boolean;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export function CachedImage({ 
  src, 
  alt, 
  className, 
  lazy = true, 
  placeholder = '/placeholder.svg',
  onLoad,
  onError 
}: CachedImageProps) {
  const [isIntersecting, setIsIntersecting] = useState(!lazy);
  const [showImage, setShowImage] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const { imageUrl, isLoading, error } = useImageCache(isIntersecting ? src : null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || !imgRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' } // Start loading 100px before visible
    );

    observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, [lazy]);

  const handleImageLoad = () => {
    setShowImage(true);
    onLoad?.();
  };

  const handleImageError = () => {
    onError?.();
  };

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Placeholder/Loading state */}
      <div 
        className={cn(
          "absolute inset-0 bg-muted flex items-center justify-center transition-opacity duration-300",
          showImage ? "opacity-0" : "opacity-100"
        )}
      >
        {isLoading ? (
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        ) : (
          <img 
            src={placeholder} 
            alt="" 
            className="w-full h-full object-cover opacity-50"
          />
        )}
      </div>

      {/* Actual image */}
      <img
        ref={imgRef}
        src={error ? placeholder : imageUrl}
        alt={alt}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-300",
          showImage ? "opacity-100" : "opacity-0"
        )}
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading={lazy ? "lazy" : "eager"}
      />
    </div>
  );
}