import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Filter, Grid, List } from "lucide-react"
import { PropertyCard } from "@/components/PropertyCard"
import { useSearchParams, useNavigate } from "react-router-dom"
import { performBasicSearch } from "@/utils/basicSearch"
import { getDistrictOptions } from "@/lib/districts"
import { useTranslation } from "@/hooks/useTranslation"

const AllResults = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('relevance')
  const [filters, setFilters] = useState<any>({})
  const [financingFilters, setFinancingFilters] = useState<any>({})
  
  // Get initial data from URL params
  const query = searchParams.get('query') || ''
  const isHalalMode = searchParams.get('isHalalMode') === 'true'
  
  useEffect(() => {
    const initFilters = searchParams.get('filters')
    const initFinancingFilters = searchParams.get('financingFilters')
    
    if (initFilters) {
      try {
        setFilters(JSON.parse(initFilters))
      } catch (e) {
        console.error('Error parsing filters:', e)
      }
    }
    
    if (initFinancingFilters) {
      try {
        setFinancingFilters(JSON.parse(initFinancingFilters))
      } catch (e) {
        console.error('Error parsing financing filters:', e)
      }
    }
  }, [searchParams])

  useEffect(() => {
    const loadResults = async () => {
      try {
        setLoading(true)
        const searchResults = await performBasicSearch(query, filters, financingFilters, isHalalMode)
        
        // Apply sorting
        let sortedResults = [...searchResults]
        switch (sortBy) {
          case 'price-low':
            sortedResults.sort((a, b) => (a.priceUsd || 0) - (b.priceUsd || 0))
            break
          case 'price-high':
            sortedResults.sort((a, b) => (b.priceUsd || 0) - (a.priceUsd || 0))
            break
          case 'area-large':
            sortedResults.sort((a, b) => (b.area || 0) - (a.area || 0))
            break
          case 'area-small':
            sortedResults.sort((a, b) => (a.area || 0) - (b.area || 0))
            break
          case 'newest':
            // Remove newest sort since we don't have created_at field
            break
          default:
            // Keep relevance order
            break
        }
        
        setResults(sortedResults)
      } catch (error) {
        console.error('Error loading results:', error)
      } finally {
        setLoading(false)
      }
    }

    loadResults()
  }, [query, filters, financingFilters, isHalalMode, sortBy])

  const districtOptions = getDistrictOptions('ru')

  const updateFilter = (key: string, value: string) => {
    setFilters((prev: any) => ({ ...prev, [key]: value }))
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
                Back
              </Button>
              <div>
                <h1 className="text-xl font-semibold">
                  Search Results {query && `for "${query}"`}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {loading ? 'Loading...' : `${results.length} properties found`}
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
                  <SelectItem value="newest">Newest First</SelectItem>
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
                  <h3 className="font-medium">Filters</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">District</Label>
                    <Select value={filters.district || ''} onValueChange={(value) => updateFilter('district', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose district" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Districts</SelectItem>
                        {districtOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Price Range</Label>
                    <Select value={filters.priceRange || ''} onValueChange={(value) => updateFilter('priceRange', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select budget" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any Price</SelectItem>
                        <SelectItem value="30-40">$30k - $40k</SelectItem>
                        <SelectItem value="40-50">$40k - $50k</SelectItem>
                        <SelectItem value="50-70">$50k - $70k</SelectItem>
                        <SelectItem value="70+">$70k+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2 block">Area</Label>
                    <Select value={filters.area || ''} onValueChange={(value) => updateFilter('area', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any Size</SelectItem>
                        <SelectItem value="30-50">30-50 m²</SelectItem>
                        <SelectItem value="50-70">50-70 m²</SelectItem>
                        <SelectItem value="70-100">70-100 m²</SelectItem>
                        <SelectItem value="100+">100+ m²</SelectItem>
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
                <p>Loading results...</p>
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No properties found matching your criteria.</p>
              </div>
            ) : (
              <div className={`grid gap-4 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6' 
                  : 'grid-cols-1'
              }`}>
                {results.map((property) => (
                  <PropertyCard
                    key={property.id}
                    id={property.id}
                    title={property.title || 'Property'}
                    location={property.district || property.city || property.location || 'Tashkent'}
                    price={`$${(property.priceUsd ?? 0).toLocaleString?.() || property.priceUsd}`}
                    bedrooms={property.bedrooms || 0}
                    bathrooms={property.bathrooms || 0}
                    area={property.area || 0}
                    imageUrl={property.image_url || property.images?.[0] || '/placeholder.svg'}
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
