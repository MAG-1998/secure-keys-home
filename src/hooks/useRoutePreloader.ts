import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useUser } from '@/contexts/UserContext'
import { supabase } from '@/integrations/supabase/client'

export function useRoutePreloader() {
  const queryClient = useQueryClient()
  const { user } = useUser()

  useEffect(() => {
    if (!user?.id) return

    // Preload commonly accessed data
    const preloadData = async () => {
      // Preload user counts for dashboard
      queryClient.prefetchQuery({
        queryKey: ['user-counts', user.id],
        queryFn: async () => {
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
        },
        staleTime: 2 * 60 * 1000, // 2 minutes
      })

      // Preload user properties
      queryClient.prefetchQuery({
        queryKey: ['user-properties', user.id],
        queryFn: async () => {
          const { data, error } = await supabase
            .from('properties')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(10) // Only preload first 10
          
          if (error) throw error
          return data || []
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
      })
    }

    // Small delay to not block initial render
    const timeoutId = setTimeout(preloadData, 100)
    
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