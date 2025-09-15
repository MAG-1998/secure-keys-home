import { useEffect } from 'react';
import { imageCache } from '@/hooks/useImageCache';
import { getImageUrl } from '@/lib/utils';

interface Property {
  id: string;
  image_url?: string;
  property_photos?: Array<{ url: string }>;
}

interface PropertyCardPreloaderProps {
  properties: Property[];
  preloadDistance?: number;
}

export function PropertyCardPreloader({ 
  properties, 
  preloadDistance = 5 
}: PropertyCardPreloaderProps) {
  useEffect(() => {
    // Preload images for the first few properties
    const preloadImages = async () => {
      const imagesToPreload = properties
        .slice(0, preloadDistance)
        .map(property => {
          const imageUrl = property.image_url || property.property_photos?.[0]?.url;
          return imageUrl ? getImageUrl(imageUrl) : null;
        })
        .filter(Boolean) as string[];

      // Preload images in background
      imagesToPreload.forEach(async (url) => {
        try {
          await imageCache.set(url);
        } catch (error) {
          console.warn('Failed to preload image:', url, error);
        }
      });
    };

    if (properties.length > 0) {
      // Small delay to not block initial render
      setTimeout(preloadImages, 100);
    }
  }, [properties, preloadDistance]);

  return null; // This component doesn't render anything
}