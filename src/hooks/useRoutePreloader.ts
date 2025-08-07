import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useUser } from '@/contexts/UserContext'
import { supabase } from '@/integrations/supabase/client'

export function useRoutePreloader() {
  const queryClient = useQueryClient()
  const { user } = useUser()

  useEffect(() => {
    if (!user?.id) return

    // Non-blocking preload with error handling
    const preloadData = async () => {
      try {
        // Preload user counts for dashboard
        queryClient.prefetchQuery({
          queryKey: ['user-counts', user.id],
          queryFn: async () => {
            try {
              const [savedResult, listedResult, requestsResult] = await Promise.all([
                supabase.from('saved_properties').select('id', { count: 'exact' }).eq('user_id', user.id),
                supabase.from('properties').select('id', { count: 'exact' }).eq('user_id', user.id),
                supabase.from('property_visits').select('id', { count: 'exact' }).eq('visitor_id', user.id)
              ])

              return {
                saved: savedResult.count || 0,
                listed: listedResult.count || 0,
                requests: requestsResult.count || 0
              }
            } catch (error) {
              console.warn('Failed to preload user counts:', error);
              return { saved: 0, listed: 0, requests: 0 };
            }
          },
          staleTime: 2 * 60 * 1000, // 2 minutes
        })

        // Preload user properties with timeout
        const preloadTimeout = setTimeout(() => {
          console.warn('Preload timeout - continuing without preloaded data');
        }, 3000);

        queryClient.prefetchQuery({
          queryKey: ['user-properties', user.id],
          queryFn: async () => {
            try {
              const { data, error } = await supabase
                .from('properties')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(5) // Reduced to 5 for faster loading
              
              if (error) throw error
              clearTimeout(preloadTimeout);
              return data || []
            } catch (error) {
              clearTimeout(preloadTimeout);
              console.warn('Failed to preload user properties:', error);
              return [];
            }
          },
          staleTime: 5 * 60 * 1000, // 5 minutes
        })
      } catch (error) {
        console.warn('Route preloader error:', error);
      }
    }

    // Delay to not block initial render
    const timeoutId = setTimeout(preloadData, 500)
    
    return () => clearTimeout(timeoutId)
  }, [user?.id, queryClient])
}

// Link hover preloading for specific routes
export function useHoverPreloader() {
  const queryClient = useQueryClient()
  const { user } = useUser()

  const preloadRoute = (routeKey: string) => {
    if (!user?.id) return

    switch (routeKey) {
      case 'my-properties':
        queryClient.prefetchQuery({
          queryKey: ['user-properties', user.id],
          queryFn: async () => {
            const { data, error } = await supabase
              .from('properties')
              .select('*')
              .eq('user_id', user.id)
              .order('created_at', { ascending: false })
            
            if (error) throw error
            return data || []
          },
          staleTime: 5 * 60 * 1000,
        })
        break
      
      case 'saved-properties':
        queryClient.prefetchQuery({
          queryKey: ['saved-properties', user.id],
          queryFn: async () => {
            const { data, error } = await supabase
              .from('saved_properties')
              .select(`
                *,
                properties (*)
              `)
              .eq('user_id', user.id)
              .order('saved_at', { ascending: false })
            
            if (error) throw error
            return data || []
          },
          staleTime: 5 * 60 * 1000,
        })
        break
    }
  }

  return { preloadRoute }
}