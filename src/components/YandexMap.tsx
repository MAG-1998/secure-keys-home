import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Search, Home, Bed, Bath } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useOptimizedQuery } from "@/hooks/useOptimizedQuery";
import { useUser } from "@/contexts/UserContext";
import halalPin from "@/assets/markers/halal-pin.png";
import ownerPin from "@/assets/markers/owner-pin.png";
import defaultPin from "@/assets/markers/default-pin.png";

interface YandexMapProps {
  isHalalMode?: boolean;
  onHalalModeChange?: (enabled: boolean) => void;
  t: (key: string) => string;
}

interface Property {
  id: string;
  userId: string;
  lat: number;
  lng: number;
  price: number;
  district: string;
  type: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  isHalal: boolean;
  title: string;
  description: string;
  status: string;
}

declare global {
  interface Window {
    ymaps: any;
  }
}

const YandexMap: React.FC<YandexMapProps> = ({ isHalalMode = false, onHalalModeChange, t }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
const [mapLoaded, setMapLoaded] = useState(false);
const priceContentLayoutRef = useRef<any>(null);
const [filters, setFilters] = useState({
  district: 'all',
  minPrice: '',
  maxPrice: '',
  bedrooms: 'all',
  halalOnly: false
});

  const halalMode = isHalalMode || filters.halalOnly;
  const { user } = useUser();

  // Keep internal halal filter in sync with external prop
  useEffect(() => {
    setFilters(prev => ({ ...prev, halalOnly: !!isHalalMode }));
  }, [isHalalMode]);

  // Unified handler so both toggle UIs behave the same
const handleHalalToggle = (checked: boolean | string) => {
  const val = checked === 'indeterminate' ? true : Boolean(checked);
  setFilters(prev => ({ ...prev, halalOnly: val }));
  onHalalModeChange?.(val);
};

  // Fetch properties from database
  const { data: dbProperties, isLoading } = useOptimizedQuery(
    ['properties', 'map'],
    async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);
      
      if (error) {
        console.error('Error fetching properties:', error);
        return [] as any[];
      }
      
      return data || [];
    },
    {
      staleTime: 0,
      refetchOnWindowFocus: true,
      refetchOnMount: 'always',
    }
  );

  // Transform database properties to component format
const allProperties: Property[] = (dbProperties || []).map((prop: any) => ({
  id: prop.id,
  userId: prop.user_id,
  lat: Number(prop.latitude) || 41.2995,
  lng: Number(prop.longitude) || 69.2401,
  price: Number(prop.price) || 0,
  district: extractDistrict(prop.location || ''),
  type: prop.property_type || 'apartment',
  bedrooms: Number(prop.bedrooms) || 1,
  bathrooms: Number(prop.bathrooms) || 1,
  area: Number(prop.area) || 50,
  isHalal: (prop.is_halal_financed || prop.halal_financing_status === 'approved') || false,
  title: prop.title || 'Property',
  description: prop.description || '',
  status: prop.status || 'active',
}));

  // Helper function to extract district from location
  function extractDistrict(location: string): string {
    const districts = ['Chilonzor', 'Yunusobod', 'Shaykhantahur', 'Mirzo-Ulugbek', 'Yakkasaray', 'Mirobod', 'Bektemir'];
    const foundDistrict = districts.find(district => 
      location.toLowerCase().includes(district.toLowerCase())
    );
    return foundDistrict || 'Other';
  }

// Apply filters (reactive to data and UI)
const filteredProperties = useMemo(() => {
  let filtered = allProperties;

  if (filters.district !== 'all') {
    filtered = filtered.filter(p => p.district === filters.district);
  }

  const min = filters.minPrice ? Number(filters.minPrice) : undefined;
  const max = filters.maxPrice ? Number(filters.maxPrice) : undefined;
  if (min !== undefined) {
    filtered = filtered.filter(p => p.price >= min);
  }
  if (max !== undefined) {
    filtered = filtered.filter(p => p.price <= max);
  }

  if (filters.bedrooms !== 'all') {
    filtered = filtered.filter(p => p.bedrooms >= parseInt(filters.bedrooms));
  }

  if (halalMode) {
    filtered = filtered.filter(p => p.isHalal && ['active','approved'].includes(p.status));
  }

  return filtered;
}, [allProperties, filters, isHalalMode]);

