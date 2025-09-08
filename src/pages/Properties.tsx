import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Search, Bed, Bath, ChevronLeft, ChevronRight } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useTranslation } from '@/hooks/useTranslation'
import { extractDistrictFromText, getDistrictOptions, localizeDistrict as localizeDistrictLib } from '@/lib/districts'
import { PropertyCard } from '@/components/PropertyCard'
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
  [key: string]: any; // For additional properties from Supabase
}

const Properties = () => {
  const navigate = useNavigate()
  const { t, language } = useTranslation()
  const [filters, setFilters] = useState({
    district: 'all',
    city: 'tashkent',
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
  })
  
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 15

  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProps = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('properties')
        .select('*, property_photos(*)')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)
        .in('status', ['active', 'approved'])

      if (error) {
        console.error('Error fetching properties:', error)
        setProperties([])
      } else {
        setProperties((data || []) as Property[])
      }
      setLoading(false)
    }
    fetchProps()
  }, [])

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
    
    // Land area filters (for houses)
    const minLandArea = filters.minLandArea ? Number(filters.minLandArea) : undefined
    const maxLandArea = filters.maxLandArea ? Number(filters.maxLandArea) : undefined
    if (minLandArea !== undefined) f = f.filter(p => p.property_type === 'house' && Number(p.land_area_sotka || 0) >= minLandArea)
    if (maxLandArea !== undefined) f = f.filter(p => p.property_type === 'house' && Number(p.land_area_sotka || 0) <= maxLandArea)
    
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
    
    return f
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
            <p className="text-muted-foreground">Browse all available properties with advanced filtering</p>
          </div>

          {/* Advanced Filters */}
          <Card className="mb-6">
            <CardContent className="p-6">
              {/* Row 1: Search and Location */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {/* Search Text */}
                <div className="md:col-span-2">
                  <label className="text-sm font-medium mb-2 block">Search by name</label>
                  <Input
                    placeholder="Search properties..."
                    value={filters.searchText}
                    onChange={(e) => setFilters(prev => ({ ...prev, searchText: e.target.value }))}
                  />
                </div>

                {/* City */}
                <div>
                  <label className="text-sm font-medium mb-2 block">City</label>
                  <Select value={filters.city} onValueChange={(value) => setFilters(prev => ({ ...prev, city: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tashkent">Tashkent</SelectItem>
                      <SelectItem value="all">All Cities</SelectItem>
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
                      <SelectItem value="all">All Districts</SelectItem>
                      {getDistrictOptions(language).map(({ value, label }) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                      <SelectItem value="Other">{localizeDistrictLib('Other', language)}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Property Type */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Property Type</label>
                  <Select value={filters.propertyType} onValueChange={(value) => setFilters(prev => ({ ...prev, propertyType: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                      <SelectItem value="land">Land</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Bedrooms */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Bedrooms</label>
                  <Select value={filters.bedrooms} onValueChange={(value) => setFilters(prev => ({ ...prev, bedrooms: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any</SelectItem>
                      <SelectItem value="1">1+ bed</SelectItem>
                      <SelectItem value="2">2+ bed</SelectItem>
                      <SelectItem value="3">3+ bed</SelectItem>
                      <SelectItem value="4">4+ bed</SelectItem>
                      <SelectItem value="5">5+ bed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Bathrooms */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Bathrooms</label>
                  <Select value={filters.bathrooms} onValueChange={(value) => setFilters(prev => ({ ...prev, bathrooms: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any</SelectItem>
                      <SelectItem value="1">1+ bath</SelectItem>
                      <SelectItem value="2">2+ bath</SelectItem>
                      <SelectItem value="3">3+ bath</SelectItem>
                      <SelectItem value="4">4+ bath</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 3: Ranges and Areas */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {/* Price Range */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Price (USD)</label>
                  <div className="grid grid-cols-2 gap-1">
                    <Input 
                      type="number" 
                      placeholder="Min" 
                      value={filters.minPrice} 
                      onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))} 
                    />
                    <Input 
                      type="number" 
                      placeholder="Max" 
                      value={filters.maxPrice} 
                      onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))} 
                    />
                  </div>
                </div>

                {/* Living Area */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Living Area (m²)</label>
                  <div className="grid grid-cols-2 gap-1">
                    <Input 
                      type="number" 
                      placeholder="Min" 
                      value={filters.minArea} 
                      onChange={(e) => setFilters(prev => ({ ...prev, minArea: e.target.value }))} 
                    />
                    <Input 
                      type="number" 
                      placeholder="Max" 
                      value={filters.maxArea} 
                      onChange={(e) => setFilters(prev => ({ ...prev, maxArea: e.target.value }))} 
                    />
                  </div>
                </div>

                {/* Land Area (for houses only) */}
                {filters.propertyType === 'house' && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Land Area (sotka)</label>
                    <div className="grid grid-cols-2 gap-1">
                      <Input 
                        type="number" 
                        placeholder="Min" 
                        value={filters.minLandArea} 
                        onChange={(e) => setFilters(prev => ({ ...prev, minLandArea: e.target.value }))} 
                      />
                      <Input 
                        type="number" 
                        placeholder="Max" 
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
                    Halal financing available
                  </label>
                </div>
              </div>

              {/* Clear Filters Button */}
              <div className="flex justify-end">
                <Button 
                  variant="outline"
                  onClick={() => {
                    setFilters({
                      district: 'all',
                      city: 'tashkent',
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
                    })
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-semibold text-lg">Properties Found</h3>
                  <p className="text-sm text-muted-foreground">
                    Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} properties
                  </p>
                </div>
                <Badge variant="secondary" className="text-sm">{filtered.length} total</Badge>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="text-muted-foreground">Loading properties...</div>
                </div>
              ) : paginatedResults.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-muted-foreground">No properties found matching your criteria.</div>
                </div>
              ) : (
                <>
                  {/* Properties Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    {paginatedResults.map((property) => (
                      <PropertyCard
                        key={property.id}
                        id={property.id}
                        title={property.display_name || property.title || 'Property'}
                        location={property.location}
                        price={property.price}
                        priceUsd={property.price}
                        bedrooms={property.bedrooms || 0}
                        bathrooms={property.bathrooms || 0}
                        area={property.area || 0}
                        landAreaSotka={property.land_area_sotka}
                        propertyType={property.property_type}
                        imageUrl={property.property_photos?.[0]?.url || property.image_url}
                        property={{...property, property_photos: property.property_photos}}
                        isVerified={property.is_verified || false}
                        isHalalFinanced={property.isHalal}
                      />
                    ))}
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
