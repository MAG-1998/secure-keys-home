import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'

// Optimized query hook with intelligent caching
export function useOptimizedQuery<T>(
  key: (string | number | boolean | null | undefined)[],
  queryFn: () => Promise<T>,
  options?: Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: key,
    queryFn,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (replaces cacheTime in v5)
    refetchOnWindowFocus: false,
    ...options,
  })
}

// Specialized hooks for common queries
export function useUserProperties(userId: string | undefined) {
  return useOptimizedQuery(
    ['user-properties', userId],
    async () => {
      if (!userId) return []
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    },
    { enabled: !!userId }
  )
}

export function useUserCounts(userId: string | undefined) {
  return useOptimizedQuery(
    ['user-counts', userId],
    async () => {
      if (!userId) return { saved: 0, listed: 0, requests: 0 }
      
      const [savedResult, listedResult, requestsResult] = await Promise.all([
        supabase.from('saved_properties').select('id', { count: 'exact' }).eq('user_id', userId),
        supabase.from('properties').select('id', { count: 'exact' }).eq('user_id', userId),
        supabase.from('property_visits').select('id', { count: 'exact' }).eq('visitor_id', userId)
      ])

      return {
        saved: savedResult.count || 0,
        listed: listedResult.count || 0,
        requests: requestsResult.count || 0
      }
    },
    { enabled: !!userId }
  )
}

export function useProperties(filters?: { status?: string; location?: string }) {
  return useOptimizedQuery(
    ['properties', JSON.stringify(filters)],
    async () => {
      let query = supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (filters?.status) {
        query = query.eq('status', filters.status)
      }
      
      if (filters?.location) {
        query = query.ilike('location', `%${filters.location}%`)
      }
      
      const { data, error } = await query
      if (error) throw error
      return data || []
    }
  )
}