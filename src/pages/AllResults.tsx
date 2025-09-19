import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Filter, Grid, List } from "lucide-react"
import { PropertyCard } from "@/components/PropertyCard"
import { useSearchParams, useNavigate } from "react-router-dom"
import { useSearchStore, type Property } from "@/hooks/useSearchStore"
import { getDistrictOptions } from "@/lib/districts"
import { useTranslation } from "@/hooks/useTranslation"

const AllResults = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('relevance')
  
  // Use unified search store
  const { results, loading, filters, setFilters, performSearch } = useSearchStore()
  
  // Get initial data from URL params
  const query = searchParams.get('query') || ''
  const isHalalMode = searchParams.get('isHalalMode') === 'true'

  // Initialize filters from URL params
  useEffect(() => {
    const initFilters = searchParams.get('filters')
    const urlFilters: any = { q: query, halalMode: isHalalMode }
    
    if (initFilters) {
      try {
        const parsedFilters = JSON.parse(initFilters)
        Object.assign(urlFilters, parsedFilters)
      } catch (e) {
        console.error('Error parsing filters:', e)
      }
    }
    
    setFilters(urlFilters)
  }, [searchParams, query, isHalalMode, setFilters])

  // Perform search when filters are set
  useEffect(() => {
    if (filters.q || Object.keys(filters).length > 1) {
      performSearch()
    }
  }, [filters, performSearch])

  // Sort results based on sortBy
  const sortedResults = useMemo(() => {
    if (!results || results.length === 0) return []
    
    const sorted = [...results]
    switch (sortBy) {
      case 'price-low':
        return sorted.sort((a, b) => (a.priceUsd || 0) - (b.priceUsd || 0))
      case 'price-high':
        return sorted.sort((a, b) => (b.priceUsd || 0) - (a.priceUsd || 0))
      case 'area-large':
        return sorted.sort((a, b) => (b.area || 0) - (a.area || 0))
      case 'area-small':
        return sorted.sort((a, b) => (a.area || 0) - (b.area || 0))
      default:
        return sorted
    }
  }, [results, sortBy])

  const districtOptions = getDistrictOptions('ru')

  const updateFilter = (key: string, value: string) => {
    setFilters({ [key]: value })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                {t('allResults.back')}
              </Button>
              <div>
                <h1 className="text-xl font-semibold">
                  {t('allResults.searchResults')} {query && `for "${query}"`}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {loading ? t('allResults.loading') : `${sortedResults.length} ${t('allResults.propertiesFound')}`}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="area-large">Largest First</SelectItem>
                  <SelectItem value="area-small">Smallest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Filter className="h-4 w-4" />
                  <h3 className="font-medium">{t('allResults.filters')}</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">{t('listProperty.district')}</Label>
                    <Select value={filters.district || ''} onValueChange={(value) => updateFilter('district', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('allResults.chooseDistrict')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">{t('allResults.allDistricts')}</SelectItem>
                        {districtOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium mb-2 block">{t('allResults.minPrice')}</Label>
                    <Select value={filters.priceMin || ''} onValueChange={(value) => updateFilter('priceMin', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Min budget" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">{t('allResults.anyPrice')}</SelectItem>
                        <SelectItem value="30000">$30k</SelectItem>
                        <SelectItem value="40000">$40k</SelectItem>
                        <SelectItem value="50000">$50k</SelectItem>
                        <SelectItem value="70000">$70k</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2 block">Max Price</Label>
                    <Select value={filters.priceMax || ''} onValueChange={(value) => updateFilter('priceMax', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Max budget" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any Price</SelectItem>
                        <SelectItem value="40000">$40k</SelectItem>
                        <SelectItem value="50000">$50k</SelectItem>
                        <SelectItem value="70000">$70k</SelectItem>
                        <SelectItem value="100000">$100k</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Property Type</Label>
                    <Select value={filters.propertyType || ''} onValueChange={(value) => updateFilter('propertyType', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any Type</SelectItem>
                        <SelectItem value="apartment">Apartment</SelectItem>
                        <SelectItem value="house">House</SelectItem>
                        <SelectItem value="studio">Studio</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                        <SelectItem value="land">Land</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2 block">Bedrooms</Label>
                    <Select value={filters.bedrooms || ''} onValueChange={(value) => updateFilter('bedrooms', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Bedrooms" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any</SelectItem>
                        <SelectItem value="1">1+</SelectItem>
                        <SelectItem value="2">2+</SelectItem>
                        <SelectItem value="3">3+</SelectItem>
                        <SelectItem value="4">4+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="text-center py-12">
                <p>{t('allResults.loadingResults')}</p>
              </div>
            ) : sortedResults.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">{t('allResults.noProperties')}</p>
              </div>
            ) : (
              <div className={`grid gap-4 md:gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5' 
                  : 'grid-cols-1'
              }`}>
                {sortedResults.map((property: Property) => (
                  <PropertyCard
                    key={property.id}
                    id={property.id}
                    title={property.title || 'Property'}
                    location={property.location || 'Tashkent'}
                    price={`$${(property.priceUsd ?? 0).toLocaleString?.() || property.priceUsd}`}
                    bedrooms={property.bedrooms || 0}
                    bathrooms={property.bathrooms || 0}
                    area={property.area || 0}
                    imageUrl={property.image_url || '/placeholder.svg'}
                    isVerified={property.verified || false}
                    isHalalFinanced={property.financingAvailable || false}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AllResults