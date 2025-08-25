import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
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
import type { Language } from "@/hooks/useTranslation";
import { extractDistrictFromText, localizeDistrict as localizeDistrictLib, getDistrictOptions } from "@/lib/districts";

interface YandexMapProps {
  isHalalMode?: boolean;
  onHalalModeChange?: (enabled: boolean) => void;
  t: (key: string) => string;
  language: Language;
  searchResults?: any[];
  onSearchResultsChange?: (results: any[]) => void;
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
  photos?: string[];
}

declare global {
  interface Window {
    ymaps: any;
  }
}

const YandexMap: React.FC<YandexMapProps> = ({ isHalalMode = false, onHalalModeChange, t, language, searchResults, onSearchResultsChange }) => {
  const navigate = useNavigate();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

const cssInjectedRef = useRef(false);
const [filters, setFilters] = useState({
  district: 'all',
  minPrice: '',
  maxPrice: '',
  bedrooms: 'all',
  halalOnly: false
});

// Cache of computed districts from coords
const [computedDistricts, setComputedDistricts] = useState<Record<string, string>>({});
const geocodeCacheRef = useRef<Map<string, string>>(new Map());

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
  district: computedDistricts[prop.id] || (prop.district as string) || extractDistrictFromText(prop.location || ''),
  type: prop.property_type || 'apartment',
  bedrooms: Number(prop.bedrooms) || 1,
  bathrooms: Number(prop.bathrooms) || 1,
  area: Number(prop.area) || 50,
  isHalal: (prop.is_halal_financed || prop.halal_financing_status === 'approved') || false,
  title: prop.title || 'Property',
  description: prop.description || '',
  status: prop.status || 'active',
  photos: Array.isArray(prop.photos) ? prop.photos as string[] : [],
}));

  // Helper function to extract district from location
  function extractDistrict(location: string): string {
    return extractDistrictFromText(location);
  }

  const localizeDistrict = useCallback((district: string): string => {
    return localizeDistrictLib(district, language as Language);
  }, [language]);

// Apply filters (reactive to data and UI)
const filteredProperties = useMemo(() => {
  let filtered = allProperties;

  // If we have search results, prioritize those
  if (searchResults && searchResults.length > 0) {
    const searchIds = new Set(searchResults.map(r => r.id));
    filtered = allProperties.filter(p => searchIds.has(p.id));
  }

  // Only show approved/active listings on the map
  filtered = filtered.filter(p => ['active','approved'].includes(p.status));

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
    filtered = filtered.filter(p => p.isHalal);
  }
  return filtered;
}, [allProperties, searchResults, filters, isHalalMode]);

