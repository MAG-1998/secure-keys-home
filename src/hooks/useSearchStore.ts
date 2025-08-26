import { create } from 'zustand'
import { supabase } from '@/integrations/supabase/client'

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
}

export const useSearchStore = create<SearchStore>((set, get) => ({
  filters: {},
  results: [],
  loading: false,
  error: null,
  lastSearchQuery: '',

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters }
    }))
  },

  performSearch: async (overrideFilters = {}) => {
    const { filters } = get()
    const searchFilters = { ...filters, ...overrideFilters }
    
    set({ loading: true, error: null })

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
        query = query.or('is_halal_financed.eq.true,halal_financing_status.eq.approved')
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
      const results: Property[] = (searchResults || []).map((prop: any) => ({
        id: prop.id,
        title: prop.title || 'Property',
        location: prop.location || prop.district || 'Tashkent',
        priceUsd: Number(prop.price) || 0,
        bedrooms: Number(prop.bedrooms) || 1,
        bathrooms: Number(prop.bathrooms) || 1,
        area: Number(prop.area) || 50,
        verified: prop.status === 'approved',
        financingAvailable: prop.is_halal_financed || prop.halal_financing_status === 'approved',
        image_url: Array.isArray(prop.photos) && prop.photos.length > 0 ? prop.photos[0] : '/placeholder.svg',
        latitude: Number(prop.latitude),
        longitude: Number(prop.longitude)
      }))

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
  }
}))