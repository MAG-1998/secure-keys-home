import { useEffect } from 'react';
import { useTranslation } from './useTranslation';

export const usePageTitle = (titleKey: string, dynamicText?: string) => {
  const { t } = useTranslation();
  
  useEffect(() => {
    const baseTitle = t(titleKey);
    const fullTitle = dynamicText 
      ? `${dynamicText} • ${baseTitle}` 
      : `${baseTitle} • Magit`;
    
    document.title = fullTitle;
    
    // Cleanup - restore default title on unmount
    return () => {
      document.title = "Magit - Verified Homes. Honest Financing.";
    };
  }, [t, titleKey, dynamicText]);
};