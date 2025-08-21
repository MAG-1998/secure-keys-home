import { useState, useCallback } from 'react'

export interface SearchFilters {
  district?: string
  priceRange?: string
  area?: string
  propertyType?: string
  bedrooms?: string
  hasParking?: boolean
  isNewConstruction?: boolean
  hasGarden?: boolean
}

export interface FinancingFilters {
  cashAmount?: string
  monthlyPayment?: string
  financingPeriod?: string
  calculatedMonthlyPayment?: number
  totalFinancingCost?: number
}

export const useSearchFilters = () => {
  const [filters, setFilters] = useState<SearchFilters>({})
  const [financingFilters, setFinancingFilters] = useState<FinancingFilters>({})

  const updateFilter = useCallback((key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }, [])

  const updateFinancingFilter = useCallback((key: keyof FinancingFilters, value: any) => {
    setFinancingFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({})
  }, [])

  const clearFinancingFilters = useCallback(() => {
    setFinancingFilters({})
  }, [])

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== '' && value !== false
  )

  const hasActiveFinancingFilters = Object.values(financingFilters).some(value => 
    value !== undefined && value !== '' && value !== false
  )

  const getFilterCount = () => {
    return Object.values(filters).filter(value => 
      value !== undefined && value !== '' && value !== false
    ).length
  }

  const applyFiltersToQuery = (baseQuery: string): string => {
    let enhancedQuery = baseQuery

    if (filters.district) {
      enhancedQuery += ` в районе ${filters.district}`
    }
    
    if (filters.priceRange) {
      enhancedQuery += ` цена ${filters.priceRange}`
    }
    
    if (filters.area) {
      enhancedQuery += ` площадь ${filters.area}`
    }
    
    if (filters.propertyType) {
      enhancedQuery += ` тип ${filters.propertyType}`
    }
    
    if (filters.bedrooms) {
      enhancedQuery += ` ${filters.bedrooms} комнат`
    }
    
    if (filters.hasParking) {
      enhancedQuery += ` с парковкой`
    }
    
    if (filters.isNewConstruction) {
      enhancedQuery += ` новостройка`
    }
    
    if (filters.hasGarden) {
      enhancedQuery += ` с садом`
    }

    return enhancedQuery.trim()
  }

  return {
    filters,
    financingFilters,
    updateFilter,
    updateFinancingFilter,
    clearFilters,
    clearFinancingFilters,
    hasActiveFilters,
    hasActiveFinancingFilters,
    getFilterCount,
    applyFiltersToQuery
  }
}