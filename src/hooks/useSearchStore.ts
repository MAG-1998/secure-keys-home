import { create } from 'zustand'
import { supabase } from '@/integrations/supabase/client'

interface SearchCacheItem {
  query: string
  filters: SearchFilters
  results: Property[]
  timestamp: number
}

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
const STORAGE_KEY = 'magit_search_cache'

export interface SearchFilters {
  q?: string
  district?: string
  priceMin?: string
  priceMax?: string
  bedrooms?: string
  propertyType?: string
  hasParking?: boolean
  isNewConstruction?: boolean
  hasGarden?: boolean
  halalMode?: boolean
  cashAvailable?: string
  periodMonths?: string
}

export interface Property {
  id: string
  title: string
  location: string
  priceUsd: number
  bedrooms: number
  bathrooms: number
  area: number
  verified: boolean
  financingAvailable: boolean
  image_url: string
  latitude?: number
  longitude?: number
}

// Cache utility functions
const getCacheKey = (query: string, filters: SearchFilters) => {
  return `${query}_${JSON.stringify(filters)}`
}

const getCachedResult = (query: string, filters: SearchFilters): Property[] | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null
    
    const parsed = JSON.parse(stored)
    const key = getCacheKey(query, filters)
    const cached = parsed[key] as SearchCacheItem
    
    if (!cached) return null
    
    // Check if cache is still valid
    if (Date.now() - cached.timestamp > CACHE_DURATION) {
      delete parsed[key]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed))
      return null
    }
    
    return cached.results
  } catch (error) {
    console.warn('Failed to get cached result:', error)
    return null
  }
}

const setCachedResult = (query: string, filters: SearchFilters, results: Property[]) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    const cache = stored ? JSON.parse(stored) : {}
    const key = getCacheKey(query, filters)
    
    cache[key] = {
      query,
      filters,
      results,
      timestamp: Date.now()
    } as SearchCacheItem
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache))
  } catch (error) {
    console.warn('Failed to cache result:', error)
  }
}

interface SearchStore {
  filters: SearchFilters
  results: Property[]
  loading: boolean
  error: string | null
  lastSearchQuery: string
  setFilters: (filters: Partial<SearchFilters>) => void
  performSearch: (overrideFilters?: Partial<SearchFilters>) => Promise<void>
  clearResults: () => void
  setResults: (results: Property[]) => void
  clearCache: () => void
}

