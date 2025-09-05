import { useEffect } from 'react';
import { useFinancingStore } from '@/stores/financingStore';

/**
 * Global halal mode hook that manages CSS variables and persistence
 * This ensures consistent design across all pages and prevents conflicts
 */
export const useGlobalHalalMode = () => {
  const { isHalalMode, updateState } = useFinancingStore();

  // Initialize from localStorage on first load
  useEffect(() => {
    try {
      const saved = localStorage.getItem('isHalalMode');
      if (saved !== null) {
        const savedValue = saved === 'true';
        if (savedValue !== isHalalMode) {
          updateState({ isHalalMode: savedValue });
        }
      }
    } catch (error) {
      console.warn('Failed to load halal mode from localStorage:', error);
    }
  }, []);

  // Apply global design changes and persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('isHalalMode', String(isHalalMode));
    } catch (error) {
      console.warn('Failed to save halal mode to localStorage:', error);
    }

    // Update document attribute for favicon and other global styles
    document.documentElement.setAttribute('data-halal-mode', String(isHalalMode));

    // Apply consistent CSS variables
    if (isHalalMode) {
      // Halal mode: Orange/warm colors
      document.documentElement.style.setProperty('--primary', '25 85% 53%');
      document.documentElement.style.setProperty('--accent', '38 84% 60%');
    } else {
      // Normal mode: Cyan/cool colors  
      document.documentElement.style.setProperty('--primary', '176 64% 45%');
      document.documentElement.style.setProperty('--accent', '176 44% 65%');
    }
  }, [isHalalMode]);

  const toggleHalalMode = () => {
    updateState({ isHalalMode: !isHalalMode });
  };

  return {
    isHalalMode,
    toggleHalalMode,
    setHalalMode: (value: boolean) => updateState({ isHalalMode: value })
  };
};