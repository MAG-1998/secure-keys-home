import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const usePropertyCount = () => {
  const [count, setCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPropertyCount = async () => {
      try {
        const { count: propertyCount, error } = await supabase
          .from('properties')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active');

        if (error) {
          throw error;
        }

        setCount(propertyCount || 0);
      } catch (err) {
        console.error('Error fetching property count:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setCount(1500); // Fallback value
      } finally {
        setIsLoading(false);
      }
    };

    fetchPropertyCount();
  }, []);

  return { count, isLoading, error };
};