// Update search results when filtered properties change (for bidirectional sync)
useEffect(() => {
  if (onSearchResultsChange && !searchResults?.length) {
    const searchFormattedResults = filteredProperties.map(p => ({
      id: p.id,
      title: p.title,
      location: p.district,
      priceUsd: p.price,
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      area: p.area,
      verified: p.status === 'approved',
      financingAvailable: p.isHalal,
      image_url: p.photos && p.photos.length > 0 ? p.photos[0] : '/placeholder.svg'
    }));
    onSearchResultsChange(searchFormattedResults);
  }
}, [filteredProperties, onSearchResultsChange, searchResults?.length]);

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

    const ymLang = language === 'ru' ? 'ru_RU' : (language === 'uz' ? 'uz_UZ' : 'en_US');
    const script = document.createElement('script');
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=8baec550-0c9b-458c-b9bd-e9893af7beb7&lang=${ymLang}`;
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

  // Auto-resolve districts from coordinates using Yandex geocoder
  useEffect(() => {
    if (!mapLoaded || !window.ymaps || !(dbProperties && dbProperties.length)) return;
    try {
      const unresolved = (dbProperties as any[])
        .filter((p) => {
          const initial = (p.district as string) || extractDistrictFromText(p.location || '');
          return !initial || initial === 'Other';
        })
        .slice(0, 20); // limit per tick

      unresolved.forEach((p: any) => {
        if (!p.latitude || !p.longitude) return;
        const key = `${p.latitude},${p.longitude}`;
        const cached = geocodeCacheRef.current.get(key);
        if (cached) {
          setComputedDistricts((prev) => (prev[p.id] ? prev : { ...prev, [p.id]: cached }));
          return;
        }
        window.ymaps
          .geocode([Number(p.latitude), Number(p.longitude)], { kind: 'district', results: 1 })
          .then((res: any) => {
            const first = res?.geoObjects?.get?.(0);
            const rawName =
              (first?.properties && first.properties.get && first.properties.get('name')) ||
              (first?.getName && first.getName()) ||
              '';
            const canon = extractDistrictFromText(String(rawName));
            if (canon && canon !== 'Other') {
              geocodeCacheRef.current.set(key, canon);
              setComputedDistricts((prev) => ({ ...prev, [p.id]: canon }));
            }
          })
          .catch(() => {});
      });
    } catch {}
  }, [mapLoaded, dbProperties]);

  // Initialize map
  useEffect(() => {
    if (!mapLoaded || !mapContainer.current || map.current) return;

    map.current = new window.ymaps.Map(mapContainer.current, {
      center: [41.2995, 69.2401], // Tashkent coordinates
      zoom: 11,
      controls: ['zoomControl', 'typeSelector', 'fullscreenControl']
    });

    // Inject transparent overrides for Yandex placemark containers
    if (mapContainer.current) {
      mapContainer.current.classList.add('ymaps-transparent-scope');
      if (!cssInjectedRef.current) {
        const styleEl = document.createElement('style');
        styleEl.setAttribute('data-ymaps-transparent', 'true');
        styleEl.textContent = `
