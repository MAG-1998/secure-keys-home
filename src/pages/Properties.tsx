import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Search, Bed, Bath, ChevronLeft, ChevronRight } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useOptimizedQuery } from '@/hooks/useOptimizedQuery'
import { useTranslation } from '@/hooks/useTranslation'
import { extractDistrictFromText, getDistrictOptions, localizeDistrict as localizeDistrictLib } from '@/lib/districts'
import { getCityOptions, type CityKey } from '@/lib/cities'
import { getRegionOptions, getCitiesForRegion, type RegionKey } from '@/lib/regions'
import { VirtualizedPropertyList } from '@/components/VirtualizedPropertyList'
import { Header } from '@/components/Header'

interface Property {
  id: string;
  user_id: string;
  latitude: number;
  longitude: number;
  price: number;
  location: string;
  district?: string;
  property_type: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  land_area_sotka?: number;
  is_halal_available?: boolean;
  halal_status?: string;
  title?: string;
  description?: string;
  status?: string;
  image_url?: string;
  photos?: any;
  display_name?: string;
  is_verified?: boolean;
  property_photos?: any[];
  created_at?: string;
  [key: string]: any; // For additional properties from Supabase
}

const Properties = () => {
  const navigate = useNavigate()
  const { t, language } = useTranslation()
  const [searchParams] = useSearchParams()
  const sellerIdFromUrl = searchParams.get('seller')
  
  const [filters, setFilters] = useState({
    region: 'Tashkent_City',
    city: 'Tashkent',
    district: 'all',
    minPrice: '',
    maxPrice: '',
    minArea: '',
    maxArea: '',
    minLandArea: '',
    maxLandArea: '',
    bedrooms: 'all',
    bathrooms: 'all',
    propertyType: 'all',
    searchText: '',
    halalOnly: false,
    sellerId: sellerIdFromUrl || '',
  })
  
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 15

  // Use optimized query instead of manual state management
  const { data: properties = [], isLoading: loading } = useOptimizedQuery(
    ['properties', 'list'],
    async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*, property_photos(*)')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)
        .in('status', ['active', 'approved'])

      if (error) {
        console.error('Error fetching properties:', error)
        throw error
      }
      
      return (data || []) as Property[]
    }
  )

  const all = useMemo(() => (properties || []).map((p) => ({
    ...p,
    district: p.district || extractDistrict(p.location || ''),
    isHalal: (p.is_halal_available && p.halal_status === 'approved') || false,
    photos: p.property_photos || []
  })), [properties])

  function extractDistrict(location: string): string {
    return extractDistrictFromText(location);
  }

  const filtered = useMemo(() => {
    let f = all.filter(p => ['active','approved'].includes(p.status || 'active'))
    
    // Seller filter
    if (filters.sellerId) {
      f = f.filter(p => p.user_id === filters.sellerId)
    }
    
    // District filter
    if (filters.district !== 'all') f = f.filter(p => p.district === filters.district)
    
    // City filter (for future expansion)
    if (filters.city !== 'all') {
      // Currently only Tashkent, but prepared for expansion
      f = f.filter(p => p.location?.toLowerCase().includes('tashkent') || true)
    }
    
    // Price filters
    const minPrice = filters.minPrice ? Number(filters.minPrice) : undefined
    const maxPrice = filters.maxPrice ? Number(filters.maxPrice) : undefined
    if (minPrice !== undefined) f = f.filter(p => Number(p.price) >= minPrice)
    if (maxPrice !== undefined) f = f.filter(p => Number(p.price) <= maxPrice)
    
    // Area filters
    const minArea = filters.minArea ? Number(filters.minArea) : undefined
    const maxArea = filters.maxArea ? Number(filters.maxArea) : undefined
    if (minArea !== undefined) f = f.filter(p => Number(p.area) >= minArea)
    if (maxArea !== undefined) f = f.filter(p => Number(p.area) <= maxArea)
    
    // Land area filters (for houses, commercial, and land)
    const minLandArea = filters.minLandArea ? Number(filters.minLandArea) : undefined
    const maxLandArea = filters.maxLandArea ? Number(filters.maxLandArea) : undefined
    if (minLandArea !== undefined) {
      f = f.filter(p => {
        const hasLandArea = ['house', 'commercial', 'land'].includes(p.property_type || '')
        return hasLandArea && Number(p.land_area_sotka || 0) >= minLandArea
      })
    }
    if (maxLandArea !== undefined) {
      f = f.filter(p => {
        const hasLandArea = ['house', 'commercial', 'land'].includes(p.property_type || '')
        return hasLandArea && Number(p.land_area_sotka || 0) <= maxLandArea
      })
    }
    
    // Bedrooms filter
    if (filters.bedrooms !== 'all') f = f.filter(p => Number(p.bedrooms) >= parseInt(filters.bedrooms))
    
    // Bathrooms filter
    if (filters.bathrooms !== 'all') f = f.filter(p => Number(p.bathrooms) >= parseInt(filters.bathrooms))
    
    // Property type filter
    if (filters.propertyType !== 'all') f = f.filter(p => p.property_type === filters.propertyType)
    
    // Text search filter
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase()
      f = f.filter(p => 
        (p.title || p.display_name || '')?.toLowerCase().includes(searchLower) ||
        (p.description || '')?.toLowerCase().includes(searchLower) ||
        (p.location || '')?.toLowerCase().includes(searchLower)
      )
    }
    
    // Halal filter
    if (filters.halalOnly) f = f.filter(p => p.isHalal)
    
    // Sort by newest first (same as main page)
    return f.sort((a, b) => {
      const dateA = new Date(a.created_at || 0).getTime()
      const dateB = new Date(b.created_at || 0).getTime()
      return dateB - dateA // Descending order (newest first)
    })
  }, [all, filters])
  
  // Pagination
  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const paginatedResults = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filtered.slice(startIndex, startIndex + itemsPerPage)
  }, [filtered, currentPage, itemsPerPage])
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filters])

  return (
    <>
      <Header />
      <section className="py-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="font-heading font-bold text-3xl md:text-4xl mb-2">{t('map.viewAllProperties')}</h1>
            <p className="text-muted-foreground">{t('property.browseAll')}</p>
          </div>

          {/* Advanced Filters */}
          <Card className="mb-6">
            <CardContent className="p-6">
              {/* Row 1: Search, Region, and City */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                {/* Search Text */}
                <div className="md:col-span-2">
                  <label className="text-sm font-medium mb-2 block">{t('filter.searchByName')}</label>
                  <Input
                    placeholder={t('filter.searchPlaceholder')}
                    value={filters.searchText}
                    onChange={(e) => setFilters(prev => ({ ...prev, searchText: e.target.value }))}
                  />
                </div>

                {/* Region */}
                <div>
                  <label className="text-sm font-medium mb-2 block">{t('filter.region')}</label>
                  <Select 
                    value={filters.region} 
                    onValueChange={(value) => {
                      setFilters(prev => ({ ...prev, region: value }));
                      // Auto-update city
                      const cities = getCitiesForRegion(value as RegionKey);
                      if (cities.length > 0) {
                        setFilters(prev => ({ ...prev, city: cities[0] }));
                      }
                    }}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {getRegionOptions(language).map(({ value, label }) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* City (filtered by region) */}
                <div>
                  <label className="text-sm font-medium mb-2 block">{t('filter.city')}</label>
                  <Select 
                    value={filters.city} 
                    onValueChange={(value) => setFilters(prev => ({ ...prev, city: value }))}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {getCityOptions(language)
                        .filter(city => {
                          if (!filters.region) return true;
                          const citiesInRegion = getCitiesForRegion(filters.region as RegionKey);
                          return citiesInRegion.includes(city.value as CityKey);
                        })
                        .map(({ value, label }) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 2: Property Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {/* District */}
                <div>
                  <label className="text-sm font-medium mb-2 block">{t('filter.district')}</label>
                  <Select value={filters.district} onValueChange={(value) => setFilters(prev => ({ ...prev, district: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Districts" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('filter.allDistricts')}</SelectItem>
                      {getDistrictOptions(language).map(({ value, label }) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                      <SelectItem value="Other">{localizeDistrictLib('Other', language)}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Property Type */}
                <div>
                  <label className="text-sm font-medium mb-2 block">{t('filter.propertyType')}</label>
                  <Select value={filters.propertyType} onValueChange={(value) => setFilters(prev => ({ ...prev, propertyType: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('filter.allTypes')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('filter.allTypes')}</SelectItem>
                      <SelectItem value="apartment">{t('propertyType.apartment')}</SelectItem>
                      <SelectItem value="studio">{t('propertyType.studio')}</SelectItem>
                      <SelectItem value="house">{t('propertyType.house')}</SelectItem>
                      <SelectItem value="commercial">{t('propertyType.commercial')}</SelectItem>
                      <SelectItem value="land">{t('propertyType.land')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Bedrooms */}
                <div>
                  <label className="text-sm font-medium mb-2 block">{t('filter.bedrooms')}</label>
                  <Select value={filters.bedrooms} onValueChange={(value) => setFilters(prev => ({ ...prev, bedrooms: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('filter.any')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('filter.any')}</SelectItem>
                      <SelectItem value="1">1+ {t('filter.bed')}</SelectItem>
                      <SelectItem value="2">2+ {t('filter.bed')}</SelectItem>
                      <SelectItem value="3">3+ {t('filter.bed')}</SelectItem>
                      <SelectItem value="4">4+ {t('filter.bed')}</SelectItem>
                      <SelectItem value="5">5+ {t('filter.bed')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Bathrooms */}
                <div>
                  <label className="text-sm font-medium mb-2 block">{t('filter.bathrooms')}</label>
                  <Select value={filters.bathrooms} onValueChange={(value) => setFilters(prev => ({ ...prev, bathrooms: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('filter.any')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('filter.any')}</SelectItem>
                      <SelectItem value="1">1+ {t('filter.bath')}</SelectItem>
                      <SelectItem value="2">2+ {t('filter.bath')}</SelectItem>
                      <SelectItem value="3">3+ {t('filter.bath')}</SelectItem>
                      <SelectItem value="4">4+ {t('filter.bath')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 3: Ranges and Areas */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {/* Price Range */}
                <div>
                  <label className="text-sm font-medium mb-2 block">{t('filter.priceUSD')}</label>
                  <div className="grid grid-cols-2 gap-1">
                    <Input 
                      type="number" 
                      placeholder={t('filter.min')} 
                      value={filters.minPrice} 
                      onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))} 
                    />
                    <Input 
                      type="number" 
                      placeholder={t('filter.max')} 
                      value={filters.maxPrice} 
                      onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))} 
                    />
                  </div>
                </div>

                {/* Living Area */}
                <div>
                  <label className="text-sm font-medium mb-2 block">{t('filter.livingArea')}</label>
                  <div className="grid grid-cols-2 gap-1">
                    <Input 
                      type="number" 
                      placeholder={t('filter.min')} 
                      value={filters.minArea} 
                      onChange={(e) => setFilters(prev => ({ ...prev, minArea: e.target.value }))} 
                    />
                    <Input 
                      type="number" 
                      placeholder={t('filter.max')} 
                      value={filters.maxArea} 
                      onChange={(e) => setFilters(prev => ({ ...prev, maxArea: e.target.value }))} 
                    />
                  </div>
                </div>

                {/* Land Area (for houses, commercial, and land) */}
                {(filters.propertyType === 'house' || filters.propertyType === 'commercial' || filters.propertyType === 'land') && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">{t('filter.landArea')}</label>
                    <div className="grid grid-cols-2 gap-1">
                      <Input 
                        type="number" 
                        placeholder={t('filter.min')} 
                        value={filters.minLandArea} 
                        onChange={(e) => setFilters(prev => ({ ...prev, minLandArea: e.target.value }))} 
                      />
                      <Input 
                        type="number" 
                        placeholder={t('filter.max')} 
                        value={filters.maxLandArea} 
                        onChange={(e) => setFilters(prev => ({ ...prev, maxLandArea: e.target.value }))} 
                      />
                    </div>
                  </div>
                )}

                {/* Halal Financing */}
                <div className="flex items-end">
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input 
                      type="checkbox" 
                      checked={filters.halalOnly} 
                      onChange={(e) => setFilters(prev => ({ ...prev, halalOnly: e.target.checked }))} 
                    />
                    {t('filter.halalFinancing')}
                  </label>
                </div>
              </div>

              {/* Clear Filters Button */}
              <div className="flex justify-end">
                <Button 
                  variant="outline"
                  onClick={() => {
                    setFilters({
                      region: 'Tashkent_City',
                      city: 'Tashkent',
                      district: 'all',
                      minPrice: '',
                      maxPrice: '',
                      minArea: '',
                      maxArea: '',
                      minLandArea: '',
                      maxLandArea: '',
                      bedrooms: 'all',
                      bathrooms: 'all',
                      propertyType: 'all',
                      searchText: '',
                      halalOnly: false,
                      sellerId: '',
                    })
                  }}
                >
                  {t('filter.clearFilters')}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-semibold text-lg">{t('property.propertiesFound')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('property.showing')} {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filtered.length)} {t('property.of')} {filtered.length} {t('property.properties')}
                  </p>
                </div>
                <Badge variant="secondary" className="text-sm">{filtered.length} {t('property.total')}</Badge>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="text-muted-foreground">{t('property.loadingProperties')}</div>
                </div>
              ) : paginatedResults.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-muted-foreground">{t('property.noPropertiesFound')}</div>
                </div>
              ) : (
                <>
                  {/* Properties Grid with Virtualization */}
                  <div className="mb-6">
                    <VirtualizedPropertyList 
                      properties={filtered}
                      currentPage={currentPage}
                      itemsPerPage={itemsPerPage}
                    />
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      
                      <div className="flex gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          
                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(pageNum)}
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  )
}

export default Properties
