import { useState, useEffect, useCallback, useRef } from 'react';
import type { Language } from "@/hooks/useTranslation";

export type MapStatus = 'loading' | 'ready' | 'error' | 'offline';

interface UseMapLoaderReturn {
  mapLoaded: boolean;
  status: MapStatus;
  error: string | null;
  loadMap: () => void;
  retryLoad: () => void;
}

export const useMapLoader = (language: Language): UseMapLoaderReturn => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [status, setStatus] = useState<MapStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const loadAttempts = useRef(0);
  const maxRetries = 3;
  const retryDelay = 2000;

  // Check if we're online
  const isOnline = navigator.onLine;

  const clearMap = useCallback(() => {
    setMapLoaded(false);
    setStatus('loading');
    setError(null);
  }, []);

  const loadYandexMapsScript = useCallback(async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Check if we're offline first
      if (!navigator.onLine) {
        setStatus('offline');
        reject(new Error('No internet connection'));
        return;
      }

      // Check if ymaps is already available
      if (window.ymaps && window.ymaps.Map) {
        console.log('[MapLoader] Yandex Maps API already loaded');
        resolve();
        return;
      }

      // Check if script is already loading or loaded
      const existingScript = document.querySelector('script[src*="api-maps.yandex.ru"]');
      if (existingScript) {
        console.log('[MapLoader] Script already exists, waiting for load...');
        
        const handleExistingLoad = () => {
          if (window.ymaps && window.ymaps.Map) {
            window.ymaps.ready(() => {
              console.log('[MapLoader] Existing script loaded successfully');
              resolve();
            });
          } else {
            reject(new Error('Yandex Maps API not available after script load'));
          }
        };

        if (window.ymaps && window.ymaps.Map) {
          handleExistingLoad();
        } else {
          existingScript.addEventListener('load', handleExistingLoad, { once: true });
          existingScript.addEventListener('error', () => {
            reject(new Error('Existing script failed to load'));
          }, { once: true });
        }
        return;
      }

      console.log('[MapLoader] Creating new Yandex Maps script...');
      const ymLang = language === 'ru' ? 'ru_RU' : (language === 'uz' ? 'uz_UZ' : 'en_US');
      const script = document.createElement('script');
      script.src = `https://api-maps.yandex.ru/2.1/?apikey=8baec550-0c9b-458c-b9bd-e9893af7beb7&lang=${ymLang}`;
      script.async = true;
      
      // Set timeout for script loading
      const timeout = setTimeout(() => {
        script.removeEventListener('load', handleLoad);
        script.removeEventListener('error', handleError);
        reject(new Error('Script loading timeout'));
      }, 15000);

      const handleLoad = () => {
        clearTimeout(timeout);
        console.log('[MapLoader] Script loaded successfully');
        
        if (window.ymaps && window.ymaps.Map) {
          window.ymaps.ready(() => {
            console.log('[MapLoader] Yandex Maps API ready');
            resolve();
          });
        } else {
          reject(new Error('Yandex Maps API not available after script load'));
        }
      };

      const handleError = (error: Event) => {
        clearTimeout(timeout);
        console.error('[MapLoader] Script loading failed:', error);
        reject(new Error('Failed to load Yandex Maps script'));
      };

      script.addEventListener('load', handleLoad, { once: true });
      script.addEventListener('error', handleError, { once: true });
      
      document.head.appendChild(script);
    });
  }, [language]);

  const loadMap = useCallback(async () => {
    if (loadAttempts.current >= maxRetries) {
      setStatus('error');
      setError('Maximum retry attempts reached');
      return;
    }

    try {
      loadAttempts.current += 1;
      setStatus('loading');
      setError(null);

      await loadYandexMapsScript();
      
      setMapLoaded(true);
      setStatus('ready');
      setError(null);
      loadAttempts.current = 0; // Reset on success
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('[MapLoader] Failed to load map:', errorMessage);
      
      if (!navigator.onLine) {
        setStatus('offline');
      } else {
        setStatus('error');
      }
      
      setError(errorMessage);
      setMapLoaded(false);

      // Auto-retry with exponential backoff if not at max attempts
      if (loadAttempts.current < maxRetries) {
        const delay = retryDelay * Math.pow(2, loadAttempts.current - 1);
        console.log(`[MapLoader] Retrying in ${delay}ms (attempt ${loadAttempts.current}/${maxRetries})`);
        
        setTimeout(() => {
          loadMap();
        }, delay);
      }
    }
  }, [loadYandexMapsScript]);

  const retryLoad = useCallback(() => {
    loadAttempts.current = 0; // Reset attempts for manual retry
    loadMap();
  }, [loadMap]);

  // Initial load
  useEffect(() => {
    loadMap();
  }, [language]); // Reload when language changes

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      if (status === 'offline') {
        console.log('[MapLoader] Connection restored, retrying...');
        retryLoad();
      }
    };

    const handleOffline = () => {
      console.log('[MapLoader] Connection lost');
      setStatus('offline');
      setError('No internet connection');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [status, retryLoad]);

  return {
    mapLoaded,
    status,
    error,
    loadMap,
    retryLoad
  };
};