// Diagnostics to verify halal filtering
useEffect(() => {
  const halalApprovedCount = allProperties.filter(p => p.isHalal && ['active','approved'].includes(p.status)).length;
  console.info('[Map] halalMode:', halalMode, 'total:', allProperties.length, 'halal+approved:', halalApprovedCount, 'shown:', filteredProperties.length);
}, [halalMode, allProperties, filteredProperties]);


  // Load Yandex Maps API
  useEffect(() => {
    if (window.ymaps) {
      setMapLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=8baec550-0c9b-458c-b9bd-e9893af7beb7&lang=en_US`;
    script.async = true;
    script.onload = () => {
      window.ymaps.ready(() => {
        setMapLoaded(true);
      });
    };
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  // Prepare marker price content layout once
  useEffect(() => {
    if (!mapLoaded || !window.ymaps || priceContentLayoutRef.current) return;
    priceContentLayoutRef.current = window.ymaps.templateLayoutFactory.createClass(
      '<div style="transform: translateY(-8px); background: transparent; color: hsl(0 0% 100%); padding: 2px 6px; border-radius: 12px; font-weight: 700; font-size: 12px; text-shadow: 0 1px 2px hsla(0 0% 0% / 0.7);">$[properties.iconContent]</div>'
    );
  }, [mapLoaded]);

  // Initialize map
  useEffect(() => {
    if (!mapLoaded || !mapContainer.current || map.current) return;

    map.current = new window.ymaps.Map(mapContainer.current, {
      center: [41.2995, 69.2401], // Tashkent coordinates
      zoom: 11,
      controls: ['zoomControl', 'typeSelector', 'fullscreenControl']
    });

    // Update markers when filtered properties change
    updateMarkers();
  }, [mapLoaded]);

  // Update markers when filters change
  useEffect(() => {
    if (map.current) {
      updateMarkers();
    }
  }, [filteredProperties]);

  const updateMarkers = () => {
    if (!map.current) return;

    // Clear existing markers
    map.current.geoObjects.removeAll();

    // Price formatter for compact captions
    const formatPriceShort = (n: number) => {
      if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(n % 1_000_000 ? 1 : 0)}M`;
      if (n >= 1000) return `$${Math.round(n / 1000)}k`;
      return `$${n}`;
    };

    // Add markers for filtered properties using custom images with overlaid price
    filteredProperties.forEach(property => {
      const isOwner = Boolean(user?.id && property.userId && user.id === property.userId);
      const iconHref = isOwner ? ownerPin : (property.isHalal ? halalPin : defaultPin);

      const placemark = new window.ymaps.Placemark(
        [property.lat, property.lng],
        {
          iconContent: formatPriceShort(property.price),
          hintContent: property.title,
          balloonContentHeader: property.title,
          balloonContentBody: `
            <div style="padding: 10px; font-family: system-ui;">
              <div style="font-size: 18px; font-weight: bold; color: hsl(var(--primary)); margin-bottom: 8px;">
                $${property.price.toLocaleString()}
              </div>
              <div style="margin-bottom: 8px; color: hsl(var(--muted-foreground));">
                <strong>${property.district}</strong> • ${property.type}
              </div>
              <div style="display: flex; gap: 12px; margin-bottom: 8px; font-size: 14px; color: hsl(var(--muted-foreground));">
                <span>🛏️ ${property.bedrooms} bed</span>
                <span>🚿 ${property.bathrooms} bath</span>
                <span>📐 ${property.area}m²</span>
              </div>
              ${property.isHalal ? '<div style="background: hsl(var(--primary)); color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px; display: inline-block; margin-bottom: 8px;">✅ Halal Financing</div>' : ''}
              ${isOwner ? '<div style="background: #d97706; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px; display: inline-block; margin-left: 6px;">⭐ My Listing</div>' : ''}
              <div style="color: hsl(var(--muted-foreground)); font-size: 14px;">
                ${property.description}
              </div>
            </div>
          `
        },
        {
          iconLayout: 'default#imageWithContent',
          iconImageHref: iconHref,
          iconImageSize: [44, 60],
          iconImageOffset: [-22, -60],
          iconContentLayout: priceContentLayoutRef.current,
          zIndex: isOwner ? 700 : (property.isHalal ? 650 : 600),
          zIndexHover: isOwner ? 800 : 700,
        }
      );

      map.current.geoObjects.add(placemark);
    });

    // Adjust map bounds to show all markers
    if (filteredProperties.length > 0) {
      map.current.setBounds(map.current.geoObjects.getBounds(), {
        checkZoomRange: true,
        zoomMargin: 50
      });
    }
  };

const approvedRandom = useMemo(() => {
  const pool = halalMode
    ? filteredProperties
    : (filteredProperties.length > 0
        ? filteredProperties
        : allProperties.filter(p => ['active', 'approved'].includes(p.status)));
  if (pool.length <= 3) return pool;
  const arr = [...pool];
  return arr.sort(() => 0.5 - Math.random()).slice(0, 3);
}, [halalMode, filteredProperties, allProperties]);

  return (
    <section className={`py-16 transition-colors duration-500 ${
      halalMode ? 'bg-magit-trust/5' : 'bg-background/50'
    }`}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge variant={halalMode ? "default" : "secondary"} className="mb-4">
            {halalMode ? 'Halal Marketplace' : 'Live Marketplace'}
          </Badge>
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-4">
            Discover Properties in Tashkent
          </h2>
          <p className="text-lg text-muted-foreground mb-6">
            Browse verified properties with interactive maps and smart filtering options.
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">District</label>
                <Select value={filters.district} onValueChange={(value) => setFilters(prev => ({ ...prev, district: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Districts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Districts</SelectItem>
                    <SelectItem value="Chilonzor">Chilonzor</SelectItem>
                    <SelectItem value="Yunusobod">Yunusobod</SelectItem>
                    <SelectItem value="Shaykhantahur">Shaykhantahur</SelectItem>
                    <SelectItem value="Mirzo-Ulugbek">Mirzo-Ulugbek</SelectItem>
                    <SelectItem value="Yakkasaray">Yakkasaray</SelectItem>
                    <SelectItem value="Mirobod">Mirobod</SelectItem>
                    <SelectItem value="Bektemir">Bektemir</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Price (USD)</label>
                <div className="grid grid-cols-2 gap-2">
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
                <div className="flex items-center space-x-2 w-full">
                  <Checkbox
                    id="halal-mode"
                    checked={halalMode}
                    onCheckedChange={handleHalalToggle}
                  />
                  <label htmlFor="halal-mode" className="text-sm">Halal financing mode</label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Map and Results */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Map */}
          <div className="lg:col-span-2">
            <Card className="bg-gradient-card border-0 shadow-warm">
              <CardContent className="p-6">
                <div className="relative rounded-lg h-96 overflow-hidden">
                  <div ref={mapContainer} className="absolute inset-0 rounded-lg bg-muted" />
                  {!mapLoaded || isLoading ? (
                    <div className="absolute inset-0 bg-background/90 flex items-center justify-center">
                      <div className="text-center">
                        <MapPin className="h-12 w-12 text-primary mx-auto mb-2 animate-pulse" />
                        <p className="text-muted-foreground font-medium">
                          {isLoading ? 'Loading properties...' : 'Loading Yandex Maps...'}
                        </p>
                      </div>
                    </div>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Panel */}
          <div>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Properties Found</h3>
                  <Badge variant="secondary">{filteredProperties.length}</Badge>
                </div>
                
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {halalMode && filteredProperties.length === 0 ? (
                    <div className="text-sm text-muted-foreground">No halal-approved properties found right now.</div>
                  ) : (
                    approvedRandom.map(property => (
                      <div key={property.id} className="border rounded-lg p-4 hover:bg-muted/20 transition-colors cursor-pointer">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-medium text-sm">{property.title}</h4>
                            <p className="text-xs text-muted-foreground">{property.district}</p>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-primary">${property.price.toLocaleString()}</div>
                            {property.isHalal && (
                              <Badge variant="default" className="text-xs">Halal</Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center">
                            <Bed className="h-3 w-3 mr-1" />
                            {property.bedrooms}
                          </span>
                          <span className="flex items-center">
                            <Bath className="h-3 w-3 mr-1" />
                            {property.bathrooms}
                          </span>
                          <span className="flex items-center">
                            <Home className="h-3 w-3 mr-1" />
                            {property.area}m²
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <Button className="w-full mt-4" size="lg">
                  <Search className="h-4 w-4 mr-2" />
                  View All Properties
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default YandexMap;