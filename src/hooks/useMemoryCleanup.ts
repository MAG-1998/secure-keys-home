import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { imageCache } from '@/hooks/useImageCache';

export function useMemoryCleanup() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Cleanup on unmount or when memory pressure is detected
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Clean up query cache when tab becomes hidden
        queryClient.clear();
        
        // Clear old image cache entries
        imageCache.clear();
      }
    };

    const handleMemoryPressure = () => {
      // Clean up caches during memory pressure
      queryClient.clear();
      imageCache.clear();
      
      // Force garbage collection if available
      if ('gc' in window && typeof window.gc === 'function') {
        window.gc();
      }
    };

    // Listen for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Listen for memory pressure events (if supported)
    if ('memory' in navigator) {
      const checkMemory = () => {
        const memory = (navigator as any).memory;
        if (memory && memory.usedJSHeapSize > memory.jsHeapSizeLimit * 0.9) {
          handleMemoryPressure();
        }
      };
      
      const memoryInterval = setInterval(checkMemory, 30000); // Check every 30s
      
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        clearInterval(memoryInterval);
      };
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [queryClient]);
}