export const useSearchStore = create<SearchStore>((set, get) => ({
  filters: {},
  results: [],
  loading: false,
  error: null,
  lastSearchQuery: '',

  setFilters: (newFilters) => {
    set((state) => ({ filters: { ...state.filters, ...newFilters } }));
  },

  performSearch: async (overrideFilters = {}) => {
    const { filters } = get()
    const searchFilters = { ...filters, ...overrideFilters }
    
    set({ loading: true, error: null })

    // Check cache first
    const cacheKey = searchFilters.q || ''
    const cachedResults = getCachedResult(cacheKey, searchFilters)
    if (cachedResults) {
      set({ 
        results: cachedResults, 
        loading: false,
        lastSearchQuery: cacheKey,
        error: null
      })
      return
    }

    try {
      // Build Supabase query
      let query = supabase
        .from('properties')
        .select('*')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)
        .in('status', ['active', 'approved'])

      // Apply text search
      if (searchFilters.q?.trim()) {
        const searchTerm = searchFilters.q.trim()
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`)
      }

      // Apply halal filtering
      if (searchFilters.halalMode) {
        query = query.or('is_halal_available.eq.true,halal_status.eq.approved')
      }

      // Apply other filters
      if (searchFilters.district && searchFilters.district !== 'all') {
        query = query.or(`location.ilike.%${searchFilters.district}%,district.ilike.%${searchFilters.district}%`)
      }

      if (searchFilters.propertyType && searchFilters.propertyType !== 'all') {
        query = query.eq('property_type', searchFilters.propertyType)
      }
      
      if (searchFilters.priceMin) {
        const min = parseInt(searchFilters.priceMin.replace(/[^0-9]/g, ''))
        if (!isNaN(min)) query = query.gte('price', min)
      }

      if (searchFilters.priceMax) {
        const max = parseInt(searchFilters.priceMax.replace(/[^0-9]/g, ''))
        if (!isNaN(max)) query = query.lte('price', max)
      }
      
      if (searchFilters.bedrooms && searchFilters.bedrooms !== 'all') {
        const bedroomCount = parseInt(searchFilters.bedrooms)
        if (!isNaN(bedroomCount)) {
          query = query.gte('bedrooms', bedroomCount)
        }
      }

      const { data: searchResults, error } = await query.order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      // Transform results to expected format
      let results: Property[] = (searchResults || []).map((prop: any) => ({
        id: prop.id,
        title: prop.title || 'Property',
        location: prop.location || prop.district || 'Tashkent',
        priceUsd: Number(prop.price) || 0,
        bedrooms: Number(prop.bedrooms) || 1,
        bathrooms: Number(prop.bathrooms) || 1,
        area: Number(prop.area) || 50,
        verified: prop.status === 'approved',
        financingAvailable: prop.is_halal_available && prop.halal_status === 'approved',
        image_url: Array.isArray(prop.photos) && prop.photos.length > 0 ? prop.photos[0] : '/placeholder.svg',
        latitude: Number(prop.latitude),
        longitude: Number(prop.longitude)
      }))

      // Filter for halal financing eligibility if halal mode is active
      if (searchFilters.halalMode && searchFilters.cashAvailable) {
        const cashAmount = parseFloat(searchFilters.cashAvailable.replace(/[^0-9.]/g, '')) || 0;
        if (cashAmount > 0) {
          results = results.filter(property => {
            // Only show properties where cash is at least 50% of property price
            return cashAmount >= (property.priceUsd * 0.5);
          });
        }
      }

      // Cache the results
      setCachedResult(searchFilters.q || '', searchFilters, results)

      set({ 
        results, 
        loading: false,
        lastSearchQuery: searchFilters.q || '',
        error: null
      })

    } catch (err: any) {
      console.error('Search error:', err)
      set({ 
        error: err?.message || 'Search failed',
        loading: false,
        results: []
      })
    }
  },

  clearResults: () => {
    set({ results: [], error: null })
  },

  setResults: (results) => {
    set({ results })
  },

  clearCache: () => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.warn('Failed to clear cache:', error)
    }
  }
}))

// Subscribe to financing store changes for one-way data flow
let unsubscribeFromFinancing: (() => void) | null = null;

if (typeof window !== 'undefined') {
  // Set up subscription when financing store becomes available
  const setupFinancingSubscription = () => {
    try {
      const { useFinancingStore } = require('@/stores/financingStore');
      
      if (unsubscribeFromFinancing) {
        unsubscribeFromFinancing();
      }
      
      unsubscribeFromFinancing = useFinancingStore.subscribe(
        (state) => ({
          halalMode: state.isHalalMode,
          cashAvailable: state.cashAvailable,
          periodMonths: state.periodMonths
        }),
        (newFinancingState) => {
          const searchStore = useSearchStore.getState();
          const currentFilters = searchStore.filters;
          
          // Only update if values are different to prevent loops
          const shouldUpdate = 
            currentFilters.halalMode !== newFinancingState.halalMode ||
            currentFilters.cashAvailable !== newFinancingState.cashAvailable ||
            currentFilters.periodMonths !== newFinancingState.periodMonths;
            
          if (shouldUpdate) {
            searchStore.setFilters({
              halalMode: newFinancingState.halalMode,
              cashAvailable: newFinancingState.cashAvailable,
              periodMonths: newFinancingState.periodMonths
            });
          }
        },
        { equalityFn: (a, b) => 
          a.halalMode === b.halalMode && 
          a.cashAvailable === b.cashAvailable && 
          a.periodMonths === b.periodMonths 
        }
      );
    } catch (error) {
      // Financing store not yet available, will retry
      setTimeout(setupFinancingSubscription, 100);
    }
  };
  
  setupFinancingSubscription();
}