import { supabase } from '@/integrations/supabase/client'
import { calculateHalalFinancing } from './halalFinancing'
import type { SearchFilters, FinancingFilters } from '@/hooks/useSearchFilters'

export interface SearchResult {
  id: string
  title: string
  priceUsd: number
  city: string
  district?: string
  bedrooms?: number
  bathrooms?: number
  sizeM2?: number
  verified: boolean
  financingAvailable: boolean
  propertyType?: string
  isHalalFinanced?: boolean
  status?: string
  whyGood: string
  financingCalculation?: {
    totalCost: number
    requiredMonthlyPayment: number
    financingAmount: number
  }
}

export const performBasicSearch = async (
  searchTerm: string,
  filters: SearchFilters,
  financingFilters: FinancingFilters,
  isHalalMode: boolean
): Promise<SearchResult[]> => {
  try {
    let query = supabase
      .from('properties')
      .select(`
        id, title, price, location, district, bedrooms, bathrooms, area,
        property_type, is_verified, is_halal_financed, status, description,
        latitude, longitude, user_id, photos, created_at
      `)
      .in('status', ['active', 'approved'])

    // Apply basic filters
    if (filters.district && filters.district !== 'all') {
      query = query.eq('district', filters.district)
    }
    
    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split('-').map(p => parseInt(p.replace(/\D/g, '')))
      if (min) query = query.gte('price', min)
      if (max) query = query.lte('price', max)
    }
    
    if (filters.propertyType && filters.propertyType !== 'all') {
      query = query.eq('property_type', filters.propertyType)
    }
    
    if (filters.bedrooms && filters.bedrooms !== 'all') {
      query = query.gte('bedrooms', parseInt(filters.bedrooms))
    }

    // Apply halal financing filters if in halal mode
    if (isHalalMode) {
      query = query.eq('is_halal_financed', true)
    }

    // Apply text search if provided
    if (searchTerm.trim()) {
      query = query.or(`title.ilike.%${searchTerm}%, description.ilike.%${searchTerm}%, location.ilike.%${searchTerm}%`)
    }

    query = query.limit(50)

    const { data, error } = await query

    if (error) {
      console.error('Search error:', error)
      return []
    }

    let results = data || []

    // Apply financing calculations if in halal mode and period is provided
    if (isHalalMode && financingFilters.financingPeriod) {
      // Use high defaults for empty fields as requested
      const cashAvailable = financingFilters.cashAmount ? parseFloat(financingFilters.cashAmount) : 999999999999
      const periodMonths = parseInt(financingFilters.financingPeriod)
      const maxMonthlyPayment = financingFilters.monthlyPayment ? parseFloat(financingFilters.monthlyPayment) : 999999999
      
      results = results.filter(property => {
        const calculation = calculateHalalFinancing(cashAvailable, property.price, periodMonths)
        return calculation.requiredMonthlyPayment <= maxMonthlyPayment
      })
      
      // Add calculation results to properties
      results = results.map(property => ({
        ...property,
        financingCalculation: calculateHalalFinancing(cashAvailable, property.price, periodMonths)
      }))
    }

    // Transform results to match expected format
    const transformedResults: SearchResult[] = results.map(property => ({
      id: property.id,
      title: property.title || 'Property',
      priceUsd: property.price,
      city: property.location?.includes('Tashkent') ? 'Tashkent' : 'Uzbekistan',
      district: property.district,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      sizeM2: property.area,
      verified: property.is_verified || false,
      financingAvailable: property.is_halal_financed || false,
      propertyType: property.property_type,
      isHalalFinanced: property.is_halal_financed || false,
      status: property.status,
      whyGood: isHalalMode && (property as any).financingCalculation 
        ? `Monthly payment: $${(property as any).financingCalculation.requiredMonthlyPayment.toFixed(0)}, Total cost: $${(property as any).financingCalculation.totalCost.toFixed(0)}`
        : 'Matches your search criteria',
      financingCalculation: (property as any).financingCalculation
    }))

    return transformedResults
    
  } catch (error) {
    console.error('Basic search error:', error)
    return []
  }
}