.ymaps-transparent-scope .ymaps-2-1-79-placemark-overlay,
.ymaps-transparent-scope .ymaps-2-1-79-placemark,
.ymaps-transparent-scope .ymaps-2-1-79-placemark-container,
.ymaps-transparent-scope .ymaps-2-1-79-balloon,
.ymaps-transparent-scope .ymaps-2-1-79-balloon__content,
.ymaps-transparent-scope .ymaps-2-1-79-zoom__button,
.ymaps-transparent-scope .ymaps-2-1-79-controls__control,
.ymaps-transparent-scope .ymaps-2-1-79-copyrights-pane,
.ymaps-transparent-scope .ymaps-2-1-79-ground-pane {
  background: transparent !important;
  box-shadow: none !important;
  border: 0 !important;
}
        `;
        document.head.appendChild(styleEl);
        cssInjectedRef.current = true;
      }
    }

    // Update markers when filtered properties change
    updateMarkers();
  }, [mapLoaded]);

  // Update markers when filters change
  useEffect(() => {
    if (map.current) {
      updateMarkers();
    }
  }, [filteredProperties]);

  // Cache for composed pin images (key: `${baseKey}-${priceText}`)
  const composedPinCacheRef = useRef<Map<string, string>>(new Map());

const composePinImage = (color: string, priceText: string) => {
  const WIDTH = 44;
  const HEIGHT = 60;
  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Draw teardrop pin shape
  ctx.beginPath();
  ctx.moveTo(22, 58);
  ctx.quadraticCurveTo(44, 38, 22, 10);
  ctx.quadraticCurveTo(0, 38, 22, 58);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'hsl(0 0% 100% / 0.5)';
  ctx.stroke();

  // Inner circle for accent
  ctx.beginPath();
  ctx.arc(22, 22, 10, 0, Math.PI * 2);
  ctx.fillStyle = 'hsl(0 0% 100% / 0.85)';
  ctx.fill();

  // Price text overlay near the head
  ctx.font = '800 12px system-ui, -apple-system, Segoe UI, Roboto, Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const x = WIDTH / 2;
  const y = 18;
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'hsl(0 0% 100% / 0.7)';
  ctx.strokeText(priceText, x, y);
  ctx.fillStyle = 'hsl(0 0% 0%)';
  ctx.fillText(priceText, x, y);

  return canvas.toDataURL('image/png');
};

  const updateMarkers = async () => {
    if (!map.current) return;

    // Clear existing markers
    map.current.geoObjects.removeAll();

    // Using vector pins; no base image preparation needed

    // Price formatter for compact captions
    const formatPriceShort = (n: number) => {
      if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(n % 1_000_000 ? 1 : 0)}M`;
      if (n >= 1000) return `$${Math.round(n / 1000)}k`;
      return `$${n}`;
    };

    // Prepare all placemarks concurrently for performance
    const placemarkPromises = filteredProperties.map(async (property) => {
      const isOwner = Boolean(user?.id && property.userId && user.id === property.userId);
      const color = isOwner
        ? 'hsl(0 72% 50%)' // red for user's own properties
        : (property.isHalal ? 'hsl(142 72% 42%)' : 'hsl(24 95% 53%)'); // green for halal, orange for ordinary
      const priceText = formatPriceShort(property.price);
      const cacheKey = `${color}-${priceText}`;

      let composedHref = composedPinCacheRef.current.get(cacheKey);
      if (!composedHref) {
        composedHref = composePinImage(color, priceText);
        composedPinCacheRef.current.set(cacheKey, composedHref);
      }

      return new window.ymaps.Placemark(
        [property.lat, property.lng],
        {
          href: composedHref,
          hintContent: property.title,
          balloonContentHeader: `<a href="/property/${property.id}" style="text-decoration: underline; color: hsl(var(--primary));" onclick="window.location.assign('/property/${property.id}'); return false;">${property.title}</a>`,
          balloonContentBody: `
            <div style="padding: 10px; font-family: system-ui;">
              ${property.photos && property.photos.length > 0 ? `
                <img src="${property.photos[0]}" alt="${property.title}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px; margin-bottom: 12px;" />
              ` : ''}
              <div style="font-size: 18px; font-weight: bold; color: hsl(var(--primary)); margin-bottom: 8px;">
                $${property.price.toLocaleString()}
              </div>
              <div style="margin-bottom: 8px; color: hsl(var(--muted-foreground));">
                <strong>${localizeDistrict(property.district)}</strong> • ${property.type}
              </div>
              <div style="display: flex; gap: 12px; margin-bottom: 8px; font-size: 14px; color: hsl(var(--muted-foreground));">
                <span>🛏️ ${property.bedrooms} ${t('map.bed')}</span>
                <span>🚿 ${property.bathrooms} ${t('map.bath')}</span>
                <span>📐 ${property.area}m²</span>
              </div>
              ${property.isHalal ? `<div style="background: hsl(var(--primary)); color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px; display: inline-block; margin-bottom: 8px;">✅ ${t('features.halalFinancing')}</div>` : ''}
              ${isOwner ? `<div style="background: #d97706; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px; display: inline-block; margin-left: 6px;">⭐ ${t('map.myListing')}</div>` : ''}
              <div style="color: hsl(var(--muted-foreground)); font-size: 14px;">
                ${property.description}
              </div>
            </div>
          `
        },
        {
          iconLayout: 'default#image',
          iconImageHref: composedHref,
          iconImageSize: [44, 60],
          iconImageOffset: [-22, -60],
          zIndex: isOwner ? 700 : (property.isHalal ? 650 : 600),
          zIndexHover: isOwner ? 800 : 700,
        }
      );
    });

    const placemarks = await Promise.all(placemarkPromises);
    placemarks.forEach((pm) => map.current.geoObjects.add(pm));

    // Adjust map bounds to show all markers
    if (filteredProperties.length > 0) {
      map.current.setBounds(map.current.geoObjects.getBounds(), {
        checkZoomRange: true,
        zoomMargin: 50
      });
    }
  };

  const refreshPins = async () => {
    if (!map.current) return;
    try {
      map.current.geoObjects.removeAll();
      composedPinCacheRef.current.clear();
      await updateMarkers();
      if (map.current?.container?.fitToViewport) {
        map.current.container.fitToViewport();
      }
    } catch (e) {
      console.error('[Map] Failed to refresh pins', e);
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
    <div className="w-full h-full">
      <div 
        ref={mapContainer}
        className="w-full h-full"
        style={{ minHeight: '400px' }}
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50">
          <div className="text-muted-foreground">Loading map...</div>
        </div>
      )}
    </div>
  );
};

export default YandexMap;