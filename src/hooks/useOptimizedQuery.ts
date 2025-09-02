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
      if (!userId) return { saved: 0, listed: 0, financingRequests: 0, myRequests: 0, incomingRequests: 0 }
      
      const [savedResult, ownedPropertiesResult, myRequestsResult, financingRequestsResult] = await Promise.all([
        supabase.from('saved_properties').select('id', { count: 'exact' }).eq('user_id', userId),
        supabase.from('properties').select('id', { count: 'exact' }).eq('user_id', userId),
        supabase.from('property_visits').select('id', { count: 'exact' }).eq('visitor_id', userId).in('status', ['pending', 'confirmed']),
        supabase.from('halal_financing_requests').select('id', { count: 'exact' }).eq('user_id', userId)
      ])

      const propertyIds = (ownedPropertiesResult.data || []).map((row: any) => row.id) as string[]
      let incomingCount = 0
      if (propertyIds.length > 0) {
        const incomingResult = await supabase
          .from('property_visits')
          .select('id', { count: 'exact' })
          .eq('status', 'pending')
          .in('property_id', propertyIds)
        incomingCount = incomingResult.count || 0
      }

      return {
        saved: savedResult.count || 0,
        listed: ownedPropertiesResult.count || 0,
        financingRequests: financingRequestsResult.count || 0,
        myRequests: myRequestsResult.count || 0,
        incomingRequests: incomingCount
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