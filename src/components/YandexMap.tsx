import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Filter, Search, Home, Bed, Bath } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface YandexMapProps {
  isHalalMode?: boolean;
  t: (key: string) => string;
}

interface Property {
  id: number;
  lat: number;
  lng: number;
  price: number;
  district: string;
  type: 'apartment' | 'house' | 'premium';
  bedrooms: number;
  bathrooms: number;
  area: number;
  isHalal: boolean;
  title: string;
  description: string;
}

declare global {
  interface Window {
    ymaps: any;
  }
}

const YandexMap: React.FC<YandexMapProps> = ({ isHalalMode = false, t }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [filters, setFilters] = useState({
    district: 'all',
    priceRange: 'all',
    bedrooms: 'all',
    halalOnly: false
  });

  // Sample properties data for Tashkent
  const allProperties: Property[] = [
    {
      id: 1,
      lat: 41.2995,
      lng: 69.2401,
      price: 52000,
      district: 'Chilonzor',
      type: 'apartment',
      bedrooms: 2,
      bathrooms: 1,
      area: 65,
      isHalal: true,
      title: '2-Room Apartment in Chilonzor',
      description: 'Modern apartment with halal financing available'
    },
    {
      id: 2,
      lat: 41.3111,
      lng: 69.2797,
      price: 47000,
      district: 'Yunusobod',
      type: 'house',
      bedrooms: 3,
      bathrooms: 2,
      area: 120,
      isHalal: false,
      title: 'Family House in Yunusobod',
      description: 'Spacious family home with garden'
    },
    {
      id: 3,
      lat: 41.2648,
      lng: 69.2163,
      price: 68000,
      district: 'Shaykhantahur',
      type: 'premium',
      bedrooms: 4,
      bathrooms: 3,
      area: 180,
      isHalal: true,
      title: 'Premium Villa in Shaykhantahur',
      description: 'Luxury villa with modern amenities'
    },
    {
      id: 4,
      lat: 41.3167,
      lng: 69.2500,
      price: 35000,
      district: 'Mirzo-Ulugbek',
      type: 'apartment',
      bedrooms: 1,
      bathrooms: 1,
      area: 45,
      isHalal: true,
      title: 'Studio Apartment',
      description: 'Perfect for young professionals'
    },
    {
      id: 5,
      lat: 41.2889,
      lng: 69.2725,
      price: 75000,
      district: 'Yakkasaray',
      type: 'house',
      bedrooms: 5,
      bathrooms: 4,
      area: 250,
      isHalal: false,
      title: 'Large Family Home',
      description: 'Spacious home in premium location'
    }
  ];

  // Apply filters
  useEffect(() => {
    let filtered = allProperties;

    if (filters.district !== 'all') {
      filtered = filtered.filter(p => p.district === filters.district);
    }

    if (filters.priceRange !== 'all') {
      const [min, max] = filters.priceRange.split('-').map(Number);
      filtered = filtered.filter(p => p.price >= min && (max ? p.price <= max : true));
    }

    if (filters.bedrooms !== 'all') {
      filtered = filtered.filter(p => p.bedrooms >= parseInt(filters.bedrooms));
    }

    if (filters.halalOnly || isHalalMode) {
      filtered = filtered.filter(p => p.isHalal);
    }

    setFilteredProperties(filtered);
  }, [filters, isHalalMode]);

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

    // Add markers for filtered properties
    filteredProperties.forEach(property => {
      const placemark = new window.ymaps.Placemark(
        [property.lat, property.lng],
        {
          balloonContentHeader: property.title,
          balloonContentBody: `
            <div style="padding: 10px; font-family: system-ui;">
              <div style="font-size: 18px; font-weight: bold; color: #2563eb; margin-bottom: 8px;">
                $${property.price.toLocaleString()}
              </div>
              <div style="margin-bottom: 8px;">
                <strong>${property.district}</strong> • ${property.type}
              </div>
              <div style="display: flex; gap: 12px; margin-bottom: 8px; font-size: 14px; color: #6b7280;">
                <span>🛏️ ${property.bedrooms} bed</span>
                <span>🚿 ${property.bathrooms} bath</span>
                <span>📐 ${property.area}m²</span>
              </div>
              ${property.isHalal ? '<div style="background: #22c55e; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px; display: inline-block; margin-bottom: 8px;">✅ Halal Financing</div>' : ''}
              <div style="color: #6b7280; font-size: 14px;">
                ${property.description}
              </div>
              <button style="background: #2563eb; color: white; border: none; padding: 8px 16px; border-radius: 6px; margin-top: 8px; cursor: pointer; font-size: 14px;">
                View Details
              </button>
            </div>
          `
        },
        {
          preset: property.isHalal ? 'islands#greenIcon' : 'islands#blueIcon',
          iconCaption: `$${property.price / 1000}k`
        }
      );

      map.current.geoObjects.add(placemark);
    });

    // Adjust map bounds to show all markers
    if (filteredProperties.length > 0) {
      const bounds = filteredProperties.map(p => [p.lat, p.lng]);
      map.current.setBounds(map.current.geoObjects.getBounds(), {
        checkZoomRange: true,
        zoomMargin: 50
      });
    }
  };

  return (
    <section className={`py-16 transition-colors duration-500 ${
      isHalalMode ? 'bg-magit-trust/5' : 'bg-background/50'
    }`}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge variant={isHalalMode ? "default" : "secondary"} className="mb-4">
            {isHalalMode ? 'Halal Marketplace' : 'Live Marketplace'}
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
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Price Range</label>
                <Select value={filters.priceRange} onValueChange={(value) => setFilters(prev => ({ ...prev, priceRange: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any Price" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Price</SelectItem>
                    <SelectItem value="0-40000">Under $40k</SelectItem>
                    <SelectItem value="40000-60000">$40k - $60k</SelectItem>
                    <SelectItem value="60000-80000">$60k - $80k</SelectItem>
                    <SelectItem value="80000">Above $80k</SelectItem>
                  </SelectContent>
                </Select>
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
                <Button 
                  variant={filters.halalOnly ? "default" : "outline"} 
                  onClick={() => setFilters(prev => ({ ...prev, halalOnly: !prev.halalOnly }))}
                  className="w-full"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  {filters.halalOnly ? 'Halal Only ✓' : 'Halal Financing'}
                </Button>
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
                  {!mapLoaded ? (
                    <div className="absolute inset-0 bg-muted/20 flex items-center justify-center">
                      <div className="text-center">
                        <MapPin className="h-12 w-12 text-primary mx-auto mb-2 animate-pulse" />
                        <p className="text-muted-foreground font-medium">Loading Yandex Maps...</p>
                      </div>
                    </div>
                  ) : (
                    <div ref={mapContainer} className="absolute inset-0 rounded-lg" />
                  )}
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
                  {filteredProperties.map(property => (
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
                  ))}
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