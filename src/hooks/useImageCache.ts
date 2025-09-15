import { useState, useEffect, useCallback } from 'react';

interface CacheEntry {
  url: string;
  timestamp: number;
  objectUrl?: string;
}

class ImageCacheManager {
  private cache = new Map<string, CacheEntry>();
  private readonly maxSize = 100; // Maximum cached images
  private readonly maxAge = 30 * 60 * 1000; // 30 minutes

  get(url: string): string | null {
    const entry = this.cache.get(url);
    if (!entry) return null;

    // Check if expired
    if (Date.now() - entry.timestamp > this.maxAge) {
      this.delete(url);
      return null;
    }

    return entry.objectUrl || url;
  }

  async set(url: string): Promise<string> {
    // Clean up if cache is full
    if (this.cache.size >= this.maxSize) {
      this.cleanup();
    }

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch image');

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      this.cache.set(url, {
        url,
        timestamp: Date.now(),
        objectUrl
      });

      return objectUrl;
    } catch (error) {
      console.warn('Failed to cache image:', error);
      return url;
    }
  }

  delete(url: string): void {
    const entry = this.cache.get(url);
    if (entry?.objectUrl) {
      URL.revokeObjectURL(entry.objectUrl);
    }
    this.cache.delete(url);
  }

  private cleanup(): void {
    // Remove oldest entries
    const entries = Array.from(this.cache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    const toRemove = entries.slice(0, Math.floor(this.maxSize * 0.3));
    toRemove.forEach(([url]) => this.delete(url));
  }

  clear(): void {
    this.cache.forEach((entry) => {
      if (entry.objectUrl) {
        URL.revokeObjectURL(entry.objectUrl);
      }
    });
    this.cache.clear();
  }
}

const imageCache = new ImageCacheManager();

export function useImageCache(src: string | null) {
  const [imageUrl, setImageUrl] = useState<string>(() => {
    if (!src) return '/placeholder.svg';
    return imageCache.get(src) || src;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadImage = useCallback(async (url: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Check cache first
      const cachedUrl = imageCache.get(url);
      if (cachedUrl) {
        setImageUrl(cachedUrl);
        setIsLoading(false);
        return;
      }

      // Load and cache
      const cachedImageUrl = await imageCache.set(url);
      setImageUrl(cachedImageUrl);
    } catch (err) {
      setError('Failed to load image');
      setImageUrl('/placeholder.svg');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (src) {
      loadImage(src);
    } else {
      setImageUrl('/placeholder.svg');
      setIsLoading(false);
      setError(null);
    }
  }, [src, loadImage]);

  return { imageUrl, isLoading, error };
}

export { imageCache };