import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Check, Search, LocateFixed } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

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

const LocationPicker: React.FC<LocationPickerProps> = ({ 
  onLocationSelect, 
  selectedLat, 
  selectedLng,
  initialAddress
}) => {
  const { language, t } = useTranslation();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const placemark = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const suggestView = useRef<any>(null);

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

  // Initialize map
  useEffect(() => {
    if (!mapLoaded || !mapContainer.current || map.current) return;

    const center = selectedLat && selectedLng ? [selectedLat, selectedLng] : [41.2995, 69.2401];
    
    map.current = new window.ymaps.Map(mapContainer.current, {
      center,
      zoom: selectedLat && selectedLng ? 15 : 11,
      controls: ['zoomControl', 'typeSelector', 'geolocationControl']
    });

    // Add existing placemark if coordinates provided
    if (selectedLat && selectedLng) {
      addPlacemark(selectedLat, selectedLng);
    } else if (initialAddress) {
      try {
        const geocoder = window.ymaps.geocode(initialAddress);
        geocoder.then((result: any) => {
          const firstGeoObject = result.geoObjects.get(0);
          if (firstGeoObject) {
            const coords = firstGeoObject.geometry.getCoordinates();
            const address = firstGeoObject.getAddressLine();
            addPlacemark(coords[0], coords[1]);
            setSelectedAddress(address);
            onLocationSelect(coords[0], coords[1], address);
            map.current.setCenter(coords, 15, { duration: 300 });
          }
        });
      } catch (e) {
        console.warn('Failed to geocode initial address', e);
      }
    }

    // Add click listener
    map.current.events.add('click', (e: any) => {
      const coords = e.get('coords');
      addPlacemark(coords[0], coords[1]);
      getAddress(coords[0], coords[1]);
    });
  }, [mapLoaded, selectedLat, selectedLng, initialAddress, onLocationSelect]);

  const addPlacemark = (lat: number, lng: number) => {
    // Remove existing placemark
    if (placemark.current) {
      map.current.geoObjects.remove(placemark.current);
    }

    // Create custom pin image like main map
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
      ctx.fillStyle = 'hsl(24 95% 53%)'; // brand orange like main map
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

    // Add new placemark with custom Magit icon
    placemark.current = new window.ymaps.Placemark(
      [lat, lng],
      {
        balloonContent: 'Selected location'
      },
      {
        iconLayout: 'default#image',
        iconImageHref: composePinImage(),
        iconImageSize: [44, 60],
        iconImageOffset: [-22, -60]
      }
    );

    placemark.current.events.add('dragend', () => {
      const coords = placemark.current.geometry.getCoordinates();
      getAddress(coords[0], coords[1]);
      onLocationSelect(coords[0], coords[1]);
    });

    map.current.geoObjects.add(placemark.current);
    onLocationSelect(lat, lng);
  };

  const getAddress = async (lat: number, lng: number) => {
    try {
      const geocoder = window.ymaps.geocode([lat, lng]);
      geocoder.then((result: any) => {
        const firstGeoObject = result.geoObjects.get(0);
        if (firstGeoObject) {
          const address = firstGeoObject.getAddressLine();
          setSelectedAddress(address);
          onLocationSelect(lat, lng, address);
        }
      });
    } catch (error) {
      console.error('Error getting address:', error);
    }
  };

  const geocodeAddress = async (query: string) => {
    if (!query) return;
    try {
      const geocoder = window.ymaps.geocode(query);
      geocoder.then((result: any) => {
        const firstGeoObject = result.geoObjects.get(0);
        if (firstGeoObject) {
          const coords = firstGeoObject.geometry.getCoordinates();
          const address = firstGeoObject.getAddressLine();
          addPlacemark(coords[0], coords[1]);
          setSelectedAddress(address);
          onLocationSelect(coords[0], coords[1], address);
          if (map.current) {
            map.current.setCenter(coords, 15, { duration: 300 });
          }
        }
      });
    } catch (error) {
      console.error('Error geocoding address:', error);
    }
  };

  const handleMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        addPlacemark(latitude, longitude);
        if (map.current) {
          map.current.setCenter([latitude, longitude], 15, { duration: 300 });
        }
        getAddress(latitude, longitude);
      },
      (err) => {
        console.warn('Geolocation error:', err);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Yandex Suggest for address search
  useEffect(() => {
    if (!mapLoaded || !window.ymaps || !window.ymaps.SuggestView) return;
    // Initialize SuggestView on the search input
    try {
      suggestView.current = new window.ymaps.SuggestView('address-search-input', { results: 7 });
      suggestView.current.events.add('select', (e: any) => {
        const value = e.get('item').value;
        setSearchQuery(value);
        geocodeAddress(value);
      });
    } catch (e) {
      console.warn('SuggestView init failed', e);
    }

    return () => {
      try {
        if (suggestView.current && suggestView.current.destroy) {
          suggestView.current.destroy();
        }
      } catch {}
    };
  }, [mapLoaded]);

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
                  id="address-search-input"
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
                  disabled={!searchQuery.trim()}
                  aria-label={t('address.searchAria')}
                >
                  <Search className="w-4 h-4" />
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

          {!mapLoaded ? (
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
