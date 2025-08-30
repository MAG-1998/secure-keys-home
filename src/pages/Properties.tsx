import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Search, Bed, Bath } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useTranslation } from '@/hooks/useTranslation'
import { extractDistrictFromText, getDistrictOptions, localizeDistrict as localizeDistrictLib } from '@/lib/districts'

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
  is_halal_financed?: boolean;
  halal_financing_status?: string;
  title?: string;
  description?: string;
  status?: string;
}

const Properties = () => {
  const { t, language } = useTranslation()
  const [filters, setFilters] = useState({
    district: 'all',
    minPrice: '',
    maxPrice: '',
    bedrooms: 'all',
    halalOnly: false,
  })

  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProps = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)

      if (error) {
        console.error('Error fetching properties:', error)
        setProperties([])
      } else {
        setProperties(data || [])
      }
      setLoading(false)
    }
    fetchProps()
  }, [])

  const all = useMemo(() => (properties || []).map((p) => ({
    id: p.id,
    price: Number(p.price) || 0,
    district: (p as any).district || extractDistrict(p.location || ''),
    type: p.property_type || 'apartment',
    bedrooms: Number(p.bedrooms) || 1,
    bathrooms: Number(p.bathrooms) || 1,
    area: Number(p.area) || 50,
    isHalal: (p.is_halal_financed || p.halal_financing_status === 'approved') || false,
    title: p.title || 'Property',
    description: p.description || '',
    status: p.status || 'active',
  })), [properties])

  function extractDistrict(location: string): string {
    return extractDistrictFromText(location);
  }

  const filtered = useMemo(() => {
    let f = all.filter(p => ['active','approved'].includes(p.status))
    if (filters.district !== 'all') f = f.filter(p => p.district === filters.district)
    const min = filters.minPrice ? Number(filters.minPrice) : undefined
    const max = filters.maxPrice ? Number(filters.maxPrice) : undefined
    if (min !== undefined) f = f.filter(p => p.price >= min)
    if (max !== undefined) f = f.filter(p => p.price <= max)
    if (filters.bedrooms !== 'all') f = f.filter(p => p.bedrooms >= parseInt(filters.bedrooms))
    if (filters.halalOnly) f = f.filter(p => p.isHalal)
    return f
  }, [all, filters])

  return (
    <section className="py-10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="font-heading font-bold text-3xl md:text-4xl mb-2">{t('map.viewAllProperties')}</h1>
          <p className="text-muted-foreground">{t('map.description')}</p>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">{t('filter.district')}</label>
                <Input
                  list="districts"
                  placeholder={t('filter.chooseDistrict')}
                  value={filters.district === 'all' ? '' : filters.district}
                  onChange={(e) => setFilters(prev => ({ ...prev, district: e.target.value || 'all' }))}
                />
                <datalist id="districts">
                  {getDistrictOptions(language).map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                  <option value="Other">{localizeDistrictLib('Other', language)}</option>
                </datalist>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Price (USD)</label>
                <div className="grid grid-cols-2 gap-2">
                  <Input type="number" placeholder={t('common.min')} value={filters.minPrice} onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))} />
                  <Input type="number" placeholder={t('common.max')} value={filters.maxPrice} onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))} />
                </div>
              </div>

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
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <label className="inline-flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={filters.halalOnly} onChange={(e) => setFilters(prev => ({ ...prev, halalOnly: e.target.checked }))} />
                  Halal financing
                </label>
              </div>

              <div className="flex items-end">
                <Button className="w-full" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                  <Search className="h-4 w-4 mr-2" />
                  {t('search.searchBtn')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">{t('map.propertiesFound')}</h3>
              <Badge variant="secondary">{filtered.length}</Badge>
            </div>

            {loading ? (
              <div className="text-muted-foreground">{t('map.loadingProperties')}</div>
            ) : (
              <div className="space-y-4">
                {filtered.map((p) => (
                  <div key={p.id} className="flex items-center justify-between rounded-lg border p-4 cursor-pointer hover:bg-muted/30" onClick={() => window.location.assign(`/property/${p.id}`)} role="button">
                    <div>
                      <div className="font-medium">{p.title}</div>
                      <div className="text-sm text-muted-foreground">{localizeDistrictLib(p.district as any, language)} • {p.type}</div>
                      <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                        <span>🛏️ {p.bedrooms} bed</span>
                        <span>🚿 {p.bathrooms} bath</span>
                        <span>📐 {p.area}m²</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-primary">${p.price?.toLocaleString()}</div>
                      {p.isHalal && (
                        <Badge variant="default" className="text-xs mt-1">Financing</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

export default Properties
