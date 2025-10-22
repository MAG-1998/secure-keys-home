import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Check, Search, LocateFixed } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useMapLoader } from "@/hooks/useMapLoader";
import { useToast } from "@/hooks/use-toast";

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number, address?: string) => void;
  selectedLat?: number;
  selectedLng?: number;
  initialAddress?: string;
}

declare global {
  interface Window {
    ymaps: any;
  }
}

// Uzbekistan geographical bounds [Southwest corner, Northeast corner]
const UZBEKISTAN_BOUNDS: [[number, number], [number, number]] = [[37.2, 55.9], [45.6, 73.2]];

// Default center (Tashkent)
const TASHKENT_CENTER: [number, number] = [41.2995, 69.2401];

// Helper to check if coordinates are within Uzbekistan
const isWithinUzbekistan = (lat: number, lng: number): boolean => {
  return lat >= UZBEKISTAN_BOUNDS[0][0] &&
         lat <= UZBEKISTAN_BOUNDS[1][0] &&
         lng >= UZBEKISTAN_BOUNDS[0][1] &&
         lng <= UZBEKISTAN_BOUNDS[1][1];
};

const LocationPicker: React.FC<LocationPickerProps> = ({
  onLocationSelect,
  selectedLat,
  selectedLng,
  initialAddress,
}) => {
  const { language, t } = useTranslation();
  const { mapLoaded, status } = useMapLoader(language as any);
  const { toast } = useToast();

  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const placemark = useRef<any>(null);
  const suggestView = useRef<any>(null);
  const cssInjectedRef = useRef(false);
  const searchingRef = useRef(false);

  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Unique input id to avoid collisions if multiple pickers are mounted
  const reactId = useId();
  const inputId = `address-search-input-${reactId}`;

  // Validate container (important inside dialogs)
  const validateContainer = useCallback(() => {
    if (!mapContainer.current) return false;
    const rect = mapContainer.current.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }, []);

  // Initialize map when API is ready and container is measurable
  useEffect(() => {
    if (!mapLoaded || map.current) return;
    if (!validateContainer()) {
      // Retry shortly (dialog animations, etc.)
      const t = setTimeout(() => {
        if (mapLoaded && !map.current && validateContainer()) {
          // force rerun by setting a noop state (not needed here) — we'll rely on next effect cycle
        }
      }, 120);
      return () => clearTimeout(t);
    }

    if (!window.ymaps || !window.ymaps.Map) return;

    try {
      const center = (selectedLat && selectedLng) ? [selectedLat, selectedLng] : [41.2995, 69.2401];
      map.current = new window.ymaps.Map(mapContainer.current, {
        center,
        zoom: (selectedLat && selectedLng) ? 15 : 11,
        controls: ['zoomControl', 'typeSelector', 'geolocationControl'],
      });

      // Make Yandex overlay panes transparent within this container scope
      if (mapContainer.current && !cssInjectedRef.current) {
        mapContainer.current.classList.add('ymaps-transparent-scope');
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

      // Existing placemark / initial address
      if (selectedLat && selectedLng) {
        addPlacemark(selectedLat, selectedLng);
        getAddress(selectedLat, selectedLng);
      } else if (initialAddress) {
        try {
          window.ymaps
            .geocode(initialAddress)
            .then((result: any) => {
              const first = result?.geoObjects?.get?.(0);
              if (first) {
                const coords = first.geometry.getCoordinates();
                const [lat, lng] = [coords[0], coords[1]];
                
                // Validate initial address is within Uzbekistan
                if (!isWithinUzbekistan(lat, lng)) {
                  // Skip placing pin, center back to Tashkent
                  try { map.current?.setCenter(TASHKENT_CENTER, 11, { duration: 300 }); } catch {}
                  return;
                }
                
                const address = first.getAddressLine();
                addPlacemark(lat, lng);
                setSelectedAddress(address);
                onLocationSelect(lat, lng, address);
                map.current?.setCenter([lat, lng], 15, { duration: 300 });
              }
            })
            .catch(() => {});
        } catch {}
      }

      // Click to set placemark
      map.current.events.add('click', (e: any) => {
        const coords = e.get('coords');
        const [lat, lng] = [coords[0], coords[1]];
        
        // Validate click location is within Uzbekistan
        if (!isWithinUzbekistan(lat, lng)) {
          toast({
            title: t('address.outOfBounds') || 'Outside Uzbekistan',
            description: t('address.onlyUzbekistan') || 'Only locations within Uzbekistan are supported.',
            variant: 'destructive',
          });
          return;
        }
        
        addPlacemark(lat, lng);
        getAddress(lat, lng);
      });

      // Fit after container resizes (dialog open, viewport change)
      const ro = new ResizeObserver(() => {
        try {
          map.current?.container?.fitToViewport?.();
        } catch {}
      });
      if (mapContainer.current) ro.observe(mapContainer.current);

      // Cleanup
      return () => {
        try { ro.disconnect(); } catch {}
        try { map.current?.destroy?.(); } catch {}
        map.current = null;
      };
    } catch (e) {
      console.error('[LocationPicker] Failed to init map', e);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapLoaded, validateContainer]);

  const addPlacemark = (lat: number, lng: number) => {
    if (!map.current || !window.ymaps) return;

    // Remove existing
    if (placemark.current) {
      try { map.current.geoObjects.remove(placemark.current); } catch {}
    }

    const composePinImage = () => {
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
      ctx.fillStyle = 'hsl(24 95% 53%)';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'hsl(0 0% 100% / 0.5)';
      ctx.stroke();

      // Inner circle for accent
      ctx.beginPath();
      ctx.arc(22, 22, 10, 0, Math.PI * 2);
      ctx.fillStyle = 'hsl(0 0% 100% / 0.85)';
      ctx.fill();

      return canvas.toDataURL('image/png');
    };

    placemark.current = new window.ymaps.Placemark(
      [lat, lng],
      { balloonContent: 'Selected location' },
      {
        iconLayout: 'default#image',
        iconImageHref: composePinImage(),
        iconImageSize: [44, 60],
        iconImageOffset: [-22, -60],
        // Ensure above ground pane
        zIndex: 700,
        zIndexHover: 800,
      }
    );

    map.current.geoObjects.add(placemark.current);
    onLocationSelect(lat, lng);
  };

  const getAddress = (lat: number, lng: number) => {
    try {
      window.ymaps
        .geocode([lat, lng])
        .then((result: any) => {
          const first = result?.geoObjects?.get?.(0);
          if (first) {
            const address = first.getAddressLine();
            setSelectedAddress(address);
            onLocationSelect(lat, lng, address);
          }
        })
        .catch(() => {});
    } catch (error) {
      console.error('Error getting address:', error);
    }
  };

  const geocodeAddress = async (query: string) => {
    if (!query.trim()) {
      toast({
        title: t('address.searchError') || "Search error",
        description: t('address.enterAddress') || "Please enter an address to search",
        variant: "destructive"
      });
      return;
    }

    if (!window.ymaps || !window.ymaps.geocode) {
      toast({
        title: t('address.mapNotReady') || "Map not ready",
        description: t('address.tryAgain') || "Please wait for the map to load",
        variant: "destructive"
      });
      return;
    }

    // Prevent concurrent searches
    if (searchingRef.current) return;

    searchingRef.current = true;
    setIsSearching(true);
    
    try {
      const result = await window.ymaps.geocode(query, {
        boundedBy: UZBEKISTAN_BOUNDS,
        strictBounds: true, // Only return results within Uzbekistan
        results: 1 // Optimize by getting only the best match
      });
      const first = result?.geoObjects?.get?.(0);
      if (first) {
        const coords = first.geometry.getCoordinates();
        const [lat, lng] = [coords[0], coords[1]];

        // Validate coordinates are within Uzbekistan
        if (!isWithinUzbekistan(lat, lng)) {
          toast({
            title: t('address.notFound') || 'Location not allowed',
            description: t('address.onlyUzbekistan') || 'Only locations within Uzbekistan are supported.',
            variant: 'destructive',
          });
          // Recenter to Tashkent for feedback
          try { map.current?.setCenter(TASHKENT_CENTER, 11, { duration: 300 }); } catch {}
          return;
        }

        const address = first.getAddressLine();
        addPlacemark(lat, lng);
        setSelectedAddress(address);
        onLocationSelect(lat, lng, address);
        map.current?.setCenter([lat, lng], 15, { duration: 300 });
      } else {
        toast({
          title: t('address.notFound') || "Location not found",
          description: t('address.tryDifferent') || "Try a different search term",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Error geocoding address:', error);
      toast({
        title: t('address.searchFailed') || "Search failed",
        description: t('address.checkConnection') || "Please check your connection and try again",
        variant: "destructive"
      });
    } finally {
      searchingRef.current = false;
      setIsSearching(false);
    }
  };

  const handleMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        
        // Validate current location is within Uzbekistan
        if (!isWithinUzbekistan(lat, lng)) {
          toast({
            title: t('address.outOfBounds') || 'Outside Uzbekistan',
            description: t('address.onlyUzbekistan') || 'Only locations within Uzbekistan are supported.',
            variant: 'destructive',
          });
          // Recenter to Tashkent
          try { map.current?.setCenter(TASHKENT_CENTER, 11, { duration: 300 }); } catch {}
          return;
        }
        
        addPlacemark(lat, lng);
        map.current?.setCenter([lat, lng], 15, { duration: 300 });
        getAddress(lat, lng);
      },
      (err) => {
        console.warn('Geolocation error:', err);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Suggest View for the search input
  useEffect(() => {
    if (!mapLoaded || !window.ymaps || !window.ymaps.SuggestView) return;

    try {
      suggestView.current = new window.ymaps.SuggestView(inputId, {
        results: 7,
        boundedBy: UZBEKISTAN_BOUNDS,
        strictBounds: true // Only suggest locations within Uzbekistan
      });
      suggestView.current.events.add('select', (e: any) => {
        const value = e.get('item')?.value;
        if (value) {
          // Ignore clicks if search is already in progress
          if (searchingRef.current) return;
          setSearchQuery(value);
          geocodeAddress(value);
        }
      });
    } catch (e) {
      console.warn('SuggestView init failed', e);
    }

    return () => {
      try { suggestView.current?.destroy?.(); } catch {}
      suggestView.current = null;
    };
  }, [mapLoaded, inputId]);

  const loadingState = !mapLoaded || status !== 'ready';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          {t('address.selectPropertyLocation')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative rounded-lg h-80 overflow-hidden border">
          {/* Search and controls overlay */}
          <div className="absolute z-10 top-3 left-3 right-3 md:right-auto md:w-[28rem] space-y-2">
            <div className="bg-background/90 supports-[backdrop-filter]:bg-background/60 backdrop-blur border rounded-md p-2 shadow-sm">
              <div className="flex items-center gap-2">
                <Input
                  id={inputId}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('address.searchPlaceholder')}
                  className="h-9"
                  aria-label={t('address.searchAria')}
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={() => geocodeAddress(searchQuery)}
                  disabled={!searchQuery.trim() || isSearching}
                  aria-label={t('address.searchAria')}
                >
                  <Search className={isSearching ? "w-4 h-4 animate-spin" : "w-4 h-4"} />
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleMyLocation}
                  aria-label={t('address.useMyLocation')}
                >
                  <LocateFixed className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {loadingState ? (
            <div className="absolute inset-0 bg-muted/20 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-8 w-8 text-primary mx-auto mb-2 animate-pulse" />
                <p className="text-muted-foreground text-sm">{t('address.loadingMap')}</p>
              </div>
            </div>
          ) : (
            <div ref={mapContainer} className="absolute inset-0" />
          )}
        </div>

        {selectedAddress && (
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">{t('address.selectedLocation')}</p>
                <p className="text-sm text-muted-foreground">{selectedAddress}</p>
              </div>
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          {t('address.instructions')}
        </p>
      </CardContent>
    </Card>
  );
};

export default LocationPicker;
